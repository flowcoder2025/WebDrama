import { describe, it, expect } from "vitest";
import { scenarioPrompt, parseScenarioResponse, extractAllScenes, validateHooking } from "../src/story/scenario.js";
import { dialoguePrompt, narrationPrompt, parseDialogueResponse } from "../src/story/dialogue.js";
import { imagePromptForScene, videoPromptForScene, bgmPromptForScene, validateProductionSpec, assembleProductionSpec } from "../src/story/prompt-builder.js";
import type { ResearchReport, Character } from "../src/common/types.js";

const mockReport: ResearchReport = {
  successPatterns: {
    story: [{ genre: "romance", structure: "4막", avgDuration: 600, episodeCount: 3, source: "test" }],
    visual: [{ genre: "romance", style: "anime", colorPalette: ["#FFB6C1"], composition: "클로즈업", thumbnailStyle: "얼굴" }],
    hooking: [{ type: "opening", description: "질문형", examples: ["왜?"] }],
  },
  trendAnalysis: { keywords: [], benchmarks: [] },
  generatedAt: "2026-01-01",
};

const mockScene = { id: "scene_01", duration: 8, description: "교실 창가, 석양, 왜 그랬을까?" };
const mockChars: Character[] = [
  { id: "char_01", name: "수아", voiceProfile: "female_young_soft", voiceSample: null },
];

describe("시나리오 생성", () => {
  it("프롬프트에 리서치 패턴 반영", () => {
    const prompt = scenarioPrompt("고등학교 로맨스", mockReport, "shorts");
    expect(prompt).toContain("romance");
    expect(prompt).toContain("4막");
    expect(prompt).toContain("질문형");
    expect(prompt).toContain("60초 이내");
  });

  it("시나리오 응답 파싱", () => {
    const response = `\`\`\`json
{"metadata":{"title":"첫사랑","genre":"romance","format":"shorts","episodes":1,"targetDuration":60},"synopsis":"테스트","acts":[{"act":1,"description":"도입","scenes":[{"id":"scene_01","duration":10,"description":"왜 그랬을까?"}]}]}
\`\`\``;
    const result = parseScenarioResponse(response);
    expect(result).not.toBeNull();
    expect(result!.metadata.title).toBe("첫사랑");
    expect(extractAllScenes(result!)).toHaveLength(1);
  });

  it("후킹 검증 — 후킹 있을 때 경고 0", () => {
    const scenario = parseScenarioResponse(`{"metadata":{"title":"t","genre":"romance","format":"shorts","episodes":1,"targetDuration":55},"synopsis":"s","acts":[{"act":1,"description":"d","scenes":[{"id":"s1","duration":10,"description":"왜 그랬을까?"},{"id":"s2","duration":10,"description":"이후 장면"}]}]}`)!;
    expect(validateHooking(scenario)).toHaveLength(0);
  });

  it("후킹 검증 — 후킹 없으면 경고", () => {
    const scenario = parseScenarioResponse(`{"metadata":{"title":"t","genre":"romance","format":"shorts","episodes":1,"targetDuration":55},"synopsis":"s","acts":[{"act":1,"description":"d","scenes":[{"id":"s1","duration":10,"description":"평범한 아침"}]}]}`)!;
    expect(validateHooking(scenario).length).toBeGreaterThan(0);
  });

  it("잘못된 JSON → null 반환", () => {
    expect(parseScenarioResponse("이것은 JSON이 아님")).toBeNull();
  });
});

describe("대사/나레이션", () => {
  it("대사 프롬프트에 캐릭터 정보 포함", () => {
    const prompt = dialoguePrompt(mockScene, mockChars);
    expect(prompt).toContain("char_01");
    expect(prompt).toContain("수아");
  });

  it("나레이션 프롬프트에 장면 설명 포함", () => {
    const prompt = narrationPrompt(mockScene);
    expect(prompt).toContain(mockScene.description);
  });

  it("대사 응답 파싱 — 유효한 캐릭터만", () => {
    const response = `[{"characterId":"char_01","text":"안녕","emotion":"happy"},{"characterId":"invalid","text":"무시됨","emotion":"sad"}]`;
    const dialogues = parseDialogueResponse(response, ["char_01"]);
    expect(dialogues).toHaveLength(1);
    expect(dialogues[0].characterId).toBe("char_01");
  });

  it("대사 응답 — emotion 없으면 calm fallback", () => {
    const response = `[{"characterId":"char_01","text":"대사"}]`;
    const dialogues = parseDialogueResponse(response, ["char_01"]);
    expect(dialogues[0].emotion).toBe("calm");
  });
});

describe("프롬프트 빌더", () => {
  it("이미지 프롬프트 — 스타일 + 색상 포함", () => {
    const prompt = imagePromptForScene(mockScene, "anime", ["#FFB6C1"], 0);
    expect(prompt).toContain("anime");
    expect(prompt).toContain("#FFB6C1");
    expect(prompt).toContain("16:9");
  });

  it("이미지 프롬프트 — 3가지 변형", () => {
    const p0 = imagePromptForScene(mockScene, "anime", [], 0);
    const p1 = imagePromptForScene(mockScene, "anime", [], 1);
    const p2 = imagePromptForScene(mockScene, "anime", [], 2);
    expect(p0).not.toBe(p1);
    expect(p1).not.toBe(p2);
  });

  it("영상 프롬프트 — 모션 포함", () => {
    const prompt = videoPromptForScene(mockScene, 0);
    expect(prompt).toContain("5 seconds");
  });

  it("BGM 프롬프트 — 장르 포함", () => {
    const prompt = bgmPromptForScene(mockScene, "romance");
    expect(prompt).toContain("romance");
    expect(prompt).toContain("instrumental");
  });
});

describe("production-spec 조립", () => {
  it("ProductionSpec 조립 + 검증 통과", () => {
    const scenario = parseScenarioResponse(`{"metadata":{"title":"첫사랑","genre":"romance","format":"shorts","episodes":1,"targetDuration":60},"synopsis":"t","acts":[{"act":1,"description":"d","scenes":[{"id":"scene_01","duration":10,"description":"교실 왜?"}]}]}`)!;
    const dialogueMap = new Map([
      ["scene_01", { dialogues: [{ characterId: "char_01", text: "안녕", emotion: "happy" }], narration: null }],
    ]);
    const spec = assembleProductionSpec(scenario, mockChars, mockReport, dialogueMap, 3);

    expect(spec.scenes).toHaveLength(1);
    expect(spec.scenes[0].imagePrompt).toContain("anime");
    expect(spec.scenes[0].bgm.prompt).toContain("romance");
    expect(validateProductionSpec(spec)).toHaveLength(0);
  });

  it("빈 spec 검증 시 에러", () => {
    const errors = validateProductionSpec({
      metadata: { title: "", genre: "", format: "shorts", episodes: 0, targetDuration: 0 },
      characters: [],
      scenes: [],
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
