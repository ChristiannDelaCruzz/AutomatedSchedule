// src/services/dashboard.service.ts
import apiClient from './api';
import type { ApiResponse } from '../types';

export interface DashboardStats {
  stats: {
    activeSections: number;
    subjects: number;
    assignedProfessors: number;
    availableRooms: number;
    scheduledClasses: number;
    detectedConflicts: number;
  };
  weeklyDistribution: Array<{
    day: string;
    value: number;
    fullDay: string;
  }>;
  scheduleStatus: {
    generated: number;
    published: number;
    pendingReview: number;
    withConflicts: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    status: 'completed' | 'pending' | 'conflict';
  }>;
  academicYear: string;
  semester: number;
}

class DashboardService {
  /**
   * Fetch full dashboard statistics
   */
  async getFullStats(
    academicYear: string = '2026-2027',
    semester: number = 1
  ): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        '/admin/dashboard/stats',
        { academicYear, semester }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to load dashboard stats',
          code: error.code || 'DASHBOARD_FETCH_ERROR',
        },
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;