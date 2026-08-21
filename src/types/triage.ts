import type { IsoDateTime } from './common';

export const SESSION_STATUSES = ['IN_PROGRESS', 'COMPLETED'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** QuestionResponse */
export interface Question {
  id: number;
  code: string;
  content: string;
  symptomCategory: string;
  orderNo: number;
}

/** AnswerResponse */
export interface Answer {
  id: number;
  questionId: number | null;
  content: string;
  createdAt: IsoDateTime;
}

/** TriageSessionResponse */
export interface TriageSession {
  sessionId: number;
  petId: number;
  initialSymptom: string;
  symptomCategory: string;
  status: SessionStatus;
  answers: Answer[];
  createdAt: IsoDateTime;
}

/** POST /api/v1/triage/sessions */
export interface TriageSessionCreateRequest {
  petId: number;
  initialSymptom: string;
  symptomCategory: string;
}

/** POST /api/v1/triage/sessions/{sessionId}/answers */
export interface AnswerCreateRequest {
  questionId: number;
  content: string;
}

/** POST /api/v1/triage/analyze */
export interface TriageAnalyzeRequest {
  sessionId: number;
}

/**
 * TriageAnalyzeResponse — AI 응급도 분석 결과.
 *
 * 완료(COMPLETED)된 세션만 분석할 수 있고, 같은 세션을 다시 분석하면
 * 서버가 기존 결과를 그대로 돌려줍니다(멱등).
 */
export interface TriageAnalyzeResult {
  triageResultId: number;
  petId: number;
  /** TriageLevel 과 같은 값 (IMMEDIATE / WATCH / NORMAL) */
  level: string;
  /** 짧은 결론 한 줄. 예: '위장염(급성) 가능성 높음' */
  title: string;
  /** 그렇게 판단한 근거들 */
  reason: string[];
  guide: string;
  createdAt: IsoDateTime;
}
