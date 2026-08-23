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
   * 분석에 쓴 사진 (media 도메인, `toAbsoluteUrl()` 로 감싸 써야 하는 상대 경로).
   * record ↔ media 를 이어주는 필드가 백엔드에 아직 없어서 응답에 아예 안 옵니다.
   * 나중에 필드가 생기면 옵셔널을 그대로 두어도 값이 채워지는 대로 나타납니다.
   */
  photoUrl?: string | null;
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
