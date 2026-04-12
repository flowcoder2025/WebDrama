/**
 * WI-023: TTS 엔진 추상화 인터페이스
 * Qwen3-TTS / GPT-SoVITS 공통 인터페이스
 */

export interface TtsRequest {
  text: string;
  voiceProfile: string;
  voiceSample: string | null;
  emotion: string;
  language: string;
}

export interface TtsResult {
  audioBuffer: Buffer;
  duration: number;
  sampleRate: number;
}

export interface TtsEngineInterface {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  generateVoice(request: TtsRequest): Promise<TtsResult>;
  cloneVoice(samplePath: string, text: string, emotion: string): Promise<TtsResult>;
}

/**
 * WI-027: TTS 설정 관리자
 * 설정 파일 기반 엔진 전환
 */
import { loadTtsConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";

let activeEngine: TtsEngineInterface | null = null;
const engines = new Map<string, TtsEngineInterface>();

export function registerEngine(name: string, engine: TtsEngineInterface): void {
  engines.set(name, engine);
}

export function getActiveEngine(): TtsEngineInterface {
  if (activeEngine) return activeEngine;

  const config = loadTtsConfig();
  const engine = engines.get(config.activeEngine);
  if (!engine) {
    throw new Error(`TTS 엔진 '${config.activeEngine}'이 등록되지 않음. 등록된 엔진: ${[...engines.keys()].join(", ")}`, { cause: null });
  }

  activeEngine = engine;
  log("info", `TTS 엔진 활성화: ${engine.name}`);
  return engine;
}

export function switchEngine(name: string): TtsEngineInterface {
  const engine = engines.get(name);
  if (!engine) {
    throw new Error(`TTS 엔진 '${name}'이 등록되지 않음`, { cause: null });
  }
  activeEngine = engine;
  log("info", `TTS 엔진 전환: ${engine.name}`);
  return engine;
}

export function listEngines(): string[] {
  return [...engines.keys()];
}
