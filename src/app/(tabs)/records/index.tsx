import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toTriageLevel } from '@/constants/triage';
import { RecordListView } from '@/features/records/components/record-list-view';
import { useRecords } from '@/hooks/queries/use-records';
import type { TriageLevel } from '@/types';

/** 6번 — 분석기록 리스트 (GET /records) */
export default function RecordsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<TriageLevel | null>(null);

  const { data, isPending, isRefetching, error, refetch } = useRecords();

  // 서버가 createdAt 내림차순으로 이미 정렬해서 내려주므로 필터링만 합니다
  const records = useMemo(() => {
    if (!data) return [];
    if (!filter) return data;
    return data.filter((record) => toTriageLevel(record.emergencyLevel) === filter);
  }, [data, filter]);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <RecordListView
        records={records}
        filter={filter}
        onChangeFilter={setFilter}
        onPressRecord={(recordId) => router.push(`/records/${recordId}`)}
        isPending={isPending}
        isRefetching={isRefetching}
        error={error}
        onRetry={refetch}
      />
    </SafeAreaView>
  );
}
