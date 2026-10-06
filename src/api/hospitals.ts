import type { Hospital, HospitalNearestParams, HospitalRecommendParams } from '@/types';

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

  /**
   * GET /hospitals/nearest — 반경 제한 없이 가까운 순 limit 곳.
   * recommend 는 5km 박스라 교외에서 비는데, 결과 화면의 '가까운 동물병원' 은 늘 무언가 보여야 해서 따로 둡니다.
   * IMMEDIATE 면 서버가 24시간 병원만 주고, 하나도 없으면 전체로 폴백합니다.
   */
  nearest: async (params: HospitalNearestParams) => {
    const { data } = await api.get<Hospital[]>('/hospitals/nearest', { params });
    return data;
  },

  /** GET /hospitals/recommend — 현재 위치 + 응급도 기반 추천 */
  recommend: async (params: HospitalRecommendParams) => {
    const { data } = await api.get<Hospital[]>('/hospitals/recommend', { params });
    return data;
  },
};
