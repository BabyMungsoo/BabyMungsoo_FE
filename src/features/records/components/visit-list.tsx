import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { NOT_VISITED_LABELS, TREATMENT_LABELS } from '@/constants/visit';
import type { HospitalVisit } from '@/types';

interface VisitListProps {
  visits: HospitalVisit[];
  onPressDelete?: (visitId: number) => void;
}

/**
 * 기록에 달린 팔로우업 답변들.
 *
 * 진단은 수의사에게 들은 내용을 보호자가 적은 것이라 출처를 라벨로 밝힙니다.
 * 앱이 만든 값으로 읽히면 안 됩니다.
 */
export function VisitList({ visits, onPressDelete }: VisitListProps) {
  return (
    <View className="gap-2.5">
      {visits.map((visit) => (
        <View key={visit.visitId} className="gap-2 rounded-2xl bg-paper p-4">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-sm font-bold text-ink">
              {visit.visitStatus === 'VISITED'
                ? `${formatDate(visit.visitedAt)} · ${visit.hospitalName ?? '병원 미기재'}`
                : '병원에 가지 않음'}
            </Text>

            {onPressDelete && (
              <Pressable
                onPress={() => onPressDelete(visit.visitId)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="이 기록 삭제"
              >
                <Ionicons name="close" size={16} color="#a9a296" />
              </Pressable>
            )}
          </View>

          {visit.visitStatus === 'NOT_VISITED' && visit.notVisitedReason && (
            <Text className="text-sm text-ink-muted">
              {NOT_VISITED_LABELS[visit.notVisitedReason]}
            </Text>
          )}

          {!!visit.diagnosis && (
            <View className="gap-0.5">
              <Text className="text-xs text-ink-soft">수의사 진단 (보호자 입력)</Text>
              <Text className="text-sm leading-5 text-ink">{visit.diagnosis}</Text>
            </View>
          )}

          {visit.treatments.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5">
              {visit.treatments.map((tag) => (
                <View key={tag} className="rounded-lg bg-brand-100 px-2.5 py-1">
                  <Text className="text-xs font-semibold text-brand-900">
                    {TREATMENT_LABELS[tag]}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!!visit.memo && <Text className="text-sm leading-5 text-ink-muted">{visit.memo}</Text>}

          {!!visit.nextVisitAt && (
            <Text className="text-xs text-ink-soft">다음 방문 {formatDate(visit.nextVisitAt)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

/** 'YYYY-MM-DD' → 'MM.DD'. 서버가 날짜만 주므로 시간 처리는 없습니다 */
function formatDate(value: string | null): string {
  if (!value) return '날짜 미기재';
  const matched = /^\d{4}-(\d{2})-(\d{2})/.exec(value);
  return matched ? `${matched[1]}.${matched[2]}` : value;
}
