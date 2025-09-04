import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all maintenance routes
router.use(authenticateToken);
router.use(requirePermission('maintenance.manage'));

// Document Types routes
router.get('/document-types', MaintenanceController.getDocumentTypes);
router.get('/document-types/:id', MaintenanceController.getDocumentType);
router.post('/document-types', MaintenanceController.createDocumentType);
router.put('/document-types/:id', MaintenanceController.updateDocumentType);
router.delete('/document-types/:id', MaintenanceController.deleteDocumentType);

// Positions routes
router.get('/positions', MaintenanceController.getPositions);
router.get('/positions/:id', MaintenanceController.getPosition);
router.post('/positions', MaintenanceController.createPosition);
router.put('/positions/:id', MaintenanceController.updatePosition);
router.delete('/positions/:id', MaintenanceController.deletePosition);

// Employees routes
router.get('/employees', MaintenanceController.getEmployees);
router.get('/employees/:id', MaintenanceController.getEmployee);
router.post('/employees', MaintenanceController.createEmployee);
router.put('/employees/:id', MaintenanceController.updateEmployee);
router.delete('/employees/:id', MaintenanceController.deleteEmployee);

// Departments routes
router.get('/departments', MaintenanceController.getDepartments);
router.get('/departments/:id', MaintenanceController.getDepartment);
router.post('/departments', MaintenanceController.createDepartment);
router.put('/departments/:id', MaintenanceController.updateDepartment);
router.delete('/departments/:id', MaintenanceController.deleteDepartment);

// Authorized Areas routes
router.get('/authorized-areas', MaintenanceController.getAuthorizedAreas);
router.get('/authorized-areas/:id', MaintenanceController.getAuthorizedArea);
router.post('/authorized-areas', MaintenanceController.createAuthorizedArea);
router.put('/authorized-areas/:id', MaintenanceController.updateAuthorizedArea);
router.delete('/authorized-areas/:id', MaintenanceController.deleteAuthorizedArea);

export default router;