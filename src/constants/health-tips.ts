export interface HealthTip {
  id: string;
  title: string;
  emoji: string;
  /** 카드 배경색 (Tailwind 클래스) */
  bgClassName: string;
}

/** 홈 화면 '우리아이 건강팁' 섹션 — 백엔드 API 가 생기기 전까지는 정적 데이터를 씁니다 */
export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'breed-guide',
    title: '품종별 건강 가이드',
    emoji: '🐩',
    bgClassName: 'bg-amber-50',
  },
  {
    id: 'patella-prevention',
    title: '슬개골 탈구 예방법',
    emoji: '🦴',
    bgClassName: 'bg-sky-50',
  },
  {
    id: 'early-training',
    title: '조기 훈련 팁',
    emoji: '🐾',
    bgClassName: 'bg-emerald-50',
  },
];
