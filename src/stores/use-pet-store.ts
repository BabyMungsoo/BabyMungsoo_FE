import { create } from 'zustand';

/**
 * 클라이언트 전용 상태만 여기에 둡니다.
 * 서버에서 내려오는 데이터(반려동물 목록 등)는 TanStack Query 가 갖고 있고,
 * '지금 어떤 아이로 문진 중인지' 같은 화면 간 공유 상태만 zustand 로 관리합니다.
 */
interface PetState {
  selectedPetId: number | null;
  selectPet: (petId: number | null) => void;
}

export const usePetStore = create<PetState>((set) => ({
  selectedPetId: null,
  selectPet: (petId) => set({ selectedPetId: petId }),
}));
