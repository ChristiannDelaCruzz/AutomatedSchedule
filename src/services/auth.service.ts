// src/services/auth.service.ts
import apiClient from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/auth/login', credentials);
      
      // Handle different response formats
      let authData: AuthResponse | null = null;
      
      if (response && response.success && response.data) {
        authData = response.data;
      } else if (response && response.user && response.token) {
        authData = response;
      } else if (response && response.data && response.data.user && response.data.token) {
        authData = response.data;
      }
      
      if (authData && authData.user && authData.token) {
        this.setSession(authData.token, authData.user);
        return authData;
      }
      
      throw {
        message: 'Invalid response from server',
        code: 'INVALID_RESPONSE',
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Invalid email or password',
        code: error.code || 'LOGIN_ERROR',
        status: error.status,
      };
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/auth/register', data);
      
      // Handle different response formats
      let authData: AuthResponse | null = null;
      
      if (response && response.success && response.data) {
        authData = response.data;
      } else if (response && response.user && response.token) {
        authData = response;
      } else if (response && response.data && response.data.user && response.data.token) {
        authData = response.data;
      }
      
      if (authData && authData.user && authData.token) {
        this.setSession(authData.token, authData.user);
        return authData;
      }
      
      throw {
        message: 'Invalid response from server',
        code: 'INVALID_RESPONSE',
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Registration failed',
        code: error.code || 'REGISTRATION_ERROR',
        status: error.status,
      };
    }
  }

  /**
   * Verify if the current token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await apiClient.get<any>('/auth/verify');
      
      if (response && response.success) {
        return true;
      }
      
      if (response && response.userId) {
        return true;
      }
      
      return false;
    } catch {
      this.clearSession();
      return false;
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.clearSession();
    window.location.href = '/login';
  }

  /**
   * Store session data in localStorage
   */
  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    apiClient.setAuthToken(token);
  }

  /**
   * Clear all session data
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    apiClient.setAuthToken(null);
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the current user from localStorage
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }
}

export const authService = new AuthService();
export default authService;