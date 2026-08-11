/** @type {import('tailwindcss').Config} */
module.exports = {
  // constants/ 에도 클래스 문자열이 있어서(TRIAGE_LEVEL_META 의 bg-triage-*) src 전체를 훑습니다
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 아기멍수 메인 컬러 (노랑) — 피그마 시안 기준
        brand: {
          50: '#fef9e7',
          100: '#fdf0c4',
          200: '#fae49b',
          300: '#f7d766',
          400: '#f4cb4a',
          500: '#efbe24',
          600: '#d9a50f',
          700: '#b0830c',
          800: '#8a660e',
          900: '#5c4408',
        },
        // 따뜻한 아이보리 계열 배경/텍스트
        paper: {
          DEFAULT: '#faf8f3',
          card: '#ffffff',
          chip: '#edeae3',
        },
        ink: {
          DEFAULT: '#2e2a24',
          muted: '#8c867a',
          soft: '#a9a296',
          line: '#e8e4db',
        },
        // 응급도(TriageLevel)별 색상 — 백엔드 enum IMMEDIATE / WATCH / NORMAL 과 1:1 대응
        triage: {
          immediate: '#e03131',
          watch: '#e0a800',
          normal: '#74b85a',
        },
      },
    },
  },
  plugins: [],
};
