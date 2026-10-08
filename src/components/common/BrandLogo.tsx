import Svg, { Circle, Ellipse, G, Rect } from 'react-native-svg';

/** 로고 고정색 — 다크모드에서도 바뀌지 않습니다 */
const LOGO_COLORS = {
  yellow: '#efbe24',
  ink: '#2e2a24',
  cream: '#faf8f3',
  alert: '#e0574a',
} as const;

interface BrandLogoProps {
  /** 가로 크기(px). 세로는 비율에 맞춰 정해집니다 */
  size: number;
  /** mark: 강아지 + 느낌표 배지만, icon: 노란 라운드 사각 배경까지 포함한 앱 아이콘 */
  variant?: 'mark' | 'icon';
}

/**
 * 이멍전시 로고 — 강아지 얼굴 + 응급 느낌표 배지.
 *
 * 앱 아이콘(600×600) 좌표계 그대로 그리고, mark 는 강아지·배지 영역만 viewBox 로 잘라 씁니다.
 */
export default function BrandLogo({ size, variant = 'mark' }: BrandLogoProps) {
  const isIcon = variant === 'icon';
  const viewBox = isIcon ? '0 0 600 600' : '96 74 438 418';
  const height = isIcon ? size : (size * 418) / 438;

  return (
    <Svg
      width={size}
      height={height}
      viewBox={viewBox}
      accessibilityRole="image"
      accessibilityLabel="이멍전시 로고"
    >
      {isIcon && <Rect width={600} height={600} rx={140} fill={LOGO_COLORS.yellow} />}

      {/* 귀 */}
      <Ellipse
        cx={161}
        cy={282}
        rx={56}
        ry={96}
        rotation={22}
        origin="161, 282"
        fill={LOGO_COLORS.ink}
      />
      <Ellipse
        cx={415}
        cy={282}
        rx={56}
        ry={96}
        rotation={-22}
        origin="415, 282"
        fill={LOGO_COLORS.ink}
      />

      {/* 얼굴 */}
      <Circle cx={288} cy={348} r={138} fill={LOGO_COLORS.ink} />
      <Circle cx={237} cy={324} r={17} fill={LOGO_COLORS.cream} />
      <Circle cx={339} cy={324} r={17} fill={LOGO_COLORS.cream} />
      <Ellipse cx={288} cy={395} rx={66} ry={48} fill={LOGO_COLORS.cream} />
      <Ellipse cx={288} cy={375} rx={24} ry={18} fill={LOGO_COLORS.ink} />

      {/* 응급 배지 */}
      <G>
        <Circle cx={468} cy={138} r={59} fill={LOGO_COLORS.alert} />
        <Rect x={459} y={96} width={18} height={60} rx={9} fill={LOGO_COLORS.cream} />
        <Circle cx={468} cy={176} r={10} fill={LOGO_COLORS.cream} />
      </G>
    </Svg>
  );
}
