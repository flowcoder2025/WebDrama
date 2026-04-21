# Freepik Pikaso CDP 운영 지식 (범용)

**최종 실측**: 2026-04-17
**범위**: Freepik Pikaso (NanoBanana2 + Kling 2.5 파이프라인) CDP 자동화 범용 지식.
**프로젝트별 조작법**: `projects/{프로젝트명}/OPERATIONS.md` 참조 (단위 액션 스니펫 + 프로젝트 에셋 맵 포함).

---

## 0. 운영 원칙 (동적 UI 대응)

| 원칙 | 근거 |
|------|------|
| **좌표 캐시 금지, 매 액션 전 `getBoundingClientRect()` 재측정** | Ref 등록/프롬프트 입력에 따라 레이아웃 이동 |
| **버튼 텍스트 매칭 금지, `data-cy` 속성만 사용** | 해상도/비율 버튼 텍스트는 "현재 선택값"으로 변함 |
| 드롭다운 열림/닫힘 판별은 `data-state="open"|"closed"` 속성 | 텍스트보다 정확 |
| 모달 탐지는 `[class*="modal" i]` + visible 필터 | `role="dialog"`는 invisible 빈 상자로 존재 |
| `page.close()` / `disconnectBrowser()` 금지 | 사용자 실제 브라우저 파괴 방지 |
| `Page.setDownloadBehavior` 금지 | 브라우저 다운로드 깨짐 |
| 브라우저 내 `fetch` / XHR 직접 다운로드 금지 | CORS 차단 (`Failed to fetch pikaso.cdnpk.net`) |
| 다운로드는 **Node.js `https.get()`** 사용 | pre-signed URL은 인증 없이 접근 가능 |
| 매 액션 후 DOM 상태 명시 검증 | 성공/실패 확정 |
| 프롬프트 `@imgN` 멘션 ↔ Reference 등록 쌍 관리 | dangling 시 Generate disabled |
| 스크립트 파일보다 **`node -e "..."` 직접 실행** 선호 | 상태별 즉시 조정, 휘발 방지 |

---

## 1. 고정 파이프라인 값

| 항목 | 값 | 비고 |
|------|-----|------|
| 이미지 모델 | Google Nano Banana 2 | |
| 이미지 해상도 | 2K (2752×1536) | 무료 무제한 |
| 이미지 비율 | 프로젝트별 결정 (영상용은 16:9) | |
| AI prompt 토글 | OFF | creative 프롬프트 변형 방지 |
| 영상 모델 | **Kling 2.5** | **유일한 Unlimited 모델** |
| 영상 해상도 | 720 (720p) | **1080p는 유료** (약 650 크레딧) |
| 영상 길이 | 10" 또는 5" | Start Image가 대응하는 길이와 일치해야 Generate 활성 |
| 영상 비율 | **Kling 2.5에서 16:9 고정** (비율 버튼 `disabled`) | |
| 동시 생성 | 1장씩 | 결과 확인 후 다음 |

### Unlimited 조건 (Kling 2.5)
- `720 + 10" + 16:9` 조합만 `"GenerateUnlimited"` + enabled
- 그 외 조합은 **계정 차원에서 Generate `disabled`** — 유료 실수 불가
- **단, 이미지→비디오 전환 시 기본값이 1080p로 리셋되면서 Generate enabled로 남는 버그 존재** → `normalizeVideoTab()` 필수 (OPERATIONS.md 참조)

---

## 2. CDP 연결

```js
const puppeteer = require('puppeteer');
const browser = await puppeteer.connect({
  browserURL: 'http://localhost:9222',
  defaultViewport: null,      // 필수. 미지정 시 puppeteer가 800x600 강제
  protocolTimeout: 30000      // 장시간 영상 생성 고려
});
```

