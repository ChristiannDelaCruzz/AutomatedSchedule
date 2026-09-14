// ============================================
// CORE TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'superadmin' | 'admin' | 'staff' | 'professor' | 'student';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  date_of_birth?: string;
  contact_number?: string;
  address?: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'professor' | 'student';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface Program {
  id: string;
  department_id: string;                    // ← Changed from education_level_id
  name: string;
  code: string;
  description?: string;
  education_level_id: string;               // ← Added this
  total_years: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;                  // ← Added
  education_level?: EducationLevel;         // ← Added
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
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
}

export interface ProfessorQualification {
  id: string;
  professor_id: string;
  subject_id: string;
  qualification_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfessorAvailability {
  id: string;
  professor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  effective_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
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

export interface RoomAvailability {
  id: string;
  room_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  effective_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessorAssignment {
  id: string;
  professor_id: string;
  subject_id: string;
  section_id: string;
  academic_year: string;
  semester: 1 | 2;
  is_primary: boolean;
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
}

export interface ScheduleVersion {
  id: string;
  version_number: number;
  academic_year: string;
  semester: 1 | 2;
  generated_by?: string;
  generated_at: string;
  published_at?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  changes: any[];
  notes?: string;
  created_at: string;
}

export interface ExamSchedule {
  id: string;
  subject_id: string;
  section_id: string;
  room_id: string;
  proctor_id?: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  exam_type: 'prelim' | 'midterm' | 'final' | 'quiz' | 'special';
  number_of_students?: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'seminar' | 'meeting' | 'orientation' | 'academic' | 'sports' | 'cultural' | 'other';
  start_datetime: string;
  end_datetime: string;
  room_id?: string;
  organizer?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface ScheduleChangeRequest {
  id: string;
  professor_id: string;
  class_schedule_id: string;
  request_type: 'change_day' | 'change_time' | 'change_room' | 'change_professor' | 'swap';
  requested_day?: string;
  requested_start_time?: string;
  requested_end_time?: string;
  requested_room_id?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'alternative_suggested';
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'schedule' | 'enrollment' | 'exam' | 'announcement' | 'system' | 'request' | 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
  metadata: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
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

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'professor' | 'staff';
  contactNumber?: string;
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

// ============================================
// SCHEDULING ENGINE TYPES
// ============================================

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface BreakRule {
  day?: string;
  startTime: string;
  endTime: string;
  educationLevel?: string;
  isRecurring: boolean;
}

export interface SchedulerContext {
  section: Section;
  subjects: Subject[];
  assignments: ProfessorAssignment[];
  professors: Professor[];
  professorAvailability: ProfessorAvailability[];
  rooms: Room[];
  roomAvailability: RoomAvailability[];
  existingSchedules: ClassSchedule[];
  academicYear: string;
  semester: 1 | 2;
  schedulingDays: string[];
  timeSlots: TimeSlot[];
  breakRules: BreakRule[];
}

export interface AssignmentAttempt {
  subject: Subject;
  professor: Professor;
  room: Room;
  timeSlot: TimeSlot;
  section: Section;
}