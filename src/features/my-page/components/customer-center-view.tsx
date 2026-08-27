import { Pressable, ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/screen-header';
import { MenuDivider, MenuRow } from '@/features/my-page/components/menu-row';

interface CustomerCenterViewProps {
  onPressFaq: () => void;
  onPressInquiry: () => void;
  onPressInquiryHistory: () => void;
  onPressGuide: () => void;
  onPressPrivacyPolicy: () => void;
  onPressTerms: () => void;
  onPressLogout: () => void;
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

/**
 * 12번 — 고객센터. 문의/가이드/약관 화면과 로그인 인증이 아직 없어
 * 각 행은 눌러도 이동하지 않고 안내만 뜨도록 라우트에서 처리합니다.
 */
export function CustomerCenterView({
  onPressFaq,
  onPressInquiry,
  onPressInquiryHistory,
  onPressGuide,
  onPressPrivacyPolicy,
  onPressTerms,
  onPressLogout,
}: CustomerCenterViewProps) {
  return (
    <>
      <ScreenHeader title="고객센터" showBack backFallback="/my-page" />

      <ScrollView contentContainerClassName="gap-4 px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <MenuRow icon="help-circle-outline" label="자주 묻는 질문" onPress={onPressFaq} />
          <MenuDivider />
          <MenuRow
            icon="chatbubble-ellipses-outline"
            label="1:1 문의하기"
            onPress={onPressInquiry}
          />
          <MenuDivider />
          <MenuRow icon="document-text-outline" label="문의 내역" onPress={onPressInquiryHistory} />
        </View>

        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <MenuRow icon="book-outline" label="앱 사용 가이드" onPress={onPressGuide} />
          <MenuDivider />
          <MenuRow
            icon="document-lock-outline"
            label="개인정보 처리방침"
            onPress={onPressPrivacyPolicy}
          />
          <MenuDivider />
          <MenuRow icon="document-outline" label="서비스 이용약관" onPress={onPressTerms} />
        </View>

        <Pressable
          onPress={onPressLogout}
          accessibilityRole="button"
          className="items-center rounded-2xl border border-red-200 bg-red-50 py-4 active:opacity-70"
        >
          <Text className="text-base font-bold text-red-500">로그아웃</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
