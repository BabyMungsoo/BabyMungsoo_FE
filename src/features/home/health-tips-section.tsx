import { Text, View } from 'react-native';

import { HEALTH_TIPS } from '@/constants/health-tips';

export function HealthTipsSection() {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-ink">우리아이 건강팁</Text>
        <Text className="text-xs text-ink-soft">더보기 ›</Text>
      </View>

      <View className="flex-row gap-3">
        {HEALTH_TIPS.map((tip) => (
          <View key={tip.id} className="flex-1 items-center gap-2">
            <View
              className={`h-24 w-full items-center justify-center rounded-2xl ${tip.bgClassName}`}
            >
              <Text className="text-3xl">{tip.emoji}</Text>
            </View>
            <Text className="text-center text-xs font-medium text-ink-muted">{tip.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
