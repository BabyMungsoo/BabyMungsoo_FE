import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { mediaApi } from '@/api';
import { notify } from '@/lib/confirm';
import type { UploadFile } from '@/types';

const MAX_PHOTOS = 5;

interface PhotoItem {
  /** 로컬에서만 쓰는 식별자. localUri 는 같은 사진을 두 번 고르면 중복될 수 있어 식별자로 못 씁니다. */
  id: string;
  localUri: string;
  status: 'uploading' | 'uploaded' | 'error';
  mediaId?: number;
}

let nextItemId = 0;

interface MediaUploadGridProps {
  /** 업로드가 끝난 사진들의 mediaId 목록이 바뀔 때마다 호출됩니다(문진 세션 생성 시 함께 보내기 위함). */
  onMediaIdsChange?: (mediaIds: number[]) => void;
}

/**
 * 사진을 고르는 즉시 POST /media/upload 로 올립니다.
 *
 * 아직 문진 세션이 없는 시점에 업로드하므로, 세션에 연결하는 건
 * "AI 분석 시작하기"를 눌러 세션을 만들 때(POST /triage/sessions 의 mediaIds) 이뤄집니다.
 */
export function MediaUploadGrid({ onMediaIdsChange }: MediaUploadGridProps) {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const remaining = MAX_PHOTOS - items.length;

  useEffect(() => {
    const uploadedIds = items
      .filter((item) => item.status === 'uploaded' && item.mediaId != null)
      .map((item) => item.mediaId!);
    onMediaIdsChange?.(uploadedIds);
  }, [items, onMediaIdsChange]);

  const uploadOne = async (id: string, file: UploadFile) => {
    try {
      const media = await mediaApi.upload(file);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'uploaded', mediaId: media.mediaId } : item,
        ),
      );
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'error' } : item)),
      );
    }
  };

  const pickPhotos = async () => {
    if (remaining <= 0) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      await notify('사진 접근 권한이 필요해요', '설정에서 사진 접근을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled) return;

    const picked: (UploadFile & { id: string })[] = result.assets
      .slice(0, remaining)
      .map((asset, index) => ({
        id: String(nextItemId++),
        uri: asset.uri,
        name: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      }));

    setItems((prev) => [
      ...prev,
      ...picked.map((file) => ({ id: file.id, localUri: file.uri, status: 'uploading' as const })),
    ]);
    picked.forEach((file) => uploadOne(file.id, file));
  };

  const removePhoto = async (item: PhotoItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (item.status === 'uploaded' && item.mediaId != null) {
      // 화면에서는 먼저 지우고, 서버 정리는 실패해도 조용히 무시합니다(사용자가 다시 할 수 있는 액션이 없음).
      mediaApi.remove(item.mediaId).catch(() => {});
    }
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, index) => {
    if (index < items.length) return { kind: 'photo' as const, item: items[index] };
    if (index === items.length) return { kind: 'add' as const };
    return { kind: 'empty' as const };
  });

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {slots.map((slot, index) => {
          if (slot.kind === 'photo') {
            const { item } = slot;
            return (
              <Pressable
                key={item.id}
                onPress={() => removePhoto(item)}
                className="h-16 w-16 overflow-hidden rounded-xl"
              >
                <Image
                  source={{ uri: item.localUri }}
                  style={{ height: 64, width: 64 }}
                  contentFit="cover"
                />
                {item.status === 'uploading' && (
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <ActivityIndicator color="white" size="small" />
                  </View>
                )}
                {item.status === 'error' && (
                  <View className="absolute inset-0 items-center justify-center bg-red-900/50">
                    <Ionicons name="alert-circle" size={18} color="white" />
                  </View>
                )}
                <View className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5">
                  <Ionicons name="close" size={10} color="white" />
                </View>
              </Pressable>
            );
          }

          if (slot.kind === 'add') {
            return (
              <Pressable
                key="add"
                onPress={pickPhotos}
                className="h-16 w-16 items-center justify-center rounded-xl bg-paper-chip"
              >
                <Ionicons name="camera-outline" size={20} color="#8c867a" />
                <Text className="mt-0.5 text-center text-[10px] leading-tight text-ink-muted">
                  사진{'\n'}업로드
                </Text>
              </Pressable>
            );
          }

          return (
            <View
              key={`empty-${index}`}
              className="h-16 w-16 rounded-xl border border-dashed border-ink-line"
            />
          );
        })}
      </View>
      <Text className="text-right text-xs text-ink-soft">최대 {MAX_PHOTOS}장까지 업로드 가능</Text>
    </View>
  );
}
