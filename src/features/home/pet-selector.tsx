import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

import type { Pet } from '@/types';

const GENDER_LABEL: Record<Pet['gender'], string> = {
  MALE: '남',
  FEMALE: '여',
};

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

/** 펼친 상자는 아래 카드 위에 떠 있으므로 그림자를 더 진하게 줍니다 */
const DROPDOWN_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

/** 목록 한 줄 높이(h-11). 펼칠 높이를 미리 계산하려고 고정합니다 */
const ROW_HEIGHT = 44;
/** 구분선(1) + 목록 위아래 여백(py-1 → 8) */
const LIST_CHROME = 9;

function petSummary(pet: Pet) {
  return `${pet.name} (${GENDER_LABEL[pet.gender]} / ${pet.age}세 / ${pet.breed})`;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: number | null;
  onSelect: (petId: number) => void;
}

/**
 * 홈 반려동물 선택 드롭다운.
 *
 * 누르면 선택 칸 자리에서 같은 상자가 아래로 스르륵 늘어나며 목록이 펼쳐집니다
 * (회원가입 품종 선택처럼 칸과 목록이 한 덩어리로 보이게). 상자는 절대 위치로 띄워서
 * 펼쳐도 아래 증상 입력·사진 칸이 밀리지 않습니다. 아래 형제들보다 위에 그려지도록
 * zIndex(웹·iOS)와 elevation(안드로이드)을 함께 줍니다.
 */
export function PetSelector({ pets, selectedPetId, onSelect }: PetSelectorProps) {
  const [open, setOpen] = useState(false);
  // 닫히는 애니메이션이 끝날 때까지 펼친 상자를 그려 두기 위해 open 과 따로 둡니다
  const [isMounted, setIsMounted] = useState(false);
  // 0 = 닫힘, 1 = 열림. 높이를 움직이므로 네이티브 드라이버를 쓰지 않습니다
  const [progress] = useState(() => new Animated.Value(0));

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.petId === selectedPetId) ?? pets[0],
    [pets, selectedPetId],
  );
  const listHeight = LIST_CHROME + pets.length * ROW_HEIGHT;

  const openList = () => {
    setOpen(true);
    setIsMounted(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const closeList = () => {
    setOpen(false);
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
  };

  const chevronStyle = {
    transform: [
      { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
    ],
  };

  const header = (onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="반려동물 선택"
      accessibilityState={{ expanded: open }}
      className="h-11 flex-row items-center justify-between gap-2 px-4 active:opacity-70"
    >
      <Text className="flex-1 text-sm font-semibold text-ink" numberOfLines={1}>
        {selectedPet ? petSummary(selectedPet) : '반려동물을 선택해주세요'}
      </Text>
      <Animated.View style={chevronStyle}>
        <Ionicons name="chevron-down" size={16} color="#8c867a" />
      </Animated.View>
    </Pressable>
  );

  return (
    <View style={{ zIndex: 20, elevation: 20 }}>
      {/* 자리를 차지하는 닫힌 칸. 펼치면 같은 모양의 상자가 그 위를 덮고 아래로 늘어납니다 */}
      <View className="rounded-xl bg-paper-card" style={CARD_SHADOW}>
        {header(openList)}
      </View>

      {isMounted && (
        <View
          className="absolute left-0 right-0 top-0 overflow-hidden rounded-xl bg-paper-card"
          style={DROPDOWN_SHADOW}
        >
          {header(closeList)}

          <Animated.View
            pointerEvents={open ? 'auto' : 'none'}
            style={{
              height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, listHeight] }),
              opacity: progress,
              overflow: 'hidden',
            }}
          >
            <View className="mx-4 h-px bg-ink-line" />
            <View className="py-1">
              {pets.map((pet) => {
                const selected = pet.petId === selectedPet?.petId;
                return (
                  <Pressable
                    key={pet.petId}
                    onPress={() => {
                      onSelect(pet.petId);
                      closeList();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`h-11 flex-row items-center justify-between gap-2 px-4 active:bg-paper-chip ${
                      selected ? 'bg-paper' : ''
                    }`}
                  >
                    <Text
                      className={`flex-1 text-sm ${selected ? 'font-semibold text-ink' : 'text-ink-muted'}`}
                      numberOfLines={1}
                    >
                      {petSummary(pet)}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={16} color="#d9a50f" />}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