- 실제 window 크기: 1920×1032 (사용자 전체화면)
- `setViewport()` 호출 금지 — 사용자 브라우저에 영향
- 페이지 식별: `url().includes('ai-image-generator')` / `includes('ai-video-generator')` / `includes('image-editor')`

---

## 3. data-cy 맵 (범용 핵심)

### 이미지 생성 페이지
```
image-generator-form
model-settings-button
image-references-input           — Reference 영역 루트
reference-character-placeholder  — 빈 슬롯 (항상 존재)
reference-add-button             — Add 버튼 (DIV, data-state 속성)
reference-image-card             — 등록된 카드 (등록 시만)
edit-reference-button            — 카드 프롬프트 편집
image-prompt-input               — contenteditable
smart-prompt-toggle              — AI prompt (내부 span에 translate-x-4 = ON)
clear-prompt-button
prompt-enhancement-expand-button
image-seed-input
upload-image-button
image-number-of-images-input
decrease-number-images-button / number-images-value / increase-number-images-button
image-aspect-ratio-input         — BUTTON (data-state=closed/open)
image-resolution-input           — BUTTON
image-generator-unlimited-mode-toggle / unlimited-mode-toggle-button
generate-button
tti-mode-selector-v3-trigger
```

### 영상 생성 페이지
```
video-generator-panel
video-model-selector-trigger     — Kling 2.5 선택 중
video-start-frame-input          — Start Image 래퍼 DIV (caneditimage="true")
video-prompt-input               — contenteditable 모션 프롬프트
video-show-negative-prompt-button
video-prompt-editor-button
form-textarea-clean-button
video-resolution-option          — BUTTON (현재값이 textContent)
video-duration-option            — BUTTON
video-aspect-ratio-option        — BUTTON (Kling 2.5에서 disabled)
generate-button
save-template-button
```

### 갤러리 (양쪽 탭 공통)
```
main-feed-gallery                — 가상 스크롤 루트 (height 25000+)
main-feed-item                   — 공통 아이템 래퍼
image-creation-feed-item         — 이미지 콘텐츠 (main-feed-item 자식)
main-feed-video-item             — 비디오 콘텐츠 (main-feed-item 자식)
feed-virtual-item / -header
generated-image-group
feed-item-prompt
feed-family-copy-prompt-button
feed-family-reuse-prompt-button
feed-item-tags
select-all-row-button
thumbnail-checkbox               — 선택
thumbnail-more-button            — ...
thumbnail-delete-button
thumbnail-download-button
thumbnail-like-button
thumbnail-edit-button            — 이미지 전용
thumbnail-startframe-button      — 이미지 전용: "Create video"
thumbnail-use-button             — 이미지 전용: "Use"
edit-video-action                — 비디오 전용
video-use-popover                — 비디오 전용
load-more-button
```

### 프로젝트 필터/상단바
```
projects-top-bar
projects-filter-option-image / -video / -audio
projects-filter-shortcut-all
projects-filter-more-button
projects-favorites-filter-button
projects-view-mode-button
projects-search-button
```

### 이미지 상세 모달 (URL 유지, ESC로 닫힘)
```
video-modal-close-button-desktop
creation-detail-modal-prev-button / -next-button
creation-detail-modal-image-content
detail-tabs / -option-details / -option-comments
detail-prompt / detail-prompt-toggle / detail-copy-prompt-button
download-button-export
save-ai-img-button
scroll-to-similar-images
use-image-popover-button            — "Use image"
image-detail-modal-edit-button      — "Edit image"
image-detail-modal-create-video-button  — "Create video"
image-detail-modal-save-as-button   — "Save as"
share-popover-trigger               — "Share"
reference-img1-button               — @img1 등록된 이미지에서만 노출
```

