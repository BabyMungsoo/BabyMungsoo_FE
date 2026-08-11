import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  /** 왼쪽 뒤로가기 화살표 표시 여부 */
  showBack?: boolean;
}

/** 가운데 정렬 타이틀 헤더. 뒤로가기가 있어도 타이틀은 화면 정중앙에 오게 양쪽 폭을 맞춥니다. */
export function ScreenHeader({ title, showBack = false }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="h-14 flex-row items-center px-4">
      <View className="w-10 items-start">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2a24" />
          </Pressable>
        )}
      </View>

      <Text className="flex-1 text-center text-lg font-bold text-ink">{title}</Text>

      <View className="w-10" />
    </View>
  );
}
