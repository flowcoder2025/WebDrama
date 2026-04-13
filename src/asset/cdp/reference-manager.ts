import type { Page } from "puppeteer";
import { log } from "../../common/logger.js";

/**
 * Freepik References 시스템 — Add 카드 경유 등록 (무료)
 *
 * CDP 실측 기반 (2026-04-13):
 *
 * [DOM 구조]
 *   [class*="group/references"]
 *     └ [class*="grid"]
 *         ├ children[0]: "Character" 카드 (유료 — 사용 안 함)
 *         └ children[1]: "Add" 카드 (무료 — 이걸 클릭)
 *
 * [등록 흐름]
 *   1. Add 카드 클릭 → 모달 열림 (History 탭 기본 선택)
 *   2. History에서 이미지 button.aspect-square 클릭 → 파란 테두리 + 체크
 *   3. 모달 하단 "Add" 버튼 클릭 (page.mouse.click 필수 — evaluate click 미동작)
 *   4. 모달 닫힘 → 카운터 0/14 → 1/14, 카드 "@img1" 생성
 *
 * [멘션 흐름]
 *   1. contenteditable에 "@" 타이핑 → 드롭다운에 "img1" 버튼 표시
 *   2. 드롭다운 "img1" 클릭 (page.mouse.click 필수)
 *   3. 멘션 토큰 삽입: <span data-key="img1" data-type="reference">@img1</span>
 *
 * [이름 규칙]
 *   등록 순서대로 img1, img2, img3, ... (image#N이 아닌 imgN)
 */

/**
 * Add 카드를 클릭하여 Reference 선택 모달 열기
 */
async function openAddModal(page: Page): Promise<void> {
  const addCardPos = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    if (!refLabel) return null;

    const refContainer = refLabel.closest('[class*="group/references"]');
    if (!refContainer) return null;

    const grid = refContainer.querySelector('[class*="grid"]');
    if (!grid || !grid.children[1]) return null;

    const addCard = grid.children[1] as HTMLElement;
    const rect = addCard.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });

  if (!addCardPos) {
    throw new Error("References Add 카드를 찾을 수 없음");
  }

  await page.mouse.click(addCardPos.x, addCardPos.y);

  // 모달 열림 대기 — History H3가 나타날 때까지
  await page.waitForFunction(
    () => {
      const els = [...document.querySelectorAll("h3")];
      return els.some(el => el.textContent?.trim() === "History");
    },
    { timeout: 10000 },
  );
  await new Promise(r => setTimeout(r, 500));
  log("info", "Reference Add 모달 열림");
}

/**
 * History에서 첫 번째 이미지 선택 (button.aspect-square 클릭)
 * 이미지 생성 직후 호출 보장 → History 첫 번째 = 방금 생성한 이미지
 */
async function selectFirstHistoryImage(page: Page): Promise<boolean> {
  // History 이미지 버튼의 좌표를 가져와서 mouse.click으로 클릭
  const imgPos = await page.evaluate(() => {
    // History H3를 기준으로 스크롤 영역 내 이미지 버튼 찾기
    const btns = [...document.querySelectorAll("button")];
    const imgBtn = btns.find(b =>
      b.classList.contains("aspect-square") &&
      b.querySelector("img[src*='pikaso']"),
    );
    if (!imgBtn) return null;
    const rect = imgBtn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });

  if (!imgPos) {
    log("warn", "History에 pikaso 이미지 버튼 없음");
    return false;
  }

  await page.mouse.click(imgPos.x, imgPos.y);
  await new Promise(r => setTimeout(r, 500));

  // 선택 확인 — 하단에 "Add" 버튼 + "Clear all" 버튼이 나타나는지
  const hasAddBtn = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    return btns.some(b => b.textContent?.trim() === "Add" && b.offsetWidth > 40);
  });

  if (!hasAddBtn) {
    log("warn", "이미지 클릭했으나 Add 버튼 미표시 — 재클릭");
    await page.mouse.click(imgPos.x, imgPos.y);
    await new Promise(r => setTimeout(r, 500));
  }

  log("info", "History 이미지 선택 완료");
  return true;
}

/**
 * 모달 하단 "Add" 버튼 클릭 (page.mouse.click 필수)
 */
async function clickModalAddButton(page: Page): Promise<boolean> {
  const addBtnPos = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const addBtn = btns.find(b =>
      b.textContent?.trim() === "Add" && b.offsetWidth > 40,
    );
    if (!addBtn) return null;
    const rect = addBtn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });

  if (!addBtnPos) {
    log("warn", "모달 Add 버튼 미발견");
    return false;
  }

  await page.mouse.click(addBtnPos.x, addBtnPos.y);
  await new Promise(r => setTimeout(r, 1500));
  log("info", "모달 Add 버튼 클릭");
  return true;
}

