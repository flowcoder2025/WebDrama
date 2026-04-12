import type {
  Character,
  SceneSpec,
  BgmSpec,
  TransitionSpec,
  ProductionSpec,
  ResearchReport,
} from "../common/types.js";
import type { ScenarioOutput, ScenarioScene } from "./scenario.js";

/**
 * WI-014: Freepik 이미지 프롬프트 빌더
 */
export function imagePromptForScene(
  scene: ScenarioScene,
  visualStyle: string,
  colorPalette: string[],
  variantIndex: number,
): string {
  const colorHint = colorPalette.length > 0
    ? `color palette: ${colorPalette.join(", ")}, `
    : "";

  const variants = [
    `${visualStyle} style, ${scene.description}, ${colorHint}high detail, cinematic lighting, 16:9 ratio`,
    `${visualStyle} style, ${scene.description}, ${colorHint}soft focus, warm tones, emotional atmosphere, 16:9`,
    `${visualStyle} style, ${scene.description}, ${colorHint}dramatic composition, detailed background, 16:9`,
  ];

  return variants[variantIndex % variants.length];
}

/**
 * WI-015: Freepik 영상 프롬프트 빌더
 */
export function videoPromptForScene(
  scene: ScenarioScene,
  variantIndex: number,
): string {
  const motionVariants = [
    `slow zoom in on subject, gentle camera movement, 5 seconds`,
    `slow pan from left to right, atmospheric motion, 5 seconds`,
    `subtle parallax effect, foreground and background layers, 5 seconds`,
  ];

  return `${scene.description}, ${motionVariants[variantIndex % motionVariants.length]}`;
}

/**
 * WI-016: ACE-Step 음악 프롬프트 빌더
 */
export function bgmPromptForScene(
  scene: ScenarioScene,
  genre: string,
): string {
  const moodMap: Record<string, string> = {
    happy: "upbeat, cheerful, major key",
    sad: "melancholic, minor key, slow tempo",
    tense: "suspenseful, building tension, rhythmic",
    romantic: "soft piano, warm strings, gentle",
    action: "fast tempo, energetic, driving beat",
    calm: "ambient, peaceful, minimal",
  };

  const descWords = scene.description.toLowerCase();
  let mood = "calm";
  for (const key of Object.keys(moodMap)) {
    if (descWords.includes(key)) {
      mood = key;
      break;
    }
  }

  return `${genre} drama background music, ${moodMap[mood]}, instrumental, cinematic`;
}

/**
 * WI-017: production-spec.json 조립기
 * 시나리오 + 캐릭터 + 프롬프트를 ProductionSpec으로 통합
 */
export function assembleProductionSpec(
  scenario: ScenarioOutput,
  characters: Character[],
  report: ResearchReport,
  dialogues: Map<string, { dialogues: import("../common/types.js").Dialogue[]; narration: string | null }>,
  _promptVariants: number,
): ProductionSpec {
  const visualStyle = report.successPatterns.visual[0]?.style ?? "anime";
  const colorPalette = report.successPatterns.visual[0]?.colorPalette ?? [];
  const allScenes = scenario.acts.flatMap(act => act.scenes);

  const scenes: SceneSpec[] = allScenes.map((scene, idx) => {
    const sceneData = dialogues.get(scene.id);
    const isLast = idx === allScenes.length - 1;

    const bgm: BgmSpec = {
      prompt: bgmPromptForScene(scene, scenario.metadata.genre),
      volume: 0.3,
      fadeIn: idx === 0 ? 2 : 1,
      fadeOut: isLast ? 2 : 1,
    };

    const transition: TransitionSpec = isLast
      ? { type: "fade-to-black", duration: 2 }
      : { type: "crossfade", duration: 1.5 };

    return {
      id: scene.id,
      duration: scene.duration,
      description: scene.description,
      imagePrompt: imagePromptForScene(scene, visualStyle, colorPalette, 0),
      videoPrompt: videoPromptForScene(scene, 0),
      dialogues: sceneData?.dialogues ?? [],
      narration: sceneData?.narration ?? null,
      bgm,
      transition,
      subtitle: true,
    };
  });

  return {
    metadata: scenario.metadata,
    characters,
    scenes,
  };
}

/**
 * ProductionSpec 유효성 검증
 */
export function validateProductionSpec(spec: ProductionSpec): string[] {
  const errors: string[] = [];

  if (!spec.metadata.title) errors.push("제목이 비어있음");
  if (spec.scenes.length === 0) errors.push("장면이 없음");
  if (spec.characters.length === 0) errors.push("캐릭터가 없음");

  const charIds = new Set(spec.characters.map(c => c.id));
  for (const scene of spec.scenes) {
    if (!scene.imagePrompt) errors.push(`${scene.id}: 이미지 프롬프트 누락`);
    if (!scene.videoPrompt) errors.push(`${scene.id}: 영상 프롬프트 누락`);
    if (!scene.bgm.prompt) errors.push(`${scene.id}: BGM 프롬프트 누락`);

    for (const d of scene.dialogues) {
      if (!charIds.has(d.characterId)) {
        errors.push(`${scene.id}: 존재하지 않는 캐릭터 ${d.characterId}`);
      }
    }
  }

  return errors;
}
