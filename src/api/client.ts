import axios, { AxiosError, type AxiosInstance } from 'axios';
import Constants from 'expo-constants';

const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '8080';

/**
 * Expo 개발 서버가 물려 있는 호스트를 그대로 재사용합니다.
 *
 * 이게 필요한 이유: RN 앱에서 'localhost' 는 앱이 도는 기기 자신을 가리킵니다.
 * 실기기라면 폰 자신, 안드로이드 에뮬레이터라면 에뮬레이터 자신이라
 * 개발 PC 의 백엔드(8080)에 절대 닿지 않습니다.
 * Expo 는 번들을 받아온 개발 PC 의 IP 를 hostUri 로 알고 있으니 그걸 재사용하면
 * 시뮬레이터·에뮬레이터·실기기 모두 별도 설정 없이 붙습니다.
 */
function resolveDevHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // 구버전 Expo Go 호환
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  return hostUri?.split(':')[0] ?? 'localhost';
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || `http://${resolveDevHost()}:${API_PORT}/api/v1`;

/** 서버 origin (예: 'http://192.168.0.10:8080') — 미디어 파일 URL 조립에 씁니다 */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/** '/api/v1/media/1/file' 같은 상대 경로를 Image source 에 넣을 수 있는 절대 URL 로 바꿉니다 */
export function toAbsoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

/**
 * 인증 토큰 주입 지점.
 * 백엔드가 아직 OAuth 로그인을 붙이는 중이라, 토큰이 생기면 여기에 setAuthToken() 만 호출하면 됩니다.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

/** 서버가 내려주는 에러 형태를 화면에서 쓰기 쉬운 하나의 모양으로 정리합니다 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (!error.response) {
      return Promise.reject(new ApiError('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.'));
    }
    const { status, data } = error.response;
    const message = data?.message ?? '요청을 처리하지 못했습니다.';
    return Promise.reject(new ApiError(message, status, data));
  },
);
