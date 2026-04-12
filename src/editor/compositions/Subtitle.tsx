import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface SubtitleProps {
  text: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  fontSize = 36,
  color = "#FFFFFF",
  backgroundColor = "rgba(0, 0, 0, 0.6)",
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 5, 10], [0, 1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
        padding: "8px 24px",
        borderRadius: 8,
        backgroundColor,
        maxWidth: "80%",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize,
          color,
          fontFamily: "Pretendard, -apple-system, sans-serif",
          fontWeight: 600,
          lineHeight: 1.4,
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </span>
    </div>
  );
};
