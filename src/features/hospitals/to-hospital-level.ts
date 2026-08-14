import type { HospitalLevel, TriageLevel } from '@/types';

/**
 * 분석기록의 응급도를 병원 추천 API 의 level 로 옮깁니다.
 *
 * 두 enum 이 가운데 등급에서만 어긋납니다.
 *   IMMEDIATE → IMMEDIATE
 *   WATCH     → URGENT     ← 이름만 다르고 같은 등급
 *   NORMAL    → NORMAL
 *
 * 응급도를 모른 채 (예: 탭에서 바로) 들어오면 반경 전체를 보여주는 NORMAL 로 둡니다.
 */
export function toHospitalLevel(level: TriageLevel | null | undefined): HospitalLevel {
  switch (level) {
    case 'IMMEDIATE':
      return 'IMMEDIATE';
    case 'WATCH':
      return 'URGENT';
    default:
      return 'NORMAL';
  }
}
