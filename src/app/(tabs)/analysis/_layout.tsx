import { Stack } from 'expo-router';

/** 분석 진행·결과(8·4번) 스택 — 홈에서 넘어와도 하단 탭바는 그대로 남습니다 */
export default function AnalysisLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
