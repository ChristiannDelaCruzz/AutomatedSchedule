// backend/src/routes/enrollment.routes.ts
import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================
// VERIFY STUDENT NUMBER (PUBLIC)
// ============================================
router.get('/verify-student/:studentNumber', async (req: Request, res: Response) => {
  try {
    const { studentNumber } = req.params;

    if (!studentNumber) {
      res.status(400).json({
        success: false,
        error: { message: 'Student number is required' },
      });
      return;
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, email, first_name, last_name, middle_name, contact_number, is_active, role, student_number'
      )
      .eq('student_number', studentNumber)
      .eq('role', 'student')
      .maybeSingle();

    if (error || !profile) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Student number not found. Please check and try again.',
          code: 'STUDENT_NOT_FOUND',
        },
      });
      return;
    }

    const { data: pendingEnrollment } = await supabaseAdmin
      .from('enrollment_applications')
      .select('id, application_number, status, academic_year, semester')
      .eq('student_id', profile.id)
      .in('status', ['submitted', 'under_review'])
      .maybeSingle();

    res.json({
      success: true,
      data: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        middleName: profile.middle_name,
        contactNumber: profile.contact_number,
        isActive: profile.is_active,
        existingEnrollment: !!pendingEnrollment,
        pendingApplicationNumber: pendingEnrollment?.application_number,
      },
    });
  } catch (error: any) {
    logger.error('Verify student number error', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Verification failed' },
    });
  }
});

// ============================================
// SUBMIT ENROLLMENT APPLICATION - PUBLIC
// ============================================
router.post('/applications', async (req: Request, res: Response) => {
  try {
    const { personalInfo, academicInfo, enrollmentType, previousStudentNumber } = req.body;

    logger.info('Enrollment application received', {
      email: personalInfo?.email,
      enrollmentType: enrollmentType || 'new',
      previousStudentNumber: previousStudentNumber || 'N/A',
    });

    // Validate
    if (!personalInfo?.firstName || !personalInfo?.lastName || !personalInfo?.email) {
      res.status(400).json({
        success: false,
        error: { message: 'Missing required personal information' },
      });
      return;
    }

    if (!academicInfo?.programId || !academicInfo?.yearLevelId || !academicInfo?.sectionId) {
      res.status(400).json({
        success: false,
        error: { message: 'Missing required academic information' },
      });
      return;
    }

    // Check for duplicate pending application by email
    const { data: allApps } = await supabaseAdmin
      .from('enrollment_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (allApps) {
      const existing = allApps.filter((app: any) => {
        try {
          const notes = JSON.parse(app.notes || '{}');
          return (
            notes.personalInfo?.email === personalInfo.email &&
            (app.status === 'submitted' || app.status === 'under_review')
          );
        } catch {
          return false;
        }
      });

      if (existing.length > 0) {
        res.status(409).json({
          success: false,
          error: {
            message: 'You already have a pending application',
            code: 'DUPLICATE_APPLICATION',
            data: { applicationNumber: existing[0].application_number },
          },
        });
        return;
      }
    }

    // Generate application number
    const applicationNumber = `APP-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // Insert
    const { data, error } = await supabaseAdmin
      .from('enrollment_applications')
      .insert({
        id: uuidv4(),
        student_id: null,
        section_id: academicInfo.sectionId,
        academic_year: academicInfo.academicYear || '2026-2027',
        semester: academicInfo.semester || 1,
        application_number: applicationNumber,
        status: 'submitted',
        enrollment_type: enrollmentType || 'new',
        previous_student_number: previousStudentNumber || null,
        submitted_at: new Date().toISOString(),
        notes: JSON.stringify({
          personalInfo: {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            middleName: personalInfo.middleName || '',
            dateOfBirth: personalInfo.dateOfBirth || '',
            contactNumber: personalInfo.contactNumber || '',
            email: personalInfo.email,
            address: personalInfo.address || '',
          },
          academicInfo: {
            departmentId: academicInfo.departmentId || '',
            programId: academicInfo.programId,
            yearLevelId: academicInfo.yearLevelId,
            semester: academicInfo.semester || 1,
            academicYear: academicInfo.academicYear || '2026-2027',
          },
        }),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to submit enrollment application', { error: error.message });
      res.status(500).json({
        success: false,
        error: { message: 'Failed to submit enrollment application' },
      });
      return;
    }

    logger.info('Enrollment application submitted', {
      applicationNumber: data.application_number,
      email: personalInfo.email,
      enrollmentType: enrollmentType || 'new',
    });

    // Notify admins
    await supabaseAdmin.from('notifications').insert({
      id: uuidv4(),
      user_id: null,
      title: 'New Enrollment Application',
      message: `New ${enrollmentType || 'new'} student application from ${personalInfo.firstName} ${personalInfo.lastName}`,
      type: 'enrollment',
      category: 'enrollment',
      metadata: {
        applicationId: data.id,
        applicationNumber: data.application_number,
        enrollmentType: enrollmentType || 'new',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        application: {
          id: data.id,
          applicationNumber: data.application_number,
          status: data.status,
          submittedAt: data.submitted_at,
        },
        message: 'Your enrollment application has been submitted successfully!',
      },
    });
  } catch (error: any) {
    logger.error('Unexpected error submitting enrollment', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' },
    });
  }
});

// ============================================
// CHECK APPLICATION STATUS - PUBLIC
// ============================================
router.get('/applications/status', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: { message: 'Email is required' },
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('enrollment_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch application status' },
      });
      return;
    }

    const applications =
      data?.filter((app: any) => {
        try {
          const notes = JSON.parse(app.notes || '{}');
          return notes.personalInfo?.email === email;
        } catch {
          return false;
        }
      }) || [];

    const formattedApps = applications.map((app: any) => {
      const notes = JSON.parse(app.notes || '{}');
      return {
        id: app.id,
        applicationNumber: app.application_number,
        status: app.status,
        submittedAt: app.submitted_at,
        firstName: notes.personalInfo?.firstName || '',
        lastName: notes.personalInfo?.lastName || '',
        programId: notes.academicInfo?.programId || '',
        semester: app.semester,
        academicYear: app.academic_year,
        enrollmentType: app.enrollment_type || 'new',
      };
    });

    res.json({ success: true, data: formattedApps });
  } catch (error: any) {
    logger.error('Unexpected error checking status', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' },
    });
  }
});

// ============================================
// GET APPLICATION BY NUMBER - PUBLIC
// ============================================
router.get('/applications/:applicationNumber', async (req: Request, res: Response) => {
  try {
    const { applicationNumber } = req.params;

    const { data, error } = await supabaseAdmin
      .from('enrollment_applications')
      .select('*')
      .eq('application_number', applicationNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          error: { message: 'Application not found' },
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch application' },
      });
      return;
    }

    const notes = JSON.parse(data.notes || '{}');

    res.json({
      success: true,
      data: {
        id: data.id,
        applicationNumber: data.application_number,
        status: data.status,
        enrollmentType: data.enrollment_type || 'new',
        submittedAt: data.submitted_at,
        personalInfo: notes.personalInfo || {},
        academicInfo: notes.academicInfo || {},
        sectionId: data.section_id,
        academicYear: data.academic_year,
        semester: data.semester,
      },
    });
  } catch (error: any) {
    logger.error('Unexpected error fetching application', { error: error.message });
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' },
    });
  }
});

export default router;