// backend/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { enrollmentService } from '../services/enrollment.service';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AdminController {

  // ============================================
  // ENROLLMENT APPROVAL
  // ============================================
  approveEnrollment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
        return;
      }

      const result = await enrollmentService.approveApplication(id, req.user.id);

      logger.info('Enrollment approved', {
        applicationId: id,
        studentNumber: result.studentNumber,
        enrollmentType: result.enrollmentType,
        approvedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.isReturning
          ? `Welcome back! ${result.studentNumber} is now enrolled.`
          : `Approved! Student number: ${result.studentNumber}. Credentials emailed to ${result.email}.`,
      });
    } catch (error: any) {
      logger.error('Failed to approve enrollment', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to approve application' },
      });
    }
  });

  // ============================================
  // SENT EMAILS
  // ============================================
  getSentEmails = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      res.status(200).json({ success: true, data: data || [] });
    } catch (error: any) {
      logger.error('Failed to fetch sent emails', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch emails' },
      });
    }
  });
  // ============================================
  // SECTION MANAGEMENT
  // ============================================

  getSections = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { academicYear, semester, programId, yearLevelId } = req.query;

      let query = supabaseAdmin
        .from('sections')
        .select(`
          *,
          year_levels:year_level_id (
            *,
            programs:program_id (*)
          )
        `)
        .eq('is_active', true);

      if (academicYear) query = query.eq('academic_year', academicYear);
      if (semester) query = query.eq('semester', Number(semester));
      if (programId) query = query.eq('year_levels.program_id', programId);
      if (yearLevelId) query = query.eq('year_level_id', yearLevelId);

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch sections', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch sections' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (error: any) {
      logger.error('Error in getSections:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch sections' },
      });
    }
  });

  createSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        yearLevelId,
        name,
        code,
        maxCapacity,
        academicYear,
        semester,
        preferredRooms,
        eligibleRooms,
      } = req.body;

      if (!yearLevelId || !name || !code || !academicYear || !semester) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'MISSING_FIELDS',
            details: { required: ['yearLevelId', 'name', 'code', 'academicYear', 'semester'] },
          },
        });
        return;
      }

      const section = {
        id: uuidv4(),
        year_level_id: yearLevelId,
        name,
        code,
        max_capacity: maxCapacity || 45,
        current_enrollment: 0,
        status: 'active',
        academic_year: academicYear,
        semester,
        preferred_rooms: preferredRooms || [],
        eligible_rooms: eligibleRooms || [],
        is_active: true,
      };

      const { data, error } = await supabaseAdmin
        .from('sections')
        .insert(section)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create section', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to create section' },
        });
        return;
      }

      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user?.id,
        user_role: req.user?.role,
        action: 'SECTION_CREATED',
        entity_type: 'section',
        entity_id: data.id,
        new_values: data,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      logger.info('Section created', {
        sectionId: data.id,
        code: data.code,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error in createSection:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create section' },
      });
    }
  });

  updateSection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: oldData, error: oldError } = await supabaseAdmin
        .from('sections')
        .select('*')
        .eq('id', id)
        .single();

      if (oldError || !oldData) {
        throw new NotFoundError('Section');
      }

      const { data, error } = await supabaseAdmin
        .from('sections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update section', { error: error.message, sectionId: id });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to update section' },
        });
        return;
      }

      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user?.id,
        user_role: req.user?.role,
        action: 'SECTION_UPDATED',
        entity_type: 'section',
        entity_id: id,
        old_values: oldData,
        new_values: data,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      logger.info('Section updated', {
        sectionId: id,
        userId: req.user?.id,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error in updateSection:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update section' },
      });
    }
  });

  // ============================================
  // SUBJECT MANAGEMENT
  // ============================================

  getSubjects = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.query;

      let query = supabaseAdmin.from('subjects').select('*');

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive === 'true');
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Failed to fetch subjects', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch subjects' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (error: any) {
      logger.error('Error in getSubjects:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch subjects' },
      });
    }
  });

  createSubject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        code,
        name,
        description,
        units,
        subjectType,
        requiredHours,
        roomTypeRequired,
        prerequisites,
      } = req.body;

      if (!code || !name || units === undefined) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'MISSING_FIELDS',
            details: { required: ['code', 'name', 'units'] },
          },
        });
        return;
      }

      const subject = {
        id: uuidv4(),
        code,
        name,
        description,
        units,
        subject_type: subjectType || 'lecture',
        required_hours: requiredHours || 3,
        room_type_required: roomTypeRequired || 'classroom',
        prerequisites: prerequisites || [],
        is_active: true,
      };

      const { data, error } = await supabaseAdmin
        .from('subjects')
        .insert(subject)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create subject', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to create subject' },
        });
        return;
      }

      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user?.id,
        user_role: req.user?.role,
        action: 'SUBJECT_CREATED',
        entity_type: 'subject',
        entity_id: data.id,
        new_values: data,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      logger.info('Subject created', {
        subjectId: data.id,
        code: data.code,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error in createSubject:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create subject' },
      });
    }
  });

  // ============================================
  // PROFESSOR MANAGEMENT
  // ============================================

  getProfessors = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('professors')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (error) {
        logger.error('Failed to fetch professors', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch professors' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (error: any) {
      logger.error('Error in getProfessors:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch professors' },
      });
    }
  });

  createProfessor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, employeeId, specialization, educationalAttainment, yearsOfExperience } =
        req.body;

      if (!userId || !employeeId) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'MISSING_FIELDS',
            details: { required: ['userId', 'employeeId'] },
          },
        });
        return;
      }

      const professor = {
        id: uuidv4(),
        user_id: userId,
        employee_id: employeeId,
        specialization,
        educational_attainment: educationalAttainment,
        years_of_experience: yearsOfExperience,
        is_active: true,
      };

      const { data, error } = await supabaseAdmin
        .from('professors')
        .insert(professor)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create professor', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to create professor' },
        });
        return;
      }

      await supabaseAdmin
        .from('profiles')
        .update({ role: 'professor' })
        .eq('id', userId);

      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user?.id,
        user_role: req.user?.role,
        action: 'PROFESSOR_CREATED',
        entity_type: 'professor',
        entity_id: data.id,
        new_values: data,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      logger.info('Professor created', {
        professorId: data.id,
        employeeId: data.employee_id,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error in createProfessor:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create professor' },
      });
    }
  });

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  getRooms = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('is_active', true);

      if (error) {
        logger.error('Failed to fetch rooms', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch rooms' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: data || [],
      });
    } catch (error: any) {
      logger.error('Error in getRooms:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch rooms' },
      });
    }
  });

  createRoom = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        roomNumber,
        building,
        floor,
        roomType,
        capacity,
        hasAircon,
        hasProjector,
        hasComputers,
        additionalEquipment,
      } = req.body;

      if (!roomNumber || !building || !roomType || !capacity) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'MISSING_FIELDS',
            details: { required: ['roomNumber', 'building', 'roomType', 'capacity'] },
          },
        });
        return;
      }

      const room = {
        id: uuidv4(),
        room_number: roomNumber,
        building,
        floor,
        room_type: roomType,
        capacity,
        status: 'available',
        has_aircon: hasAircon || false,
        has_projector: hasProjector || false,
        has_computers: hasComputers || false,
        additional_equipment: additionalEquipment || [],
        is_active: true,
      };

      const { data, error } = await supabaseAdmin
        .from('rooms')
        .insert(room)
        .select()
        .single();

      if (error) {
        logger.error('Failed to create room', { error: error.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to create room' },
        });
        return;
      }

      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user?.id,
        user_role: req.user?.role,
        action: 'ROOM_CREATED',
        entity_type: 'room',
        entity_id: data.id,
        new_values: data,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      logger.info('Room created', {
        roomId: data.id,
        roomNumber: data.room_number,
        userId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error in createRoom:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create room' },
      });
    }
  });

  // ============================================
  // DASHBOARD STATISTICS (FULL)
  // ============================================

  getDashboardStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { academicYear, semester } = req.query;

      const year = (academicYear as string) || '2026-2027';
      const sem = Number(semester) || 1;

      // ============================================
      // 1. Get all counts in parallel
      // ============================================
      const [
        sectionsResult,
        subjectsResult,
        professorsResult,
        roomsResult,
        scheduledResult,
        conflictsResult,
      ] = await Promise.all([
        supabaseAdmin
          .from('sections')
          .select('*', { count: 'exact', head: true })
          .eq('academic_year', year)
          .eq('semester', sem)
          .eq('is_active', true),

        supabaseAdmin
          .from('subjects')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        supabaseAdmin
          .from('professors')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        supabaseAdmin
          .from('rooms')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        supabaseAdmin
          .from('class_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('academic_year', year)
          .eq('semester', sem)
          .eq('is_active', true),

        supabaseAdmin
          .from('class_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('academic_year', year)
          .eq('semester', sem)
          .eq('status', 'conflict'),
      ]);

      // ============================================
      // 2. Get schedule distribution by day
      // ============================================
      const { data: schedulesByDay, error: dayError } = await supabaseAdmin
        .from('class_schedules')
        .select('day_of_week')
        .eq('academic_year', year)
        .eq('semester', sem)
        .eq('is_active', true);

      if (dayError) throw dayError;

      const dayCount: Record<string, number> = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };

      schedulesByDay?.forEach((s: any) => {
        if (s.day_of_week && dayCount[s.day_of_week] !== undefined) {
          dayCount[s.day_of_week]++;
        }
      });

      // ============================================
      // 3. Get schedule status breakdown
      // ============================================
      const { data: statusData, error: statusError } = await supabaseAdmin
        .from('class_schedules')
        .select('status')
        .eq('academic_year', year)
        .eq('semester', sem)
        .eq('is_active', true);

      if (statusError) throw statusError;

      const statusCounts: Record<string, number> = {
        draft: 0,
        validated: 0,
        published: 0,
        conflict: 0,
        modified: 0,
      };

      statusData?.forEach((s: any) => {
        if (statusCounts[s.status] !== undefined) {
          statusCounts[s.status]++;
        }
      });

      // ============================================
      // 4. Get recent activity from audit logs
      // ============================================
      const { data: recentActivity, error: activityError } = await supabaseAdmin
        .from('audit_logs')
        .select(`
          id,
          action,
          entity_type,
          user_id,
          created_at,
          user_role
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) {
        logger.warn('Failed to fetch recent activity', { error: activityError.message });
      }

      // Fetch user names for activity
      const userIds = recentActivity
        ?.map((a: any) => a.user_id)
        .filter(Boolean) || [];

      const { data: profiles } = userIds.length > 0
        ? await supabaseAdmin
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds)
        : { data: [] };

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, `${p.first_name} ${p.last_name}`])
      );

      // ============================================
      // 5. Build the response
      // ============================================
      res.status(200).json({
        success: true,
        data: {
          stats: {
            activeSections: sectionsResult.count || 0,
            subjects: subjectsResult.count || 0,
            assignedProfessors: professorsResult.count || 0,
            availableRooms: roomsResult.count || 0,
            scheduledClasses: scheduledResult.count || 0,
            detectedConflicts: conflictsResult.count || 0,
          },
          weeklyDistribution: [
            { day: 'Mon', value: dayCount.Monday, fullDay: 'Monday' },
            { day: 'Tue', value: dayCount.Tuesday, fullDay: 'Tuesday' },
            { day: 'Wed', value: dayCount.Wednesday, fullDay: 'Wednesday' },
            { day: 'Thu', value: dayCount.Thursday, fullDay: 'Thursday' },
            { day: 'Fri', value: dayCount.Friday, fullDay: 'Friday' },
            { day: 'Sat', value: dayCount.Saturday, fullDay: 'Saturday' },
          ],
          scheduleStatus: {
            generated: statusCounts.draft + statusCounts.validated,
            published: statusCounts.published,
            pendingReview: statusCounts.modified,
            withConflicts: statusCounts.conflict,
            total:
              statusCounts.draft +
              statusCounts.validated +
              statusCounts.published +
              statusCounts.conflict +
              statusCounts.modified,
          },
          recentActivity: (recentActivity || []).map((a: any) => ({
            id: a.id,
            user: profileMap.get(a.user_id) || 'System',
            action: this.formatAction(a.action, a.entity_type),
            time: a.created_at,
            status: this.getActivityStatus(a.action),
          })),
          academicYear: year,
          semester: sem,
        },
      });
    } catch (error: any) {
      logger.error('Error in getDashboardStats:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch dashboard stats' },
      });
    }
  });

  // ============================================
  // HELPER METHODS
  // ============================================

  private formatAction(action: string, _entityType: string): string {
    const actionMap: Record<string, string> = {
      SECTION_CREATED: 'created a new section',
      SECTION_UPDATED: 'updated a section',
      SUBJECT_CREATED: 'added a new subject',
      PROFESSOR_CREATED: 'added a new professor',
      ROOM_CREATED: 'added a new room',
      SCHEDULE_GENERATED: 'generated a schedule',
      SCHEDULE_PUBLISHED: 'published a schedule',
      SCHEDULE_MODIFIED: 'modified a schedule',
      ENROLLMENT_APPROVED: 'approved an enrollment',
      ENROLLMENT_REJECTED: 'rejected an enrollment',
    };

    return actionMap[action] || action.toLowerCase().replace(/_/g, ' ');
  }

  private getActivityStatus(action: string): 'completed' | 'pending' | 'conflict' {
    if (action.includes('CONFLICT')) return 'conflict';
    if (action.includes('PENDING') || action.includes('REQUEST')) return 'pending';
    return 'completed';
  }
}

export const adminController = new AdminController();