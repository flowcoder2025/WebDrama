import { describe, it, expect, afterAll } from "vitest";
import { rmSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  initProjectDir,
  getResearchPrompts,
  executeResearch,
  getScenarioPrompt,
  executeScenario,
  getDialoguePrompts,
  executeDialogueAndAssemble,
  executeImageGeneration,
  executeVideoGeneration,
  executeVoiceGeneration,
  executeBgmGeneration,
  executeRender,
  executeEvaluation,
  assertPhase,
  getPipelineStatus,
} from "../src/pipeline.js";
import type { Character, EvalScores } from "../src/common/types.js";

const TEST_PROJECT = "_pipeline_test";
const TEST_DIR = resolve("projects", TEST_PROJECT);

afterAll(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

const mockChars: Character[] = [
  { id: "char_01", name: "수아", voiceProfile: "female_young_soft", voiceSample: null },
];

const mockResearchResponses = {
  channelResponse: `[{"channelName":"드라마채널","subscribers":50000,"avgViews":100000,"uploadFrequency":"주 2회","engagementRate":4.5,"topVideos":["v1"]}]`,
  storyResponse: `[{"genre":"romance","structure":"4막","avgDuration":600,"episodeCount":3,"source":"채널A"}]`,
  visualResponse: `[{"genre":"romance","style":"anime","colorPalette":["#FFB6C1"],"composition":"클로즈업","thumbnailStyle":"얼굴"}]`,
  hookingResponse: `[{"type":"opening","description":"질문형","examples":["왜?"]}]`,
  trendResponse: `[{"keyword":"로맨스","searchVolume":12000,"competition":"low","trending":true}]`,
};

const mockScenarioResponse = JSON.stringify({
  metadata: { title: "첫사랑", genre: "romance", format: "shorts", episodes: 1, targetDuration: 55 },
  synopsis: "고등학교 로맨스",
  acts: [{
    act: 1, description: "도입",
    scenes: [
      { id: "scene_01", duration: 15, description: "교실 창가, 왜 자꾸 눈이 가는 걸까?" },
      { id: "scene_02", duration: 15, description: "복도에서 우연히 마주침" },
    ],
  }],
});

describe("파이프라인 — 프로젝트 초기화", () => {
  it("디렉토리 구조 생성", () => {
    const state = initProjectDir(TEST_PROJECT);
    expect(state.phase).toBe("research");
    expect(existsSync(resolve(state.assetsDir, "images"))).toBe(true);
    expect(existsSync(resolve(state.assetsDir, "videos"))).toBe(true);
    expect(existsSync(resolve(state.assetsDir, "voices"))).toBe(true);
    expect(existsSync(resolve(state.assetsDir, "bgm"))).toBe(true);
    expect(existsSync(state.outputDir)).toBe(true);
  });

  it("상태 요약 출력", () => {
    const state = initProjectDir(TEST_PROJECT);
    const status = getPipelineStatus(state);
    expect(status).toContain("research");
    expect(status).toContain("없음");
  });
});

describe("파이프라인 — 리서치 프롬프트", () => {
  it("장르별 프롬프트 5개 생성", () => {
    const prompts = getResearchPrompts("romance", 10);
    expect(Object.keys(prompts)).toHaveLength(5);
    expect(prompts.channel).toContain("romance");
    expect(prompts.story).toContain("romance");
    expect(prompts.visual).toContain("romance");
    expect(prompts.hooking).toContain("opening");
    expect(prompts.trend).toContain("romance");
  });
});

describe("파이프라인 — Phase 1: 리서치", () => {
  it("리서치 실행 → research-report.json 생성", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");

    expect(state.phase).toBe("scenario");
    expect(state.researchReport).not.toBeNull();
    expect(existsSync(resolve(state.projectDir, "research-report.json"))).toBe(true);
  });
});

describe("파이프라인 — Phase 2: 시나리오", () => {
  it("시나리오 프롬프트 생성", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    const prompt = getScenarioPrompt(state, {
      userPrompt: "고등학교 로맨스", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    });
    expect(prompt).toContain("고등학교 로맨스");
    expect(prompt).toContain("4막");
  });

  it("시나리오 실행", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeScenario(state, {
      userPrompt: "고등학교 로맨스", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse);
    expect(state.phase).toBe("dialogue");
  });

  it("리서치 없이 시나리오 실행 시 에러", () => {
    const state = initProjectDir(TEST_PROJECT);
    expect(() => executeScenario(state, {
      userPrompt: "", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, "{}")).toThrow("리서치 결과가 없음");
  });
});

describe("파이프라인 — Phase 3: 대사 + 조립", () => {
  it("대사 프롬프트 생성", () => {
    const { dialoguePrompts, narrationPrompts } = getDialoguePrompts(mockScenarioResponse, mockChars);
    expect(dialoguePrompts.size).toBe(2);
    expect(narrationPrompts.size).toBe(2);
    expect(dialoguePrompts.get("scene_01")).toContain("char_01");
  });

  it("production-spec.json 조립 및 저장", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");

    const dialogueMap = new Map([
      ["scene_01", `[{"characterId":"char_01","text":"안녕","emotion":"happy"}]`],
      ["scene_02", `[{"characterId":"char_01","text":"또 만났네","emotion":"surprised"}]`],
    ]);
    const narrationMap = new Map([
      ["scene_01", "그날의 시작은 평범했다."],
    ]);

    state = executeDialogueAndAssemble(state, {
      userPrompt: "고등학교 로맨스", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, dialogueMap, narrationMap);

    expect(state.phase).toBe("assets-image");
    expect(state.productionSpec).not.toBeNull();
    expect(state.productionSpec!.scenes).toHaveLength(2);

    const specPath = resolve(state.projectDir, "production-spec.json");
    expect(existsSync(specPath)).toBe(true);
    const saved = JSON.parse(readFileSync(specPath, "utf-8"));
    expect(saved.metadata.title).toBe("첫사랑");
  });
});

