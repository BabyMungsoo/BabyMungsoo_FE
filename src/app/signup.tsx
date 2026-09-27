import PasswordRequirements from '@/components/auth/PasswordRequirements';
import { isValidPassword, PASSWORD_GUIDANCE } from '@/lib/password';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import ScreenHeader from '@/components/common/ScreenHeader';
import { useSignupStore } from '@/stores/use-signup-store';
import { authApi } from '@/api/auth';

// 백엔드 @Email 검증 전에 프론트에서도 간단하게 확인
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email) return '이메일을 입력해주세요.';
  if (!EMAIL_REGEX.test(email)) return '올바른 이메일 형식을 입력해주세요.';
  return null;
}

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // 중복 확인을 통과한 이메일. 입력값이 바뀌면 다시 확인해야 합니다.
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const setSignupDraft = useSignupStore((state) => state.setSignupDraft);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setCheckedEmail(null);
    setEmailMessage(null);
  };

  const handleCheckEmail = async () => {
    const trimmedEmail = email.trim();
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setEmailMessage({ text: emailError, ok: false });
      return;
    }

    setCheckingEmail(true);
    setEmailMessage(null);
    try {
      const available = await authApi.checkEmail(trimmedEmail);
      setCheckedEmail(available ? trimmedEmail : null);
      setEmailMessage(
        available
          ? { text: '사용 가능한 이메일입니다.', ok: true }
          : { text: '이미 사용중인 이메일입니다.', ok: false },
      );
    } catch (error) {
      setEmailMessage({
        text: error instanceof Error ? error.message : '이메일을 확인하지 못했습니다.',
        ok: false,
      });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleNext = () => {
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    if (checkedEmail !== trimmedEmail) {
      setErrorMessage('이메일 중복 확인을 해주세요.');
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

    if (!isValidPassword(password)) {
      setErrorMessage(PASSWORD_GUIDANCE);
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
          <View className="gap-2">
            <Text className="text-[14px] font-semibold text-[#444444]">이메일</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <AppInput
                  accessibilityLabel="이메일"
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => void handleCheckEmail()}
                disabled={checkingEmail || !email.trim()}
                className={`h-14 items-center justify-center rounded-xl px-4 ${
                  checkingEmail || !email.trim() ? 'bg-gray-200' : 'bg-[#FFD83D] active:opacity-70'
                }`}
              >
                <Text className="text-sm font-semibold text-gray-900">
                  {checkingEmail ? '확인 중...' : '중복 확인'}
                </Text>
              </Pressable>
            </View>
            {emailMessage ? (
              <Text
                accessibilityRole={emailMessage.ok ? undefined : 'alert'}
                className={`text-sm ${emailMessage.ok ? 'text-green-600' : 'text-red-500'}`}
              >
                {emailMessage.text}
              </Text>
            ) : null}
          </View>

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
          <PasswordRequirements password={password} confirmation={passwordConfirm} />
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
