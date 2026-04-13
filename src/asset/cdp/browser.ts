import puppeteer, { type Browser, type Page } from "puppeteer";
import { loadProjectConfig } from "../../common/config.js";
import { log } from "../../common/logger.js";

let browser: Browser | null = null;

/**
 * WI-018: CDP 브라우저 매니저
 * Chrome CDP에 연결하고 세션을 관리
 */
export async function connectBrowser(): Promise<Browser> {
  if (browser && browser.connected) return browser;

  const config = loadProjectConfig();
  const cdpUrl = `http://localhost:${config.chrome.cdpPort}`;

  log("info", `Chrome CDP 연결 중: ${cdpUrl}`);

  browser = await puppeteer.connect({
    browserURL: cdpUrl,
    protocolTimeout: config.chrome.protocolTimeout,
    defaultViewport: null,
  });

  log("info", "Chrome CDP 연결 성공");
  return browser;
}

export async function getFreepikImagePage(): Promise<Page> {
  const b = await connectBrowser();
  const pages = await b.pages();

  const found = pages.find(p => p.url().includes("ai-image-generator"));
  if (found) {
    log("info", "기존 Freepik 이미지 탭 재사용");
    return found;
  }

  const newPage = await b.newPage();
  await newPage.goto("https://www.freepik.com/pikaso/ai-image-generator", { waitUntil: "networkidle2" });
  log("info", "새 Freepik 이미지 탭 생성");
  return newPage;
}

export async function getFreepikVideoPage(): Promise<Page> {
  const b = await connectBrowser();
  const pages = await b.pages();

  const found = pages.find(p => p.url().includes("ai-video-generator"));
  if (found) {
    log("info", "기존 Freepik 영상 탭 재사용");
    return found;
  }

  const newPage = await b.newPage();
  await newPage.goto("https://www.freepik.com/pikaso/ai-video-generator", { waitUntil: "networkidle2" });
  log("info", "새 Freepik 영상 탭 생성");
  return newPage;
}

export async function disconnectBrowser(): Promise<void> {
  if (browser) {
    browser.disconnect();
    browser = null;
    log("info", "Chrome CDP 연결 해제");
  }
}

/**
 * 브라우저 윈도우 크기 설정 (CDP 프로토콜 직접 사용)
 */
export async function setWindowBounds(page: Page, width: number, height: number): Promise<void> {
  const session = await page.createCDPSession();
  const { windowId } = await session.send("Browser.getWindowForTarget");
  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: { width, height },
  });
  await session.detach();
}
