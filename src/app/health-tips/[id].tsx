import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { HEALTH_TIPS, HEALTH_TIP_CONTENT } from '@/constants/health-tips';

/**
 * 홈 '우리아이 건강팁' 카드 → 상세 페이지 (예시).
 * 콘텐츠는 constants/health-tips.ts 의 정적 데이터를 사용합니다.
 */
export default function HealthTipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const tip = HEALTH_TIPS.find((t) => t.id === id);
  const content = id ? HEALTH_TIP_CONTENT[id] : undefined;

  if (!tip || !content) {
    return (
      <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
        <ScreenHeader title="건강팁" showBack backFallback="/" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-ink-muted">
            준비 중인 건강팁이에요.{'\n'}곧 만나보실 수 있어요.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title={tip.title} showBack backFallback="/" />

      <ScrollView contentContainerClassName="gap-4 px-5 pt-2 pb-8">
        {/* 히어로 — 아이콘 + 부제 */}
        <View className={`items-center gap-3 rounded-2xl px-5 py-6 ${tip.bgClassName}`}>
          <View className="h-24 w-24 items-center justify-center rounded-full bg-white/70">
            <Image source={tip.image} style={{ width: 64, height: 64 }} contentFit="contain" />
          </View>
          <Text className="text-lg font-bold text-ink">{tip.title}</Text>
          <Text className="text-center text-xs leading-5 text-ink-muted">{content.subtitle}</Text>
        </View>

        {/* 본문 섹션 */}
        {content.sections.map((section, index) => (
          <View key={section.heading} className="gap-2 rounded-2xl bg-paper-card px-5 py-4">
            <View className="flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-500">
                <Text className="text-xs font-bold text-white">{index + 1}</Text>
              </View>
              <Text className="flex-1 text-sm font-bold text-ink">{section.heading}</Text>
            </View>
            <Text className="text-[13px] leading-6 text-ink-muted">{section.body}</Text>
          </View>
        ))}

        {/* 안내 문구 — 진단이 아님을 명시 (의료법 리스크 완화) */}
        <Text className="px-1 text-[11px] leading-5 text-ink-soft">
          본 정보는 참고용이며 수의사의 진단을 대체하지 않습니다. 증상이 있으면 가까운 동물병원에서 진료받으세요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
