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
