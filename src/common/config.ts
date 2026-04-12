import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  ProjectConfig,
  FreepikConfig,
  TtsConfig,
  BgmConfig,
  RemotionRenderConfig,
} from "./types.js";

const CONFIG_DIR = resolve("config");

export function loadConfig<T>(filename: string): T {
  const filepath = resolve(CONFIG_DIR, filename);
  try {
    const raw = readFileSync(filepath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    throw new Error(`설정 파일 로드 실패: ${filepath} — ${message}`, { cause: err });
  }
}

export function loadProjectConfig(): ProjectConfig {
  return loadConfig<ProjectConfig>("default.json");
}

export function loadFreepikConfig(): FreepikConfig {
  return loadConfig<FreepikConfig>("freepik.json");
}

export function loadTtsConfig(): TtsConfig {
  return loadConfig<TtsConfig>("tts.json");
}

export function loadBgmConfig(): BgmConfig {
  return loadConfig<BgmConfig>("bgm.json");
}

export function loadRemotionConfig(): RemotionRenderConfig {
  return loadConfig<RemotionRenderConfig>("remotion.json");
}
