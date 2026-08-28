import type {
  Answer,
  AnswerCreateRequest,
  Question,
  TriageAnalyzeRequest,
  TriageAnalyzeResult,
  TriageQuestionSet,
  TriageSession,
  TriageSessionCreateRequest,
} from '@/types';

import { api } from './client';

/** 백엔드 ClaudeTriageAnalyzer 의 제한이 60초라, 서버가 포기하는 시점보다 조금 뒤에 끊습니다. */
const ANALYZE_TIMEOUT_MS = 70_000;

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

  /**
   * POST /triage/sessions/{sessionId}/questions — 초기 증상을 보고 추가 질문을 만듭니다.
   *
   * Claude 호출이 들어 있어 analyze 와 같은 긴 타임아웃을 씁니다(기본 15초로는 모자랍니다).
   * 서버가 생성 실패를 오류로 올리지 않고 needsAdditionalQuestions=false 로 내려주므로,
   * 호출부는 성공/실패가 아니라 이 플래그만 보면 됩니다.
   */
  generateQuestions: async (sessionId: number) => {
    const { data } = await api.post<TriageQuestionSet>(
      `/triage/sessions/${sessionId}/questions`,
      undefined,
      { timeout: ANALYZE_TIMEOUT_MS },
    );
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

  /**
   * POST /triage/analyze — 완료된 세션을 AI 로 분석. 같은 세션은 기존 결과를 그대로 돌려줍니다.
   *
   * 타임아웃만 따로 늘려 잡습니다. 백엔드의 Claude 호출 제한이 60초라
   * client.ts 의 기본값(15초)으로는 분석이 끝나기 전에 앱이 먼저 포기해 버립니다.
   */
  analyze: async (body: TriageAnalyzeRequest) => {
    const { data } = await api.post<TriageAnalyzeResult>('/triage/analyze', body, {
      timeout: ANALYZE_TIMEOUT_MS,
    });
    return data;
  },
};
