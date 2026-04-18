# CDP 작업 치트시트

> **역할**: 매일 쓰는 10개 SOP — `node -e "..."` 바로 복붙 실행.
> **언제 읽나**: 작업 중 스니펫 필요 시 (Read 1회로 충분).
> **공통 전제**: 모든 스니펫 앞에 CDP 연결 헤더 붙이고, `const sleep = ms => new Promise(r => setTimeout(r, ms));` 있다고 가정.

```js
// 공통 헤더 (매 스니펫 실행 시 필요)
const p = require('puppeteer');
(async () => {
  const b = await p.connect({ browserURL: 'http://localhost:9222', defaultViewport: null, protocolTimeout: 60000 });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // ─── 여기에 스니펫 ─── //
  b.disconnect();
})();
```

---

## 1. 페이지 상태 덤프 (이미지 탭)

```js
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();
const s = await ipg.evaluate(() => {
  const get = d => { const el = document.querySelector('[data-cy="'+d+'"]'); return el ? { text: el.textContent.trim().slice(0,40), disabled: el.disabled === true } : null; };
  const refs = [...document.querySelectorAll('[data-cy="reference-image-card"]')].map(c => ({
    prodId: (c.querySelector('img')?.src||'').match(/production\/(\d+)\//)?.[1],
    isBlob: /^blob:/.test(c.querySelector('img')?.src||'')
  }));
  return {
    resolution: get('image-resolution-input'),
    ratio: get('image-aspect-ratio-input'),
    generate: get('generate-button'),
    refs,
    promptSnippet: document.querySelector('[data-cy="image-prompt-input"]')?.textContent.trim().slice(0,100)
  };
});
console.log(JSON.stringify(s, null, 2));
```

---

## 2. 페이지 상태 덤프 (영상 탭)

```js
const vpg = (await b.pages()).find(x => x.url().includes('ai-video-generator'));
await vpg.bringToFront();
const s = await vpg.evaluate(() => {
  const get = d => { const el = document.querySelector('[data-cy="'+d+'"]'); return el ? { text: el.textContent.trim().slice(0,40), disabled: el.disabled === true } : null; };
  const sfi = document.querySelector('[data-cy="video-start-frame-input"] img');
  return {
    model: document.querySelector('[data-cy="video-model-selector-trigger"]')?.textContent.trim().slice(0,30),
    resolution: document.querySelector('[data-cy="video-resolution-option"]')?.textContent.trim(),
    duration: document.querySelector('[data-cy="video-duration-option"]')?.textContent.trim(),
    ratio: document.querySelector('[data-cy="video-aspect-ratio-option"]')?.textContent.trim(),
    generate: get('generate-button'),
    startImageProd: (sfi?.src||'').match(/production\/(\d+)\//)?.[1],
    startIsTemp: /tmp\/temp-files/.test(sfi?.src||''),
    promptSnippet: document.querySelector('[data-cy="video-prompt-input"]')?.textContent.trim().slice(0,100)
  };
});
console.log(JSON.stringify(s, null, 2));
```

---

## 3. Reference 등록 (prodId 단일)

```js
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();
const PROD_ID = '3950716111';  // 원하는 prodId

// Add 모달 오픈
const addPos = await ipg.evaluate(() => { const b = document.querySelector('[data-cy="reference-add-button"]'); const r = b.getBoundingClientRect(); return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) }; });
await ipg.mouse.click(addPos.x, addPos.y);
await sleep(2000);

// 직접 prodId로 찾기 (실패 시 첫 이미지 fallback)
let pos = await ipg.evaluate((pid) => {
  const t = document.querySelector('[data-cy="feed-image-item-'+pid+'"]');
  if (!t) return null;
  t.scrollIntoView({ block: 'center' });
  const r = t.getBoundingClientRect();
  return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
}, PROD_ID);
if (!pos) {
  pos = await ipg.evaluate(() => {
    const first = document.querySelector('[data-cy^="feed-image-item-"]');
    const r = first.getBoundingClientRect();
    return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
  });
  console.log('NOTE: prodId not found, using first item');
}
await sleep(500);
await ipg.mouse.click(pos.x, pos.y);
await sleep(500);

// Add 클릭
const addImgPos = await ipg.evaluate(() => { const b = document.querySelector('[data-cy="advanced-selection-add-images-button"]'); if (!b || b.disabled) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) }; });
await ipg.mouse.click(addImgPos.x, addImgPos.y);
await sleep(2500);

// 결과 검증
const registered = await ipg.evaluate(() => [...document.querySelectorAll('[data-cy="reference-image-card"]')].map((c,i) => ({ label: '@img'+(i+1), prodId: (c.querySelector('img')?.src||'').match(/production\/(\d+)\//)?.[1] })));
console.log('registered:', JSON.stringify(registered));
```

---

## 4. Reference 업로드 (로컬 파일)

