import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { petsApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';
import type { PetCreateRequest, PetUpdateRequest } from '@/types';

/**
 * 다른 도메인 훅도 이 파일 형태를 그대로 따라가면 됩니다.
 * 조회는 useQuery, 변경은 useMutation + 관련 쿼리 무효화.
 */

export function usePets() {
  return useQuery({
    queryKey: queryKeys.pets.list(),
    queryFn: petsApi.list,
  });
}

export function usePet(petId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.pets.detail(petId!),
    queryFn: () => petsApi.detail(petId!),
    enabled: petId != null,
  });
}

export function usePetProfile(petId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.pets.profile(petId!),
    queryFn: () => petsApi.profile(petId!),
    enabled: petId != null,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PetCreateRequest) => petsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
  });
}

export function useUpdatePet(petId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PetUpdateRequest) => petsApi.update(petId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (petId: number) => petsApi.remove(petId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
  });
}
