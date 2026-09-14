// src/components/layout/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FileCheck,
  Calendar,
  AlertTriangle,
  Megaphone,
  Trash2,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

// ============================================
// ICON + COLOR MAPS
// ============================================
const categoryIconMap: Record<string, React.ElementType> = {
  schedule: Calendar,
  enrollment: FileCheck,
  exam: FileCheck,
  announcement: Megaphone,
  conflict: AlertTriangle,
  system: Info,
  request: FileCheck,
};

const categoryColorMap: Record<string, string> = {
  schedule: 'bg-cyan-100 text-cyan-700',
  enrollment: 'bg-emerald-100 text-emerald-700',
  exam: 'bg-purple-100 text-purple-700',
  announcement: 'bg-blue-100 text-blue-700',
  conflict: 'bg-red-100 text-red-700',
  system: 'bg-slate-100 text-slate-700',
  request: 'bg-amber-100 text-amber-700',
};

const typeIconMap: Record<string, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

// ============================================
// HELPER: Format relative time
// ============================================
function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // ============================================
  // CLOSE ON CLICK OUTSIDE
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // HANDLE CLICK ON NOTIFICATION
  // ============================================
  const handleNotificationClick = async (id: string, actionUrl?: string) => {
    await markAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      navigate(actionUrl);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ============================================ */}
      {/* BELL BUTTON */}
      {/* ============================================ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <>
            {/* Pulsing dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />

            {/* Count badge */}
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* ============================================ */}
      {/* DROPDOWN */}
      {/* ============================================ */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread`
                  : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* ============================================ */}
          {/* LIST */}
          {/* ============================================ */}
          <div className="max-h-[420px] overflow-y-auto sidebar-scroll">
            {isLoading ? (
              // Loading state
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-32 bg-slate-100 rounded mb-2" />
                      <div className="h-3 w-full bg-slate-100 rounded mb-1.5" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div className="px-5 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications</p>
                <p className="text-xs text-slate-400 mt-1">
                  You're all caught up! Check back later.
                </p>
              </div>
            ) : (
              // Notification list
              <ul className="divide-y divide-slate-100">
                {notifications.map((notif) => {
                  const CategoryIcon = categoryIconMap[notif.category] || Info;
                  const TypeIcon = typeIconMap[notif.type] || Info;
                  const colorClass =
                    categoryColorMap[notif.category] || categoryColorMap.system;

                  return (
                    <li
                      key={notif.id}
                      className={`group relative transition-colors ${
                        notif.is_read
                          ? 'hover:bg-slate-50'
                          : 'bg-cyan-50/30 hover:bg-cyan-50/60'
                      }`}
                    >
                      <button
                        onClick={() =>
                          handleNotificationClick(notif.id, notif.action_url)
                        }
                        className="w-full text-left px-5 py-3.5 pr-12"
                      >
                        <div className="flex gap-3">
                          {/* Category icon */}
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                          >
                            <CategoryIcon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  notif.is_read
                                    ? 'font-medium'
                                    : 'font-semibold'
                                } text-slate-900 flex items-center gap-1.5`}
                              >
                                <TypeIcon
                                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                                    notif.type === 'success'
                                      ? 'text-emerald-500'
                                      : notif.type === 'error'
                                      ? 'text-red-500'
                                      : notif.type === 'warning'
                                      ? 'text-amber-500'
                                      : 'text-cyan-500'
                                  }`}
                                />
                                <span className="truncate">{notif.title}</span>
                              </p>
                              {!notif.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              {formatRelativeTime(notif.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Delete button (appears on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ============================================ */}
          {/* FOOTER */}
          {/* ============================================ */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/communication/notifications');
                }}
                className="w-full text-center text-xs font-semibold text-navy hover:text-cyan transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;