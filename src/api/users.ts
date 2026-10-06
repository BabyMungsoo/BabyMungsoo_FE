import type { ChangePasswordRequest, UserMe } from '@/types';

import { api } from './client';

export const usersApi = {
  getMe: async () => {
    const { data } = await api.get<UserMe>('/users/me');
    return data;
  },

  changePassword: async (body: ChangePasswordRequest) => {
    await api.patch('/users/me/password', body);
  },

  withdraw: async () => {
    await api.delete('/users/me');
  },
};
