import type { IsoDateTime } from './common';

/**
 * HospitalResponseDto
 *
 * 백엔드가 카카오 로컬 데이터를 그대로 옮겨 담고 있어서 아직 비어 있는 필드가 많습니다.
 * (2026-09-19 기준 rating 은 전부 null. openHours·specialties 는 큐레이션된 24시간 병원에만 있습니다)
 * 화면에서는 값이 있을 때만 그리도록 해서, 나중에 채워지면 그대로 드러나게 합니다.
 */
export interface Hospital {
  hospitalId: number;
  hospitalName: string;
  address: string;
  /** 없으면 null 이 아니라 '정보 없음' 문자열로 옵니다 — isMissing() 으로 걸러 쓰세요 */
  phone: string | null;
  latitude: number;
  longitude: number;
  is24hour: boolean;
  /** 카카오 미제공 — 큐레이션(24시간 병원 목록)으로 채운 병원만 값이 있습니다 */
  openHours: string | null;
  /** 주요 진료 분야. '24시 응급, CT/MRI, 정형외과' 처럼 쉼표로 이어진 문자열. 큐레이션 병원만 값이 있습니다 */
  specialties: string | null;
  /** 특징 한 줄 (장비·강점). '대학병원급 MRI, CT 보유, 분과별 전문의 협진' 처럼 문장. 큐레이션 병원만 값이 있습니다 */
  features: string | null;
  /** 카카오 미제공 — 현재 전부 null */
  rating: number | null;
  /** 리뷰 수 (시안의 평점 옆 '(256)') — 현재 전부 null */
  reviewCount: number | null;
  /** 병원 사진 (시안의 카드 왼쪽 썸네일) — 현재 전부 null */
  imageUrl: string | null;
  lastUpdated: IsoDateTime | null;
}

/**
 * GET /hospitals/recommend 의 level.
 *
 * 분석기록 쪽 TriageLevel(IMMEDIATE / WATCH / NORMAL) 과 값이 같습니다.
 * 예전에는 가운데 등급이 URGENT 였는데, 백엔드가 공용 TriageLevel 로 통일하면서
 * URGENT 는 더 이상 받지 않습니다(보내면 400).
 */
export const HOSPITAL_LEVELS = ['IMMEDIATE', 'WATCH', 'NORMAL'] as const;
export type HospitalLevel = (typeof HOSPITAL_LEVELS)[number];

/** GET /api/v1/hospitals/recommend 쿼리 파라미터 */
export interface HospitalRecommendParams {
  lat: number;
  lng: number;
  /** NORMAL / WATCH → 반경 약 5km 전체, IMMEDIATE → 그중 24시간 병원만 */
  level: HospitalLevel;
}

/** 위경도 한 쌍 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * 백엔드가 값이 없을 때 내려주는 자리표시 문자열입니다.
 * null 과 똑같이 '없음' 으로 취급해야 해서 한곳에 모아 둡니다.
 */
const MISSING_TEXTS = ['정보 없음', '정보없음', '-', ''];

/** phone 처럼 '정보 없음' 이 올 수 있는 값이 실제로 비어 있는지 판단합니다 */
export function isMissing(value: string | null | undefined): boolean {
  return value == null || MISSING_TEXTS.includes(value.trim());
}
