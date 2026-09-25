import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomerCenterView } from '@/features/my-page/components/customer-center-view';

export default function CustomerCenterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top']}>
      <CustomerCenterView />
    </SafeAreaView>
  );
}
