import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyPageView, type PetSummary } from '@/features/my-page/components/my-page-view';
import { usePets } from '@/hooks/queries/use-pets';

function showComingSoon() {
  Alert.alert('준비 중이에요', '아직 구현 중인 기능이에요.');
}

export default function MyPageScreen() {
  const router = useRouter();

  const { data: pets, isPending, error } = usePets();

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper" edges={['top']}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-paper px-6" edges={['top']}>
        <Text className="text-center text-red-500">마이페이지 정보를 불러오지 못했습니다.</Text>
      </SafeAreaView>
    );
  }

  const pet = pets?.[0];

  const petSummary: PetSummary | null = pet
    ? {
        name: pet.name,
        ageLabel: `${pet.age}세`,
        gender: pet.gender,
        weightKg: pet.weight ?? 0,
        breed: pet.breed,
        profileImage: pet.profileImage,
      }
    : null;

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <MyPageView
        pet={petSummary}
        onPressProfile={() => router.push('/pet-profile' as never)}
        onPressMyInfo={() => router.push('/my-info' as never)}
        onPressAddPet={() =>
          router.push({
            pathname: '/pet-info',
            params: {
              mode: 'add',
            },
          } as never)
        }
        onPressRecords={() => router.push('/records')}
        onPressFavoriteHospitals={showComingSoon}
        onPressNotificationSettings={() => router.push('/notification-settings')}
        onPressCustomerCenter={() => router.push('/customer-center')}
        onPressAppInfo={showComingSoon}
      />
    </SafeAreaView>
  );
}
