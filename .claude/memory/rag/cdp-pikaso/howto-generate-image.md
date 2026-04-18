# HOWTO: 이미지 생성 (멀티 세션 안전)

> **역할**: 이미지 생성 전체 플로우 — 프롬프트 입력 → Generate → API 가로채기로 식별 → 다운로드.
> **언제 읽나**: 이미지 생성 작업 직전.
> **관련 파일**: [`howto-reference.md`](howto-reference.md) (Reference 세팅), [`ref-api.md`](ref-api.md) (API 구조), [`howto-download.md`](howto-download.md) (다운로드), [`prompts.md`](prompts.md) (PART 1: NB2 프롬프트 원칙)
> **마지막 실측**: 2026-04-17

---

## 전체 플로우

1. (필요 시) Reference 등록 — [`howto-reference.md`](howto-reference.md)
2. 프롬프트 입력 (멘션 + 본문 분산)
3. 설정 확인 (2K / 16:9 / AI prompt OFF)
4. **API 가로채기 리스너 설정** (멀티 세션 안전용)
5. Generate 클릭
6. creation.id 포착 대기 (~5초)
7. 갤러리에 render URL 등장 대기 (~35초)
8. 다운로드 (`&preview=1` 제거 + Node https.get)
9. Reference 정리 / 프롬프트 클리어 (원복)

---

## 프롬프트 입력 (멘션 분산)

```js
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();

// 1. 클리어
const ce = await ipg.waitForSelector('[data-cy="image-prompt-input"]', { timeout: 5000 });
await ce.click();
await ipg.keyboard.down('Control');
await ipg.keyboard.press('a');
await ipg.keyboard.up('Control');
await ipg.keyboard.press('Backspace');
await sleep(300);

// 2. 멘션 + 본문 분산 입력
const SEGMENTS = [
  { type: 'mention', ref: 'img1' },
  { type: 'text', s: ' The exact same bus stop shelter as the reference. ' },
  { type: 'mention', ref: 'img2' },
  { type: 'text', s: ' The same woman as the reference, maintaining her exact facial features, face shape, hairstyle, and appearance, wearing her beige merino-knit top and charcoal wide-leg slacks. She sits on the bench...' }
];
for (const seg of SEGMENTS) {
  if (seg.type === 'mention') {
    await ipg.keyboard.type('@' + seg.ref, { delay: 50 });
    await sleep(500);
    await ipg.keyboard.press('Enter');  // 멘션 확정
    await sleep(500);
  } else {
    await ipg.keyboard.type(seg.s, { delay: 10 });
  }
}
```

### 주의사항
- `@imgN` 타이핑 후 **500ms → Enter → 500ms** 패턴이 안정적 (과거 RAG 확립)
- 좌표 클릭 방식은 드롭다운 겹침으로 실패 — 키보드만 사용
- 프롬프트 `@imgN` 멘션이 Reference에 없으면 Generate disabled (dangling)

---

## API 가로채기 리스너 설정

**멀티 세션 안전성의 핵심** — 다른 탭/창이 동시 생성해도 내 것만 식별.

```js
let myFamily = null;
let myCreationId = null;

const onRes = async (res) => {
  const u = res.url();
  // Step 1: start-tti-v2 응답 → family 포착
  if (/start-tti-v2/.test(u) && res.status() === 200) {
    try {
      const body = JSON.parse(await res.text());
      if (body.family) myFamily = body.family;
    } catch(e) {}
  }
  // Step 2: render/v4 응답 → family 매칭되면 creation.id 포착
  if (/render\/v4/.test(u) && res.status() === 200) {
    try {
      const body = JSON.parse(await res.text());
      if (body.creation?.family === myFamily && !myCreationId) {
        myCreationId = body.creation.id;
      }
    } catch(e) {}
  }
};
ipg.on('response', onRes);
```

---

## Generate 클릭 + 식별

