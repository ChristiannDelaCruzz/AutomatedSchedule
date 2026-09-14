import {
  SchedulerContext,
  SchedulingResult,
  Conflict,
} from './types';
import {
  Section,
  TimeSlot,
  Subject,
  Professor,
  Room,
  ClassSchedule,
  ProfessorAssignment,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SchedulingEngine {
  private context: SchedulerContext;
  private assignedSchedules: ClassSchedule[] = [];
  private conflicts: Conflict[] = [];
  private unassigned: Array<{ subject: Subject; reason: string }> = [];

  constructor(context: SchedulerContext) {
    this.context = context;
    this.assignedSchedules = [];
    this.conflicts = [];
    this.unassigned = [];
  }

  public generateSchedule(): SchedulingResult {
    const section = this.context.section;
    const subjects = this.context.subjects;
    const assignments = this.context.assignments;

    // Filter subjects that have assignments
    const assignedSubjects = subjects.filter((subject: Subject) =>
      assignments.some((ass: ProfessorAssignment) => ass.subject_id === subject.id)
    );

    // Sort subjects by priority (lab first, then lectures)
    const sortedSubjects = this.prioritizeSubjects(assignedSubjects);

    // For each subject, find the best schedule
    for (const subject of sortedSubjects) {
      const assignment = assignments.find((a: ProfessorAssignment) => a.subject_id === subject.id);
      if (!assignment) {
        this.unassigned.push({
          subject,
          reason: 'No professor assignment found',
        });
        continue;
      }

      const professor = this.context.professors.find(
        (p: Professor) => p.id === assignment.professor_id
      );
      if (!professor) {
        this.unassigned.push({
          subject,
          reason: `Professor not found for assignment ${assignment.id}`,
        });
        continue;
      }

      // Find eligible rooms for this section
      const eligibleRooms = this.getEligibleRooms(section, subject);
      if (eligibleRooms.length === 0) {
        this.unassigned.push({
          subject,
          reason: `No eligible rooms found for section ${section.name}`,
        });
        continue;
      }

      // Find the best time slot and room
      const result = this.findBestSlot(
        subject,
        professor,
        section,
        eligibleRooms,
        this.context.timeSlots
      );

      if (result) {
        const schedule: ClassSchedule = {
          id: uuidv4(),
          assignment_id: assignment.id,
          room_id: result.room.id,
          section_id: section.id,
          professor_id: professor.id,
          subject_id: subject.id,
          day_of_week: result.timeSlot.day,
          start_time: result.timeSlot.startTime,
          end_time: result.timeSlot.endTime,
          academic_year: this.context.academicYear,
          semester: this.context.semester,
          schedule_version: 1,
          status: 'draft',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        this.assignedSchedules.push(schedule);
      } else {
        this.unassigned.push({
          subject,
          reason: 'No valid time slot or room found',
        });
      }
    }

    return {
      assigned: this.assignedSchedules,
      conflicts: this.conflicts,
      unassigned: this.unassigned,
    };
  }

  private prioritizeSubjects(subjects: Subject[]): Subject[] {
    const priority = {
      laboratory: 0,
      lecture_lab: 1,
      lecture: 2,
    };

    return subjects.sort((a: Subject, b: Subject) => {
      return priority[a.subject_type] - priority[b.subject_type];
    });
  }

  private getEligibleRooms(section: Section, subject: Subject): Room[] {
    const eligibleRoomIds = section.eligible_rooms || [];
    const preferredRoomIds = section.preferred_rooms || [];

    let rooms = this.context.rooms.filter((room: Room) => {
      const isEligible =
        eligibleRoomIds.length === 0 || eligibleRoomIds.includes(room.id);

      let meetsRequirement = true;
      if (subject.room_type_required) {
        if (subject.room_type_required === 'computer_laboratory' && room.room_type !== 'computer_laboratory') {
          meetsRequirement = false;
        } else if (subject.room_type_required === 'science_laboratory' && room.room_type !== 'science_laboratory') {
          meetsRequirement = false;
        }
      }

      const hasCapacity = room.capacity >= section.max_capacity;
      const isAvailable = room.status === 'available';

      return isEligible && meetsRequirement && hasCapacity && isAvailable;
    });

    rooms = rooms.sort((a: Room, b: Room) => {
      const aIsPreferred = preferredRoomIds.includes(a.id);
      const bIsPreferred = preferredRoomIds.includes(b.id);

      if (aIsPreferred && !bIsPreferred) return -1;
      if (!aIsPreferred && bIsPreferred) return 1;
      return 0;
    });

    return rooms;
  }

  private findBestSlot(
    subject: Subject,
    professor: Professor,
    section: Section,
    rooms: Room[],
    timeSlots: TimeSlot[]
  ): { professor: Professor; room: Room; timeSlot: TimeSlot } | null {
    const professorAvail = this.context.professorAvailability.filter(
      (a: any) => a.professor_id === professor.id
    );

    const roomAvail = this.context.roomAvailability;

    // Shuffle time slots to distribute load evenly
    const shuffledSlots = this.shuffleArray([...timeSlots]);

    for (const timeSlot of shuffledSlots) {
      // Check if professor is available
      const isProfAvailable = this.isProfessorAvailable(
        professor.id,
        timeSlot,
        professorAvail
      );
      if (!isProfAvailable) continue;

      // Check professor conflict
      const hasProfConflict = this.hasProfessorConflict(professor.id, timeSlot);
      if (hasProfConflict) continue;

      // Check section conflict
      const hasSectionConflict = this.hasSectionConflict(section.id, timeSlot);
      if (hasSectionConflict) continue;

      // Try each room
      for (const room of rooms) {
        const isRoomAvailable = this.isRoomAvailable(room.id, timeSlot, roomAvail);
        if (!isRoomAvailable) continue;

        const hasRoomConflict = this.hasRoomConflict(room.id, timeSlot);
        if (hasRoomConflict) continue;

        const meetsRequirements = this.roomMeetsRequirements(room, subject);
        if (!meetsRequirements) continue;

        return {
          professor,
          room,
          timeSlot,
        };
      }
    }

    return null;
  }

  private isProfessorAvailable(
    professorIdParam: string,
    timeSlot: TimeSlot,
    availability: any[]
  ): boolean {
    const avail = availability.find((a: any) => a.day_of_week === timeSlot.day);
    if (!avail) return false;

    const slotStart = new Date(`2000-01-01T${timeSlot.startTime}`);
    const slotEnd = new Date(`2000-01-01T${timeSlot.endTime}`);
    const availStart = new Date(`2000-01-01T${avail.start_time}`);
    const availEnd = new Date(`2000-01-01T${avail.end_time}`);

    // Use professorIdParam to verify it's the right professor
    if (avail.professor_id !== professorIdParam) return false;

    return slotStart >= availStart && slotEnd <= availEnd;
  }

  private isRoomAvailable(
    roomId: string,
    timeSlot: TimeSlot,
    availability: any[]
  ): boolean {
    const avail = availability.find(
      (a: any) => a.room_id === roomId && a.day_of_week === timeSlot.day
    );
    if (!avail) return false;

    const slotStart = new Date(`2000-01-01T${timeSlot.startTime}`);
    const slotEnd = new Date(`2000-01-01T${timeSlot.endTime}`);
    const availStart = new Date(`2000-01-01T${avail.start_time}`);
    const availEnd = new Date(`2000-01-01T${avail.end_time}`);

    return slotStart >= availStart && slotEnd <= availEnd;
  }

  private hasProfessorConflict(professorIdParam: string, timeSlot: TimeSlot): boolean {
    const conflict = this.assignedSchedules.find(
      (schedule: ClassSchedule) =>
        schedule.professor_id === professorIdParam &&
        schedule.day_of_week === timeSlot.day &&
        this.areTimesOverlapping(
          schedule.start_time,
          schedule.end_time,
          timeSlot.startTime,
          timeSlot.endTime
        )
    );

    if (conflict) {
      this.conflicts.push({
        type: 'professor_conflict',
        description: `Professor has a conflict on ${timeSlot.day} at ${timeSlot.startTime}-${timeSlot.endTime}`,
        conflictingAssignment: conflict,
      });
    }

    return !!conflict;
  }

  private hasSectionConflict(sectionId: string, timeSlot: TimeSlot): boolean {
    const conflict = this.assignedSchedules.find(
      (schedule: ClassSchedule) =>
        schedule.section_id === sectionId &&
        schedule.day_of_week === timeSlot.day &&
        this.areTimesOverlapping(
          schedule.start_time,
          schedule.end_time,
          timeSlot.startTime,
          timeSlot.endTime
        )
    );

    if (conflict) {
      this.conflicts.push({
        type: 'section_conflict',
        description: `Section has a conflict on ${timeSlot.day} at ${timeSlot.startTime}-${timeSlot.endTime}`,
        conflictingAssignment: conflict,
      });
    }

    return !!conflict;
  }

  private hasRoomConflict(roomId: string, timeSlot: TimeSlot): boolean {
    const conflict = this.assignedSchedules.find(
      (schedule: ClassSchedule) =>
        schedule.room_id === roomId &&
        schedule.day_of_week === timeSlot.day &&
        this.areTimesOverlapping(
          schedule.start_time,
          schedule.end_time,
          timeSlot.startTime,
          timeSlot.endTime
        )
    );

    if (conflict) {
      this.conflicts.push({
        type: 'room_conflict',
        description: `Room has a conflict on ${timeSlot.day} at ${timeSlot.startTime}-${timeSlot.endTime}`,
        conflictingAssignment: conflict,
      });
    }

    return !!conflict;
  }

  private roomMeetsRequirements(room: Room, subject: Subject): boolean {
    // Check capacity
    if (room.capacity < this.context.section.max_capacity) {
      this.conflicts.push({
        type: 'capacity_conflict',
        description: `Room ${room.room_number} capacity (${room.capacity}) is insufficient for section ${this.context.section.name} (${this.context.section.max_capacity} students)`,
      });
      return false;
    }

    // Check room type
    if (subject.room_type_required) {
      let roomTypeMatches = false;

      switch (subject.room_type_required) {
        case 'computer_laboratory':
          roomTypeMatches = room.room_type === 'computer_laboratory';
          break;
        case 'science_laboratory':
          roomTypeMatches = room.room_type === 'science_laboratory';
          break;
        case 'classroom':
          roomTypeMatches = room.room_type === 'classroom' || room.room_type === 'lecture_hall';
          break;
        default:
          roomTypeMatches = true;
      }

      if (!roomTypeMatches) {
        this.conflicts.push({
          type: 'qualification_conflict',
          description: `Room ${room.room_number} does not meet subject requirement for ${subject.room_type_required}`,
        });
        return false;
      }
    }

    return true;
  }

  private areTimesOverlapping(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = new Date(`2000-01-01T${start1}`);
    const e1 = new Date(`2000-01-01T${end1}`);
    const s2 = new Date(`2000-01-01T${start2}`);
    const e2 = new Date(`2000-01-01T${end2}`);

    return s1 < e2 && s2 < e1;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}