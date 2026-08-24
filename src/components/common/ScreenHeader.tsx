import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
}

export default function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View className="relative h-14 w-full flex-row items-center justify-center">
      <Pressable
        onPress={() => router.back()}
        className="absolute left-0 h-10 w-10 items-center justify-center"
      >
        <Text className="text-3xl text-gray-800">‹</Text>
      </Pressable>

      <Text className="text-xl font-bold text-gray-900">{title}</Text>
    </View>
  );
}
