/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec6ff',
          400: '#59a6ff',
          500: '#208aef',
          600: '#1a6fc4',
          700: '#17589c',
          800: '#184b81',
          900: '#18406b',
        },
        // 응급도(TriageLevel)별 색상 — 백엔드 enum IMMEDIATE / WATCH / NORMAL 과 1:1 대응
        triage: {
          immediate: '#e5484d',
          watch: '#f5a524',
          normal: '#30a46c',
        },
      },
    },
  },
  plugins: [],
};
