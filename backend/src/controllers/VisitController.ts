import { Request, Response } from 'express';
import { VisitModel } from '../models/Visit';
import { VisitorModel } from '../models/Visitor';
import pool from '../config/database';
import { APIResponse, AccessLog } from '../types';
import { StickerService } from '../services/StickerService';

export class VisitController {
  static async getVisit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visitData = await VisitModel.findWithVisitorInfo(id);
      
      if (!visitData || visitData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Visit not found'
        } as APIResponse);
      }

      const visit = visitData[0];
      const duration = await VisitModel.getVisitDuration(id);

      return res.json({
        success: true,
        data: {
          ...visit,
          durationSeconds: duration
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error getting visit:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get visit'
      } as APIResponse);
    }
  }

  static async getAllVisits(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      let visits;
      if (status === 'active') {
        visits = await VisitModel.findActiveVisits();
      } else {
        visits = await VisitModel.findWithVisitorInfo();
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedVisits = visits.slice(startIndex, endIndex);

      return res.json({
        success: true,
        data: {
          visits: paginatedVisits,
          pagination: {
            page,
            limit,
            total: visits.length,
            hasMore: endIndex < visits.length
          }
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error getting visits:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get visits'
      } as APIResponse);
    }
  }

  static async checkOut(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visit = await VisitModel.checkOut(id);

      if (!visit) {
        return res.status(404).json({
          success: false,
          error: 'Visit not found or already checked out'
        } as APIResponse);
      }

      return res.json({
        success: true,
        data: visit,
        message: 'Visit checked out successfully'
      } as APIResponse);

    } catch (error) {
      console.error('Error checking out visit:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check out visit'
      } as APIResponse);
    }
  }

  static async checkAccess(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const { department } = req.body;

      if (!department) {
        return res.status(400).json({
          success: false,
          error: 'Department is required'
        } as APIResponse);
      }

      // Get visit information
      const visitData = await VisitModel.findWithVisitorInfo(visitId);
      
      if (!visitData || visitData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Visit not found'
        } as APIResponse);
      }

      const visit = visitData[0];

      // Check if visit is active
      if (visit.status !== 'active') {
        await this.logAccess(visitId, department, false, 'Visit is not active');
        return res.json({
          success: true,
          data: {
            accessGranted: false,
            reason: 'Visit is not active',
            visit
          }
        } as APIResponse);
      }

      // Check if department is in allowed access areas
      const hasAccess = visit.accessAreas.includes(department) || 
                       visit.department === department ||
                       department === 'Reception'; // Reception always allowed

      const reason = hasAccess ? 'Access granted' : 'Department not in allowed areas';

      // Log the access attempt
      await this.logAccess(visitId, department, hasAccess, reason);

      const duration = await VisitModel.getVisitDuration(visitId);

      return res.json({
        success: true,
        data: {
          accessGranted: hasAccess,
          reason,
          visit: {
            ...visit,
            durationSeconds: duration,
            durationFormatted: this.formatDuration(duration || 0)
          }
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error checking access:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check access'
      } as APIResponse);
    }
  }

  static async getAccessLogs(req: Request, res: Response) {
    try {
      const { visitId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const query = `
        SELECT id, visit_id as "visitId", department, access_time as "accessTime",
               access_granted as "accessGranted", reason, created_at as "createdAt"
        FROM access_logs 
        WHERE visit_id = $1
        ORDER BY access_time DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [visitId, limit, offset]);

      return res.json({
        success: true,
        data: {
          logs: result.rows,
          pagination: {
            page,
            limit,
            hasMore: result.rows.length === limit
          }
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error getting access logs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get access logs'
      } as APIResponse);
    }
  }

  static async printSticker(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { format } = req.query; // 'image' or 'data' (default)
      
      // Get full visit information for sticker
      const visitData = await VisitModel.findWithVisitorInfo(id);
      
      if (!visitData || visitData.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Visit not found'
        } as APIResponse);
      }

      const fullVisit = visitData[0];

      // Prepare sticker data
      const stickerData = StickerService.prepareStickerData(fullVisit);

      if (format === 'image') {
        // Generate actual sticker image
        const stickerImage = await StickerService.createStickerImage(stickerData);
        
        res.set({
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="visitor-sticker-${id}.png"`
        });
        return res.send(stickerImage);
      } else {
        // Return print data for external printer
        const printData = StickerService.generatePrintData(stickerData);
        
        // Mark sticker as printed
        await VisitModel.updateStickerStatus(id, true);

        return res.json({
          success: true,
          data: {
            visit: fullVisit,
            sticker: printData
          },
          message: 'Sticker data generated successfully'
        } as APIResponse);
      }

    } catch (error) {
      console.error('Error generating sticker:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate sticker'
      } as APIResponse);
    }
  }

  private static async logAccess(visitId: string, department: string, granted: boolean, reason: string): Promise<void> {
    try {
      const query = `
        INSERT INTO access_logs (visit_id, department, access_granted, reason)
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(query, [visitId, department, granted, reason]);
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  private static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }
}