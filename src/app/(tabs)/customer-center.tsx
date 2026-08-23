import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomerCenterView } from '@/features/my-page/components/customer-center-view';

function showComingSoon() {
  Alert.alert('준비 중이에요', '아직 백엔드 연동 전이라 화면만 먼저 만들어 뒀어요.');
}

/** 12번 — 고객센터. 문의/가이드/약관/로그아웃 모두 아직 붙일 백엔드가 없어 안내만 띄웁니다. */
export default function CustomerCenterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <CustomerCenterView
        onPressFaq={showComingSoon}
        onPressInquiry={showComingSoon}
        onPressInquiryHistory={showComingSoon}
        onPressGuide={showComingSoon}
        onPressPrivacyPolicy={showComingSoon}
        onPressTerms={showComingSoon}
        onPressLogout={showComingSoon}
      />
    </SafeAreaView>
  );
}
