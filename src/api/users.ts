import type { UserMe } from '@/types';

import { api } from './client';

export const usersApi = {
  /** GET /users/me — 현재 로그인 사용자 */
  getMe: async () => {
    const { data } = await api.get<UserMe>('/users/me');
    return data;
  },
};
