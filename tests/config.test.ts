import { describe, it, expect } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig, loadProjectConfig, loadFreepikConfig, loadTtsConfig, loadBgmConfig, loadRemotionConfig } from "../src/common/config.js";

describe("설정 로더", () => {
  it("loadProjectConfig — default.json 정상 로드", () => {
    const config = loadProjectConfig();
    expect(config.chrome.cdpPort).toBe(9222);
    expect(config.output.defaultFormat).toBe("shorts");
    expect(config.pipeline.evalPassScore).toBe(10);
  });

  it("loadFreepikConfig — freepik.json 정상 로드", () => {
    const config = loadFreepikConfig();
    expect(config.image.model).toBe("Google Nano Banana 2");
    expect(config.image.width).toBe(2752);
    expect(config.video.model).toBe("Kling 2.5");
  });

  it("loadTtsConfig — tts.json 정상 로드", () => {
    const config = loadTtsConfig();
    expect(config.activeEngine).toBe("qwen3");
    expect(config.engines.qwen3.baseUrl).toBe("http://localhost:8002");
    expect(config.engines["gpt-sovits"].baseUrl).toBe("http://localhost:8003");
  });

  it("loadBgmConfig — bgm.json 정상 로드", () => {
    const config = loadBgmConfig();
    expect(config.engine).toBe("ace-step-1.5xl");
    expect(config.baseUrl).toBe("http://localhost:8001");
    expect(config.model).toBe("acestep-v15-xl-sft");
  });

  it("loadRemotionConfig — remotion.json 정상 로드", () => {
    const config = loadRemotionConfig();
    expect(config.gl).toBe("angle");
    expect(config.shorts.width).toBe(1080);
    expect(config.longform.width).toBe(1920);
  });

  it("존재하지 않는 파일 로드 시 에러", () => {
    expect(() => loadConfig("nonexistent.json")).toThrow("설정 파일 로드 실패");
  });

  it("잘못된 JSON 파일 로드 시 에러", () => {
    const tmpDir = resolve("config");
    const tmpFile = resolve(tmpDir, "_test_invalid.json");
    writeFileSync(tmpFile, "{ invalid json }", "utf-8");
    try {
      expect(() => loadConfig("_test_invalid.json")).toThrow("설정 파일 로드 실패");
    } finally {
      rmSync(tmpFile);
    }
  });
});

describe("로거", () => {
  it("log info 호출 시 에러 없음", async () => {
    const { log } = await import("../src/common/logger.js");
    expect(() => log("info", "테스트 메시지")).not.toThrow();
  });

  it("log error 호출 시 에러 없음", async () => {
    const { log } = await import("../src/common/logger.js");
    expect(() => log("error", "에러 메시지")).not.toThrow();
  });

  it("log warn 호출 시 에러 없음", async () => {
    const { log } = await import("../src/common/logger.js");
    expect(() => log("warn", "경고 메시지")).not.toThrow();
  });
});
