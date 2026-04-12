import type { TtsEngineInterface, TtsRequest, TtsResult } from "./engine.js";
import { log } from "../../common/logger.js";

/**
 * WI-025: GPT-SoVITS 클라이언트
 * localhost:8003 REST API 연동
 */
export class GptSovitsEngine implements TtsEngineInterface {
  readonly name = "GPT-SoVITS";
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:8003") {
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
    log("info", `[GPT-SoVITS] 음성 생성: "${request.text.slice(0, 30)}..." (${request.emotion})`);

    const body = {
      text: request.text,
      text_language: request.language === "ko-KR" ? "ko" : "en",
      refer_wav_path: request.voiceSample,
      prompt_text: "",
      prompt_language: "ko",
    };

    const res = await fetch(`${this.baseUrl}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`GPT-SoVITS 생성 실패: ${res.status} ${res.statusText}`, { cause: null });
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
      audioBuffer: Buffer.from(arrayBuffer),
      duration: 0,
      sampleRate: 32000,
    };
  }

  async cloneVoice(samplePath: string, text: string, emotion: string): Promise<TtsResult> {
    log("info", `[GPT-SoVITS] 음성 클로닝: 샘플=${samplePath}`);

    return this.generateVoice({
      text,
      voiceProfile: "cloned",
      voiceSample: samplePath,
      emotion,
      language: "ko-KR",
    });
  }
}
