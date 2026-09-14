// backend/src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get current user's notifications
   */
  getMyNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const limit = Number(req.query.limit) || 50;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = await notificationService.getUserNotifications(req.user.id, {
      limit,
      unreadOnly,
    });

    res.status(200).json({ success: true, data: notifications });
  });

  /**
   * GET /api/notifications/count
   */
  getUnreadCount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: { count } });
  });

  /**
   * PATCH /api/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    await notificationService.markAsRead(id, req.user.id);
    res.status(200).json({ success: true, message: 'Marked as read' });
  });

  /**
   * PATCH /api/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: 'All marked as read' });
  });

  /**
   * DELETE /api/notifications/:id
   */
  deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
      return;
    }

    const { id } = req.params;
    await notificationService.delete(id, req.user.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  });

  /**
   * POST /api/notifications/broadcast
   * Admin-only: broadcast to role(s) or specific users
   */
  broadcast = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      message,
      type = 'info',
      category = 'announcement',
      actionUrl,
      roles,
      userIds,
      sendEmail = false,
    } = req.body;

    if (!title || !message) {
      res.status(400).json({
        success: false,
        error: { message: 'Title and message are required' },
      });
      return;
    }

    let count = 0;

    if (roles && Array.isArray(roles) && roles.length > 0) {
      for (const role of roles) {
        const result = await notificationService.createForRole(role, {
          title,
          message,
          type,
          category,
          actionUrl,
          sendEmail,
        });
        count += result.length;
      }
    } else if (userIds && Array.isArray(userIds)) {
      const result = await notificationService.createBulk(userIds, {
        title,
        message,
        type,
        category,
        actionUrl,
        sendEmail,
      });
      count = result.length;
    } else {
      res.status(400).json({
        success: false,
        error: { message: 'Either roles or userIds required' },
      });
      return;
    }

    logger.info('Broadcast sent', {
      count,
      by: req.user?.id,
      category,
    });

    res.status(200).json({
      success: true,
      data: { count },
      message: `Sent to ${count} user(s)`,
    });
  });
}

export const notificationController = new NotificationController();