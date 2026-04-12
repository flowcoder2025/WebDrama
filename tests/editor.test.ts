import { describe, it, expect } from "vitest";
import { validateRenderOptions } from "../src/editor/renderer.js";

describe("렌더러", () => {
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
      specPath: "",
      assetsDir: "assets",
      outputPath: "out.mp4",
      format: "shorts",
    });
    expect(errors).toContain("specPath가 비어있음");
  });

  it("빈 assetsDir 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json",
      assetsDir: "",
      outputPath: "out.mp4",
      format: "longform",
    });
    expect(errors).toContain("assetsDir가 비어있음");
  });

  it("빈 outputPath 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json",
      assetsDir: "assets",
      outputPath: "",
      format: "shorts",
    });
    expect(errors).toContain("outputPath가 비어있음");
  });

  it("잘못된 format 시 에러", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json",
      assetsDir: "assets",
      outputPath: "out.mp4",
      format: "invalid" as "shorts",
    });
    expect(errors.some(e => e.includes("잘못된 format"))).toBe(true);
  });

  it("롱폼 포맷 검증 통과", () => {
    const errors = validateRenderOptions({
      specPath: "spec.json",
      assetsDir: "assets",
      outputPath: "out.mp4",
      format: "longform",
    });
    expect(errors).toHaveLength(0);
  });
});
