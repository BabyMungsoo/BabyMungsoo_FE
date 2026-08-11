/**
 * 백엔드 공통 응답 래퍼 (global/response/ApiResponse.java)
 *
 * 주의: 현재 백엔드에서 이 래퍼를 쓰는 건 /media/** 뿐이고
 * 나머지 도메인은 DTO 를 그대로 반환합니다. 래퍼 해제는 src/api/media.ts 에서 처리합니다.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

/** Spring Data Page 응답 (GET /reports/hospital/{hospitalId}) */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Pageable 쿼리 파라미터 */
export interface PageParams {
  page?: number;
  size?: number;
  /** 예: ['createdAt,desc'] */
  sort?: string[];
}

/**
 * 응급도. 백엔드 AI/Entity/TriageLevel.java 와 동일한 값이지만
 * record/report 쪽 emergencyLevel 은 아직 String 컬럼이라 서버가 다른 값을 줄 수도 있습니다.
 */
export const TRIAGE_LEVELS = ['IMMEDIATE', 'WATCH', 'NORMAL'] as const;
export type TriageLevel = (typeof TRIAGE_LEVELS)[number];

/** ISO-8601 문자열 (예: '2026-08-11T23:30:00') */
export type IsoDateTime = string;
