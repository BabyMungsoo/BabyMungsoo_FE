import type { NotVisitedReason, TreatmentTag, TriageLevel } from '@/types';

/** 받은 처치 — 보호자가 눌러서 고르는 고정 목록입니다. 목록에 없는 건 메모에 적습니다 */
export const TREATMENT_LABELS: Record<TreatmentTag, string> = {
  FLUID: '수액',
  INJECTION: '주사',
  TEST: '검사',
  PRESCRIPTION: '처방약',
  HOSPITALIZED: '입원',
  OBSERVATION: '경과관찰',
};

/** 병원에 가지 않은 이유 */
export const NOT_VISITED_LABELS: Record<NotVisitedReason, string> = {
  SYMPTOM_IMPROVED: '증상이 나아졌어요',
  NO_TIME: '시간이 없었어요',
  COST: '비용이 부담됐어요',
  OTHER: '다른 이유예요',
};

/**
 * 분석 후 이 시간이 지나야 "병원 다녀오셨나요?" 를 묻습니다.
 *
 * 분석 직후에 물으면 아직 다녀오지 않았습니다. 등급마다 병원에 가는 시점이 달라
 * 기다리는 시간도 다릅니다. 서버에 상태를 두지 않고 프론트가 createdAt 으로만 판단합니다.
 */
export const FOLLOW_UP_DELAY_HOURS: Record<TriageLevel, number> = {
  IMMEDIATE: 6,
  WATCH: 24,
  NORMAL: 72,
};

/** "나중에" 를 누르면 하루 뒤에 다시 묻습니다 */
export const FOLLOW_UP_SNOOZE_HOURS = 24;
