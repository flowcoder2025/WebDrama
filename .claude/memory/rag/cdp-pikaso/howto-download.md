# HOWTO: 이미지/영상 다운로드

> **역할**: Node.js `https.get()`으로 CORS 우회하여 이미지/영상 원본 다운로드.
> **언제 읽나**: 생성 완료 후 파일 저장 시.
> **관련 파일**: [`ref-dom-attributes.md`](ref-dom-attributes.md) (URL 패턴), [`howto-generate-image.md`](howto-generate-image.md), [`howto-generate-video.md`](howto-generate-video.md)
> **마지막 실측**: 2026-04-17

---

## [NG] 브라우저 내 fetch / XHR -> CORS 차단

```js
// 이 방식 사용 금지
await pg.evaluate(() => fetch(url));
// TypeError: Failed to fetch (pikaso.cdnpk.net)
```

Freepik 자원은 `pikaso.cdnpk.net` 도메인, 크로스오리진 차단. Puppeteer `page.evaluate` 내 fetch도 실패.

---

## [OK] Node.js `https.get()` (확정 방식)

Pikaso URL은 **pre-signed** (`?token=exp=...&hmac=...`) -> 쿠키/인증 없이 접근 가능.

```js
const fs = require('fs');
const https = require('https');

function download(url, outPath) {
 return new Promise((resolve, reject) => {
 https.get(url, res => {
 if (res.statusCode !== 200) {
 return reject(new Error('status=' + res.statusCode));
 }
 const chunks = [];
 res.on('data', c => chunks.push(c));
 res.on('end', () => {
 const buf = Buffer.concat(chunks);
 fs.writeFileSync(outPath, buf);
 resolve(buf.length);
 });
 res.on('error', reject);
 }).on('error', reject);
 });
}
```

---

## 이미지 다운로드 -- `&preview=1` 제거 필수

갤러리 썸네일 img.src는 **항상 `&preview=1` 포함**. 원본 2K 받으려면 제거.

```js
// 갤러리에서 썸네일 src 가져오기
const thumbSrc = await ipg.evaluate(() => {
 return document.querySelector('[data-cy="image-creation-feed-item"] img')?.src;
});
// 또는 creation.id 기반 (멀티 세션 안전)
const srcByCid = await ipg.evaluate((cid) => {
 const el = document.querySelector('[data-item="' + cid + '"]');
 return el?.querySelector('img')?.src;
}, myCreationId);

// preview=1 제거
const originUrl = thumbSrc.replace(/[?&]preview=1/, '');
const renderProdId = originUrl.match(/production\/(\d+)\//)?.[1];

// 다운로드
const outPath = `C:/Team-jane/WebDrama/projects/나는괜찮아요/assets/stills/ep1/ep1_c11_still_v1.png`;
const size = await download(originUrl, outPath);
console.log('size=' + size + ' bytes (' + (size/1024/1024).toFixed(2) + ' MB)');
// 기대: 7MB 근처
```

### 썸네일 vs 원본 실측
| 종류 | URL | 크기 | Dimensions |
|------|-----|------|-----------|
| 썸네일 (preview=1) | 원본 URL | 71 KB | (축소 JPG) |
| **원본** | **`&preview=1` 제거** | **7.09 MB** | **2752×1536** |

---

## 영상 다운로드 -- URL 그대로

영상 URL은 `&preview=1` 없음 -- 바로 다운로드.

```js
const vidSrc = await vpg.evaluate(() => {
 return document.querySelector('[data-cy="main-feed-item"] video')?.src;
});
// 또는 identifier 기반
const srcByIdent = await vpg.evaluate((id) => {
 const vb = document.querySelector('[data-cy="video-box-' + id + '"]');
 return vb?.closest('[data-cy="main-feed-item"]')?.querySelector('video')?.src;
}, myIdentifier);

const outPath = `C:/Team-jane/WebDrama/projects/나는괜찮아요/assets/motions/ep1/ep1_c11_v1.mp4`;
const size = await download(vidSrc, outPath);
console.log('size=' + size + ' bytes (' + (size/1024/1024).toFixed(2) + ' MB)');
// 기대: 12MB 근처
```

---

## 다운로드 검증

### PNG 파일 dimensions 확인
```js
function readPngDims(path) {
 const buf = fs.readFileSync(path);
 if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
 return {
 w: buf.readUInt32BE(16),
 h: buf.readUInt32BE(20)
 };
}
console.log(readPngDims(outPath));
// 기대: { w: 2752, h: 1536 } (2K 16:9)
```

### MP4 파일 크기만 확인 (내부 파싱은 생략)
```js
const stat = fs.statSync(outPath);
console.log('MB:', (stat.size / 1024 / 1024).toFixed(2));
```

---

## 갤러리 호버 Download 버튼은?

```
[data-cy="thumbnail-download-button"] (aria="Download", 24x24)
```

존재하지만 **클릭 시 브라우저 기본 다운로드 폴더로 저장** -> 프로젝트 경로로 옮기려면 부가 작업 필요. **Node `https.get()` 방식이 경로 제어 + 재현성 면에서 권장**.

---

## 이미지 에디터 다운로드

에디터에서 `creation-top-video-button` 옆 **Export 버튼**:
```
[data-cy="download-button-export"] (텍스트 "Export", 상단 우측)
```

또는 상세 모달의 `download-button-export` -- 동일 방식 (브라우저 기본 폴더).

**결론**: 어느 경로든 **Node https.get이 가장 확실**.

---

## Batch 다운로드 (여러 자원 동시)

```js
const targets = [
 { url: 'https://.../prod/3994805066/render.png?token=...', path: 'scenes/C00.png' },
 { url: 'https://.../prod/3994805067/render.png?token=...', path: 'scenes/C01.png' },
 // ...
];

// 순차 (안정적)
for (const t of targets) {
 const originUrl = t.url.replace(/[?&]preview=1/, '');
 await download(originUrl, t.path);
 console.log('saved:', t.path);
}

// 병렬 (빠르지만 서버 부담)
await Promise.all(targets.map(t => {
 const originUrl = t.url.replace(/[?&]preview=1/, '');
 return download(originUrl, t.path);
}));
```

---

## Token 만료 주의

URL `?token=exp={unixts}~hmac=...` 의 **`exp`가 만료되면 403**. 
- 실측 토큰 exp: 현재 시각 + 수시간~수일 (서버가 발급하는 시점 기준)
- 긴 배치 작업은 중간에 토큰 갱신 필요할 수 있음 -> 실패 시 갤러리에서 src 재획득
