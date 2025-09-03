import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requirePermission, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', UserController.login);

// Protected routes (require authentication)
router.use(authenticateToken);

// User profile routes
router.get('/profile', UserController.getProfile);
router.post('/logout', UserController.logout);

// Admin/Manager routes
router.get('/', requirePermission('users.view'), UserController.getAllUsers);
router.post('/', requirePermission('users.manage'), UserController.createUser);
router.put('/:id', UserController.updateUser); // Permission checking handled in controller
router.delete('/:id', requireRole(['ADMIN']), UserController.deleteUser);

export default router;