import { Text, TextInput, View } from 'react-native';

interface SymptomInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SymptomInput({ value, onChangeText }: SymptomInputProps) {
  return (
    <View className="rounded-2xl border-2 border-brand-300 bg-paper-card p-4">
      <Text className="mb-1 text-base font-bold text-ink">증상을 입력해주세요!</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="(예: 구토를 계속하고 침을 흘려요)"
        placeholderTextColor="#a9a296"
        multiline
        textAlignVertical="top"
        className="h-16 text-sm text-ink"
      />
    </View>
  );
}
