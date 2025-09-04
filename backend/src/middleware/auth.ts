import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
    permissions: string[];
  };
}

// Mock users and permissions for demo system
const DEMO_ROLES_PERMISSIONS = {
  'admin': [
    'visitor.register',
    'visitor.view',
    'visitor.edit',
    'visitor.delete',
    'reports.view',
    'reports.export',
    'settings.manage',
    'users.manage',
    'system.monitor',
    'maintenance.manage'
  ],
  'manager': [
    'visitor.register',
    'visitor.view',
    'visitor.edit',
    'reports.view',
    'reports.export',
    'system.monitor'
  ],
  'analyst': [
    'visitor.view',
    'reports.view',
    'reports.export'
  ]
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      // Try to decode as JWT first (for production tokens)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Verify user exists and is active (production path)
      const userResult = await pool.query(
        'SELECT id, username, role, permissions, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return res.status(401).json({ error: 'Invalid token or user not active' });
      }

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        permissions: userResult.rows[0].permissions
      };

      next();
    } catch (jwtError) {
      // If JWT verification fails, try to decode as demo token
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if token has expired
        if (decoded.exp && decoded.exp < Date.now()) {
          return res.status(401).json({ error: 'Token expired' });
        }
        
        // Get permissions for the role
        const permissions = DEMO_ROLES_PERMISSIONS[decoded.role as keyof typeof DEMO_ROLES_PERMISSIONS] || [];
        
        req.user = {
          userId: decoded.userId.toString(),
          username: decoded.username,
          role: decoded.role,
          permissions: permissions
        };

        next();
      } catch (decodeError) {
        console.error('Auth middleware error:', decodeError);
        return res.status(403).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { permissions, role } = req.user;

    // Admin has all permissions (both ADMIN and admin for compatibility)
    if (role === 'ADMIN' || role === 'admin') {
      return next();
    }

    // Check if user has the required permission
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role permissions' });
    }

    next();
  };
};