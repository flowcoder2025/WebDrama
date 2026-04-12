import { describe, it, expect } from "vitest";
import {
  loadSeedStore,
  updateCharacterSeed,
  getCharacterPromptPrefix,
  injectCharacterConsistency,
  adaptMotionPrompt,
} from "../src/asset/cdp/character-seed.js";

describe("캐릭터 시드 관리", () => {
  it("빈 스토어 생성", () => {
    const store = loadSeedStore("./nonexistent-dir");
    expect(store.characters).toEqual({});
  });

  it("캐릭터 시드 업데이트", () => {
    let store = loadSeedStore("./nonexistent-dir");
    store = updateCharacterSeed(store, "char_01", "young girl, brown hair", "ugly, deformed", 42);
    expect(store.characters["char_01"].promptPrefix).toBe("young girl, brown hair");
    expect(store.characters["char_01"].lastUsedSeed).toBe(42);
  });

  it("프롬프트 프리픽스 조회 — 존재하는 캐릭터", () => {
    let store = loadSeedStore("./nonexistent-dir");
    store = updateCharacterSeed(store, "char_01", "brown hair girl", "", null);
    expect(getCharacterPromptPrefix(store, "char_01")).toBe("brown hair girl");
  });

  it("프롬프트 프리픽스 조회 — 없는 캐릭터", () => {
    const store = loadSeedStore("./nonexistent-dir");
    expect(getCharacterPromptPrefix(store, "unknown")).toBe("");
  });

  it("캐릭터 일관성 주입", () => {
    let store = loadSeedStore("./nonexistent-dir");
    store = updateCharacterSeed(store, "char_01", "young girl, brown hair", "", null);
    const result = injectCharacterConsistency("classroom scene", store, "char_01");
    expect(result).toBe("young girl, brown hair, classroom scene");
  });

  it("캐릭터 일관성 주입 — 프리픽스 없으면 원본 반환", () => {
    const store = loadSeedStore("./nonexistent-dir");
    expect(injectCharacterConsistency("scene", store, "unknown")).toBe("scene");
  });
});

describe("모션 프롬프트 어댑터", () => {
  it("기존 seconds 제거 + Kling 형식 추가", () => {
    const result = adaptMotionPrompt("slow zoom in, 5 seconds");
    expect(result).toContain("smooth motion");
    expect(result).toContain("5 seconds");
    expect(result).not.toContain("5 seconds, smooth");
  });

  it("seconds 없는 프롬프트 처리", () => {
    const result = adaptMotionPrompt("pan left, dramatic lighting");
    expect(result).toContain("pan left");
    expect(result).toContain("smooth motion");
  });
});
