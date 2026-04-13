import type { Page } from "puppeteer";
import { log } from "../../common/logger.js";

/**
 * 이미지를 Freepik Reference로 등록
 * History 탭에서 가장 최근 생성 이미지를 선택
 * 생성 직후 호출 보장 → 단일 CDP 세션이므로 History 첫 번째 = 방금 생성한 이미지
 */
export async function registerAsReference(page: Page, _imageUrl: string): Promise<string> {
  // 1. References 영역 "Add" 버튼 클릭
  const addClicked = await page.evaluate(() => {
    const els = [...document.querySelectorAll("button, div, span")];
    const addBtn = els.find(el => {
      const text = el.textContent?.trim() ?? "";
      return text === "Add" || text === "+";
    });
    if (addBtn) {
      (addBtn as HTMLElement).click();
      return true;
    }
    return false;
  });

  if (!addClicked) {
    log("warn", "References Add 버튼 미발견 — 좌표 폴백");
    await page.mouse.click(163, 330);
  }

  // 2. 모달 열림 대기
  await page.waitForSelector('[role="dialog"], [class*="modal"]', { timeout: 10000 })
    .catch(() => {
      log("warn", "Reference 모달 셀렉터 미감지 — 3초 대기 후 진행");
    });
  await new Promise(r => setTimeout(r, 1000));

  // 3. History 탭 클릭
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll("button, a, span")];
    const historyTab = tabs.find(el => el.textContent?.trim() === "History");
    if (historyTab) (historyTab as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 4. 최신 이미지 선택 (첫 번째 이미지)
  await page.evaluate(() => {
    const modalImgs = document.querySelectorAll('[role="dialog"] img, [class*="modal"] img');
    if (modalImgs.length > 0) {
      (modalImgs[0] as HTMLElement).click();
    } else {
      const allImgs = [...document.querySelectorAll("img")];
      const pikasoImg = allImgs.find(img => img.src.includes("pikaso"));
      if (pikasoImg) pikasoImg.click();
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // 5. Add 확인 버튼 클릭
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const addConfirm = btns.find(el => {
      const text = el.textContent?.trim().toLowerCase() ?? "";
      return text === "add" || text === "confirm" || text === "done";
    });
    if (addConfirm) (addConfirm as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // 6. 등록된 Reference 이름 추출
  const referenceName = await page.evaluate(() => {
    const refEls = document.querySelectorAll("[class*='reference'] img, [class*='Reference'] img");
    if (refEls.length > 0) {
      const parent = refEls[refEls.length - 1].closest("[class*='reference'], [class*='Reference']");
      return parent?.textContent?.trim() ?? "Character";
    }
    return "Character";
  });

  log("info", `Reference 등록 완료: ${referenceName}`);
  return referenceName;
}

/**
 * 프롬프트에 @레퍼런스 멘션 삽입
 * contenteditable 영역에서 @ 입력 후 레퍼런스 선택
 * 이 함수 호출 후 page.keyboard.type(prompt) 으로 나머지 프롬프트 입력
 */
export async function insertReferenceMention(page: Page, referenceName: string): Promise<void> {
  // 1. @ 문자 타이핑 → 멘션 드롭다운 트리거
  await page.keyboard.type("@");
  await new Promise(r => setTimeout(r, 500));

  // 2. 멘션 드롭다운에서 referenceName 매칭 항목 클릭
  const clicked = await page.evaluate((name: string) => {
    const items = [...document.querySelectorAll("[class*='dropdown'] li, [class*='mention'] li, [class*='popup'] li, [role='option'], [role='listbox'] li")];
    const match = items.find(el => el.textContent?.trim().includes(name));
    if (match) {
      (match as HTMLElement).click();
      return true;
    }
    const allClickable = [...document.querySelectorAll("li, [role='option']")];
    if (allClickable.length > 0) {
      (allClickable[0] as HTMLElement).click();
      return true;
    }
    return false;
  }, referenceName);

  if (clicked) {
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.type(" ");
    log("info", `@${referenceName} 멘션 삽입 완료`);
  } else {
    log("warn", `멘션 드롭다운에서 ${referenceName}을 찾을 수 없음 — @${referenceName} 텍스트로 삽입`);
    await page.keyboard.type(`${referenceName} `);
  }
}
