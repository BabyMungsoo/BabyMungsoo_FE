import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthImage from '@/components/common/AuthImage';
import { ScreenHeader } from '@/components/ui/screen-header';
import { usePets } from '@/hooks/queries/use-pets';
import { petAgeLabel } from '@/lib/pet-age';

export default function PetProfileScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pets, isPending, error, refetch } = usePets();
  const pet = petId ? pets?.find((item) => item.petId === Number(petId)) : pets?.[0];
  return (
    <SafeAreaView className="flex-1 bg-[#F5F6F8]" edges={['top']}>
      <ScreenHeader title="반려동물 프로필" showBack backTo="/my-page" />
      {isPending ? (
        <ActivityIndicator className="mt-10" />
      ) : error || !pet ? (
        <View className="gap-4 p-6">
          <Text className="text-slate-600">프로필을 불러오지 못했어요.</Text>
          <Pressable onPress={() => refetch()}>
            <Text className="font-semibold text-slate-800">다시 불러오기</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pt-2 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-slate-200 bg-white p-4">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {pet.profileImage ? (
                  <AuthImage path={pet.profileImage} className="h-full w-full" />
                ) : (
                  <Ionicons name="paw-outline" size={30} color="#475569" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold leading-8 text-slate-900">{pet.name}</Text>
                <Text className="mt-1 text-sm text-slate-600">{pet.breed}</Text>
              </View>
            </View>
            <View className="mt-4 flex-row rounded-xl bg-slate-50 py-3">
              {[
                ['나이', petAgeLabel(pet.age, pet.birthDate)],
                ['성별', pet.gender === 'MALE' ? '남아' : '여아'],
                ['체중', pet.weight != null ? pet.weight + 'kg' : '미등록'],
              ].map(([label, value]) => (
                <View key={label} className="flex-1 items-center gap-1">
                  <Text className="text-xs text-slate-500">{label}</Text>
                  <Text className="text-sm font-semibold text-slate-800">{value}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className="rounded-2xl border border-slate-200 bg-white px-4">
            <Row label="생년월일" value={pet.birthDate || '미등록'} />
            <Row label="중성화" value={pet.isNeutered ? '완료' : '미완료'} />
            <View className="gap-2 py-4">
              <Text className="text-xs font-semibold text-slate-500">특이사항</Text>
              <Text className="text-sm leading-6 text-slate-800">
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
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-slate-800"
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text className="text-sm font-semibold text-white">프로필 수정하기</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-100 py-4">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-medium text-slate-800">{value}</Text>
    </View>
  );
}
