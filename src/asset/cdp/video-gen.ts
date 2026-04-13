import type { Page } from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { loadFreepikConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";
import { downloadViaXhr } from "./download.js";

/**
 * WI-021: Freepik 영상 생성기
 * 이미지를 업로드하고 영상으로 변환
 */
export async function generateVideo(page: Page, imagePath: string, prompt: string): Promise<Buffer> {
  const config = loadFreepikConfig();

  await navigateToImageToVideo(page);
  await uploadImage(page, imagePath);
  await inputVideoPrompt(page, prompt);
  await clickGenerate(page);
  await waitForVideoResult(page, config.video.timeout);
  const videoUrl = await extractVideo(page);
  return downloadViaXhr(page, videoUrl);
}

export async function saveVideo(buffer: Buffer, outputPath: string): Promise<string> {
  const fullPath = resolve(outputPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, buffer);
  log("info", `영상 저장: ${fullPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  return fullPath;
}

async function navigateToImageToVideo(page: Page): Promise<void> {
  // Image to Video 모드 확인 — 이미 영상 탭이면 업로드 영역 존재
  const hasFileInput = await page.$("input[type=file]");
  if (hasFileInput) {
    log("info", "Image to Video 모드 확인됨");
    return;
  }
  log("warn", "file input 없음 — 페이지 새로고침 시도");
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector("input[type=file]", { timeout: 15000 });
}

async function uploadImage(page: Page, imagePath: string): Promise<void> {
  const input = await page.waitForSelector("input[type=file]", { timeout: 10000 });
  if (!input) throw new Error("파일 업로드 입력을 찾을 수 없음");
  await (input as unknown as { uploadFile: (path: string) => Promise<void> }).uploadFile(resolve(imagePath));
  log("info", `이미지 업로드: ${imagePath}`);
  await new Promise(r => setTimeout(r, 3000));
}

async function inputVideoPrompt(page: Page, prompt: string): Promise<void> {
  const editor = await page.waitForSelector("[contenteditable]", { timeout: 10000 });
  if (!editor) throw new Error("프롬프트 입력창을 찾을 수 없음");

  await editor.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await new Promise(r => setTimeout(r, 300));
  await page.keyboard.type(prompt, { delay: 10 });
  log("info", `영상 프롬프트 입력 완료`);
}

async function clickGenerate(page: Page): Promise<void> {
  const btn = await page.waitForSelector('[data-cy="generate-button"]', { timeout: 10000 });
  if (!btn) throw new Error("Generate 버튼을 찾을 수 없음");

  const isDisabled = await page.evaluate(
    el => (el as HTMLButtonElement).disabled,
    btn
  );
  if (isDisabled) {
    log("warn", "서버 사용 중 — 대기");
    await page.waitForFunction(
      (sel: string) => !(document.querySelector(sel) as HTMLButtonElement)?.disabled,
      { timeout: 120000 },
      '[data-cy="generate-button"]'
    );
  }

  await btn.click();
  log("info", "영상 Generate 클릭");
}

async function waitForVideoResult(page: Page, timeout: number): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isGenerating = await page.evaluate(() =>
      document.body.innerText.includes("Generating")
    );

    if (!isGenerating && Date.now() - startTime > 10000) {
      log("info", `영상 생성 완료 (${((Date.now() - startTime) / 1000).toFixed(1)}초)`);
      return;
    }

    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error(`영상 생성 타임아웃 (${timeout / 1000}초)`);
}

async function extractVideo(page: Page): Promise<string> {
  await new Promise(r => setTimeout(r, 3000));

  const url = await page.evaluate(() => {
    const videos = document.querySelectorAll("video");
    for (const v of videos) {
      const src = v.src || v.currentSrc;
      if (src && src.startsWith("http")) return src;
    }
    return "";
  });

  if (!url) throw new Error("생성된 영상을 찾을 수 없음");
  return url;
}

