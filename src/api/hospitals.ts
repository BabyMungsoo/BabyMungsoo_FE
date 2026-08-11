import type { Hospital, HospitalRecommendParams } from '@/types';

import { api } from './client';

export const hospitalsApi = {
  /** GET /hospitals */
  list: async () => {
    const { data } = await api.get<Hospital[]>('/hospitals');
    return data;
  },

  /** GET /hospitals/{hospitalId} */
  detail: async (hospitalId: number) => {
    const { data } = await api.get<Hospital>(`/hospitals/${hospitalId}`);
    return data;
  },

  /** GET /hospitals/recommend — 현재 위치 + 응급도 기반 추천 */
  recommend: async (params: HospitalRecommendParams) => {
    const { data } = await api.get<Hospital[]>('/hospitals/recommend', { params });
    return data;
  },
};
