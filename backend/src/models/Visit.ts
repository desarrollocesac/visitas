import pool from '../config/database';
import { Visit } from '../types';

export class VisitModel {
  static async create(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt' | 'checkInTime'>): Promise<Visit> {
    const query = `
      INSERT INTO visits (visitor_id, host_name, department, purpose, access_areas, status, sticker_printed)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
                check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
                access_areas as "accessAreas", sticker_printed as "stickerPrinted",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      visit.visitorId,
      visit.hostName,
      visit.department,
      visit.purpose,
      visit.accessAreas,
      visit.status || 'active',
      visit.stickerPrinted || false
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Visit | null> {
    const query = `
      SELECT id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
             check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
             access_areas as "accessAreas", sticker_printed as "stickerPrinted",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visits 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByVisitorId(visitorId: string): Promise<Visit[]> {
    const query = `
      SELECT id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
             check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
             access_areas as "accessAreas", sticker_printed as "stickerPrinted",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visits 
      WHERE visitor_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [visitorId]);
    return result.rows;
  }

  static async findActiveVisits(): Promise<Visit[]> {
    const query = `
      SELECT id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
             check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
             access_areas as "accessAreas", sticker_printed as "stickerPrinted",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM visits 
      WHERE status = 'active'
      ORDER BY check_in_time DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findWithVisitorInfo(visitId?: string): Promise<any[]> {
    let query = `
      SELECT v.id, v.visitor_id as "visitorId", v.host_name as "hostName", 
             v.department, v.purpose, v.check_in_time as "checkInTime", 
             v.check_out_time as "checkOutTime", v.status, v.access_areas as "accessAreas",
             v.sticker_printed as "stickerPrinted", v.created_at as "createdAt",
             vis.first_name as "visitorFirstName", vis.last_name as "visitorLastName",
             vis.company as "visitorCompany", vis.id_number as "visitorIdNumber",
             vis.photo_path as "visitorPhotoPath"
      FROM visits v
      JOIN visitors vis ON v.visitor_id = vis.id
    `;
    
    const values: any[] = [];
    if (visitId) {
      query += ' WHERE v.id = $1';
      values.push(visitId);
    }
    
    query += ' ORDER BY v.check_in_time DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async checkOut(id: string): Promise<Visit | null> {
    const query = `
      UPDATE visits 
      SET status = 'completed', check_out_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'active'
      RETURNING id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
                check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
                access_areas as "accessAreas", sticker_printed as "stickerPrinted",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateStickerStatus(id: string, printed: boolean): Promise<Visit | null> {
    const query = `
      UPDATE visits 
      SET sticker_printed = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, visitor_id as "visitorId", host_name as "hostName", department, purpose,
                check_in_time as "checkInTime", check_out_time as "checkOutTime", status,
                access_areas as "accessAreas", sticker_printed as "stickerPrinted",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [id, printed]);
    return result.rows[0] || null;
  }

  static async getVisitDuration(id: string): Promise<number | null> {
    const query = `
      SELECT EXTRACT(EPOCH FROM (COALESCE(check_out_time, CURRENT_TIMESTAMP) - check_in_time)) as duration_seconds
      FROM visits 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0]?.duration_seconds || null;
  }
}