describe("파이프라인 — Phase 7: 검수", () => {
  const makeScores = (s: number, v: number, vo: number, e: number): EvalScores => ({
    storyStructure: { score: s, weight: 0.30, evidence: "t" },
    visualConsistency: { score: v, weight: 0.25, evidence: "t" },
    voiceQuality: { score: vo, weight: 0.20, evidence: "t" },
    editingCompleteness: { score: e, weight: 0.25, evidence: "t" },
  });

  it("PASS 판정 → phase complete", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeDialogueAndAssemble(state, {
      userPrompt: "t", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, new Map(), new Map());

    const { state: newState, verdict } = executeEvaluation(
      state, makeScores(10, 10, 10, 10), [], [], "완벽",
    );
    expect(verdict).toBe("PASS");
    expect(newState.phase).toBe("complete");
  });

  it("REWORK 판정 → phase research로 복귀", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeDialogueAndAssemble(state, {
      userPrompt: "t", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, new Map(), new Map());

    const { state: newState, verdict, summary } = executeEvaluation(
      state, makeScores(7, 7, 7, 7), [], ["이슈"], "수정필요",
    );
    expect(verdict).toBe("REWORK");
    expect(newState.phase).toBe("research");
    expect(newState.evalAttempt).toBe(1);
    expect(summary).toContain("이슈");
  });

  it("REGENERATE 판정", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeDialogueAndAssemble(state, {
      userPrompt: "t", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, new Map(), new Map());

    const { verdict } = executeEvaluation(
      state, makeScores(3, 2, 4, 3), [], [], "전면 재생성",
    );
    expect(verdict).toBe("REGENERATE");
  });

  it("eval-report.json 저장", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeDialogueAndAssemble(state, {
      userPrompt: "t", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, new Map(), new Map());

    executeEvaluation(state, makeScores(10, 10, 10, 10), [], [], "");
    expect(existsSync(resolve(state.projectDir, "eval-report.json"))).toBe(true);
  });

  it("ESCALATE 판정 (10회 초과)", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeDialogueAndAssemble(state, {
      userPrompt: "t", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse, new Map(), new Map());

    state = { ...state, evalAttempt: 9 };
    const { verdict, summary } = executeEvaluation(
      state, makeScores(7, 7, 7, 7), [], [], "수정필요",
    );
    expect(verdict).toBe("ESCALATE");
    expect(summary).toContain("사용자 판단 필요");
  });
});

describe("파이프라인 — Phase 4~6 guard clause", () => {
  it("Phase 4a: productionSpec 없으면 에러", async () => {
    const state = initProjectDir(TEST_PROJECT);
    await expect(executeImageGeneration(state)).rejects.toThrow("production-spec이 없음");
  });

  it("Phase 4b: productionSpec 없으면 에러", async () => {
    const state = initProjectDir(TEST_PROJECT);
    await expect(executeVideoGeneration(state)).rejects.toThrow("production-spec이 없음");
  });

  it("Phase 5a: productionSpec 없으면 에러", async () => {
    const state = initProjectDir(TEST_PROJECT);
    await expect(executeVoiceGeneration(state)).rejects.toThrow("production-spec이 없음");
  });

  it("Phase 5b: productionSpec 없으면 에러", async () => {
    const state = initProjectDir(TEST_PROJECT);
    await expect(executeBgmGeneration(state)).rejects.toThrow("production-spec이 없음");
  });

  it("Phase 6: productionSpec 없으면 에러", async () => {
    const state = initProjectDir(TEST_PROJECT);
    await expect(executeRender(state, "shorts")).rejects.toThrow("production-spec이 없음");
  });
});

describe("파이프라인 — Phase 전이 검증", () => {
  it("assertPhase — 올바른 phase", () => {
    const state = initProjectDir(TEST_PROJECT);
    expect(() => assertPhase(state, "research", "test")).not.toThrow();
  });

  it("assertPhase — 잘못된 phase", () => {
    const state = initProjectDir(TEST_PROJECT);
    expect(() => assertPhase(state, "render", "test")).toThrow("현재 phase 'research'이지만 'render'이어야");
  });
});

describe("파이프라인 — scenarioResponse state 저장", () => {
  it("Phase 2 후 scenarioResponse가 state에 저장됨", () => {
    let state = initProjectDir(TEST_PROJECT);
    state = executeResearch(state, mockResearchResponses, "romance");
    state = executeScenario(state, {
      userPrompt: "고등학교 로맨스", projectName: TEST_PROJECT,
      format: "shorts", characters: mockChars, genre: "romance",
    }, mockScenarioResponse);
    expect(state.scenarioResponse).toBe(mockScenarioResponse);
  });
});
