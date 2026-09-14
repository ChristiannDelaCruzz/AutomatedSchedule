import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateLogin, validateRegistration } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.get('/verify', authController.verify);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;