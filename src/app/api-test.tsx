import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/api';
import { usePets } from '@/hooks/queries/use-pets';

/**
 * 백엔드 연결 확인용 임시 화면입니다.
 * 각자 기능 브랜치에서 실제 화면으로 교체해 주세요.
 */
export default function HomeScreen() {
  const { data: pets, isPending, error, refetch } = usePets();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="gap-4 p-5">
        <Text className="text-2xl font-bold text-brand-600">아기멍수</Text>

        <View className="gap-1 rounded-xl bg-brand-50 p-4">
          <Text className="text-xs font-semibold text-brand-700">API BASE URL</Text>
          <Text className="text-xs text-brand-900">{API_BASE_URL}</Text>
        </View>

        <Text className="text-base font-semibold">GET /pets 연결 확인</Text>

        {isPending && <ActivityIndicator />}

        {error && (
          <View className="gap-2 rounded-xl bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error.message}</Text>
            <Text className="text-xs text-red-500" onPress={() => refetch()}>
              다시 시도
            </Text>
          </View>
        )}

        {pets?.length === 0 && (
          <Text className="text-sm text-gray-500">연결은 됐지만 등록된 반려동물이 없습니다.</Text>
        )}

        {pets?.map((pet) => (
          <View key={pet.petId} className="gap-1 rounded-xl border border-gray-200 p-4">
            <Text className="text-base font-semibold">{pet.name}</Text>
            <Text className="text-sm text-gray-500">
              {pet.breed} · {pet.age}살 · {pet.gender === 'MALE' ? '수컷' : '암컷'}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
