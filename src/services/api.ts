import axios from 'axios';
class ApiClient {
  private client: ReturnType<typeof axios.create>;
  private static instance: ApiClient;

  private constructor() {
    const baseURL = import.meta.env.DEV
    ? '/api'
    : 'https://automatedschedule.onrender.com/api';

    this.client = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );

    this.client.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private handleRequest = (config: any): any => {
    const publicRoutes = ['/academic', '/enrollment', '/health', '/test-db'];
    const isPublic = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublic) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  };

  private handleRequestError = (error: any): Promise<never> => {
    return Promise.reject(error);
  };

  // ⚠️ Return the FULL body: { success, data, error }
  private handleResponse = (response: any): any => {
    return response.data;
  };

  // src/services/api.ts - Update the handleResponseError method
  private handleResponseError = (error: any): Promise<never> => {
    const errorResponse = error.response?.data as any;
    
    if (error.response?.status === 401) {
      // Don't redirect for auth routes
      const authRoutes = ['/auth/login', '/auth/register', '/auth/verify'];
      const isAuthRoute = authRoutes.some(route => error.config?.url?.includes(route));
      
      const publicRoutes = ['/academic', '/enrollment', '/health', '/test-db'];
      const isPublic = publicRoutes.some(route => error.config?.url?.includes(route));
      
      if (!isAuthRoute && !isPublic) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }

    const errorObj = {
      message: errorResponse?.error?.message || error.message || 'An error occurred',
      code: errorResponse?.error?.code || 'UNKNOWN_ERROR',
      status: error.response?.status,
      data: errorResponse?.error?.data || errorResponse?.data,
      details: errorResponse?.error?.details,
    };
    
    return Promise.reject(errorObj);
  };

  // ⚠️ These methods MUST return response directly (NOT response.data)
  //    because the interceptor already extracted response.data for us

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response as T;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response as T;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch(url, data);
    return response as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response as T;
  }

  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const apiClient = ApiClient.getInstance();
export default apiClient;
