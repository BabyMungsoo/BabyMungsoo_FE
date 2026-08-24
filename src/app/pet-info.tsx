// 강아지 정보
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '@/components/common/AppInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import ScreenHeader from '@/components/common/ScreenHeader';

export default function PetInfoScreen() {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const petData = {
      name,
      breed,
      age,
      gender,
      weight,
      notes,
      image,
    };

    console.log('강아지 정보 저장:', petData);

    // TODO: 나중에 여기서 Pet 등록 API 연결
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="강아지 정보" />

        {/* 프로필 이미지 */}
        <View className="my-6 items-center">
          <View className="h-32 w-32 overflow-hidden rounded-full bg-gray-100">
            {image && (
              <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
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
              style={{ width: 44, height: 44 }}
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
            label="품종 (예: 푸들, 말티즈)"
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

          {/* 특이사항 */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-700">특이사항 (선택)</Text>

            <TextInput
              placeholder="알러지, 복용 중인 약 등"
              placeholderTextColor="#BDBDBD"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              className="h-24 rounded-xl border border-gray-300 px-4 py-4 text-base text-gray-900"
            />
          </View>

          {/* 저장 버튼 */}
          <View className="mt-5">
            <PrimaryButton title="저장하기" onPress={handleSave} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
