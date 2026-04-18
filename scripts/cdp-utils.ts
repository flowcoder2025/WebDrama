/**
 * CDP 유틸리티 — 자주 쓰이는 기계적 작업
 * 사용: npx tsx scripts/cdp-utils.ts [command] [args]
 *
 * 명령어:
 *   status          — Reference 상태 + 갤러리 최근 3개
 *   clear           — Reference 전부 삭제
 *   register [prodId] — production ID로 Reference 등록
 *   screenshot [name] — 스크린샷 저장
 *   download [name]  — 갤러리 최신 이미지 다운로드
 *   generate         — Generate 버튼 클릭 + 대기 + 다운로드
 */
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "C:/Team-jane/WebDrama/projects/나는괜찮아요_EP1";
const cmd = process.argv[2];
const arg = process.argv[3];

async function getPage() {
  const browser = await puppeteer.connect({ browserURL: "http://localhost:9222", defaultViewport: null });
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes("ai-image-generator"));
  if (!page) throw new Error("이미지 탭 없음");
  return { browser, page };
}

async function getRefState(page: puppeteer.Page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(el => el.textContent?.trim() === "References" && el.children.length === 0);
    const container = refLabel?.closest('[class*="group/references"]');
    const cards = [...(container?.querySelector('[class*="grid"]')?.children || [])].map(c =>
      c.querySelector("span.truncate")?.textContent?.trim() || c.textContent?.trim()
    );
    return { ref: container?.querySelector("p")?.textContent?.trim(), cards };
  });
}

async function removeAllRefs(page: puppeteer.Page) {
  let max = 14;
  while (max-- > 0) {
    const ref = await page.evaluate(() => {
      const allEls = [...document.querySelectorAll("*")];
      const refLabel = allEls.find(el => el.textContent?.trim() === "References" && el.children.length === 0);
      const container = refLabel?.closest('[class*="group/references"]');
      const grid = container?.querySelector('[class*="grid"]');
      if (!grid) return null;
      const r = [...grid.children].reverse().find(c => c.textContent?.trim().startsWith("@img"));
      if (!r) return null;
      const btns = [...r.querySelectorAll("button")].filter(b => b.offsetWidth <= 24 && b.offsetWidth > 0);
      let rm: Element | null = null, mx = -Infinity;
      for (const b of btns) { const rc = b.getBoundingClientRect(); if (rc.x > mx) { mx = rc.x; rm = b; } }
      if (!rm) return null;
      const cr = r.getBoundingClientRect(); const dr = rm.getBoundingClientRect();
      return { cx: Math.round(cr.x + cr.width / 2), cy: Math.round(cr.y + cr.height / 2), dx: Math.round(dr.x + dr.width / 2), dy: Math.round(dr.y + dr.height / 2) };
    });
    if (!ref) break;
    await page.mouse.move(ref.cx, ref.cy); await new Promise(r => setTimeout(r, 400));
    await page.mouse.click(ref.dx, ref.dy); await new Promise(r => setTimeout(r, 600));
  }
}

async function registerByProdId(page: puppeteer.Page, prodId: string) {
  const addPos = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(el => el.textContent?.trim() === "References" && el.children.length === 0);
    const container = refLabel?.closest('[class*="group/references"]');
    const grid = container?.querySelector('[class*="grid"]');
    if (!grid) return null;
    const addCard = [...grid.children].find(c => c.textContent?.trim() === "Add") as HTMLElement | undefined;
    if (!addCard) return null;
    const rect = addCard.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });
  if (!addPos) throw new Error("Add 카드 없음");
  await page.mouse.click(addPos.x, addPos.y);
  await page.waitForFunction(() => [...document.querySelectorAll("h3")].some(el => el.textContent?.trim() === "History"), { timeout: 10000 });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => { [...document.querySelectorAll("button")].find(b => b.textContent?.trim() === "History")?.click(); });
  await new Promise(r => setTimeout(r, 1000));
  const imgPos = await page.evaluate((pid: string) => {
    const btns = [...document.querySelectorAll("button")];
    const btn = btns.find(b => b.classList.contains("aspect-square") && b.querySelector(`img[src*="production/${pid}/"]`));
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  }, prodId);
  if (!imgPos) throw new Error(`이미지 못 찾음 (prod=${prodId})`);
  await page.mouse.click(imgPos.x, imgPos.y);
  await new Promise(r => setTimeout(r, 500));
  const addBtnPos = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent?.trim() === "Add" && b.offsetWidth > 40);
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });
  if (!addBtnPos) throw new Error("Add 버튼 없음");
  await page.mouse.click(addBtnPos.x, addBtnPos.y);
  await new Promise(r => setTimeout(r, 2500));
}

