import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';

/**
 * 7번 — 분석기록 상세/결과. 아직 뼈대만 있습니다.
 * GET /records/{recordId} + GET /reports/record/{recordId} 를 붙여서 채울 예정입니다.
 */
export default function RecordDetailScreen() {
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="분석 결과" showBack />
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-sm text-ink-muted">7번 화면 작업 예정</Text>
        <Text className="text-xs text-ink-soft">recordId: {recordId}</Text>
      </View>
    </SafeAreaView>
  );
}
