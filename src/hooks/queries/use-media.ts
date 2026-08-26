import { useQueries, useQuery } from '@tanstack/react-query';

import { mediaApi } from '@/api';
import { queryKeys } from '@/lib/query-keys';

/** GET /media/{mediaId} */
export function useMedia(mediaId: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.media.detail(mediaId!),
    queryFn: () => mediaApi.detail(mediaId!),
    enabled: mediaId != null,
  });
}

/** 여러 media 를 병렬로 조회합니다 (분석기록 사진 최대 5장) */
export function useMediaList(mediaIds: number[] | null | undefined) {
  return useQueries({
    queries: (mediaIds ?? []).map((mediaId) => ({
      queryKey: queryKeys.media.detail(mediaId),
      queryFn: () => mediaApi.detail(mediaId),
    })),
  });
}
