import { useEffect, useState } from 'react';

/**
 * 백엔드는 분석 진행률을 알려주지 않습니다. POST /triage/analyze 를 한 번 던지고
 * 응답이 올 때까지 기다리는 게 전부라, 8번 화면의 퍼센트는 전부 연출입니다.
 *
 * 그래서 여기서 멈춰 두고 응답을 기다립니다. 100% 를 먼저 찍어 놓고 계속 로딩 중이면
 * 사용자에게는 앱이 멈춘 것으로 보입니다.
 */
const CEILING = 90;
const TICK_MS = 100;

/** 남은 거리에 비례해 증가폭을 줄입니다. 끝으로 갈수록 느려져 실제 대기처럼 보입니다. */
const EASING = 0.015;
const MIN_STEP = 0.15;

/** @param isDone 실제 응답이 도착했는지. true 면 100% 로 표시합니다. */
export function useFakeProgress(isDone: boolean): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // 응답이 도착했으면 더 올릴 필요가 없습니다. 표시값은 아래 return 에서 100 으로 덮습니다.
    if (isDone) return;

    const timer = setInterval(() => {
      setPercent((prev) =>
        prev >= CEILING
          ? CEILING
          : Math.min(CEILING, prev + Math.max(MIN_STEP, (CEILING - prev) * EASING)),
      );
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [isDone]);

  // 완료 여부는 상태로 들고 있지 않고 그때그때 계산합니다.
  // effect 안에서 setState 를 호출하면 렌더가 연쇄로 다시 도는 것을 막기 위해서입니다.
  return isDone ? 100 : Math.round(percent);
}
