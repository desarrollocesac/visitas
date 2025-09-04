import pool from '../config/database';
import { PoolClient } from 'pg';

export interface AuthorizedArea {
  id: string;
  name: string;
  description: string | null;
  security_level: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  requires_escort: boolean;
  max_occupancy: number | null;
  location: string | null;
  is_active: boolean;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
}

export interface CreateAuthorizedAreaData {
  name: string;
  description?: string;
  security_level: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  requires_escort?: boolean;
  max_occupancy?: number;
  location?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateAuthorizedAreaData {
  name?: string;
  description?: string;
  security_level?: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  requires_escort?: boolean;
  max_occupancy?: number;
  location?: string;
  is_active?: boolean;
  updated_by?: string;
}

export class AuthorizedAreaModel {
  static async getAll(): Promise<AuthorizedArea[]> {
    const result = await pool.query(
      'SELECT * FROM authorized_areas ORDER BY name ASC'
    );
    return result.rows;
  }

  static async getById(id: string): Promise<AuthorizedArea | null> {
    const result = await pool.query(
      'SELECT * FROM authorized_areas WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateAuthorizedAreaData): Promise<AuthorizedArea> {
    const result = await pool.query(`
      INSERT INTO authorized_areas (
        name, description, security_level, requires_escort, 
        max_occupancy, location, is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.name,
      data.description || null,
      data.security_level,
      data.requires_escort || false,
      data.max_occupancy || null,
      data.location || null,
      data.is_active ?? true,
      data.created_by || null
    ]);
    return result.rows[0];
  }

  static async update(id: string, data: UpdateAuthorizedAreaData): Promise<AuthorizedArea | null> {
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

    if (data.security_level !== undefined) {
      setClause.push(`security_level = $${paramIndex}`);
      values.push(data.security_level);
      paramIndex++;
    }

    if (data.requires_escort !== undefined) {
      setClause.push(`requires_escort = $${paramIndex}`);
      values.push(data.requires_escort);
      paramIndex++;
    }

    if (data.max_occupancy !== undefined) {
      setClause.push(`max_occupancy = $${paramIndex}`);
      values.push(data.max_occupancy);
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
      UPDATE authorized_areas 
      SET ${setClause.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM authorized_areas WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}