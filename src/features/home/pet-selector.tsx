import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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

function petSummary(pet: Pet) {
  return `${pet.name} (${GENDER_LABEL[pet.gender]} / ${pet.age}세 / ${pet.breed})`;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: number | null;
  onSelect: (petId: number) => void;
}

/** 홈 반려동물 선택 드롭다운. 누르면 박스 바로 아래로 목록이 펼쳐집니다. */
export function PetSelector({ pets, selectedPetId, onSelect }: PetSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedPet = useMemo(
    () => pets.find((pet) => pet.petId === selectedPetId) ?? pets[0],
    [pets, selectedPetId],
  );

  return (
    <View className="overflow-hidden rounded-xl bg-paper-card" style={CARD_SHADOW}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel="반려동물 선택"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between gap-2 px-4 py-3 active:opacity-70"
      >
        <Text className="flex-1 text-sm font-semibold text-ink" numberOfLines={1}>
          {selectedPet ? petSummary(selectedPet) : '반려동물을 선택해주세요'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#8c867a" />
      </Pressable>

      {open && (
        <View className="border-t border-ink-line py-1">
          {pets.map((pet) => {
            const selected = pet.petId === selectedPet?.petId;
            return (
              <Pressable
                key={pet.petId}
                onPress={() => {
                  onSelect(pet.petId);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`flex-row items-center justify-between gap-2 px-4 py-2.5 active:bg-paper-chip ${
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
      )}
    </View>
  );
}
