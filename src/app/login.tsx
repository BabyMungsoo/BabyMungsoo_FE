// 로그인
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setAuthToken } from '@/api';
import AppInput from '@/components/common/AppInput';
import BrandLogo from '@/components/common/BrandLogo';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useLogin } from '@/hooks/queries/use-auth';
import { useSessionStore } from '@/stores/use-session-store';

export default function LoginScreen() {
  const [rememberLogin, setRememberLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const loginMutation = useLogin();
  const setSession = useSessionStore((state) => state.setSession);

  const handleLogin = async () => {
    setLoginError('');

    if (!email.trim() || !password) {
      setLoginError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      setAuthToken(result.accessToken);

      setSession({
        userId: result.userId,
        accessToken: result.accessToken,
        email: result.email,
        name: result.name,
        role: result.role,
      });

      if (rememberLogin) {
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userId', String(result.userId));
        await AsyncStorage.setItem('email', result.email);
        await AsyncStorage.setItem('name', result.name);
        await AsyncStorage.setItem('role', result.role);
      } else {
        await AsyncStorage.multiRemove(['accessToken', 'userId', 'email', 'name', 'role']);
      }

      // 펫 존재 여부와 상관없이 로그인 성공 후 홈으로 이동
      router.replace('/(tabs)' as never);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fdfaf1]" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 영역 */}
        <View className="h-[230px] items-center justify-end">
          <View className="items-center gap-3">
            <BrandLogo size={96} variant="icon" />
            <Text className="text-lg font-extrabold tracking-tight text-[#2e2a24]">이멍전시</Text>
          </View>
        </View>

        <View className="flex-1 px-6 pt-10">
          <View className="gap-4">
            <AppInput
              placeholder="이메일"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {/* 비밀번호 입력창 */}
            <View className="relative">
              <AppInput
                placeholder="비밀번호"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="pr-14"
              />

              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-0 h-14 items-center justify-center"
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#8c867a"
                />
              </Pressable>
            </View>
          </View>

          {/* 로그인 에러 메시지 */}
          {loginError ? (
            <View className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <Text className="text-sm font-medium text-red-500">{loginError}</Text>
            </View>
          ) : null}

          {/* 로그인 상태 유지 */}
          <Pressable
            onPress={() => setRememberLogin((prev) => !prev)}
            className="mt-4 flex-row items-center gap-2"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded border ${
                rememberLogin ? 'border-[#FFD83D] bg-[#FFD83D]' : 'border-gray-300 bg-white'
              }`}
            >
              {rememberLogin && <Text className="text-xs font-bold text-white">✓</Text>}
            </View>

            <Text className="text-sm text-gray-700">로그인 상태 유지</Text>
          </Pressable>

          <View className="mt-8">
            <PrimaryButton
              title={loginMutation.isPending ? '로그인 중...' : '로그인'}
              onPress={handleLogin}
              disabled={loginMutation.isPending}
            />
          </View>

          <View className="mt-6 flex-row items-center justify-center">
            <Pressable onPress={() => router.push('/find-id')}>
              <Text className="text-sm text-gray-600">아이디 찾기</Text>
            </Pressable>

            <View className="mx-4 h-3 w-px bg-gray-300" />

            <Pressable onPress={() => router.push('/find-password')}>
              <Text className="text-sm text-gray-600">비밀번호 찾기</Text>
            </Pressable>
          </View>

          <View className="mb-8 mt-7 flex-row items-center justify-center gap-2">
            <Text className="text-sm text-gray-500">이멍전시가 처음인가요?</Text>
            <Pressable
              onPress={() => router.push('/signup')}
              accessibilityRole="link"
              className="py-2 active:opacity-60"
            >
              <Text className="text-sm font-semibold text-gray-800 underline">
                회원가입하러 가기 →
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
