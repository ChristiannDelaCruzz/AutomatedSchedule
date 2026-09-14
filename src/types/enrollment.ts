// src/types/enrollment.ts

// ============================================
// ENROLLMENT APPLICATION TYPES
// ============================================

export type EnrollmentType = 'new' | 'continuing' | 'returnee' | 'transferee';

export interface EnrollmentTypeInfo {
  value: EnrollmentType;
  label: string;
  description: string;
  icon: string;
  color: string;
  requiresStudentNumber: boolean;
}

export const ENROLLMENT_TYPES: EnrollmentTypeInfo[] = [
  {
    value: 'new',
    label: 'New Student',
    description: 'First time enrolling in this institution',
    icon: 'GraduationCap',
    color: 'from-cyan-500 to-cyan-600',
    requiresStudentNumber: false,
  },
  {
    value: 'continuing',
    label: 'Continuing Student',
    description: 'Currently enrolled, moving to next semester',
    icon: 'ArrowRight',
    color: 'from-blue-500 to-blue-600',
    requiresStudentNumber: true,
  },
  {
    value: 'returnee',
    label: 'Returnee',
    description: 'Was enrolled before, took a break, now returning',
    icon: 'RotateCcw',
    color: 'from-amber-500 to-amber-600',
    requiresStudentNumber: true,
  },
  {
    value: 'transferee',
    label: 'Transferee',
    description: 'Transferring from another institution',
    icon: 'ArrowLeftRight',
    color: 'from-purple-500 to-purple-600',
    requiresStudentNumber: false,
  },
];

export interface EnrollmentApplication {
  id: string;
  student_id: string | null;
  section_id: string;
  academic_year: string;
  semester: 1 | 2;
  application_number: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'needs_correction'
    | 'approved'
    | 'rejected'
    | 'cancelled';
  enrollment_type?: EnrollmentType;
  previous_student_number?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentApplicationWithDetails extends EnrollmentApplication {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number?: string;
  };
  section?: {
    id: string;
    name: string;
    code: string;
    max_capacity: number;
    current_enrollment: number;
    year_levels?: {
      id: string;
      name: string;
      year_number: number;
      programs?: {
        id: string;
        name: string;
        code: string;
      };
    };
  };
  courses?: Array<{
    id: string;
    subject_id: string;
    is_approved: boolean;
    subject: {
      id: string;
      code: string;
      name: string;
      units: number;
      subject_type: string;
    };
  }>;
}

export interface EnrollmentFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
    address: string;
  };
  academicInfo: {
    departmentId?: string;
    programId: string;
    yearLevelId: string;
    academicYear?: string;
    semester: 1 | 2;
    sectionId: string;
  };
  enrollmentType?: EnrollmentType;
  previousStudentNumber?: string;
}

export interface SectionCapacity {
  id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_enrollment: number;
  remaining_slots: number;
  status: 'open' | 'full' | 'closed' | 'pending';
}

export interface EnrollmentFilters {
  status?: string;
  programId?: string;
  yearLevelId?: string;
  sectionId?: string;
  academicYear?: string;
  semester?: number;
  search?: string;
}