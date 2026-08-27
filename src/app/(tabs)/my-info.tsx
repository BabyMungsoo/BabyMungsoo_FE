import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setAuthToken, usersApi } from '@/api';
import AuthImage from '@/components/common/AuthImage';
import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { useDeletePet, usePets } from '@/hooks/queries/use-pets';
import { useSessionStore } from '@/stores/use-session-store';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  elevation: 1,
};

export default function MyInfoScreen() {
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const clearSession = useSessionStore((state) => state.clearSession);

  const {
    data: user,
    isPending: userPending,
    error: userError,
  } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const { data: pets, isPending: petsPending, error: petsError } = usePets();

  const deletePetMutation = useDeletePet();

  const changePasswordMutation = useMutation({
    mutationFn: usersApi.changePassword,

    onSuccess: () => {
      setPasswordModalVisible(false);

      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');

      if (Platform.OS === 'web') {
        window.alert('비밀번호가 변경되었습니다.');
      } else {
        Alert.alert('변경 완료', '비밀번호가 변경되었습니다.');
      }
    },

    onError: (error) => {
      const message = error instanceof Error ? error.message : '비밀번호를 변경하지 못했습니다.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('변경 실패', message);
      }
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: usersApi.withdraw,

    onSuccess: () => {
      setAuthToken(null);
      clearSession();

      router.replace('/login');
    },

    onError: (error) => {
      const message = error instanceof Error ? error.message : '회원탈퇴 중 오류가 발생했습니다.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('회원탈퇴 실패', message);
      }
    },
  });

  const executeDeletePet = (petId: number, petName: string) => {
    deletePetMutation.mutate(petId, {
      onSuccess: () => {
        if (Platform.OS === 'web') {
          window.alert(`${petName}의 정보가 삭제되었습니다.`);
        } else {
          Alert.alert('삭제 완료', `${petName}의 정보가 삭제되었습니다.`);
        }
      },

      onError: (error) => {
        console.error('반려동물 삭제 실패:', error);

        const message =
          error instanceof Error ? error.message : '반려동물 정보를 삭제하지 못했습니다.';

        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('삭제 실패', message);
        }
      },
    });
  };

  const handleDeletePet = (petId: number, petName: string) => {
    if ((pets?.length ?? 0) <= 1) {
      const message = '최소 1마리의 반려동물은 등록되어 있어야 합니다.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('삭제할 수 없어요', message);
      }

      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${petName}의 정보를 정말 삭제할까요?\n삭제한 정보는 복구할 수 없습니다.`,
      );

      if (!confirmed) {
        return;
      }

      executeDeletePet(petId, petName);

      return;
    }

    Alert.alert(
      '반려동물 삭제',
      `${petName}의 정보를 정말 삭제할까요?\n삭제한 정보는 복구할 수 없습니다.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => executeDeletePet(petId, petName),
        },
      ],
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      showMessage('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword.length > 64) {
      showMessage('새 비밀번호는 64자 이하여야 합니다.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      showMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleWithdraw = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('정말 회원탈퇴할까요?\n저장된 정보가 삭제될 수 있습니다.');

      if (confirmed) {
        withdrawMutation.mutate();
      }

      return;
    }

    Alert.alert('회원탈퇴', '정말 회원탈퇴할까요?\n저장된 정보가 삭제될 수 있습니다.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: () => withdrawMutation.mutate(),
      },
    ]);
  };

  if (userPending || petsPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper" edges={['top']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (userError || petsError) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
        <Header title="내 정보 확인" />

        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-sm text-red-500">정보를 불러오지 못했습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <Header title="내 정보 확인" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* 내 계정 */}
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          <Text className="mb-4 text-base font-bold text-ink">내 계정</Text>

          <InfoRow label="이름" value={user?.name ?? '-'} />

          <Divider />

          <InfoRow label="이메일" value={user?.email ?? '-'} />
        </View>

        {/* 등록된 반려동물 */}
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          <Text className="mb-4 text-base font-bold text-ink">등록된 반려동물</Text>

          {pets?.length ? (
            <View className="gap-3">
              {pets.map((pet) => (
                <View
                  key={pet.petId}
                  className="flex-row items-center rounded-xl bg-paper px-3 py-3"
                >
                  <View className="h-12 w-12 overflow-hidden rounded-full bg-brand-100">
                    {pet.profileImage ? (
                      <AuthImage path={pet.profileImage} className="h-full w-full" />
                    ) : (
                      <View className="h-full w-full items-center justify-center">
                        <Text className="font-bold text-brand-700">{pet.name.slice(0, 1)}</Text>
                      </View>
                    )}
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-ink">{pet.name}</Text>

                    <Text className="mt-1 text-xs text-ink-muted">
                      {pet.breed} · {pet.age}세
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDeletePet(pet.petId, pet.name)}
                    disabled={deletePetMutation.isPending || (pets?.length ?? 0) <= 1}
                    className="rounded-lg px-3 py-2 active:opacity-60"
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        (pets?.length ?? 0) <= 1 ? 'text-gray-300' : 'text-red-500'
                      }`}
                    >
                      삭제
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-ink-muted">등록된 반려동물이 없습니다.</Text>
          )}

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/pet-info',
                params: {
                  mode: 'add',
                },
              } as never)
            }
            className="mt-4 h-12 items-center justify-center rounded-xl border border-brand-400 bg-white active:opacity-70"
          >
            <Text className="text-sm font-semibold text-brand-700">+ 반려동물 추가 등록하기</Text>
          </Pressable>
        </View>

        {/* 계정 관리 */}
        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <Pressable
            onPress={() => setPasswordModalVisible(true)}
            className="px-5 py-4 active:opacity-60"
          >
            <Text className="font-medium text-ink">비밀번호 변경</Text>
          </Pressable>

          <View className="h-px bg-ink-line" />

          <Pressable onPress={handleWithdraw} className="px-5 py-4 active:opacity-60">
            <Text className="font-medium text-red-500">회원탈퇴</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 비밀번호 변경 모달 */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/30 px-5">
          <View
            className="w-full rounded-2xl bg-white p-5"
            style={{
              maxWidth: 380,
            }}
          >
            <Text className="text-lg font-bold text-ink">비밀번호 변경</Text>

            <Text className="mt-1 text-sm text-ink-muted">
              현재 비밀번호를 확인한 뒤 새 비밀번호를 설정해줘.
            </Text>

            <View className="mt-5 gap-4">
              <AppInput
                placeholder="현재 비밀번호"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />

              <AppInput
                placeholder="새 비밀번호"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />

              <AppInput
                placeholder="새 비밀번호 확인"
                secureTextEntry
                value={newPasswordConfirm}
                onChangeText={setNewPasswordConfirm}
                autoCapitalize="none"
              />
            </View>

            <View className="mt-6 gap-2">
              <PrimaryButton
                title={changePasswordMutation.isPending ? '변경 중...' : '변경하기'}
                onPress={handleChangePassword}
              />

              <Pressable
                onPress={() => setPasswordModalVisible(false)}
                className="h-11 items-center justify-center rounded-xl active:bg-gray-100"
              >
                <Text className="text-sm font-semibold text-ink-muted">취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View className="relative h-14 flex-row items-center justify-center px-5">
      <Pressable
        onPress={() => router.replace('/my-page' as never)}
        className="absolute left-5 h-10 w-10 items-center justify-center rounded-full active:bg-black/5"
        hitSlop={8}
      >
        <Text className="text-2xl text-ink">‹</Text>
      </Pressable>

      <Text className="text-lg font-bold text-ink">{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-sm text-ink-muted">{label}</Text>

      <Text className="max-w-[70%] text-right text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-ink-line" />;
}

function showMessage(message: string) {
  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }

  Alert.alert('확인', message);
}
