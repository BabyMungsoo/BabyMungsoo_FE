// 로그인
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { petsApi, setAuthToken } from '@/api';
import AppInput from '@/components/common/AppInput';
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
    });

    if (rememberLogin) {
      await AsyncStorage.setItem(
        'accessToken',
        result.accessToken,
      );
      await AsyncStorage.setItem(
        'userId',
        String(result.userId),
      );
      await AsyncStorage.setItem(
        'email',
        result.email,
      );
      await AsyncStorage.setItem(
        'name',
        result.name,
      );
    } else {
      await AsyncStorage.multiRemove([
        'accessToken',
        'userId',
        'email',
        'name',
      ]);
    }

    // 펫 존재 여부와 상관없이 로그인 성공 후 홈으로 이동
    router.replace('/(tabs)' as never);
  } catch (error) {
    setLoginError(
      error instanceof Error
        ? error.message
        : '로그인에 실패했습니다.',
    );
  }
};

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 노란 영역 */}
        <View className="h-[230px] items-center justify-end bg-[#FFD83D]">
          <Image
            source={require('../../assets/images/icons/main-dog.png')}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>

        <View className="flex-1 px-6 pt-10">
          <Text className="text-center text-[28px] font-bold leading-[38px] text-gray-900">
            우리 아이{'\n'}
            건강을 지켜주세요!
          </Text>

          <Text className="mt-3 text-center text-sm text-gray-500">
            반려견 응급 상황, AI가 함께합니다.
          </Text>

          <View className="mt-8 gap-4">
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
              >
                <Image
                  source={require('../../assets/images/icons/eye.png')}
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </View>

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

          <Pressable
            onPress={() => router.push('/signup')}
            className="mb-8 mt-14 h-14 items-center justify-center rounded-xl border border-gray-400"
          >
            <Text className="font-semibold text-gray-800">회원가입</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
