// backend/src/routes/notification.routes.ts
import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User routes
router.get('/', notificationController.getMyNotifications);
router.get('/count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Admin routes
router.post('/broadcast', isAdmin, notificationController.broadcast);

export default router;