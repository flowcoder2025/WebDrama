import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { SceneSpec, Character } from "../../common/types.js";
import { getActiveEngine } from "./engine.js";
import { log } from "../../common/logger.js";

/**
 * WI-026: 나레이션 음성 생성기
 * 장면별 대사 + 나레이션 WAV 생성
 */
export async function generateSceneVoices(
  scene: SceneSpec,
  characters: Character[],
  outputDir: string,
): Promise<string[]> {
  const engine = getActiveEngine();
  const savedFiles: string[] = [];
  const charMap = new Map(characters.map(c => [c.id, c]));

  for (const dialogue of scene.dialogues) {
    const char = charMap.get(dialogue.characterId);
    if (!char) {
      log("warn", `캐릭터 ${dialogue.characterId}를 찾을 수 없음 — 스킵`);
      continue;
    }

    const result = char.voiceSample
      ? await engine.cloneVoice(char.voiceSample, dialogue.text, dialogue.emotion)
      : await engine.generateVoice({
          text: dialogue.text,
          voiceProfile: char.voiceProfile,
          voiceSample: null,
          emotion: dialogue.emotion,
          language: "ko-KR",
        });

    const filename = `${scene.id}_${dialogue.characterId}.wav`;
    const filepath = resolve(outputDir, "voices", filename);
    mkdirSync(dirname(filepath), { recursive: true });
    writeFileSync(filepath, result.audioBuffer);
    savedFiles.push(filepath);
    log("info", `음성 저장: ${filename}`);
  }

  if (scene.narration) {
    const result = await engine.generateVoice({
      text: scene.narration,
      voiceProfile: "narrator",
      voiceSample: null,
      emotion: "calm",
      language: "ko-KR",
    });

    const filename = `${scene.id}_narration.wav`;
    const filepath = resolve(outputDir, "voices", filename);
    mkdirSync(dirname(filepath), { recursive: true });
    writeFileSync(filepath, result.audioBuffer);
    savedFiles.push(filepath);
    log("info", `나레이션 저장: ${filename}`);
  }

  return savedFiles;
}
