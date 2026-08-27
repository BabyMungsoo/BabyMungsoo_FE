import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types';

import { api } from './client';

export const authApi = {
  login: async (body: LoginRequest) => {
    const { data } = await api.post<LoginResponse>('/auth/login', body);
    return data;
  },

  signup: async (body: SignupRequest) => {
    const { data } = await api.post<SignupResponse>('/auth/signup', body);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
