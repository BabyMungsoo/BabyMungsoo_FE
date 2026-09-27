import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/screen-header';

const FEATURES = [
  'AI 기반 반려견 증상 분석',
  '반려동물 건강 및 진료 기록 관리',
  '주변 동물병원 정보 제공',
  '반려동물 프로필 관리',
];

const DEVELOPERS = ['신희진', '박슬기', '선지오', '최유연', '노윤선'];

export default function AppInfoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="앱 정보" showBack backTo="/my-page" />
      <ScrollView contentContainerClassName="gap-4 px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="items-center rounded-2xl bg-paper-card px-6 py-8">
          <View className="mb-4 rounded-2xl bg-[#FFD83D] p-4">
            <Ionicons name="paw" size={36} color="#2e2a24" />
          </View>
          <Text className="text-2xl font-bold text-ink">BabyMungsoo</Text>
          <Text className="mt-3 text-center leading-6 text-ink-muted">
            반려견의 응급 상황과 건강 관리를 돕는 AI 기반 반려동물 케어 서비스
          </Text>
          <Text className="mt-4 text-sm text-ink-muted">v1.0.0</Text>
        </View>
        <View className="gap-4 rounded-2xl bg-paper-card p-5">
          <Text className="text-base font-bold text-ink">주요 기능</Text>
          {FEATURES.map((feature) => (
            <View key={feature} className="flex-row items-center gap-3">
              <Ionicons name="checkmark-circle" size={20} color="#a77b00" />
              <Text className="flex-1 text-sm leading-6 text-ink">{feature}</Text>
            </View>
          ))}
        </View>
        <View className="gap-3 rounded-2xl bg-paper-card p-5">
          <Text className="text-base font-bold text-ink">프로젝트 정보</Text>
          <Text className="text-sm leading-6 text-ink-muted">
            본 서비스는 2026 한이음 드림업 프로젝트를 통해 개발되었습니다.
          </Text>
        </View>
        <View className="gap-3 rounded-2xl bg-paper-card p-5">
          <Text className="text-base font-bold text-ink">개발자 정보</Text>
          <Text className="text-sm text-ink">동덕여자대학교 · 팀 아기멍수</Text>
          <View className="flex-row flex-wrap gap-2">
            {DEVELOPERS.map((name) => (
              <View key={name} className="rounded-full bg-brand-100 px-3 py-1.5">
                <Text className="text-sm font-semibold text-brand-900">{name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
