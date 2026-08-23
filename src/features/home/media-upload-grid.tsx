import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, Text, View } from 'react-native';

import { notify } from '@/lib/confirm';
import type { UploadFile } from '@/types';

const MAX_PHOTOS = 5;

interface MediaUploadGridProps {
  photos: UploadFile[];
  onChange: (photos: UploadFile[]) => void;
}

export function MediaUploadGrid({ photos, onChange }: MediaUploadGridProps) {
  const remaining = MAX_PHOTOS - photos.length;

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

    const picked: UploadFile[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    }));

    onChange([...photos, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (uri: string) => {
    onChange(photos.filter((photo) => photo.uri !== uri));
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, index) => {
    if (index < photos.length) return { kind: 'photo' as const, photo: photos[index] };
    if (index === photos.length) return { kind: 'add' as const };
    return { kind: 'empty' as const };
  });

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {slots.map((slot, index) => {
          if (slot.kind === 'photo') {
            return (
              <Pressable
                key={slot.photo.uri}
                onPress={() => removePhoto(slot.photo.uri)}
                className="h-16 w-16 overflow-hidden rounded-xl"
              >
                <Image
                  source={{ uri: slot.photo.uri }}
                  className="h-full w-full"
                  contentFit="cover"
                />
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