### Reference Add 모달
```
video-modal-close-button-desktop
reference-sidebar-history           — 기본
reference-sidebar-upload
reference-sidebar-favorites
reference-sidebar-stockImages / -style / -character / -product / -colorPalette / -effects / -camera (유료)
pin-reference-{category}            — 각 유료 카테고리 핀
feed-image-item-{prodId}            — 이미지 (prodId 직접 포함!)
video-box-{shortId}                 — 비디오
history-folder-selector-button
history-references-search-input
feed-filter-button
load-more-button
advanced-selection-dropzone / -drop-panel / -upload-button / -upload-file-input / -webcam-photo-button
advanced-selection-add-images-button  — ⭐ "Add" 확정 등록
```

### 이미지 에디터 (별도 URL: `/image-editor/{uuid1}/{uuid2}`)
- ⚠ 별도 탭 아니라 **같은 탭에서 URL navigate** → `page.goBack()`으로 복귀
```
creation-top-save-button
creation-top-video-button           — 이 이미지로 영상 생성 전환
creation-top-delete-button
download-button-export              — Export (다운로드)
publish-to-community-button
publish-button-container
full-canvas-layout
canvas-footer
zoom-control / zoom-trigger
edit-bar-retouch                    — 프롬프트 기반 수정 (핵심)
retouch-bar-retouch
edit-bar-resize
edit-bar-restyle
edit-bar-background
edit-bar-change-camera              — 카메라 앵글 변경
edit-bar-relight                    — 조명 재설정
edit-bar-upscale
edit-bar-skin-enhancer
edit-bar-adjust
```

### 공통 드롭다운
```
popover-option                      — 모든 드롭다운 옵션 (텍스트로 필터)
ai-model-item-slim-{auto-mode|multi-model|kling-25|kling-30|kling-omni3|bytedance-seedance-pro-2.0|bytedance-seedance-fast-2.0}
ai-model-selector-show-all-button   — All models
```

### 사이드바
```
sidebar-toggle-button
sidebar-project-selector
sidebar-search-button
sidebar-pinned-text-to-image
sidebar-pinned-video-generator
sidebar-pinned-voiceover
sidebar-pinned-tool-assistant
sidebar-academy-button
sidebar-notifications-button
sidebar-more-button
registered-tool-ai-image-generator
registered-tool-video-generator
registered-tool-image-editor
registered-tool-{upscaler|image-extender|variations|cinematic-image|assistant|video-editor|video-clip-editor|video-upscaler|video-speak|video-relight|voiceover|voice-cloning|voice-changer|soundfx|music|virtual-scene-generator|image-to-3d|spaces|designer|mockup-generator|icon-generator|background-remover|skin-enhancer|change-camera|relight|sketch}
```

---

## 4. 드롭다운 옵션 매핑

### 이미지 해상도 드롭다운
옵션 텍스트: `1K~20s`, `2K~35s`, `4K~1m 17s` (생성시간 포함)
- 정규식 매칭: `/^1K/` / `/^2K/` / `/^4K/`

### 이미지 비율 드롭다운 (옵션 12개)
```
autoAuto
1:1 Square
21:9 Ultrawide
8:1 Panoramic
4:1 Banner
16:9 Widescreen
9:16 Social story
1:4 Vertical banner
1:8 Vertical panoramic
4:3 Classic
4:5 Social post
5:4 Landscape
```
- 정규식 매칭: `/^16:9/`, `/^9:16/` 등 비율 접두어
- 텍스트 형식: `비율` + `이름` 합쳐짐

### 영상 해상도 드롭다운 (순서 중요!)
```
1080p   ← 유료 (첫 번째 — 실수 클릭 위험)
720p    ← Unlimited 대상 (두 번째)
```
- **반드시 정규식 `/^720/` 매칭 후 클릭**

### 영상 길이 드롭다운
```
5"      — 쌍따옴표 포함
10"
```
- 정규식: `/^5/` / `/^10/` 사용 (쌍따옴표 이스케이프 불필요)

