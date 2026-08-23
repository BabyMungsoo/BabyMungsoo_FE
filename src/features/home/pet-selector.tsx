import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';

import type { Pet } from '@/types';

const GENDER_LABEL: Record<Pet['gender'], string> = {
  MALE: '남',
  FEMALE: '여',
};

function petSummary(pet: Pet) {
  return `${pet.name} (${GENDER_LABEL[pet.gender]} / ${pet.age}세 / ${pet.breed})`;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: number | null;
  onSelect: (petId: number) => void;
}

export function PetSelector({ pets, selectedPetId, onSelect }: PetSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedPet = useMemo(
    () => pets.find((pet) => pet.petId === selectedPetId) ?? pets[0],
    [pets, selectedPetId],
  );

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-2xl bg-paper-card px-5 py-4"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <Text className="text-base font-semibold text-ink" numberOfLines={1}>
          {selectedPet ? petSummary(selectedPet) : '반려동물을 선택해주세요'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#8c867a" />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="gap-1 rounded-t-3xl bg-paper-card p-4 pb-8" onPress={() => {}}>
            <Text className="px-2 pb-2 text-sm font-semibold text-ink-muted">반려동물 선택</Text>
            {pets.map((pet) => (
              <Pressable
                key={pet.petId}
                onPress={() => {
                  onSelect(pet.petId);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between rounded-xl px-3 py-3 active:bg-paper-chip"
              >
                <Text className="text-base text-ink">{petSummary(pet)}</Text>
                {pet.petId === selectedPet?.petId && (
                  <Ionicons name="checkmark" size={18} color="#d9a50f" />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