async function downloadLatest(page: puppeteer.Page, name: string) {
  await new Promise(r => setTimeout(r, 3000));
  const url = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const g = imgs.filter(img => img.src.includes("pikaso") && img.src.includes("preview=1") && img.offsetWidth > 100);
    return g.length > 0 ? g[0].src.replace(/&preview=1/, "") : null;
  });
  if (!url) throw new Error("갤러리 이미지 없음");
  const b64 = await page.evaluate(async (u: string) => {
    return new Promise<string>((res, rej) => {
      const x = new XMLHttpRequest(); x.open("GET", u, true); x.responseType = "arraybuffer";
      x.onload = () => { const a = new Uint8Array(x.response as ArrayBuffer); let b = ""; for (let i = 0; i < a.length; i += 8192) { const c = a.subarray(i, Math.min(i + 8192, a.length)); b += String.fromCharCode(...c); } res(btoa(b)); };
      x.onerror = () => rej(new Error("XHR")); x.send();
    });
  }, url);
  const buf = Buffer.from(b64, "base64");
  const path = `${OUT}/locations/${name}.png`;
  mkdirSync(`${OUT}/locations`, { recursive: true });
  writeFileSync(path, buf);
  const prodId = url.match(/production\/(\d+)\//)?.[1] ?? "?";
  console.log(`저장: ${path} (${(buf.length / 1024).toFixed(0)}KB) prod=${prodId}`);
  return prodId;
}

async function generateAndWait(page: puppeteer.Page) {
  const selector = 'img[src*="pikaso"]';
  const existing = await page.$$eval(selector, imgs => imgs.map(img => (img as HTMLImageElement).src));
  const existingSet = new Set(existing);
  const btn = await page.waitForSelector('[data-cy="generate-button"]', { timeout: 5000 });
  if (!btn) throw new Error("Generate 버튼 없음");
  await btn.click();
  console.log("Generate 클릭");
  const start = Date.now();
  while (Date.now() - start < 300000) {
    const isGen = await page.evaluate(() => document.body.innerText.includes("Generating"));
    const cur = await page.$$eval(selector, imgs => imgs.map(img => (img as HTMLImageElement).src));
    const newU = cur.filter(u => !existingSet.has(u));
    if (!isGen && newU.length > 0) {
      console.log(`생성 완료 (${((Date.now() - start) / 1000).toFixed(0)}초)`);
      return;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error("타임아웃");
}

async function main() {
  const { browser, page } = await getPage();

  try {
    switch (cmd) {
      case "status": {
        const state = await getRefState(page);
        const latest = await page.evaluate(() => {
          const imgs = [...document.querySelectorAll("img")];
          return imgs.filter(img => img.src.includes("pikaso") && img.src.includes("preview=1") && img.offsetWidth > 100)
            .slice(0, 3).map(img => img.src.match(/production\/(\d+)\//)?.[1] ?? "?");
        });
        console.log("References:", state.ref, state.cards);
        console.log("갤러리 최근:", latest);
        break;
      }
      case "clear":
        await removeAllRefs(page);
        console.log("Reference 전부 삭제");
        break;
      case "register":
        if (!arg) throw new Error("production ID 필요: register [prodId]");
        await registerByProdId(page, arg);
        const state = await getRefState(page);
        console.log("등록 완료:", state.ref, state.cards);
        break;
      case "screenshot": {
        const name = arg || "screenshot";
        const path = `${OUT}/locations/${name}.png`;
        mkdirSync(`${OUT}/locations`, { recursive: true });
        await page.screenshot({ path });
        console.log("캡처:", path);
        break;
      }
      case "download": {
        const name = arg || "download";
        await downloadLatest(page, name);
        break;
      }
      case "generate": {
        await generateAndWait(page);
        if (arg) await downloadLatest(page, arg);
        break;
      }
      default:
        console.log("사용법: npx tsx scripts/cdp-utils.ts [status|clear|register|screenshot|download|generate] [arg]");
    }
  } finally {
    browser.disconnect();
  }
}

main().catch(err => { console.error("에러:", err.message); process.exit(1); });
