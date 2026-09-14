// src/services/section.service.ts
import apiClient from './api';
import type { ApiResponse, Section } from '../types';

export interface SectionFilters {
  academicYear?: string;
  semester?: number;
  programId?: string;
  yearLevelId?: string;
}

export interface CreateSectionInput {
  yearLevelId: string;
  name: string;
  code: string;
  maxCapacity: number;
  academicYear: string;
  semester: number;
  preferredRooms?: string[];
  eligibleRooms?: string[];
}

export interface UpdateSectionInput extends Partial<CreateSectionInput> {
  id: string;
}

class SectionService {
  async getSections(filters: SectionFilters = {}): Promise<ApiResponse<Section[]>> {
    try {
      return await apiClient.get<ApiResponse<Section[]>>('/admin/sections', filters);
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: { message: error.message || 'Failed to fetch sections', code: 'FETCH_ERROR' },
      };
    }
  }

  async createSection(data: CreateSectionInput): Promise<ApiResponse<Section>> {
    try {
      return await apiClient.post<ApiResponse<Section>>('/admin/sections', data);
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to create section', code: 'CREATE_ERROR' },
      };
    }
  }

  async updateSection(data: UpdateSectionInput): Promise<ApiResponse<Section>> {
    try {
      const { id, ...updates } = data;
      return await apiClient.put<ApiResponse<Section>>(`/admin/sections/${id}`, updates);
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to update section', code: 'UPDATE_ERROR' },
      };
    }
  }

  async deleteSection(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/admin/sections/${id}`);
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.message || 'Failed to delete section', code: 'DELETE_ERROR' },
      };
    }
  }
}

export const sectionService = new SectionService();
export default sectionService;