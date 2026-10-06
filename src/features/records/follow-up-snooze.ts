import AsyncStorage from '@react-native-async-storage/async-storage';

import { FOLLOW_UP_SNOOZE_HOURS } from '@/constants/visit';

const KEY_PREFIX = 'follow-up-snooze:';

/**
 * "나중에" 를 누른 기록을 하루 동안 다시 묻지 않게 합니다.
 *
 * 서버에 보내지 않습니다. 미루는 건 이 기기에서의 편의일 뿐이고, 진짜 답(다녀왔다/안 갔다)만
 * 서버로 갑니다. 영구 닫기는 두지 않습니다 — 팔로우업을 영영 못 받게 되기 때문입니다.
 *
 * 저장소 접근이 실패해도 화면이 멈추면 안 되므로, 읽기 실패는 "미뤄 둔 적 없음"으로 봅니다.
 */
export async function readSnoozedUntil(recordId: number): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + recordId);
    if (raw == null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function snooze(recordId: number): Promise<number> {
  const until = Date.now() + FOLLOW_UP_SNOOZE_HOURS * 60 * 60 * 1000;
  try {
    await AsyncStorage.setItem(KEY_PREFIX + recordId, String(until));
  } catch {
    // 저장에 실패하면 다음 진입 때 다시 물어볼 뿐입니다. 막을 일은 아닙니다.
  }
  return until;
}
