import { create } from 'zustand';

/**
 * 로그인 세션 자리.
 *
 * 백엔드에 아직 인증이 붙지 않아서 `GET /records?userId=` 처럼 userId 를 직접 넘겨야 합니다.
 * 지금은 개발용 기본값(.env.local 의 EXPO_PUBLIC_DEV_USER_ID, 없으면 1)을 씁니다.
 * 로그인이 붙으면 로그인 성공 시점에 setUserId() 를 호출하고 아래 기본값만 null 로 바꾸면 됩니다.
 */
const DEV_USER_ID = Number(process.env.EXPO_PUBLIC_DEV_USER_ID ?? 1);

interface SessionState {
  userId: number | null;
  setUserId: (userId: number | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: Number.isFinite(DEV_USER_ID) ? DEV_USER_ID : 1,
  setUserId: (userId) => set({ userId }),
}));

/** 화면에서는 이 훅만 쓰면 됩니다 */
export function useCurrentUserId() {
  return useSessionStore((state) => state.userId);
}
