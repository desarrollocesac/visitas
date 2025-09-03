import { Request, Response } from 'express';
import pool from '../config/database';
import { APIResponse } from '../types';

export class ReportController {
  // Reporte diario de visitas
  static async getDailyReport(req: Request, res: Response) {
    try {
      const { date } = req.query;
      const reportDate = date ? new Date(date as string) : new Date();
      
      // Set to start and end of day
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const query = `
        SELECT 
          v.id,
          vis.first_name || ' ' || vis.last_name as visitor_name,
          vis.company,
          v.host_name,
          v.department,
          v.purpose,
          v.check_in_time,
          v.check_out_time,
          v.status,
          v.sticker_printed,
          CASE 
            WHEN v.check_out_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (v.check_out_time - v.check_in_time))
            ELSE EXTRACT(EPOCH FROM (NOW() - v.check_in_time))
          END as duration_seconds
        FROM visits v
        JOIN visitors vis ON v.visitor_id = vis.id
        WHERE v.check_in_time >= $1 AND v.check_in_time <= $2
        ORDER BY v.check_in_time DESC
      `;

      const result = await pool.query(query, [startOfDay, endOfDay]);

      // Calculate statistics
      const totalVisits = result.rows.length;
      const activeVisits = result.rows.filter(row => row.status === 'active').length;
      const completedVisits = result.rows.filter(row => row.status === 'completed').length;
      const averageDuration = result.rows.length > 0 
        ? result.rows.reduce((sum, row) => sum + (row.duration_seconds || 0), 0) / result.rows.length
        : 0;

      // Department breakdown
      const departmentStats = result.rows.reduce((acc, row) => {
        acc[row.department] = (acc[row.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return res.json({
        success: true,
        data: {
          date: reportDate.toISOString().split('T')[0],
          statistics: {
            totalVisits,
            activeVisits,
            completedVisits,
            averageDurationMinutes: Math.round(averageDuration / 60)
          },
          departmentBreakdown: departmentStats,
          visits: result.rows
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error generating daily report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate daily report'
      } as APIResponse);
    }
  }

  // Reporte semanal de visitas
  static async getWeeklyReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else {
        // Default to current week
        const now = new Date();
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      }

      const query = `
        SELECT 
          DATE(v.check_in_time) as visit_date,
          COUNT(*) as total_visits,
          COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_visits,
          COUNT(CASE WHEN v.status = 'completed' THEN 1 END) as completed_visits,
          AVG(
            CASE 
              WHEN v.check_out_time IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (v.check_out_time - v.check_in_time))
              ELSE EXTRACT(EPOCH FROM (NOW() - v.check_in_time))
            END
          ) as avg_duration_seconds
        FROM visits v
        WHERE v.check_in_time >= $1 AND v.check_in_time <= $2
        GROUP BY DATE(v.check_in_time)
        ORDER BY visit_date
      `;

      const result = await pool.query(query, [start, end]);

      // Get top departments and companies
      const topDepartmentsQuery = `
        SELECT v.department, COUNT(*) as visit_count
        FROM visits v
        WHERE v.check_in_time >= $1 AND v.check_in_time <= $2
        GROUP BY v.department
        ORDER BY visit_count DESC
        LIMIT 10
      `;

      const topCompaniesQuery = `
        SELECT vis.company, COUNT(*) as visit_count
        FROM visits v
        JOIN visitors vis ON v.visitor_id = vis.id
        WHERE v.check_in_time >= $1 AND v.check_in_time <= $2 AND vis.company IS NOT NULL
        GROUP BY vis.company
        ORDER BY visit_count DESC
        LIMIT 10
      `;

      const [topDepartments, topCompanies] = await Promise.all([
        pool.query(topDepartmentsQuery, [start, end]),
        pool.query(topCompaniesQuery, [start, end])
      ]);

      return res.json({
        success: true,
        data: {
          period: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
          },
          dailyStats: result.rows.map(row => ({
            date: row.visit_date,
            totalVisits: parseInt(row.total_visits),
            activeVisits: parseInt(row.active_visits),
            completedVisits: parseInt(row.completed_visits),
            averageDurationMinutes: Math.round(row.avg_duration_seconds / 60)
          })),
          topDepartments: topDepartments.rows,
          topCompanies: topCompanies.rows
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error generating weekly report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate weekly report'
      } as APIResponse);
    }
  }

  // Reporte de logs de acceso
  static async getAccessReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, department } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND al.access_time >= $${paramIndex}`;
        queryParams.push(new Date(startDate as string));
        paramIndex++;
      }

      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause += ` AND al.access_time <= $${paramIndex}`;
        queryParams.push(end);
        paramIndex++;
      }

      if (department) {
        whereClause += ` AND al.department = $${paramIndex}`;
        queryParams.push(department);
        paramIndex++;
      }

      const query = `
        SELECT 
          al.id,
          al.visit_id,
          al.department,
          al.access_time,
          al.access_granted,
          al.reason,
          vis.first_name || ' ' || vis.last_name as visitor_name,
          vis.company,
          v.host_name,
          v.purpose
        FROM access_logs al
        JOIN visits v ON al.visit_id = v.id
        JOIN visitors vis ON v.visitor_id = vis.id
        ${whereClause}
        ORDER BY al.access_time DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const [logsResult, statsResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(`
          SELECT 
            COUNT(*) as total_attempts,
            COUNT(CASE WHEN access_granted THEN 1 END) as granted_attempts,
            COUNT(CASE WHEN NOT access_granted THEN 1 END) as denied_attempts
          FROM access_logs al
          JOIN visits v ON al.visit_id = v.id
          JOIN visitors vis ON v.visitor_id = vis.id
          ${whereClause}
        `, queryParams.slice(0, -2)) // Remove limit and offset params
      ]);

      const stats = statsResult.rows[0];

      return res.json({
        success: true,
        data: {
          statistics: {
            totalAttempts: parseInt(stats.total_attempts),
            grantedAttempts: parseInt(stats.granted_attempts),
            deniedAttempts: parseInt(stats.denied_attempts),
            successRate: stats.total_attempts > 0 
              ? Math.round((stats.granted_attempts / stats.total_attempts) * 100)
              : 0
          },
          logs: logsResult.rows,
          pagination: {
            page,
            limit,
            hasMore: logsResult.rows.length === limit
          }
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error generating access report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate access report'
      } as APIResponse);
    }
  }

