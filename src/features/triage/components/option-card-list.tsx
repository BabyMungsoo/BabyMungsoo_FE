import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

interface OptionCardListProps {
  options: string[];
  /** 지금 골라 둔 선택지. 없으면 null */
  selected: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

/**
 * 추가 문진의 답변 선택지. 세로로 쌓인 카드 중 하나를 고릅니다(단일 선택).
 *
 * 응급 상황에서 한 손으로 누르는 대상이라 카드를 크게(최소 52px) 둡니다.
 * 순서는 서버가 준 그대로입니다 — 가벼운 것 → 심한 것, 마지막은 '잘 모르겠어요'.
 * 프론트가 정렬하지 않습니다.
 */
export function OptionCardList({
  options,
  selected,
  onSelect,
  disabled = false,
}: OptionCardListProps) {
  return (
    <View className="gap-2" accessibilityRole="radiogroup">
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected, disabled }}
            className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border-2 px-4 py-3 active:opacity-70 ${
              isSelected ? 'border-brand-400 bg-brand-50' : 'border-ink-line bg-paper-card'
            }`}
          >
            <Text
              className={`flex-1 text-base leading-6 ${isSelected ? 'font-bold text-ink' : 'text-ink'}`}
            >
              {option}
            </Text>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#efbe24" />}
          </Pressable>
        );
      })}
    </View>
  );
}
