import express from 'express';
import { ReportController } from '../controllers/ReportController';

const router = express.Router();

// Daily report
router.get('/daily', ReportController.getDailyReport);

// Weekly report
router.get('/weekly', ReportController.getWeeklyReport);

// Access logs report
router.get('/access-logs', ReportController.getAccessReport);

// Frequent visitors report
router.get('/frequent-visitors', ReportController.getFrequentVisitorsReport);

export default router;