  // Reporte de visitantes frecuentes
  static async getFrequentVisitorsReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND v.check_in_time >= $${paramIndex}`;
        queryParams.push(new Date(startDate as string));
        paramIndex++;
      }

      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause += ` AND v.check_in_time <= $${paramIndex}`;
        queryParams.push(end);
        paramIndex++;
      }

      const query = `
        SELECT 
          vis.id,
          vis.first_name || ' ' || vis.last_name as visitor_name,
          vis.company,
          vis.email,
          vis.phone,
          COUNT(v.id) as visit_count,
          MAX(v.check_in_time) as last_visit,
          MIN(v.check_in_time) as first_visit,
          ARRAY_AGG(DISTINCT v.department) as departments_visited
        FROM visitors vis
        JOIN visits v ON vis.id = v.visitor_id
        ${whereClause}
        GROUP BY vis.id, vis.first_name, vis.last_name, vis.company, vis.email, vis.phone
        HAVING COUNT(v.id) > 1
        ORDER BY visit_count DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);

      const result = await pool.query(query, queryParams);

      return res.json({
        success: true,
        data: {
          frequentVisitors: result.rows.map(row => ({
            ...row,
            visitCount: parseInt(row.visit_count),
            lastVisit: row.last_visit,
            firstVisit: row.first_visit,
            departmentsVisited: row.departments_visited
          }))
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error generating frequent visitors report:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate frequent visitors report'
      } as APIResponse);
    }
  }
}