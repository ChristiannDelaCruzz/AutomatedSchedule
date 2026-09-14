// backend/src/routes/academic.routes.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

const router = Router();

// ============================================
// TEST ENDPOINT
// ============================================
router.get('/test', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Academic routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// GET ALL DEPARTMENTS
// ============================================
router.get('/departments', async (_req: Request, res: Response) => {
  try {
    logger.info('Fetching departments...');
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      logger.error('Error fetching departments:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch departments: ' + error.message }
      });
      return;
    }

    logger.info('Departments fetched successfully', { count: data?.length || 0 });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching departments:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET PROGRAMS BY DEPARTMENT
// ============================================
router.get('/departments/:departmentId/programs', async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;

    logger.info('Fetching programs for department:', { departmentId });

    // Check if department exists
    const { error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('id', departmentId)
      .single();

    if (deptError) {
      logger.error('Department not found:', { departmentId, error: deptError.message });
      res.status(404).json({
        success: false,
        error: { message: 'Department not found' }
      });
      return;
    }

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('department_id', departmentId)
      .eq('status', 'active')
      .order('name');

    if (error) {
      logger.error('Error fetching programs:', { error: error.message, departmentId });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch programs: ' + error.message }
      });
      return;
    }

    logger.info('Programs fetched successfully', { 
      count: data?.length || 0, 
      departmentId
    });

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching programs:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET ALL PROGRAMS
// ============================================
router.get('/programs', async (req: Request, res: Response) => {
  try {
    const { departmentId, educationLevelId, status } = req.query;
    
    let query = supabase
      .from('programs')
      .select('*');

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (educationLevelId) {
      query = query.eq('education_level_id', educationLevelId);
    }
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('name');

    if (error) {
      logger.error('Error fetching programs:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch programs: ' + error.message }
      });
      return;
    }

    logger.info('All programs fetched successfully', { count: data?.length || 0 });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching programs:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET EDUCATION LEVELS
// ============================================
router.get('/education-levels', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('education_levels')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('Error fetching education levels:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch education levels: ' + error.message }
      });
      return;
    }

    logger.info('Education levels fetched successfully', { count: data?.length || 0 });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching education levels:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET YEAR LEVELS BY PROGRAM
// ============================================
router.get('/programs/:programId/year-levels', async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;

    logger.info('Fetching year levels for program:', { programId });

    // Check if program exists
    const { error: programError } = await supabase
      .from('programs')
      .select('id')
      .eq('id', programId)
      .single();

    if (programError) {
      logger.error('Program not found:', { programId, error: programError.message });
      res.status(404).json({
        success: false,
        error: { message: 'Program not found' }
      });
      return;
    }

    const { data, error } = await supabase
      .from('year_levels')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('year_number');

    if (error) {
      logger.error('Error fetching year levels:', { error: error.message, programId });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch year levels: ' + error.message }
      });
      return;
    }

    logger.info('Year levels fetched successfully', { 
      count: data?.length || 0, 
      programId
    });

    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching year levels:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET SECTIONS
// ============================================
router.get('/sections', async (req: Request, res: Response) => {
  try {
    const { programId, yearLevelId, academicYear, semester } = req.query;
    
    let query = supabase
      .from('sections')
      .select('*')
      .eq('is_active', true);

    if (yearLevelId) {
      query = query.eq('year_level_id', yearLevelId);
    }
    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }
    if (semester) {
      query = query.eq('semester', parseInt(semester as string));
    }

    if (programId) {
      const { data: yearLevelData, error: yearLevelError } = await supabase
        .from('year_levels')
        .select('id')
        .eq('program_id', programId);
      
      if (yearLevelError) {
        logger.error('Error fetching year levels for sections:', { error: yearLevelError.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch year levels' }
        });
        return;
      }

      if (yearLevelData && yearLevelData.length > 0) {
        const yearLevelIds = yearLevelData.map(yl => yl.id);
        query = query.in('year_level_id', yearLevelIds);
      } else {
        res.json({ success: true, data: [] });
        return;
      }
    }

    const { data, error } = await query.order('name');

    if (error) {
      logger.error('Error fetching sections:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch sections: ' + error.message }
      });
      return;
    }

    logger.info('Sections fetched successfully', { count: data?.length || 0 });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching sections:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET AVAILABLE SECTIONS
// ============================================
router.get('/sections/available', async (req: Request, res: Response) => {
  try {
    const { programId, yearLevelId, academicYear, semester } = req.query;

    let query = supabase
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .eq('status', 'active');

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }
    if (semester) {
      query = query.eq('semester', parseInt(semester as string));
    }
    if (yearLevelId) {
      query = query.eq('year_level_id', yearLevelId);
    }

    if (programId) {
      const { data: yearLevelData, error: yearLevelError } = await supabase
        .from('year_levels')
        .select('id')
        .eq('program_id', programId);
      
      if (yearLevelError) {
        logger.error('Error fetching year levels for available sections:', { error: yearLevelError.message });
        res.status(500).json({
          success: false,
          error: { message: 'Failed to fetch year levels' }
        });
        return;
      }

      if (yearLevelData && yearLevelData.length > 0) {
        const yearLevelIds = yearLevelData.map(yl => yl.id);
        query = query.in('year_level_id', yearLevelIds);
      } else {
        res.json({ success: true, data: [] });
        return;
      }
    }

    // Only get sections with available capacity
    query = query.filter('current_enrollment', 'lt', 'max_capacity');

    const { data, error } = await query.order('name');

    if (error) {
      logger.error('Error fetching available sections:', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch available sections: ' + error.message }
      });
      return;
    }

    logger.info('Available sections fetched successfully', { count: data?.length || 0 });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching available sections:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET SEMESTER CURRICULUM
// ============================================
router.get('/year-levels/:yearLevelId/curriculum', async (req: Request, res: Response) => {
  try {
    const { yearLevelId } = req.params;
    const { semester, academicYear } = req.query;

    logger.info('Fetching curriculum:', { yearLevelId, semester, academicYear });

    const { data, error } = await supabase
      .from('semester_curricula')
      .select('*')
      .eq('year_level_id', yearLevelId)
      .eq('semester', parseInt(semester as string))
      .eq('academic_year', academicYear as string)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching curriculum:', { error: error.message, yearLevelId });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch curriculum: ' + error.message }
      });
      return;
    }

    logger.info('Curriculum fetched successfully', { yearLevelId, semester, academicYear });
    res.json({ success: true, data: data || null });
  } catch (error: any) {
    logger.error('Unexpected error fetching curriculum:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

// ============================================
// GET CURRICULUM COURSES
// ============================================
router.get('/curriculum/:curriculumId/courses', async (req: Request, res: Response) => {
  try {
    const { curriculumId } = req.params;

    logger.info('Fetching curriculum courses:', { curriculumId });

    const { data, error } = await supabase
      .from('curriculum_courses')
      .select(`
        *,
        subject:subject_id (
          id,
          code,
          name,
          units,
          type,
          description
        )
      `)
      .eq('curriculum_id', curriculumId);

    if (error) {
      logger.error('Error fetching curriculum courses:', { error: error.message, curriculumId });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch curriculum courses: ' + error.message }
      });
      return;
    }

    logger.info('Curriculum courses fetched successfully', { count: data?.length || 0, curriculumId });
    res.json({ success: true, data: data || [] });
  } catch (error: any) {
    logger.error('Unexpected error fetching curriculum courses:', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    });
  }
});

export default router;