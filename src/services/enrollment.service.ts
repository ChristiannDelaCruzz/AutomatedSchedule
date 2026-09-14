// src/services/enrollment.service.ts
import apiClient from './api';
import type { ApiResponse } from '../types';
import type {
  EnrollmentFormData,
  EnrollmentApplication,
  EnrollmentApplicationWithDetails,
  EnrollmentFilters,
  EnrollmentType,
} from '../types/enrollment';

// ============================================
// SERVICE-SPECIFIC TYPES (using EnrollmentType)
// ============================================
export interface EnrollmentTypeSummary {
  type: EnrollmentType;
  label: string;
  count: number;
}

export interface ApplicationStatusResponse {
  id: string;
  applicationNumber: string;
  status: string;
  enrollmentType?: EnrollmentType;
  submittedAt?: string;
  firstName: string;
  lastName: string;
  programId: string;
  semester: number;
  academicYear: string;
}

class EnrollmentService {
  // ============================================
  // HELPER: Get human-readable label for enrollment type
  // ============================================
  getEnrollmentTypeLabel(type: EnrollmentType): string {
    const labels: Record<EnrollmentType, string> = {
      new: 'New Student',
      continuing: 'Continuing Student',
      returnee: 'Returnee',
      transferee: 'Transferee',
    };
    return labels[type] || 'Student';
  }

  // ============================================
  // HELPER: Check if type requires student number
  // ============================================
  requiresStudentNumber(type: EnrollmentType): boolean {
    return type === 'continuing' || type === 'returnee';
  }

  // ============================================
  // HELPER: Get icon name for enrollment type
  // ============================================
  getEnrollmentTypeIcon(type: EnrollmentType): string {
    const icons: Record<EnrollmentType, string> = {
      new: 'GraduationCap',
      continuing: 'ArrowRight',
      returnee: 'RotateCcw',
      transferee: 'ArrowLeftRight',
    };
    return icons[type] || 'GraduationCap';
  }

  // ============================================
  // HELPER: Get color gradient for enrollment type
  // ============================================
  getEnrollmentTypeColor(type: EnrollmentType): string {
    const colors: Record<EnrollmentType, string> = {
      new: 'from-cyan-500 to-cyan-600',
      continuing: 'from-blue-500 to-blue-600',
      returnee: 'from-amber-500 to-amber-600',
      transferee: 'from-purple-500 to-purple-600',
    };
    return colors[type] || 'from-slate-500 to-slate-600';
  }

  // ============================================
  // SUBMIT APPLICATION (Public)
  // ============================================
  async submitApplication(data: EnrollmentFormData): Promise<ApiResponse<any>> {
    try {
      // Explicitly type the enrollment type
      const enrollmentType: EnrollmentType = data.enrollmentType || 'new';

      const payload = {
        personalInfo: {
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          middleName: data.personalInfo.middleName || '',
          dateOfBirth: data.personalInfo.dateOfBirth,
          contactNumber: data.personalInfo.contactNumber,
          email: data.personalInfo.email,
          address: data.personalInfo.address,
        },
        academicInfo: {
          departmentId: data.academicInfo.departmentId || '',
          programId: data.academicInfo.programId,
          yearLevelId: data.academicInfo.yearLevelId,
          academicYear: data.academicInfo.academicYear || '2026-2027',
          semester: data.academicInfo.semester,
          sectionId: data.academicInfo.sectionId,
        },
        enrollmentType,
        previousStudentNumber:
          this.requiresStudentNumber(enrollmentType)
            ? data.previousStudentNumber || null
            : null,
      };

      const response = await apiClient.post<ApiResponse<any>>(
        '/enrollment/applications',
        payload
      );
      return response;
    } catch (error: any) {
      if (error.status === 409 || error.code === 'DUPLICATE_APPLICATION') {
        return {
          success: false,
          error: {
            message: error.message || 'You already have a pending application.',
            code: 'DUPLICATE_APPLICATION',
            details: error.data || {},
          },
        };
      }
      return {
        success: false,
        error: {
          message: error.message || 'Failed to submit application',
          code: error.code || 'SUBMISSION_ERROR',
        },
      };
    }
  }

