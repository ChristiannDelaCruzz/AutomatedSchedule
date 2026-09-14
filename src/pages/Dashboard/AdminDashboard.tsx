// src/pages/Dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Briefcase,
  DoorOpen,
  CalendarDays,
  AlertTriangle,
  Wand2,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';

// ============================================
// SKELETON LOADER
// ============================================
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-slate-200 mb-4" />
    <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
    <div className="h-4 w-24 bg-slate-100 rounded" />
  </div>
);

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, subtitle, trend, iconBg, iconColor, onClick }) => (
  <button
    onClick={onClick}
    className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-cyan/40 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {trend.isPositive && <TrendingUp className="w-3 h-3" />}
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
  </button>
);

// ============================================
// QUICK ACTION BUTTON
// ============================================
const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  primary?: boolean;
}> = ({ icon: Icon, label, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
      primary
        ? 'bg-gradient-to-r from-navy to-navy-dark text-white shadow-md shadow-navy/20 hover:shadow-lg hover:shadow-navy/30 hover:-translate-y-0.5'
        : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan/40 hover:bg-slate-50'
    }`}
  >
    <Icon className={`w-4 h-4 ${primary ? 'text-white' : 'text-cyan'}`} />
    <span>{label}</span>
  </button>
);

// ============================================
// ACTIVITY ITEM
// ============================================
const ActivityItem: React.FC<{
  user: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'conflict';
}> = ({ user, action, time, status }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {user
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-900">
        <span className="font-semibold">{user}</span>{' '}
        <span className="text-slate-500">{action}</span>
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
    </div>
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
        status === 'completed'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'conflict'
          ? 'bg-red-50 text-red-700'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'conflict' && <AlertTriangle className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  </div>
);

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
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ============================================
// MAIN DASHBOARD
// ============================================
export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await dashboardService.getFullStats('2026-2027', 1);

        if (!isMounted) return;

        if (response.success && response.data) {
          setStats(response.data);
        } else {
          showToast(
            'error',
            'Failed to Load Dashboard',
            response.error?.message || 'Could not fetch dashboard statistics.'
          );
        }
      } catch (error: any) {
        if (!isMounted) return;
        showToast('error', 'Dashboard Error', error.message || 'Something went wrong.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  // ============================================
  // COMPUTE CHART VALUES
  // ============================================
  const weeklyData = stats?.weeklyDistribution || [];
  const maxWeeklyValue = Math.max(...weeklyData.map((d) => d.value), 1);

  const statusData = stats?.scheduleStatus;
  const totalStatus = statusData?.total || 1;

  const getPercent = (val: number) => Math.round((val / totalStatus) * 100);

  const generatedPct = statusData ? getPercent(statusData.generated) : 0;
  const publishedPct = statusData ? getPercent(statusData.published) : 0;
  const pendingPct = statusData ? getPercent(statusData.pendingReview) : 0;
  const conflictPct = statusData ? getPercent(statusData.withConflicts) : 0;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your academic schedule today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate('/scheduling/generator')}
            className="bg-gradient-to-r from-navy to-navy-dark hover:from-navy-dark hover:to-navy shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Schedule
          </Button>
          <Button onClick={() => navigate('/scheduling/class')} variant="outline" className="border-slate-200">
            <CalendarDays className="w-4 h-4 mr-2" />
            View Timetable
          </Button>
          <Button
            onClick={() => navigate('/scheduling/conflicts')}
            variant="outline"
            className="border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Review Conflicts
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* STATS GRID */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Active Sections"
              value={stats.stats.activeSections}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-600"
              onClick={() => navigate('/admin/sections')}
            />
            <StatCard
              icon={BookOpen}
              label="Subjects"
              value={stats.stats.subjects}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              onClick={() => navigate('/admin/subjects')}
            />
            <StatCard
              icon={Briefcase}
              label="Professors"
              value={stats.stats.assignedProfessors}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              onClick={() => navigate('/users/professors')}
            />
            <StatCard
              icon={DoorOpen}
              label="Available Rooms"
              value={stats.stats.availableRooms}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              onClick={() => navigate('/admin/rooms')}
            />
            <StatCard
              icon={CalendarDays}
              label="Scheduled Classes"
              value={stats.stats.scheduledClasses}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              onClick={() => navigate('/scheduling/class')}
            />
            <StatCard
              icon={AlertTriangle}
              label="Detected Conflicts"
              value={stats.stats.detectedConflicts}
              iconBg="bg-red-50"
              iconColor="text-red-600"
              onClick={() => navigate('/scheduling/conflicts')}
            />
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* CHARTS ROW */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Class Distribution */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Class Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Classes per day this semester</p>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-end justify-between gap-2 h-40 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-t-lg" style={{ height: `${40 + i * 8}%` }} />
                  <div className="h-3 w-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : weeklyData.every((d) => d.value === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <CalendarDays className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No schedules generated yet</p>
              <p className="text-xs text-slate-400 mt-1">Generate a schedule to see distribution</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                    style={{ height: `${Math.max((item.value / maxWeeklyValue) * 100, 4)}%` }}
                  />
                  <span className="text-xs font-medium text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Schedule Status Donut */}
        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-900">Schedule Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Current schedule overview</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center mb-5">
              <div className="w-40 h-40 rounded-full bg-slate-100 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-5">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />

                    {/* Generated (cyan) */}
                    {generatedPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="12"
                        strokeDasharray={`${(generatedPct / 100) * 251} 251`}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Published (navy) */}
                    {publishedPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#155E75"
                        strokeWidth="12"
                        strokeDasharray={`${(publishedPct / 100) * 251} 251`}
                        strokeDashoffset={`-${(generatedPct / 100) * 251}`}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Pending (amber) */}
                    {pendingPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="12"
                        strokeDasharray={`${(pendingPct / 100) * 251} 251`}
                        strokeDashoffset={`-${((generatedPct + publishedPct) / 100) * 251}`}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Conflicts (red) */}
                    {conflictPct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="12"
                        strokeDasharray={`${(conflictPct / 100) * 251} 251`}
                        strokeDashoffset={`-${((generatedPct + publishedPct + pendingPct) / 100) * 251}`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-slate-900">
                      {statusData?.total || 0}
                    </p>
                    <p className="text-xs text-slate-500">Total Classes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Generated', value: generatedPct, color: 'bg-cyan-500', count: statusData?.generated || 0 },
                  { label: 'Published', value: publishedPct, color: 'bg-navy', count: statusData?.published || 0 },
                  { label: 'Pending Review', value: pendingPct, color: 'bg-amber-500', count: statusData?.pendingReview || 0 },
                  { label: 'With Conflicts', value: conflictPct, color: 'bg-red-500', count: statusData?.withConflicts || 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ============================================ */}
      {/* QUICK ACTIONS + RECENT ACTIVITY */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction icon={Wand2} label="Generate Schedule" onClick={() => navigate('/scheduling/generator')} primary />
            <QuickAction icon={Users} label="Add Section" onClick={() => navigate('/admin/sections')} />
            <QuickAction icon={Briefcase} label="Add Professor" onClick={() => navigate('/users/professors')} />
            <QuickAction icon={DoorOpen} label="Add Room" onClick={() => navigate('/admin/rooms')} />
            <QuickAction icon={AlertTriangle} label="View Conflicts" onClick={() => navigate('/scheduling/conflicts')} />
          </div>
        </Card>

        {/* Recent Scheduling Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Scheduling Activity</h3>
            <button className="text-xs font-semibold text-navy hover:text-cyan transition-colors flex items-center gap-1">
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Activity will appear here as you use the system</p>
            </div>
          ) : (
            <div>
              {stats.recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  user={activity.user}
                  action={activity.action}
                  time={formatRelativeTime(activity.time)}
                  status={activity.status}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;