/**
 * Reference 등록 카운터 읽기
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
 * 등록된 Reference 이름 목록 추출 (img1, img2, ...)
 */
async function getRegisteredRefNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    const container = refLabel?.closest('[class*="group/references"]');
    const grid = container?.querySelector('[class*="grid"]');
    if (!grid) return [];

    const names: string[] = [];
    for (const card of [...grid.children]) {
      // @imgN 형태의 SPAN 찾기
      const nameSpan = card.querySelector("span.truncate");
      const text = nameSpan?.textContent?.trim() ?? card.textContent?.trim() ?? "";
      if (text.startsWith("@img")) {
        names.push(text.replace("@", ""));
      }
    }
    return names;
  });
}

/**
 * 이미지를 Freepik Reference로 등록 (Add 카드 경유, 무료)
 *
 * 흐름: Add 카드 클릭 → 모달 → History → 이미지 선택 → Add 확인
 * 반환: 등록된 Reference 이름 (예: "img1")
 */
export async function registerAsReference(page: Page): Promise<string> {
  const beforeCount = await getRefCount(page);
  const beforeNames = await getRegisteredRefNames(page);
  log("info", `Reference 등록 시작 (현재 ${beforeCount}개: [${beforeNames.join(", ")}])`);

  // 1. Add 모달 열기
  await openAddModal(page);

  // 2. 첫 번째 History 이미지 선택
  const imageSelected = await selectFirstHistoryImage(page);
  if (!imageSelected) {
    await page.keyboard.press("Escape");
    throw new Error("Reference 등록 실패: History에 이미지 없음");
  }

  // 3. 모달 Add 버튼 클릭
  const addClicked = await clickModalAddButton(page);
  if (!addClicked) {
    await page.keyboard.press("Escape");
    throw new Error("Reference 등록 실패: 모달 Add 버튼 미발견");
  }

  // 4. 카운터 검증
  const afterCount = await getRefCount(page);
  if (afterCount <= beforeCount) {
    throw new Error(`Reference 등록 실패: 카운터 변화 없음 (${beforeCount} → ${afterCount})`);
  }

  // 5. 새로 등록된 이름 추출
  const afterNames = await getRegisteredRefNames(page);
  const newName = afterNames.find(n => !beforeNames.includes(n)) ?? `img${afterCount}`;

  log("info", `Reference 등록 완료: ${newName} (${beforeCount} → ${afterCount})`);
  return newName;
}

/**
 * 프롬프트에 @멘션 삽입
 *
 * "@" 타이핑 → 드롭다운에 "imgN" 표시 → mouse.click으로 선택
 * 멘션 토큰: <span data-key="imgN" data-type="reference">@imgN</span>
 */
export async function insertReferenceMention(page: Page, refName: string): Promise<void> {
  // 1. @ 타이핑 → 드롭다운 트리거
  await page.keyboard.type("@");
  await new Promise(r => setTimeout(r, 800));

  // 2. 드롭다운에서 refName 매칭 버튼의 좌표를 가져와 mouse.click
  const itemPos = await page.evaluate((name: string) => {
    // 드롭다운: border-surface-2 bg-surface-modal 클래스의 팝업 내 버튼
    const btns = [...document.querySelectorAll("button")];
    const match = btns.find(b => {
      const text = b.textContent?.trim() ?? "";
      return text === name && b.offsetWidth > 0 && b.offsetHeight > 0;
    });
    if (match) {
      const rect = match.getBoundingClientRect();
      return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
    }

    // 폴백: span.truncate에서 찾기
    const spans = [...document.querySelectorAll("span.truncate")];
    const spanMatch = spans.find(s => s.textContent?.trim() === name && (s as HTMLElement).offsetWidth > 0);
    if (spanMatch) {
      const rect = spanMatch.getBoundingClientRect();
      return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
    }

    return null;
  }, refName);

  if (itemPos) {
    await page.mouse.click(itemPos.x, itemPos.y);
    await new Promise(r => setTimeout(r, 300));

    // 멘션 토큰 삽입 확인
    const hasMention = await page.evaluate((name: string) => {
      const editor = document.querySelector("[contenteditable]");
      return editor?.innerHTML?.includes(`data-key="${name}"`) ?? false;
    }, refName);

    if (hasMention) {
      await page.keyboard.type(" ");
      log("info", `@${refName} 멘션 삽입 완료 (토큰 확인)`);
    } else {
      log("warn", `@${refName} 클릭했으나 멘션 토큰 미확인`);
      await page.keyboard.type(" ");
    }
  } else {
    // 드롭다운 미발견 → 평문 삽입은 Reference 기능 무효화이므로 throw
    await page.keyboard.press("Backspace"); // @ 문자 제거
    throw new Error(`멘션 삽입 실패: 드롭다운에서 ${refName}을 찾을 수 없음`);
  }
}
