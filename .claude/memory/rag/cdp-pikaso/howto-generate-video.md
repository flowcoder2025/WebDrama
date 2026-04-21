# HOWTO: 영상 생성 (Kling 2.5, 멀티 세션 안전)

> **역할**: 영상 생성 전체 플로우 -- Start Image 세팅 -> Normalize (필수) -> 모션 프롬프트 -> Generate -> API 가로채기 -> 다운로드.
> **언제 읽나**: 영상 생성 작업 직전 / 이미지->비디오 전환 후.
> **관련 파일**: [`ref-api.md`](ref-api.md) (API 구조), [`howto-download.md`](howto-download.md), [`prompts.md`](prompts.md) (PART 2: Kling 모션), [`troubleshoot.md`](troubleshoot.md) (Normalize 상세)
> **마지막 실측**: 2026-04-17

---

## [!] 이미지->비디오 전환 후 필수 첫 작업

**Create video 경로**로 영상 탭 진입 시 기본값이 **1080p로 리셋** (간헐적으로 Auto 모드 / Kling 3.0 고정 케이스도 발생).

**절대 Generate 클릭 전에 `normalizeVideoTab()` 실행**. [`troubleshoot.md`](troubleshoot.md) 참조.

---

## 전체 플로우

1. 영상 탭 전환 (이미지 상세 -> Create video, 또는 기존 영상 탭 유지)
2. **Normalize 실행** (Kling 2.5 / 720 / 10" / 16:9 강제)
3. Start Image 확인 (또는 교체)
4. 모션 프롬프트 입력
5. API 가로채기 리스너 설정
6. Generate 클릭
7. identifier 포착 (~1~3초)
8. 갤러리 DOM에 video src 등장 대기 (~71초)
9. 다운로드 (Node https.get)

---

## Normalize (영상 탭 기본값 정상화)

*** `normalizeVideoTab()` 함수 전체 정의 -> [`troubleshoot.md` P-2](troubleshoot.md) (SSOT)**

이미지->비디오 전환 시 해상도 1080p 리셋 / Auto 모델 / Kling 3.0 고정 등 어떤 리셋 조합이든 Kling 2.5 / 720 / 10"로 강제 복귀.

**호출 + 검증**:
```js
const { steps } = await normalizeVideoTab(vpg); // 정의: troubleshoot.md P-2
console.log('normalize steps:', steps);
// 최종 상태 검증 블록 -> troubleshoot.md P-2 "최종 검증" 섹션 사용
// 기대: { model: "Kling 2.5", resolution: "720", duration: "10\"", generate: "GenerateUnlimited" }
```

**비율은 Kling 2.5에서 자동 16:9 (disabled)** -- 수정 필요 없음.

---

## Start Image 확인 / 교체

### 현재 Start Image 상태
```js
const sfi = await vpg.evaluate(() => {
 const img = document.querySelector('[data-cy="video-start-frame-input"] img');
 if (!img) return { empty: true };
 return {
 src: img.src.slice(0, 180),
 isTemp: /tmp\/temp-files/.test(img.src),
 prodId: img.src.match(/production\/(\d+)\//)?.[1] || null
 };
});
```

### Start Image 교체 (Edit 버튼 -> 갤러리 모달)
```js
// 카드 호버
const sfiRoot = await vpg.evaluate(() => {
 const c = document.querySelector('[data-cy="video-start-frame-input"]');
 const r = c.getBoundingClientRect();
 return { cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2) };
});
await vpg.mouse.move(sfiRoot.cx, sfiRoot.cy);
await sleep(500);

// Edit 버튼 (텍스트 매칭, data-cy 없음)
const editBtn = await vpg.evaluate(() => {
 const root = document.querySelector('[data-cy="video-start-frame-input"]');
 const btn = [...root.querySelectorAll('button')].find(b => b.textContent.trim() === 'Edit');
 if (!btn) return null;
 const r = btn.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
if (editBtn) {
 await vpg.mouse.click(editBtn.x, editBtn.y);
 await sleep(2000);
 // 갤러리 모달이 열림 -- Reference Add 모달과 유사 구조
 // feed-image-item-{prodId} 또는 video-box-{shortId} 선택 -> Add
}
```

---

## 모션 프롬프트 입력

```js
const ce = await vpg.$('[data-cy="video-prompt-input"]');
await ce.click();
await vpg.keyboard.down('Control'); await vpg.keyboard.press('a'); await vpg.keyboard.up('Control');
await vpg.keyboard.press('Backspace');
await sleep(300);
const motion = 'She holds the phone steady to her ear, listening. Her lips move with brief responses. Her left hand on the tote strap tightens almost imperceptibly. Static side-angle camera.';
await vpg.keyboard.type(motion, { delay: 5 });
await sleep(500);
```

Kling 모션 원칙은 [`prompts.md`](prompts.md) PART 2 참조.

---

## API 가로채기 리스너 설정

영상은 **단일 엔드포인트**.

```js
let myIdentifier = null;
let myCreationId = null;
let expectedSec = 90;

const onRes = async (res) => {
 const u = res.url();
 if (!/video\/generate/.test(u) || res.status() !== 200) return;
 try {
 const body = JSON.parse(await res.text());
 const creation = body?.data?.creations?.[0];
 if (creation) {
 myCreationId = creation.id;
 myIdentifier = creation.identifier;
 if (creation.metadata?.expectedGenerationTime) {
 expectedSec = creation.metadata.expectedGenerationTime + 30; // 여유
 }
 }
 } catch(e) {}
};
vpg.on('response', onRes);
```

---

## Generate + 완료 대기

```js
// 전제 검증
const gi = await vpg.$eval('[data-cy="generate-button"]', e => ({
 text: e.textContent.trim().slice(0, 30),
 disabled: e.disabled
}));
if (gi.disabled) {
 console.log('DISABLED -- Normalize / 프롬프트 확인');
 vpg.off('response', onRes);
 return;
}
if (!/Unlimited/.test(gi.text)) {
 console.log('NOT UNLIMITED -- normalize 필수');
 vpg.off('response', onRes);
 return;
}

// Generate 클릭
const clickedAt = Date.now();
await (await vpg.$('[data-cy="generate-button"]')).click();

// identifier 확보 대기 (1~3초)
while (!myIdentifier && (Date.now() - clickedAt) < 15000) await sleep(500);
if (!myIdentifier) {
 console.log('NO_IDENTIFIER');
 vpg.off('response', onRes);
 return;
}
console.log('myIdentifier:', myIdentifier, 'creationId:', myCreationId, 'expectedSec:', expectedSec);

// 갤러리 DOM에 video src 등장 대기
let result = null;
for (let waited = 10; waited <= expectedSec * 1.5; waited += 10) {
 await sleep(10000);
 result = await vpg.evaluate((id) => {
 const vb = document.querySelector('[data-cy="video-box-' + id + '"]');
 if (!vb) return null;
 const video = vb.closest('[data-cy="main-feed-item"]')?.querySelector('video');
 if (!video || !video.src || !/production/.test(video.src)) return null;
 return {
 src: video.src,
 renderProdId: video.src.match(/production\/(\d+)\//)?.[1]
 };
 }, myIdentifier);
 if (result) {
 console.log('DONE identifier=' + myIdentifier + ' renderProdId=' + result.renderProdId + ' elapsed=' + Math.round((Date.now()-clickedAt)/1000) + 's');
 break;
 }
}
vpg.off('response', onRes);
```

### [!] 중복 클릭 방지
Generate 버튼이 11초 후 `disabled=false`로 복귀 -- **재클릭 금지**. 
- 감지: 갤러리 최상단에 `topKind==="unknown"` (플레이스홀더) = 생성 중
- 또는 폴링 루프 끝까지 대기

---

## 다운로드

*** Node https.get 로직 -> [`howto-download.md`](howto-download.md) SSOT**

`result.src` (video.src) 그대로 사용. 영상 URL은 `&preview=1` 없음. 기대 결과 720p 10s mp4, ~12 MB.

---

## 실측 타임라인 참고

| t (sec) | Generate 버튼 | 갤러리 최상단 |
|---------|--------------|-------------|
| +0.5 | disabled=true | 기존 유지 |
| +11 | `"GenerateUnlimited"` / **disabled=false** (재활성 [!]) | topKind="unknown" (플레이스홀더) |
| +21~+61 | 활성 유지 | 플레이스홀더 유지 |
| **+71** | 활성 | **새 video-box + production URL 등장** |
