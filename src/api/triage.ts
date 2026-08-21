import type {
  Answer,
  AnswerCreateRequest,
  Question,
  TriageAnalyzeRequest,
  TriageAnalyzeResult,
  TriageSession,
  TriageSessionCreateRequest,
} from '@/types';

import { api } from './client';

export const triageApi = {
  /** POST /triage/sessions — 문진 세션 시작 */
  createSession: async (body: TriageSessionCreateRequest) => {
    const { data } = await api.post<TriageSession>('/triage/sessions', body);
    return data;
  },

  /** GET /triage/sessions/{sessionId} */
  getSession: async (sessionId: number) => {
    const { data } = await api.get<TriageSession>(`/triage/sessions/${sessionId}`);
    return data;
  },

  /** GET /triage/questions — symptomCategory 를 빼면 전체 질문 */
  getQuestions: async (symptomCategory?: string) => {
    const { data } = await api.get<Question[]>('/triage/questions', {
      params: symptomCategory ? { symptomCategory } : undefined,
    });
    return data;
  },

  /** GET /triage/sessions/{sessionId}/next-question — 다음에 물어볼 질문 */
  getNextQuestion: async (sessionId: number) => {
    const { data } = await api.get<Question | null>(`/triage/sessions/${sessionId}/next-question`);
    return data;
  },

  /** POST /triage/sessions/{sessionId}/answers */
  saveAnswer: async (sessionId: number, body: AnswerCreateRequest) => {
    const { data } = await api.post<Answer>(`/triage/sessions/${sessionId}/answers`, body);
    return data;
  },

  /** POST /triage/sessions/{sessionId}/complete — 문진 종료(AI 분석 준비 완료) */
  completeSession: async (sessionId: number) => {
    const { data } = await api.post<TriageSession>(`/triage/sessions/${sessionId}/complete`);
    return data;
  },

  /** POST /triage/analyze — 완료된 세션을 AI 로 분석. 같은 세션은 기존 결과를 그대로 돌려줍니다 */
  analyze: async (body: TriageAnalyzeRequest) => {
    const { data } = await api.post<TriageAnalyzeResult>('/triage/analyze', body);
    return data;
  },
};
