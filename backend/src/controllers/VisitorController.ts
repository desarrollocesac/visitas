import { Request, Response } from 'express';
import { VisitorModel } from '../models/Visitor';
import { VisitModel } from '../models/Visit';
import { FileService } from '../services/FileService';
import { APIResponse, VisitRequest } from '../types';

export class VisitorController {
  static async registerVisit(req: Request, res: Response) {
    try {
      console.log('=== REGISTER VISIT DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
      
      const visitData: VisitRequest = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Parse accessAreas if it's a string
      if (typeof visitData.accessAreas === 'string') {
        try {
          visitData.accessAreas = JSON.parse(visitData.accessAreas as string);
        } catch (e) {
          console.log('Failed to parse accessAreas, treating as array');
        }
      }

      console.log('Parsed visitData:', visitData);

      if (!files?.photo || !files?.idPhoto) {
        console.log('Missing files - photo:', !!files?.photo, 'idPhoto:', !!files?.idPhoto);
        return res.status(400).json({
          success: false,
          error: 'Both photo and ID photo are required'
        } as APIResponse);
      }

      console.log('Photo buffer size:', files.photo[0].buffer.length);
      console.log('ID Photo buffer size:', files.idPhoto[0].buffer.length);

      // Save images
      console.log('Saving photo...');
      const photoPath = await FileService.saveImage(files.photo[0].buffer, 'photo');
      console.log('Photo saved to:', photoPath);
      
      console.log('Saving ID photo...');
      const idPhotoPath = await FileService.saveImage(files.idPhoto[0].buffer, 'id');
      console.log('ID Photo saved to:', idPhotoPath);

      // Extract ID information (mock implementation)
      const idInfo = await FileService.extractIdInfo(files.idPhoto[0].buffer);

      // Check if visitor already exists
      let visitor = await VisitorModel.findByIdNumber(visitData.idNumber);

      if (!visitor) {
        console.log('Creating new visitor...');
        // Create new visitor
        visitor = await VisitorModel.create({
          idNumber: visitData.idNumber,
          firstName: visitData.firstName,
          lastName: visitData.lastName,
          email: visitData.email,
          phone: visitData.phone,
          company: visitData.company,
          photoPath,
          idPhotoPath
        });
        console.log('Visitor created with ID:', visitor.id);
      } else {
        console.log('Visitor already exists with ID:', visitor.id);
        // Update visitor with new photo paths
        visitor = await VisitorModel.update(visitor.id!, {
          photoPath,
          idPhotoPath
        });
      }

      // Ensure visitor exists before creating visit
      if (!visitor || !visitor.id) {
        throw new Error('Failed to create or retrieve visitor');
      }

      // Create visit record
      console.log('Creating visit record...');
      const visit = await VisitModel.create({
        visitorId: visitor.id,
        hostName: visitData.hostName,
        department: visitData.department,
        purpose: visitData.purpose,
        accessAreas: visitData.accessAreas,
        status: 'active',
        stickerPrinted: false
      });
      console.log('Visit created with ID:', visit.id);

      console.log('=== REGISTRATION SUCCESS ===');

      return res.status(201).json({
        success: true,
        data: {
          visitor,
          visit,
          idInfo
        },
        message: 'Visit registered successfully'
      } as APIResponse);

    } catch (error) {
      console.error('=== ERROR registering visit ===');
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to register visit: ' + (error instanceof Error ? error.message : 'Unknown error')
      } as APIResponse);
    }
  }

  static async getVisitor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const visitor = await VisitorModel.findById(id);

      if (!visitor) {
        return res.status(404).json({
          success: false,
          error: 'Visitor not found'
        } as APIResponse);
      }

      return res.json({
        success: true,
        data: visitor
      } as APIResponse);

    } catch (error) {
      console.error('Error getting visitor:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get visitor'
      } as APIResponse);
    }
  }

  static async getVisitorByIdNumber(req: Request, res: Response) {
    try {
      const { idNumber } = req.params;
      const visitor = await VisitorModel.findByIdNumber(idNumber);

      if (!visitor) {
        return res.status(404).json({
          success: false,
          error: 'Visitor not found'
        } as APIResponse);
      }

      // Get visitor's visits
      const visits = await VisitModel.findByVisitorId(visitor.id!);

      return res.json({
        success: true,
        data: {
          visitor,
          visits
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error getting visitor by ID number:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get visitor'
      } as APIResponse);
    }
  }

  static async getAllVisitors(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const visitors = await VisitorModel.findAll(limit, offset);

      return res.json({
        success: true,
        data: {
          visitors,
          pagination: {
            page,
            limit,
            hasMore: visitors.length === limit
          }
        }
      } as APIResponse);

    } catch (error) {
      console.error('Error getting visitors:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get visitors'
      } as APIResponse);
    }
  }

  static async updateVisitor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const visitor = await VisitorModel.update(id, updates);

      if (!visitor) {
        return res.status(404).json({
          success: false,
          error: 'Visitor not found or no changes made'
        } as APIResponse);
      }

      return res.json({
        success: true,
        data: visitor,
        message: 'Visitor updated successfully'
      } as APIResponse);

    } catch (error) {
      console.error('Error updating visitor:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update visitor'
      } as APIResponse);
    }
  }

  static async getVisitorPhoto(req: Request, res: Response) {
    try {
      const { id, type } = req.params;
      
      if (type !== 'photo' && type !== 'id') {
        return res.status(400).json({
          success: false,
          error: 'Invalid photo type. Must be "photo" or "id"'
        } as APIResponse);
      }

      const visitor = await VisitorModel.findById(id);
      if (!visitor) {
        return res.status(404).json({
          success: false,
          error: 'Visitor not found'
        } as APIResponse);
      }

      const photoPath = type === 'photo' ? visitor.photoPath : visitor.idPhotoPath;
      const imageBuffer = await FileService.getImageBuffer(photoPath);

      if (!imageBuffer) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        } as APIResponse);
      }

      res.set('Content-Type', 'image/jpeg');
      return res.send(imageBuffer);

    } catch (error) {
      console.error('Error getting visitor photo:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get photo'
      } as APIResponse);
    }
  }
}