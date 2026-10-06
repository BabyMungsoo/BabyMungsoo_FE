import type { IsoDateTime } from './common';

/** AnalysisRecordResponseDto */
export interface AnalysisRecord {
  recordId: number;
  userId: number;
  /** 백엔드 컬럼명이 dogId 입니다 (pet.petId 와 같은 값) */
  dogId: number;
  symptomText: string;
  aiResult: string;
  emergencyLevel: string;
  suspectedDisease: string | null;
  aiGuide: string | null;
  createdAt: IsoDateTime;
  /**
   * 분석에 쓴 사진들의 media ID 목록(최대 5장). useMedia(mediaId) 로 각각의
   * media 상세를 받아 fileUrl 을 `toAbsoluteUrl()` 로 감싸면 화면에 쓸 수 있습니다.
   */
  mediaIds?: number[] | null;
  /**
   * 병원에 다녀왔는지 물어본 질문에 답했는지. '안 갔어요' 도 답입니다.
   * 질문 카드를 숨기는 기준이라, visitCount 가 0이어도 true 일 수 있습니다.
   */
  followUpAnswered: boolean;
  /** 실제로 다녀온 횟수. 목록의 '진료 완료' 표시에 씁니다 */
  visitCount: number;
}

export const VISIT_STATUSES = ['VISITED', 'NOT_VISITED'] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const NOT_VISITED_REASONS = ['SYMPTOM_IMPROVED', 'NO_TIME', 'COST', 'OTHER'] as const;
export type NotVisitedReason = (typeof NOT_VISITED_REASONS)[number];

export const TREATMENT_TAGS = [
  'FLUID',
  'INJECTION',
  'TEST',
  'PRESCRIPTION',
  'HOSPITALIZED',
  'OBSERVATION',
] as const;
export type TreatmentTag = (typeof TREATMENT_TAGS)[number];

/** HospitalVisitResponseDto — 분석 기록 하나에 여러 건이 달립니다 */
export interface HospitalVisit {
  visitId: number;
  recordId: number;
  visitStatus: VisitStatus;
  /** NOT_VISITED 일 때만 값이 있습니다 */
  notVisitedReason: NotVisitedReason | null;
  /** VISITED 일 때만 값이 있습니다 (YYYY-MM-DD) */
  visitedAt: string | null;
  hospitalId: number | null;
  /** hospitalId 로 고른 경우 서버가 채워 줍니다 */
  hospitalName: string | null;
  /** 수의사에게 들은 내용을 보호자가 적은 것. 앱이 만든 값이 아닙니다 */
  diagnosis: string | null;
  treatments: TreatmentTag[];
  memo: string | null;
  nextVisitAt: string | null;
  createdAt: IsoDateTime;
}

/**
 * POST /api/v1/records/{recordId}/visits
 *
 * visitStatus 외에는 전부 선택입니다. 단 VISITED 면 visitedAt 과
 * hospitalId/hospitalName 중 하나가 필요하고, NOT_VISITED 면 이유만 보냅니다
 * (진료 관련 필드를 섞어 보내면 서버가 400 으로 막습니다).
 */
export interface HospitalVisitCreateRequest {
  visitStatus: VisitStatus;
  notVisitedReason?: NotVisitedReason;
  visitedAt?: string;
  hospitalId?: number;
  hospitalName?: string;
  diagnosis?: string;
  treatments?: TreatmentTag[];
  memo?: string;
  nextVisitAt?: string;
}

/** POST /api/v1/records — userId 는 보내지 않습니다. 서버가 토큰에서 채웁니다 */
export interface AnalysisRecordCreateRequest {
  dogId: number;
  symptomText: string;
  aiResult: string;
  emergencyLevel: string;
  suspectedDisease?: string;
  aiGuide?: string;
  /** 최대 5장 */
  mediaIds?: number[];
}

/**
 * PATCH /api/v1/records/{recordId} — 보낸 필드만 수정됩니다.
 *
 * aiResult/aiGuide 는 AI 가 만든 값이라 사용자가 고치지 않습니다.
 * 사용자가 직접 입력했거나 정정할 수 있는 값만 열어 둡니다.
 */
export interface AnalysisRecordUpdateRequest {
  symptomText?: string;
  emergencyLevel?: string;
  suspectedDisease?: string | null;
}
