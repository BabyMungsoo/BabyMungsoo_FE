import { Text, TextInput, View } from 'react-native';

interface SymptomInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

/** 홈의 주 입력칸 — 보호자가 본 증상을 자세히 적을 수 있도록 크게 둡니다 */
export function SymptomInput({ value, onChangeText }: SymptomInputProps) {
  return (
    <View className="rounded-2xl border-2 border-brand-300 bg-paper-card p-4">
      <Text className="mb-2 text-base font-bold text-ink">어떤 증상이 있나요?</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel="증상 입력"
        placeholder={
          '언제부터, 어떤 모습인지 적어 주세요\n(예: 오늘 아침부터 구토를 3번 했고 침을 많이 흘려요)'
        }
        placeholderTextColor="#a9a296"
        multiline
        textAlignVertical="top"
        className="min-h-[160px] text-[15px] leading-6 text-ink"
      />
    </View>
  );
}
