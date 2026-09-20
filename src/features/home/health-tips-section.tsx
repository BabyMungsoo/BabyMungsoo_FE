import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { HEALTH_TIPS } from '@/constants/health-tips';

export function HealthTipsSection() {
  const router = useRouter();

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-ink">우리아이 건강팁</Text>
        <Pressable
          onPress={() => router.push('/health-tips')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="건강팁 더보기"
        >
          <Text className="text-xs text-ink-soft active:opacity-60">더보기 ›</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        {HEALTH_TIPS.map((tip) => (
          <Pressable
            key={tip.id}
            onPress={() => router.push(`/health-tips/${tip.id}`)}
            className="flex-1 items-center gap-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`${tip.title} 자세히 보기`}
          >
            <View
              className={`h-24 w-full items-center justify-center rounded-2xl ${tip.bgClassName}`}
            >
              <Image
                source={tip.image}
                style={{ width: 56, height: 56 }}
                contentFit="contain"
              />
            </View>
            <Text className="text-center text-xs font-medium text-ink-muted">{tip.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
