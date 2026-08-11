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
   * POST /media/upload — 현재 백엔드는 이미지만 허용합니다(동영상은 400).
   *
   * expo-image-picker 결과를 그대로 넘기면 됩니다:
   *   const asset = result.assets[0];
   *   upload({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' })
   */
  upload: async (file: UploadFile) => {
    const form = new FormData();
    // RN 의 FormData 는 { uri, name, type } 객체를 파일로 취급합니다 (웹의 File 과 다름)
    form.append('file', file as unknown as Blob);

    const { data } = await api.post<ApiResponse<Media>>('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  /** POST /media/{mediaId}/analyze — AI 분석 요청 */
  analyze: async (mediaId: number) => {
    const { data } = await api.post<ApiResponse<MediaAnalysis>>(`/media/${mediaId}/analyze`);
    return unwrap(data);
  },
};
