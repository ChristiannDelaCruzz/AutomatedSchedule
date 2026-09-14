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

class EnrollmentService {
  /**
   * Submit enrollment application (Public)
   */
  async submitApplication(data: EnrollmentFormData): Promise<ApiResponse<any>> {
    try {
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
        enrollmentType: data.enrollmentType || 'new',
        previousStudentNumber: data.previousStudentNumber || null,
      };

      const response = await apiClient.post<ApiResponse<any>>('/enrollment/applications', payload);
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

  /**
   * Verify student number (Public)
   */
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

  /**
   * Check application status by email (Public)
   */
  async checkApplicationStatus(email: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<ApiResponse<any>>('/enrollment/applications/status', { email });
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to check status', code: 'STATUS_CHECK_ERROR' },
      };
    }
  }

  /**
   * Get application by number (Public)
   */
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

  /**
   * Get all applications (Admin)
   */
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

  /**
   * Get single application (Admin)
   */
  async getApplication(id: string): Promise<ApiResponse<EnrollmentApplicationWithDetails>> {
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

  /**
   * Update application status (Admin)
   */
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

  /**
   * Request correction (Admin)
   */
  async requestCorrection(id: string, notes: string): Promise<ApiResponse<EnrollmentApplication>> {
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

  /**
   * Approve enrollment application (Admin)
   * Creates user account + generates credentials
   */
  async approveApplication(id: string): Promise<
    ApiResponse<{
      userId: string;
      email: string;
      studentNumber: string;
      password: string;
      createdNewUser: boolean;
      enrollmentType: string;
      isReturning: boolean;
    }>
  > {
    try {
      return await apiClient.post<ApiResponse<any>>(`/admin/enrollments/${id}/approve`);
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

  /**
   * Get available sections (Public)
   */
  async getAvailableSections(programId?: string, yearLevelId?: string): Promise<ApiResponse<any[]>> {
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

  /**
   * Get enrollment stats (Admin)
   */
  async getEnrollmentStats(academicYear?: string, semester?: number): Promise<ApiResponse<any>> {
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