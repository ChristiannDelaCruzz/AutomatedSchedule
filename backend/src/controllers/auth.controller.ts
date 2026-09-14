import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    logger.info('User logged in', {
      userId: result.user.id,
      role: result.user.role,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Register new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, role, contactNumber } = req.body;

    const result = await authService.register({
      firstName,
      lastName,
      email,
      password,
      role,
      contactNumber,
    });

    logger.info('New user registered', {
      userId: result.user.id,
      role: result.user.role,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * Verify token
   * GET /api/auth/verify
   */
  verify = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const result = await authService.verifyToken(token);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('User logged out', {
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.user,
    });
  });
}

export const authController = new AuthController();