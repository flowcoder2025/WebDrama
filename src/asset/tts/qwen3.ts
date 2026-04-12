import type { TtsEngineInterface, TtsRequest, TtsResult } from "./engine.js";
import { log } from "../../common/logger.js";

/**
 * WI-024: Qwen3-TTS 클라이언트
 * localhost:8002 REST API 연동
 */
export class Qwen3TtsEngine implements TtsEngineInterface {
  readonly name = "Qwen3-TTS";
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:8002") {
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateVoice(request: TtsRequest): Promise<TtsResult> {
    log("info", `[Qwen3-TTS] 음성 생성: "${request.text.slice(0, 30)}..." (${request.emotion})`);

    const body = {
      text: request.text,
      voice: request.voiceProfile,
      emotion: request.emotion,
      language: request.language,
      sample_path: request.voiceSample,
    };

    const res = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Qwen3-TTS 생성 실패: ${res.status} ${res.statusText}`, { cause: null });
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuffer),
      duration: 0,
      sampleRate: 44100,
    };
  }

  async cloneVoice(samplePath: string, text: string, emotion: string): Promise<TtsResult> {
    log("info", `[Qwen3-TTS] 음성 클로닝: 샘플=${samplePath}`);

    return this.generateVoice({
      text,
      voiceProfile: "cloned",
      voiceSample: samplePath,
      emotion,
      language: "ko-KR",
    });
  }
}
