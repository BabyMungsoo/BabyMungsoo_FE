import type { HospitalLevel, TriageLevel } from '@/types';

/**
 * 분석기록의 응급도를 병원 추천 API 의 level 로 옮깁니다.
 *
 * 두 enum 의 값은 같습니다(IMMEDIATE / WATCH / NORMAL). 예전에는 가운데 등급이
 * URGENT 라 변환이 필요했는데, 백엔드가 공용 TriageLevel 로 통일하면서 URGENT 는
 * 더 이상 받지 않습니다. 이 함수가 남아 있는 이유는 아래 기본값 처리 때문입니다.
 *
 * 응급도를 모른 채 (예: 탭에서 바로) 들어오면 반경 전체를 보여주는 NORMAL 로 둡니다.
 */
export function toHospitalLevel(level: TriageLevel | null | undefined): HospitalLevel {
  switch (level) {
    case 'IMMEDIATE':
      return 'IMMEDIATE';
    case 'WATCH':
      return 'WATCH';
    default:
      return 'NORMAL';
  }
}
