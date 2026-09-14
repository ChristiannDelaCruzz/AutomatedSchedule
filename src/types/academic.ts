// ============================================
// ACADEMIC STRUCTURE TYPES
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