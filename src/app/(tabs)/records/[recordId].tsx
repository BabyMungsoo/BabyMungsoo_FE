import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { RecordDetailView } from '@/features/records/components/record-detail-view';
import { useRecord } from '@/hooks/queries/use-records';

/** 7번 — 분석기록 상세/결과 (GET /records/{recordId}) */
export default function RecordDetailScreen() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();
  const parsedId = Number(recordId);

  const {
    data: record,
    isPending,
    error,
    refetch,
  } = useRecord(Number.isFinite(parsedId) ? parsedId : undefined);

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="분석 결과" showBack />

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
          // TODO: 백엔드에 기록 수정 API(PATCH /records/{id})가 아직 없습니다
          onPressEdit={() => {}}
          // TODO: 리포트 생성(POST /reports)은 hospitalId 가 필요해서 9번 화면 이후에 붙입니다
          onPressShare={() => {}}
          // TODO: 9번 병원 찾기 화면이 생기면 연결합니다
          onPressFindHospital={() => {}}
        />
      )}
    </SafeAreaView>
  );
}