### 영상 모델 드롭다운 (Kling 2.5 외 전부 유료)
| 옵션 텍스트 | data-cy | 크레딧 |
|-------------|---------|--------|
| Auto | `ai-model-item-slim-auto-mode` | 100-2800 |
| Multiple | `ai-model-item-slim-multi-model` | 4개 조합 |
| All models | `ai-model-selector-show-all-button` | 목록 확장 |
| Seedance 2.0 | `ai-model-item-slim-bytedance-seedance-pro-2.0` | 550-6500 |
| Seedance 2.0 Fast | `ai-model-item-slim-bytedance-seedance-fast-2.0` | 450-5000 |
| Kling 3.0 Omni | `ai-model-item-slim-kling-omni3` | 210-1725 |
| **Kling 2.5** | **`ai-model-item-slim-kling-25`** | **Unlimited** |
| Kling 3.0 | `ai-model-item-slim-kling-30` | 210-2400 |

---

## 5. 생성 플로우 실측 (Kling 2.5 / 720 / 10")

### 타임라인 (실측 71초)
| t (sec) | Generate 버튼 | 갤러리 최상단 |
|---------|--------------|-------------|
| +0.5 | text="" / disabled=true | 기존 유지 |
| +11 | text="GenerateUnlimited" / disabled=false (재활성 ⚠) | `topKind="unknown"` (플레이스홀더) |
| +21~+61 | 활성 유지 | 플레이스홀더 유지 |
| **+71** | 활성 | **새 video-box + production URL 등장** |

### 완료 감지 (기준선 비교)
```js
// 기준선
const baseline = document.querySelector('[data-cy="main-feed-item"] [data-cy^="video-box-"]')?.getAttribute('data-cy')?.replace('video-box-','');
// 폴링 조건
const now = document.querySelector('[data-cy="main-feed-item"] [data-cy^="video-box-"]')?.getAttribute('data-cy')?.replace('video-box-','');
const vidSrc = document.querySelector('[data-cy="main-feed-item"] video')?.src || '';
const done = now && now !== baseline && /\/production\/\d+\//.test(vidSrc);
```

### 중복 클릭 방지
Generate 버튼이 11초 후 재활성화됨. **갤러리 최상단이 `topKind="unknown"` (플레이스홀더 생성 상태) = 생성 중** → 재클릭 금지.

### 이미지 생성 시간 (2K, NanoBanana2)
옵션 텍스트에 표시됨: `2K~35s` (실측 환경에서는 ~30~50초 범위 관찰).

### 파일 크기
- 720p / 10s / 16:9 영상 ≈ **12MB**
- 2K / 16:9 이미지 ≈ **5~8MB**

---

## 6. 다운로드

### ❌ 브라우저 fetch / XHR
```
TypeError: Failed to fetch (pikaso.cdnpk.net)
```
CORS 차단. `page.evaluate(() => fetch(url))` 방식 사용 금지.

### ✅ Node.js `https.get()` (확정 방식)
```js
const https = require('https');
const fs = require('fs');
await new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode !== 200) { reject(new Error('status=' + res.statusCode)); return; }
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
      fs.writeFileSync(outPath, Buffer.concat(chunks));
      resolve();
    });
  }).on('error', reject);
});
```
- pre-signed URL이라 쿠키/인증 불요
- **이미지의 경우 URL에서 `&preview=1` 제거**해야 2K 원본

### URL 패턴
| 콘텐츠 | URL |
|--------|-----|
| 이미지 원본 | `https://pikaso.cdnpk.net/private/production/{prodId}/render.png?token=...&hmac=...` (`&preview=1` 제거) |
| 이미지 썸네일 | 위 URL + `&preview=1` → 800x447 |
| 영상 | `https://pikaso.cdnpk.net/private/production/{prodId}/{uuid}-0.mp4?token=...&hmac=...` |
| 영상 임시 스냅샷 | `https://pikaso.cdnpk.net/tmp/temp-files/video_{internalId}_{uuid}.jpg?...` |

---

