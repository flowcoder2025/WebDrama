import type { Page } from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { loadFreepikConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";

/**
 * WI-019: Freepik 이미지 생성기
 * CDP로 Freepik에서 이미지를 생성하고 다운로드
 */
export async function generateImage(page: Page, prompt: string): Promise<Buffer> {
  const config = loadFreepikConfig();

  await inputPrompt(page, prompt);
  await clickGenerate(page, config.image.generateSelector);
  await waitForResult(page, config.image.resultSelector, config.image.timeout);
  const imageUrl = await extractLargestImage(page);
  return downloadViaXhr(page, imageUrl);
}

export async function saveImage(buffer: Buffer, outputPath: string): Promise<string> {
  const fullPath = resolve(outputPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, buffer);
  log("info", `이미지 저장: ${fullPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  return fullPath;
}

async function inputPrompt(page: Page, prompt: string): Promise<void> {
  const editor = await page.waitForSelector("[contenteditable]", { timeout: 10000 });
  if (!editor) throw new Error("프롬프트 입력창을 찾을 수 없음");

  await editor.click();
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");
  await new Promise(r => setTimeout(r, 300));
  await page.keyboard.type(prompt, { delay: 10 });
  log("info", `프롬프트 입력 완료 (${prompt.length}자)`);
}

async function clickGenerate(page: Page, selector: string): Promise<void> {
  const btn = await page.waitForSelector(selector, { timeout: 10000 });
  if (!btn) throw new Error("Generate 버튼을 찾을 수 없음");
  await btn.click();
  log("info", "Generate 클릭");
}

async function waitForResult(page: Page, selector: string, timeout: number): Promise<void> {
  const startTime = Date.now();

  const existingUrls = await page.$$eval(selector, imgs =>
    imgs.map(img => (img as HTMLImageElement).src)
  );
  const existingSet = new Set(existingUrls);

  while (Date.now() - startTime < timeout) {
    const isGenerating = await page.evaluate(() =>
      document.body.innerText.includes("Generating")
    );

    const currentUrls = await page.$$eval(selector, imgs =>
      imgs.map(img => (img as HTMLImageElement).src)
    );
    const newUrls = currentUrls.filter(u => !existingSet.has(u));

    if (!isGenerating && newUrls.length > 0) {
      log("info", `이미지 생성 완료 (${((Date.now() - startTime) / 1000).toFixed(1)}초)`);
      return;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error(`이미지 생성 타임아웃 (${timeout / 1000}초)`);
}

async function extractLargestImage(page: Page): Promise<string> {
  await new Promise(r => setTimeout(r, 3000));

  const url = await page.evaluate(() => {
    const imgs = document.querySelectorAll("img");
    let largest = { width: 0, src: "" };
    for (const img of imgs) {
      if (img.naturalWidth > largest.width && img.src.includes("pikaso")) {
        largest = { width: img.naturalWidth, src: img.src };
      }
    }
    return largest.src;
  });

  if (!url) throw new Error("생성된 이미지를 찾을 수 없음");
  return url;
}

/**
 * XHR ArrayBuffer 다운로드 (CORS 우회)
 */
async function downloadViaXhr(page: Page, url: string): Promise<Buffer> {
  const base64 = await page.evaluate(async (downloadUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", downloadUrl, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        const arr = new Uint8Array(xhr.response as ArrayBuffer);
        let binary = "";
        for (let i = 0; i < arr.length; i += 8192) {
          const chunk = arr.subarray(i, Math.min(i + 8192, arr.length));
          binary += String.fromCharCode(...chunk);
        }
        resolve(btoa(binary));
      };
      xhr.onerror = () => reject(new Error("XHR 다운로드 실패"));
      xhr.send();
    });
  }, url);

  return Buffer.from(base64, "base64");
}
