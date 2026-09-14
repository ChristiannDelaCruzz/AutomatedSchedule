import { Router } from 'express';
import { schedulingController } from '../controllers/scheduling.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { validateScheduleGeneration } from '../middleware/validation';

const router = Router();

// All scheduling routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/scheduling/generate
 * @desc    Generate schedule automatically
 * @access  Admin only
 */
router.post(
  '/generate',
  isAdmin,
  validateScheduleGeneration,
  schedulingController.generateSchedule
);

/**
 * @route   GET /api/scheduling/versions
 * @desc    Get schedule versions
 * @access  Admin only
 */
router.get('/versions', isAdmin, schedulingController.getVersions);

/**
 * @route   GET /api/scheduling/section/:sectionId
 * @desc    Get schedules by section
 * @access  Admin, Professor, Student (own section)
 */
router.get('/section/:sectionId', schedulingController.getSectionSchedules);

/**
 * @route   GET /api/scheduling/professor/:professorId
 * @desc    Get schedules by professor
 * @access  Admin, Professor (own)
 */
router.get('/professor/:professorId', schedulingController.getProfessorSchedules);

/**
 * @route   GET /api/scheduling/conflicts
 * @desc    Get schedule conflicts
 * @access  Admin only
 */
router.get('/conflicts', isAdmin, schedulingController.getConflicts);

export default router;