import type { AnalysisRecord, AnalysisRecordCreateRequest } from '@/types';

import { api } from './client';

export const recordsApi = {
  /** GET /records?userId= — 아직 인증 연동 전이라 userId 를 쿼리로 넘깁니다 */
  list: async (userId: number) => {
    const { data } = await api.get<AnalysisRecord[]>('/records', { params: { userId } });
    return data;
  },

  /** GET /records/{recordId} */
  detail: async (recordId: number) => {
    const { data } = await api.get<AnalysisRecord>(`/records/${recordId}`);
    return data;
  },

  /** POST /records */
  create: async (body: AnalysisRecordCreateRequest) => {
    const { data } = await api.post<AnalysisRecord>('/records', body);
    return data;
  },

  /** DELETE /records/{recordId} */
  remove: async (recordId: number) => {
    await api.delete<void>(`/records/${recordId}`);
  },
};
