import { Image } from 'expo-image';
import { ScrollView } from 'react-native';

/** 한 장일 때의 높이이자, 여러 장일 때 썸네일 한 변의 길이 */
const PHOTO_HEIGHT = 180;

interface PhotoStripProps {
  /**
   * toAbsoluteUrl() 을 거친 절대 URL 들.
   * media 조회는 라우트가 하고 이 컴포넌트는 그리기만 합니다.
   */
  photoUrls: string[];
}

/**
 * 문진에 첨부한 사진들. 4번(응급 판단 결과)과 7번(분석기록 상세)이 같은 모양으로 씁니다.
 *
 * 한 장이면 카드 폭 전체로 크게, 여러 장이면 가로로 넘겨 봅니다.
 * (백엔드가 세션당 5장으로 막고 있어 개수가 늘어날 일은 없습니다)
 */
export function PhotoStrip({ photoUrls }: PhotoStripProps) {
  if (photoUrls.length === 0) return null;

  if (photoUrls.length === 1) {
    return (
      <Image
        source={{ uri: photoUrls[0] }}
        accessibilityLabel="첨부 사진"
        style={{ height: PHOTO_HEIGHT, width: '100%', borderRadius: 16 }}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
      {photoUrls.map((uri, index) => (
        <Image
          key={uri}
          source={{ uri }}
          accessibilityLabel={`첨부 사진 ${index + 1}`}
          style={{ height: PHOTO_HEIGHT, width: PHOTO_HEIGHT, borderRadius: 16 }}
          contentFit="cover"
          transition={150}
        />
      ))}
    </ScrollView>
  );
}
