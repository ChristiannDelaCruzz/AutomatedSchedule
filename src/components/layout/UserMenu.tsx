// src/components/layout/UserMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const roleLabel = (user?.role || 'user').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-900 leading-tight">{fullName}</p>
          <p className="text-[11px] text-slate-500 leading-tight">{roleLabel}</p>
        </div>
        <ChevronDown
          className={`hidden md:block w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="px-5 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-cyan flex items-center justify-center text-white text-base font-bold shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              My Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Account Settings
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/help');
              }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Help & Support
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;