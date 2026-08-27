import { Pressable, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/screen-header';
import { MenuDivider, MenuRow } from '@/features/my-page/components/menu-row';

export interface PetSummary {
  name: string;
  ageLabel: string;
  gender: 'MALE' | 'FEMALE';
  weightKg: number;
  breed: string;
}

interface MyPageViewProps {
  pet: PetSummary;
  onPressProfile: () => void;
  onPressMyInfo: () => void;
  onPressRecords: () => void;
  onPressFavoriteHospitals: () => void;
  onPressNotificationSettings: () => void;
  onPressCustomerCenter: () => void;
  onPressAppInfo: () => void;
}

const GENDER_SYMBOL: Record<PetSummary['gender'], string> = { MALE: '♂', FEMALE: '♀' };

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

/**
 * 10번 — 마이페이지 메인. 담당 범위 밖이라 백엔드 연동 없이 화면만 먼저 만들어 뒀습니다.
 * 서버 호출을 모르는 순수 표현 컴포넌트라, 라우트가 프로필 데이터와 각 행의 이동 동작만 채워 넣으면 됩니다.
 */
export function MyPageView({
  pet,
  onPressProfile,
  onPressMyInfo,
  onPressRecords,
  onPressFavoriteHospitals,
  onPressNotificationSettings,
  onPressCustomerCenter,
  onPressAppInfo,
}: MyPageViewProps) {
  return (
    <>
      <ScreenHeader title="마이페이지" />

      <View className="flex-1 gap-4 px-5 pt-2">
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <Text className="text-2xl font-bold text-brand-700">{pet.name.slice(0, 1)}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-lg font-bold text-ink">{pet.name}</Text>
              <Text className="text-sm text-ink-muted">
                {pet.ageLabel} {GENDER_SYMBOL[pet.gender]}
              </Text>
              <Text className="text-sm text-ink-muted">
                {pet.weightKg}kg · {pet.breed}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onPressProfile}
            accessibilityRole="button"
            className="mt-4 self-end rounded-full border border-ink-line px-4 py-2 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-ink-muted">프로필 보기</Text>
          </Pressable>
        </View>

        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <MenuRow icon="person-outline" label="내 정보 확인" onPress={onPressMyInfo} />
          <MenuDivider />
          <MenuRow icon="document-text-outline" label="분석 기록" onPress={onPressRecords} />
          <MenuDivider />
          <MenuRow icon="heart-outline" label="즐겨찾는 병원" onPress={onPressFavoriteHospitals} />
        </View>

        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <MenuRow
            icon="notifications-outline"
            label="알림 설정"
            onPress={onPressNotificationSettings}
          />
          <MenuDivider />
          <MenuRow icon="help-circle-outline" label="고객센터" onPress={onPressCustomerCenter} />
          <MenuDivider />
          <MenuRow icon="information-circle-outline" label="앱 정보" onPress={onPressAppInfo} />
        </View>
      </View>
    </>
  );
}