```js
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();
const LOCAL_FILE = 'C:/Team-jane/WebDrama/projects/나는괜찮아요/assets/refs/char_eunseo_base_v1.png';

// Add 모달
const addPos = await ipg.evaluate(() => { const b = document.querySelector('[data-cy="reference-add-button"]'); const r = b.getBoundingClientRect(); return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) }; });
await ipg.mouse.click(addPos.x, addPos.y);
await sleep(2000);

// Upload 탭
const upP = await ipg.evaluate(() => { const b = document.querySelector('[data-cy="reference-sidebar-upload"]'); const r = b.getBoundingClientRect(); return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) }; });
await ipg.mouse.click(upP.x, upP.y);
await sleep(1500);

// uploadFile
const fileInput = await ipg.$('[data-cy="advanced-selection-upload-file-input"]');
await fileInput.uploadFile(LOCAL_FILE);
await sleep(3500);

// Add
const addImgP = await ipg.evaluate(() => { const b = document.querySelector('[data-cy="advanced-selection-add-images-button"]'); const r = b.getBoundingClientRect(); return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) }; });
await ipg.mouse.click(addImgP.x, addImgP.y);
await sleep(4000);
```

---

## 5. Reference 전체 삭제

```js
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();
while (true) {
  const info = await ipg.evaluate(() => {
    const c = document.querySelector('[data-cy="reference-image-card"]');
    if (!c) return null;
    const cr = c.getBoundingClientRect();
    const btn = c.querySelector('button');
    const br = btn.getBoundingClientRect();
    return {
      cx: Math.round(cr.x+cr.width/2), cy: Math.round(cr.y+cr.height/2),
      xbx: Math.round(br.x+br.width/2), xby: Math.round(br.y+br.height/2)
    };
  });
  if (!info) break;
  await ipg.mouse.move(info.cx, info.cy);
  await sleep(500);
  await ipg.mouse.click(info.xbx, info.xby);
  await sleep(800);
}
console.log('refs cleared');
```

---

## 6. 이미지 생성 + 식별 + 다운로드 (API 가로채기, 멀티 세션 안전)

```js
const fs = require('fs');
const https = require('https');
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
await ipg.bringToFront();
const OUT = 'C:/path/to/output.png';

// API 가로채기 리스너
let myFamily = null, myCreationId = null;
const onRes = async (res) => {
  const u = res.url();
  if (/start-tti-v2/.test(u) && res.status() === 200) {
    try { const body = JSON.parse(await res.text()); if (body.family) myFamily = body.family; } catch(e) {}
  }
  if (/render\/v4/.test(u) && res.status() === 200) {
    try { const body = JSON.parse(await res.text()); if (body.creation?.family === myFamily && !myCreationId) myCreationId = body.creation.id; } catch(e) {}
  }
};
ipg.on('response', onRes);

// Generate
const gi = await ipg.$eval('[data-cy="generate-button"]', e => ({ disabled: e.disabled, text: e.textContent.trim() }));
if (gi.disabled) { console.log('DISABLED'); ipg.off('response', onRes); return; }
await (await ipg.$('[data-cy="generate-button"]')).click();
const t0 = Date.now();

// creation.id 대기
while (!myCreationId && (Date.now()-t0) < 15000) await sleep(500);
if (!myCreationId) { console.log('NO_CID'); ipg.off('response', onRes); return; }
console.log('creationId:', myCreationId);

// 갤러리 render URL 대기
let r = null;
for (let w = 5; w <= 90; w += 5) {
  await sleep(5000);
  r = await ipg.evaluate((cid) => {
    const el = document.querySelector('[data-item="'+cid+'"]');
    const img = el?.querySelector('img');
    if (!img?.src || !/production/.test(img.src)) return null;
    return { src: img.src, prod: img.src.match(/production\/(\d+)\//)?.[1] };
  }, myCreationId);
  if (r) break;
}
ipg.off('response', onRes);
if (!r) { console.log('NO_RENDER'); return; }
console.log('done:', r.prod);

// 다운로드
const originUrl = r.src.replace(/[?&]preview=1/, '');
await new Promise((res, rej) => {
  https.get(originUrl, resp => {
    if (resp.statusCode !== 200) return rej(new Error('status='+resp.statusCode));
    const chunks = [];
    resp.on('data', c => chunks.push(c));
    resp.on('end', () => { fs.writeFileSync(OUT, Buffer.concat(chunks)); res(); });
  });
});
console.log('saved:', OUT);
```

---

## 7. 영상 생성 + Normalize + 식별 + 다운로드

