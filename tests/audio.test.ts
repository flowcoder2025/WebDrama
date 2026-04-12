import { describe, it, expect } from "vitest";
import {
  registerEngine,
  switchEngine,
  listEngines,
  type TtsEngineInterface,
  type TtsRequest,
  type TtsResult,
} from "../src/asset/tts/engine.js";
import { Qwen3TtsEngine } from "../src/asset/tts/qwen3.js";
import { GptSovitsEngine } from "../src/asset/tts/gpt-sovits.js";

class MockTtsEngine implements TtsEngineInterface {
  readonly name = "mock-tts";
  async isAvailable() { return true; }
  async generateVoice(_request: TtsRequest): Promise<TtsResult> {
    return { audioBuffer: Buffer.from("mock"), duration: 1, sampleRate: 44100 };
  }
  async cloneVoice(_sample: string, _text: string, _emotion: string): Promise<TtsResult> {
    return { audioBuffer: Buffer.from("cloned"), duration: 1, sampleRate: 44100 };
  }
}

describe("TTS 엔진 추상화", () => {
  it("엔진 등록 및 목록 조회", () => {
    registerEngine("mock", new MockTtsEngine());
    expect(listEngines()).toContain("mock");
  });

  it("엔진 전환", () => {
    registerEngine("mock", new MockTtsEngine());
    const engine = switchEngine("mock");
    expect(engine.name).toBe("mock-tts");
  });

  it("미등록 엔진 전환 시 에러", () => {
    expect(() => switchEngine("nonexistent")).toThrow("등록되지 않음");
  });

  it("mock 엔진 음성 생성", async () => {
    registerEngine("mock", new MockTtsEngine());
    const engine = switchEngine("mock");
    const result = await engine.generateVoice({
      text: "테스트",
      voiceProfile: "test",
      voiceSample: null,
      emotion: "calm",
      language: "ko-KR",
    });
    expect(result.audioBuffer.length).toBeGreaterThan(0);
  });

  it("mock 엔진 음성 클로닝", async () => {
    registerEngine("mock", new MockTtsEngine());
    const engine = switchEngine("mock");
    const result = await engine.cloneVoice("sample.wav", "테스트", "happy");
    expect(result.audioBuffer.toString()).toBe("cloned");
  });
});

describe("Qwen3-TTS 클라이언트", () => {
  it("인스턴스 생성", () => {
    const engine = new Qwen3TtsEngine("http://localhost:8002");
    expect(engine.name).toBe("Qwen3-TTS");
  });

  it("서버 미실행 시 isAvailable false", async () => {
    const engine = new Qwen3TtsEngine("http://localhost:19999");
    expect(await engine.isAvailable()).toBe(false);
  });
});

describe("GPT-SoVITS 클라이언트", () => {
  it("인스턴스 생성", () => {
    const engine = new GptSovitsEngine("http://localhost:8003");
    expect(engine.name).toBe("GPT-SoVITS");
  });

  it("서버 미실행 시 isAvailable false", async () => {
    const engine = new GptSovitsEngine("http://localhost:19999");
    expect(await engine.isAvailable()).toBe(false);
  });
});
