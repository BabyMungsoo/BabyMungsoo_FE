import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface MenuRowProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

/** 마이페이지 계열 화면에서 반복되는 '아이콘 + 라벨 + 화살표' 한 줄 */
export function MenuRow({ icon, label, onPress }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 px-4 py-4 active:opacity-70"
    >
      <Ionicons name={icon} size={20} color="#8c867a" />
      <Text className="flex-1 text-sm font-semibold text-ink">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#b5afa3" />
    </Pressable>
  );
}

/** MenuRow 사이 구분선. 아이콘 폭만큼 왼쪽을 띄워 라벨 시작 위치에 맞춥니다 */
export function MenuDivider() {
  return <View className="h-px bg-ink-line" style={{ marginLeft: 44 }} />;
}
