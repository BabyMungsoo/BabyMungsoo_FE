import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * 웹 빌드(npx expo export -p web)의 모든 페이지에 들어가는 HTML 뼈대. 웹에서만 쓰입니다.
 *
 * 기본 템플릿(charset·viewport·ScrollViewStyleReset)에 링크 공유 미리보기(Open Graph)를 더했습니다.
 * 카카오톡·슬랙 등은 이 태그를 읽어 카드를 만듭니다. 이미지는 절대 주소여야 해서 배포 주소를 씁니다.
 * 미리보기 이미지는 public/og-image.png (1200×630) 입니다.
 */
const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? 'https://babymungsoo.vercel.app').replace(
  /\/$/,
  '',
);
const TITLE = '이멍전시';
const DESCRIPTION =
  '반려견 응급 상황, AI가 함께합니다. 증상을 남기면 가까운 동물병원 연결을 도와요.';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#EFBE24" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={TITLE} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="이멍전시 로고" />
        <meta property="og:locale" content="ko_KR" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* 루트 ScrollView 가 있는 RN 웹 앱의 높이·스크롤을 네이티브와 맞춥니다 (기본 템플릿과 같음) */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
