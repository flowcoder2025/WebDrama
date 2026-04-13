/**
 * CDP E2E 흐름 검증 스크립트
 * 실행: npx tsx tests/e2e-cdp-flow.ts
 *
 * 흐름: 이미지 생성 → Reference 등록 → @멘션 후속 이미지 → Create video → 영상 생성
 */
import { connectBrowser, getFreepikImagePage, getVideoPageViaCreateButton, openImageDetail, disconnectBrowser } from "../src/asset/cdp/browser.js";
import { generateImage, saveImage, ensureResolution, ensureAiPromptOff } from "../src/asset/cdp/image-gen.js";
import { generateVideo, saveVideo } from "../src/asset/cdp/video-gen.js";
import { registerAsReference } from "../src/asset/cdp/reference-manager.js";
import { insertReferenceMention } from "../src/asset/cdp/reference-manager.js";
import { adaptMotionPrompt } from "../src/asset/cdp/character-seed.js";
import { loadFreepikConfig } from "../src/common/config.js";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUTPUT_DIR = resolve("projects/e2e-test/output");

function log(step: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${step}] ${msg}`);
}

async function screenshot(page: import("puppeteer").Page, name: string) {
  const dir = resolve(OUTPUT_DIR, "screenshots");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  log("SCREENSHOT", path);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const config = loadFreepikConfig();

  // ── Step 1: CDP 연결 + 이미지 페이지 ──
  log("STEP 1", "CDP 연결 + Freepik 이미지 페이지 열기");
  await connectBrowser();
  const imagePage = await getFreepikImagePage();
  await screenshot(imagePage, "01-image-page");

  // ── Step 2: 해상도 2K + AI prompt OFF ──
  log("STEP 2", "해상도 2K 설정 + AI prompt OFF");
  await ensureResolution(imagePage, config.image.resolution);
  await ensureAiPromptOff(imagePage);
  await screenshot(imagePage, "02-settings-done");

  // ── Step 3: 첫 이미지 생성 (Reference 없이) ──
  log("STEP 3", "첫 이미지 생성 (캐릭터 기준 이미지)");
  const prompt1 = "young Korean high school girl, brown hair, school uniform, standing in front of school building, anime style, 16:9";
  const { buffer: img1, imageUrl: url1 } = await generateImage(imagePage, prompt1);
  const img1Path = resolve(OUTPUT_DIR, "scene_01.png");
  await saveImage(img1, img1Path);
  log("STEP 3", `이미지 1 저장 완료: ${img1Path} (${(img1.length / 1024).toFixed(0)}KB)`);
  log("STEP 3", `Freepik URL: ${url1.substring(0, 80)}...`);
  await screenshot(imagePage, "03-image1-generated");

  // ── Step 4: Reference 등록 ──
  log("STEP 4", "첫 이미지를 Reference로 등록");
  const refName = await registerAsReference(imagePage);
  log("STEP 4", `Reference 등록 완료: "${refName}"`);
  await screenshot(imagePage, "04-reference-registered");

  // ── Step 5: @멘션 후속 이미지 생성 ──
  log("STEP 5", "@멘션으로 후속 이미지 생성 (캐릭터 일관성)");
  const prompt2 = "sitting in a classroom, looking at the window, soft lighting, anime style, 16:9";

  // 프롬프트 입력: 멘션 + 본문
  const editor = await imagePage.waitForSelector("[contenteditable]", { timeout: 10000 });
  await editor!.click();
  await imagePage.keyboard.down("Control");
  await imagePage.keyboard.press("a");
  await imagePage.keyboard.up("Control");
  await imagePage.keyboard.press("Backspace");
  await new Promise(r => setTimeout(r, 300));

  await insertReferenceMention(imagePage, refName);
  await imagePage.keyboard.type(prompt2, { delay: 10 });
  await screenshot(imagePage, "05-prompt-with-mention");

  const { buffer: img2, imageUrl: url2 } = await generateImage(imagePage, prompt2, { skipPromptInput: true });
  const img2Path = resolve(OUTPUT_DIR, "scene_02.png");
  await saveImage(img2, img2Path);
  log("STEP 5", `이미지 2 저장 완료: ${img2Path} (${(img2.length / 1024).toFixed(0)}KB)`);
  await screenshot(imagePage, "06-image2-generated");

  // ── Step 6: 이미지 상세 → Create video ──
  log("STEP 6", "이미지 1 상세 → Create video");
  await openImageDetail(imagePage, url1);
  await screenshot(imagePage, "07-image-detail");

  let videoPage: import("puppeteer").Page;
  try {
    videoPage = await getVideoPageViaCreateButton(imagePage);
    log("STEP 6", "Create video → 새 탭 열림");
  } catch (err) {
    log("STEP 6", `Create video 실패: ${err} — 스킵`);
    await screenshot(imagePage, "07-create-video-failed");
    log("RESULT", "E2E 흐름: Step 6에서 중단 (Create video 실패)");
    disconnectBrowser();
    return;
  }
  await screenshot(videoPage, "08-video-page");

  // ── Step 7: 영상 생성 ──
  log("STEP 7", "영상 생성");
  const motionPrompt = adaptMotionPrompt("slow zoom in, gentle wind blowing hair");
  log("STEP 7", `모션 프롬프트: ${motionPrompt}`);

  try {
    const videoBuffer = await generateVideo(videoPage, motionPrompt);
    const videoPath = resolve(OUTPUT_DIR, "scene_01.mp4");
    await saveVideo(videoBuffer, videoPath);
    log("STEP 7", `영상 저장 완료: ${videoPath} (${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB)`);
    await screenshot(videoPage, "09-video-generated");
  } catch (err) {
    log("STEP 7", `영상 생성 실패: ${err}`);
    await screenshot(videoPage, "09-video-failed");
  }

  await videoPage.close();
  log("STEP 7", "영상 탭 닫기");

  // ── 결과 ──
  log("RESULT", "=== E2E 흐름 완료 ===");
  log("RESULT", `이미지 1: ${img1Path}`);
  log("RESULT", `이미지 2: ${img2Path}`);
  log("RESULT", `출력 디렉토리: ${OUTPUT_DIR}`);

  disconnectBrowser();
}

main().catch(err => {
  console.error("E2E 실패:", err);
  disconnectBrowser();
  process.exit(1);
});
