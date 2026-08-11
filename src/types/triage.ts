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
