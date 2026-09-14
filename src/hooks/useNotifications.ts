// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase'; // We'll create this
import { notificationService, Notification } from '../services/notification.service';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // ============================================
  // FETCH INITIAL
  // ============================================
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationService.getMyNotifications(50, false);
      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.is_read).length);
      }
    } catch (error: any) {
      // Silent fail — notifications are non-critical
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id || hasInitialized.current) return;
    hasInitialized.current = true;
    fetchNotifications();
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // ============================================
  // REALTIME SUBSCRIPTION
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newNotification = payload.new as Notification;

          // Add to list
          setNotifications((prev) => [newNotification, ...prev]);

          // Increment unread
          setUnreadCount((prev) => prev + 1);

          // Show toast
          const toastType = ['success', 'error', 'warning', 'info'].includes(newNotification.type)
            ? (newNotification.type as 'success' | 'error' | 'warning' | 'info')
            : 'info';

          showToast(toastType, newNotification.title, newNotification.message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recompute unread
          setNotifications((current) => {
            setUnreadCount(current.filter((n) => !n.is_read).length);
            return current;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const deleted = payload.old as { id: string };
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id, showToast]);

  // ============================================
  // ACTIONS
  // ============================================
  const markAsRead = useCallback(async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.is_read) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const response = await notificationService.markAsRead(id);
    if (!response.success) {
      // Revert on failure
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
      setUnreadCount((prev) => prev + 1);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const previous = notifications;
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const response = await notificationService.markAllAsRead();
    if (!response.success) {
      // Revert
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  }, [notifications, unreadCount]);

  const deleteNotification = useCallback(async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return;

    const wasUnread = !notification.is_read;

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

    const response = await notificationService.delete(id);
    if (!response.success) {
      // Revert
      setNotifications((prev) => [notification, ...prev]);
      if (wasUnread) setUnreadCount((prev) => prev + 1);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export default useNotifications;