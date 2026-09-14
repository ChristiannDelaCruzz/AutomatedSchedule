import { Request, Response } from 'express';
import { SchedulingService } from '../services/scheduling.service';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { supabaseAdmin } from '../config/supabase';

const schedulingService = new SchedulingService();

export class SchedulingController {
  /**
   * Generate schedule automatically
   * POST /api/scheduling/generate
   */
  generateSchedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      academicYear,
      semester,
      educationLevelId,
      programId,
      sectionIds,
      constraints,
    } = req.body;

    const result = await schedulingService.generateSchedule({
      academicYear,
      semester,
      educationLevelId,
      programId,
      sectionIds,
      constraints: constraints || {
        checkProfessorConflicts: true,
        checkSectionConflicts: true,
        checkRoomConflicts: true,
        checkAvailability: true,
        checkQualifications: true,
        checkCapacity: true,
        checkBreaks: true,
      },
    });

    logger.info('Schedule generated', {
      versionId: result.scheduleVersionId,
      userId: req.user?.id,
      summary: result.summary,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get schedule versions
   * GET /api/scheduling/versions
   */
  getVersions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { academicYear, semester } = req.query;

    let query = supabaseAdmin
      .from('schedule_versions')
      .select(`
        *,
        profiles:generated_by (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (academicYear) query = query.eq('academic_year', academicYear);
    if (semester) query = query.eq('semester', Number(semester));

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch schedule versions', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch schedule versions' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  });

  /**
   * Get schedules by section
   * GET /api/scheduling/section/:sectionId
   */
  getSectionSchedules = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sectionId } = req.params;
    const { academicYear, semester } = req.query;

    let query = supabaseAdmin
      .from('class_schedules')
      .select(`
        *,
        subjects:subject_id (*),
        professors:professor_id (
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        ),
        rooms:room_id (*)
      `)
      .eq('section_id', sectionId)
      .eq('is_active', true);

    if (academicYear) query = query.eq('academic_year', academicYear);
    if (semester) query = query.eq('semester', Number(semester));

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch section schedules', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch section schedules' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  });

  /**
   * Get schedules by professor
   * GET /api/scheduling/professor/:professorId
   */
  getProfessorSchedules = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { professorId } = req.params;
    const { academicYear, semester } = req.query;

    let query = supabaseAdmin
      .from('class_schedules')
      .select(`
        *,
        subjects:subject_id (*),
        sections:section_id (
          *,
          year_levels:year_level_id (
            *,
            programs:program_id (*)
          )
        ),
        rooms:room_id (*)
      `)
      .eq('professor_id', professorId)
      .eq('is_active', true);

    if (academicYear) query = query.eq('academic_year', academicYear);
    if (semester) query = query.eq('semester', Number(semester));

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to fetch professor schedules', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch professor schedules' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  });

  /**
   * Get schedule conflicts
   * GET /api/scheduling/conflicts
   */
  getConflicts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { academicYear, semester } = req.query;

    if (!academicYear || !semester) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Academic year and semester are required',
          code: 'MISSING_FIELDS',
        },
      });
      return;
    }

    const { data: schedules, error } = await supabaseAdmin
      .from('class_schedules')
      .select('*')
      .eq('academic_year', academicYear)
      .eq('semester', Number(semester))
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to fetch schedules for conflict detection', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch schedules' },
      });
      return;
    }

    const conflicts: any[] = [];

    for (const schedule of schedules || []) {
      // Check professor conflicts
      const professorConflicts = schedules?.filter(
        (s: any) =>
          s.id !== schedule.id &&
          s.professor_id === schedule.professor_id &&
          s.day_of_week === schedule.day_of_week &&
          this.areTimesOverlapping(
            s.start_time,
            s.end_time,
            schedule.start_time,
            schedule.end_time
          )
      );

      if (professorConflicts && professorConflicts.length > 0) {
        conflicts.push({
          type: 'professor_conflict',
          scheduleId: schedule.id,
          professorId: schedule.professor_id,
          subjectId: schedule.subject_id,
          sectionId: schedule.section_id,
          conflictingSchedules: professorConflicts.map((s: any) => s.id),
        });
      }

      // Check room conflicts
      const roomConflicts = schedules?.filter(
        (s: any) =>
          s.id !== schedule.id &&
          s.room_id === schedule.room_id &&
          s.day_of_week === schedule.day_of_week &&
          this.areTimesOverlapping(
            s.start_time,
            s.end_time,
            schedule.start_time,
            schedule.end_time
          )
      );

      if (roomConflicts && roomConflicts.length > 0) {
        conflicts.push({
          type: 'room_conflict',
          scheduleId: schedule.id,
          roomId: schedule.room_id,
          subjectId: schedule.subject_id,
          sectionId: schedule.section_id,
          conflictingSchedules: roomConflicts.map((s: any) => s.id),
        });
      }

      // Check section conflicts
      const sectionConflicts = schedules?.filter(
        (s: any) =>
          s.id !== schedule.id &&
          s.section_id === schedule.section_id &&
          s.day_of_week === schedule.day_of_week &&
          this.areTimesOverlapping(
            s.start_time,
            s.end_time,
            schedule.start_time,
            schedule.end_time
          )
      );

      if (sectionConflicts && sectionConflicts.length > 0) {
        conflicts.push({
          type: 'section_conflict',
          scheduleId: schedule.id,
          sectionId: schedule.section_id,
          subjectId: schedule.subject_id,
          conflictingSchedules: sectionConflicts.map((s: any) => s.id),
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalConflicts: conflicts.length,
        conflicts,
      },
    });
  });

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
}

export const schedulingController = new SchedulingController();