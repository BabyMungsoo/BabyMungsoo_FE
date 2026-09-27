import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
const BREEDS = [
  '골든 리트리버',
  '그레이하운드',
  '닥스훈트',
  '달마시안',
  '도베르만',
  '래브라도 리트리버',
  '말티즈',
  '말티푸',
  '미니어처 슈나우저',
  '믹스견',
  '보더 콜리',
  '보스턴 테리어',
  '불도그',
  '비글',
  '비숑 프리제',
  '사모예드',
  '셰틀랜드 쉽독',
  '스탠더드 푸들',
  '시바견',
  '시베리안 허스키',
  '시추',
  '아메리칸 코커 스패니얼',
  '아키타',
  '요크셔 테리어',
  '웰시 코기',
  '이탈리안 그레이하운드',
  '잭 러셀 테리어',
  '저먼 셰퍼드',
  '진돗개',
  '차우차우',
  '치와와',
  '카네 코르소',
  '코커 스패니얼',
  '토이 푸들',
  '파피용',
  '퍼그',
  '페키니즈',
  '포메라니안',
  '푸들',
  '프렌치 불도그',
];

const normalize = (value: string) => value.replace(/\s/g, '').toLowerCase();
export default function BreedInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const anchor = useRef<View>(null);
  const { height, width } = useWindowDimensions();
  const [position, setPosition] = useState<{ x: number; y: number; width: number } | null>(null);
  const matches = BREEDS.filter((breed) => normalize(breed).includes(normalize(value)));
  const open = () =>
    anchor.current?.measureInWindow((x, y, measuredWidth) =>
      setPosition({ x, y, width: measuredWidth }),
    );
  const choose = (breed: string) => {
    onChange(breed);
    setPosition(null);
  };
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">품종</Text>
      <View ref={anchor} collapsable={false}>
        <Pressable
          accessibilityRole="combobox"
          accessibilityState={{ expanded: position !== null }}
          accessibilityLabel="품종 검색 및 선택"
          onPress={open}
          className="h-12 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3"
        >
          <Text className={value ? 'text-sm text-slate-900' : 'text-sm text-slate-500'}>
            {value || '품종 검색 또는 직접 입력'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#475569" />
        </Pressable>
      </View>
      <Modal
        visible={position !== null}
        transparent
        animationType="none"
        onRequestClose={() => setPosition(null)}
      >
        <Pressable
          accessibilityLabel="품종 목록 닫기"
          onPress={() => setPosition(null)}
          style={{ position: 'absolute', inset: 0 }}
        />
        {position && (
          <View
            style={{
              position: 'absolute',
              left: Math.max(12, Math.min(position.x, width - position.width - 12)),
              top: Math.max(16, Math.min(position.y, height - 330)),
              width: Math.min(position.width, width - 24),
              maxHeight: 300,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#94a3b8',
              backgroundColor: '#fff',
              boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.15)',
            }}
          >
            <View className="h-12 flex-row items-center gap-2 border-b border-slate-200 px-3">
              <Ionicons name="search" size={18} color="#475569" />
              <TextInput
                autoFocus
                accessibilityLabel="품종 검색"
                value={value}
                onChangeText={onChange}
                placeholder="품종 검색"
                placeholderTextColor="#64748b"
                maxLength={50}
                autoCorrect={false}
                onSubmitEditing={() => choose(value.trim())}
                className="h-full flex-1 text-sm text-slate-900"
              />
              <Pressable accessibilityLabel="닫기" hitSlop={10} onPress={() => setPosition(null)}>
                <Ionicons name="close" size={18} color="#475569" />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 244 }}>
              {matches.map((breed) => (
                <Pressable
                  key={breed}
                  accessibilityRole="button"
                  onPress={() => choose(breed)}
                  className="min-h-11 flex-row items-center justify-between px-4 py-3 active:bg-slate-100"
                >
                  <Text className="text-sm text-slate-800">{breed}</Text>
                  {value === breed && <Ionicons name="checkmark" size={18} color="#334155" />}
                </Pressable>
              ))}
              {value.trim() && !BREEDS.includes(value.trim()) ? (
                <Pressable
                  onPress={() => choose(value.trim())}
                  className="border-t border-slate-200 px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-slate-700">
                    “{value.trim()}” 직접 입력
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
