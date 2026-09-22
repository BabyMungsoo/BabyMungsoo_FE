import { FOLLOW_UP_DELAY_HOURS } from '@/constants/visit';
import { toTriageLevel } from '@/constants/triage';
import type { AnalysisRecord } from '@/types';

const HOUR_MS = 60 * 60 * 1000;

/**
 * "병원 다녀오셨나요?" 를 지금 물어볼지.
 *
 * 서버에 "물어볼 때가 됐는지" 상태를 두지 않습니다. 기록의 createdAt 경과와
 * followUpAnswered 만 보면 충분하고, 그래야 스케줄러나 알림 상태를 미리 짓지 않습니다.
 *
 * 순수 함수로 빼 둔 이유는 시간 의존 로직을 화면 밖에서 테스트하기 위해서입니다.
 *
 * @param snoozedUntil "나중에" 를 눌러 미뤄 둔 시각(ms). 없으면 null
 */
export function shouldAskFollowUp(
  record: Pick<AnalysisRecord, 'createdAt' | 'emergencyLevel' | 'followUpAnswered'>,
  now: number,
  snoozedUntil: number | null,
): boolean {
  if (record.followUpAnswered) return false;
  if (snoozedUntil != null && now < snoozedUntil) return false;

  const createdAt = Date.parse(record.createdAt);
  if (Number.isNaN(createdAt)) return false;

  // 등급을 읽지 못하면 가장 늦게(NORMAL 기준) 묻습니다. 급하지 않은 쪽으로 틀리는 편이 낫습니다.
  const level = toTriageLevel(record.emergencyLevel) ?? 'NORMAL';
  return now - createdAt >= FOLLOW_UP_DELAY_HOURS[level] * HOUR_MS;
}
