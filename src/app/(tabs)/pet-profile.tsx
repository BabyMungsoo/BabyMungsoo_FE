import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthImage from '@/components/common/AuthImage';
import { usePets } from '@/hooks/queries/use-pets';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export default function PetProfileScreen() {
  const { data: pets, isPending, error } = usePets();

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper" edges={['top']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || !pets?.length) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
        <Header title="프로필 보기" />

        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-sm text-ink-muted">반려동물 정보를 불러오지 못했습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pet = pets[0];

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <Header title="프로필 보기" />

      <View className="flex-1 gap-4 px-5 pt-2">
        {/* 프로필 카드 */}
        <View className="items-center rounded-2xl bg-paper-card p-6" style={CARD_SHADOW}>
          <View className="h-28 w-28 overflow-hidden rounded-full bg-brand-100">
            {pet.profileImage ? (
              <AuthImage path={pet.profileImage} className="h-full w-full" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Text className="text-3xl font-bold text-brand-700">{pet.name.slice(0, 1)}</Text>
              </View>
            )}
          </View>

          <Text className="mt-4 text-xl font-bold text-ink">{pet.name}</Text>

          <Text className="mt-1 text-sm text-ink-muted">{pet.breed}</Text>
        </View>

        {/* 상세 정보 카드 */}
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          <InfoRow label="이름" value={pet.name} />

          <Divider />

          <InfoRow label="품종" value={pet.breed} />

          <Divider />

          <InfoRow label="나이" value={`${pet.age}세`} />

          <Divider />

          <InfoRow label="성별" value={pet.gender === 'MALE' ? '남아' : '여아'} />

          <Divider />

          <InfoRow label="체중" value={pet.weight != null ? `${pet.weight}kg` : '미등록'} />

          <Divider />

          <InfoRow label="중성화" value={pet.isNeutered ? '완료' : '미완료'} />

          <Divider />

          <InfoRow label="특이사항" value={pet.underlyingDisease || '없음'} />
        </View>
      </View>
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

      <Text className="max-w-[65%] text-right text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-ink-line" />;
}
