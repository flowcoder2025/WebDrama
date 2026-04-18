# Freepik API 엔드포인트 + 응답 구조

> **역할**: 이미지/영상 생성 API 요청/응답 구조 — 멀티 세션 안전 식별의 근거.
> **언제 읽나**: API 가로채기 구현 시 / 응답 파싱 필요 시 / creation.id 추출 시.
> **관련 파일**: [`howto-generate-image.md`](howto-generate-image.md), [`howto-generate-video.md`](howto-generate-video.md), [`ref-dom-attributes.md`](ref-dom-attributes.md) (creation.id ↔ DOM 매핑)
> **마지막 실측**: 2026-04-17

---

## 왜 API 가로채기가 필요한가

"갤러리 최상단 prodId 비교" 폴링은 **다른 탭/창에서 동시 생성 시 오판**. 여러 창이 거의 동시 완료되면 최상단이 내 것인지 남의 것인지 구분 불가.

**해결**: Puppeteer `page.on('response', ...)` 로 Freepik 내부 API 응답 가로채 → `creation.id` 직접 추출. 멀티 세션 안전.

---

## 이미지 생성 API (2엔드포인트 연속)

### 1. POST `/pikaso/api/start-tti-v2`
```
URL: https://www.freepik.com/pikaso/api/start-tti-v2?lang=en_US&user_id={uid}
Method: POST
Content-Type: application/json
```

**Request body**:
```json
{
  "mode": "imagen-nano-banana-2-flash",
  "prompt": "...",
  "references": [
    {"image": "creation:{shortId}", "type": "reference", "category": "image", "label": "img1"}
  ],
  "num_images": 1,
  "aspect_ratio": "16:9",
  "color_palette": null,
  "color_palette_id": null,
  "variations": false,
  "force_credits": false
}
```

**Response** (200):
```json
{
  "sexual": false,
  "minors": false,
  "family": "a19081f7-7326-4a56-baf1-1c79e7073423",   // ← 세션 UUID
  "available_slots": 24,
  "limit": 24,
  "request_tokens": ["M3gRFNiDje9M", "6Ygtsa7EBuzM", ...],   // 24개 슬롯
  "force_credits": false
}
```

### 2. POST `/pikaso-data.freepik.com/pikaso/api/render/v4`
```
URL: https://pikaso-data.freepik.com/pikaso/api/render/v4?lang=en_US&user_id={uid}
Method: POST  (OPTIONS 선행)
```

**Request body**:
```json
{
  "tool": "text-to-image",
  "mode": "imagen-nano-banana-2-flash",
  "family": "a19081f7-...",            // start-tti-v2 response의 family
  "prompt": "...",
  "negative_prompt": null,
  "width": 2688,                        // 16:9 2K = 2688×1536
  "height": 1536,
  "seed": 201328,
  "aspect_ratio": "16:9",
  "resolution": "2k",
  "thinking_level": "minimal",
  "image_references": [{"image": "creation:...", "type": "reference", "category": "image", "label": "img1"}],
  "request_token": "M3gRFNiDje9M",     // 24개 중 하나
  "force_credits": false,
  "metadata": { "inputPrompt": "...", "aspectRatio": "16:9", "unlimited": true, "smartPrompt": false, ... },
  "smart_prompt": false,
  "image_index": 0
}
```

**Response** (200):
```json
{
  "creation": {
    "id": 2806455855,              // ⭐ creation.id — 갤러리의 data-item 속성과 동일
    "identifier": "mCsnxdfhJQ",    // short identifier
    "family": "a19081f7-...",
    "tool": "text-to-image",
    "metadata": {
      "inputPrompt": "...",
      "seed": "201328",
      "index": 0,
      "width": 2688,
      "height": 1536,
      "tags": ["16:9", "imagen-nano-banana-2-flash", "thinking-minimal"],
      "imageReferences": [...],
      "transactionId": "4da5d4aa-...",
      "expectTime": 43,
      "resolution": "2k",
      "queue_priority": 3
    }
  }
}
```

### 3. POST `/pikaso/api/v2/ai/simulate-generation` (부수)
크레딧 비용 산정 — 관찰 목적에만 유용:
```json
{
  "items": [{"index":0, "model":"imagen-nano-banana-2-flash", "quantity":1, "costPerImage":75, "unitCost":75, "subtotal":75, "isUnlimited":true}],
  "total": {"credits":0, "hasUnlimited":true, "remaining":99, "realCost":75}
}
```

---

