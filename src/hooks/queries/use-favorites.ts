import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { favoritesApi } from '@/api/favorites';
import { queryKeys } from '@/lib/query-keys';
import { useSessionStore } from '@/stores/use-session-store';
import type { FavoriteHospital, Hospital } from '@/types';

export function useFavoriteHospitals() {
  const userId = useSessionStore((state) => state.userId);
  return useQuery({
    queryKey: queryKeys.favorites.hospitals(userId),
    queryFn: favoritesApi.list,
    enabled: userId != null,
  });
}

/** 이 병원이 즐겨찾기에 있는지. 목록을 한 번만 받아 여러 행·카드가 같이 씁니다 */
export function useIsFavoriteHospital(hospitalId: number) {
  const { data } = useFavoriteHospitals();
  return data?.some((item) => item.hospital.hospitalId === hospitalId) ?? false;
}

/**
 * 즐겨찾기 추가/해제. 별을 누르자마자 바뀌어 보이도록 캐시를 먼저 고치고,
 * 저장이 실패하면 되돌립니다.
 */
export function useToggleFavoriteHospital() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.userId);
  const key = queryKeys.favorites.hospitals(userId);

  return useMutation({
    mutationFn: ({ hospital, favorite }: { hospital: Hospital; favorite: boolean }) =>
      favorite ? favoritesApi.add(hospital) : favoritesApi.remove(hospital.hospitalId),
    onMutate: async ({ hospital, favorite }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FavoriteHospital[]>(key);
      const rest = (previous ?? []).filter(
        (item) => item.hospital.hospitalId !== hospital.hospitalId,
      );
      queryClient.setQueryData<FavoriteHospital[]>(
        key,
        favorite ? [{ hospital, createdAt: new Date().toISOString() }, ...rest] : rest,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
