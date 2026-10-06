import { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';

import { api, toAbsoluteUrl } from '@/api';

interface AuthImageProps {
  path?: string | null;
  className?: string;
}

export default function AuthImage({ path, className }: AuthImageProps) {
  const [uri, setUri] = useState<string | undefined>();

  useEffect(() => {
    let objectUrl: string | undefined;

    const loadImage = async () => {
      if (!path) {
        setUri(undefined);
        return;
      }

      const absoluteUrl = toAbsoluteUrl(path);

      if (!absoluteUrl) {
        setUri(undefined);
        return;
      }

      try {
        // 웹은 인증 헤더가 필요한 이미지를 axios로 받아 Blob URL로 변환
        if (Platform.OS === 'web') {
          const response = await api.get(absoluteUrl, {
            responseType: 'blob',
          });

          objectUrl = URL.createObjectURL(response.data);
          setUri(objectUrl);

          return;
        }

        // 모바일은 우선 절대 URL 사용
        setUri(absoluteUrl);
      } catch (error) {
        console.error('프로필 이미지 로딩 실패:', error);

        setUri(undefined);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [path]);

  if (!uri) {
    return <View className={`bg-gray-100 ${className ?? ''}`} />;
  }

  return <Image source={{ uri }} className={className} resizeMode="cover" />;
}
