// src/components/layout/TopNavbar.tsx
import React, { useState } from 'react';
import { Menu, Search, ChevronDown, Calendar } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Academic Year / Semester Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <Calendar className="w-4 h-4 text-cyan" />
          <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-navy transition-colors">
            <span>2026-2027</span>
            <span className="text-slate-300">·</span>
            <span className="text-cyan-600">1st Semester</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, professors, subjects, sections, rooms..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all duration-200"
            />
            <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;