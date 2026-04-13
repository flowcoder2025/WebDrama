import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ProductionSpec, Character, ResearchReport } from "./common/types.js";
import { loadProjectConfig, loadFreepikConfig } from "./common/config.js";
import { log } from "./common/logger.js";
import { buildResearchFromResponses, saveResearchReport } from "./research/pipeline.js";
import {
  channelCollectorPrompt,
  storyPatternPrompt,
  visualPatternPrompt,
  hookingPatternPrompt,
  trendKeywordPrompt,
} from "./research/prompts.js";
import { scenarioPrompt, parseScenarioResponse, extractAllScenes, validateHooking } from "./story/scenario.js";
import { dialoguePrompt, narrationPrompt, parseDialogueResponse } from "./story/dialogue.js";
import { assembleProductionSpec, validateProductionSpec } from "./story/prompt-builder.js";
import { getFreepikImagePage, getFreepikVideoPage, getVideoPageViaCreateButton, openImageDetail, startImageViaGallery } from "./asset/cdp/browser.js";
import { generateImage, saveImage, ensureResolution, ensureAiPromptOff } from "./asset/cdp/image-gen.js";
import { generateVideo, saveVideo } from "./asset/cdp/video-gen.js";
import { loadRefStore, saveRefStore, updateCharacterReference, hasReference, getReferenceName } from "./asset/cdp/character-ref.js";
import { registerAsReference, insertReferenceMention } from "./asset/cdp/reference-manager.js";
import { adaptMotionPrompt } from "./asset/cdp/character-seed.js";
import "./asset/tts/engine.js";
import { generateSceneVoices } from "./asset/tts/narration.js";
import { generateBgm, saveBgm } from "./asset/bgm/ace-step.js";
import { renderDrama, validateRenderOptions } from "./editor/renderer.js";
import { formatReviewSummary, buildFeedbackMessage, buildEvalReport } from "./common/evaluator.js";

/**
 * 파이프라인 실행 옵션
 */
export interface PipelineOptions {
  userPrompt: string;
  projectName: string;
  format: "shorts" | "longform";
  characters: Character[];
  genre: string;
}

/**
 * 파이프라인 단계
 */
export type PipelinePhase =
  | "research"
  | "scenario"
  | "dialogue"
  | "assets-image"
  | "assets-video"
  | "assets-voice"
  | "assets-bgm"
  | "render"
  | "evaluate"
  | "complete";

export interface PipelineState {
  phase: PipelinePhase;
  projectDir: string;
  assetsDir: string;
  outputDir: string;
  researchReport: ResearchReport | null;
  scenarioResponse: string | null;
  productionSpec: ProductionSpec | null;
  outputPath: string | null;
  imageUrls: Record<string, string>;
  evalAttempt: number;
}

/**
 * 프로젝트 디렉토리 초기화
 */