## 7. 모달/팝오버 탐지

### Reference Add 모달 (class 기반)
```js
const modals = [...document.querySelectorAll('[class*="modal" i]')]
  .filter(d => d.getBoundingClientRect().width > 300);
```
- `role="dialog"`는 invisible (rect=0,0,0,0). **match 조건으로 사용 금지**.

### Radix 팝오버 (드롭다운)
```js
const panels = [...document.querySelectorAll('[role="menu"], [role="listbox"], [data-radix-menu-content], [data-radix-popper-content-wrapper]')]
  .filter(el => el.getBoundingClientRect().height > 0);
```
- 중복 감지 (ancestor + descendant 동시 매칭) 주의 → innermost 필터 또는 첫 번째만 사용

### ESC 키로 닫힘 (비파괴 복구)
- 모든 모달/드롭다운 ESC 키로 닫힘 확인됨

---

## 8. 페이지 네비게이션 동작

### 이미지 탭 → 이미지 에디터
- `image-detail-modal-edit-button` 클릭 시 **같은 탭에서 URL 이동** (새 탭 아님)
- URL: `/image-editor/{uuid1}/{uuid2}`
- 복귀: `page.goBack()` (2단계 뒤로 가야 함 — edit editor → detail → image-generator)
  또는 `page.goto('.../ai-image-generator')`로 직접

### 이미지 탭 → 영상 탭 (Create video)
- `image-detail-modal-create-video-button` 클릭 시 **같은 탭에서 URL 이동**
- **⚠ 기본값 리셋 발생**: 해상도 1080 / 프롬프트 비움 / Generate=Generate650 enabled
- **반드시 `normalizeVideoTab()` 실행** (상세: OPERATIONS.md I 스니펫)
- 복귀: `page.goto('.../ai-image-generator')`

### 갤러리 썸네일 → 이미지 상세 (모달)
- URL 유지, SPA 모달 오픈
- ESC로 닫힘 (비파괴)

---

## 8.5 멀티 세션 안전 식별 (API 가로채기) — 실측 확정

**문제**: 다른 탭/창에서 동시에 이미지/영상 생성 시, "갤러리 최상단 prodId 변화" 폴링은 오판 위험. baseline set diff도 프롬프트 중복 시 불안정.

**해결**: Puppeteer `page.on('response', ...)` 로 Freepik 내부 API 응답 가로채기 → `creation.id` 직접 추출.

### 이미지 생성 API (실측)
두 엔드포인트 연속 호출:
```
1. POST https://www.freepik.com/pikaso/api/start-tti-v2?lang=en_US&user_id={uid}
   request body: { mode, prompt, references, num_images, aspect_ratio, ... }
   response: {
     "family": "a19081f7-...",      ← 세션 UUID
     "request_tokens": ["M3gRFNiDje9M", ...]  (24개)
   }

2. POST https://pikaso-data.freepik.com/pikaso/api/render/v4?lang=en_US&user_id={uid}
   request body: { prompt, family, request_token, seed, mode, ... }
   response: {
     "creation": {
       "id": 2806455855,              ← creation.id (정수, 갤러리의 data-item 속성)
       "identifier": "mCsnxdfhJQ",
       "family": "a19081f7-...",
       "metadata": { "inputPrompt": ..., "seed": ..., ... }
     }
   }
```

**식별 로직**:
1. `start-tti-v2` response → `family` 포착 (내 세션)
2. `render/v4` response → `body.creation.family === myFamily` 매칭 → `creation.id` 추출
3. 갤러리 DOM: `document.querySelector('[data-item="' + creationId + '"]')` 로 내 이미지 element 찾기
4. `img.src`에서 render asset URL 획득 → `&preview=1` 제거 → Node https.get 다운로드

