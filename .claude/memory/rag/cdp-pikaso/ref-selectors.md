# 셀렉터 전체 맵 (data-cy)

> **역할**: Freepik Pikaso 전 페이지 data-cy 셀렉터 전수.
> **언제 읽나**: 특정 버튼/입력 셀렉터 찾을 때 (Grep 집중 타겟).
> **관련 파일**: [`ref-dom-attributes.md`](ref-dom-attributes.md) (data-item 등 속성), [`ref-dropdowns.md`](ref-dropdowns.md) (드롭다운 옵션)
> **마지막 실측**: 2026-04-17

---

## 이미지 생성 페이지 (`/ai-image-generator`)

### 폼 핵심
| 요소 | data-cy | 비고 |
|------|---------|------|
| 폼 루트 | `image-generator-form` | |
| 모델 설정 | `model-settings-button` | 클릭 → 모델 드롭다운 |
| TTI 모드 선택 | `tti-mode-selector-v3-trigger` | |
| Reference 영역 루트 | `image-references-input` | 루트 높이가 카드 유무로 변동 |
| Reference Character placeholder | `reference-character-placeholder` | **항상 존재** (빈/등록 양쪽) |
| Reference Add 버튼 | `reference-add-button` | DIV, `data-state="closed\|open"` |
| Reference 등록 카드 | `reference-image-card` | **등록 시만 존재** |
| 카드 프롬프트 편집 | `edit-reference-button` | 카드 내부 |
| 카드 삭제 X | **data-cy 없음** | 카드 내부 첫 번째 `<button>` (우상단) |
| 프롬프트 (contenteditable) | `image-prompt-input` | placeholder: "Reference your images using @img1" |
| 프롬프트 클리어 | `clear-prompt-button` | |
| 프롬프트 enhancement 확장 | `prompt-enhancement-expand-button` | |
| AI prompt 토글 | `smart-prompt-toggle` | 내부 span에 `translate-x-4` = ON |
| Seed 입력 | `image-seed-input` | |
| 이미지 업로드 | `upload-image-button` | |
| 매수 - | `decrease-number-images-button` | |
| 매수 값 | `number-images-value` | `.textContent` |
| 매수 + | `increase-number-images-button` | |
| 비율 | `image-aspect-ratio-input` | BUTTON, 현재값이 textContent |
| 해상도 | `image-resolution-input` | BUTTON, 현재값이 textContent |
| 무제한 | `image-generator-unlimited-mode-toggle` | DIV 래퍼 |
| 무제한 버튼 | `unlimited-mode-toggle-button` | BUTTON 실제 클릭 대상 |
| Generate | `generate-button` | 공통 (영상 탭과 동일) |

## 영상 생성 페이지 (`/ai-video-generator`)

### 영상 전용 (이미지와 data-cy 체계 다름)
| 요소 | data-cy | 비고 |
|------|---------|------|
| 패널 루트 | `video-generator-panel` | |
| 모델 선택 트리거 | `video-model-selector-trigger` | 현재: Kling 2.5 |
| **Start Image 래퍼** | `video-start-frame-input` | DIV, `caneditimage="true"` |
| **모션 프롬프트 (CE)** | `video-prompt-input` | placeholder: "Describe your video" |
| Negative prompt 표시 | `video-show-negative-prompt-button` | |
| 프롬프트 에디터 | `video-prompt-editor-button` | |
| 텍스트 클리어 | `form-textarea-clean-button` | |
| 해상도 | `video-resolution-option` | BUTTON, 현재값 textContent |
| 길이 | `video-duration-option` | BUTTON (`10"` 등 쌍따옴표) |
| 비율 | `video-aspect-ratio-option` | BUTTON, **Kling 2.5에서 disabled** (16:9 고정) |
| Generate | `generate-button` | 공통 |
| 템플릿 저장 | `save-template-button` | |

### Start Image 카드 내부 (호버 시 노출)
| 요소 | data-cy | 비고 |
|------|---------|------|
| X 제거 버튼 | **없음** | 카드 우상단 첫 button |
| Edit 버튼 | **없음** | 하단 중앙, 텍스트 "Edit" — 교체 갤러리 모달 오픈 |

## 갤러리 (양쪽 탭 공통)

```
main-feed-gallery                — 가상 스크롤 루트 (height 25000+)
main-feed-item                   — 공통 아이템 래퍼
image-creation-feed-item         — 이미지 콘텐츠 (main-feed-item 자식)
main-feed-video-item             — 비디오 콘텐츠 (main-feed-item 자식)
feed-virtual-item                — 갤러리 가상 리스트 단위 (Header or Body)
feed-virtual-item-header         — 가상 아이템 헤더
generated-image-group            — 그룹 (Header)
feed-item-prompt                 — 그룹 내 프롬프트 텍스트
feed-item-tags                   — 그룹 내 태그 (예: "16:9")
feed-family-copy-prompt-button   — 프롬프트 복사
feed-family-reuse-prompt-button  — 프롬프트 재사용
select-all-row-button            — 전체 선택
load-more-button                 — 더 불러오기
```

### 갤러리 아이템 호버 오버레이 (공통)
```
thumbnail-checkbox               — 선택 체크 (aria="Select item")
thumbnail-more-button            — ... (aria="More options")
thumbnail-delete-button          — 삭제 (aria="Delete")
thumbnail-download-button        — 다운로드 (aria="Download")
thumbnail-like-button            — 좋아요 (aria="Like")
thumbnail-badge / thumbnail-icon-badge — 뱃지
video-duration-label             — 영상 길이 라벨
```

