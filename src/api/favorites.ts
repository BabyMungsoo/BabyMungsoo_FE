import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSessionStore } from '@/stores/use-session-store';
import type { FavoriteHospital, FavoriteHospitalRepository } from '@/types';

import { api } from './client';

/**
 * 즐겨찾는 병원.
 *
 * 백엔드 API 가 아직 없어서 기본은 기기 저장소(AsyncStorage)에 사용자별로 저장합니다.
 * 백엔드가 아래 엔드포인트를 만들면 EXPO_PUBLIC_FAVORITE_MODE=server 로 바꾸면 됩니다.
 *   GET    /favorites/hospitals              → FavoriteHospital[]
 *   POST   /favorites/hospitals/{hospitalId}
 *   DELETE /favorites/hospitals/{hospitalId}
 * 로컬 저장은 기기를 바꾸거나 웹 저장소를 지우면 사라집니다.
 */
export const isFavoriteMock = process.env.EXPO_PUBLIC_FAVORITE_MODE !== 'server';

const STORAGE_KEY_PREFIX = 'favorite-hospitals-v1:';

const serverRepository: FavoriteHospitalRepository = {
  async list() {
    return (await api.get<FavoriteHospital[]>('/favorites/hospitals')).data;
  },
  async add(hospital) {
    await api.post(`/favorites/hospitals/${hospital.hospitalId}`);
  },
  async remove(hospitalId) {
    await api.delete(`/favorites/hospitals/${hospitalId}`);
  },
};

function storageKey(): string {
  const { userId } = useSessionStore.getState();
  if (userId == null) throw new Error('로그인이 필요합니다.');
  return STORAGE_KEY_PREFIX + userId;
}

async function readLocal(key: string): Promise<FavoriteHospital[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data)
      ? data.filter(
          (item): item is FavoriteHospital =>
            typeof item?.hospital?.hospitalId === 'number' && typeof item?.createdAt === 'string',
        )
      : [];
  } catch {
    // 깨진 값 때문에 화면 전체가 막히지 않게 빈 목록으로 봅니다
    return [];
  }
}

const localRepository: FavoriteHospitalRepository = {
  async list() {
    const items = await readLocal(storageKey());
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async add(hospital) {
    const key = storageKey();
    const items = await readLocal(key);
    if (items.some((item) => item.hospital.hospitalId === hospital.hospitalId)) return;
    const next = [...items, { hospital, createdAt: new Date().toISOString() }];
    await AsyncStorage.setItem(key, JSON.stringify(next));
  },
  async remove(hospitalId) {
    const key = storageKey();
    const items = await readLocal(key);
    const next = items.filter((item) => item.hospital.hospitalId !== hospitalId);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  },
};

export const favoritesApi: FavoriteHospitalRepository = isFavoriteMock
  ? localRepository
  : serverRepository;
