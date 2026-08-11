import type { TriageLevel } from '@/types';

/** 응급도 표시용 라벨/색상. 백엔드 TriageLevel enum 과 값이 1:1 로 맞습니다. */
export const TRIAGE_LEVEL_META: Record<
  TriageLevel,
  { label: string; description: string; className: string }
> = {
  IMMEDIATE: {
    label: '즉시 내원',
    description: '지금 바로 병원에 가야 하는 상태예요.',
    className: 'bg-triage-immediate',
  },
  WATCH: {
    label: '주의 관찰',
    description: '상태를 지켜보다 나빠지면 병원에 가세요.',
    className: 'bg-triage-watch',
  },
  NORMAL: {
    label: '일반 관리',
    description: '집에서 관리해도 괜찮은 상태예요.',
    className: 'bg-triage-normal',
  },
};

/** 서버가 예상 밖의 문자열을 줄 수도 있어 안전하게 변환합니다 */
export function toTriageLevel(value: string | null | undefined): TriageLevel | null {
  if (value === 'IMMEDIATE' || value === 'WATCH' || value === 'NORMAL') return value;
  return null;
}
