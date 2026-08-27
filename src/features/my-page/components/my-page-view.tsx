import { Pressable, Text, View } from 'react-native';

import AuthImage from '@/components/common/AuthImage';
import { ScreenHeader } from '@/components/ui/screen-header';
import { MenuDivider, MenuRow } from '@/features/my-page/components/menu-row';

export interface PetSummary {
  name: string;
  ageLabel: string;
  gender: 'MALE' | 'FEMALE';
  weightKg: number;
  breed: string;
  profileImage?: string | null;
}

interface MyPageViewProps {
  pet: PetSummary | null;
  onPressProfile: () => void;
  onPressMyInfo: () => void;
  onPressAddPet: () => void;
  onPressRecords: () => void;
  onPressFavoriteHospitals: () => void;
  onPressNotificationSettings: () => void;
  onPressCustomerCenter: () => void;
  onPressAppInfo: () => void;
}

const GENDER_SYMBOL: Record<PetSummary['gender'], string> = {
  MALE: '♂',
  FEMALE: '♀',
};

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  elevation: 1,
};

export function MyPageView({
  pet,
  onPressProfile,
  onPressMyInfo,
  onPressAddPet,
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
        {/* 반려동물 카드 */}
        <View className="rounded-2xl bg-paper-card p-5" style={CARD_SHADOW}>
          {pet ? (
            <>
              <View className="flex-row items-center gap-4">
                <View className="h-16 w-16 overflow-hidden rounded-full bg-brand-100">
                  {pet.profileImage ? (
                    <AuthImage path={pet.profileImage} className="h-full w-full" />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Text className="text-2xl font-bold text-brand-700">
                        {pet.name.slice(0, 1)}
                      </Text>
                    </View>
                  )}
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
            </>
          ) : (
            <View className="items-center py-6">
              <Text className="text-base font-semibold text-ink">등록된 반려동물이 없습니다.</Text>

              <Text className="mt-2 text-center text-sm text-ink-muted">
                서비스를 이용하려면 반려동물을 등록해주세요.
              </Text>

              <Pressable
                onPress={onPressAddPet}
                className="mt-4 rounded-xl border border-brand-400 px-5 py-3 active:opacity-70"
              >
                <Text className="text-sm font-semibold text-brand-700">반려동물 등록하기</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 사용자 메뉴 */}
        <View className="rounded-2xl bg-paper-card" style={CARD_SHADOW}>
          <MenuRow icon="person-outline" label="내 정보 확인" onPress={onPressMyInfo} />

          <MenuDivider />

          <MenuRow icon="document-text-outline" label="분석 기록" onPress={onPressRecords} />

          <MenuDivider />

          <MenuRow icon="heart-outline" label="즐겨찾는 병원" onPress={onPressFavoriteHospitals} />
        </View>

        {/* 설정 메뉴 */}
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
