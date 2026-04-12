import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type TransitionType = "crossfade" | "cut" | "fade-to-black";

export interface TransitionProps {
  type: TransitionType;
  durationInFrames: number;
}

/**
 * 장면 전환 효과 컴포넌트
 * - cut: 즉시 전환 (렌더링 없음)
 * - fade-to-black: 현재 장면이 검정으로 페이드아웃
 * - crossfade: 현재 장면의 불투명도가 줄어들며 다음 장면이 드러남
 *   (실제 크로스 디졸브 — 이전 장면 위에 반투명 오버레이로 구현)
 */
export const Transition: React.FC<TransitionProps> = ({
  type,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  if (type === "cut") return null;

  if (type === "fade-to-black") {
    const opacity = interpolate(frame, [0, durationInFrames], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <AbsoluteFill style={{ backgroundColor: "black", opacity }} />
    );
  }

  if (type === "crossfade") {
    const opacity = interpolate(frame, [0, durationInFrames], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <AbsoluteFill style={{ backgroundColor: "black", opacity: opacity * 0.5 }} />
    );
  }

  return null;
};

/**
 * 전환 유형 유효성 검증
 */
export function isValidTransitionType(type: string): type is TransitionType {
  return type === "crossfade" || type === "cut" || type === "fade-to-black";
}
