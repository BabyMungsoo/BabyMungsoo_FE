import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  /** 0~100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
}

const TRACK_COLOR = '#f7f0dc';
const FILL_COLOR = '#efbe24';

/**
 * 8번의 원형 진행률 게이지.
 *
 * RN 에는 CSS 의 conic-gradient 가 없어서, SVG 원의 둘레(strokeDasharray)를
 * 잘라 쓰는 방식으로 그립니다.
 */
export function ProgressRing({ percent, size = 176, strokeWidth = 14 }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={FILL_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          // SVG 는 3시 방향이 0도라, 12시에서 시작하도록 90도 되돌립니다.
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View className="flex-row items-baseline">
        <Text className="text-5xl font-bold text-ink">{clamped}</Text>
        <Text className="ml-0.5 text-xl font-bold text-ink">%</Text>
      </View>
    </View>
  );
}
