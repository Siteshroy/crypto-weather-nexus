import { LoginCredentials, RegisterCredentials, UserResponse } from '../models/User';

class AuthService {
  private static instance: AuthService;
  private baseUrl: string = '/api/auth';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(credentials: RegisterCredentials): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token;
  }

  async login(credentials: LoginCredentials): Promise<UserResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
    }

    return data;
  }

  logout(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  getCurrentUser(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('userId');
  }
}

export const authService = AuthService.getInstance(); 