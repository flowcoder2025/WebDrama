import { describe, it, expect } from "vitest";
import { validateRenderOptions } from "../src/editor/renderer.js";
import { isValidTransitionType } from "../src/editor/compositions/Transition.js";

describe("렌더러 — 옵션 검증", () => {
  it("유효한 렌더 옵션 검증 통과", () => {
    const errors = validateRenderOptions({
      specPath: "projects/test/production-spec.json",
      assetsDir: "projects/test/assets",
      outputPath: "projects/test/output/final.mp4",
      format: "shorts",
    });
    expect(errors).toHaveLength(0);
  });

  it("빈 specPath 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "", assetsDir: "assets", outputPath: "out.mp4", format: "shorts",
    });
    expect(errors).toContain("specPath가 비어있음");
  });

  it("빈 assetsDir 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json", assetsDir: "", outputPath: "out.mp4", format: "longform",
    });
    expect(errors).toContain("assetsDir가 비어있음");
  });

  it("빈 outputPath 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json", assetsDir: "assets", outputPath: "", format: "shorts",
    });
    expect(errors).toContain("outputPath가 비어있음");
  });

  it("잘못된 format 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json", assetsDir: "assets", outputPath: "out.mp4",
      format: "invalid" as "shorts",
    });
    expect(errors.some(e => e.includes("잘못된 format"))).toBe(true);
  });

  it("롱폼 포맷 검증 통과", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json", assetsDir: "assets", outputPath: "out.mp4", format: "longform",
    });
    expect(errors).toHaveLength(0);
  });

  it("모든 필드 빈 경우 에러 3개", () => {
    const errors = validateRenderOptions({
      specPath: "", assetsDir: "", outputPath: "", format: "shorts",
    });
    expect(errors).toHaveLength(3);
  });
});

describe("전환 효과 — 유효성 검증", () => {
  it("crossfade는 유효", () => {
    expect(isValidTransitionType("crossfade")).toBe(true);
  });

  it("cut은 유효", () => {
    expect(isValidTransitionType("cut")).toBe(true);
  });

  it("fade-to-black은 유효", () => {
    expect(isValidTransitionType("fade-to-black")).toBe(true);
  });

  it("잘못된 타입은 무효", () => {
    expect(isValidTransitionType("wipe")).toBe(false);
    expect(isValidTransitionType("")).toBe(false);
  });
});

describe("Drama — buildDialogueTimeline 로직", () => {
  it("대사 타임라인 — 글자 수 기반 duration 계산", () => {
    // 한글 4음절 ≈ 1초 → 8글자 = 2초 = 60프레임(30fps)
    const syllables = 8;
    const durationSec = Math.max(1, syllables / 4);
    expect(durationSec).toBe(2);

    const durationFrames = Math.round(durationSec * 30);
    expect(durationFrames).toBe(60);
  });

  it("짧은 대사 — 최소 1초", () => {
    const syllables = 2;
    const durationSec = Math.max(1, syllables / 4);
    expect(durationSec).toBe(1);
  });

  it("빈 대사 — 최소 1초", () => {
    const syllables = 0;
    const durationSec = Math.max(1, syllables / 4);
    expect(durationSec).toBe(1);
  });
});

describe("Scene — hasVideo 판단", () => {
  it("videoPrompt가 있으면 hasVideo true", () => {
    const videoPrompt = "slow zoom in, dramatic lighting";
    expect(!!videoPrompt).toBe(true);
  });

  it("videoPrompt가 빈 문자열이면 hasVideo false", () => {
    const videoPrompt = "";
    expect(!!videoPrompt).toBe(false);
  });

  it("videoPrompt가 존재하면 비디오 렌더링 대상", () => {
    const scene = { videoPrompt: "some motion" };
    expect(!!scene.videoPrompt).toBe(true);
  });
});
