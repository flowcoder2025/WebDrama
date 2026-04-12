import React from "react";
import {
  AbsoluteFill,
  Img,
  Video,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from "remotion";
import { Subtitle } from "./Subtitle";

export interface SceneProps {
  sceneId: string;
  duration: number;
  assetsDir: string;
  hasVideo: boolean;
  dialogues: Array<{
    characterId: string;
    text: string;
    startFrame: number;
    endFrame: number;
  }>;
  narration: string | null;
  bgmVolume: number;
  bgmFadeIn: number;
  bgmFadeOut: number;
  subtitle: boolean;
}

export const Scene: React.FC<SceneProps> = ({
  sceneId,
  duration,
  assetsDir,
  hasVideo,
  dialogues,
  narration,
  bgmVolume,
  bgmFadeIn,
  bgmFadeOut,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = duration * fps;

  const bgmFadeInFrames = bgmFadeIn * fps;
  const bgmFadeOutFrames = bgmFadeOut * fps;

  const bgmVol = interpolate(
    frame,
    [0, bgmFadeInFrames, totalFrames - bgmFadeOutFrames, totalFrames],
    [0, bgmVolume, bgmVolume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const imagePath = staticFile(`${assetsDir}/images/${sceneId}.png`);
  const videoPath = staticFile(`${assetsDir}/videos/${sceneId}.mp4`);
  const bgmPath = staticFile(`${assetsDir}/bgm/${sceneId}.wav`);

  const currentDialogue = dialogues.find(
    (d) => frame >= d.startFrame && frame < d.endFrame,
  );
  const subtitleText = currentDialogue?.text ?? narration ?? "";

  return (
    <AbsoluteFill>
      {hasVideo ? (
        <Video src={videoPath} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Img src={imagePath} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      <Audio src={bgmPath} volume={bgmVol} />

      {dialogues.map((d) => (
        <Audio
          key={`${sceneId}-${d.characterId}-${d.startFrame}`}
          src={staticFile(`${assetsDir}/voices/${sceneId}_${d.characterId}.wav`)}
          startFrom={d.startFrame}
        />
      ))}

      {narration && (
        <Audio src={staticFile(`${assetsDir}/voices/${sceneId}_narration.wav`)} />
      )}

      {subtitle && subtitleText && (
        <Subtitle text={subtitleText} />
      )}
    </AbsoluteFill>
  );
};
