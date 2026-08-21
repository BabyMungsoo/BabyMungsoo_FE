import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';

/** 10번 — 마이페이지. 담당 범위 밖이라 탭 자리만 잡아 둡니다. */
export default function MyPageScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="마이페이지" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-ink-muted">준비 중이에요</Text>
      </View>
    </SafeAreaView>
  );
}
