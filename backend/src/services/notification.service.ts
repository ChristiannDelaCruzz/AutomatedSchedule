// backend/src/services/notification.service.ts
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TYPES
// ============================================
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory =
  | 'schedule'
  | 'enrollment'
  | 'exam'
  | 'announcement'
  | 'conflict'
  | 'system'
  | 'request';

export interface CreateNotificationInput {
  userId: string | null;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
}

// ============================================
// NOTIFICATION SERVICE
// ============================================
export class NotificationService {
  /**
   * Create a notification for a single user
   */
  async create(input: CreateNotificationInput) {
    try {
      const notificationId = uuidv4();

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert({
          id: notificationId,
          user_id: input.userId,
          title: input.title,
          message: input.message,
          type: input.type || 'info',
          category: input.category || 'system',
          action_url: input.actionUrl,
          metadata: input.metadata || {},
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Queue email if requested
      if (input.sendEmail && input.userId) {
        await this.queueEmail(input, notificationId);
      }

      logger.info('Notification created', {
        notificationId,
        userId: input.userId,
        category: input.category,
      });

      return data;
    } catch (error: any) {
      logger.error('Failed to create notification', {
        error: error.message,
        userId: input.userId,
      });
      return null;
    }
  }

  /**
   * Create notifications for multiple users (broadcast)
   */
  async createBulk(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>
  ) {
    if (!userIds || userIds.length === 0) return [];

    try {
      const rows = userIds.map((userId) => ({
        id: uuidv4(),
        user_id: userId,
        title: input.title,
        message: input.message,
        type: input.type || 'info',
        category: input.category || 'system',
        action_url: input.actionUrl,
        metadata: input.metadata || {},
        is_read: false,
      }));

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(rows)
        .select();

      if (error) throw error;

      // Queue emails
      if (input.sendEmail) {
        for (const userId of userIds) {
          await this.queueEmail({ ...input, userId }, null);
        }
      }

      logger.info('Bulk notifications created', {
        count: rows.length,
        category: input.category,
      });

      return data || [];
    } catch (error: any) {
      logger.error('Failed to create bulk notifications', {
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Create notification for all users with a specific role
   */
  async createForRole(
    role: string,
    input: Omit<CreateNotificationInput, 'userId'>
  ) {
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', role)
      .eq('is_active', true);

    const userIds = (users || []).map((u: any) => u.id);
    return this.createBulk(userIds, input);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    options: { limit?: number; unreadOnly?: boolean } = {}
  ) {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  }

  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  /**
   * Queue an email for delivery
   */
  private async queueEmail(
    input: CreateNotificationInput,
    _notificationId: string | null
  ) {
    if (!input.userId) return;

    // Check if user wants emails
    const { data: prefs } = await supabaseAdmin
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', input.userId)
      .single();

    if (prefs && prefs.email_enabled === false) return;

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name')
      .eq('id', input.userId)
      .single();

    if (!profile?.email) return;

    const bodyHtml = this.renderEmailTemplate({
      firstName: profile.first_name || 'User',
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      category: input.category || 'system',
    });

    await supabaseAdmin.from('email_queue').insert({
      id: uuidv4(),
      to_email: profile.email,
      subject: input.title,
      body_html: bodyHtml,
      status: 'pending',
    });
  }

  /**
   * Render a simple premium HTML email template
   */
  private renderEmailTemplate(params: {
    firstName: string;
    title: string;
    message: string;
    actionUrl?: string;
    category: string;
  }): string {
    const { firstName, title, message, actionUrl } = params;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#155E75 0%,#06B6D4 100%);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">SchedulePro</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Smart Class Scheduling System</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 8px;color:#0F172A;font-size:15px;">Hi ${firstName},</p>
              <h2 style="margin:16px 0 12px;color:#0F172A;font-size:20px;font-weight:700;">${title}</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">${message}</p>
              ${
                actionUrl
                  ? `
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#155E75;border-radius:10px;">
                    <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View Details</a>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
              <p style="margin:0;color:#94A3B8;font-size:12px;">You received this email because you are a registered user of SchedulePro.</p>
              <p style="margin:8px 0 0;color:#94A3B8;font-size:12px;">© 2026 SchedulePro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Send pending emails (called by a cron or manual trigger)
   */
  async sendPendingEmails() {
    const { data: pending } = await supabaseAdmin
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .limit(50);

    if (!pending || pending.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const email of pending) {
      try {
        // TODO: Integrate with your email provider (Resend, SendGrid, etc.)
        // For now, mark as sent (replace with actual email sending)
        logger.info('Would send email', {
          to: email.to_email,
          subject: email.subject,
        });

        await supabaseAdmin
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

        sent++;
      } catch (err: any) {
        failed++;
        await supabaseAdmin
          .from('email_queue')
          .update({
            attempts: (email.attempts || 0) + 1,
            last_error: err.message,
          })
          .eq('id', email.id);
      }
    }

    return { sent, failed };
  }
}

export const notificationService = new NotificationService();