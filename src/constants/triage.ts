import { TRIAGE_LEVELS, type TriageLevel } from '@/types';

/** 응급도 표시용 라벨/색상. 백엔드 TriageLevel enum 과 값이 1:1 로 맞습니다. */
export const TRIAGE_LEVEL_META: Record<
  TriageLevel,
  {
    /** 상세 화면용 긴 라벨 */
    label: string;
    /** 리스트 뱃지·필터칩용 짧은 라벨 */
    shortLabel: string;
    description: string;
    /** 배경색 클래스 */
    className: string;
  }
> = {
  IMMEDIATE: {
    label: '즉시 내원',
    shortLabel: '응급',
    description: '지금 바로 병원에 가야 하는 상태예요.',
    className: 'bg-triage-immediate',
  },
  WATCH: {
    label: '주의 관찰',
    shortLabel: '주의',
    description: '상태를 지켜보다 나빠지면 병원에 가세요.',
    className: 'bg-triage-watch',
  },
  NORMAL: {
    label: '일반 관리',
    shortLabel: '경미',
    description: '집에서 관리해도 괜찮은 상태예요.',
    className: 'bg-triage-normal',
  },
};

/** 필터칩 순서 (전체 → 응급 → 주의 → 경미) */
export const TRIAGE_FILTERS: { value: TriageLevel | null; label: string }[] = [
  { value: null, label: '전체' },
  ...TRIAGE_LEVELS.map((level) => ({ value: level, label: TRIAGE_LEVEL_META[level].shortLabel })),
];

/** 서버가 예상 밖의 문자열을 줄 수도 있어 안전하게 변환합니다 */
export function toTriageLevel(value: string | null | undefined): TriageLevel | null {
  if (value === 'IMMEDIATE' || value === 'WATCH' || value === 'NORMAL') return value;
  return null;
}
