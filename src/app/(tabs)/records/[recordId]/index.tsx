import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toAbsoluteUrl } from '@/api';
import { ScreenHeader } from '@/components/ui/screen-header';
import { RecordDetailView } from '@/features/records/components/record-detail-view';
import { useMedia } from '@/hooks/queries/use-media';
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

  const media = useMedia(record?.mediaId);
  const photoUrl = media.data ? toAbsoluteUrl(media.data.fileUrl) : undefined;

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
      // 지운 기록의 상세로 되돌아갈 수는 없으니 back 대신 목록으로 보냅니다
      router.replace('/records');
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
        backFallback="/records"
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
          photoUrl={photoUrl}
          onPressEdit={() => router.push(`/records/${record.recordId}/edit`)}
          // TODO: 리포트 생성(POST /reports)은 hospitalId 가 필요해서 9번에서 병원을 고른 뒤에 붙입니다
          onPressShare={() => {}}
          // 응급도를 넘겨야 9번에서 그 등급에 맞는 병원을 추천받습니다
          onPressFindHospital={() =>
            router.push({
              pathname: '/hospitals',
              params: { level: record.emergencyLevel ?? '' },
            })
          }
        />
      )}
    </SafeAreaView>
  );
}