### 이미지 아이템 전용 호버
```
thumbnail-edit-button            — Edit (aria="Edit")
thumbnail-startframe-button      — Create video (aria="Create video") ⭐
thumbnail-use-button             — Use (텍스트 버튼)
```

### 비디오 아이템 전용 호버
```
edit-video-action                — Edit (aria="Edit")
video-use-popover                — Use (텍스트 버튼)
```

## 이미지 상세 모달 (URL 유지 + ESC 복귀)

```
video-modal-close-button-desktop   — 닫기 X (양쪽 공통, 우상단 [1848,32])
creation-detail-modal-prev-button  — 이전
creation-detail-modal-next-button  — 다음
creation-detail-modal-image-content — 메인 이미지 영역
scroll-to-similar-images           — 유사 이미지
detail-tabs / detail-tabs-option-details / detail-tabs-option-comments
creation-owner-timestamp-link
detail-options-delete-button       — 삭제
detail-like-button / like-button
save-ai-img-button
download-button-export             — 다운로드
detail-prompt / detail-prompt-toggle / detail-copy-prompt-button
use-image-popover-button           — "Use image"
image-detail-modal-edit-button     — "Edit image" (→ 에디터 탭 navigate)
image-detail-modal-create-video-button — "Create video" (→ 영상 탭 navigate, ⚠ 1080 리셋)
image-detail-modal-save-as-button  — "Save as"
share-popover-trigger              — "Share"
reference-img1-button              — @img1 등록된 이미지에서만 노출
```

## Reference Add 모달

### 사이드바 (좌측)
```
reference-sidebar-history         — History (기본 선택)
reference-sidebar-upload          — Uploads
reference-sidebar-favorites       — Favorites
reference-sidebar-stockImages     — Stock (유료)
reference-sidebar-style           — Style (유료)
reference-sidebar-character       — Character (유료)
reference-sidebar-product         — Element (유료)
reference-sidebar-colorPalette    — Color (유료)
reference-sidebar-effects         — Effects (유료)
reference-sidebar-camera          — Camera (유료)
pin-reference-{category}          — 각 유료 카테고리 핀 토글
```

### History 탭 컨텐츠
```
history-folder-selector-button   — 폴더 선택 (기본: Personal project)
history-references-search-input  — 검색 (prodId 검색 불가, 프롬프트 영문 기반)
feed-filter-button               — 필터
feed-image-item-{creationId}     — 이미지 아이템 ⭐ (data-cy에 creation.id 직접 포함)
video-box-{shortIdentifier}      — 비디오 아이템
load-more-button                 — 더 불러오기
```

### Upload 탭
```
advanced-selection-dropzone         — 드롭존
advanced-selection-drop-panel
advanced-selection-upload-button    — Upload media 버튼
advanced-selection-upload-file-input — input[type=file] (`uploadFile()`로 사용)
advanced-selection-webcam-photo-button — 웹캠 촬영
```

### 하단 액션
```
advanced-selection-add-images-button  ⭐ "Add" (등록 확정)
video-modal-close-button-desktop      — 닫기 X
```

### 폴더 드롭다운 옵션
```
history-folder-option-root               — Personal project (전체)
history-folder-option-{uuid}             — 사용자 생성 하위 폴더
```

## 이미지 에디터 (`/image-editor/{uuid1}/{uuid2}`)

### 상단 툴바
```
creation-top-buttons-container
publish-button-container
publish-to-community-button
creation-top-save-button          — Save
creation-top-video-button         — Video (영상 생성 전환)
creation-top-delete-button        — Delete
download-button-export            — Export (다운로드)
```

### 캔버스
```
full-canvas-layout
canvas-footer
zoom-control / zoom-trigger
```

### 편집 도구 (좌측 바)
```
edit-bar-retouch                  — ⭐ Retouch (프롬프트 기반 수정 — 핵심)
retouch-bar-retouch
edit-bar-resize
edit-bar-restyle
edit-bar-background
edit-bar-change-camera            — 카메라 앵글 변경
edit-bar-relight                  — 조명 재설정
edit-bar-upscale
edit-bar-skin-enhancer
edit-bar-adjust
```

## 프로젝트 필터/상단바

```
projects-top-bar
projects-feed-tabs
projects-filter-option-image / -video / -audio
projects-filter-shortcut-all
projects-filter-more-button
projects-favorites-filter-button
projects-filter-button
projects-view-mode-button
projects-search-button
```

## 사이드바 (전역)

```
sidebar-logo
sidebar-toggle-button
sidebar-project-selector
sidebar-home-button
sidebar-search-button
sidebar-stock-button
sidebar-community-button
sidebar-projects-wrapper / sidebar-projects-button
sidebar-all-tools-button
sidebar-pinned-spaces
sidebar-pinned-text-to-image
sidebar-pinned-video-generator
sidebar-pinned-voiceover
sidebar-pinned-tool-assistant
sidebar-academy-button
sidebar-notifications-button
sidebar-more-button
header-current-project-link
header-current-mode-link
user-avatar
registered-tool-ai-image-generator
registered-tool-image-editor
registered-tool-video-generator
registered-tool-{upscaler|image-extender|variations|cinematic-image|assistant|video-editor|video-clip-editor|video-upscaler|video-speak|video-relight|voiceover|voice-cloning|voice-changer|soundfx|music|virtual-scene-generator|image-to-3d|spaces|designer|mockup-generator|icon-generator|background-remover|skin-enhancer|change-camera|relight|sketch}
```

## 드롭다운 공통

```
popover-option                  — 모든 드롭다운 옵션 (이미지/영상 해상도, 비율, 길이, 폴더 등)
```

모델 선택 옵션은 [`ref-dropdowns.md`](ref-dropdowns.md) 참조.
