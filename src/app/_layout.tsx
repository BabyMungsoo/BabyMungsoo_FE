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
import { useSessionStore } from '@/stores/use-session-store';

export default function RootLayout() {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    const restoreSession = async () => {
      const [accessToken, userId, email, name] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('email'),
        AsyncStorage.getItem('name'),
      ]);

      if (!accessToken || !userId || !email || !name) {
        return;
      }

      setAuthToken(accessToken);

      setSession({
        accessToken,
        userId: Number(userId),
        email,
        name,
      });
    };

    restoreSession();
  }, [setSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />

        <View className="flex-1 items-center bg-gray-100">
          <View className="w-full max-w-[430px] flex-1 bg-white">
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
