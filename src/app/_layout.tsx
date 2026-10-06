import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/lib/query-client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

import { setAuthToken } from '@/api';
import { THEME_VARS } from '@/constants/theme';
import { useSessionStore } from '@/stores/use-session-store';
import { useThemeColors, useThemeStore } from '@/stores/use-theme-store';
import { normalizeRole } from '@/types/auth';

export default function RootLayout() {
  const setSession = useSessionStore((state) => state.setSession);
  const isDark = useThemeStore((state) => state.isDark);
  const colors = useThemeColors();

  useEffect(() => {
    useThemeStore
      .getState()
      .restore()
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const [accessToken, userId, email, name, role] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('email'),
        AsyncStorage.getItem('name'),
        AsyncStorage.getItem('role'),
      ]);

      if (
        !accessToken ||
        !userId ||
        !email ||
        !name ||
        !Number.isSafeInteger(Number(userId)) ||
        useSessionStore.getState().isHydrated
      ) {
        return;
      }

      setAuthToken(accessToken);

      setSession({
        accessToken,
        userId: Number(userId),
        email,
        name,
        role: normalizeRole(role),
      });
    };

    restoreSession()
      .catch(() => undefined)
      .finally(() => useSessionStore.getState().finishHydration());
  }, [setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* paper·ink 테마 색(CSS 변수)을 여기서 주입합니다 — 아래 모든 화면이 따라갑니다 */}
        <View
          className="flex-1 items-center"
          style={[THEME_VARS[isDark ? 'dark' : 'light'], { backgroundColor: colors.frame }]}
        >
          <View className="w-full max-w-[430px] flex-1 bg-paper">
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="pet-info" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="find-id" />
              <Stack.Screen name="find-password" />
              <Stack.Screen name="triage/[sessionId]" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </View>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
