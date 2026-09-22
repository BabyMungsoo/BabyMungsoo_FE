import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toAbsoluteUrl } from '@/api';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FollowUpCard } from '@/features/records/components/follow-up-card';
import { RecordDetailView } from '@/features/records/components/record-detail-view';
import { readSnoozedUntil, snooze } from '@/features/records/follow-up-snooze';
import { shouldAskFollowUp } from '@/features/records/should-ask-follow-up';
import { useMediaList } from '@/hooks/queries/use-media';
import { useDeleteRecord, useRecord } from '@/hooks/queries/use-records';
import { useCreateVisit, useDeleteVisit, useVisits } from '@/hooks/queries/use-visits';
import { confirm } from '@/lib/confirm';
import type { NotVisitedReason } from '@/types';

/** 7번 — 분석기록 상세/결과 (GET /records/{recordId}) */
export default function RecordDetailScreen() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const parsedId = Number(recordId);
  const validId = Number.isFinite(parsedId) ? parsedId : undefined;

  const { data: record, isPending, error, refetch } = useRecord(validId);
  const deleteRecord = useDeleteRecord();

  const { data: visits } = useVisits(validId);
  const createVisit = useCreateVisit(validId ?? 0);
  const deleteVisit = useDeleteVisit(validId ?? 0);

  /**
   * "병원 다녀오셨나요?" 를 띄울지.
   *
   * 스누즈는 이 기기에만 있는 값이라 비동기로 읽어야 하고, 현재 시각도 렌더 중에 읽으면
   * 안 되는 값입니다(렌더는 순수해야 합니다). 그래서 효과 안에서 한 번 계산해 둡니다.
   */
  const [askFollowUp, setAskFollowUp] = useState(false);

  useEffect(() => {
    if (validId == null || record == null) return;
    let alive = true;

    readSnoozedUntil(validId).then((until) => {
      if (alive) setAskFollowUp(shouldAskFollowUp(record, Date.now(), until));
    });

    return () => {
      alive = false;
    };
  }, [validId, record]);

  async function handleNotVisited(reason: NotVisitedReason) {
    try {
      await createVisit.mutateAsync({ visitStatus: 'NOT_VISITED', notVisitedReason: reason });
    } catch (e) {
      await confirm({
        title: '저장하지 못했습니다',
        message: e instanceof Error ? e.message : undefined,
      });
    }
  }

  async function handleDeleteVisit(visitId: number) {
    const confirmed = await confirm({
      title: '이 진료 기록을 삭제할까요?',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    await deleteVisit.mutateAsync(visitId);
  }

  const mediaQueries = useMediaList(record?.mediaIds);
  const photoUrls = mediaQueries
    .map((query) => query.data)
    .filter((media) => media != null)
    .map((media) => toAbsoluteUrl(media.fileUrl))
    .filter((url) => url != null);

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
          photoUrls={photoUrls}
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
          visits={visits ?? []}
          onPressAddVisit={() => router.push(`/records/${record.recordId}/visit`)}
          onPressDeleteVisit={handleDeleteVisit}
          followUpCard={
            askFollowUp ? (
              <FollowUpCard
                isSaving={createVisit.isPending}
                onPressVisited={() => router.push(`/records/${record.recordId}/visit`)}
                onSelectNotVisited={handleNotVisited}
                onPressLater={() => {
                  setAskFollowUp(false);
                  if (validId != null) void snooze(validId);
                }}
              />
            ) : undefined
          }
        />
      )}
    </SafeAreaView>
  );
}
