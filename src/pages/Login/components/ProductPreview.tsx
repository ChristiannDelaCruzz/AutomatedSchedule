import React from 'react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-navy/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan/5 rounded-full blur-3xl" />

      {/* Main Preview Card */}
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Preview Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-cyan-50/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-2">schedule.dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-slate-200" />
            <span className="w-4 h-4 rounded bg-slate-200" />
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-5 bg-gradient-to-b from-white to-slate-50/50">
          {/* Mini Sidebar + Content */}
          <div className="flex gap-4">
            {/* Mini Sidebar */}
            <div className="w-12 flex flex-col items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-cyan-dark flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-2.5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Classes</p>
                  <p className="text-lg font-bold text-navy">24</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-2.5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Professors</p>
                  <p className="text-lg font-bold text-navy">12</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-2.5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Rooms</p>
                  <p className="text-lg font-bold text-navy">8</p>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-lg p-2.5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">This Week</span>
                  <div className="flex gap-1">
                    <span className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer" />
                    <span className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer" />
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-5 gap-1 mb-1.5">
                  {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <div key={i} className="text-[10px] text-slate-400 font-medium text-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Schedule Blocks */}
                <div className="space-y-1">
                  <div className="grid grid-cols-5 gap-1">
                    <div className="h-6 rounded bg-gradient-to-r from-cyan-lighter to-cyan-50 border border-cyan/20 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-cyan-dark font-medium">9AM</span>
                    </div>
                    <div className="h-6 rounded bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-green-700 font-medium">10AM</span>
                    </div>
                    <div className="h-6 rounded bg-slate-100 border border-slate-200" />
                    <div className="h-6 rounded bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-amber-700 font-medium">2PM</span>
                    </div>
                    <div className="h-6 rounded bg-slate-100 border border-slate-200" />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <div className="h-6 rounded bg-slate-100 border border-slate-200" />
                    <div className="h-6 rounded bg-gradient-to-r from-cyan-lighter to-cyan-50 border border-cyan/20 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-cyan-dark font-medium">11AM</span>
                    </div>
                    <div className="h-6 rounded bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-green-700 font-medium">1PM</span>
                    </div>
                    <div className="h-6 rounded bg-slate-100 border border-slate-200" />
                    <div className="h-6 rounded bg-gradient-to-r from-cyan-lighter to-cyan-50 border border-cyan/20 flex items-center justify-center shadow-sm">
                      <span className="text-[8px] text-cyan-dark font-medium">3PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan to-cyan-dark" />
                  <span className="text-[9px] text-slate-500">Scheduled</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[9px] text-slate-500">Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[9px] text-slate-500">Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-[9px] text-slate-500">Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification Cards */}
      <div className="absolute -right-4 xl:-right-6 bottom-16 bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-w-[180px] animate-fade-in hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
          <span className="text-xs font-medium text-slate-700">Schedule updated</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">3 new classes added</p>
      </div>

      <div className="absolute -left-4 xl:-left-6 top-20 bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-w-[160px] animate-fade-in hover:shadow-xl transition-shadow" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan to-cyan-dark" />
          <span className="text-xs font-medium text-slate-700">Next event</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">10:30 AM · Room 201</p>
      </div>

      <div className="absolute -left-2 xl:-left-4 bottom-32 bg-white rounded-xl border border-slate-200 shadow-lg p-3 max-w-[160px] animate-fade-in hover:shadow-xl transition-shadow" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
          <span className="text-xs font-medium text-slate-700">Today's schedule</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">80% complete</p>
        <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan to-navy rounded-full" style={{ width: '80%' }} />
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;