// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-[260px] transition-all duration-300">
        {/* Top Navbar */}
        <TopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;