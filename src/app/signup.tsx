import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import ScreenHeader from '@/components/common/ScreenHeader';
import { useSignupStore } from '@/stores/use-signup-store';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const setSignupDraft = useSignupStore((state) => state.setSignupDraft);

  const handleNext = () => {
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    // 백엔드 @Email 검증 전에 프론트에서도 간단하게 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!trimmedName) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    if (trimmedName.length > 50) {
      setErrorMessage('이름은 50자 이하로 입력해주세요.');
      return;
    }

    if (trimmedPhone.length > 20) {
      setErrorMessage('전화번호는 20자 이하로 입력해주세요.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상 입력해주세요.');
      return;
    }

    if (password.length > 64) {
      setErrorMessage('비밀번호는 64자 이하로 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 아직 회원가입 API 호출 X
    // 반려동물 정보 입력 완료 후 실제 회원가입
    setSignupDraft({
      email: trimmedEmail,
      password,
      name: trimmedName,
      phone: trimmedPhone || undefined,
    });

    router.push('/pet-info');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="회원가입" />

        <View className="mt-6">
          <Text className="text-2xl font-bold text-gray-900">아기멍수 시작하기</Text>

          <Text className="mt-2 text-sm text-gray-500">보호자 정보를 입력해주세요.</Text>
        </View>

        <View className="mt-8 gap-5">
          <AppInput
            label="이메일"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <AppInput
            label="이름"
            placeholder="이름을 입력해주세요"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="전화번호 (선택)"
            placeholder="01012345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <AppInput
            label="비밀번호"
            placeholder="8자 이상 입력해주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppInput
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {errorMessage ? <Text className="mt-4 text-sm text-red-500">{errorMessage}</Text> : null}

        <View className="mt-8">
          <PrimaryButton title="다음" onPress={handleNext} />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">이미 계정이 있나요?</Text>

          <Pressable onPress={() => router.replace('/login')} className="ml-2">
            <Text className="text-sm font-semibold text-[#D7A900]">로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
