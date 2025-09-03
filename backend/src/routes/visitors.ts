import { Router } from 'express';
import { VisitorController } from '../controllers/VisitorController';
import { FileService } from '../services/FileService';

const router = Router();
const upload = FileService.getMulterConfig();

// Register a new visit with photos
router.post('/register', 
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idPhoto', maxCount: 1 }
  ]), 
  VisitorController.registerVisit
);

// Get visitor by ID
router.get('/:id', VisitorController.getVisitor);

// Get visitor by ID number
router.get('/id-number/:idNumber', VisitorController.getVisitorByIdNumber);

// Get all visitors (paginated)
router.get('/', VisitorController.getAllVisitors);

// Update visitor information
router.put('/:id', VisitorController.updateVisitor);

// Get visitor photos
router.get('/:id/photo/:type', VisitorController.getVisitorPhoto);

export default router;