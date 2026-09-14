// backend/src/services/enrollment.service.ts
import { supabaseAdmin } from '../config/supabase';
import { notificationService } from './notification.service';
import { generateStudentNumber } from '../utils/studentNumber';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface ApproveResult {
  userId: string;
  email: string;
  studentNumber: string;
  password: string;
  createdNewUser: boolean;
  enrollmentType: string;
  isReturning: boolean;
}

export class EnrollmentService {
  /**
   * Approve an enrollment application and handle based on enrollment type
   */
  async approveApplication(
    applicationId: string,
    reviewedBy: string
  ): Promise<ApproveResult> {
    try {
      // ============================================
      // 1. Fetch application
      // ============================================
      const { data: application, error: appError } = await supabaseAdmin
        .from('enrollment_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError || !application) {
        throw new Error('Application not found');
      }

      if (application.status === 'approved') {
        throw new Error('Application is already approved');
      }

      // ============================================
      // 2. Parse personal info
      // ============================================
      const notes = JSON.parse(application.notes || '{}');
      const { personalInfo } = notes;

      if (!personalInfo?.email) {
        throw new Error('Application is missing an email address');
      }

      const email = personalInfo.email;
      const firstName = personalInfo.firstName || '';
      const lastName = personalInfo.lastName || '';
      const middleName = personalInfo.middleName || '';
      const contactNumber = personalInfo.contactNumber || '';

      // ============================================
      // 3. Determine enrollment type
      // ============================================
      const enrollmentType = application.enrollment_type || 'new';
      const previousStudentNumber = application.previous_student_number;

      logger.info('Processing enrollment approval', {
        applicationId,
        enrollmentType,
        previousStudentNumber: previousStudentNumber || 'N/A',
      });

      let userId: string;
      let studentNumber: string;
      let password: string;
      let createdNewUser = false;
      let isReturning = false;

      // ============================================
      // 4. HANDLE BY TYPE
      // ============================================
      if (enrollmentType === 'continuing' || enrollmentType === 'returnee') {
        // ============================================
        // CONTINUING / RETURnee — use existing account
        // ============================================
        if (!previousStudentNumber) {
          throw new Error(
            `${enrollmentType} enrollment requires a previous student number`
          );
        }

        const { data: existingProfile, error: findError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, student_number, is_active')
          .eq('student_number', previousStudentNumber)
          .eq('role', 'student')
          .maybeSingle();

        if (findError || !existingProfile) {
          throw new Error(
            `Student number ${previousStudentNumber} not found in our records`
          );
        }

        userId = existingProfile.id;
        studentNumber = existingProfile.student_number;
        isReturning = true;
        password = studentNumber;

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            role: 'student',
            student_number: studentNumber,
          },
        });

        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'student',
            is_active: true,
            student_number: studentNumber,
            temp_password: password,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        logger.info(`${enrollmentType} enrollment approved`, {
          userId,
          email,
          studentNumber,
        });
      } else {
        // ============================================
        // NEW / TRANSFEREE
        // ============================================
        const { data: existingByEmail } = await supabaseAdmin
          .from('profiles')
          .select('id, email, student_number')
          .eq('email', email)
          .maybeSingle();

        if (existingByEmail) {
          userId = existingByEmail.id;

          const generated = await generateStudentNumber();
          studentNumber = existingByEmail.student_number || generated.studentNumber;
          password = studentNumber;
          isReturning = true;

          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              role: 'student',
              student_number: studentNumber,
            },
          });

          await supabaseAdmin
            .from('profiles')
            .update({
              student_number: studentNumber,
              temp_password: password,
              role: 'student',
              is_active: true,
            })
            .eq('id', userId);
        } else {
          // ============================================
          // BRAND NEW ACCOUNT
          // ============================================
          const generated = await generateStudentNumber();
          studentNumber = generated.studentNumber;
          password = generated.password;

          const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: {
                first_name: firstName,
                last_name: lastName,
                role: 'student',
                student_number: studentNumber,
              },
            });

          if (authError || !authData.user) {
            logger.error('Failed to create auth user', { error: authError?.message });
            throw new Error(
              'Failed to create user account: ' + (authError?.message || 'Unknown')
            );
          }

          userId = authData.user.id;
          createdNewUser = true;

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: userId,
              email,
              first_name: firstName,
              last_name: lastName,
              middle_name: middleName,
              contact_number: contactNumber,
              role: 'student',
              is_active: true,
              student_number: studentNumber,
              temp_password: password,
              must_change_password: false,
            });

          if (profileError) {
            logger.error('Failed to create profile', { error: profileError.message });
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error('Failed to create user profile');
          }

          logger.info('New student account created', {
            userId,
            email,
            studentNumber,
          });
        }
      }

      // ============================================
      // 5. Update application status
      // ============================================
      const { error: updateError } = await supabaseAdmin
        .from('enrollment_applications')
        .update({
          status: 'approved',
          student_id: userId,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (updateError) {
        throw new Error('Failed to update application');
      }

      // ============================================
      // 6. Increment section enrollment
      // ============================================
      const { data: section } = await supabaseAdmin
        .from('sections')
        .select('current_enrollment, max_capacity')
        .eq('id', application.section_id)
        .single();

      if (section) {
        const newCount = (section.current_enrollment || 0) + 1;
        const newStatus = newCount >= section.max_capacity ? 'full' : 'active';

        await supabaseAdmin
          .from('sections')
          .update({
            current_enrollment: newCount,
            status: newStatus,
          })
          .eq('id', application.section_id);
      }

      // ============================================
      // 7. In-app notification
      // ============================================
      try {
        await notificationService.create({
          userId,
          title: isReturning ? '🎉 Welcome Back!' : '🎉 Enrollment Approved!',
          message: isReturning
            ? `You are now enrolled for ${application.academic_year}. Log in with your existing credentials.`
            : `Your student number is ${studentNumber}. Check your email for login credentials.`,
          type: 'success',
          category: 'enrollment',
          actionUrl: '/dashboard',
        });
      } catch (notifError: any) {
        logger.warn('Failed to create notification', { error: notifError.message });
      }

      // ============================================
      // 8. Send email
      // ============================================
      if (isReturning) {
        await this.sendWelcomeBackEmail({
          to: email,
          firstName,
          lastName,
          studentNumber,
          applicationNumber: application.application_number,
          academicYear: application.academic_year,
          semester: application.semester,
          enrollmentType,
        });
      } else {
        await this.sendCredentialsEmail({
          to: email,
          firstName,
          lastName,
          studentNumber,
          password,
          applicationNumber: application.application_number,
        });
      }

      // ============================================
      // 9. Audit log
      // ============================================
      await supabaseAdmin.from('audit_logs').insert({
        user_id: reviewedBy,
        action: 'ENROLLMENT_APPROVED',
        entity_type: 'enrollment_application',
        entity_id: applicationId,
        new_values: {
          status: 'approved',
          student_id: userId,
          student_number: studentNumber,
          enrollment_type: enrollmentType,
        },
      });

      logger.info('Enrollment approved successfully', {
        applicationId,
        enrollmentType,
        userId,
        studentNumber,
        isReturning,
        createdNewUser,
      });

      return {
        userId,
        email,
        studentNumber,
        password,
        createdNewUser,
        enrollmentType,
        isReturning,
      };
    } catch (error: any) {
      logger.error('Failed to approve enrollment', {
        error: error.message,
        applicationId,
      });
      throw error;
    }
  }

  // ============================================
  // EMAIL: NEW STUDENT CREDENTIALS
  // ============================================
  private async sendCredentialsEmail(params: {
    to: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    password: string;
    applicationNumber: string;
  }) {
    const { to, firstName, lastName, studentNumber, password, applicationNumber } = params;
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const bodyHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Enrollment Approved</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#155E75 0%,#06B6D4 100%);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">🎓 Welcome to SchedulePro</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Your enrollment has been approved</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 16px;color:#0F172A;font-size:16px;font-weight:600;">Hi ${firstName} ${lastName},</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
              Great news! Your enrollment application <strong>#${applicationNumber}</strong> has been
              <span style="color:#16A34A;font-weight:600;">approved</span>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#06B6D4 0%,#155E75 100%);border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:24px;text-align:center;">
                <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Your Student Number</p>
                <p style="margin:0;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:2px;font-family:'Courier New',monospace;">${studentNumber}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:2px solid #E2E8F0;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <p style="margin:0 0 16px;color:#64748B;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Login Credentials</p>
                <p style="margin:0 0 12px;color:#0F172A;font-size:14px;"><strong>Email:</strong> ${to}</p>
                <p style="margin:0;color:#0F172A;font-size:14px;"><strong>Password:</strong>
                  <code style="background:#0F172A;color:#06B6D4;padding:6px 14px;border-radius:6px;font-size:15px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:1px;">${password}</code>
                </p>
                <p style="margin:16px 0 0;padding:12px;background:#FEF3C7;border-left:3px solid #F59E0B;color:#92400E;font-size:12px;line-height:1.5;border-radius:6px;">
                  ⚠️ <strong>Important:</strong> Your password is your student number.
                </p>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="background:#155E75;border-radius:10px;">
                <a href="${loginUrl}/login" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Log In to Portal →</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:11px;">© ${new Date().getFullYear()} SchedulePro. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    await supabaseAdmin.from('email_queue').insert({
      id: uuidv4(),
      to_email: to,
      subject: `🎓 Welcome to SchedulePro — Your Student Account is Ready`,
      body_html: bodyHtml,
      status: 'pending',
    });

    logger.info('Credentials email queued', { to, studentNumber });
  }

  // ============================================
  // EMAIL: WELCOME BACK (RETURNING STUDENTS)
  // ============================================
  private async sendWelcomeBackEmail(params: {
    to: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    applicationNumber: string;
    academicYear: string;
    semester: number;
    enrollmentType: string;
  }) {
    const {
      to,
      firstName,
      lastName,
      studentNumber,
      applicationNumber,
      academicYear,
      semester,
      enrollmentType,
    } = params;

    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const typeLabel =
      enrollmentType === 'returnee' ? 'Welcome Back' : 'Re-enrollment Confirmed';
    const semesterLabel = semester === 1 ? '1st Semester' : '2nd Semester';

    const bodyHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${typeLabel}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#10B981 100%);padding:40px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">🎉 ${typeLabel}!</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">You're enrolled for ${semesterLabel}, AY ${academicYear}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 16px;color:#0F172A;font-size:16px;font-weight:600;">Hi ${firstName} ${lastName},</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
              Your enrollment application <strong>#${applicationNumber}</strong> has been
              <span style="color:#16A34A;font-weight:600;">approved</span>.
              You're now officially enrolled for the ${semesterLabel} of Academic Year ${academicYear}.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:2px solid #E2E8F0;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:24px;">
                <p style="margin:0 0 12px;color:#64748B;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Your Account</p>
                <p style="margin:0 0 8px;color:#0F172A;font-size:14px;"><strong>Student Number:</strong> <span style="font-family:monospace;font-weight:700;">${studentNumber}</span></p>
                <p style="margin:0 0 16px;color:#0F172A;font-size:14px;"><strong>Email:</strong> ${to}</p>
                <p style="margin:16px 0 0;padding:12px;background:#DBEAFE;border-left:3px solid #2563EB;color:#1E40AF;font-size:12px;line-height:1.5;border-radius:6px;">
                  💡 <strong>No password change needed.</strong> Continue using your existing credentials (password = student number).
                </p>
              </td></tr>
            </table>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="background:#059669;border-radius:10px;">
                <a href="${loginUrl}/login" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Log In to Portal →</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:11px;">© ${new Date().getFullYear()} SchedulePro. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    await supabaseAdmin.from('email_queue').insert({
      id: uuidv4(),
      to_email: to,
      subject: `🎉 ${typeLabel} — You're Enrolled for ${semesterLabel}, AY ${academicYear}`,
      body_html: bodyHtml,
      status: 'pending',
    });

    logger.info('Welcome back email queued', { to, studentNumber, enrollmentType });
  }
}

export const enrollmentService = new EnrollmentService();