## 영상 생성 API (단일 엔드포인트)

### POST `/pikaso/api/video/generate?return_creations=true`
```
URL: https://www.freepik.com/pikaso/api/video/generate?return_creations=true&lang=en_US&user_id={uid}
Method: POST
```

**Request body**:
```json
{
  "video": {
    "family": "290e48b6-abdc-4113-8a74-37d470836ad8",
    "clips": [{
      "position": 0,
      "prompt": "...",
      "negativePrompt": "",
      "name": "...",
      "family": "290e48b6-...",
      "aspectRatio": "16:9",
      "cameraMotion": "",
      "duration": 10,
      "api": "kling",
      "model": "kling",
      "mode": "25",                  // Kling 2.5
      "slug": "kling-25",
      "extraParameters": {"style": "default"},
      "withSoundEffects": false,
      "promptType": "basic",
      "resolution": "720p",
      "keyframes": {
        "start": {"type": "image", "url": "https://pikaso.cdnpk.net/private/production/{prodId}/render.png?token=..."}
      },
      "audioUrl": "",
      "voices": [],
      "boardUuid": null,
      "videoPreset": "custom"
    }]
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Video generation started successfully",
  "data": {
    "creations": [{
      "id": 2806497203,                // creation.id (숫자)
      "identifier": "gJnCDl1SXO",      // ⭐ 갤러리의 video-box-{identifier}와 일치
      "family": "290e48b6-...",
      "tool": "video-generator",
      "metadata": {
        "position": 0,
        "prompt": "...",
        "family": "290e48b6-...",
        "aspectRatio": "16:9",
        "duration": 10,
        "api": "kling",
        "model": "kling",
        "mode": "25",
        "slug": "kling-25",
        "resolution": "720p",
        "keyframes": { "start": { "type": "image", "url": "..." } },
        "userId": 180525700,
        "iqsDelay": 150,
        "multiplier": 10,
        "featureName": "pikaso-video-ai_video_generator-kling_2_5_std",
        "transactionId": "052aaebe-...",
        "expectedGenerationTime": 71,  // ⭐ 예상 생성 시간 (초) — 실측과 근접
        "expectedQueuedTime": 3,
        "expectedGenerationTimeParameterized": 74,
        "expectedQueuedTimeParameterized": 5,
        "rollbackCredits": { "credits": 10, "transactionId": "...", "userId": "180525700", "tool": "video-generator" },
        "unlimited": true,              // ⭐ Unlimited 여부
        "clientType": "magnific",
        "status": "processing",         // queued → processing → completed
        "tags": ["Kling 2.5", "10 sec", "16:9", "start frame", "resolution:720p"],
        "request_id": "ak-..."
      },
      "created_at": "2026-04-17T10:10:10.000000Z",
      "date_for_humans": "0 seconds ago",
      "persisted": true,
      "status": "queued"
    }]
  }
}
```

---

## 식별 로직 (멀티 세션 안전)

### 이미지 (두 단계 매칭)
```js
let myFamily = null;
let myCreationId = null;

page.on('response', async (res) => {
  const u = res.url();
  if (/start-tti-v2/.test(u) && res.status() === 200) {
    try {
      const body = JSON.parse(await res.text());
      myFamily = body.family;                // 내 세션 family 포착
    } catch(e) {}
  }
  if (/render\/v4/.test(u) && res.status() === 200) {
    try {
      const body = JSON.parse(await res.text());
      if (body.creation?.family === myFamily) {
        myCreationId = body.creation.id;     // family 매칭된 creation만
      }
    } catch(e) {}
  }
});
```

### 영상 (단일 응답)
```js
let myCreationId = null;
let myIdentifier = null;
let expectedSec = 90;

page.on('response', async (res) => {
  if (!/video\/generate/.test(res.url()) || res.status() !== 200) return;
  try {
    const body = JSON.parse(await res.text());
    const creation = body?.data?.creations?.[0];
    if (creation) {
      myCreationId = creation.id;
      myIdentifier = creation.identifier;
      if (creation.metadata?.expectedGenerationTime) {
        expectedSec = creation.metadata.expectedGenerationTime + 30;
      }
    }
  } catch(e) {}
});
```

---

## Analytics (무시할 요청)

실측 시 섞여 나오는 무관 요청들 (필터링):
```
https://www.google.com/measurement/conversion?...
https://analytics.google.com/g/collect?...
```

필터 regex: `/pikaso|freepik\.com\/(api|generate|pikaso)|graphql/i` + `!/analytics|google/`
