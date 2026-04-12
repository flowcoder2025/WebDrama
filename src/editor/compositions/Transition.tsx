import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type TransitionType = "crossfade" | "cut" | "fade-to-black";

export interface TransitionProps {
  type: TransitionType;
  durationInFrames: number;
}

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
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity,
        }}
      />
    );
  }

  if (type === "crossfade") {
    const opacity = interpolate(frame, [0, durationInFrames], [1, 0], {
      extrapolateRight: "clamp",
    });

    return (
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity,
        }}
      />
    );
  }

  return null;
};