```js
// 전제 검증
const gi = await ipg.$eval('[data-cy="generate-button"]', e => ({
  disabled: e.disabled,
  text: e.textContent.trim().slice(0, 30)
}));
if (gi.disabled) {
  console.log('DISABLED:', gi.text);
  ipg.off('response', onRes);
  return;
}

// Generate 클릭
await (await ipg.$('[data-cy="generate-button"]')).click();
const clickedAt = Date.now();

// creation.id 확보 대기 (보통 1~5초 내)
while (!myCreationId && (Date.now() - clickedAt) < 15000) {
  await sleep(500);
}
if (!myCreationId) {
  console.log('NO_CREATION_ID — API 가로채기 실패, fallback 필요');
  ipg.off('response', onRes);
  return;
}
console.log('myCreationId:', myCreationId);
```

---

## 갤러리 DOM에 render URL 등장 대기

creation.id를 받았어도 실제 이미지 render는 30~60초 더 걸림.

```js
let renderInfo = null;
for (let waited = 5; waited <= 90; waited += 5) {
  await sleep(5000);
  renderInfo = await ipg.evaluate((cid) => {
    const el = document.querySelector('[data-item="' + cid + '"]');
    if (!el) return null;
    const img = el.querySelector('img');
    if (!img || !img.src || !/production/.test(img.src)) return null;
    return {
      src: img.src,
      renderProdId: img.src.match(/production\/(\d+)\//)?.[1]
    };
  }, myCreationId);
  if (renderInfo) {
    console.log('DONE creationId=' + myCreationId + ' renderProdId=' + renderInfo.renderProdId + ' elapsed=' + Math.round((Date.now()-clickedAt)/1000) + 's');
    break;
  }
}
ipg.off('response', onRes);
```

### 왜 creation.id ≠ renderProdId
두 ID는 별도 체계 — [`ref-dom-attributes.md`](ref-dom-attributes.md) 참조. 갤러리에서 내 것 찾을 때는 **creation.id (data-item 속성)** 사용, 다운로드 URL은 **renderProdId (img.src)** 사용.

---

## 다운로드

**⭐ Node https.get + `&preview=1` 제거 로직 → [`howto-download.md`](howto-download.md) SSOT**

`renderInfo.src` 확보 후 해당 파일의 다운로드 함수 그대로 사용. 기대 결과 2K PNG 2752×1536, ~7 MB.

---

## Fallback — API 가로채기 실패 시

response listener 설정 시점보다 먼저 요청 나가는 드문 경우. **baseline set diff + 프롬프트 prefix 매칭** 보조:

```js
// Generate 클릭 전: 현재 갤러리 최상단 N개 creation id
const baseline = await ipg.evaluate(() =>
  [...document.querySelectorAll('[data-item]')]
    .slice(0, 10)
    .map(el => el.getAttribute('data-item'))
    .filter(Boolean)
);

// 폴링 루프: 새 data-item + 프롬프트 앞부분 일치 검증
const candidates = await ipg.evaluate((baseline, myPromptHead) => {
  const items = [...document.querySelectorAll('[data-cy="image-creation-feed-item"]')].slice(0, 10);
  return items.map(it => {
    const dataItem = it.getAttribute('data-item');
    const body = it.closest('[data-cy="feed-virtual-item"]');
    let prev = body?.previousElementSibling;
    while (prev && prev.getAttribute('data-cy') !== 'feed-virtual-item') prev = prev.previousElementSibling;
    const pt = prev?.querySelector('[data-cy="feed-item-prompt"]')?.textContent.trim();
    return {
      dataItem,
      isNew: !baseline.includes(dataItem),
      promptHead: pt?.slice(0, 80),
      promptMatch: pt && pt.slice(0, 80) === myPromptHead
    };
  });
}, baseline, myPrompt.slice(0, 80));
```

**주의**: `contenteditable.textContent`에 placeholder ("AI prompt") 섞여 읽힐 수 있음 — exact 매칭 불안정. API 가로채기 우선 권장.

---

## 세션 종료 원복

```js
// Reference 삭제 — howto-reference.md의 "전체 삭제" 참조

// 프롬프트 클리어
await (await ipg.$('[data-cy="image-prompt-input"]')).click();
await ipg.keyboard.down('Control'); await ipg.keyboard.press('a'); await ipg.keyboard.up('Control');
await ipg.keyboard.press('Backspace');
await sleep(300);
```
