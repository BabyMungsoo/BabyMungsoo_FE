import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types';

import { api } from './client';
import { normalizeRole } from '@/types/auth';

export const authApi = {
  login: async (body: LoginRequest) => {
    const { data } = await api.post<LoginResponse>('/auth/login', body);
    return { ...data, role: normalizeRole(data.role) };
  },

  /** 회원가입 전 이메일 중복 확인. available 이 false 면 이미 가입된 이메일입니다 */
  checkEmail: async (email: string) => {
    const { data } = await api.post<{ available: boolean }>('/auth/email/check', { email });
    return data.available;
  },

  signup: async (body: SignupRequest) => {
    const { data } = await api.post<SignupResponse>('/auth/signup', body);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
