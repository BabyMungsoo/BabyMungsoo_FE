import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { THEME_COLORS } from '@/constants/theme';

const STORAGE_KEY = 'darkMode';

interface ThemeState {
  isDark: boolean;
  setDark: (isDark: boolean) => void;
  /** 앱 시작 시 저장된 다크모드 설정을 불러옵니다 */
  restore: () => Promise<void>;
}

/** 다크모드 설정. 기기에 저장돼서 앱을 다시 열어도 유지됩니다 (계정과 무관한 기기 설정). */
export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  setDark: (isDark) => {
    set({ isDark });
    AsyncStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false').catch(() => undefined);
  },
  restore: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved != null) set({ isDark: saved === 'true' });
  },
}));

/** 아이콘 color 처럼 className 을 못 쓰는 곳에서 현재 테마 색을 꺼내 씁니다 */
export function useThemeColors() {
  const isDark = useThemeStore((state) => state.isDark);
  return THEME_COLORS[isDark ? 'dark' : 'light'];
}
