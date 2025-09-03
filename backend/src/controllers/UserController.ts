import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { CreateUserData, UpdateUserData, LoginData, User, UserRole, defaultPermissions } from '../models/User';

export class UserController {
  // Login user
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { username, password }: LoginData = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Get user from database
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user: User = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role,
          permissions: user.permissions 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Store session
      await pool.query(
        `INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          await bcrypt.hash(token, 10),
          new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          req.ip,
          req.get('User-Agent')
        ]
      );

      // Return user data without password
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.userId;
      
      const result = await pool.query(
        'SELECT id, username, email, first_name, last_name, role, permissions, is_active, last_login, avatar_url, phone, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all users (Admin/Manager only)
  static async getAllUsers(req: Request, res: Response): Promise<any> {
    try {
      const { page = 1, limit = 10, search = '', role } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereCondition = 'WHERE 1=1';
      let queryParams: any[] = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereCondition += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR username ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
      }

      if (role) {
        paramCount++;
        whereCondition += ` AND role = $${paramCount}`;
        queryParams.push(role);
      }

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM users ${whereCondition}`,
        queryParams
      );
      const totalUsers = parseInt(countResult.rows[0].count);

      // Get users
      const result = await pool.query(
        `SELECT id, username, email, first_name, last_name, role, permissions, is_active, last_login, avatar_url, phone, created_at, updated_at 
         FROM users ${whereCondition}
         ORDER BY created_at DESC
         LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
        [...queryParams, limit, offset]
      );

      res.json({
        users: result.rows,
        totalUsers,
        totalPages: Math.ceil(totalUsers / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new user (Admin only)
  static async createUser(req: Request, res: Response): Promise<any> {
    try {
      const userData: CreateUserData = req.body;

      // Validate required fields
      if (!userData.username || !userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.role) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      // Check if username or email already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [userData.username, userData.email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Get default permissions for role
      const permissions = defaultPermissions[userData.role as UserRole];

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, permissions, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, username, email, first_name, last_name, role, permissions, is_active, created_at`,
        [userData.username, userData.email, hashedPassword, userData.first_name, userData.last_name, userData.role, permissions, userData.phone]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update user (Admin only, or users can update their own profile)
  static async updateUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserData = req.body;
      const currentUserId = (req as any).user?.userId;
      const currentUserRole = (req as any).user?.role;

      // Check if user can update this profile
      if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      if (updateData.username) {
        paramCount++;
        updateFields.push(`username = $${paramCount}`);
        values.push(updateData.username);
      }

      if (updateData.email) {
        paramCount++;
        updateFields.push(`email = $${paramCount}`);
        values.push(updateData.email);
      }

      if (updateData.first_name) {
        paramCount++;
        updateFields.push(`first_name = $${paramCount}`);
        values.push(updateData.first_name);
      }

      if (updateData.last_name) {
        paramCount++;
        updateFields.push(`last_name = $${paramCount}`);
        values.push(updateData.last_name);
      }

      if (updateData.phone) {
        paramCount++;
        updateFields.push(`phone = $${paramCount}`);
        values.push(updateData.phone);
      }

      // Only admins can update role and is_active
      if (currentUserRole === 'ADMIN') {
        if (updateData.role) {
          paramCount++;
          updateFields.push(`role = $${paramCount}`);
          values.push(updateData.role);
          
          // Update permissions based on new role
          paramCount++;
          updateFields.push(`permissions = $${paramCount}`);
          values.push(defaultPermissions[updateData.role as UserRole]);
        }

        if (updateData.is_active !== undefined) {
          paramCount++;
          updateFields.push(`is_active = $${paramCount}`);
          values.push(updateData.is_active);
        }
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      paramCount++;
      values.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, username, email, first_name, last_name, role, permissions, is_active, last_login, avatar_url, phone, created_at, updated_at
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User updated successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).user?.userId;

      // Prevent self-deletion
      if (currentUserId === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const result = await pool.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Logout user
  static async logout(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.userId;
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (token) {
        // Invalidate session
        const tokenHash = await bcrypt.hash(token, 10);
        await pool.query(
          'UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND token_hash = $2',
          [userId, tokenHash]
        );
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}