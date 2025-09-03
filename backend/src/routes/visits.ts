import { Router } from 'express';
import { VisitController } from '../controllers/VisitController';

const router = Router();

// Get visit by ID with visitor information
router.get('/:id', VisitController.getVisit);

// Get all visits (with filters and pagination)
router.get('/', VisitController.getAllVisits);

// Check out a visit
router.put('/:id/checkout', VisitController.checkOut);

// Check access for mobile app
router.post('/:visitId/check-access', VisitController.checkAccess);

// Get access logs for a visit
router.get('/:visitId/access-logs', VisitController.getAccessLogs);

// Print/generate sticker data
router.post('/:id/print-sticker', VisitController.printSticker);

export default router;