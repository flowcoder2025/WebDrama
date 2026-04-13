import type { Page } from "puppeteer";
import { log } from "../../common/logger.js";

/**
 * Freepik References 시스템 — Add 카드 경유 등록
 *
 * DOM 구조 (2026-04 기준):
 *   [class*="group/references"]
 *     └ [class*="grid"]
 *         ├ children[0]: "Character" 카드 (캐릭터 전용 — 사용 안 함)
 *         └ children[1]: "Add" 카드 (범용 Reference 추가 — 이걸 클릭)
 *
 * 모달 좌측: History | Uploads | Favorites | Stock (button)
 * 모달 내 이미지: img[src*="pikaso"] (History 탭)
 * 등록 카운터: "0/14" → "1/14" 변경으로 등록 성공 확인
 */

/**
 * Add 카드를 클릭하여 Reference 선택 모달 열기
 */
async function openAddModal(page: Page): Promise<void> {
  const clicked = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    if (!refLabel) return false;

    const refContainer = refLabel.closest('[class*="group/references"]');
    if (!refContainer) return false;

    const grid = refContainer.querySelector('[class*="grid"]');
    if (!grid || !grid.children[1]) return false;

    // Add 카드 (grid.children[1]) 내 cursor-pointer 요소 클릭
    const addCard = grid.children[1];
    const clickTarget =
      addCard.querySelector('[class*="cursor-pointer"]') ?? addCard;
    (clickTarget as HTMLElement).click();
    return true;
  });

  if (!clicked) {
    throw new Error("References Add 카드를 찾을 수 없음");
  }

  // 모달 열림 대기 — History 탭 텍스트가 나타날 때까지
  await page.waitForFunction(
    () => {
      const btns = [...document.querySelectorAll("button")];
      return btns.some(b => b.textContent?.trim() === "History");
    },
    { timeout: 10000 },
  );
  await new Promise(r => setTimeout(r, 500));
  log("info", "Reference Add 모달 열림");
}

/**
 * 모달 내 History 탭 선택
 */
async function selectHistoryTab(page: Page): Promise<void> {
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const historyBtn = btns.find(b => b.textContent?.trim() === "History");
    if (historyBtn) (historyBtn as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 1000));
  log("info", "History 탭 선택");
}

/**
 * History에서 이미지 선택 (가장 최근 = 첫 번째 pikaso 이미지)
 * 이미지 생성 직후 호출 보장 → History 첫 번째 = 방금 생성한 이미지
 */
async function selectFirstHistoryImage(page: Page): Promise<boolean> {
  const selected = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const pikasoImgs = imgs.filter(
      img => img.src.includes("pikaso") && img.offsetWidth > 100,
    );
    if (pikasoImgs.length === 0) return false;
    pikasoImgs[0].click();
    return true;
  });

  if (!selected) {
    log("warn", "History에 pikaso 이미지 없음");
    return false;
  }

  await new Promise(r => setTimeout(r, 500));

  // 선택 확인 — selected 클래스 또는 체크마크 존재
  const hasSelection = await page.evaluate(() => {
    return document.querySelectorAll('[class*="selected"], [aria-selected="true"]').length > 0;
  });
  if (!hasSelection) {
    log("warn", "이미지 클릭했으나 selected 상태 미확인 — 재클릭 시도");
    await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")];
      const pikasoImgs = imgs.filter(
        img => img.src.includes("pikaso") && img.offsetWidth > 100,
      );
      if (pikasoImgs.length > 0) pikasoImgs[0].click();
    });
    await new Promise(r => setTimeout(r, 500));
  }
  log("info", "이미지 선택 완료");
  return true;
}

/**
 * Reference 등록 확인 — 카운터 변화로 성공 검증
 */
async function getRefCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    if (!refLabel) return -1;
    const container = refLabel.closest('[class*="group/references"]');
    const countText = container?.querySelector("p")?.textContent?.trim() ?? "";
    const match = countText.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  });
}

/**
 * 이미지를 Freepik Reference로 등록
 *
 * 흐름: Add 카드 클릭 → 모달 → History 탭 → 이미지 선택 → 등록 완료
 * 생성 직후 호출 → 단일 CDP 세션이므로 History 첫 번째 = 방금 생성한 이미지
 */
export async function registerAsReference(page: Page, _imageUrl: string): Promise<string> {
  const beforeCount = await getRefCount(page);
  log("info", `Reference 등록 시작 (현재 ${beforeCount}개)`);

  // 1. Add 모달 열기
  await openAddModal(page);

  // 2. History 탭 선택
  await selectHistoryTab(page);

  // 3. 첫 번째 이미지 선택
  const imageSelected = await selectFirstHistoryImage(page);
  if (!imageSelected) {
    // ESC로 모달 닫고 실패 반환
    await page.keyboard.press("Escape");
    throw new Error("Reference 등록 실패: History에 이미지 없음");
  }

  // 4. 자동 등록 확인 → 안 되면 Add 확인 버튼 클릭 시도
  await new Promise(r => setTimeout(r, 1000));

  let currentCount = await getRefCount(page);
  if (currentCount > beforeCount) {
    log("info", `Reference 자동 등록 완료 (${beforeCount} → ${currentCount})`);
  } else {
    // Add/확인 버튼 탐색 + 클릭
    const confirmClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const confirm = btns.find(b => {
        const text = b.textContent?.trim().toLowerCase() ?? "";
        return (text === "add" || text === "apply" || text === "confirm" || text === "done")
          && b.offsetWidth > 40;
      });
      if (confirm) {
        (confirm as HTMLElement).click();
        return true;
      }
      return false;
    });

    if (confirmClicked) {
      log("info", "Add 확인 버튼 클릭");
      await new Promise(r => setTimeout(r, 1500));
    } else {
      log("warn", "Add 확인 버튼 미발견 — ESC로 모달 닫기 시도");
      await page.keyboard.press("Escape");
      await new Promise(r => setTimeout(r, 500));
    }

    currentCount = await getRefCount(page);
    if (currentCount <= beforeCount) {
      throw new Error(`Reference 등록 실패: 카운터 변화 없음 (${beforeCount} → ${currentCount})`);
    }
    log("info", `Reference 등록 완료 (${beforeCount} → ${currentCount})`);
  }

  // 등록된 Reference 이름 반환
  const refName = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    const container = refLabel?.closest('[class*="group/references"]');
    const grid = container?.querySelector('[class*="grid"]');
    if (!grid) return "Reference";
    // 새로 등록된 카드 = Character/Add 외의 카드
    const cards = [...grid.children];
    for (const card of cards) {
      const text = card.textContent?.trim() ?? "";
      if (text !== "Character" && text !== "Add" && text.length > 0) {
        return text;
      }
    }
    return "Reference";
  });

  log("info", `등록된 Reference: "${refName}"`);
  return refName;
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
    const items = [...document.querySelectorAll(
      '[class*="dropdown"] li, [class*="mention"] li, [class*="popup"] li, [role="option"], [role="listbox"] li',
    )];
    const match = items.find(el => el.textContent?.trim().includes(name));
    if (match) {
      (match as HTMLElement).click();
      return true;
    }
    // 폴백: 첫 번째 선택 가능 항목
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
