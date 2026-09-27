import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useSessionStore } from '@/stores/use-session-store';

export default function InquiryLayout() {
  const { accessToken, isHydrated } = useSessionStore();
  if (!isHydrated) return <ActivityIndicator />;
  if (!accessToken) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
