import { Platform } from 'react-native';

import type { ApiResponse, Media, MediaAnalysis, UploadFile } from '@/types';

import { api, ApiError } from './client';

/** /media/** 만 ApiResponse 래퍼를 쓰기 때문에 여기서 풀어 줍니다 */
function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data === null) {
    throw new ApiError(res.message ?? '미디어 요청에 실패했습니다.');
  }

  return res.data;
}

export const mediaApi = {
  /**
   * POST /media/upload
   *
   * 백엔드는 multipart/form-data 의 "file" 필드를 받습니다.
   * 웹과 React Native의 FormData 파일 처리 방식이 달라 플랫폼별로 분기합니다.
   */
  upload: async (file: UploadFile) => {
    const form = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(file.uri);

      if (!response.ok) {
        throw new ApiError('선택한 이미지를 불러오지 못했습니다.');
      }

      const blob = await response.blob();

      form.append('file', blob, file.name);
    } else {
      form.append('file', file as unknown as Blob);
    }

    const { data } = await api.post<ApiResponse<Media>>('/media/upload', form);

    return unwrap(data);
  },

  /** GET /media/{mediaId} */
  detail: async (mediaId: number) => {
    const { data } = await api.get<ApiResponse<Media>>(`/media/${mediaId}`);

    return unwrap(data);
  },

  /** DELETE /media/{mediaId} */
  remove: async (mediaId: number) => {
    await api.delete<ApiResponse<void>>(`/media/${mediaId}`);
  },

  /** POST /media/{mediaId}/analyze */
  analyze: async (mediaId: number) => {
    const { data } = await api.post<ApiResponse<MediaAnalysis>>(`/media/${mediaId}/analyze`);

    return unwrap(data);
  },
};
