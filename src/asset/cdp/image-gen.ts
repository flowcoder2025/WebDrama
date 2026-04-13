import type { Page } from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { loadFreepikConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";
import { downloadViaXhr } from "./download.js";

/**
 * WI-019 + WI-043: Freepik 이미지 생성기
 * CDP로 Freepik에서 이미지를 생성하고 다운로드
 */
export async function generateImage(
  page: Page,
  prompt: string,
  options?: { skipPromptInput?: boolean },
): Promise<{ buffer: Buffer; imageUrl: string }> {
  const config = loadFreepikConfig();

  if (!options?.skipPromptInput) {
    await inputPrompt(page, prompt);
  }
  await clickGenerate(page, config.image.generateSelector);
  const imageUrl = await waitForNewImage(page, config.image.resultSelector, config.image.timeout);
  await new Promise(r => setTimeout(r, 3000));
  const buffer = await downloadViaXhr(page, imageUrl);
  return { buffer, imageUrl };
}

export async function saveImage(buffer: Buffer, outputPath: string): Promise<string> {
  const fullPath = resolve(outputPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, buffer);
  log("info", `이미지 저장: ${fullPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  return fullPath;
}

/**
 * 해상도 설정 — 드롭다운 방식
 * 현재 해상도 버튼 클릭 → 드롭다운 열림 → 대상 항목 클릭
 */
export async function ensureResolution(page: Page, target: string): Promise<void> {
  const current = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const resBtn = btns.find(b => /^[124]K$/.test(b.innerText?.trim() ?? ""));
    return resBtn?.innerText?.trim() ?? null;
  });

  if (current === target) {
    log("info", `해상도 이미 ${target} 설정됨`);
    return;
  }

  // 현재 해상도 버튼 클릭 → 드롭다운 열기
  const opened = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const resBtn = btns.find(b => /^[124]K$/.test(b.innerText?.trim() ?? ""));
    if (resBtn) {
      (resBtn as HTMLElement).click();
      return true;
    }
    return false;
  });

  if (!opened) {
    log("warn", `해상도 버튼을 찾을 수 없음 — 현재 설정 유지`);
    return;
  }

  await new Promise(r => setTimeout(r, 300));

  // 드롭다운에서 target으로 시작하는 항목 클릭 (BUTTON 또는 SPAN)
  const selected = await page.evaluate((t: string) => {
    const els = [...document.querySelectorAll("button, span")];
    const item = els.find(el => el.textContent?.trim().startsWith(t));
    if (item) {
      (item as HTMLElement).click();
      return true;
    }
    return false;
  }, target);

  if (selected) {
    await new Promise(r => setTimeout(r, 500));
    log("info", `해상도 ${target}로 변경`);
  } else {
    log("warn", `드롭다운에서 ${target} 항목을 찾을 수 없음`);
  }
}

/**
 * AI prompt 토글 OFF 보장
 * translate-x-4 등 (0이 아닌 translate-x) = ON 상태 → 클릭하여 OFF
 */
export async function ensureAiPromptOff(page: Page): Promise<void> {
  const isOn = await page.evaluate(() => {
    const labels = [...document.querySelectorAll("button, label, span")];
    const aiPromptEl = labels.find(el => el.textContent?.trim() === "AI prompt");
    if (!aiPromptEl) return null;

    const parent = aiPromptEl.closest("[class]")?.parentElement;
    if (!parent) return null;

    const toggleSpan = parent.querySelector("span[class*='bg-primary']");
    if (!toggleSpan) return null;

    return /translate-x-(?!0)/.test(toggleSpan.className);
  });

  if (isOn === null) {
    log("warn", "AI prompt 토글을 찾을 수 없음 — 무시");
    return;
  }

  if (isOn) {
    await page.evaluate(() => {
      const labels = [...document.querySelectorAll("button, label, span")];
      const aiPromptEl = labels.find(el => el.textContent?.trim() === "AI prompt");
      if (!aiPromptEl) return;
      const parent = aiPromptEl.closest("[class]")?.parentElement;
      if (!parent) return;
      const toggle = parent.querySelector("span[class*='bg-primary']");
      if (toggle) (toggle as HTMLElement).click();
    });
    await new Promise(r => setTimeout(r, 300));
    log("info", "AI prompt 토글 OFF 설정");
  } else {
    log("info", "AI prompt 이미 OFF 상태");
  }
}

/**
 * 프롬프트 입력 (Ctrl+A → Backspace → 타이핑)
 * Reference 멘션 사용 시에는 이 함수 대신 keyboard.type() 직접 사용
 * (이 함수는 Ctrl+A로 전체 삭제하므로 멘션 토큰을 지움)
 */
export async function inputPrompt(page: Page, prompt: string): Promise<void> {
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

/**
 * 이미지 생성 대기 — 새로 나타난 이미지 URL을 반환
 */
async function waitForNewImage(page: Page, selector: string, timeout: number): Promise<string> {
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
      // 새 이미지 URL에서 &preview=1 제거 → 원본 해상도
      const fullUrl = newUrls[0].replace(/&preview=1/, "");
      log("info", `새 이미지 URL 추출`);
      return fullUrl;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error(`이미지 생성 타임아웃 (${timeout / 1000}초)`);
}
