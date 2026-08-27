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

/**
 * 웹에서 FormData 에 넣을 Blob 을 확보합니다.
 *
 * 호출부가 실제 File 을 넘겨주면(홈 사진 첨부) 그대로 쓰고, uri 만 넘겨주면
 * (반려동물 프로필 이미지) blob URL 을 되읽습니다. 두 호출부를 모두 지원하기 위한 분기입니다.
 */
async function resolveWebBlob(file: UploadFile): Promise<Blob> {
  if (file.file) {
    return file.file;
  }

  const response = await fetch(file.uri);

  if (!response.ok) {
    throw new ApiError('선택한 이미지를 불러오지 못했습니다.');
  }

  return response.blob();
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
      // 브라우저의 FormData 는 표준 규격이라 Blob/File 이 아닌 값을 문자열로 바꿉니다.
      // 아래 네이티브 방식으로 넣으면 '[object Object]' 가 전송돼 파일 파트가 만들어지지 않습니다.
      form.append('file', await resolveWebBlob(file), file.name);
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

  /** POST /media/{mediaId}/analyze */
  analyze: async (mediaId: number) => {
    const { data } = await api.post<ApiResponse<MediaAnalysis>>(`/media/${mediaId}/analyze`);

    return unwrap(data);
  },
};
