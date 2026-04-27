import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api.types';
import type { AuthUser } from '@/lib/auth-store';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authService = {
  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', dto);
    return data.data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<ApiResponse<AuthUser>>('/api/v1/auth/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout');
  },
};
