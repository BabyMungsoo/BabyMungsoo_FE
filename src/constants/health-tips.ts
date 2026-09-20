/** require('*.png') 는 Metro 에셋 id(number)를 돌려준다. expo-image의 source가 number를 받는다. */
type ImageSource = number;

export interface HealthTip {
  id: string;
  title: string;
  /** 카드 아이콘 이미지 (assets/images/health-tips) */
  image: ImageSource;
  /** 카드 배경색 (Tailwind 클래스) */
  bgClassName: string;
}

/** 홈 화면 '우리아이 건강팁' 섹션 — 백엔드 API 가 생기기 전까지는 정적 데이터를 씁니다 */
export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'breed-guide',
    title: '품종별 건강 가이드',
    image: require('../../assets/images/health-tips/breed-guide.png'),
    bgClassName: 'bg-amber-50',
  },
  {
    id: 'patella-prevention',
    title: '슬개골 탈구 예방법',
    image: require('../../assets/images/health-tips/patella.png'),
    bgClassName: 'bg-sky-50',
  },
  {
    id: 'early-training',
    title: '조기 훈련 팁',
    image: require('../../assets/images/health-tips/training.png'),
    bgClassName: 'bg-emerald-50',
  },
];

export interface HealthTipSection {
  heading: string;
  body: string;
}

export interface HealthTipContent {
  subtitle: string;
  /** 상세 페이지 본문 섹션 (예시 콘텐츠) */
  sections: HealthTipSection[];
}

/**
 * 상세 페이지 콘텐츠. 백엔드 콘텐츠 API 가 생기기 전까지 쓰는 예시 데이터입니다.
 * 실제 서비스에서는 수의사 감수를 받은 콘텐츠로 교체하세요.
 */
export const HEALTH_TIP_CONTENT: Record<string, HealthTipContent> = {
  'breed-guide': {
    subtitle: '우리 아이 품종에 맞는 건강 관리 포인트를 알려드려요.',
    sections: [
      {
        heading: '품종마다 약한 곳이 달라요',
        body: '푸들·말티즈 같은 소형견은 슬개골과 치아, 시츄·페키니즈 같은 단두종은 호흡기, 대형견은 고관절이 상대적으로 약합니다. 우리 아이 품종의 취약 부위를 알아두면 조기에 대처할 수 있어요.',
      },
      {
        heading: '이렇게 관리해요',
        body: '• 소형견: 미끄럼 방지 매트로 관절 부담 줄이기\n• 단두종: 더운 날 산책·흥분 상황 피하기\n• 장모종: 눈·귀 주변 위생과 피부 관리\n• 공통: 체중 관리와 정기 건강검진',
      },
      {
        heading: '이럴 땐 병원에 가요',
        body: '평소와 다른 걸음걸이, 잦은 기침, 눈·귀의 분비물, 갑작스러운 식욕 변화가 보이면 가까운 동물병원에서 진료받는 것이 안전합니다.',
      },
    ],
  },
  'patella-prevention': {
    subtitle: '소형견에게 흔한 슬개골 탈구, 생활 습관으로 예방해요.',
    sections: [
      {
        heading: '슬개골 탈구란?',
        body: '무릎 앞쪽 뼈(슬개골)가 제자리에서 벗어나는 질환이에요. 푸들·말티즈·포메라니안 등 소형견에서 자주 나타나며, 방치하면 관절염으로 이어질 수 있습니다.',
      },
      {
        heading: '이런 습관이 예방해요',
        body: '• 마룻바닥엔 미끄럼 방지 매트 깔기\n• 소파·침대 오르내림은 계단·발판 이용\n• 두 발로 서기·점프 자세 줄이기\n• 적정 체중 유지로 관절 부담 낮추기',
      },
      {
        heading: '이런 증상이면 확인하세요',
        body: '갑자기 한쪽 다리를 들고 깽깽이 걸음을 하거나, 뒷다리를 쭉 뻗으며 털어내는 동작이 보이면 슬개골 탈구를 의심할 수 있어요. 초기에 발견할수록 관리가 쉽습니다.',
      },
    ],
  },
  'early-training': {
    subtitle: '생후 초기의 올바른 훈련이 건강한 습관을 만들어요.',
    sections: [
      {
        heading: '사회화 시기가 중요해요',
        body: '생후 3~14주는 사회화 골든타임이에요. 다양한 소리·사람·환경을 부드럽게 경험시키면 겁이 적고 안정적인 성격으로 자랍니다.',
      },
      {
        heading: '기본 훈련은 짧고 긍정적으로',
        body: '• 한 번에 5~10분, 짧게 자주\n• 잘하면 간식·칭찬으로 즉시 보상\n• 배변·이름 부르기부터 차근차근\n• 온 가족이 같은 규칙으로 일관되게',
      },
      {
        heading: '이건 피해주세요',
        body: '체벌이나 큰 소리는 불안·공격성을 키울 수 있어요. 실수했을 땐 혼내기보다, 원하는 행동을 유도하고 보상하는 방식이 더 효과적입니다.',
      },
    ],
  },
};
