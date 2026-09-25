import { Pressable, Text } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  disabled?: boolean;
  onPress?: () => void;
}

export default function PrimaryButton({ title, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className="h-14 w-full items-center justify-center rounded-xl bg-[#FFD83D] active:opacity-80"
    >
      <Text className="text-[16px] font-bold text-[#242424]">{title}</Text>
    </Pressable>
  );
}
