// src/context/EnrollmentContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { enrollmentService } from '../services/enrollment.service';
import { useToast } from '../hooks/useToast';
import type { EnrollmentFilters } from '../types';
import type {
  EnrollmentApplication,
  EnrollmentApplicationWithDetails,
} from '../types/enrollment';

// ============================================
// CONTEXT TYPE
// ============================================
interface EnrollmentContextType {
  applications: EnrollmentApplicationWithDetails[];
  isLoading: boolean;
  fetchApplications: (filters?: EnrollmentFilters) => Promise<void>;
  getApplication: (id: string) => Promise<EnrollmentApplicationWithDetails | null>;
  getApplicationById: (id: string) => Promise<EnrollmentApplication | null>;
  updateStatus: (id: string, status: string, notes?: string) => Promise<void>;
  requestCorrection: (id: string, notes: string) => Promise<void>;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  // Derived stats by enrollment type
  newStudentCount: number;
  continuingCount: number;
  returneeCount: number;
  transfereeCount: number;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<EnrollmentApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // ============================================
  // FETCH APPLICATIONS
  // ============================================
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

  // ============================================
  // GET SINGLE APPLICATION (with details)
  // ============================================
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

  // ============================================
  // GET APPLICATION BY ID (base type only)
  // ============================================
  const getApplicationById = useCallback(
    async (id: string): Promise<EnrollmentApplication | null> => {
      try {
        const response = await enrollmentService.getApplication(id);
        if (response.success && response.data) {
          // Strip detail fields to return only the base type
          const { student, section, courses, ...baseApplication } = response.data;
          return baseApplication;
        }
        return null;
      } catch (error: any) {
        showToast('error', 'Failed to load application', error.message);
        return null;
      }
    },
    [showToast]
  );

  // ============================================
  // UPDATE STATUS
  // ============================================
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

  // ============================================
  // REQUEST CORRECTION
  // ============================================
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

  // ============================================
  // DERIVED COUNTS
  // ============================================
  const totalCount = applications.length;

  const pendingCount = applications.filter(
    (a) => a.status === 'under_review' || a.status === 'submitted'
  ).length;

  const approvedCount = applications.filter((a) => a.status === 'approved').length;

  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  // Counts by enrollment type
  const newStudentCount = applications.filter(
    (a) => a.enrollment_type === 'new'
  ).length;

  const continuingCount = applications.filter(
    (a) => a.enrollment_type === 'continuing'
  ).length;

  const returneeCount = applications.filter(
    (a) => a.enrollment_type === 'returnee'
  ).length;

  const transfereeCount = applications.filter(
    (a) => a.enrollment_type === 'transferee'
  ).length;

  // ============================================
  // PROVIDER VALUE
  // ============================================
  return (
    <EnrollmentContext.Provider
      value={{
        applications,
        isLoading,
        fetchApplications,
        getApplication,
        getApplicationById,
        updateStatus,
        requestCorrection,
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        newStudentCount,
        continuingCount,
        returneeCount,
        transfereeCount,
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

export default EnrollmentContext;