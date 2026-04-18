# HOWTO: Reference 관리

> **역할**: Reference 등록 / 다중 선택 / 업로드(로컬 파일) / 삭제 / 번호 관리 SOP.
> **언제 읽나**: Reference 추가·삭제 작업 직전.
> **관련 파일**: [`ref-selectors.md`](ref-selectors.md) (셀렉터), [`ref-dom-attributes.md`](ref-dom-attributes.md) (카드 구조)
> **마지막 실측**: 2026-04-17

---

## Add 모달 오픈

```js
const pg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await pg.bringToFront();
const addPos = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="reference-add-button"]');
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(addPos.x, addPos.y);
await sleep(2000);
```

**주의**: `reference-add-button`은 DIV. `puppeteer.click()`은 동작하지만 좌표 `mouse.click` 권장.

---

## History 탭 — 기존 이미지 선택 (단일)

```js
// 첫 이미지 선택
const pos = await pg.evaluate(() => {
  const modal = [...document.querySelectorAll('[class*="modal" i]')].filter(d => d.getBoundingClientRect().width > 300)[0];
  const it = modal.querySelector('[data-cy^="feed-image-item-"]');
  const r = it.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(pos.x, pos.y);
await sleep(500);

// Add 버튼 클릭
const addImgPos = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="advanced-selection-add-images-button"]');
  if (!b || b.disabled) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(addImgPos.x, addImgPos.y);
await sleep(2500);
```

---

## 다중 선택 등록 (한 번에 여러 개)

**클릭으로 누적 선택** (Shift/Ctrl 불필요). 선택 표시: CSS class에 `outline-primary-0 outline-3 outline` 추가.

```js
const targets = [0, 1, 2];  // 상단 3개 아이템 인덱스

for (const idx of targets) {
  const pos = await pg.evaluate((i) => {
    const modal = [...document.querySelectorAll('[class*="modal" i]')].filter(d => d.getBoundingClientRect().width > 300)[0];
    const it = [...modal.querySelectorAll('[data-cy^="feed-image-item-"]')][i];
    if (!it) return null;
    it.scrollIntoView({ block: 'center' });
    const r = it.getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
  }, idx);
  if (pos) {
    await pg.mouse.click(pos.x, pos.y);
    await sleep(400);
  }
}

// 선택 개수 검증
const selCount = await pg.evaluate(() => {
  const modal = [...document.querySelectorAll('[class*="modal" i]')].filter(d => d.getBoundingClientRect().width > 300)[0];
  return [...modal.querySelectorAll('[data-cy^="feed-image-item-"]')]
    .filter(it => /outline-primary-0/.test(it.className)).length;
});
console.log('selected:', selCount);

// Add 한 번 클릭 → @img1, @img2, @img3 동시 부여
// (위 단일 선택 섹션의 Add 버튼 클릭 코드 재사용)
```

### 선택 해제
이미 선택된 이미지 **재클릭 = 해제** (독립 토글). 다른 선택은 유지됨.

---

## Upload 탭 — 로컬 파일 업로드 (갤러리 스크롤 대안)

옛날 Reference를 스크롤로 찾지 않고 **로컬 파일 직접 주입**.

```js
// 1. Add 모달 → Upload 탭 전환
const upP = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="reference-sidebar-upload"]');
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(upP.x, upP.y);
await sleep(1500);

// 2. 파일 업로드 (Puppeteer uploadFile)
const fileInput = await pg.$('[data-cy="advanced-selection-upload-file-input"]');
await fileInput.uploadFile('C:/Team-jane/WebDrama/projects/나는괜찮아요_EP1/characters/char_eunseo.png');
await sleep(3500);  // 업로드 처리 대기

// 3. (선택적) 업로드된 이미지의 새 prodId 포착 (나중 재사용용)
const uploaded = await pg.evaluate(() => {
  const modal = [...document.querySelectorAll('[class*="modal" i]')].filter(d => d.getBoundingClientRect().width > 300)[0];
  const imgs = [...modal.querySelectorAll('img')]
    .filter(i => /conversions\/upload-preview/.test(i.src || ''));
  return imgs.slice(0, 1).map(i => ({
    prodId: (i.src || '').match(/production\/(\d+)\//)?.[1],
    src: (i.src || '').slice(0, 150)
  }));
});
console.log('uploaded:', JSON.stringify(uploaded));

// 4. Add 버튼 클릭 → Reference 등록
const addImgP = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="advanced-selection-add-images-button"]');
  if (!b || b.disabled) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(addImgP.x, addImgP.y);
await sleep(4000);
```

### 업로드 제약
- 지원 포맷: `image/jpeg, image/png, image/webp, image/heic, image/heif`
- 다중 파일 가능 (`multiple=true`) — `uploadFile(path1, path2, ...)` 여러 인자 가능
- 업로드 시점마다 **새 prodId 생성** (`/production/{new}/conversions/upload-preview.jpg`)
- 과거 업로드 이력은 Upload 탭 갤러리에 보존 — 재업로드 대신 기존 것 선택 가능
- **Reference 카드의 img src = `blob:https://www.freepik.com/...`** — prodId 추출 불가. 업로드 중 포착한 prodId 기록 권장

