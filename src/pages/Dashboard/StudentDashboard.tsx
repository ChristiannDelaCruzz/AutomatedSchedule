// src/pages/Dashboard/StudentDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  BookOpen,
  GraduationCap,
  FileText,
  Megaphone,
  MapPin,
  User,
  Clock,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
}> = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} mb-3`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
  </div>
);

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayClasses = [
    {
      time: '9:00 AM - 12:00 PM',
      subject: 'Systems Analysis and Design',
      professor: 'Prof. Dela Cruz',
      room: 'Room 201',
      status: 'ongoing',
    },
    {
      time: '1:00 PM - 4:00 PM',
      subject: 'Database Management',
      professor: 'Prof. Santos',
      room: 'Room 202',
      status: 'upcoming',
    },
    {
      time: '4:00 PM - 7:00 PM',
      subject: 'IT Elective 3',
      professor: 'Prof. Reyes',
      room: 'Room 201',
      status: 'upcoming',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-semibold text-cyan-700">
              <GraduationCap className="w-3 h-3" />
              3BSIT-1
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
              BS Information Technology
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
              3rd Year
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate('/student/schedule')}
            className="bg-gradient-to-r from-navy to-navy-dark"
          >
            <CalendarDays className="w-4 h-4 mr-2" />
            My Schedule
          </Button>
          <Button variant="outline" onClick={() => navigate('/student/subjects')}>
            <BookOpen className="w-4 h-4 mr-2" />
            My Subjects
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={CalendarDays} label="Today's Classes" value={3} iconBg="bg-cyan-50" iconColor="text-cyan-600" />
        <StatCard icon={BookOpen} label="Enrolled Subjects" value={6} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard icon={FileText} label="Upcoming Exams" value={2} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard icon={GraduationCap} label="Total Units" value={18} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard icon={Bell} label="Announcements" value={3} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Classes */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Classes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your schedule for today</p>
            </div>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {todayClasses.map((cls, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  cls.status === 'ongoing'
                    ? 'bg-gradient-to-r from-cyan-50 to-white border-cyan-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-cyan-700">{cls.time}</span>
                      {cls.status === 'ongoing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ONGOING
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{cls.subject}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {cls.professor}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cls.room}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-cyan hover:bg-cyan-50 rounded-lg transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions + Announcements */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/student/schedule')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all text-left">
                <CalendarDays className="w-4 h-4" />
                View Full Schedule
              </button>
              <button onClick={() => navigate('/student/subjects')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
                <BookOpen className="w-4 h-4 text-cyan" />
                My Subjects
              </button>
              <button onClick={() => navigate('/student/exams')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
                <FileText className="w-4 h-4 text-cyan" />
                Exam Schedule
              </button>
              <button onClick={() => navigate('/student/section')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-cyan/40 hover:bg-slate-50 transition-all text-left">
                <GraduationCap className="w-4 h-4 text-cyan" />
                My Section
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Announcements</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Enrollment Open', desc: 'Now accepting applications', color: 'bg-emerald-500' },
                { title: 'Schedule Published', desc: '1st Semester now available', color: 'bg-cyan-500' },
                { title: 'Exam Week', desc: 'October 15-20, 2026', color: 'bg-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className={`w-1.5 rounded-full ${item.color} flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;