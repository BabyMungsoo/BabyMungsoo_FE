import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/screen-header';
import { InquiryList } from '@/features/my-page/components/inquiry-list';

export default function AdminInquiriesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <ScreenHeader title="1:1 문의 관리" showBack backFallback="/admin" />
      <InquiryList admin />
    </SafeAreaView>
  );
}
