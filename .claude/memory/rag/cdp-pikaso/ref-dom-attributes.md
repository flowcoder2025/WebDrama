# DOM 속성 + ID 체계 매핑

> **역할**: creation.id / identifier / render prodId 세 가지 ID 체계 구분 + 갤러리 DOM에서 찾는 방법.
> **언제 읽나**: API 응답에서 얻은 id로 DOM 조작 시 / prodId 불일치 혼란 시.
> **관련 파일**: [`ref-api.md`](ref-api.md) (API 응답의 id 위치), [`ref-selectors.md`](ref-selectors.md) (data-cy 참조)
> **마지막 실측**: 2026-04-17

---

## 세 가지 ID 체계 (혼동 주의)

| ID 종류 | 예시 | 위치 | 용도 |
|---------|------|------|------|
| **creation.id** | `2806455855` (정수) | API response `creation.id` / 갤러리 `data-item` 속성 | 갤러리에서 내 것 찾기 |
| **creation.identifier** | `"mCsnxdfhJQ"` (short str) | API response `creation.identifier` / 영상 갤러리 `video-box-{identifier}` | 영상 셀렉터 |
| **render asset prodId** | `3992686399` (정수, **다른 숫자**) | `img.src` URL `/production/{prodId}/render.png` | 다운로드 URL |

### 중요한 교훈
- **creation.id ≠ render asset prodId**: 다른 체계. 같은 이미지의 creation.id는 `2806455855`인데 img src의 prodId는 `3994805066`.
- **Add 모달의 `feed-image-item-{XXX}`의 XXX = creation.id** (또는 공용 creation.id): 실측 중 모달에서 `feed-image-item-2805167874` 클릭하면 실제로는 `3992686399`가 등록됨 — 모달 내 공용 ID ↔ 개인 prodId 매핑 이슈 있음. 등록 결과 검증 필수.

---

## 갤러리 DOM 매핑

### 이미지 아이템 — `image-creation-feed-item`

**data-cy는 고정**, ID는 **속성에 들어감**:
```html
<div id="item-2806455855"
     data-item="2806455855"
     data-cy="image-creation-feed-item"
     class="group/item bg-surface-1 ...">
  <img src="https://pikaso.cdnpk.net/private/production/3994805066/render.png?token=..." />
</div>
```

**내 이미지 찾는 법**:
```js
// creation.id로 직접 찾기
const el = document.querySelector('[data-item="2806455855"]');
// 또는
const el2 = document.getElementById('item-2806455855');

// render prodId 획득 (다운로드용)
const img = el.querySelector('img');
const renderProdId = img.src.match(/production\/(\d+)\//)?.[1];  // 3994805066
const downloadUrl = img.src.replace(/[?&]preview=1/, '');
```

### 비디오 아이템 — `video-box-{identifier}`

**data-cy에 identifier 직접 포함**:
```html
<div data-cy="main-feed-item">
  <div data-cy="video-box-gJnCDl1SXO">
    <video src="https://pikaso.cdnpk.net/private/production/3993934411/{uuid}-0.mp4?token=..." />
  </div>
</div>
```

**내 영상 찾는 법**:
```js
const vb = document.querySelector('[data-cy="video-box-gJnCDl1SXO"]');
const mfi = vb.closest('[data-cy="main-feed-item"]');
const video = mfi.querySelector('video');
const renderProdId = video.src.match(/production\/(\d+)\//)?.[1];
```

---

## Add 모달 DOM 매핑

### Add 모달 내 이미지 — `feed-image-item-{XXX}`

```html
<div data-cy="feed-image-item-2805167874" class="group relative aspect-square ...">
  <img src="https://pikaso.cdnpk.net/private/production/3992686399/render.png?token=..." />
</div>
```

- data-cy의 XXX는 **Freepik 공용 creation.id 또는 세션 공용 ID** (실제 등록 시 내 prodId와 다를 수 있음)
- img src의 prodId는 **실제 render asset**

### Add 모달 내 비디오 — `video-box-{shortId}`

```html
<div data-cy="video-box-8vxRXwMIrU">
  ...
</div>
```

갤러리와 동일 구조.

---

## Reference 등록 카드 — `reference-image-card`

등록 후 카드의 img src:
- **Upload 경로**: `blob:https://www.freepik.com/{uuid}` — prodId 추출 불가
- **History 선택**: `https://pikaso.cdnpk.net/private/production/{renderProdId}/render.png?token=...`

```html
<div data-cy="reference-image-card" data-state="delayed-open">
  <!-- 카드 내 첫 <button> = 우상단 X (삭제) -->
  <button class="... absolute right-1 top-1 ...">
    <svg><use xlink:href="#cdn-cross-medium"/></svg>
  </button>
  <img src="blob:..." />
  <button data-cy="edit-reference-button">Edit</button>
</div>
```

---

## URL 패턴 총정리

| 자원 | URL 패턴 |
|------|---------|
| 이미지 원본 (2K) | `https://pikaso.cdnpk.net/private/production/{renderProdId}/render.png?token=...&hmac=...` (`&preview=1` 제거) |
| 이미지 썸네일 | 위 URL + `&preview=1` → ~71KB 축소본 |
| 업로드 중 미리보기 | `https://pikaso.cdnpk.net/private/production/{newProdId}/conversions/upload-preview.jpg` |
| 영상 원본 (720p 10s) | `https://pikaso.cdnpk.net/private/production/{renderProdId}/{uuid}-0.mp4?token=...` |
| 영상 Start Image 임시 스냅샷 | `https://pikaso.cdnpk.net/tmp/temp-files/video_{internalId}_{uuid}.jpg?token=...` |
| 이미지 에디터 | `https://www.freepik.com/pikaso/image-editor/{uuid1}/{uuid2}` |

### prodId 추출 정규식
```js
const renderProdId = src.match(/\/production\/(\d+)\//)?.[1];
```

### 다운로드 URL 처리
이미지 `&preview=1` 제거 등 다운로드 관련 상세: [`howto-download.md`](howto-download.md) SSOT 참조.

---

## Reference 카드 X 버튼 위치 규칙

`reference-image-card` 호버 시 우상단 노출:
- 좌표: 카드 rect 기준 **right-1 top-1** 절대 위치
- 크기: 24x24 (예: 카드 [179,318,65,65] → X 버튼 [216,322,24,24])
- 선택 방법: `card.querySelector('button')` (카드 내부 첫 번째 button)
- svg use: `#cdn-cross-medium`