### 영상 생성 API (실측)
단일 엔드포인트로 끝:
```
POST https://www.freepik.com/pikaso/api/video/generate?return_creations=true&lang=en_US&user_id={uid}
  request body: { video: { family, clips: [{ prompt, duration, model, mode, resolution, keyframes, ... }] } }
  response: {
    "success": true,
    "data": {
      "creations": [{
        "id": 2806497203,
        "identifier": "gJnCDl1SXO",   ← 갤러리 video-box-{identifier}와 일치
        "family": "290e48b6-...",
        "metadata": {
          "expectedGenerationTime": 71,  ← 실측 일치
          "unlimited": true,
          "resolution": "720p",
          "status": "processing",
          ...
        }
      }]
    }
  }
```

**식별 로직**:
1. `video/generate` response → `data.creations[0].identifier` 추출
2. 갤러리 DOM: `document.querySelector('[data-cy="video-box-' + identifier + '"]')` 로 찾기
3. 부모 `main-feed-item` 내 `<video>`의 src에서 prodId → Node https.get 다운로드

### DOM 속성 vs data-cy 매핑 (실측)
| 위치 | 셀렉터 | ID 체계 |
|------|--------|--------|
| Add 모달 이미지 | `[data-cy="feed-image-item-{creationId}"]` | creation.id (숫자) |
| Add 모달 비디오 | `[data-cy="video-box-{identifier}"]` | creation.identifier (short str) |
| **일반 갤러리 이미지** | `[data-cy="image-creation-feed-item"]` + `[data-item="{creationId}"]` + `id="item-{creationId}"` | **속성에 creation.id** |
| **일반 갤러리 비디오** | `main-feed-item` 자식 `[data-cy="video-box-{identifier}"]` | **data-cy에 identifier** |
| img src prodId | `/production/{renderAssetId}/render.png` | render asset ID (creation.id와 **다른 체계**) |

### 🎯 결론
**API 가로채기 + creation.id 직접 추출**이 유일한 확실한 멀티 세션 안전 방법. 프롬프트 매칭은 `contenteditable.textContent`에 **placeholder 텍스트가 섞여 들어가는 문제**로 exact 매칭 불안정.

---

## 9. NanoBanana2 프롬프트 원칙

1. **자연어 문장형** (키워드 나열 금지 — Google Cloud 공식 권장)
2. Negative: `"This is a real photograph only, not an illustration..."` 문장형
3. 소재/질감 구체화: `merino-knit`, `pebbled-leather`, `brushed metal`, `sodium-vapor streetlight`
4. 핵심 지시는 앞쪽에 (모델이 앞쪽 토큰 가중치 높음)
5. Reference 있을 때: 전체 재묘사 금지, `"The exact same X as the reference"` + 변경점만 짧게
6. 캐릭터 Reference 시: **얼굴 + 핵심 의상 동시 언급** (`"The same woman as the reference, maintaining her exact facial features, face shape, hairstyle, and appearance, wearing her {의상 키워드}"`)
7. 인서트 컷(사물/배경만): 캐릭터 ref 없이 텍스트만 — 캐릭터 침입 회피
8. 멘션 배치는 문장 안에 분산 (`"@img1 배경 묘사 ... @img2 인물 묘사"`)
9. AI가 자연 처리하는 효과(유리 반사, 이중노출)는 **상세 묘사하지 말고 상황만 설정** — 과한 지시는 부자연 결과 초래
10. 프롬프트 길이 ~2000자 이내 권장

---

## 10. Kling 2.5 모션 프롬프트 원칙

1. **Start Image = 최종 자세에 가까운 정적 상태**. 큰 동작 제어 불가 (Start Frame만 있고 End Frame 주입 불가)
2. **10초 이내 물리적 가능한 미세 변화만** 서술: 눈 깜빡임, 입술 떨림, 손가락 말림, 미약한 끄덕임
3. 카메라 기본 `static camera`. 무브 필요 시 `slow push-in` 등 명시
4. 복합 액션 금지 — 한 번의 동작만
5. **같은 공간 연속 컷은 Start Image 자세 고정 + 카메라 프레이밍만 변경**으로 설계
6. 립싱크 포기 — 대사는 나레이션. 얼굴은 감정만
7. 실내/실외 물리 구분 엄격 (실내에 바람/꽃잎 날림 금지 등)
8. 비 오는 실외에서 가능: 빗방울 유리 흐름, 머리/옷 미세 흔들림, 가로등 반사 움직임

