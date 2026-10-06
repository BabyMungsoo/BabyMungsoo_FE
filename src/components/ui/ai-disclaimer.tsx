import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { AI_DISCLAIMER, AI_DISCLAIMER_SHORT } from '@/constants/disclaimer';

interface AiDisclaimerProps {
  /** 'card' = 결과 옆에 두는 회색 카드(4·7번), 'compact' = 한 줄(8·6번) */
  variant?: 'card' | 'compact';
  className?: string;
}

/**
 * "AI 결과는 참고용" 고지.
 *
 * AI 결과가 보이는 화면에만, 결과 바로 옆에 둡니다. 앱 전체 상단에 항상 띄우면
 * AI 와 무관한 화면에서까지 보여 배경 소음이 되고 정작 필요한 곳에서 눈에 안 들어옵니다.
 *
 * 닫기 버튼은 없습니다. 닫히면 고지로서 의미가 없습니다.
 */
export function AiDisclaimer({ variant = 'card', className = '' }: AiDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <View
        accessibilityRole="text"
        className={`flex-row items-center justify-center gap-1.5 ${className}`}
      >
        <Ionicons name="information-circle-outline" size={14} color="#8c867a" />
        <Text className="text-xs text-ink-muted">{AI_DISCLAIMER_SHORT}</Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="text"
      className={`flex-row items-start gap-2 rounded-2xl bg-paper-chip px-4 py-3 ${className}`}
    >
      <Ionicons
        name="information-circle-outline"
        size={16}
        color="#8c867a"
        style={{ marginTop: 2 }}
      />
      <Text className="flex-1 text-xs leading-5 text-ink-muted">{AI_DISCLAIMER}</Text>
    </View>
  );
}
