// src/context/EnrollmentContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { enrollmentService } from '../services/enrollment.service';
import { useToast } from '../hooks/useToast';
import type { 
  EnrollmentApplication,        // ← This is imported but needs to be used
  EnrollmentApplicationWithDetails, 
  EnrollmentFilters 
} from '../types';

interface EnrollmentContextType {
  applications: EnrollmentApplicationWithDetails[];
  isLoading: boolean;
  fetchApplications: (filters?: EnrollmentFilters) => Promise<void>;
  getApplication: (id: string) => Promise<EnrollmentApplicationWithDetails | null>;
  updateStatus: (id: string, status: string, notes?: string) => Promise<void>;
  requestCorrection: (id: string, notes: string) => Promise<void>;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  // Add a method that uses EnrollmentApplication
  getApplicationById: (id: string) => Promise<EnrollmentApplication | null>;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<EnrollmentApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const fetchApplications = useCallback(
    async (filters: EnrollmentFilters = {}) => {
      setIsLoading(true);
      try {
        const response = await enrollmentService.getApplications(filters);
        if (response.success && response.data) {
          setApplications(response.data);
        }
      } catch (error: any) {
        showToast('error', 'Failed to load applications', error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const getApplication = useCallback(
    async (id: string): Promise<EnrollmentApplicationWithDetails | null> => {
      try {
        const response = await enrollmentService.getApplication(id);
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      } catch (error: any) {
        showToast('error', 'Failed to load application', error.message);
        return null;
      }
    },
    [showToast]
  );

  // NEW: Method that uses EnrollmentApplication type
  const getApplicationById = useCallback(
    async (id: string): Promise<EnrollmentApplication | null> => {
      try {
        const response = await enrollmentService.getApplication(id);
        if (response.success && response.data) {
          // Return only the base EnrollmentApplication data
          const { student, section, courses, ...baseApplication } = response.data;
          return baseApplication as EnrollmentApplication;
        }
        return null;
      } catch (error: any) {
        showToast('error', 'Failed to load application', error.message);
        return null;
      }
    },
    [showToast]
  );

  const updateStatus = useCallback(
    async (id: string, status: string, notes?: string) => {
      try {
        const response = await enrollmentService.updateApplicationStatus(id, status, notes);
        if (response.success) {
          showToast('success', 'Application updated', `Status changed to ${status}`);
          await fetchApplications();
        }
      } catch (error: any) {
        showToast('error', 'Failed to update application', error.message);
        throw error;
      }
    },
    [fetchApplications, showToast]
  );

  const requestCorrection = useCallback(
    async (id: string, notes: string) => {
      try {
        const response = await enrollmentService.requestCorrection(id, notes);
        if (response.success) {
          showToast('success', 'Correction requested', 'Student has been notified');
          await fetchApplications();
        }
      } catch (error: any) {
        showToast('error', 'Failed to request correction', error.message);
        throw error;
      }
    },
    [fetchApplications, showToast]
  );

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'under_review' || a.status === 'submitted').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  return (
    <EnrollmentContext.Provider
      value={{
        applications,
        isLoading,
        fetchApplications,
        getApplication,
        getApplicationById,  // ← Add the new method
        updateStatus,
        requestCorrection,
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
}