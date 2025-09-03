import pool from '../config/database';
import { Visitor } from '../types';

export class VisitorModel {
  static async create(visitor: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visitor> {
    const query = `
      INSERT INTO visitors (id_number, first_name, last_name, email, phone, company, photo_path, id_photo_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, id_number as "idNumber", first_name as "firstName", last_name as "lastName", 
                email, phone, company, photo_path as "photoPath", id_photo_path as "idPhotoPath",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      visitor.idNumber,
      visitor.firstName,
      visitor.lastName,
      visitor.email,
      visitor.phone,
      visitor.company,
      visitor.photoPath,
      visitor.idPhotoPath
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByIdNumber(idNumber: string): Promise<Visitor | null> {
    const query = `
      SELECT id, id_number as "idNumber", first_name as "firstName", last_name as "lastName",
             email, phone, company, photo_path as "photoPath", id_photo_path as "idPhotoPath",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visitors 
      WHERE id_number = $1
    `;
    
    const result = await pool.query(query, [idNumber]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Visitor | null> {
    const query = `
      SELECT id, id_number as "idNumber", first_name as "firstName", last_name as "lastName",
             email, phone, company, photo_path as "photoPath", id_photo_path as "idPhotoPath",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visitors 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<Visitor[]> {
    const query = `
      SELECT id, id_number as "idNumber", first_name as "firstName", last_name as "lastName",
             email, phone, company, photo_path as "photoPath", id_photo_path as "idPhotoPath",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visitors 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id: string, updates: Partial<Visitor>): Promise<Visitor | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.firstName) {
      setClause.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName) {
      setClause.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }
    if (updates.email) {
      setClause.push(`email = $${paramIndex++}`);
      values.push(updates.email);
    }
    if (updates.phone) {
      setClause.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.company) {
      setClause.push(`company = $${paramIndex++}`);
      values.push(updates.company);
    }

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE visitors 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, id_number as "idNumber", first_name as "firstName", last_name as "lastName",
                email, phone, company, photo_path as "photoPath", id_photo_path as "idPhotoPath",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}