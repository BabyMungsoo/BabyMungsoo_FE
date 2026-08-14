import { Pressable, ScrollView, Text } from 'react-native';

import { TRIAGE_FILTERS } from '@/constants/triage';
import type { TriageLevel } from '@/types';

interface TriageFilterProps {
  /** null = 전체 */
  value: TriageLevel | null;
  onChange: (value: TriageLevel | null) => void;
}

/** 전체 / 응급 / 주의 / 경미 필터 칩 */
export function TriageFilter({ value, onChange }: TriageFilterProps) {
  return (
    // flexGrow-0 이 없으면 가로 ScrollView 가 남은 세로 공간을 다 먹어서 칩이 길쭉하게 늘어납니다.
    // items-center 는 칩 높이를 내용에 맞춥니다.
    // 내용 쪽 grow + justify-center 라야 칩이 다 들어올 땐 가운데 정렬되고,
    // 넘칠 땐 원래대로 왼쪽부터 차며 스크롤됩니다.
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerClassName="grow items-center justify-center gap-2 px-5 py-3"
    >
      {TRIAGE_FILTERS.map((filter) => {
        const selected = filter.value === value;
        return (
          <Pressable
            key={filter.label}
            onPress={() => onChange(filter.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`rounded-full px-5 py-2 ${selected ? 'bg-brand-400' : 'bg-paper-chip'}`}
          >
            <Text className={`text-sm font-bold ${selected ? 'text-brand-900' : 'text-ink-muted'}`}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