export function initProjectDir(projectName: string): PipelineState {
  const config = loadProjectConfig();
  const projectDir = resolve(config.output.projectsDir, projectName);
  const assetsDir = resolve(projectDir, "assets");
  const outputDir = resolve(projectDir, "output");

  mkdirSync(resolve(assetsDir, "images"), { recursive: true });
  mkdirSync(resolve(assetsDir, "videos"), { recursive: true });
  mkdirSync(resolve(assetsDir, "voices"), { recursive: true });
  mkdirSync(resolve(assetsDir, "bgm"), { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  log("info", `프로젝트 디렉토리 초기화: ${projectDir}`);

  return {
    phase: "research",
    projectDir,
    assetsDir,
    outputDir,
    researchReport: null,
    scenarioResponse: null,
    productionSpec: null,
    outputPath: null,
    evalAttempt: 0,
    imageUrls: {},
  };
}

/**
 * Phase 1: 리서치
 * creative 팀이 LLM으로 리서치를 수행한 결과를 파이프라인에 주입
 */
export function executeResearch(
  state: PipelineState,
  responses: {
    channelResponse: string;
    storyResponse: string;
    visualResponse: string;
    hookingResponse: string;
    trendResponse: string;
  },
  genre: string,
): PipelineState {
  log("info", "[Phase 1] 리서치 실행");

  const report = buildResearchFromResponses({ genre, ...responses });
  saveResearchReport(report, state.projectDir);

  return { ...state, phase: "scenario", researchReport: report };
}

/**
 * 리서치 프롬프트 목록 생성 (creative 팀에게 전달)
 */
export function getResearchPrompts(genre: string, channelCount: number): Record<string, string> {
  return {
    channel: channelCollectorPrompt(genre, channelCount),
    story: storyPatternPrompt(genre),
    visual: visualPatternPrompt(genre),
    hooking: hookingPatternPrompt(),
    trend: trendKeywordPrompt(genre),
  };
}

/**
 * Phase 2: 시나리오 생성
 * creative 팀이 LLM으로 시나리오를 생성한 결과를 파이프라인에 주입
 */
export function executeScenario(
  state: PipelineState,
  options: PipelineOptions,
  scenarioResponse: string,
): PipelineState {
  log("info", "[Phase 2] 시나리오 생성");

  if (!state.researchReport) {
    throw new Error("리서치 결과가 없음 — Phase 1을 먼저 실행하세요", { cause: null });
  }

  const scenario = parseScenarioResponse(scenarioResponse);
  if (!scenario) {
    throw new Error("시나리오 파싱 실패 — LLM 응답을 확인하세요", { cause: null });
  }

  const hookWarnings = validateHooking(scenario);
  if (hookWarnings.length > 0) {
    log("warn", `후킹 검증 경고: ${hookWarnings.join(", ")}`);
  }

  return { ...state, phase: "dialogue", scenarioResponse };
}

/**
 * Phase 전이 검증 — 잘못된 순서로 호출 방지
 */
export function assertPhase(state: PipelineState, expected: PipelinePhase, functionName: string): void {
  if (state.phase !== expected) {
    throw new Error(
      `${functionName}: 현재 phase '${state.phase}'이지만 '${expected}'이어야 합니다`,
    );
  }
}

/**
 * 시나리오 프롬프트 생성 (creative 팀에게 전달)
 */
export function getScenarioPrompt(
  state: PipelineState,
  options: PipelineOptions,
): string {
  if (!state.researchReport) {
    throw new Error("리서치 결과가 없음", { cause: null });
  }
  return scenarioPrompt(options.userPrompt, state.researchReport, options.format);
}

/**
 * Phase 3: 대사/나레이션 + production-spec 조립
 * creative 팀의 대사 생성 결과를 파이프라인에 주입
 */
export function executeDialogueAndAssemble(
  state: PipelineState,
  options: PipelineOptions,
  scenarioResponse: string,
  dialogueResponses: Map<string, string>,
  narrationResponses: Map<string, string>,
): PipelineState {
  log("info", "[Phase 3] 대사/나레이션 + production-spec 조립");

  if (!state.researchReport) {
    throw new Error("리서치 결과가 없음", { cause: null });
  }

  const scenario = parseScenarioResponse(scenarioResponse);
  if (!scenario) {
    throw new Error("시나리오 파싱 실패", { cause: null });
  }

  const scenes = extractAllScenes(scenario);
  const charIds = options.characters.map(c => c.id);
  const dialogueMap = new Map<string, { dialogues: import("./common/types.js").Dialogue[]; narration: string | null }>();

  for (const scene of scenes) {
    const dialogueRaw = dialogueResponses.get(scene.id) ?? "";
    const narrationRaw = narrationResponses.get(scene.id) ?? null;
    const dialogues = parseDialogueResponse(dialogueRaw, charIds);

    dialogueMap.set(scene.id, {
      dialogues,
      narration: narrationRaw,
    });
  }

  const spec = assembleProductionSpec(
    scenario, options.characters, state.researchReport,
    dialogueMap, loadProjectConfig().pipeline.promptVariants,
  );

  const errors = validateProductionSpec(spec);
  if (errors.length > 0) {
    log("warn", `ProductionSpec 검증 경고: ${errors.join(", ")}`);
  }

  const specPath = resolve(state.projectDir, "production-spec.json");
  writeFileSync(specPath, JSON.stringify(spec, null, 2), "utf-8");
  log("info", `production-spec.json 저장: ${specPath}`);

  return { ...state, phase: "assets-image", productionSpec: spec };
}

/**
 * 대사/나레이션 프롬프트 생성 (creative 팀에게 전달)
 */
export function getDialoguePrompts(
  scenarioResponse: string,
  characters: Character[],
): { dialoguePrompts: Map<string, string>; narrationPrompts: Map<string, string> } {
  const scenario = parseScenarioResponse(scenarioResponse);
  if (!scenario) {
    throw new Error("시나리오 파싱 실패", { cause: null });
  }

  const scenes = extractAllScenes(scenario);
  const dPrompts = new Map<string, string>();
  const nPrompts = new Map<string, string>();

  for (const scene of scenes) {
    dPrompts.set(scene.id, dialoguePrompt(scene, characters));
    nPrompts.set(scene.id, narrationPrompt(scene));
  }

  return { dialoguePrompts: dPrompts, narrationPrompts: nPrompts };
}

/**
 * Phase 4a: 이미지 에셋 생성 (리드 실행)
 * References 시스템으로 캐릭터 일관성 유지
 */
export async function executeImageGeneration(state: PipelineState): Promise<PipelineState> {
  log("info", "[Phase 4a] 이미지 생성");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음", { cause: null });
  }

  const page = await getFreepikImagePage();
  let refStore = loadRefStore(state.projectDir);
  const imageUrls: Record<string, string> = {};

  await ensureResolution(page, loadFreepikConfig().image.resolution);
  await ensureAiPromptOff(page);

  for (const scene of state.productionSpec.scenes) {
    const characterIds = [...new Set(scene.dialogues.map(d => d.characterId))];
    const unregisteredChars = characterIds.filter(id => id && !hasReference(refStore, id));
    const registeredChars = characterIds.filter(id => id && hasReference(refStore, id));

    const editor = await page.waitForSelector("[contenteditable]", { timeout: 10000 });
    if (!editor) throw new Error("프롬프트 입력창을 찾을 수 없음");
    await editor.click();
    await page.keyboard.down("Control");
    await page.keyboard.press("a");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await new Promise(r => setTimeout(r, 300));

    for (const charId of registeredChars) {
      await insertReferenceMention(page, getReferenceName(refStore, charId));
    }
    await page.keyboard.type(scene.imagePrompt, { delay: 10 });

    const { buffer, imageUrl } = await generateImage(page, scene.imagePrompt, { skipPromptInput: true });
    await saveImage(buffer, resolve(state.assetsDir, "images", `${scene.id}.png`));
    imageUrls[scene.id] = imageUrl;

    for (const charId of unregisteredChars) {
      const refName = await registerAsReference(page, imageUrl);
      refStore = updateCharacterReference(refStore, charId, imageUrl, refName);
    }
  }

  saveRefStore(state.projectDir, refStore);
  return { ...state, phase: "assets-video", imageUrls };
}

/**
 * Phase 4b: 영상 에셋 생성 (리드 실행)
 * 이미지 상세에서 "Create video" 버튼으로 새 탭 열기
 */
export async function executeVideoGeneration(state: PipelineState): Promise<PipelineState> {
  log("info", "[Phase 4b] 영상 생성");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음", { cause: null });
  }

  const imagePage = await getFreepikImagePage();

  for (const scene of state.productionSpec.scenes) {
    if (!scene.videoPrompt) continue;

    const imageUrl = state.imageUrls[scene.id];
    if (!imageUrl) {
      log("warn", `이미지 URL 없음, 영상 생성 스킵: ${scene.id}`);
      continue;
    }

    await openImageDetail(imagePage, imageUrl);

    let videoPage: import("puppeteer").Page;
    try {
      videoPage = await getVideoPageViaCreateButton(imagePage);
    } catch {
      log("warn", "Create video 버튼 실패 — 폴백: 갤러리 모달 경유");
      videoPage = await getFreepikVideoPage();
      await startImageViaGallery(videoPage, imageUrl);
    }

    const motionPrompt = adaptMotionPrompt(scene.videoPrompt);
    const buffer = await generateVideo(videoPage, motionPrompt);
    await saveVideo(buffer, resolve(state.assetsDir, "videos", `${scene.id}.mp4`));

    await videoPage.close();
  }

  return { ...state, phase: "assets-voice" };
}

