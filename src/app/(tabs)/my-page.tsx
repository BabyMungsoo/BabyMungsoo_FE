import { petAgeLabel } from '@/lib/pet-age';
import { useRef, useState } from 'react';
import { clearLocalSession } from '@/lib/logout';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyPageView, type PetSummary } from '@/features/my-page/components/my-page-view';
import { usePets } from '@/hooks/queries/use-pets';

function showComingSoon() {
  Alert.alert('준비 중이에요', '아직 구현 중인 기능이에요.');
}

export default function MyPageScreen() {
  const router = useRouter();

  const { data: pets, isPending, error } = usePets();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const logoutBusy = useRef(false);
  const handleLogout = async () => {
    if (logoutBusy.current) return;
    logoutBusy.current = true;
    setLoggingOut(true);
    setLogoutError('');
    try {
      await clearLocalSession();
      router.replace('/login');
    } catch {
      setLogoutError('로그인 정보를 삭제하지 못했어요. 다시 시도해주세요.');
    } finally {
      logoutBusy.current = false;
      setLoggingOut(false);
    }
  };

  const pet = pets?.[0];

  const petSummary: PetSummary | null = pet
    ? {
        name: pet.name,
        ageLabel: petAgeLabel(pet.age, pet.birthDate),
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
        onPressLogout={handleLogout}
        loggingOut={loggingOut}
        statusMessage={
          logoutError ||
          (error
            ? '반려동물 정보를 불러오지 못했습니다.'
            : isPending
              ? '반려동물 정보를 불러오는 중입니다.'
              : '')
        }
        onPressProfile={() =>
          router.push({ pathname: '/pet-profile', params: { petId: String(pet?.petId ?? '') } })
        }
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
