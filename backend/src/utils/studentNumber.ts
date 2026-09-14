// backend/src/utils/studentNumber.ts
import { supabaseAdmin } from '../config/supabase';
import logger from './logger';

/**
 * Generate the next student number for the current year
 * Format: SP-2026-00001 (SchedulePro - Year - Sequential)
 */
export async function generateStudentNumber(): Promise<{
  studentNumber: string;
  password: string;
}> {
  const year = new Date().getFullYear();

  try {
    const { data: latest, error } = await supabaseAdmin
      .from('profiles')
      .select('student_number')
      .like('student_number', `SP-${year}-%`)
      .order('student_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.warn('Error fetching latest student number', { error: error.message });
    }

    let nextSequence = 1;

    if (latest?.student_number) {
      const parts = latest.student_number.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const paddedSequence = String(nextSequence).padStart(5, '0');
    const studentNumber = `SP-${year}-${paddedSequence}`;

    return {
      studentNumber,
      password: studentNumber,
    };
  } catch (error: any) {
    logger.error('Failed to generate student number', { error: error.message });
    const timestamp = Date.now();
    const fallbackNumber = `SP-${year}-${String(timestamp).slice(-5)}`;
    return {
      studentNumber: fallbackNumber,
      password: fallbackNumber,
    };
  }
}