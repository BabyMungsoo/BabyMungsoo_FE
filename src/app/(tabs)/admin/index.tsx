import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/screen-header';
import { MenuRow } from '@/features/my-page/components/menu-row';

export default function AdminScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="관리자 페이지" showBack backTo="/my-page" />
      <ScrollView contentContainerClassName="gap-4 px-5 pb-8">
        <Text className="text-sm leading-6 text-ink-muted">
          보호자들의 문의를 확인하고 답변을 전해주세요.
        </Text>
        <View className="rounded-2xl bg-paper-card">
          <MenuRow
            icon="chatbubbles-outline"
            label="1:1 문의 관리"
            onPress={() => router.push('/admin/inquiries')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
