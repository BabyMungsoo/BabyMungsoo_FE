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
}

/** POST /api/v1/records */
export interface AnalysisRecordCreateRequest {
  userId: number;
  dogId: number;
  symptomText: string;
  aiResult: string;
  emergencyLevel: string;
  suspectedDisease?: string;
  aiGuide?: string;
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
