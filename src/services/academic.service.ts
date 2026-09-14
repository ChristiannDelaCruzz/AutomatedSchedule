// src/services/academic.service.ts
import apiClient from './api';
import type { ApiResponse } from '../types';
import type { Department, Program, EducationLevel, YearLevel, SectionWithDetails } from '../types';

class AcademicService {
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    try {
      const response = await apiClient.get<any>('/academic/departments');
      console.log('🔍 Raw response from API:', response);
      
      // Check if response is already an array
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      // Check if response has a data property that is an array
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      // Check if response has success and data
      if (response && response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      // If we get here, something is wrong
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      console.error('❌ academic.service: Error:', error);
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load departments',
          code: 'DEPARTMENTS_FETCH_ERROR',
        },
      };
    }
  }

  async getProgramsByDepartment(departmentId: string): Promise<ApiResponse<Program[]>> {
    try {
      const response = await apiClient.get<any>(`/academic/departments/${departmentId}/programs`);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load programs',
          code: 'PROGRAMS_FETCH_ERROR',
        },
      };
    }
  }

  async getPrograms(filters?: {
    departmentId?: string;
    educationLevelId?: string;
    status?: string;
  }): Promise<ApiResponse<Program[]>> {
    try {
      const response = await apiClient.get<any>('/academic/programs', filters);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load programs',
          code: 'PROGRAMS_FETCH_ERROR',
        },
      };
    }
  }

  async getEducationLevels(): Promise<ApiResponse<EducationLevel[]>> {
    try {
      const response = await apiClient.get<any>('/academic/education-levels');
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load education levels',
          code: 'EDUCATION_LEVELS_FETCH_ERROR',
        },
      };
    }
  }

  async getYearLevels(programId: string): Promise<ApiResponse<YearLevel[]>> {
    try {
      const response = await apiClient.get<any>(`/academic/programs/${programId}/year-levels`);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load year levels',
          code: 'YEAR_LEVELS_FETCH_ERROR',
        },
      };
    }
  }

  async getSections(filters: {
    programId?: string;
    yearLevelId?: string;
    academicYear?: string;
    semester?: number;
  }): Promise<ApiResponse<SectionWithDetails[]>> {
    try {
      const response = await apiClient.get<any>('/academic/sections', filters);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load sections',
          code: 'SECTIONS_FETCH_ERROR',
        },
      };
    }
  }

  async getSemesterCurriculum(
    yearLevelId: string,
    semester: number,
    academicYear: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        `/academic/year-levels/${yearLevelId}/curriculum`,
        { semester, academicYear }
      );
      
      // For curriculum, it returns a single object or null
      if (response && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      if (response && !Array.isArray(response) && typeof response === 'object') {
        return {
          success: true,
          data: response,
        };
      }
      
      return {
        success: false,
        data: null,
        error: {
          message: 'No curriculum found',
          code: 'CURRICULUM_NOT_FOUND',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message || 'Failed to load curriculum',
          code: 'CURRICULUM_FETCH_ERROR',
        },
      };
    }
  }

  async getCurriculumCourses(curriculumId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any>(`/academic/curriculum/${curriculumId}/courses`);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
        };
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      }
      
      return {
        success: false,
        data: [],
        error: {
          message: 'Invalid response format',
          code: 'INVALID_RESPONSE',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: {
          message: error.message || 'Failed to load courses',
          code: 'COURSES_FETCH_ERROR',
        },
      };
    }
  }
}

export const academicService = new AcademicService();
export default academicService;