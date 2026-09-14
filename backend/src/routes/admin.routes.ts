// backend/src/routes/admin.routes.ts
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, isAdmin);

// Sections
router.get('/sections', adminController.getSections);
router.post('/sections', adminController.createSection);
router.put('/sections/:id', adminController.updateSection);

// Subjects
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);

// Professors
router.get('/professors', adminController.getProfessors);
router.post('/professors', adminController.createProfessor);

// Rooms
router.get('/rooms', adminController.getRooms);
router.post('/rooms', adminController.createRoom);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Enrollment approval
router.post('/enrollments/:id/approve', adminController.approveEnrollment);

// Sent emails
router.get('/emails', adminController.getSentEmails);

export default router;