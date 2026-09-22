import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { NOT_VISITED_LABELS } from '@/constants/visit';
import { NOT_VISITED_REASONS, type NotVisitedReason } from '@/types';

interface FollowUpCardProps {
  onPressVisited: () => void;
  onSelectNotVisited: (reason: NotVisitedReason) => void;
  onPressLater: () => void;
  isSaving?: boolean;
}

/**
 * "병원에 다녀오셨나요?" — 분석 기록의 팔로우업 질문.
 *
 * 앱이 먼저 묻습니다. 버튼만 놓아두면 아무도 누르지 않아 사이클이 닫히지 않습니다.
 *
 * '안 갔어요' 도 답으로 저장합니다. 진료 내용만 받으면 병원에 가지 않은 보호자는 영영
 * 미응답으로 남아, 판정이 실제 내원으로 이어졌는지를 알 수 없습니다. 그래서 이유 한 번
 * 누르는 것으로 끝나게 해 뒀습니다.
 */
export function FollowUpCard({
  onPressVisited,
  onSelectNotVisited,
  onPressLater,
  isSaving = false,
}: FollowUpCardProps) {
  const [askingReason, setAskingReason] = useState(false);

  return (
    <View className="gap-3 rounded-2xl border-2 border-brand-300 bg-brand-50 p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name="medkit-outline" size={18} color="#8a660e" />
        <Text className="text-base font-bold text-brand-900">
          {askingReason ? '어떤 이유였나요?' : '병원에 다녀오셨나요?'}
        </Text>
      </View>

      <Text className="text-xs leading-5 text-ink-muted">
        {askingReason
          ? '다음 판단을 더 정확하게 만드는 데 씁니다.'
          : '진료 결과를 남겨 두면 다음에 같은 증상이 있을 때 도움이 됩니다.'}
      </Text>

      {isSaving ? (
        <View className="items-center py-3">
          <ActivityIndicator color="#efbe24" />
        </View>
      ) : askingReason ? (
        <View className="gap-2">
          {NOT_VISITED_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => onSelectNotVisited(reason)}
              accessibilityRole="button"
              className="min-h-[48px] justify-center rounded-xl border border-ink-line bg-paper-card px-4 active:opacity-70"
            >
              <Text className="text-sm text-ink">{NOT_VISITED_LABELS[reason]}</Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => setAskingReason(false)}
            accessibilityRole="button"
            className="self-center py-1"
          >
            <Text className="text-xs text-ink-muted underline">돌아가기</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2">
          <View className="flex-row gap-2">
            <Pressable
              onPress={onPressVisited}
              accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-xl bg-brand-400 py-3.5 active:opacity-70"
            >
              <Text className="text-sm font-bold text-brand-900">다녀왔어요</Text>
            </Pressable>

            <Pressable
              onPress={() => setAskingReason(true)}
              accessibilityRole="button"
              className="flex-1 items-center justify-center rounded-xl bg-paper-card py-3.5 active:opacity-70"
            >
              <Text className="text-sm font-bold text-ink-muted">안 갔어요</Text>
            </Pressable>
          </View>

          <Pressable onPress={onPressLater} accessibilityRole="button" className="self-center py-1">
            <Text className="text-xs text-ink-muted underline">나중에 답할게요</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
