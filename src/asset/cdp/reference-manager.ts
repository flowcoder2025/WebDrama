import type { Page } from "puppeteer";
import { log } from "../../common/logger.js";

/**
 * Freepik References 시스템 — 장면별 Reference 순환 방식
 *
 * CDP 실측 기반 (2026-04-13):
 *
 * [등록 흐름]
 *   1. Add 카드 클릭 (텍스트 "Add"로 탐색, 항상 grid 마지막) → 모달 열림
 *   2. History 탭 → production ID로 특정 이미지 선택 → 파란 테두리 + 체크
 *   3. 모달 하단 "Add" 버튼 클릭 (page.mouse.click 필수)
 *   4. 모달 닫힘 → 카운터 증가, 카드 "@imgN" 생성
 *
 * [멘션 흐름]
 *   1. contenteditable에 "@imgN" 타이핑 (필터링) → Enter → 멘션 토큰 삽입
 *   2. 좌표 클릭 불필요 — 드롭다운 위치 문제 없음
 *
 * [장면별 순환]
 *   각 장면마다: Reference 전부 삭제 → 필요한 것만 등록 → 생성 → 다음 장면
 *
 * [이름 규칙]
 *   등록 순서대로 img1, img2, img3, ... (삭제 후 재등록 시 번호 리셋)
 */

// ============================================================
// CDP 대기 시간 상수
// ============================================================

export const CDP_DELAYS = {
  MODAL_OPEN: 500,
  TAB_SWITCH: 1000,
  IMAGE_SELECT: 500,
  ADD_CONFIRM: 2500,
  HOVER: 400,
  DELETE: 600,
  MENTION_FILTER: 500,
  MENTION_SETTLE: 500,
  PROMPT_CLEAR_SETTLE: 300,
} as const;

const MAX_REFERENCE_SLOTS = 14;

// ============================================================
// Reference 등록 카운터 / 이름 조회
// ============================================================

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
      const nameSpan = card.querySelector("span.truncate");
      const text = nameSpan?.textContent?.trim() ?? card.textContent?.trim() ?? "";
      if (text.startsWith("@img")) {
        names.push(text.replace("@", ""));
      }
    }
    return names;
  });
}

// ============================================================
// Reference 전체 삭제
// ============================================================

/**
 * 등록된 Reference를 전부 삭제 (우상단 X 버튼)
 * 장면 전환 시 호출하여 슬롯 초기화
 */
export async function removeAllReferences(page: Page): Promise<void> {
  let maxAttempts = MAX_REFERENCE_SLOTS;
  while (maxAttempts-- > 0) {
    const lastRef = await page.evaluate(() => {
      const allEls = [...document.querySelectorAll("*")];
      const refLabel = allEls.find(
        el => el.textContent?.trim() === "References" && el.children.length === 0,
      );
      const container = refLabel?.closest('[class*="group/references"]');
      const grid = container?.querySelector('[class*="grid"]');
      if (!grid) return null;
      const ref = [...grid.children].reverse().find(
        c => c.textContent?.trim().startsWith("@img"),
      );
      if (!ref) return null;
      // 우상단 삭제 버튼 (가장 오른쪽 작은 버튼)
      const btns = [...ref.querySelectorAll("button")].filter(
        b => b.offsetWidth <= 24 && b.offsetWidth > 0,
      );
      let rightmost: Element | null = null;
      let maxX = -Infinity;
      for (const b of btns) {
        const r = b.getBoundingClientRect();
        if (r.x > maxX) { maxX = r.x; rightmost = b; }
      }
      if (!rightmost) return null;
      const cardRect = ref.getBoundingClientRect();
      const delRect = rightmost.getBoundingClientRect();
      return {
        cx: Math.round(cardRect.x + cardRect.width / 2),
        cy: Math.round(cardRect.y + cardRect.height / 2),
        dx: Math.round(delRect.x + delRect.width / 2),
        dy: Math.round(delRect.y + delRect.height / 2),
      };
    });
    if (!lastRef) break;
    await page.mouse.move(lastRef.cx, lastRef.cy);
    await new Promise(r => setTimeout(r, CDP_DELAYS.HOVER));
    await page.mouse.click(lastRef.dx, lastRef.dy);
    await new Promise(r => setTimeout(r, CDP_DELAYS.DELETE));
  }

  const count = await getRefCount(page);
  log("info", `Reference 전체 삭제 완료 (${count}/${MAX_REFERENCE_SLOTS})`);
}

// ============================================================
// Reference 등록 (production ID 기반)
// ============================================================

/**
 * 특정 이미지를 production ID로 찾아서 Reference 등록
 * @param productionId - 이미지 생성 시 기록한 production ID (URL에서 추출)
 * @returns 등록된 Reference 이름 (예: "img1")
 */
