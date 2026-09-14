import {
  Section,
  Subject,
  Professor,
  Room,
  ProfessorAvailability,
  RoomAvailability,
  ClassSchedule,
  ProfessorAssignment,
  TimeSlot,
  BreakRule,
} from '../types';

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

export interface Conflict {
  type: 'professor_conflict' | 'section_conflict' | 'room_conflict' | 'availability_conflict' | 'qualification_conflict' | 'capacity_conflict' | 'break_conflict';
  description: string;
  assignment?: AssignmentAttempt;
  conflictingAssignment?: ClassSchedule;
}

export interface SchedulingResult {
  assigned: ClassSchedule[];
  conflicts: Conflict[];
  unassigned: Array<{
    subject: Subject;
    reason: string;
  }>;
}