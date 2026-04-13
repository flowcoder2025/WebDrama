/**
 * CDP E2E — Reference 기반 캐릭터/배경 일관성 테스트
 * 실행: npx tsx tests/e2e-reference-consistency.ts
 *
 * 흐름:
 * 1. 캐릭터 단독 이미지 2개 생성 → Reference 등록
 * 2. 배경 단독 이미지 2개 생성 → Reference 등록
 * 3. 결합 장면 3개 생성 (@멘션으로 캐릭터+배경 참조)
 * 4. 결과 비교
 *
 * ※ 브라우저 탭 닫기 절대 안 함. disconnect 안 함.
 */
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { connectBrowser, getFreepikImagePage } from "../src/asset/cdp/browser.js";
import { generateImage, saveImage, ensureResolution, ensureAiPromptOff } from "../src/asset/cdp/image-gen.js";
import { registerAsReference, insertReferenceMention } from "../src/asset/cdp/reference-manager.js";
import { loadFreepikConfig } from "../src/common/config.js";
import type { Page } from "puppeteer";

const PROJECT_DIR = resolve("projects/highschool-romance-test");
const OUTPUT_DIR = resolve(PROJECT_DIR, "reference-test-output");
const PROMPTS_FILE = resolve(PROJECT_DIR, "reference-test-prompts.json");

interface RefPrompt { id: string; characterId?: string; type: string; prompt: string }
interface ScenePrompt { id: string; description: string; characterRefs: string[]; backgroundRefs: string[]; prompt: string }
interface TestPrompts {
  characterPrompts: RefPrompt[];
  backgroundPrompts: RefPrompt[];
  scenePrompts: ScenePrompt[];
}

function log(step: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${step}] ${msg}`);
}

async function screenshot(page: Page, name: string) {
  const dir = resolve(OUTPUT_DIR, "screenshots");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  log("SCREENSHOT", path);
}

// Reference ID → 등록된 이름 매핑
const registeredRefs = new Map<string, string>();

async function generateAndRegisterRef(page: Page, ref: RefPrompt, index: number): Promise<void> {
  log(`REF ${index + 1}`, `생성 시작: ${ref.id} (${ref.type})`);

  const { buffer, imageUrl } = await generateImage(page, ref.prompt);
  await saveImage(buffer, resolve(OUTPUT_DIR, `${ref.id}.png`));
  log(`REF ${index + 1}`, `이미지 저장 (${(buffer.length / 1024).toFixed(0)}KB)`);
  await screenshot(page, `ref-${String(index + 1).padStart(2, "0")}-${ref.id}`);

  // Reference 등록
  const refName = await registerAsReference(page);
  registeredRefs.set(ref.id, refName);
  log(`REF ${index + 1}`, `Reference 등록: "${refName}"`);
  await screenshot(page, `ref-${String(index + 1).padStart(2, "0")}-registered`);
}

async function generateScene(page: Page, scene: ScenePrompt, index: number): Promise<void> {
  log(`SCENE ${index + 1}`, `생성 시작: ${scene.id} — ${scene.description}`);

  // 프롬프트 입력: 멘션들 + 본문
  const editor = await page.waitForSelector("[contenteditable]", { timeout: 10000 });
  if (!editor) throw new Error("프롬프트 입력창을 찾을 수 없음");
  await editor.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await new Promise(r => setTimeout(r, 300));

  // @멘션 삽입 (캐릭터 + 배경)
  const allRefs = [...scene.characterRefs, ...scene.backgroundRefs];
  for (const refId of allRefs) {
    const refName = registeredRefs.get(refId);
    if (refName) {
      await insertReferenceMention(page, refName);
      log(`SCENE ${index + 1}`, `@${refName} 멘션 삽입`);
    } else {
      log(`SCENE ${index + 1}`, `WARNING: ${refId} Reference 미등록 — 스킵`);
    }
  }

  // 프롬프트 본문 타이핑
  await page.keyboard.type(scene.prompt, { delay: 10 });
  await screenshot(page, `scene-${String(index + 1).padStart(2, "0")}-prompt`);

  // 생성 (프롬프트 이미 입력됨 → skipPromptInput)
  const { buffer } = await generateImage(page, scene.prompt, { skipPromptInput: true });
  await saveImage(buffer, resolve(OUTPUT_DIR, `${scene.id}.png`));
  log(`SCENE ${index + 1}`, `이미지 저장 (${(buffer.length / 1024).toFixed(0)}KB)`);
  await screenshot(page, `scene-${String(index + 1).padStart(2, "0")}-result`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const prompts: TestPrompts = JSON.parse(readFileSync(PROMPTS_FILE, "utf-8"));
  const config = loadFreepikConfig();

  log("INIT", "CDP 연결");
  await connectBrowser();
  const page = await getFreepikImagePage();

  log("INIT", "해상도 2K + AI prompt OFF");
  await ensureResolution(page, config.image.resolution);
  await ensureAiPromptOff(page);
  await screenshot(page, "00-init");

  // ── Phase 1: 캐릭터 Reference 생성 + 등록 ──
  log("PHASE 1", `캐릭터 Reference ${prompts.characterPrompts.length}개 생성`);
  for (let i = 0; i < prompts.characterPrompts.length; i++) {
    await generateAndRegisterRef(page, prompts.characterPrompts[i], i);
  }

  // ── Phase 2: 배경 Reference 생성 + 등록 ──
  log("PHASE 2", `배경 Reference ${prompts.backgroundPrompts.length}개 생성`);
  for (let i = 0; i < prompts.backgroundPrompts.length; i++) {
    await generateAndRegisterRef(page, prompts.backgroundPrompts[i], i + prompts.characterPrompts.length);
  }

  log("REFS", `등록된 Reference 목록:`);
  for (const [id, name] of registeredRefs) {
    log("REFS", `  ${id} → "${name}"`);
  }

  // ── Phase 3: 결합 장면 생성 ──
  log("PHASE 3", `결합 장면 ${prompts.scenePrompts.length}개 생성`);
  for (let i = 0; i < prompts.scenePrompts.length; i++) {
    await generateScene(page, prompts.scenePrompts[i], i);
  }

  // ── 결과 ──
  log("RESULT", "=== Reference 일관성 테스트 완료 ===");
  log("RESULT", `출력 디렉토리: ${OUTPUT_DIR}`);
  log("RESULT", `Reference 이미지: ${prompts.characterPrompts.length + prompts.backgroundPrompts.length}개`);
  log("RESULT", `결합 장면: ${prompts.scenePrompts.length}개`);
  log("RESULT", "※ 브라우저 탭/연결 유지됨 — 수동 확인 가능");
}

main().catch(err => {
  console.error("E2E 실패:", err);
  process.exit(1);
});