---

## 11. 실패 패턴 + 복구 (누적)

### Generate disabled
- **dangling 멘션**: 프롬프트 `@imgN`이 Reference에 없음 → ref 등록 또는 멘션 제거
- **프롬프트 비움**: 입력 필요
- **비 Unlimited 조합**: Normalize 실행
- **일시 disabled**: 설정 변경 직후 (다른 설정 한 번 더 토글로 해결)

### 이미지→비디오 전환 시 설정 리셋
- 매번 해상도 1080p 리셋 (실측 4회 연속 재현)
- 사용자 제보: 간헐적으로 Auto 모델 / Kling 3.0 고정 케이스도 발생 (랜덤)
- **해결**: 전환 직후 무조건 `normalizeVideoTab()` 실행 (OPERATIONS.md I 스니펫)

### 재생성 시 얼굴 정체성 손상
- "IGNORE @img2" 등 강한 negative 지시 시 얼굴까지 무시
- 해결: `"maintaining her exact facial features, face shape, hairstyle"` 강하게 유지 + 변경점 짧게

### 조명 통합 실패
- Reference 배경의 스튜디오 라이트가 야외 씬에 적용
- 해결: `"no studio lighting, match the reference's outdoor amber streetlight only"` 명시

### 갤러리 이미지 클릭 시 상세 모달 미오픈
- 특정 이미지(원인 미상)는 클릭해도 상세가 안 열림
- 해결: 해당 이미지 스킵하고 다른 아이템 사용

### 모달 내 이미지 선택과 실제 등록 prodId 불일치 (재현 실측 완료)
- `feed-image-item-{XXX}`의 XXX는 Freepik 공용/세션 내부 ID
- 실제 등록 후 `reference-image-card` img src에는 **다른 prodId** (내 프로젝트 실제 prodId) 들어감
- 예: 모달 클릭 `feed-image-item-2805167874` → 등록된 건 `production/3992686399/`
- **추정**: `history-folder-selector-button` 기본값이 전체/공용. Personal project 선택하면 내 prodId로 직접 접근 가능할 것
- **해결**: (1) 순서 기반 선택 (2) 등록 직후 카드 img src에서 prodId 추출 → 의도 검증 (3) 불일치 시 삭제 후 재시도

### Reference 다중 선택 동작 (실측 확정)
- **Shift/Ctrl 없이 그냥 클릭으로 누적 선택**
- 선택 표시: CSS class에 **`outline-primary-0 outline-3 outline`** 추가 (aria/data 속성은 사용 안 함)
- N개 선택 후 `advanced-selection-add-images-button` 1번 클릭 → **@img1, @img2, ..., @imgN 순차 부여**
- 선택 개수 체크: `[...modal.querySelectorAll('[data-cy^="feed-image-item-"]')].filter(it => /outline-primary-0/.test(it.className)).length`

### Reference @imgN 번호 관리 (실측 확정)
- DOM 순서대로 @img1, @img2 부여
- **중간 삭제 시 번호 재부여 안 됨** — @img1+@img2 상태에서 @img1 삭제 → 남은 카드는 여전히 @img2 (라벨 유지, UI 위치만 left-align 이동)
- **재등록 시 빈 번호 부활 안 함, 새 번호로 증분** (@img1 + @img3 상태에서 새로 등록 → @img4로 붙음)
- 프롬프트 `@img1` 멘션이 dangling 되어 Generate disabled 유발 가능
- **실용 해결**: 중간 삭제 대신 **전체 삭제 후 원하는 순서로 재등록**

