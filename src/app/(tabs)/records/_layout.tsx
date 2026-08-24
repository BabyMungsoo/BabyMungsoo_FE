import { Stack } from 'expo-router';

/** 분석기록 탭 안의 스택 — 상세로 들어가도 하단 탭바는 그대로 남습니다 (피그마 7번) */
export default function RecordsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
