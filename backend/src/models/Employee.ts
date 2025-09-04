import pool from '../config/database';
import { PoolClient } from 'pg';

export interface Employee {
  id: string;
  code: string;
  document_type_id: string;
  document_number: string;
  first_name: string;
  last_name1: string;
  last_name2: string | null;
  nick_name: string | null;
  position_id: string | null;
  department_id: string | null;
  picture: string | null;
  is_active: boolean;
  created_at: Date;
  created_by: string | null;
  updated_at: Date;
  updated_by: string | null;
  // Joined fields
  document_type_name?: string;
  position_name?: string;
  department_name?: string;
}

export interface CreateEmployeeData {
  code: string;
  document_type_id: string;
  document_number: string;
  first_name: string;
  last_name1: string;
  last_name2?: string;
  nick_name?: string;
  position_id?: string;
  department_id?: string;
  picture?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface UpdateEmployeeData {
  code?: string;
  document_type_id?: string;
  document_number?: string;
  first_name?: string;
  last_name1?: string;
  last_name2?: string;
  nick_name?: string;
  position_id?: string;
  department_id?: string;
  picture?: string;
  is_active?: boolean;
  updated_by?: string;
}

export class EmployeeModel {
  static async getAll(): Promise<Employee[]> {
    const result = await pool.query(`
      SELECT 
        e.*,
        dt.name as document_type_name,
        p.name as position_name,
        d.name as department_name
      FROM employees e
      LEFT JOIN document_types dt ON e.document_type_id = dt.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.code ASC
    `);
    return result.rows;
  }

  static async getById(id: string): Promise<Employee | null> {
    const result = await pool.query(`
      SELECT 
        e.*,
        dt.name as document_type_name,
        p.name as position_name,
        d.name as department_name
      FROM employees e
      LEFT JOIN document_types dt ON e.document_type_id = dt.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(data: CreateEmployeeData): Promise<Employee> {
    const result = await pool.query(`
      INSERT INTO employees (
        code, document_type_id, document_number, first_name, last_name1, 
        last_name2, nick_name, position_id, department_id, picture, 
        is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.code,
      data.document_type_id,
      data.document_number,
      data.first_name,
      data.last_name1,
      data.last_name2 || null,
      data.nick_name || null,
      data.position_id || null,
      data.department_id || null,
      data.picture || null,
      data.is_active ?? true,
      data.created_by || null
    ]);
    
    return await this.getById(result.rows[0].id) || result.rows[0];
  }

  static async update(id: string, data: UpdateEmployeeData): Promise<Employee | null> {
    const setClause = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.code !== undefined) {
      setClause.push(`code = $${paramIndex}`);
      values.push(data.code);
      paramIndex++;
    }

    if (data.document_type_id !== undefined) {
      setClause.push(`document_type_id = $${paramIndex}`);
      values.push(data.document_type_id);
      paramIndex++;
    }

    if (data.document_number !== undefined) {
      setClause.push(`document_number = $${paramIndex}`);
      values.push(data.document_number);
      paramIndex++;
    }

    if (data.first_name !== undefined) {
      setClause.push(`first_name = $${paramIndex}`);
      values.push(data.first_name);
      paramIndex++;
    }

    if (data.last_name1 !== undefined) {
      setClause.push(`last_name1 = $${paramIndex}`);
      values.push(data.last_name1);
      paramIndex++;
    }

    if (data.last_name2 !== undefined) {
      setClause.push(`last_name2 = $${paramIndex}`);
      values.push(data.last_name2);
      paramIndex++;
    }

    if (data.nick_name !== undefined) {
      setClause.push(`nick_name = $${paramIndex}`);
      values.push(data.nick_name);
      paramIndex++;
    }

    if (data.position_id !== undefined) {
      setClause.push(`position_id = $${paramIndex}`);
      values.push(data.position_id);
      paramIndex++;
    }

    if (data.department_id !== undefined) {
      setClause.push(`department_id = $${paramIndex}`);
      values.push(data.department_id);
      paramIndex++;
    }

    if (data.picture !== undefined) {
      setClause.push(`picture = $${paramIndex}`);
      values.push(data.picture);
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
      UPDATE employees 
      SET ${setClause.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `, values);

    if (result.rows[0]) {
      return await this.getById(result.rows[0].id);
    }
    return null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}