/**
 * Phase 5a: TTS 음성 생성 (리드 실행)
 */
export async function executeVoiceGeneration(state: PipelineState): Promise<PipelineState> {
  log("info", "[Phase 5a] 음성 생성");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음", { cause: null });
  }

  for (const scene of state.productionSpec.scenes) {
    await generateSceneVoices(scene, state.productionSpec.characters, state.assetsDir);
  }

  return { ...state, phase: "assets-bgm" };
}

/**
 * Phase 5b: BGM 생성 (리드 실행)
 */
export async function executeBgmGeneration(state: PipelineState): Promise<PipelineState> {
  log("info", "[Phase 5b] BGM 생성");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음", { cause: null });
  }

  for (const scene of state.productionSpec.scenes) {
    const buffer = await generateBgm(scene.bgm.prompt, scene.duration);
    await saveBgm(buffer, state.assetsDir, scene.id, scene.bgm.volume, scene.bgm.fadeIn, scene.bgm.fadeOut);
  }

  return { ...state, phase: "render" };
}

/**
 * Phase 6: Remotion 렌더링 (리드 실행)
 */
export async function executeRender(state: PipelineState, format: "shorts" | "longform"): Promise<PipelineState> {
  log("info", "[Phase 6] 렌더링");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음 — Phase 3까지 먼저 완료하세요");
  }

  const specPath = resolve(state.projectDir, "production-spec.json");
  const outputPath = resolve(state.outputDir, `final_${format}.mp4`);

  const renderOptions = {
    specPath,
    assetsDir: state.assetsDir,
    outputPath,
    format,
  };

  const errors = validateRenderOptions(renderOptions);
  if (errors.length > 0) {
    throw new Error(`렌더 옵션 오류: ${errors.join(", ")}`, { cause: null });
  }

  await renderDrama(renderOptions);
  return { ...state, phase: "evaluate", outputPath };
}

