import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * @deprecated WI-043에서 character-ref.ts의 RefStore로 대체됨
 * 기존 프로젝트 호환을 위해 유지
 */

interface SeedStore {
  characters: Record<string, { characterId: string; promptPrefix: string; negativePrompt: string; lastUsedSeed: number | null }>;
}

const SEED_FILE = "character-seeds.json";

/** @deprecated loadRefStore() 사용 권장 */
export function loadSeedStore(projectDir: string): SeedStore {
  const filepath = resolve(projectDir, SEED_FILE);
  if (!existsSync(filepath)) {
    return { characters: {} };
  }
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as SeedStore;
}

/** @deprecated saveRefStore() 사용 권장 */
export function saveSeedStore(projectDir: string, store: SeedStore): void {
  const filepath = resolve(projectDir, SEED_FILE);
  writeFileSync(filepath, JSON.stringify(store, null, 2), "utf-8");
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
