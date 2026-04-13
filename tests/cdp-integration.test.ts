import { describe, it, expect } from "vitest";

/**
 * CDP 통합 테스트 — Chrome CDP 연결 필요
 * 실행: CDP_INTEGRATION=1 npm test
 * CI에서는 skip (Chrome 미설치)
 */
describe.skipIf(!process.env.CDP_INTEGRATION)("CDP 통합", () => {
  it("defaultViewport: null → viewport가 null", async () => {
    const { connectBrowser } = await import("../src/asset/cdp/browser.js");
    const browser = await connectBrowser();
    const [page] = await browser.pages();
    const viewport = page.viewport();
    expect(viewport).toBeNull();
  });

  it("ensureResolution 드롭다운 → 2K 선택", async () => {
    const { getFreepikImagePage } = await import("../src/asset/cdp/browser.js");
    const { ensureResolution } = await import("../src/asset/cdp/image-gen.js");
    const page = await getFreepikImagePage();
    await ensureResolution(page, "2K");
  });

  it("ensureAiPromptOff → OFF 확인", async () => {
    const { getFreepikImagePage } = await import("../src/asset/cdp/browser.js");
    const { ensureAiPromptOff } = await import("../src/asset/cdp/image-gen.js");
    const page = await getFreepikImagePage();
    await ensureAiPromptOff(page);
  });

  it("registerAsReference → Reference 영역에 항목 추가", async () => {
    const { registerAsReference } = await import("../src/asset/cdp/reference-manager.js");
    const { getFreepikImagePage } = await import("../src/asset/cdp/browser.js");
    const page = await getFreepikImagePage();
    const refName = await registerAsReference(page, "https://pikaso.cdnpk.net/test");
    expect(refName).toBeTruthy();
  });

  it("insertReferenceMention → 멘션 토큰 삽입", async () => {
    const { insertReferenceMention } = await import("../src/asset/cdp/reference-manager.js");
    const { getFreepikImagePage } = await import("../src/asset/cdp/browser.js");
    const page = await getFreepikImagePage();
    await insertReferenceMention(page, "Character");
  });

  it("getVideoPageViaCreateButton → 새 탭 + Start Image", async () => {
    const { getVideoPageViaCreateButton } = await import("../src/asset/cdp/browser.js");
    const { getFreepikImagePage } = await import("../src/asset/cdp/browser.js");
    const page = await getFreepikImagePage();
    const videoPage = await getVideoPageViaCreateButton(page);
    expect(videoPage).toBeTruthy();
    await videoPage.close();
  });

  it("ensureVideoResolution → 720p 확인 (generateVideo 호출 시 720p 강제)", async () => {
    const { getFreepikVideoPage } = await import("../src/asset/cdp/browser.js");
    const videoPage = await getFreepikVideoPage();
    const resText = await videoPage.evaluate(() => {
      const els = [...document.querySelectorAll("button, span")];
      const resEl = els.find(el => /\d+p/.test(el.textContent?.trim() ?? ""));
      return resEl?.textContent?.trim() ?? null;
    });
    expect(resText).toContain("720p");
    await videoPage.close();
  });
});
