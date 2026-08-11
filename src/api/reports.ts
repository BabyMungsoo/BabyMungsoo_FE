import type { Page, PageParams, Report, ReportCreateRequest } from '@/types';

import { api } from './client';

export const reportsApi = {
  /** POST /reports — 분석 기록 하나당 리포트 하나(중복 생성 시 409) */
  create: async (body: ReportCreateRequest) => {
    const { data } = await api.post<Report>('/reports', body);
    return data;
  },

  /** GET /reports/{reportId} */
  detail: async (reportId: number) => {
    const { data } = await api.get<Report>(`/reports/${reportId}`);
    return data;
  },

  /** GET /reports/record/{recordId} — 분석 기록으로 리포트 찾기 */
  byRecord: async (recordId: number) => {
    const { data } = await api.get<Report>(`/reports/record/${recordId}`);
    return data;
  },

  /** GET /reports/hospital/{hospitalId} — 병원이 받은 리포트 목록(기본 createdAt desc, 10건) */
  byHospital: async (hospitalId: number, params: PageParams = {}) => {
    const { data } = await api.get<Page<Report>>(`/reports/hospital/${hospitalId}`, { params });
    return data;
  },
};