```js
const fs = require('fs');
const https = require('https');
const vpg = (await b.pages()).find(x => x.url().includes('ai-video-generator'));
await vpg.bringToFront();
const OUT = 'C:/path/to/output.mp4';

// Normalize (스니펫 8 참조)
// ... normalizeVideoTab(vpg) 호출 ...

// API 가로채기
let myIdentifier = null, expectedSec = 90;
const onRes = async (res) => {
  if (!/video\/generate/.test(res.url()) || res.status() !== 200) return;
  try {
    const body = JSON.parse(await res.text());
    const c = body?.data?.creations?.[0];
    if (c) { myIdentifier = c.identifier; if (c.metadata?.expectedGenerationTime) expectedSec = c.metadata.expectedGenerationTime + 30; }
  } catch(e) {}
};
vpg.on('response', onRes);

const gi = await vpg.$eval('[data-cy="generate-button"]', e => ({ text: e.textContent.trim(), disabled: e.disabled }));
if (gi.disabled || !/Unlimited/.test(gi.text)) { console.log('BAD:', gi); vpg.off('response', onRes); return; }
await (await vpg.$('[data-cy="generate-button"]')).click();
const t0 = Date.now();

while (!myIdentifier && (Date.now()-t0) < 15000) await sleep(500);
if (!myIdentifier) { console.log('NO_ID'); vpg.off('response', onRes); return; }
console.log('identifier:', myIdentifier);

let r = null;
for (let w = 10; w <= expectedSec*1.5; w += 10) {
  await sleep(10000);
  r = await vpg.evaluate((id) => {
    const vb = document.querySelector('[data-cy="video-box-'+id+'"]');
    const video = vb?.closest('[data-cy="main-feed-item"]')?.querySelector('video');
    if (!video?.src || !/production/.test(video.src)) return null;
    return { src: video.src, prod: video.src.match(/production\/(\d+)\//)?.[1] };
  }, myIdentifier);
  if (r) break;
}
vpg.off('response', onRes);
if (!r) { console.log('NO_VIDEO'); return; }
console.log('done:', r.prod);

await new Promise((res, rej) => {
  https.get(r.src, resp => {
    if (resp.statusCode !== 200) return rej(new Error('status='+resp.statusCode));
    const chunks = [];
    resp.on('data', c => chunks.push(c));
    resp.on('end', () => { fs.writeFileSync(OUT, Buffer.concat(chunks)); res(); });
  });
});
console.log('saved:', OUT);
```

---

## 8. 영상 탭 Normalize (Kling 2.5 / 720 / 10" 강제)

**⭐ 전체 함수 정의 → [`troubleshoot.md` P-2](troubleshoot.md) (SSOT)**

이미지→비디오 전환 후 **반드시** 실행. 어떤 리셋 조합(1080 / Auto / Kling 3.0)이든 복귀시킴.

```js
// troubleshoot.md P-2의 normalizeVideoTab() 함수를 그대로 복붙 후:
const vpg = (await b.pages()).find(x => x.url().includes('ai-video-generator'));
await vpg.bringToFront();
const { steps } = await normalizeVideoTab(vpg);
console.log('steps:', steps);  // 예: ["res→720"] 또는 [] (이미 정상)
```

---

## 9. 이미지 다운로드 (preview=1 제거 → 2K 원본)

```js
const fs = require('fs');
const https = require('https');
const ipg = (await b.pages()).find(x => x.url().includes('ai-image-generator'));
const OUT = 'C:/path/to/output.png';
// 특정 creation.id 이미지의 src 획득
const CID = '2806455855';  // 또는 현재 최상단: document.querySelector('[data-cy="image-creation-feed-item"] img')
const src = await ipg.evaluate((cid) => {
  const el = document.querySelector('[data-item="'+cid+'"]');
  return el?.querySelector('img')?.src;
}, CID);
if (!src) { console.log('NO_SRC'); return; }
const originUrl = src.replace(/[?&]preview=1/, '');
await new Promise((res, rej) => {
  https.get(originUrl, resp => {
    if (resp.statusCode !== 200) return rej(new Error('status='+resp.statusCode));
    const chunks = [];
    resp.on('data', c => chunks.push(c));
    resp.on('end', () => { fs.writeFileSync(OUT, Buffer.concat(chunks)); res(); });
  });
});
console.log('saved:', OUT);
```

---

## 10. 드롭다운 안전 선택 (해상도/비율/길이)

```js
const pg = /* 대상 탭 */;

async function selectPopoverOption(triggerDataCy, regex) {
  await (await pg.$(`[data-cy="${triggerDataCy}"]`)).click();
  await sleep(500);
  const pos = await pg.evaluate((rx) => {
    const opts = [...document.querySelectorAll('[data-cy="popover-option"]')].filter(o => o.getBoundingClientRect().height > 0);
    const m = opts.find(o => new RegExp(rx).test(o.textContent.trim()));
    if (!m) return null;
    const r = m.getBoundingClientRect();
    return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
  }, regex);
  if (pos) await pg.mouse.click(pos.x, pos.y);
  await sleep(500);
  return !!pos;
}

// 예시 사용
await selectPopoverOption('image-resolution-input', '^2K');
await selectPopoverOption('image-aspect-ratio-input', '^16:9');
await selectPopoverOption('video-resolution-option', '^720');
await selectPopoverOption('video-duration-option', '^10');
```

닫기: `await pg.keyboard.press('Escape')`
