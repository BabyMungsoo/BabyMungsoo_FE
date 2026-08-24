// 로그인
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
export default function LoginScreen() {
  const [rememberLogin, setRememberLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
              placeholder="이메일 또는 아이디"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* 비밀번호 입력창 */}
            <View className="relative">
              <AppInput
                placeholder="비밀번호"
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
                rememberLogin
                  ? 'border-[#FFD83D] bg-[#FFD83D]'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {rememberLogin && (
                <Text className="text-xs font-bold text-white">✓</Text>
              )}
            </View>

            <Text className="text-sm text-gray-700">
              로그인 상태 유지
            </Text>
          </Pressable>

          <View className="mt-8">
            <PrimaryButton
              title="로그인"
              onPress={() => router.push('/pet-info')}
            />
          </View>

          <View className="mt-6 flex-row items-center justify-center">
            <Pressable onPress={() => router.push('/find-id')}>
              <Text className="text-sm text-gray-600">
                아이디 찾기
              </Text>
            </Pressable>

            <View className="mx-4 h-3 w-px bg-gray-300" />

            <Pressable onPress={() => router.push('/find-password')}>
              <Text className="text-sm text-gray-600">
                비밀번호 찾기
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/signup')}
            className="mb-8 mt-14 h-14 items-center justify-center rounded-xl border border-gray-400"
          >
            <Text className="font-semibold text-gray-800">
              회원가입
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}