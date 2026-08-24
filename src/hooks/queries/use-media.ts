import { useQuery } from '@tanstack/react-query';

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
