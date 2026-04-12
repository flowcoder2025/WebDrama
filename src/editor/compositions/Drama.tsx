import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Scene } from "./Scene";
import { Transition } from "./Transition";
import type { ProductionSpec, SceneSpec } from "../../common/types";

export interface DramaProps {
  [key: string]: unknown;
  specPath: string;
  assetsDir: string;
  format: "shorts" | "longform";
  spec?: ProductionSpec;
}

function buildDialogueTimeline(
  scene: SceneSpec,
  fps: number,
): Array<{ characterId: string; text: string; startFrame: number; endFrame: number }> {
  const timeline: Array<{ characterId: string; text: string; startFrame: number; endFrame: number }> = [];
  let currentFrame = 0;

  for (const d of scene.dialogues) {
    const syllables = d.text.length;
    const durationSec = Math.max(1, syllables / 4);
    const durationFrames = Math.round(durationSec * fps);

    timeline.push({
      characterId: d.characterId,
      text: d.text,
      startFrame: currentFrame,
      endFrame: currentFrame + durationFrames,
    });

    currentFrame += durationFrames + Math.round(0.3 * fps);
  }

  return timeline;
}

export const Drama: React.FC<DramaProps> = ({ assetsDir, spec }) => {
  const { fps } = useVideoConfig();

  if (!spec || !spec.scenes || spec.scenes.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
        <span style={{ color: "white", fontSize: 48 }}>No scenes loaded</span>
      </AbsoluteFill>
    );
  }

  let frameOffset = 0;
  const sequences: React.ReactNode[] = [];

  for (let i = 0; i < spec.scenes.length; i++) {
    const scene = spec.scenes[i];
    const sceneDurationFrames = scene.duration * fps;
    const dialogueTimeline = buildDialogueTimeline(scene, fps);

    sequences.push(
      <Sequence key={scene.id} from={frameOffset} durationInFrames={sceneDurationFrames}>
        <Scene
          sceneId={scene.id}
          duration={scene.duration}
          assetsDir={assetsDir}
          hasVideo={true}
          dialogues={dialogueTimeline}
          narration={scene.narration}
          bgmVolume={scene.bgm.volume}
          bgmFadeIn={scene.bgm.fadeIn}
          bgmFadeOut={scene.bgm.fadeOut}
          subtitle={scene.subtitle}
        />
      </Sequence>,
    );

    const transitionFrames = Math.round(scene.transition.duration * fps);
    if (scene.transition.type !== "cut" && i < spec.scenes.length - 1) {
      sequences.push(
        <Sequence
          key={`transition-${scene.id}`}
          from={frameOffset + sceneDurationFrames - transitionFrames}
          durationInFrames={transitionFrames}
        >
          <Transition type={scene.transition.type} durationInFrames={transitionFrames} />
        </Sequence>,
      );
    }

    frameOffset += sceneDurationFrames;
  }

  return <AbsoluteFill>{sequences}</AbsoluteFill>;
};
