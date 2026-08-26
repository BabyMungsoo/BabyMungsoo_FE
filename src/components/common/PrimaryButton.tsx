import { Pressable, Text } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
}

export default function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 w-full items-center justify-center rounded-xl bg-[#FFD83D] active:opacity-80"
    >
      <Text className="text-[16px] font-bold text-[#242424]">{title}</Text>
    </Pressable>
  );
}
