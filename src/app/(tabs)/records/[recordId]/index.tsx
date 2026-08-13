import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { RecordDetailView } from '@/features/records/components/record-detail-view';
import { useDeleteRecord, useRecord } from '@/hooks/queries/use-records';
import { confirm } from '@/lib/confirm';

/** 7번 — 분석기록 상세/결과 (GET /records/{recordId}) */
export default function RecordDetailScreen() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const parsedId = Number(recordId);
  const validId = Number.isFinite(parsedId) ? parsedId : undefined;

  const { data: record, isPending, error, refetch } = useRecord(validId);
  const deleteRecord = useDeleteRecord();

  async function handleDelete() {
    if (validId == null) return;

    const confirmed = await confirm({
      title: '이 분석기록을 삭제할까요?',
      message: '삭제하면 되돌릴 수 없습니다.',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteRecord.mutateAsync(validId);
      router.back();
    } catch (e) {
      await confirm({
        title: '삭제하지 못했습니다',
        message: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader
        title="분석 결과"
        showBack
        right={
          record && (
            <Pressable
              onPress={handleDelete}
              disabled={deleteRecord.isPending}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="분석기록 삭제"
            >
              {deleteRecord.isPending ? (
                <ActivityIndicator size="small" color="#8c867a" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#8c867a" />
              )}
            </Pressable>
          )
        }
      />

      {isPending && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#efbe24" />
        </View>
      )}

      {error && (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="text-center text-sm text-ink-muted">{error.message}</Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            className="rounded-full bg-brand-400 px-6 py-2.5 active:opacity-70"
          >
            <Text className="text-sm font-bold text-brand-900">다시 시도</Text>
          </Pressable>
        </View>
      )}

      {record && (
        <RecordDetailView
          record={record}
          onPressEdit={() => router.push(`/records/${record.recordId}/edit`)}
          // TODO: 리포트 생성(POST /reports)은 hospitalId 가 필요해서 9번 화면 이후에 붙입니다
          onPressShare={() => {}}
          // TODO: 9번 병원 찾기 화면이 생기면 연결합니다
          onPressFindHospital={() => {}}
        />
      )}
    </SafeAreaView>
  );
}
