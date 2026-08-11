import type { Pet, PetCreateRequest, PetProfile, PetUpdateRequest } from '@/types';

import { api } from './client';

export const petsApi = {
  /** GET /pets — 현재 사용자의 반려동물 목록 */
  list: async () => {
    const { data } = await api.get<Pet[]>('/pets');
    return data;
  },

  /** GET /pets/{petId} */
  detail: async (petId: number) => {
    const { data } = await api.get<Pet>(`/pets/${petId}`);
    return data;
  },

  /** POST /pets */
  create: async (body: PetCreateRequest) => {
    const { data } = await api.post<Pet>('/pets', body);
    return data;
  },

  /** PATCH /pets/{petId} — 보낸 필드만 수정됩니다 */
  update: async (petId: number, body: PetUpdateRequest) => {
    const { data } = await api.patch<Pet>(`/pets/${petId}`, body);
    return data;
  },

  /** DELETE /pets/{petId} */
  remove: async (petId: number) => {
    await api.delete<void>(`/pets/${petId}`);
  },

  /** GET /pets/{petId}/profile — AI 분석 요청용 프로필 */
  profile: async (petId: number) => {
    const { data } = await api.get<PetProfile>(`/pets/${petId}/profile`);
    return data;
  },
};
