// src/pages/Admin/Sections.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { sectionService, SectionFilters } from '../../services/section.service';
import type { Section } from '../../types';

// ============================================
// STAT CARD (now supports optional trend)
// ============================================
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  trend,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  trend?: { value: string; isPositive: boolean };
  subtitle?: string;
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            trend.isPositive
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <TrendingUp className={`w-3 h-3 ${!trend.isPositive ? 'rotate-180' : ''}`} />
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-600 mt-1.5">{label}</p>
    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

// ============================================
// SECTION ROW
// ============================================
const SectionRow = ({
  section,
  onEdit,
  onDelete,
  onView,
}: {
  section: Section;
  onEdit: (s: Section) => void;
  onDelete: (s: Section) => void;
  onView: (s: Section) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const occupancy = section.max_capacity
    ? Math.round((section.current_enrollment / section.max_capacity) * 100)
    : 0;

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    full: 'bg-amber-50 text-amber-700 border-amber-200',
    closed: 'bg-red-50 text-red-700 border-red-200',
    archived: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{section.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{section.code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-700">
          <p className="font-medium">
            {section.year_levels?.programs?.code} - {section.year_levels?.name}
          </p>
          <p className="text-xs text-slate-500">
            AY {section.academic_year} · {section.semester === 1 ? '1st' : '2nd'} Sem
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-[120px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-600">
                {section.current_enrollment}/{section.max_capacity}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  occupancy >= 90
                    ? 'text-red-600'
                    : occupancy >= 70
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {occupancy}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  occupancy >= 90
                    ? 'bg-red-500'
                    : occupancy >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            statusColors[section.status] || statusColors.active
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {section.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => {
                  onView(section);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                View Details
              </button>
              <button
                onClick={() => {
                  onEdit(section);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="w-4 h-4 text-slate-400" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(section);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};

// ============================================
// MAIN PAGE
// ============================================
export const Sections: React.FC = () => {
  const { showToast } = useToast();

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SectionFilters>({
    academicYear: '2026-2027',
    semester: 1,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // ============================================
  // FETCH
  // ============================================
  useEffect(() => {
    let isMounted = true;

    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const response = await sectionService.getSections(filters);
        if (!isMounted) return;

        if (response.success && response.data) {
          setSections(response.data);
        } else {
          showToast('error', 'Failed to Load', response.error?.message || 'Could not fetch sections.');
        }
      } catch (error: any) {
        if (isMounted) {
          showToast('error', 'Error', error.message || 'Something went wrong.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSections();
    return () => {
      isMounted = false;
    };
  }, [filters, showToast]);

  // ============================================
  // FILTERED SECTIONS
  // ============================================
  const filteredSections = sections.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.year_levels?.name || '').toLowerCase().includes(q) ||
      (s.year_levels?.programs?.code || '').toLowerCase().includes(q)
    );
  });

  // ============================================
  // STATS
  // ============================================
  const totalSections = sections.length;
  const activeSections = sections.filter((s) => s.status === 'active').length;
  const fullSections = sections.filter((s) => s.status === 'full').length;
  const totalStudents = sections.reduce((sum, s) => sum + s.current_enrollment, 0);
  const totalCapacity = sections.reduce((sum, s) => sum + s.max_capacity, 0);
  const averageOccupancy =
    totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  // ============================================
  // ACTIONS
  // ============================================
  const handleCreate = () => {
    showToast('info', 'Coming Soon', 'Create section form will be available shortly.');
  };

  const handleEdit = (section: Section) => {
    showToast('info', 'Coming Soon', `Edit ${section.name} will be available shortly.`);
  };

  const handleDelete = async (section: Section) => {
    if (!confirm(`Are you sure you want to delete ${section.name}?`)) return;

    const response = await sectionService.deleteSection(section.id);
    if (response.success) {
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      showToast('success', 'Deleted', `${section.name} has been removed.`);
    } else {
      showToast('error', 'Delete Failed', response.error?.message || 'Could not delete section.');
    }
  };

  const handleView = (section: Section) => {
    showToast('info', 'View Details', `Details for ${section.name} will be shown shortly.`);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sections</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage class sections, capacity, and academic configuration
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            variant="outline"
            className="border-slate-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-navy to-navy-dark hover:from-navy-dark hover:to-navy"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* ============================================ */}
      {/* STATS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Sections"
          value={totalSections}
          color="bg-cyan-50 text-cyan-600"
          trend={{ value: `${activeSections} active`, isPositive: activeSections > 0 }}
        />
        <StatCard
          icon={Check}
          label="Active"
          value={activeSections}
          color="bg-emerald-50 text-emerald-600"
          subtitle={`${totalSections - activeSections} inactive/full`}
        />
        <StatCard
          icon={AlertCircle}
          label="Full"
          value={fullSections}
          color="bg-amber-50 text-amber-600"
          subtitle={fullSections > 0 ? 'Requires attention' : 'All have capacity'}
        />
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          value={totalStudents}
          color="bg-purple-50 text-purple-600"
          trend={{
            value: `${averageOccupancy}% occupied`,
            isPositive: averageOccupancy < 90,
          }}
        />
      </div>

      {/* ============================================ */}
      {/* FILTER PANEL */}
      {/* ============================================ */}
      {showFilterPanel && (
        <Card className="p-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Filter Sections</h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close filter panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Academic Year
              </label>
              <select
                value={filters.academicYear || ''}
                onChange={(e) => setFilters((f) => ({ ...f, academicYear: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Semester</label>
              <select
                value={filters.semester || 1}
                onChange={(e) => setFilters((f) => ({ ...f, semester: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan"
              >
                <option value={1}>1st Semester</option>
                <option value={2}>2nd Semester</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ academicYear: '2026-2027', semester: 1 });
                  setSearchQuery('');
                }}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================ */}
      {/* SEARCH + TABLE */}
      {/* ============================================ */}
      <Card className="overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections by name, code, program..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">
              {searchQuery ? 'No sections match your search' : 'No sections yet'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first section to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Program & Year
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sections;