// src/types/index.ts

// ============================================
// AUTH TYPES
// ============================================

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'professor' | 'student';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'professor' | 'staff';
  contactNumber?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ============================================
// TOAST TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type BadgeType = 'notifications' | 'messages' | 'requests' | 'conflicts';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  badge?: BadgeType;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

// ============================================
// SCHEDULING TYPES
// ============================================

export interface Section {
  id: string;
  year_level_id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_enrollment: number;
  status: 'active' | 'full' | 'closed' | 'archived';
  academic_year: string;
  semester: 1 | 2;
  preferred_rooms: string[];
  eligible_rooms: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  year_levels?: {
    id: string;
    name: string;
    year_number: number;
    programs: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  units: number;
  subject_type: 'lecture' | 'laboratory' | 'lecture_lab';
  required_hours: number;
  room_type_required: string;
  prerequisites: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professor {
  id: string;
  user_id: string;
  employee_id: string;
  specialization?: string;
  educational_attainment?: string;
  years_of_experience?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Room {
  id: string;
  room_number: string;
  building: string;
  floor?: number;
  room_type: 'classroom' | 'computer_laboratory' | 'science_laboratory' | 'lecture_hall' | 'auditorium' | 'conference_room';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  has_aircon: boolean;
  has_projector: boolean;
  has_computers: boolean;
  additional_equipment: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: string;
  assignment_id: string;
  room_id: string;
  section_id: string;
  professor_id: string;
  subject_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  academic_year: string;
  semester: 1 | 2;
  schedule_version: number;
  status: 'draft' | 'validated' | 'published' | 'conflict' | 'modified';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subjects?: Subject;
  professors?: Professor;
  rooms?: Room;
  sections?: Section;
}

export interface ScheduleGenerationRequest {
  academicYear: string;
  semester: 1 | 2;
  educationLevelId?: string;
  programId?: string;
  sectionIds?: string[];
  constraints: {
    checkProfessorConflicts: boolean;
    checkSectionConflicts: boolean;
    checkRoomConflicts: boolean;
    checkAvailability: boolean;
    checkQualifications: boolean;
    checkCapacity: boolean;
    checkBreaks: boolean;
  };
}

export interface ScheduleGenerationResult {
  success: boolean;
  scheduleVersionId: string;
  generatedSchedules: ClassSchedule[];
  conflicts: Conflict[];
  unscheduled: Array<{
    subjectId: string;
    sectionId: string;
    professorId: string;
    reason: string;
  }>;
  summary: {
    totalClassesGenerated: number;
    totalConflicts: number;
    totalUnscheduled: number;
  };
}

export interface Conflict {
  type: 'professor' | 'section' | 'room' | 'exam' | 'event' | 'availability' | 'capacity' | 'qualification';
  description: string;
  affectedEntities: {
    scheduleId?: string;
    professorId?: string;
    sectionId?: string;
    roomId?: string;
    subjectId?: string;
  };
  suggestedAlternatives?: Array<{
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    roomId?: string;
  }>;
}

export interface DashboardStats {
  activeSections: number;
  subjects: number;
  assignedProfessors: number;
  availableRooms: number;
  scheduledClasses: number;
  detectedConflicts: number;
  academicYear: string;
  semester: number;
}

// ============================================
// ENROLLMENT TYPES
// ============================================

export interface EnrollmentApplication {
  id: string;
  student_id: string;
  section_id: string;
  academic_year: string;
  semester: 1 | 2;
  application_number: string;
  status: 'draft' | 'submitted' | 'under_review' | 'needs_correction' | 'approved' | 'rejected' | 'cancelled';
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentApplicationWithDetails extends EnrollmentApplication {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number?: string;
  };
  section: {
    id: string;
    name: string;
    code: string;
    max_capacity: number;
    current_enrollment: number;
    year_levels: {
      id: string;
      name: string;
      year_number: number;
      programs: {
        id: string;
        name: string;
        code: string;
      };
    };
  };
  courses: Array<{
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

// ============================================
// ACADEMIC TYPES (Department, Program, Education Level)
// ============================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description?: string;
  education_level_id: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  department?: Department;
  education_level?: EducationLevel;
}

export interface EducationLevel {
  id: string;
  name: string;
  code: string;
  description?: string;
  scheduling_days: string[];
  start_time: string;
  end_time: string;
  has_fixed_breaks: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface YearLevel {
  id: string;
  program_id: string;
  year_number: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SemesterCurriculum {
  id: string;
  year_level_id: string;
  semester: 1 | 2;
  academic_year: string;
  name: string;
  description?: string;
  total_units: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurriculumCourse {
  id: string;
  curriculum_id: string;
  subject_id: string;
  is_required: boolean;
  created_at: string;
}

export interface SectionWithDetails {
  id: string;
  year_level_id: string;
  name: string;
  code: string;
  max_capacity: number;
  current_enrollment: number;
  status: 'active' | 'full' | 'closed' | 'archived';
  academic_year: string;
  semester: 1 | 2;
  preferred_rooms: string[];
  eligible_rooms: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}