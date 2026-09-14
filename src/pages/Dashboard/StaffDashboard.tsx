// src/pages/Dashboard/StaffDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  DoorOpen,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, {user?.firstName || 'Staff'}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Staff Portal - View and manage academic schedules
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => navigate('/scheduling/class')} className="bg-gradient-to-r from-navy to-navy-dark">
            <CalendarDays className="w-4 h-4 mr-2" />
            View Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileCheck, label: 'Pending Applications', value: 12, bg: 'bg-amber-50', color: 'text-amber-600' },
          { icon: Users, label: 'Active Sections', value: 42, bg: 'bg-cyan-50', color: 'text-cyan-600' },
          { icon: CalendarDays, label: 'Scheduled Classes', value: 124, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { icon: DoorOpen, label: 'Available Rooms', value: 34, bg: 'bg-blue-50', color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <button onClick={() => navigate('/admin/enrollments')} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
            <FileCheck className="w-4 h-4 text-cyan" />
            <span className="text-sm font-semibold text-slate-700">Review Applications</span>
          </button>
          <button onClick={() => navigate('/scheduling/class')} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
            <CalendarDays className="w-4 h-4 text-cyan" />
            <span className="text-sm font-semibold text-slate-700">View Class Schedule</span>
          </button>
          <button onClick={() => navigate('/communication/announcements')} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
            <Megaphone className="w-4 h-4 text-cyan" />
            <span className="text-sm font-semibold text-slate-700">Announcements</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboard;