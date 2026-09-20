import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { HEALTH_TIPS, HEALTH_TIP_CONTENT } from '@/constants/health-tips';

/** 홈 '우리아이 건강팁 · 더보기' → 건강팁 전체 목록 (예시) */
export default function HealthTipsListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="우리아이 건강팁" showBack backFallback="/" />

      <ScrollView contentContainerClassName="gap-3 px-5 pt-2 pb-8">
        {HEALTH_TIPS.map((tip) => {
          const subtitle = HEALTH_TIP_CONTENT[tip.id]?.subtitle;
          return (
            <Pressable
              key={tip.id}
              onPress={() => router.push(`/health-tips/${tip.id}`)}
              className="flex-row items-center gap-3 rounded-2xl bg-paper-card px-4 py-3.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={`${tip.title} 자세히 보기`}
            >
              <View
                className={`h-14 w-14 items-center justify-center rounded-xl ${tip.bgClassName}`}
              >
                <Image source={tip.image} style={{ width: 38, height: 38 }} contentFit="contain" />
              </View>

              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-bold text-ink">{tip.title}</Text>
                {subtitle ? (
                  <Text className="text-xs leading-4 text-ink-muted" numberOfLines={2}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <Ionicons name="chevron-forward" size={20} color="#b8b2a6" />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
