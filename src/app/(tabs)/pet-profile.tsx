import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthImage from '@/components/common/AuthImage';
import { ScreenHeader } from '@/components/ui/screen-header';
import { usePets } from '@/hooks/queries/use-pets';
import { petAgeLabel } from '@/lib/pet-age';
import { useThemeColors } from '@/stores/use-theme-store';

// 마이페이지 카드와 같은 그림자
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export default function PetProfileScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pets, isPending, error, refetch } = usePets();
  const colors = useThemeColors();
  const pet = petId ? pets?.find((item) => item.petId === Number(petId)) : pets?.[0];
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="반려동물 프로필" showBack backTo="/my-page" />
      {isPending ? (
        <ActivityIndicator className="mt-10" />
      ) : error || !pet ? (
        <View className="gap-4 p-6">
          <Text className="text-ink-muted">프로필을 불러오지 못했어요.</Text>
          <Pressable onPress={() => refetch()}>
            <Text className="font-semibold text-ink">다시 불러오기</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pt-2 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl bg-paper-card p-4" style={CARD_SHADOW}>
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-100">
                {pet.profileImage ? (
                  <AuthImage path={pet.profileImage} className="h-full w-full" />
                ) : (
                  <Ionicons name="paw-outline" size={30} color="#b0830c" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold leading-8 text-ink">{pet.name}</Text>
                <Text className="mt-1 text-sm text-ink-muted">{pet.breed}</Text>
              </View>
            </View>
            <View className="mt-4 flex-row rounded-xl bg-paper py-3">
              {[
                ['나이', petAgeLabel(pet.age, pet.birthDate)],
                ['성별', pet.gender === 'MALE' ? '남아' : '여아'],
                ['체중', pet.weight != null ? pet.weight + 'kg' : '미등록'],
              ].map(([label, value]) => (
                <View key={label} className="flex-1 items-center gap-1">
                  <Text className="text-xs text-ink-muted">{label}</Text>
                  <Text className="text-sm font-semibold text-ink">{value}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="rounded-2xl bg-paper-card px-4" style={CARD_SHADOW}>
            <Row label="생년월일" value={pet.birthDate || '미등록'} />
            <Row label="중성화" value={pet.isNeutered ? '완료' : '미완료'} />
            <View className="gap-2 py-4">
              <Text className="text-xs font-semibold text-ink-muted">특이사항</Text>
              <Text className="text-sm leading-6 text-ink">
                {pet.underlyingDisease || '등록된 특이사항이 없어요.'}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/pet-info',
                params: { mode: 'edit', petId: String(pet.petId) },
              })
            }
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-ink active:opacity-80"
          >
            <Ionicons name="create-outline" size={18} color={colors.paper} />
            <Text className="text-sm font-semibold text-paper">프로필 수정하기</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-ink-line py-4">
      <Text className="text-sm text-ink-muted">{label}</Text>
      <Text className="text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}
