import type { AnalysisRecord, Hospital, Pet, Report } from '@/types';

/**
 * 백엔드 연동 전까지 화면을 확인하려고 쓰는 가짜 데이터입니다.
 * 응답 모양은 실제 DTO 와 같게 맞춰 두었으니, 연동할 때 이 폴더만 지우면 됩니다.
 */

export const MOCK_PETS: Pet[] = [
  {
    petId: 1,
    name: '초코',
    breed: '푸들',
    age: 5,
    gender: 'MALE',
    weight: 4.2,
    isNeutered: true,
    underlyingDisease: null,
    profileImage: null,
    createdAt: '2024-01-12T10:00:00',
  },
];

export const MOCK_RECORDS: AnalysisRecord[] = [
  {
    recordId: 1,
    userId: 1,
    dogId: 1,
    symptomText: '구토, 식욕 부진, 무기력',
    aiResult: '위장염(급성) 가능성 높음',
    emergencyLevel: 'IMMEDIATE',
    suspectedDisease: '급성 위장염',
    aiGuide: '즉시 동물병원 방문을 권장합니다. 수분 섭취를 자주 시켜주세요.',
    createdAt: '2024-05-21T14:30:00',
  },
  {
    recordId: 2,
    userId: 1,
    dogId: 1,
    symptomText: '설사와 묽은 변',
    aiResult: '장 트러블 의심',
    emergencyLevel: 'WATCH',
    suspectedDisease: '식이성 설사',
    aiGuide: '하루 정도 상태를 지켜보고, 혈변이 보이면 바로 병원에 가세요.',
    createdAt: '2024-05-10T09:15:00',
  },
  {
    recordId: 3,
    userId: 1,
    dogId: 1,
    symptomText: '기침과 켁켁거림',
    aiResult: '경미한 기관지 자극',
    emergencyLevel: 'NORMAL',
    suspectedDisease: null,
    aiGuide: '실내 습도를 올려 주고 산책 시 목줄 대신 하네스를 써보세요.',
    createdAt: '2024-04-28T20:45:00',
  },
  {
    recordId: 4,
    userId: 1,
    dogId: 1,
    symptomText: '눈물 자주 흘림',
    aiResult: '눈물길 자극 가능성',
    emergencyLevel: 'NORMAL',
    suspectedDisease: null,
    aiGuide: '눈 주변을 깨끗이 닦아 주고 변화가 있으면 병원에 가세요.',
    createdAt: '2024-04-16T11:20:00',
  },
  {
    recordId: 5,
    userId: 1,
    dogId: 1,
    symptomText: '피부 가려움, 긁음',
    aiResult: '알레르기성 피부염 의심',
    emergencyLevel: 'WATCH',
    suspectedDisease: '알레르기성 피부염',
    aiGuide: '긁는 부위가 붉어지거나 진물이 나면 병원 진료가 필요합니다.',
    createdAt: '2024-04-05T18:10:00',
  },
];

export const MOCK_HOSPITALS: Hospital[] = [
  {
    hospitalId: 1,
    hospitalName: '서울 중앙 동물병원',
    address: '서울특별시 서초구 서초동 123-45',
    phone: '02-123-4567',
    latitude: 37.4915,
    longitude: 127.0078,
    is24hour: false,
    openHours: '09:00 - 21:00',
    rating: 4.8,
    lastUpdated: '2024-05-01T00:00:00',
  },
  {
    hospitalId: 2,
    hospitalName: '24시 우리동물메디컬센터',
    address: '서울특별시 강남구 역삼동 67-8',
    phone: '02-987-6543',
    latitude: 37.5006,
    longitude: 127.0364,
    is24hour: true,
    openHours: '24시간',
    rating: 4.6,
    lastUpdated: '2024-05-01T00:00:00',
  },
  {
    hospitalId: 3,
    hospitalName: '한강 동물의료센터',
    address: '서울특별시 용산구 이촌동 300-1',
    phone: '02-555-1234',
    latitude: 37.5209,
    longitude: 126.9745,
    is24hour: false,
    openHours: '10:00 - 19:00',
    rating: 4.3,
    lastUpdated: '2024-05-01T00:00:00',
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    reportId: 1,
    recordId: 1,
    hospitalId: 1,
    reportContent:
      '구토와 설사가 반복되고 식욕이 없어 무기력한 상태입니다. 급성 위장염 가능성이 높아 즉시 진료가 필요합니다.',
    emergencyLevel: 'IMMEDIATE',
    createdAt: '2024-05-21T14:32:00',
  },
  {
    reportId: 2,
    recordId: 2,
    hospitalId: 2,
    reportContent: '묽은 변이 이틀째 이어지고 있습니다. 탈수 여부 확인이 필요합니다.',
    emergencyLevel: 'WATCH',
    createdAt: '2024-05-10T09:20:00',
  },
];
