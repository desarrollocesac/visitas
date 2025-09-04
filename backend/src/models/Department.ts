import pool from '../config/database';
import { PoolClient } from 'pg';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  access_level: number;
  manager: string | null;
  location: string | null;
  is_active: boolean;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  access_level?: number;
  manager?: string;
  location?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  access_level?: number;
  manager?: string;
  location?: string;
  is_active?: boolean;
  updated_by?: string;
}

export class DepartmentModel {
  static async getAll(): Promise<Department[]> {
    const result = await pool.query(
      'SELECT * FROM departments ORDER BY name ASC'
    );
    return result.rows;
  }

  static async getById(id: string): Promise<Department | null> {
    const result = await pool.query(
      'SELECT * FROM departments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateDepartmentData): Promise<Department> {
    const result = await pool.query(`
      INSERT INTO departments (
        name, description, access_level, manager, location, 
        is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      data.name,
      data.description || null,
      data.access_level || 1,
      data.manager || null,
      data.location || null,
      data.is_active ?? true,
      data.created_by || null
    ]);
    return result.rows[0];
  }

  static async update(id: string, data: UpdateDepartmentData): Promise<Department | null> {
    const setClause = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      setClause.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      setClause.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }

    if (data.access_level !== undefined) {
      setClause.push(`access_level = $${paramIndex}`);
      values.push(data.access_level);
      paramIndex++;
    }

    if (data.manager !== undefined) {
      setClause.push(`manager = $${paramIndex}`);
      values.push(data.manager);
      paramIndex++;
    }

    if (data.location !== undefined) {
      setClause.push(`location = $${paramIndex}`);
      values.push(data.location);
      paramIndex++;
    }

    if (data.is_active !== undefined) {
      setClause.push(`is_active = $${paramIndex}`);
      values.push(data.is_active);
      paramIndex++;
    }

    if (data.updated_by !== undefined) {
      setClause.push(`updated_by = $${paramIndex}`);
      values.push(data.updated_by);
      paramIndex++;
    }

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(`
      UPDATE departments 
      SET ${setClause.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM departments WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}