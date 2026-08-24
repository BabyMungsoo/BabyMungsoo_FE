import { Text, TextInput, TextInputProps, View } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
}

export default function AppInput({ label, className, ...props }: AppInputProps) {
  return (
    <View className="w-full gap-2">
      {label && <Text className="text-[14px] font-semibold text-[#444444]">{label}</Text>}

      <TextInput
        className={`h-14 rounded-xl border border-[#D9D9D9] bg-white px-4 text-[15px] text-[#242424] ${className ?? ''}`}
        placeholderTextColor="#B5B5B5"
        {...props}
      />
    </View>
  );
}