/**
 * Phase 7: Evaluator 검수
 * evaluator 에이전트가 채점한 결과를 파이프라인에 주입
 */
export function executeEvaluation(
  state: PipelineState,
  evalScores: import("./common/types.js").EvalScores,
  antiPatterns: string[],
  issues: string[],
  recommendation: string,
): { state: PipelineState; verdict: string; summary: string } {
  log("info", "[Phase 7] 검수");

  if (!state.productionSpec) {
    throw new Error("production-spec이 없음", { cause: null });
  }

  const attempt = state.evalAttempt + 1;
  const report = buildEvalReport(
    state.productionSpec.metadata.title,
    "",
    evalScores,
    antiPatterns,
    issues,
    recommendation,
    attempt,
  );

  const reportPath = resolve(state.projectDir, "eval-report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  const summary = formatReviewSummary(state.productionSpec, report, state.outputPath ?? "");

  if (report.verdict === "PASS") {
    log("info", `검수 통과 (${report.weightedTotal}/10, ${attempt}회차)`);
    return {
      state: { ...state, phase: "complete", evalAttempt: attempt },
      verdict: "PASS",
      summary,
    };
  }

  const feedback = buildFeedbackMessage(report, null);
  log("warn", `검수 ${report.verdict} (${report.weightedTotal}/10, ${attempt}회차)`);

  return {
    state: { ...state, phase: "research", evalAttempt: attempt },
    verdict: report.verdict,
    summary: `${summary}\n\n---\n${feedback}`,
  };
}

/**
 * 전체 파이프라인 상태 요약
 */
export function getPipelineStatus(state: PipelineState): string {
  return [
    `Phase: ${state.phase}`,
    `Project: ${state.projectDir}`,
    `Spec: ${state.productionSpec ? "생성됨" : "없음"}`,
    `Output: ${state.outputPath ?? "없음"}`,
    `Eval 시도: ${state.evalAttempt}회`,
  ].join("\n");
}

/**
 * 전체 파이프라인 실행 (에셋 생성 → 렌더링)
 * creative 팀이 Phase 1~3을 완료한 후, 리드가 이 함수를 호출
 */
export async function runAssetAndRender(
  state: PipelineState,
  format: "shorts" | "longform",
): Promise<PipelineState> {
  if (!state.productionSpec) {
    throw new Error("production-spec이 없음 — Phase 3까지 먼저 완료하세요");
  }

  log("info", "=== 에셋 생성 + 렌더링 시작 ===");

  let current = state;
  current = await executeImageGeneration(current);
  current = await executeVideoGeneration(current);
  current = await executeVoiceGeneration(current);
  current = await executeBgmGeneration(current);
  current = await executeRender(current, format);

  log("info", "=== 에셋 생성 + 렌더링 완료 ===");
  return current;
}
