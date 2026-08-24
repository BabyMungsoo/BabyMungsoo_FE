// 회원가입
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import ScreenHeader from '@/components/common/ScreenHeader';

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScreenHeader title="회원가입" />

      <Text className="mt-10 text-center text-gray-400">
        회원가입 화면 구현 예정
      </Text>
    </SafeAreaView>
  );
}