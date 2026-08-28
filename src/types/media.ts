import type { IsoDateTime } from './common';

/** 백엔드 MediaType — 현재 VIDEO 는 업로드 단계에서 거부됩니다 */
export type MediaKind = 'IMAGE' | 'VIDEO';

export type MediaAnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

/** MediaResponse */
export interface Media {
  mediaId: number;
  /** 서버 상대 경로 (예: '/api/v1/media/1/file') — 화면에서 쓸 땐 toAbsoluteUrl() 로 감싸세요 */
  fileUrl: string;
  mediaType: MediaKind;
  createdAt: IsoDateTime;
}

/** MediaAnalysisResponse */
export interface MediaAnalysis {
  mediaId: number;
  status: MediaAnalysisStatus;
  resultText: string | null;
}

/** ImagePicker 결과를 그대로 넘길 수 있는 형태 */
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  /**
   * 웹에서만 채워집니다 — expo-image-picker 가 `asset.file` 로 주는 브라우저 File 객체.
   *
   * 브라우저의 FormData 는 Blob/File 이 아닌 값을 문자열로 바꿔 버려서, 네이티브처럼
   * { uri, name, type } 객체를 넣으면 '[object Object]' 가 전송됩니다.
   * 네이티브에서는 undefined 입니다.
   */
  file?: Blob;
}
