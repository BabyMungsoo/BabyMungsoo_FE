import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyPageView, type PetSummary } from '@/features/my-page/components/my-page-view';

const SAMPLE_PET: PetSummary = {
  name: '푸들이',
  ageLabel: '5세',
  gender: 'MALE',
  weightKg: 4.2,
  breed: '푸들',
};

function showComingSoon() {
  Alert.alert('준비 중이에요', '아직 백엔드 연동 전이라 화면만 먼저 만들어 뒀어요.');
}

/** 10번 — 마이페이지 메인. 담당 범위 밖이라 백엔드 없이 샘플 데이터로 화면만 잡아 둡니다. */
export default function MyPageScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <MyPageView
        pet={SAMPLE_PET}
        onPressProfile={showComingSoon}
        onPressMyInfo={showComingSoon}
        onPressRecords={() => router.push('/records')}
        onPressFavoriteHospitals={showComingSoon}
        onPressNotificationSettings={() => router.push('/notification-settings')}
        onPressCustomerCenter={() => router.push('/customer-center')}
        onPressAppInfo={showComingSoon}
      />
    </SafeAreaView>
  );
}
