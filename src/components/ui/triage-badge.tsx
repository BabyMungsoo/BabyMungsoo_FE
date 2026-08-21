import { Text, View } from 'react-native';

import { TRIAGE_LEVEL_META } from '@/constants/triage';
import type { TriageLevel } from '@/types';

interface TriageBadgeProps {
  level: TriageLevel;
  /** 'short' = 응급/주의/경미 (리스트), 'long' = 즉시 내원/주의 관찰/일반 관리 (상세) */
  variant?: 'short' | 'long';
}

/** 응급도 뱃지. 리스트(6번)·상세(7번)에서 같이 씁니다. */
export function TriageBadge({ level, variant = 'short' }: TriageBadgeProps) {
  const meta = TRIAGE_LEVEL_META[level];

  return (
    <View className={`rounded-md px-2.5 py-1 ${meta.className}`}>
      <Text className="text-xs font-bold text-white">
        {variant === 'short' ? meta.shortLabel : meta.label}
      </Text>
    </View>
  );
}
