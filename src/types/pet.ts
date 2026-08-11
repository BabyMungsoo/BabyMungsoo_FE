import type { IsoDateTime } from './common';

export const PET_GENDERS = ['MALE', 'FEMALE'] as const;
export type PetGender = (typeof PET_GENDERS)[number];

/** PetResponse */
export interface Pet {
  petId: number;
  name: string;
  breed: string;
  age: number;
  gender: PetGender;
  weight: number | null;
  isNeutered: boolean;
  underlyingDisease: string | null;
  profileImage: string | null;
  createdAt: IsoDateTime;
}

/** PetProfileResponse — AI 분석 요청 시 함께 보내는 프로필 */
export interface PetProfile {
  petId: number;
  name: string;
  breed: string;
  age: number;
  gender: PetGender;
  weight: number | null;
  isNeutered: boolean;
  underlyingDisease: string | null;
  /** '품종: 말티즈, 나이: 5세, ...' 형태로 서버가 조립해 주는 요약 문자열 */
  basicRiskInfo: string;
}

/** POST /api/v1/pets */
export interface PetCreateRequest {
  name: string;
  breed: string;
  age: number;
  gender: PetGender;
  weight?: number;
  isNeutered: boolean;
  underlyingDisease?: string;
  profileImage?: string;
}

/** PATCH /api/v1/pets/{petId} — 보낸 필드만 수정됩니다 */
export type PetUpdateRequest = Partial<PetCreateRequest>;
