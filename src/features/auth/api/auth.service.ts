import { $api } from '@/shared/api/base';
import type { LoginDto, RegisterDto, AuthResponse } from './types';
import { ApiRoutes } from '@/shared/config';

/**
 * AuthService provides specific API calls for authentication.
 * All calls include credentials: 'include' via the $api wrapper.
 */
export const AuthService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await $api(ApiRoutes.users.login, {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: { 'Content-Type': 'application/json' },
      useAuth: false, // Don't send AT for login
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || error.notification || 'Login failed');
    }
    return response.json();
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await $api(ApiRoutes.users.register, {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: { 'Content-Type': 'application/json' },
      useAuth: false,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || error.notification || 'Registration failed');
    }
    return response.json();
  },

  async logout(): Promise<void> {
    // Logout typically invalidates the RT cookie on the server
    await $api(ApiRoutes.users.logout, { method: 'POST' });
  },

  async refresh(): Promise<AuthResponse> {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      try {
        const response = await $api(ApiRoutes.users.refresh, {
          method: 'POST',
          useAuth: false, // Refresh relies on cookie, not AT
        });
        if (!response.ok) throw new Error('Refresh failed');
        return await response.json();
      } finally {
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  },
};

let activeRefreshPromise: Promise<AuthResponse> | null = null;
