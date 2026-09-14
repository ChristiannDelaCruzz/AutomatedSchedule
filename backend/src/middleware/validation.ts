import { Request, Response, NextFunction } from 'express';
import { ValidationError, asyncHandler } from './errorHandler';
import logger from '../utils/logger';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateLogin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const errors: Record<string, string> = {};

    if (!email || typeof email !== 'string') {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password || typeof password !== 'string') {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Login validation failed', { errors, email: email?.substring(0, 3) + '***' });
      throw new ValidationError('Validation failed', errors);
    }

    next();
  }
);

export const validateRegistration = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, role } = req.body;

    const errors: Record<string, string> = {};

    if (!firstName || typeof firstName !== 'string' || firstName.length < 2) {
      errors.firstName = 'First name is required and must be at least 2 characters';
    }

    if (!lastName || typeof lastName !== 'string' || lastName.length < 2) {
      errors.lastName = 'Last name is required and must be at least 2 characters';
    }

    if (!email || typeof email !== 'string') {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password || typeof password !== 'string') {
      errors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
    }

    if (role && !['admin', 'professor', 'student', 'staff'].includes(role)) {
      errors.role = 'Invalid role selected';
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Registration validation failed', { errors, email: email?.substring(0, 3) + '***' });
      throw new ValidationError('Validation failed', errors);
    }

    next();
  }
);

export const validateScheduleGeneration = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { academicYear, semester } = req.body;

    const errors: Record<string, string> = {};

    if (!academicYear || typeof academicYear !== 'string') {
      errors.academicYear = 'Academic year is required';
    } else if (!/^\d{4}-\d{4}$/.test(academicYear)) {
      errors.academicYear = 'Academic year must be in format YYYY-YYYY';
    }

    if (semester === undefined || semester === null) {
      errors.semester = 'Semester is required';
    } else if (![1, 2].includes(semester)) {
      errors.semester = 'Semester must be 1 or 2';
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Schedule generation validation failed', { errors });
      throw new ValidationError('Validation failed', errors);
    }

    next();
  }
);