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

/**
 * 이미지 상세 화면에서 "Create video" 클릭 → 새 탭 반환
 * Start Image가 자동 삽입된 영상 생성 탭을 반환
 */
export async function getVideoPageViaCreateButton(imagePage: Page): Promise<Page> {
  const b = await connectBrowser();

  const clicked = await imagePage.evaluate(() => {
    const els = [...document.querySelectorAll("button, a")];
    const btn = els.find(el => el.textContent?.trim().includes("Create video"));
    if (btn) {
      (btn as HTMLElement).click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    log("warn", "Create video 버튼 미발견 — 좌표 폴백 (1525, 855)");
    await imagePage.mouse.click(1525, 855);
  }

  const target = await b.waitForTarget(
    t => t.url().includes("video"),
    { timeout: 15000 },
  );
  const videoPage = await target.page();
  if (!videoPage) throw new Error("Create video 탭을 열 수 없음");

  await videoPage.waitForSelector("[contenteditable]", { timeout: 15000 });
  log("info", "Create video → 새 영상 탭 열림 (Start Image 자동 삽입)");
  return videoPage;
}

/**
 * 갤러리에서 특정 이미지의 상세 화면 열기
 * imageUrl의 pathname으로 매칭
 */
export async function openImageDetail(page: Page, imageUrl: string): Promise<void> {
  const targetPath = new URL(imageUrl).pathname;

  const clicked = await page.evaluate((path: string) => {
    const imgs = document.querySelectorAll("img");
    for (const img of imgs) {
      try {
        const imgPath = new URL(img.src).pathname;
        if (imgPath === path) {
          img.click();
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }, targetPath);

  if (!clicked) {
    log("warn", "갤러리에서 이미지 매칭 실패 — pikaso 이미지 중 최신 클릭 시도");
    await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")];
      const pikaso = imgs.find(img => img.src.includes("pikaso"));
      if (pikaso) pikaso.click();
    });
  }

  await new Promise(r => setTimeout(r, 1500));
  log("info", "이미지 상세 화면 열림");
}

/**
 * 영상 생성 페이지에서 Start Image를 갤러리 모달로 선택 (폴백 경로)
 * "Create video" 버튼 경유 실패 시에만 호출
 */
export async function startImageViaGallery(videoPage: Page, imageUrl: string): Promise<void> {
  // Start Image 영역 클릭 → 갤러리 모달 열림
  await videoPage.evaluate(() => {
    const els = [...document.querySelectorAll("button, div")];
    const startImg = els.find(el => el.textContent?.trim().includes("Start"));
    if (startImg) (startImg as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // History 탭 선택
  await videoPage.evaluate(() => {
    const tabs = [...document.querySelectorAll("button, a, span")];
    const historyTab = tabs.find(el => el.textContent?.trim() === "History");
    if (historyTab) (historyTab as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // imageUrl pathname 매칭 이미지 선택
  const targetPath = new URL(imageUrl).pathname;
  await videoPage.evaluate((path: string) => {
    const imgs = document.querySelectorAll("img");
    for (const img of imgs) {
      try {
        if (new URL(img.src).pathname === path) {
          img.click();
          return;
        }
      } catch {
        continue;
      }
    }
    const pikasoImgs = [...document.querySelectorAll("img")].filter(i => i.src.includes("pikaso"));
    if (pikasoImgs.length > 0) pikasoImgs[0].click();
  }, targetPath);
  await new Promise(r => setTimeout(r, 500));

  // 확인 버튼 클릭
  await videoPage.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const confirm = btns.find(b => {
      const text = b.textContent?.trim().toLowerCase() ?? "";
      return text === "add" || text === "confirm" || text === "done";
    });
    if (confirm) (confirm as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  log("info", "Start Image 갤러리 모달에서 선택 완료 (폴백)");
}
