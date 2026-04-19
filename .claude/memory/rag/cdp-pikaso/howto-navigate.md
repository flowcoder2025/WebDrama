# HOWTO: 페이지 네비게이션 + 탭 관리

> **역할**: 이미지/영상/에디터 탭 간 이동 + 상세 모달 열기/닫기 + 복귀 패턴.
> **언제 읽나**: 탭 전환/모달 조작 시 / 복귀 방법 잊었을 때.
> **관련 파일**: [`02-connection.md`](02-connection.md) (탭 식별), [`ref-selectors.md`](ref-selectors.md) (이동 버튼 셀렉터), [`troubleshoot.md`](troubleshoot.md) (이미지->비디오 전환 후 Normalize)
> **마지막 실측**: 2026-04-17

---

## 페이지 간 이동 패턴 요약

| 출발 | 도착 | 경로 | 탭 동작 | 복귀 방법 |
|------|------|------|---------|----------|
| 이미지 갤러리 | 이미지 상세 | 이미지 썸네일 클릭 | **모달** (URL 유지) | ESC |
| 이미지 상세 | 이미지 에디터 | "Edit image" 버튼 | **같은 탭 navigate** | `goBack()` × 2 또는 URL 이동 |
| 이미지 상세 | 영상 탭 | "Create video" 버튼 | **같은 탭 navigate** | `goBack()` 또는 URL 이동, **Normalize 필수** |
| 갤러리 썸네일 호버 | 영상 탭 | "Create video" 호버 버튼 | **같은 탭 navigate** | 동일 |
| 영상 탭 Start Image | 영상 탭 교체 | "Edit" 호버 버튼 | **모달** | ESC |
| 사이드바 | 다른 도구 | `sidebar-pinned-*` 또는 `registered-tool-*` | 새 페이지 navigate | 사이드바로 다시 |

---

## 이미지 상세 모달 열기/닫기

```js
// 열기: 갤러리 썸네일 클릭
const imgBox = await ipg.evaluate(() => {
 const it = document.querySelector('[data-cy="image-creation-feed-item"]');
 const img = it.querySelector('img');
 const r = img.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await ipg.mouse.click(imgBox.x, imgBox.y);
await sleep(1500);

// 확인
const opened = await ipg.evaluate(() => !!document.querySelector('[data-cy="image-detail-modal-create-video-button"]'));

// 닫기: ESC (URL 유지, 비파괴)
await ipg.keyboard.press('Escape');
await sleep(1000);

// 또는 닫기 X 버튼
const closeP = await ipg.evaluate(() => {
 const b = document.querySelector('[data-cy="video-modal-close-button-desktop"]');
 const r = b.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await ipg.mouse.click(closeP.x, closeP.y);
```

### [!] 일부 이미지는 클릭해도 상세 모달 안 열림
특정 이미지(원인 미상, prodId `3992508054` 실측) 클릭해도 상세가 안 열리는 경우 있음. 다른 아이템 스킵하고 진행.

---

## 이미지 에디터 진입 (같은 탭 navigate)

```js
// 상세 모달에서 Edit image 클릭
const editBtn = await ipg.$('[data-cy="image-detail-modal-edit-button"]');
await editBtn.click();
await sleep(2500);

// 탭 URL 확인 -- 원래 이미지 탭이 에디터 URL로 변경됨
const pages = await browser.pages();
pages.forEach((t,i) => console.log(i+': '+t.url().slice(0,100)));
// 예: 0: /image-editor/{uuid1}/{uuid2} 1: /ai-video-generator
```

### 복귀 방법
```js
// 방법 1: goBack (브라우저 history)
try {
 await editorPage.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
 // 한 단계 뒤로 가도 에디터 -> 상세 모달 경유 -> 다시 이미지 탭. 두 번 필요할 수 있음
 await sleep(1500);
} catch (e) {
 // 방법 2: URL 직접 이동
 await editorPage.goto('https://www.freepik.com/pikaso/ai-image-generator', { waitUntil: 'domcontentloaded' });
 await sleep(1500);
}
```

---

## 영상 탭으로 전환 (Create video) + 자동 Normalize

**[!] 필수**: 전환 후 해상도가 1080p로 리셋되는 경우 잦음. Generate 클릭 전 반드시 Normalize.

```js
// 상세 모달에서 Create video
const cvBtn = await ipg.$('[data-cy="image-detail-modal-create-video-button"]');
await cvBtn.click();
await sleep(3500);

// Tab이 영상 탭으로 변경됨
const pages = await browser.pages();
const vpg = pages.find(x => x.url().includes('ai-video-generator'));
await vpg.bringToFront();
await sleep(800);

// * 반드시 Normalize
const { steps } = await normalizeVideoTab(vpg); // howto-generate-video.md 참조
console.log('normalize:', steps);
```

### 갤러리 호버 경로 (대안)
```js
// 썸네일 호버 -> Create video 버튼 (아이콘)
await ipg.mouse.move(imgBox.x, imgBox.y);
await sleep(600);
const startframe = await ipg.$('[data-cy="thumbnail-startframe-button"]');
await startframe.click();
// 이후 동일: 영상 탭 navigate + Normalize
```

---

## 영상 탭 Start Image 교체 (모달 방식)

```js
// Start Image 카드 호버
const sfiPos = await vpg.evaluate(() => {
 const c = document.querySelector('[data-cy="video-start-frame-input"]');
 const r = c.getBoundingClientRect();
 return { cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2) };
});
await vpg.mouse.move(sfiPos.cx, sfiPos.cy);
await sleep(500);

// Edit 텍스트 버튼 (data-cy 없음)
const editPos = await vpg.evaluate(() => {
 const root = document.querySelector('[data-cy="video-start-frame-input"]');
 const btn = [...root.querySelectorAll('button')].find(b => b.textContent.trim() === 'Edit');
 const r = btn.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await vpg.mouse.click(editPos.x, editPos.y);
await sleep(2000);
// -> 갤러리 모달 열림 (Reference Add 모달과 유사)
// feed-image-item-{XXX} 또는 video-box-{shortId} 선택 -> Add
```

---

## 프로젝트 필터 (이미지/영상/오디오)

```js
// 이미지만 보기
await (await pg.$('[data-cy="projects-filter-option-image"]')).click();
await sleep(1200);

// 전체 복원
await (await pg.$('[data-cy="projects-filter-shortcut-all"]')).click();
await sleep(1200);
```

### [!] 필터 토글 동작
같은 필터 버튼을 두 번 클릭하면 **OFF 될 수 있음**. 확실히 하려면:
```js
await (await pg.$('[data-cy="projects-filter-shortcut-all"]')).click();
await sleep(800);
await (await pg.$('[data-cy="projects-filter-option-image"]')).click();
await sleep(1200);
```

---

## 새 탭이 생겼을 때 정리

Puppeteer `page.close()` 금지. 대신 URL 이동:
```js
const extraPage = pages.find(x => x.url().includes('image-editor'));
if (extraPage) {
 await extraPage.goto('https://www.freepik.com/pikaso/ai-image-generator', { waitUntil: 'domcontentloaded' });
}
```

---

## 페이지 새로고침 (상태 초기화)

특정 이미지가 상세 모달 안 열리거나 DOM 상태 꼬일 때:
```js
await pg.reload({ waitUntil: 'domcontentloaded' });
await sleep(2500);
// 필터 / 기타 상태 재설정 필요
```
