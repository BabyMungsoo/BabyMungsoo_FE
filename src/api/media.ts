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
   * POST /media/upload — 현재 백엔드는 이미지만 허용합니다(동영상은 400).
   *
   * expo-image-picker 결과를 그대로 넘기면 됩니다:
   *   const asset = result.assets[0];
   *   upload({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' })
   */
  upload: async (file: UploadFile) => {
    const form = new FormData();

    if (Platform.OS === 'web') {
      // 브라우저의 FormData 는 표준 규격이라 Blob/File 이 아닌 값을 문자열로 바꿉니다.
      // 아래 네이티브 방식으로 넣으면 '[object Object]' 가 전송돼 파일 파트가 만들어지지 않습니다.
      if (!file.file) {
        throw new ApiError('사진을 읽지 못했습니다. 다시 선택해 주세요.');
      }
      form.append('file', file.file, file.name);
    } else {
      // RN 의 FormData 는 { uri, name, type } 객체를 파일로 취급합니다 (웹의 File 과 다름)
      form.append('file', file as unknown as Blob);
    }

    // Content-Type 을 직접 지정하지 않습니다. FormData 를 넘기면 브라우저(웹)와
    // RN 이 boundary 를 포함한 헤더를 알아서 붙입니다.
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

  /** POST /media/{mediaId}/analyze — AI 분석 요청 */
  analyze: async (mediaId: number) => {
    const { data } = await api.post<ApiResponse<MediaAnalysis>>(`/media/${mediaId}/analyze`);
    return unwrap(data);
  },
};
