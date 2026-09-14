// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Clock,
  DoorOpen,
  Wand2,
  CalendarDays,
  UserCog,
  Building,
  FileText,
  PartyPopper,
  AlertTriangle,
  FileCheck,
  Gauge,
  Briefcase,
  Shield,
  Megaphone,
  Bell,
  MessageSquare,
  History,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
} from 'lucide-react';
import { getNavigationByRole } from '../../config/navigation';
import { useRole } from '../../hooks/useRole';
import { Logo } from '../ui/Logo/Logo';

// ============================================
// ICON MAP
// ============================================
const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  UserCheck,
  Clock,
  DoorOpen,
  Wand2,
  CalendarDays,
  UserCog,
  Building,
  FileText,
  PartyPopper,
  AlertTriangle,
  FileCheck,
  Gauge,
  UserGraduate: GraduationCap,  // Alias for nav config compatibility
  UserTie: Briefcase,             // Alias for nav config compatibility
  Briefcase,
  Shield,
  Megaphone,
  Bell,
  MessageSquare,
  History,
  Settings,
  RefreshCw,
  Mail,
};

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const { role } = useRole();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = getNavigationByRole(role);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Academic Year Badge */}
      <div className="px-5 py-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-500">Active</span>
          </div>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-semibold text-slate-700">AY 2026-2027</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 tracking-wider uppercase">1st Semester</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-scroll">
        {navigation.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 relative
                        ${isActive
                          ? 'bg-gradient-to-r from-navy to-navy-dark text-white shadow-sm shadow-navy/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }
                      `}
                    >
                      {Icon && (
                        <Icon
                          className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-navy'
                          }`}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badge === 'conflicts'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-cyan-100 text-cyan-700'
                          }`}
                        >
                          {item.badge === 'conflicts' ? '3' : item.badge === 'notifications' ? '5' : '2'}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse button (desktop only) */}
      <div className="hidden lg:flex items-center justify-end px-3 py-2 border-t border-slate-200/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-30 bg-white transition-all duration-300 ${
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-white transform transition-transform duration-300 ease-out lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;