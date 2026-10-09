import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { FavoriteButton } from '@/features/hospitals/components/favorite-button';
import { callHospital } from '@/features/hospitals/phone';
import { useFavoriteHospitals } from '@/hooks/queries/use-favorites';
import { isMissing, type Hospital } from '@/types';

/**
 * 마이페이지 → 즐겨찾는 병원.
 *
 * 지도 병원 카드나 결과 화면 '가까운 동물병원' 의 별로 추가한 병원을 최근 추가한 순으로 보여 줍니다.
 * 응급 상황에 바로 쓰도록 행마다 전화 버튼을 두고, 별을 다시 누르면 목록에서 빠집니다.
 */
export default function FavoriteHospitalsScreen() {
  const router = useRouter();
  const { data, isPending, error, refetch } = useFavoriteHospitals();

  const openOnMap = (hospital: Hospital) =>
    router.push({ pathname: '/hospitals', params: { hospitalId: String(hospital.hospitalId) } });

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="즐겨찾는 병원" showBack backTo="/my-page" />

      <ScrollView contentContainerClassName="gap-3 px-5 pb-8" showsVerticalScrollIndicator={false}>
        {isPending && (
          <View className="items-center rounded-2xl bg-paper-card p-6">
            <ActivityIndicator />
          </View>
        )}

        {error && (
          <View className="gap-2 rounded-2xl bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error.message}</Text>
            <Pressable onPress={() => refetch()} accessibilityRole="button">
              <Text className="text-xs font-semibold text-red-500">다시 시도</Text>
            </Pressable>
          </View>
        )}

        {data && data.length === 0 && (
          <View className="items-center gap-2 rounded-2xl bg-paper-card px-5 py-8">
            <Ionicons name="star-outline" size={28} color="#d5d0c6" />
            <Text className="text-base font-semibold text-ink">아직 즐겨찾는 병원이 없어요</Text>
            <Text className="text-center text-sm leading-5 text-ink-muted">
              병원 찾기에서 자주 가는 병원의 ☆를 눌러{'\n'}추가해 보세요.
            </Text>
            <Pressable
              onPress={() => router.push('/hospitals')}
              accessibilityRole="button"
              className="mt-2 flex-row items-center gap-1.5 rounded-full bg-brand-400 px-5 py-2.5 active:opacity-70"
            >
              <Ionicons name="location" size={16} color="#5c4408" />
              <Text className="text-sm font-bold text-brand-900">병원 찾기</Text>
            </Pressable>
          </View>
        )}

        {data && data.length > 0 && (
          <View className="overflow-hidden rounded-2xl bg-paper-card">
            {data.map(({ hospital }, index) => (
              <View key={hospital.hospitalId}>
                {index > 0 && <View className="mx-4 h-px bg-ink-line" />}
                <FavoriteRow hospital={hospital} onPress={() => openOnMap(hospital)} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FavoriteRow({ hospital, onPress }: { hospital: Hospital; onPress: () => void }) {
  const canCall = !isMissing(hospital.phone);

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <FavoriteButton hospital={hospital} />

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${hospital.hospitalName} 지도에서 보기`}
        className="flex-1 gap-0.5 active:opacity-70"
      >
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink text-sm font-bold text-ink" numberOfLines={1}>
            {hospital.hospitalName}
          </Text>
          {hospital.is24hour && (
            <Text className="text-xs font-semibold text-triage-normal">24시간</Text>
          )}
        </View>
        <Text className="text-xs text-ink-soft" numberOfLines={1}>
          {hospital.address}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => callHospital(hospital.phone)}
        disabled={!canCall}
        accessibilityRole="button"
        accessibilityLabel={canCall ? `${hospital.hospitalName}에 전화 걸기` : '전화번호 없음'}
        accessibilityState={{ disabled: !canCall }}
        hitSlop={6}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          canCall ? 'bg-brand-400 active:opacity-70' : 'bg-paper-chip'
        }`}
      >
        <Ionicons name="call" size={18} color={canCall ? '#5c4408' : '#a9a296'} />
      </Pressable>
    </View>
  );
}
