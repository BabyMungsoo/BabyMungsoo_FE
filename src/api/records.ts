import type {
  AnalysisRecord,
  AnalysisRecordCreateRequest,
  AnalysisRecordUpdateRequest,
  HospitalVisit,
  HospitalVisitCreateRequest,
} from '@/types';

import { api } from './client';

export const recordsApi = {
  /** GET /records — 로그인한 사용자의 기록. 조회 대상을 클라이언트가 정하지 않습니다 */
  list: async () => {
    const { data } = await api.get<AnalysisRecord[]>('/records');
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

  /** PATCH /records/{recordId} — 보낸 필드만 수정 */
  update: async (recordId: number, body: AnalysisRecordUpdateRequest) => {
    const { data } = await api.patch<AnalysisRecord>(`/records/${recordId}`, body);
    return data;
  },

  /** DELETE /records/{recordId} */
  remove: async (recordId: number) => {
    await api.delete<void>(`/records/${recordId}`);
  },

  /** GET /records/{recordId}/visits — 최근 방문일 순 */
  listVisits: async (recordId: number) => {
    const { data } = await api.get<HospitalVisit[]>(`/records/${recordId}/visits`);
    return data;
  },

  /** POST /records/{recordId}/visits — 팔로우업 답변 */
  createVisit: async (recordId: number, body: HospitalVisitCreateRequest) => {
    const { data } = await api.post<HospitalVisit>(`/records/${recordId}/visits`, body);
    return data;
  },

  /** DELETE /visits/{visitId} */
  removeVisit: async (visitId: number) => {
    await api.delete<void>(`/visits/${visitId}`);
  },
};