  // ============================================
  // VERIFY STUDENT NUMBER (Public)
  // ============================================
  async verifyStudentNumber(studentNumber: string): Promise<
    ApiResponse<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      middleName?: string;
      contactNumber?: string;
      isActive: boolean;
      existingEnrollment?: boolean;
      pendingApplicationNumber?: string;
    }>
  > {
    try {
      return await apiClient.get<ApiResponse<any>>(
        `/enrollment/verify-student/${encodeURIComponent(studentNumber)}`
      );
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Student number not found',
          code: error.code || 'NOT_FOUND',
        },
      };
    }
  }

  // ============================================
  // CHECK APPLICATION STATUS (Public)
  // ============================================
  async checkApplicationStatus(
    email: string
  ): Promise<ApiResponse<ApplicationStatusResponse[]>> {
    try {
      return await apiClient.get<ApiResponse<ApplicationStatusResponse[]>>(
        '/enrollment/applications/status',
        { email }
      );
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to check status',
          code: 'STATUS_CHECK_ERROR',
        },
      };
    }
  }

  // ============================================
  // GET APPLICATION BY NUMBER (Public)
  // ============================================
  async getApplicationByNumber(applicationNumber: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<ApiResponse<any>>(
        `/enrollment/applications/${applicationNumber}`
      );
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  // ============================================
  // GET ALL APPLICATIONS (Admin)
  // ============================================
  async getApplications(
    filters: EnrollmentFilters = {}
  ): Promise<ApiResponse<EnrollmentApplicationWithDetails[]>> {
    try {
      return await apiClient.get<ApiResponse<EnrollmentApplicationWithDetails[]>>(
        '/admin/enrollments',
        filters
      );
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  // ============================================
  // GET SINGLE APPLICATION (Admin)
  // ============================================
  async getApplication(
    id: string
  ): Promise<ApiResponse<EnrollmentApplicationWithDetails>> {
    try {
      return await apiClient.get<ApiResponse<EnrollmentApplicationWithDetails>>(
        `/admin/enrollments/${id}`
      );
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  // ============================================
  // UPDATE APPLICATION STATUS (Admin)
  // ============================================
  async updateApplicationStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<ApiResponse<EnrollmentApplication>> {
    try {
      return await apiClient.patch<ApiResponse<EnrollmentApplication>>(
        `/admin/enrollments/${id}/status`,
        { status, notes }
      );
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to update', code: 'UPDATE_ERROR' },
      };
    }
  }

  // ============================================
  // REQUEST CORRECTION (Admin)
  // ============================================
  async requestCorrection(
    id: string,
    notes: string
  ): Promise<ApiResponse<EnrollmentApplication>> {
    try {
      return await apiClient.patch<ApiResponse<EnrollmentApplication>>(
        `/admin/enrollments/${id}/request-correction`,
        { notes }
      );
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to request', code: 'REQUEST_ERROR' },
      };
    }
  }

  // ============================================
  // APPROVE APPLICATION (Admin)
  // ============================================
  async approveApplication(id: string): Promise<
    ApiResponse<{
      userId: string;
      email: string;
      studentNumber: string;
      password: string;
      createdNewUser: boolean;
      enrollmentType: EnrollmentType;
      isReturning: boolean;
    }>
  > {
    try {
      return await apiClient.post<
        ApiResponse<{
          userId: string;
          email: string;
          studentNumber: string;
          password: string;
          createdNewUser: boolean;
          enrollmentType: EnrollmentType;
          isReturning: boolean;
        }>
      >(`/admin/enrollments/${id}/approve`);
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to approve application',
          code: error.code || 'APPROVE_ERROR',
        },
      };
    }
  }

  // ============================================
  // GET APPLICATIONS BY ENROLLMENT TYPE (Admin)
  // ============================================
  async getApplicationsByType(
    type: EnrollmentType,
    filters: EnrollmentFilters = {}
  ): Promise<ApiResponse<EnrollmentApplicationWithDetails[]>> {
    try {
      return await apiClient.get<ApiResponse<EnrollmentApplicationWithDetails[]>>(
        '/admin/enrollments',
        { ...filters, enrollmentType: type }
      );
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || `Failed to fetch ${type} applications`,
          code: 'FETCH_ERROR',
        },
      };
    }
  }

  // ============================================
  // GET ENROLLMENT TYPE SUMMARY (Admin)
  // ============================================
  async getEnrollmentTypeSummary(
    academicYear?: string,
    semester?: number
  ): Promise<ApiResponse<EnrollmentTypeSummary[]>> {
    try {
      const response = await apiClient.get<ApiResponse<EnrollmentApplicationWithDetails[]>>(
        '/admin/enrollments',
        { academicYear, semester }
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          data: [],
          error: response.error || { message: 'No data', code: 'NO_DATA' },
        };
      }

      // Group applications by enrollment type
      const types: EnrollmentType[] = ['new', 'continuing', 'returnee', 'transferee'];
      const summary: EnrollmentTypeSummary[] = types.map((type) => ({
        type,
        label: this.getEnrollmentTypeLabel(type),
        count: response.data!.filter((app) => app.enrollment_type === type).length,
      }));

      return {
        success: true,
        data: summary,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to fetch summary',
          code: 'SUMMARY_ERROR',
        },
      };
    }
  }

  // ============================================
  // GET AVAILABLE SECTIONS (Public)
  // ============================================
  async getAvailableSections(
    programId?: string,
    yearLevelId?: string
  ): Promise<ApiResponse<any[]>> {
    try {
      return await apiClient.get<ApiResponse<any[]>>('/sections/available', {
        programId,
        yearLevelId,
      });
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }

  // ============================================
  // GET ENROLLMENT STATS (Admin)
  // ============================================
  async getEnrollmentStats(
    academicYear?: string,
    semester?: number
  ): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<ApiResponse<any>>('/admin/enrollments/stats', {
        academicYear,
        semester,
      });
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to fetch', code: 'FETCH_ERROR' },
      };
    }
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;