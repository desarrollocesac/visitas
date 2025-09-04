import pool from '../config/database';
import { PoolClient } from 'pg';

export interface DocumentType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDocumentTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDocumentTypeData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export class DocumentTypeModel {
  static async getAll(): Promise<DocumentType[]> {
    const result = await pool.query(
      'SELECT * FROM document_types ORDER BY name ASC'
    );
    return result.rows;
  }

  static async getById(id: string): Promise<DocumentType | null> {
    const result = await pool.query(
      'SELECT * FROM document_types WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateDocumentTypeData): Promise<DocumentType> {
    const result = await pool.query(
      `INSERT INTO document_types (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.description || null, data.is_active ?? true]
    );
    return result.rows[0];
  }

  static async update(id: string, data: UpdateDocumentTypeData): Promise<DocumentType | null> {
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

    if (data.is_active !== undefined) {
      setClause.push(`is_active = $${paramIndex}`);
      values.push(data.is_active);
      paramIndex++;
    }

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE document_types SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM document_types WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}