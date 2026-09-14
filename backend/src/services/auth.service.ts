import * as jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticationError, ConflictError, NotFoundError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
  };
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  contactNumber?: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { id: userId, email, role };
    // Use the sign method with the secret and options directly
    // @ts-ignore - Suppressing the expiresIn type issue
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    logger.info('Login attempt', { email: email.substring(0, 3) + '***' });

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.warn('Login failed', { 
        email: email.substring(0, 3) + '***', 
        error: authError.message 
      });
      throw new AuthenticationError('Invalid email or password');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile not found for user', { userId: authData.user.id });
      throw new NotFoundError('User profile');
    }

    if (!profile.is_active) {
      throw new AuthenticationError('User account is inactive');
    }

    const token = this.generateToken(profile.id, profile.email, profile.role);

    logger.info('Login successful', { 
      userId: profile.id, 
      role: profile.role,
      email: profile.email.substring(0, 3) + '***'
    });

    return {
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
      },
      token,
    };
  }

  async register(data: RegistrationData): Promise<AuthResponse> {
    const { firstName, lastName, email, password, role, contactNumber } = data;

    logger.info('Registration attempt', { email: email.substring(0, 3) + '***' });

    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      logger.warn('Error checking existing user', { 
        email: email.substring(0, 3) + '***',
        error: checkError.message 
      });
    }

    if (existingUser) {
      logger.warn('Registration failed - user exists', { email: email.substring(0, 3) + '***' });
      throw new ConflictError('User with this email already exists');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
      },
    });

    if (authError) {
      logger.error('Registration failed - auth error', { 
        email: email.substring(0, 3) + '***',
        error: authError.message 
      });
      throw new Error('Failed to create user account');
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        contact_number: contactNumber,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Registration failed - profile creation error', { 
        error: profileError.message 
      });
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user profile');
    }

    const token = this.generateToken(profile.id, profile.email, profile.role);

    logger.info('Registration successful', { 
      userId: profile.id, 
      role: profile.role,
      email: profile.email.substring(0, 3) + '***'
    });

    return {
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
      },
      token,
    };
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        id: string;
        email: string;
        role: string;
      };
      return {
        userId: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;