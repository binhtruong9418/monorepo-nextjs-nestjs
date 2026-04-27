'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from './axios';
import type { UserRole } from '@repo/api/fe';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: 'lax' });
        set({ token, user, isAuthenticated: true });
      },
      clearAuth: () => {
        Cookies.remove(TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'webcommerce-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
