import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ui/screen-header';
import { RecordCard } from '@/features/records/components/record-card';
import { TriageFilter } from '@/features/records/components/triage-filter';
import type { AnalysisRecord, TriageLevel } from '@/types';

interface RecordListViewProps {
  records: AnalysisRecord[];
  filter: TriageLevel | null;
  onChangeFilter: (filter: TriageLevel | null) => void;
  onPressRecord: (recordId: number) => void;
  isPending?: boolean;
  isRefetching?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * 분석기록 리스트의 화면(6번). 서버 호출을 모르는 순수 표현 컴포넌트라
 * 라우트에서는 쿼리 결과만 꽂아 주면 되고, 디자인 확인은 샘플 데이터로 할 수 있습니다.
 */
export function RecordListView({
  records,
  filter,
  onChangeFilter,
  onPressRecord,
  isPending = false,
  isRefetching = false,
  error = null,
  onRetry,
}: RecordListViewProps) {
  return (
    <>
      <ScreenHeader title="분석기록" />
      <TriageFilter value={filter} onChange={onChangeFilter} />

      <FlatList
        data={records}
        keyExtractor={(record) => String(record.recordId)}
        renderItem={({ item }) => <RecordCard record={item} onPress={onPressRecord} />}
        contentContainerClassName="px-5 pb-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRetry ? <RefreshControl refreshing={isRefetching} onRefresh={onRetry} /> : undefined
        }
        ListEmptyComponent={
          <ListEmpty
            isPending={isPending}
            error={error}
            filtered={filter != null}
            onRetry={onRetry}
          />
        }
      />
    </>
  );
}

interface ListEmptyProps {
  isPending: boolean;
  error: Error | null;
  filtered: boolean;
  onRetry?: () => void;
}

function ListEmpty({ isPending, error, filtered, onRetry }: ListEmptyProps) {
  if (isPending) {
    return (
      <View className="items-center py-24">
        <ActivityIndicator color="#efbe24" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center gap-3 px-8 py-24">
        <Text className="text-center text-sm text-ink-muted">{error.message}</Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            className="rounded-full bg-brand-400 px-6 py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-bold text-brand-900">다시 시도</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="items-center py-24">
      <Text className="text-sm text-ink-muted">
        {filtered ? '해당 응급도의 기록이 없어요.' : '아직 분석기록이 없어요.'}
      </Text>
    </View>
  );
}
