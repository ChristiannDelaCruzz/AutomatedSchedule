import { supabaseAdmin } from '../config/supabase';
import { SchedulingEngine } from '../engine/scheduler';
import {
  ScheduleGenerationRequest,
  ScheduleGenerationResult,
  Section,
  Subject,
  Professor,
  Room,
  ProfessorAvailability,
  RoomAvailability,
  ClassSchedule,
  ProfessorAssignment,
  SchedulerContext,
  TimeSlot,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export class SchedulingService {
  async generateSchedule(
    request: ScheduleGenerationRequest
  ): Promise<ScheduleGenerationResult> {
    logger.info('Starting schedule generation', {
      academicYear: request.academicYear,
      semester: request.semester,
    });

    try {
      // Fetch all necessary data
      const sections = await this.getSections(request);
      const allSubjects = await this.getSubjects();
      const professors = await this.getProfessors();
      const professorAvailability = await this.getProfessorAvailability();
      const rooms = await this.getRooms();
      const roomAvailability = await this.getRoomAvailability();
      const existingSchedules = await this.getExistingSchedules(request);

      // Get assignments
      const assignments = await this.getAssignments(request, sections);

      // Get break rules
      const breakRules = await this.getBreakRules();

      // Generate time slots
      const schedulingDays = await this.getSchedulingDays(request);
      const timeSlots = this.generateTimeSlots(schedulingDays);

      // Create schedule version
      const versionId = uuidv4();
      const versionNumber = await this.getNextVersionNumber(
        request.academicYear,
        request.semester
      );

      logger.info('Subjects loaded for scheduling', { 
        totalSubjects: allSubjects.length,
        sectionsCount: sections.length 
      });

      await supabaseAdmin.from('schedule_versions').insert({
        id: versionId,
        version_number: versionNumber,
        academic_year: request.academicYear,
        semester: request.semester,
        generated_by: null,
        status: 'draft',
      });

      // Process each section
      let allAssigned: ClassSchedule[] = [];
      let allConflicts: any[] = [];
      let allUnassigned: Array<{ subject: Subject; reason: string }> = [];

      for (const section of sections) {
        const sectionSubjects = await this.getSectionSubjects(
          section.id,
          request
        );
        const sectionAssignments = assignments.filter(
          (a) => a.section_id === section.id
        );

        const context: SchedulerContext = {
          section,
          subjects: sectionSubjects,
          assignments: sectionAssignments,
          professors,
          professorAvailability,
          rooms,
          roomAvailability,
          existingSchedules: existingSchedules.filter(
            (s) => s.section_id === section.id
          ),
          academicYear: request.academicYear,
          semester: request.semester,
          schedulingDays,
          timeSlots,
          breakRules,
        };

        const engine = new SchedulingEngine(context);
        const result = engine.generateSchedule();

        // Add version ID to schedules
        const schedulesWithVersion = result.assigned.map((s) => ({
          ...s,
          schedule_version: versionNumber,
        }));

        allAssigned = allAssigned.concat(schedulesWithVersion);
        allConflicts = allConflicts.concat(result.conflicts);
        allUnassigned = allUnassigned.concat(result.unassigned);
      }

      // Save schedules
      const savedSchedules = await this.saveSchedules(allAssigned);

      logger.info('Schedule generation completed', {
        versionId,
        totalGenerated: savedSchedules.length,
        totalConflicts: allConflicts.length,
        totalUnscheduled: allUnassigned.length,
      });

      // Return the result with proper typing
      const result: ScheduleGenerationResult = {
        success: allUnassigned.length === 0,
        scheduleVersionId: versionId,
        generatedSchedules: savedSchedules,
        conflicts: [],
        unscheduled: allUnassigned.map((u) => ({
          subjectId: u.subject.id,
          sectionId: u.subject.id,
          professorId: u.subject.id,
          reason: u.reason,
        })),
        summary: {
          totalClassesGenerated: savedSchedules.length,
          totalConflicts: allConflicts.length,
          totalUnscheduled: allUnassigned.length,
        },
      };

      return result;
    } catch (error) {
      logger.error('Schedule generation failed', { error });
      throw error;
    }
  }

  private async getSections(
    request: ScheduleGenerationRequest
  ): Promise<Section[]> {
    let query = supabaseAdmin
      .from('sections')
      .select('*')
      .eq('academic_year', request.academicYear)
      .eq('semester', request.semester)
      .eq('is_active', true);

    if (request.educationLevelId) {
      query = query.eq('year_levels.program_id.education_level_id', request.educationLevelId);
    }

    if (request.programId) {
      query = query.eq('year_levels.program_id', request.programId);
    }

    if (request.sectionIds && request.sectionIds.length > 0) {
      query = query.in('id', request.sectionIds);
    }

    const { data, error } = await query;
    if (error) {
      logger.error('Failed to fetch sections', { error: error.message });
      throw new Error('Failed to fetch sections');
    }

    return data || [];
  }

  private async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch subjects', { error: error.message });
      throw new Error('Failed to fetch subjects');
    }

    return data || [];
  }

  private async getProfessors(): Promise<Professor[]> {
    const { data, error } = await supabaseAdmin
      .from('professors')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch professors', { error: error.message });
      throw new Error('Failed to fetch professors');
    }

    return data || [];
  }

  private async getProfessorAvailability(): Promise<ProfessorAvailability[]> {
    const { data, error } = await supabaseAdmin
      .from('professor_availability')
      .select('*')
      .eq('is_recurring', true);

    if (error) {
      logger.error('Failed to fetch professor availability', { error: error.message });
      throw new Error('Failed to fetch professor availability');
    }

    return data || [];
  }

  private async getRooms(): Promise<Room[]> {
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch rooms', { error: error.message });
      throw new Error('Failed to fetch rooms');
    }

    return data || [];
  }

  private async getRoomAvailability(): Promise<RoomAvailability[]> {
    const { data, error } = await supabaseAdmin
      .from('room_availability')
      .select('*')
      .eq('is_recurring', true);

    if (error) {
      logger.error('Failed to fetch room availability', { error: error.message });
      throw new Error('Failed to fetch room availability');
    }

    return data || [];
  }

  private async getExistingSchedules(
    request: ScheduleGenerationRequest
  ): Promise<ClassSchedule[]> {
    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .select('*')
      .eq('academic_year', request.academicYear)
      .eq('semester', request.semester)
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch existing schedules', { error: error.message });
      throw new Error('Failed to fetch existing schedules');
    }

    return data || [];
  }

  private async getAssignments(
    request: ScheduleGenerationRequest,
    sections: Section[]
  ): Promise<ProfessorAssignment[]> {
    const sectionIds = sections.map((s) => s.id);

    const { data, error } = await supabaseAdmin
      .from('professor_assignments')
      .select('*')
      .eq('academic_year', request.academicYear)
      .eq('semester', request.semester)
      .eq('is_active', true)
      .in('section_id', sectionIds);

    if (error) {
      logger.error('Failed to fetch assignments', { error: error.message });
      throw new Error('Failed to fetch assignments');
    }

    return data || [];
  }

  private async getSectionSubjects(
    sectionId: string,
    request: ScheduleGenerationRequest
  ): Promise<Subject[]> {
    const { data: yearLevelData, error: yearLevelError } = await supabaseAdmin
      .from('sections')
      .select('year_level_id')
      .eq('id', sectionId)
      .single();

    if (yearLevelError) {
      logger.error('Failed to fetch section year level', { error: yearLevelError.message });
      throw new Error('Failed to fetch section year level');
    }

    const { data, error } = await supabaseAdmin
      .from('curriculum_courses')
      .select(`
        subject_id,
        subjects:subject_id (
          id,
          code,
          name,
          description,
          units,
          subject_type,
          required_hours,
          room_type_required,
          prerequisites,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('curriculum.year_level_id', yearLevelData.year_level_id)
      .eq('curriculum.semester', request.semester)
      .eq('curriculum.academic_year', request.academicYear);

    if (error) {
      logger.error('Failed to fetch section subjects', { error: error.message });
      throw new Error('Failed to fetch section subjects');
    }

    // Properly extract subjects from the nested structure
    const subjects: Subject[] = data
      ?.map((item: any) => item.subjects)
      .filter((subject: any) => subject !== null && subject !== undefined) || [];

    return subjects;
  }

  private async getSchedulingDays(
    request: ScheduleGenerationRequest
  ): Promise<string[]> {
    let query = supabaseAdmin
      .from('education_levels')
      .select('scheduling_days');

    if (request.educationLevelId) {
      query = query.eq('id', request.educationLevelId);
    } else {
      query = query.eq('code', 'COL');
    }

    const { data, error } = await query.single();

    if (error) {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }

    return data.scheduling_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  private async getBreakRules(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'break_rules')
      .single();

    if (error) return [];
    return data?.setting_value || [];
  }

  private generateTimeSlots(days: string[]): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const interval = 30;
    const startHour = 7;
    const endHour = 21;

    for (const day of days) {
      let currentHour = startHour;
      let currentMinute = 0;

      while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
        const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}:00`;

        let endHourCalc = currentHour + 3;
        let endMinute = currentMinute;

        if (endMinute > 0) {
          endHourCalc += Math.floor(endMinute / 60);
          endMinute = endMinute % 60;
        }

        const endTime = `${String(endHourCalc).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

        if (endHourCalc <= endHour) {
          slots.push({
            day,
            startTime,
            endTime,
            duration: 3,
          });
        }

        currentMinute += interval;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    }

    return slots;
  }

  private async saveSchedules(schedules: ClassSchedule[]): Promise<ClassSchedule[]> {
    if (schedules.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from('class_schedules')
      .insert(schedules)
      .select();

    if (error) {
      logger.error('Failed to save schedules', { error: error.message });
      throw new Error('Failed to save schedules');
    }

    return data || [];
  }

  private async getNextVersionNumber(
    academicYear: string,
    semester: number
  ): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('schedule_versions')
      .select('version_number')
      .eq('academic_year', academicYear)
      .eq('semester', semester)
      .order('version_number', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Failed to get next version number', { error: error.message });
      throw new Error('Failed to get next version number');
    }

    return data && data.length > 0 ? data[0].version_number + 1 : 1;
  }
}