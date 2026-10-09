import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';

import { useIsFavoriteHospital, useToggleFavoriteHospital } from '@/hooks/queries/use-favorites';
import type { Hospital } from '@/types';

interface FavoriteButtonProps {
  hospital: Hospital;
  size?: number;
}

/** 병원 즐겨찾기 별. 채워진 노란 별이면 즐겨찾기에 있는 병원입니다 */
export function FavoriteButton({ hospital, size = 22 }: FavoriteButtonProps) {
  const isFavorite = useIsFavoriteHospital(hospital.hospitalId);
  const toggle = useToggleFavoriteHospital();

  return (
    <Pressable
      onPress={() => toggle.mutate({ hospital, favorite: !isFavorite })}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite
          ? `${hospital.hospitalName} 즐겨찾기 해제`
          : `${hospital.hospitalName} 즐겨찾기 추가`
      }
      accessibilityState={{ selected: isFavorite }}
      className="active:opacity-60"
    >
      <Ionicons
        name={isFavorite ? 'star' : 'star-outline'}
        size={size}
        color={isFavorite ? '#efbe24' : '#a9a296'}
      />
    </Pressable>
  );
}
