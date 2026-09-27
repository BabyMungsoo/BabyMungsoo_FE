import PasswordRequirements from '@/components/auth/PasswordRequirements';
import { isValidPassword, PASSWORD_GUIDANCE } from '@/lib/password';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { recoveryApi } from '@/api/recovery';
import AppInput from '@/components/common/AppInput';

type RecoveryMode = 'id' | 'password';

export default function AccountRecoveryScreen({ mode }: { mode: RecoveryMode }) {
  const isId = mode === 'id';
  const title = isId ? '아이디 찾기' : '비밀번호 찾기';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emails, setEmails] = useState<string[] | null>(null);
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const runRequest = async (action: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof ApiError && cause.status
            ? cause.message
            : '서버에 연결하지 못했어요. 네트워크 연결을 확인하고 다시 시도해주세요.',
        );
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };

  // 메일 인증 없이 이메일·이름으로 계정을 확인하고, 받은 토큰은 화면에 보여주지 않고 들고만 있습니다
  const verifyAccount = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 100) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (!name.trim()) {
      setError('가입할 때 입력한 이름을 입력해주세요.');
      return;
    }
    void runRequest(async () => {
      const resetToken = await recoveryApi.requestReset({
        email: email.trim(),
        name: name.trim(),
      });
      if (!mounted.current) return;
      setToken(resetToken);
      setStep('confirm');
    });
  };

  const restartPasswordReset = () => {
    setStep('request');
    setToken('');
    setPassword('');
    setConfirmation('');
    setError('');
  };

  const handleSubmit = () => {
    if (busy.current) return;
    setError('');
    if (isId) {
      setEmails(null);
      if (!name.trim()) {
        setError('가입할 때 입력한 이름을 입력해주세요.');
        return;
      }
      if (!/^[0-9+() -]{7,20}$/.test(phone.trim()) || phone.replace(/\D/g, '').length < 7) {
        setError('올바른 전화번호를 입력해주세요.');
        return;
      }
      void runRequest(async () => {
        const result = await recoveryApi.findId({ name: name.trim(), phone: phone.trim() });
        if (mounted.current) setEmails(result.maskedEmails);
      });
    } else if (step === 'request') {
      verifyAccount();
    } else if (step === 'confirm') {
      if (!token) {
        restartPasswordReset();
        return;
      }
      if (!isValidPassword(password)) {
        setError(PASSWORD_GUIDANCE);
        return;
      }
      if (password !== confirmation) {
        setError('비밀번호가 일치하지 않아요.');
        return;
      }
      void runRequest(async () => {
        await recoveryApi.confirmReset({ token, newPassword: password });
        if (!mounted.current) return;
        setToken('');
        setPassword('');
        setConfirmation('');
        setStep('done');
      });
    }
  };

  const change = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError('');
    setEmails(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto w-full max-w-[480px] flex-1">
            <View className="h-14 flex-row items-center justify-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="로그인으로 돌아가기"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
                className="absolute left-0 h-11 w-11 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={24} color="#242424" />
              </Pressable>
              <Text className="text-lg font-bold text-gray-900">{title}</Text>
            </View>
            <View className="mt-8 flex-row rounded-2xl bg-[#F5F5F5] p-1">
              {(['id', 'password'] as const).map((tab) => (
                <Pressable
                  key={tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === tab, disabled: pending }}
                  disabled={pending}
                  onPress={() => {
                    if (mode !== tab) router.replace(tab === 'id' ? '/find-id' : '/find-password');
                  }}
                  className={`h-12 flex-1 items-center justify-center rounded-xl ${mode === tab ? 'bg-[#FFD83D]' : ''}`}
                >
                  <Text
                    className={`text-sm font-semibold ${mode === tab ? 'text-[#242424]' : 'text-gray-500'}`}
                  >
                    {tab === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="mt-10 h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8DA]">
              <Ionicons
                name={
                  step === 'done'
                    ? 'checkmark-circle-outline'
                    : isId
                      ? 'person-outline'
                      : 'lock-closed-outline'
                }
                size={30}
                color="#A17B00"
              />
            </View>
            <Text className="mt-6 text-[26px] font-bold leading-9 text-[#242424]">
              {isId
                ? '아이디를 잊으셨나요?'
                : step === 'done'
                  ? '비밀번호를 변경했어요'
                  : step === 'confirm'
                    ? '새 비밀번호를 설정해주세요'
                    : '비밀번호를 잊으셨나요?'}
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-gray-500">
              {isId
                ? '가입할 때 등록한 이름과 전화번호를 입력해주세요.\n아이디는 가입하신 이메일 주소입니다.'
                : step === 'done'
                  ? '새 비밀번호로 다시 로그인해주세요.'
                  : step === 'confirm'
                    ? '계정이 확인됐어요.\n15분 안에 새 비밀번호를 등록해주세요.'
                    : '가입한 이메일과 이름을 입력하면\n새 비밀번호를 등록할 수 있어요.'}
            </Text>
            <View className="mt-8 gap-5">
              {isId ? (
                <>
                  <AppInput
                    label="이름"
                    accessibilityLabel="이름"
                    placeholder="이름을 입력해주세요"
                    value={name}
                    maxLength={50}
                    editable={!pending}
                    autoCorrect={false}
                    onChangeText={change(setName)}
                  />
                  <AppInput
                    label="전화번호"
                    accessibilityLabel="전화번호"
                    placeholder="가입할 때 등록한 전화번호"
                    value={phone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    maxLength={20}
                    editable={!pending}
                    onChangeText={change(setPhone)}
                    onSubmitEditing={handleSubmit}
                  />
                </>
              ) : step === 'request' ? (
                <>
                  <AppInput
                    label="이메일"
                    accessibilityLabel="이메일"
                    placeholder="example@email.com"
                    value={email}
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={100}
                    editable={!pending}
                    onChangeText={change(setEmail)}
                  />
                  <AppInput
                    label="이름"
                    accessibilityLabel="이름"
                    placeholder="가입할 때 입력한 이름"
                    value={name}
                    maxLength={50}
                    autoCorrect={false}
                    editable={!pending}
                    onChangeText={change(setName)}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                  />
                </>
              ) : step === 'confirm' ? (
                <>
                  <Text className="text-sm text-gray-600">확인된 계정: {email.trim()}</Text>
                  <AppInput
                    label="새 비밀번호"
                    accessibilityLabel="새 비밀번호"
                    placeholder="8~64자로 입력해주세요"
                    value={password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    maxLength={64}
                    editable={!pending}
                    onChangeText={change(setPassword)}
                  />
                  <AppInput
                    label="새 비밀번호 확인"
                    accessibilityLabel="새 비밀번호 확인"
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={confirmation}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    maxLength={64}
                    editable={!pending}
                    onChangeText={change(setConfirmation)}
                    onSubmitEditing={handleSubmit}
                  />
                  <PasswordRequirements password={password} confirmation={confirmation} />
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: showPassword }}
                    onPress={() => setShowPassword((value) => !value)}
                    className="min-h-11 flex-row items-center gap-2"
                  >
                    <Ionicons
                      name={showPassword ? 'checkbox' : 'square-outline'}
                      size={20}
                      color="#806400"
                    />
                    <Text className="text-sm text-gray-600">비밀번호 표시</Text>
                  </Pressable>
                </>
              ) : null}
            </View>
            {error ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                className="mt-3 text-sm text-red-600"
              >
                {error}
              </Text>
            ) : null}
            {emails !== null ? (
              <View accessibilityLiveRegion="polite" className="mt-5 rounded-xl bg-[#FFF8DA] p-4">
                <Text className="text-sm font-semibold text-[#6B5400]">
                  {emails.length ? '가입하신 아이디입니다' : '일치하는 계정을 찾지 못했어요'}
                </Text>
                {emails.map((item) => (
                  <Text key={item} selectable className="mt-2 text-lg font-bold text-[#242424]">
                    {item}
                  </Text>
                ))}
                <Text className="mt-2 text-sm leading-5 text-[#6B5400]">
                  {emails.length
                    ? '개인정보 보호를 위해 이메일 일부만 표시됩니다.'
                    : '가입할 때 등록한 이름과 전화번호를 확인해주세요.'}
                </Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: pending, busy: pending }}
              disabled={pending}
              onPress={step === 'done' ? () => router.replace('/login') : handleSubmit}
              className={`mt-8 h-14 flex-row items-center justify-center gap-2 rounded-xl bg-[#FFD83D] ${pending ? 'opacity-60' : 'active:opacity-80'}`}
            >
              {pending ? <ActivityIndicator color="#242424" /> : null}
              <Text className="text-base font-bold text-[#242424]">
                {pending
                  ? '처리 중...'
                  : isId
                    ? '아이디 찾기'
                    : step === 'done'
                      ? '로그인하기'
                      : step === 'confirm'
                        ? '비밀번호 변경'
                        : '계정 확인'}
              </Text>
            </Pressable>
            {!isId && step === 'confirm' ? (
              <View className="mt-3 gap-1">
                <Pressable
                  accessibilityRole="button"
                  disabled={pending}
                  onPress={restartPasswordReset}
                  className="min-h-12 items-center justify-center"
                >
                  <Text className="text-sm text-gray-600">이메일·이름 다시 입력하기</Text>
                </Pressable>
              </View>
            ) : null}
            <View className="min-h-16 flex-1" />
            {step !== 'done' ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => router.replace('/login')}
                className="min-h-12 flex-row items-center justify-center gap-2"
              >
                <Text className="text-sm text-gray-500">로그인 정보를 찾으셨나요?</Text>
                <Text className="text-sm font-semibold text-[#242424]">로그인</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
