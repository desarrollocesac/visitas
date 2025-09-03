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

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Verify user exists and is active
    const userResult = await pool.query(
      'SELECT id, username, role, permissions, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'Invalid token or user not active' });
    }

    // Check if session is active
    const sessionResult = await pool.query(
      'SELECT id FROM user_sessions WHERE user_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP',
      [decoded.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      permissions: userResult.rows[0].permissions
    };

    next();
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

    // Admin has all permissions
    if (role === 'ADMIN') {
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