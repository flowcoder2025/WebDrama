import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * WI-020: 캐릭터 시드 관리자
 * 동일 캐릭터의 외형 일관성을 위해 프롬프트 프리픽스 + 시드 관리
 */

interface CharacterSeed {
  characterId: string;
  promptPrefix: string;
  negativePrompt: string;
  lastUsedSeed: number | null;
}

interface SeedStore {
  characters: Record<string, CharacterSeed>;
}

const SEED_FILE = "character-seeds.json";

export function loadSeedStore(projectDir: string): SeedStore {
  const filepath = resolve(projectDir, SEED_FILE);
  if (!existsSync(filepath)) {
    return { characters: {} };
  }
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as SeedStore;
}

export function saveSeedStore(projectDir: string, store: SeedStore): void {
  const filepath = resolve(projectDir, SEED_FILE);
  writeFileSync(filepath, JSON.stringify(store, null, 2), "utf-8");
}

export function getCharacterPromptPrefix(store: SeedStore, characterId: string): string {
  return store.characters[characterId]?.promptPrefix ?? "";
}

export function updateCharacterSeed(
  store: SeedStore,
  characterId: string,
  promptPrefix: string,
  negativePrompt: string,
  seed: number | null,
): SeedStore {
  return {
    characters: {
      ...store.characters,
      [characterId]: {
        characterId,
        promptPrefix,
        negativePrompt,
        lastUsedSeed: seed,
      },
    },
  };
}

/**
 * 캐릭터 프롬프트에 일관성 프리픽스를 주입
 */
export function injectCharacterConsistency(
  basePrompt: string,
  store: SeedStore,
  characterId: string,
): string {
  const prefix = getCharacterPromptPrefix(store, characterId);
  if (!prefix) return basePrompt;
  return `${prefix}, ${basePrompt}`;
}

/**
 * WI-022: 모션 프롬프트 어댑터
 * production-spec의 videoPrompt를 Kling 2.5 형식에 맞게 변환
 */
export function adaptMotionPrompt(videoPrompt: string): string {
  const cleaned = videoPrompt
    .replace(/\b\d+\s*seconds?\b/gi, "")
    .trim();
  return `${cleaned}, smooth motion, high quality, 5 seconds`;
}