---

## 등록 결과 검증 (필수)

```js
const registered = await pg.evaluate(() => {
  return [...document.querySelectorAll('[data-cy="reference-image-card"]')].map((c, i) => {
    const img = c.querySelector('img');
    return {
      label: '@img' + (i + 1),
      prodId: (img?.src || '').match(/production\/(\d+)\//)?.[1],
      isBlob: /^blob:/.test(img?.src || ''),
      srcSnippet: (img?.src || '').slice(0, 80)
    };
  });
});
console.log('registered:', JSON.stringify(registered));
```

**prodId 불일치 이슈**: 모달에서 `feed-image-item-{XXX}` 클릭했는데 등록 결과는 다른 prodId인 경우 있음 — [`ref-dom-attributes.md`](ref-dom-attributes.md) 참조.

**해결**: 의도와 다르면 **삭제 후 재시도**. folder selector 변경 또는 검색 사용.

---

## 단일 카드 삭제

```js
// 1. 카드 중앙 호버 (X 버튼 opacity 노출)
const target = await pg.evaluate((idx = 0) => {
  const card = document.querySelectorAll('[data-cy="reference-image-card"]')[idx];
  if (!card) return null;
  const r = card.getBoundingClientRect();
  return { cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2) };
}, 0);
await pg.mouse.move(target.cx, target.cy);
await sleep(500);

// 2. 카드 내 첫 번째 button (우상단 X, data-cy 없음)
const xBtn = await pg.evaluate((idx = 0) => {
  const card = document.querySelectorAll('[data-cy="reference-image-card"]')[idx];
  const btn = card.querySelector('button');  // 첫 번째 = 삭제 X
  const r = btn.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
}, 0);
await pg.mouse.click(xBtn.x, xBtn.y);
await sleep(1000);
```

---

## 전체 삭제 (초기화) — while 루프

```js
while (true) {
  const info = await pg.evaluate(() => {
    const c = document.querySelector('[data-cy="reference-image-card"]');
    if (!c) return null;
    const cr = c.getBoundingClientRect();
    const btn = c.querySelector('button');
    const br = btn.getBoundingClientRect();
    return {
      centerX: Math.round(cr.x + cr.width/2),
      centerY: Math.round(cr.y + cr.height/2),
      xBtnX: Math.round(br.x + br.width/2),
      xBtnY: Math.round(br.y + br.height/2)
    };
  });
  if (!info) break;
  await pg.mouse.move(info.centerX, info.centerY);
  await sleep(500);
  await pg.mouse.click(info.xBtnX, info.xBtnY);
  await sleep(800);
}
```

---

## @imgN 번호 관리 규칙 (실측 확정)

- **DOM 순서대로 @img1, @img2, @img3 부여**
- **중간 삭제 시 번호 재부여 안 됨** — @img1+@img2 상태에서 @img1 삭제 → 남은 카드는 여전히 @img2 (라벨 유지)
- **재등록 시 빈 번호 부활 안 함, 새 번호로 증분** (@img1+@img3 상태에서 새로 등록 → @img4 추가)
- 프롬프트의 `@img1` 멘션이 dangling이면 Generate disabled
- **번호 정합성 필요 시**: 전체 삭제 후 원하는 순서로 재등록이 유일한 방법

---

## 검색 기능 (제한적 — 참고만)

`[data-cy="history-references-search-input"]` (type="search", placeholder "Search creations"):

- **prodId로 검색 불가** (예: "3950716111" → 0개 결과)
- **한글 키워드 매칭 불가** (프롬프트 영문 기반 추정)
- 실용: **업로드 탭 `uploadFile()`이 더 확실함**

---

## 폴더 필터링

```js
// 폴더 선택 드롭다운 열기
const fsP = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="history-folder-selector-button"]');
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(fsP.x, fsP.y);
await sleep(1200);

// 옵션 선택 (예: "주인공" 폴더)
const optPos = await pg.evaluate((targetLabel) => {
  const opts = [...document.querySelectorAll('[data-cy^="history-folder-option-"]')];
  const m = opts.find(o => o.textContent.trim() === targetLabel);
  if (!m) return null;
  const r = m.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
}, '주인공');
if (optPos) await pg.mouse.click(optPos.x, optPos.y);
await sleep(1000);
```

옵션 data-cy: `history-folder-option-root` (Personal project), `history-folder-option-{uuid}` (사용자 폴더).

---

## 모달 닫기

```js
// ESC 키 (비파괴)
await pg.keyboard.press('Escape');
await sleep(500);

// 또는 닫기 X 버튼
const closeP = await pg.evaluate(() => {
  const b = document.querySelector('[data-cy="video-modal-close-button-desktop"]');
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(closeP.x, closeP.y);
```
