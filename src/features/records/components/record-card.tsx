import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { TriageBadge } from '@/components/ui/triage-badge';
import { toTriageLevel } from '@/constants/triage';
import { formatDateTime } from '@/lib/format';
import type { AnalysisRecord } from '@/types';

interface RecordCardProps {
  record: AnalysisRecord;
  onPress: (recordId: number) => void;
}

/** 분석기록 리스트의 카드 한 줄 (날짜 / 증상 / 응급도 뱃지 / 화살표) */
export function RecordCard({ record, onPress }: RecordCardProps) {
  const level = toTriageLevel(record.emergencyLevel);

  return (
    <Pressable
      onPress={() => onPress(record.recordId)}
      accessibilityRole="button"
      className="mb-3 flex-row items-center rounded-2xl bg-paper-card px-4 py-4 active:opacity-70"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View className="flex-1 gap-1 pr-3">
        <Text className="text-xs text-ink-soft">{formatDateTime(record.createdAt)}</Text>
        <Text className="text-base font-bold text-ink" numberOfLines={1}>
          {record.symptomText}
        </Text>
      </View>

      {level && <TriageBadge level={level} />}

      <Ionicons name="chevron-forward" size={18} color="#b5afa3" style={{ marginLeft: 8 }} />
    </Pressable>
  );
}
