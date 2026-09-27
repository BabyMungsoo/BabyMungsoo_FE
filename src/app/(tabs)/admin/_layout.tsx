import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSessionStore } from '@/stores/use-session-store';

export default function AdminLayout() {
  const { role, accessToken, isHydrated } = useSessionStore();
  if (!isHydrated)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  if (!accessToken) return <Redirect href="/login" />;
  if (role !== 'ADMIN') return <Redirect href="/my-page" />;
  // UI guard only. Every /admin API must independently enforce ADMIN on the server.
  return <Stack screenOptions={{ headerShown: false }} />;
}
