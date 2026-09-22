import type { IsoDateTime } from './common';
import type { Media } from './media';

export const SESSION_STATUSES = ['IN_PROGRESS', 'COMPLETED'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** CHOICE = options 중 하나를 고름, TEXT = 자유 입력. 시드된 마스터 질문은 항상 TEXT 입니다 */
export type AnswerType = 'CHOICE' | 'TEXT';

/** QuestionResponse */
export interface Question {
  id: number;
  code: string;
  content: string;
  symptomCategory: string | null;
  orderNo: number;
  answerType: AnswerType;
  /**
   * 화면에 보이는 순서 그대로(가벼운 것 → 심한 것). 마지막은 서버가 붙인 '잘 모르겠어요'.
   * TEXT 면 빈 배열입니다.
   */
  options: string[];
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
  /** 세션 생성 시 mediaIds 로 함께 보낸, 증상 사진들 */
  media: Media[];
  createdAt: IsoDateTime;
}

/** POST /api/v1/triage/sessions */
export interface TriageSessionCreateRequest {
  petId: number;
  initialSymptom: string;
  symptomCategory: string;
  /** 미리 업로드해 둔(POST /media/upload) 사진들의 mediaId. 없으면 생략 가능 */
  mediaIds?: number[];
}

/** POST /api/v1/triage/sessions/{sessionId}/answers */
export interface AnswerCreateRequest {
  questionId: number;
  content: string;
}

/**
 * POST /api/v1/triage/sessions/{sessionId}/questions — 추가 문진 질문 생성 결과.
 *
 * 초기 증상만으로 충분하거나 생성에 실패하면 needsAdditionalQuestions 가 false 로 오고
 * questions 는 빈 배열입니다. 이때는 질문 화면을 거치지 않고 바로 분석으로 갑니다.
 */
export interface TriageQuestionSet {
  needsAdditionalQuestions: boolean;
  questions: Question[];
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
  /**
   * 결론 한 줄. 서버가 등급에서 만든 고정 문구라 같은 등급이면 항상 같습니다.
   * 예: '지금 바로 동물병원에 가세요' (IMMEDIATE)
   */
  title: string;
  /** 입력에서 확인된 소견. 2~4개, 각 40자 이내의 짧은 구절 */
  findings: string[];
  /** 소견이 왜 그 시급성으로 이어지는지. 1~2문장, 첫 문장이 결론 */
  urgencyReason: string;
  /**
   * "이 변화가 보이면 바로 병원". 최대 4개.
   * IMMEDIATE 는 이미 즉시 내원이라 서버가 항상 빈 배열로 줍니다.
   */
  escalationSigns: string[];
  /** 병원 도착 전까지의 주의 사항. 0~2개, 없으면 빈 배열 */
  precautions: string[];
  createdAt: IsoDateTime;
}