export async function registerByProductionId(
  page: Page,
  productionId: string,
): Promise<string> {
  const beforeCount = await getRefCount(page);
  const beforeNames = await getRegisteredRefNames(page);

  // 1. Add 모달 열기
  const addCardPos = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    const refLabel = allEls.find(
      el => el.textContent?.trim() === "References" && el.children.length === 0,
    );
    const container = refLabel?.closest('[class*="group/references"]');
    const grid = container?.querySelector('[class*="grid"]');
    if (!grid) return null;
    const addCard = [...grid.children].find(
      c => c.textContent?.trim() === "Add",
    ) as HTMLElement | undefined;
    if (!addCard) return null;
    const rect = addCard.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });

  if (!addCardPos) throw new Error("References Add 카드를 찾을 수 없음");
  await page.mouse.click(addCardPos.x, addCardPos.y);

  await page.waitForFunction(
    () => [...document.querySelectorAll("h3")].some(el => el.textContent?.trim() === "History"),
    { timeout: 10000 },
  );
  await new Promise(r => setTimeout(r, CDP_DELAYS.MODAL_OPEN));

  // 2. History 탭 선택
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    btns.find(b => b.textContent?.trim() === "History")?.click();
  });
  await new Promise(r => setTimeout(r, CDP_DELAYS.TAB_SWITCH));

  // 3. production ID로 특정 이미지 선택
  const imgPos = await page.evaluate((prodId: string) => {
    const btns = [...document.querySelectorAll("button")];
    const imgBtn = btns.find(b => {
      if (!b.classList.contains("aspect-square")) return false;
      const img = b.querySelector("img");
      return img?.src?.includes(`production/${prodId}/`) ?? false;
    });
    if (!imgBtn) return null;
    const rect = imgBtn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  }, productionId);

  if (!imgPos) {
    await page.keyboard.press("Escape");
    throw new Error(`Reference 등록 실패: production/${productionId} 이미지를 History에서 찾을 수 없음`);
  }

  await page.mouse.click(imgPos.x, imgPos.y);
  await new Promise(r => setTimeout(r, CDP_DELAYS.IMAGE_SELECT));

  // 4. 모달 Add 버튼 클릭
  const addBtnPos = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const addBtn = btns.find(b => b.textContent?.trim() === "Add" && b.offsetWidth > 40);
    if (!addBtn) return null;
    const rect = addBtn.getBoundingClientRect();
    return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
  });

  if (!addBtnPos) {
    await page.keyboard.press("Escape");
    throw new Error("Reference 등록 실패: 모달 Add 버튼 미발견");
  }

  await page.mouse.click(addBtnPos.x, addBtnPos.y);
  await new Promise(r => setTimeout(r, CDP_DELAYS.ADD_CONFIRM));

  // 5. 카운터 검증
  const afterCount = await getRefCount(page);
  if (afterCount <= beforeCount) {
    throw new Error(`Reference 등록 실패: 카운터 변화 없음 (${beforeCount} → ${afterCount})`);
  }

  // 6. 새 이름 추출
  const afterNames = await getRegisteredRefNames(page);
  const newName = afterNames.find(n => !beforeNames.includes(n)) ?? `img${afterCount}`;

  log("info", `Reference 등록: ${newName} ← production/${productionId} (${beforeCount} → ${afterCount})`);
  return newName;
}

// ============================================================
// 이전 API 호환 — 최신 이미지 등록
// ============================================================

/**
 * History 첫 번째(최신) 이미지를 Reference로 등록
 * 이미지 생성 직후 호출 시 사용
 */
export async function registerAsReference(page: Page): Promise<string> {
  const latestProdId = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const gallery = imgs.filter(
      img => img.src.includes("pikaso") && img.src.includes("preview=1") && img.offsetWidth > 100,
    );
    if (gallery.length === 0) return null;
    return gallery[0].src.match(/production\/(\d+)\//)?.[1] ?? null;
  });

  if (!latestProdId) throw new Error("갤러리에 이미지 없음");
  return registerByProductionId(page, latestProdId);
}

// ============================================================
// 멘션 삽입 — @imgN 타이핑 + Enter
// ============================================================

/**
 * 프롬프트에 @멘션 삽입
 * "@imgN" 타이핑으로 드롭다운 필터링 → Enter로 선택
 * 좌표 클릭 불필요 — 드롭다운 위치/겹침 문제 없음
 */
export async function insertReferenceMention(page: Page, refName: string): Promise<void> {
  await page.keyboard.type(`@${refName}`, { delay: 50 });
  await new Promise(r => setTimeout(r, CDP_DELAYS.MENTION_FILTER));
  await page.keyboard.press("Enter");
  await new Promise(r => setTimeout(r, CDP_DELAYS.MENTION_SETTLE));

  // 멘션 토큰 삽입 확인
  const hasMention = await page.evaluate((name: string) => {
    const editor = document.querySelector("[contenteditable]");
    return editor?.innerHTML?.includes(`data-key="${name}"`) ?? false;
  }, refName);

  if (hasMention) {
    await page.keyboard.type(" ");
    log("info", `@${refName} 멘션 삽입 완료`);
  } else {
    // 타이핑한 텍스트 제거
    for (let i = 0; i < refName.length + 1; i++) {
      await page.keyboard.press("Backspace");
    }
    throw new Error(`멘션 삽입 실패: @${refName} 토큰이 생성되지 않음`);
  }
}

// ============================================================
// 유틸리티 — production ID 추출
// ============================================================

/**
 * 이미지 URL에서 production ID 추출
 */
export function extractProductionId(imageUrl: string): string {
  const match = imageUrl.match(/production\/(\d+)\//);
  if (!match) throw new Error(`production ID 추출 실패: ${imageUrl.substring(0, 80)}`);
  return match[1];
}
