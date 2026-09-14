import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticationError, AuthorizationError, asyncHandler } from './errorHandler';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        profileId?: string;
      };
      token?: string;
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as {
        id: string;
        email: string;
        role: string;
      };

      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !profile) {
        throw new AuthenticationError('User not found');
      }

      if (!profile.is_active) {
        throw new AuthenticationError('User account is inactive');
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: profile.role,
        profileId: profile.id,
      };
      req.token = token;

      logger.debug('User authenticated', {
        userId: req.user.id,
        role: req.user.role,
        path: req.path,
      });

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid authentication token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Authentication token expired');
      }
      throw error;
    }
  }
);

export const authorize = (...roles: string[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      throw new AuthorizationError(
        `Access denied. Required roles: ${roles.join(', ')}`
      );
    }

    logger.debug('Authorization successful', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path,
    });

    next();
  });
};

export const isAdmin = authorize('superadmin', 'admin');
export const isProfessor = authorize('professor');
export const isStudent = authorize('student');
export const isAdminOrProfessor = authorize('superadmin', 'admin', 'professor');