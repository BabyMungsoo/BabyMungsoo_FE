import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi, mediaApi, setAuthToken } from '@/api';
import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import ScreenHeader from '@/components/common/ScreenHeader';
import { useCreatePet } from '@/hooks/queries/use-pets';
import { useSessionStore } from '@/stores/use-session-store';
import { useSignupStore } from '@/stores/use-signup-store';

export default function PetInfoScreen() {
  // 반려동물 정보
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);

  // 프로필 이미지
  const [image, setImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  // mode=add이면 이미 가입된 사용자의 펫 추가
  const { mode } = useLocalSearchParams<{
    mode?: string;
  }>();

  const isAddMode = mode === 'add';

  // 최초 회원가입 때만 사용하는 임시 회원 정보
  const signupDraft = useSignupStore((state) => state.signupDraft);

  const clearSignupDraft = useSignupStore((state) => state.clearSignupDraft);

  const setSession = useSessionStore((state) => state.setSession);

  const createPetMutation = useCreatePet();

  /**
   * 이미지 선택
   */
  const pickImage = async () => {
    setErrorMessage('');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
      setErrorMessage('JPG, PNG, GIF 이미지만 업로드할 수 있습니다.');
      return;
    }

    if (asset.fileSize && asset.fileSize > 7 * 1024 * 1024) {
      setErrorMessage('이미지는 7MB 이하만 업로드할 수 있습니다.');
      return;
    }

    setImage(asset.uri);
    setImageFileName(asset.fileName ?? 'pet-profile.jpg');
    setImageMimeType(asset.mimeType ?? 'image/jpeg');
  };

  /**
   * 반려동물 저장
   *
   * mode=add
   * → 이미 로그인된 사용자
   * → 펫만 추가
   *
   * mode 없음
   * → 최초 회원가입
   * → 회원가입 → 로그인 → 펫 등록
   */
  const handleSavePet = async () => {
    setErrorMessage('');

    // 입력값 검증
    if (!name.trim()) {
      setErrorMessage('강아지 이름을 입력해주세요.');
      return;
    }

    if (!breed.trim()) {
      setErrorMessage('품종을 입력해주세요.');
      return;
    }

    if (!age.trim()) {
      setErrorMessage('나이를 입력해주세요.');
      return;
    }

    const parsedAge = Number(age);

    if (!Number.isFinite(parsedAge) || parsedAge < 0) {
      setErrorMessage('올바른 나이를 입력해주세요.');
      return;
    }

    const parsedWeight = weight.trim() === '' ? undefined : Number(weight);

    if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      setErrorMessage('올바른 체중을 입력해주세요.');
      return;
    }

    try {
      /**
       * =========================
       * 기존 사용자 펫 추가 모드
       * =========================
       *
       * 이미 JWT가 있으므로
       * 회원가입/로그인 API를 호출하지 않는다.
       */

      if (isAddMode) {
        let profileImage: string | undefined;

        if (image) {
          const uploadedMedia = await mediaApi.upload({
            uri: image,
            name: imageFileName ?? 'pet-profile.jpg',
            type: imageMimeType ?? 'image/jpeg',
          });

          profileImage = uploadedMedia.fileUrl;
        }

        await createPetMutation.mutateAsync({
          name: name.trim(),
          breed: breed.trim(),
          age: parsedAge,
          gender,
          weight: parsedWeight,
          isNeutered,
          underlyingDisease: notes.trim() || undefined,
          profileImage,
        });

        // 기존 회원의 펫 추가 완료
        router.replace('/my-info' as never);

        return;
      }

      /**
       * =========================
       * 최초 회원가입 모드
       * =========================
       */

      if (!signupDraft) {
        setErrorMessage('회원가입 정보가 없습니다. 회원가입부터 다시 진행해주세요.');

        router.replace('/signup');

        return;
      }

      // 1. 회원 계정 생성
      await authApi.signup({
        email: signupDraft.email,
        password: signupDraft.password,
        name: signupDraft.name,
        phone: signupDraft.phone,
      });

      // 2. 생성한 계정으로 자동 로그인
      const loginResult = await authApi.login({
        email: signupDraft.email,
        password: signupDraft.password,
      });

      // 3. Axios에 JWT 등록
      setAuthToken(loginResult.accessToken);

      // 4. 전역 로그인 세션 저장
      setSession({
        userId: loginResult.userId,
        accessToken: loginResult.accessToken,
        email: loginResult.email,
        name: loginResult.name,
      });

      /**
       * 로그인 이후부터
       * 인증이 필요한 media/pets API 호출 가능
       */

      let profileImage: string | undefined;

      // 5. 이미지가 있으면 업로드
      if (image) {
        const uploadedMedia = await mediaApi.upload({
          uri: image,
          name: imageFileName ?? 'pet-profile.jpg',
          type: imageMimeType ?? 'image/jpeg',
        });

        profileImage = uploadedMedia.fileUrl;
      }

      // 6. 최초 반려동물 등록
      await createPetMutation.mutateAsync({
        name: name.trim(),
        breed: breed.trim(),
        age: parsedAge,
        gender,
        weight: parsedWeight,
        isNeutered,
        underlyingDisease: notes.trim() || undefined,
        profileImage,
      });

      // 7. 임시 회원가입 정보 제거
      clearSignupDraft();

      // 8. 홈으로 이동
      router.replace('/(tabs)' as never);
    } catch (error) {
      console.error(isAddMode ? '반려동물 등록 실패:' : '회원가입 실패:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : isAddMode
            ? '반려동물 등록 중 오류가 발생했습니다.'
            : '회원가입 처리 중 오류가 발생했습니다.',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 모드에 따라 제목 변경 */}
        <ScreenHeader title={isAddMode ? '반려동물 등록' : '강아지 정보'} />

        {/* 프로필 이미지 */}
        <View className="my-6 items-center">
          <View className="h-32 w-32 overflow-hidden rounded-full bg-gray-100">
            {image ? (
              <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Text className="text-sm text-gray-400">사진</Text>
              </View>
            )}
          </View>

          {/* 카메라 버튼 */}
          <Pressable
            onPress={pickImage}
            className="-mt-8 ml-24 h-11 w-11 items-center justify-center"
            hitSlop={8}
          >
            <Image
              source={require('../../assets/images/icons/camera.png')}
              style={{
                width: 25,
                height: 25,
              }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View className="gap-5">
          {/* 이름 */}
          <AppInput
            label="이름 (필수)"
            placeholder="강아지 이름"
            value={name}
            onChangeText={setName}
          />

          {/* 품종 */}
          <AppInput
            label="품종 (필수)"
            placeholder="품종을 입력해주세요"
            value={breed}
            onChangeText={setBreed}
          />

          {/* 나이 / 성별 */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <AppInput
                label="나이(년)"
                placeholder="0"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1 gap-2">
              <Text className="text-sm font-semibold text-gray-700">성별</Text>

              <View className="flex-row gap-2">
                {/* 남아 */}
                <Pressable
                  onPress={() => setGender('MALE')}
                  className={`h-14 flex-1 items-center justify-center rounded-xl border ${
                    gender === 'MALE' ? 'border-[#FFD83D] bg-[#FFF8D7]' : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      gender === 'MALE' ? 'text-[#C89A00]' : 'text-gray-500'
                    }`}
                  >
                    남아
                  </Text>
                </Pressable>

                {/* 여아 */}
                <Pressable
                  onPress={() => setGender('FEMALE')}
                  className={`h-14 flex-1 items-center justify-center rounded-xl border ${
                    gender === 'FEMALE'
                      ? 'border-[#FFD83D] bg-[#FFF8D7]'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      gender === 'FEMALE' ? 'text-[#C89A00]' : 'text-gray-500'
                    }`}
                  >
                    여아
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 체중 */}
          <AppInput
            label="체중(kg)"
            placeholder="예: 4.2"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          {/* 중성화 */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">중성화 여부</Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsNeutered(true)}
                className={`flex-1 items-center rounded-xl border p-4 ${
                  isNeutered ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={isNeutered ? 'font-semibold text-[#C89A00]' : 'text-gray-600'}>
                  완료
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setIsNeutered(false)}
                className={`flex-1 items-center rounded-xl border p-4 ${
                  !isNeutered ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={!isNeutered ? 'font-semibold text-[#C89A00]' : 'text-gray-600'}>
                  미완료
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 특이사항 */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">특이사항 (선택)</Text>

            <TextInput
              placeholder="기저질환, 알러지, 복용 중인 약 등"
              placeholderTextColor="#BDBDBD"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              className="h-24 rounded-xl border border-gray-300 px-4 py-4 text-base text-gray-900"
            />
          </View>

          {/* 에러 */}
          {errorMessage ? <Text className="text-sm text-red-500">{errorMessage}</Text> : null}

          {/* 저장 버튼 */}
          <PrimaryButton
            title={
              createPetMutation.isPending
                ? '저장 중...'
                : isAddMode
                  ? '반려동물 등록하기'
                  : '회원가입 완료'
            }
            onPress={handleSavePet}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
