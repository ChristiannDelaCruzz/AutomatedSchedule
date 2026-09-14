// src/services/notification.service.ts
import apiClient from './api';
import type { ApiResponse } from '../types';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category:
    | 'schedule'
    | 'enrollment'
    | 'exam'
    | 'announcement'
    | 'conflict'
    | 'system'
    | 'request';
  is_read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  read_at?: string;
}

class NotificationService {
  async getMyNotifications(
    limit = 50,
    unreadOnly = false
  ): Promise<ApiResponse<Notification[]>> {
    try {
      return await apiClient.get<ApiResponse<Notification[]>>('/notifications', {
        limit,
        unreadOnly: unreadOnly ? 'true' : 'false',
      });
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      return await apiClient.get<ApiResponse<{ count: number }>>('/notifications/count');
    } catch (error: any) {
      return {
        success: false,
        data: { count: 0 },
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to update', code: 'UPDATE_ERROR' },
      };
    }
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to update', code: 'UPDATE_ERROR' },
      };
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to delete', code: 'DELETE_ERROR' },
      };
    }
  }

  async broadcast(payload: {
    title: string;
    message: string;
    type?: string;
    category?: string;
    actionUrl?: string;
    roles?: string[];
    userIds?: string[];
    sendEmail?: boolean;
  }): Promise<ApiResponse<{ count: number }>> {
    try {
      return await apiClient.post<ApiResponse<{ count: number }>>(
        '/notifications/broadcast',
        payload
      );
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to broadcast', code: 'BROADCAST_ERROR' },
      };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;