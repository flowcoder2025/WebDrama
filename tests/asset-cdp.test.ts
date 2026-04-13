import { describe, it, expect } from "vitest";
import {
  loadRefStore,
  updateCharacterReference,
  getCharacterReferenceIds,
  hasReference,
  getReferenceName,
} from "../src/asset/cdp/character-ref.js";
import {
  loadSeedStore,
  adaptMotionPrompt,
} from "../src/asset/cdp/character-seed.js";

describe("캐릭터 Reference 관리", () => {
  it("빈 RefStore 생성", () => {
    const store = loadRefStore("./nonexistent-dir");
    expect(store.characters).toEqual({});
  });

  it("Reference 등록 + 조회", () => {
    let store = loadRefStore("./nonexistent-dir");
    store = updateCharacterReference(store, "char_01", "https://pikaso.cdnpk.net/render.png", "Character 1");
    expect(store.characters["char_01"].referenceImageUrl).toContain("pikaso");
    expect(store.characters["char_01"].referenceName).toBe("Character 1");
    expect(store.characters["char_01"].registeredAt).toBeTruthy();
  });

  it("hasReference — 등록된 캐릭터", () => {
    let store = loadRefStore("./nonexistent-dir");
    store = updateCharacterReference(store, "char_01", "url", "name");
    expect(hasReference(store, "char_01")).toBe(true);
  });

  it("hasReference — 미등록 캐릭터", () => {
    const store = loadRefStore("./nonexistent-dir");
    expect(hasReference(store, "char_01")).toBe(false);
  });

  it("getCharacterReferenceIds — 등록된 캐릭터", () => {
    let store = loadRefStore("./nonexistent-dir");
    store = updateCharacterReference(store, "char_01", "url", "name");
    expect(getCharacterReferenceIds(store, "char_01")).toEqual(["char_01"]);
  });

  it("getCharacterReferenceIds — 미등록 캐릭터", () => {
    const store = loadRefStore("./nonexistent-dir");
    expect(getCharacterReferenceIds(store, "unknown")).toEqual([]);
  });

  it("getReferenceName — 등록된 캐릭터", () => {
    let store = loadRefStore("./nonexistent-dir");
    store = updateCharacterReference(store, "char_01", "url", "My Character");
    expect(getReferenceName(store, "char_01")).toBe("My Character");
  });

  it("getReferenceName — 미등록 캐릭터", () => {
    const store = loadRefStore("./nonexistent-dir");
    expect(getReferenceName(store, "unknown")).toBe("");
  });

  it("다중 캐릭터 Reference 독립 관리", () => {
    let store = loadRefStore("./nonexistent-dir");
    store = updateCharacterReference(store, "char_01", "url1", "Character A");
    store = updateCharacterReference(store, "char_02", "url2", "Character B");
    expect(hasReference(store, "char_01")).toBe(true);
    expect(hasReference(store, "char_02")).toBe(true);
    expect(getReferenceName(store, "char_01")).toBe("Character A");
    expect(getReferenceName(store, "char_02")).toBe("Character B");
  });
});

describe("캐릭터 시드 관리 (deprecated 호환)", () => {
  it("빈 스토어 생성", () => {
    const store = loadSeedStore("./nonexistent-dir");
    expect(store.characters).toEqual({});
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
