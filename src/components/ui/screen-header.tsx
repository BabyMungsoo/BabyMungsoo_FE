import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  /** 왼쪽 뒤로가기 화살표 표시 여부 */
  showBack?: boolean;
  /**
   * 돌아갈 곳이 없을 때(딥링크로 바로 진입 등) 대신 이동할 경로.
   * 없으면 그냥 back 만 시도합니다.
   */
  backFallback?: Href;
  /** 오른쪽 액션 (예: 삭제 아이콘). 없으면 타이틀 중앙 정렬을 위해 빈 자리로 둡니다 */
  right?: React.ReactNode;
}

/** 가운데 정렬 타이틀 헤더. 뒤로가기가 있어도 타이틀은 화면 정중앙에 오게 양쪽 폭을 맞춥니다. */
export function ScreenHeader({ title, showBack = false, backFallback, right }: ScreenHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (backFallback) router.replace(backFallback);
  }

  return (
    <View className="h-14 flex-row items-center px-4">
      <View className="w-10 items-start">
        {showBack && (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
          >
            <Ionicons name="arrow-back" size={24} color="#2e2a24" />
          </Pressable>
        )}
      </View>

      <Text className="flex-1 text-center text-lg font-bold text-ink">{title}</Text>

      <View className="w-10 items-end">{right}</View>
    </View>
  );
}