### Reference 선택 해제 (실측 확정)
- 모달에서 이미 선택된 이미지 **재클릭 = 해제** (독립 토글)
- 여러 개 선택 중 특정 하나만 해제 가능, 다른 선택은 유지

### 업로드 탭 — 로컬 이미지 직접 주입 (갤러리 스크롤 대안)
갤러리에서 옛날 이미지를 스크롤로 찾지 않고, **로컬 파일 업로드로 즉시 Reference 등록**:
```js
// 1. Add 모달 → Upload 탭 클릭
const upBtn = await pg.$('[data-cy="reference-sidebar-upload"]');
await upBtn.click();

// 2. Puppeteer uploadFile
const fileInput = await pg.$('[data-cy="advanced-selection-upload-file-input"]');
await fileInput.uploadFile('/path/to/image.png');
await sleep(3500);  // 업로드 처리 대기

// 3. Add 버튼 클릭 → Reference 등록
await (await pg.$('[data-cy="advanced-selection-add-images-button"]')).click();
```
- 지원 포맷: `image/jpeg, image/png, image/webp, image/heic, image/heif`
- `multiple=true` (여러 파일 동시 가능)
- 업로드 시점마다 **새 prodId 할당** — URL: `/production/{new}/conversions/upload-preview.jpg`
- 업로드 이력은 Upload 탭 갤러리에 보존됨
- **Reference 카드 src = `blob:https://www.freepik.com/...`** — prodId 추출 어려움. 업로드 중 포착한 prodId 기록 권장

### 검색 기능 (실측 제한)
- `history-references-search-input` — placeholder "Search creations", `type="search"`
- **prodId로 검색 불가** (예: "3950716111" → 0개 결과)
- **한글 키워드 검색 불가** (프롬프트가 영문이면 매칭 안 됨)
- 아마 **프롬프트 영문 텍스트 기반** 검색
- 실용: 특정 prodId 접근은 search보다 **업로드 탭 uploadFile** 또는 **폴더 필터링** 권장

### 폴더 선택 드롭다운 (`history-folder-selector-button`)
| data-cy | 설명 |
|---------|------|
| `history-folder-option-root` | Personal project (기본, 전체) |
| `history-folder-option-{uuid}` | 사용자가 만든 하위 폴더 (UUID 기반) |

### 이미지 필터 토글 풀림
- 이미지 필터를 한 번 클릭 후 다시 클릭하면 OFF될 수 있음 (토글 동작)
- 해결: `projects-filter-shortcut-all` 클릭 후 다시 `projects-filter-option-image` 클릭

---

## 12. 프로젝트별 운영 가이드

각 프로젝트에 `projects/{프로젝트명}/OPERATIONS.md` 생성 권장. 포함 내용:
1. 환경 고정값
2. 캐릭터/배경 production ID 맵
3. 클립 구조 + 알려진 재생성 포인트
4. 단위 액션 SOP (node -e 스니펫 복붙 가능)
5. 프로젝트 고유 학습 (특정 컷 실패 패턴 등)

---

## 부록: 실측 스크래치 (2026-04-17 세션)

- 이미지 페이지 전체 data-cy 40+개 확인
- 영상 페이지 data-cy 15+개 확인
- 해상도/비율 드롭다운 옵션 전수
- 이미지→비디오 전환 4 케이스 모두 동일 결과 (1080 리셋 + Generate650 enabled)
- Normalize 루틴 검증 완료 (`res→720` 1 step으로 "GenerateUnlimited" 복귀)
- Reference Add 모달 구조 및 등록/삭제 플로우 확정
- 영상 실제 생성 71초, 파일 12MB 확인
- Node.js `https.get()` 다운로드 성공 (CORS 우회)

상세 raw 덤프: 각 프로젝트 `.ops-measurements.md`
