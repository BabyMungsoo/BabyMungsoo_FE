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
}
