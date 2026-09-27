import { vars } from 'nativewind';

/**
 * 라이트/다크 테마 색.
 *
 * tailwind.config.js 의 paper·ink 색은 CSS 변수를 가리키고, 루트 레이아웃이 아래 값을 vars() 로 주입합니다.
 * className 을 못 쓰는 곳(아이콘 color, 탭바 style 등)은 useThemeColors() 로 같은 값을 씁니다.
 * brand(노랑)·triage 색은 두 테마에서 같습니다. 노란 배경 위 글씨는 text-ink 대신
 * 고정색(text-[#2e2a24] 또는 text-brand-900)을 씁니다 — 다크모드에서 ink 가 밝아지기 때문입니다.
 * bg-ink 위에는 text-paper 를 쓰면 두 테마 모두 대비가 유지됩니다.
 */
export const THEME_COLORS = {
  light: {
    paper: '#faf8f3',
    paperCard: '#ffffff',
    paperChip: '#edeae3',
    ink: '#2e2a24',
    inkMuted: '#8c867a',
    inkSoft: '#a9a296',
    inkLine: '#e8e4db',
    /** 웹에서 430px 앱 프레임 바깥 배경 */
    frame: '#f3f4f6',
  },
  dark: {
    paper: '#1c1a17',
    paperCard: '#2a2723',
    paperChip: '#3a362f',
    ink: '#f2efe8',
    inkMuted: '#b3ada0',
    inkSoft: '#8c867a',
    inkLine: '#3d3932',
    frame: '#0f0e0c',
  },
} as const;

export type ThemeName = keyof typeof THEME_COLORS;
export type ThemeColors = (typeof THEME_COLORS)[ThemeName];

function rgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

function toVars(colors: ThemeColors) {
  return vars({
    '--color-paper': rgb(colors.paper),
    '--color-paper-card': rgb(colors.paperCard),
    '--color-paper-chip': rgb(colors.paperChip),
    '--color-ink': rgb(colors.ink),
    '--color-ink-muted': rgb(colors.inkMuted),
    '--color-ink-soft': rgb(colors.inkSoft),
    '--color-ink-line': rgb(colors.inkLine),
  });
}

export const THEME_VARS = {
  light: toVars(THEME_COLORS.light),
  dark: toVars(THEME_COLORS.dark),
};
