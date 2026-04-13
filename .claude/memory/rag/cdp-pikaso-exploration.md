# Freepik Pikaso CDP 탐색 결과 (2026-04-13)

## 사용 모델 및 제한

| 항목 | 값 |
|------|-----|
| 이미지 모델 | Google Nano Banana 2 |
| 이미지 해상도 | 2K (2752x1536), 16:9 |
| 영상 모델 | Kling 2.5 |
| 영상 해상도 | 720 (UI 표시: "720", p 없음) |
| 영상 길이 | 5초 / 10초 (드롭다운) |
| 사용량 | 이미지 2K + 영상 720p = 무제한. **1080p 이상은 유료 — 절대 사용 금지** |
| Audio/3D | 미사용 |

## CDP 연결 방법

```typescript
// 반드시 defaultViewport: null — 사용자 브라우저 창 크기 유지
const browser = await puppeteer.connect({
  browserURL: "http://localhost:9222",
  protocolTimeout: 30000,
  defaultViewport: null,  // viewport 건드리지 않음
});
```

- `defaultViewport: null` 없으면 puppeteer가 800x600으로 강제 → 사용자 화면 좁아짐
- `setViewport()` 호출도 사용자 브라우저에 직접 영향 → 최소화할 것
- 실제 window 크기: 1920x1032 (사용자 전체화면)

## 이미지 생성 페이지 (ai-image-generator)

### URL
`https://www.freepik.com/pikaso/ai-image-generator`

### 좌측 패널 요소

| 요소 | 셀렉터/위치 | 비고 |
|------|-----------|------|
| 프롬프트 입력 | `[contenteditable]` placeholder="Describe your image—try @ to add references" | @로 레퍼런스 멘션 가능 |
| Generate 버튼 | `[data-cy="generate-button"]` | |
| 모델 선택 | 버튼 텍스트 "Google Nano Banana 2" | |
| References - Character | pos=(88,330) 65x65 | 클릭 시 레퍼런스 선택 |
| References - Add | pos=(163,330) 65x65 | 클릭 → 모달 열림 |
| AI prompt 토글 | 버튼 텍스트 "AI prompt", 인접 SPAN `bg-primary-0` | `translate-x-4`이면 ON |
| 생성 매수 | `- 1 +` 버튼 | |
| 비율 | 버튼 텍스트 "16:9" | |
| 해상도 | 버튼 텍스트 "1K" / "2K" / "4K" | 클릭 → 드롭다운 |
| 무제한 | 버튼 텍스트 "ON" | |

### 해상도 드롭다운

해상도 버튼(예: "2K") 클릭 시 드롭다운 열림:
- `1K ~19s` — BUTTON pos=(242,640)
- `2K ~46s` — BUTTON pos=(242,676)
- `4K` — SPAN pos=(254,718)

### AI prompt 설정

- "Improve short prompts and generate diverse variations"
- 우리 파이프라인에서는 **OFF 권장** — creative가 정밀 작성한 프롬프트를 AI가 변형하면 의도 벗어남
- 토글 상태 감지: AI prompt 인접 SPAN의 `translate-x-4` 클래스 존재 = ON

### References 시스템 (캐릭터 일관성 핵심)

**Add 클릭 → 모달 열림 (1760x960)**

모달 좌측 메뉴:
- History — 생성 이력에서 선택
- Uploads — 업로드한 이미지
- Favorites — 즐겨찾기
- Stock — 스톡 이미지

AI collections:
- Style, Character, Element, Color, Effects, Camera

모달 우측: "Upload media", "Take photo" 버튼

**사용 흐름:**
1. Add 클릭 → 모달에서 이미지 선택 → Add 확인
2. 프롬프트에서 `@` 입력 → 등록된 레퍼런스 멘션
3. 캐릭터/배경 레퍼런스 고정으로 장면 간 일관성 유지
4. 레퍼런스 합성도 가능 (캐릭터 + 배경)

### 이미지 다운로드

**갤러리 호버 방식:**
- 이미지에 마우스 호버 → 오버레이 버튼 표시
- 다운로드: `aria="Download"` 버튼
- 기타: 삭제, 좋아요, 편집, Use ▾

**갤러리 URL:**
- 썸네일: `pikaso.cdnpk.net/.../render.png?token=...&preview=1` → 800x447
- 원본: `&preview=1` 제거 → 2752x1536

### 이미지 상세 화면

갤러리 이미지 클릭 시:
- 풀 해상도 이미지 표시
- 우측 패널: Prompt, Settings (해상도, 비율, 모델명)
- 액션 버튼:
  - **Use image** — pos=(1525,775)
  - **Edit image** — pos=(1525,815)
  - **Create video** — pos=(1525,855) ← 이미지→영상 직접 연결
  - **Share** — pos=(1525,935)
  - **Download** — aria="Download"

## 영상 생성 페이지 (ai-video-generator)

### URL
`https://www.freepik.com/pikaso/ai-video-generator`

### 좌측 패널 요소

| 요소 | 비고 |
|------|------|
| Model | Kling 2.5 |
| Start Image | 클릭 → 갤러리 모달 (이미지 생성기와 동일) |
| Motion / Describe your video | 영상 모션 프롬프트 입력 |
| 길이 | 5초 / 10초 드롭다운 |
| 해상도 | 720p |
| 비율 | 16:9 |
| Generate | 생성 버튼 |

### Start Image 선택

- 파일 업로드(`input[type=file]`)가 아닌 **갤러리 모달에서 선택**
- 이미지 생성기에서 만든 이미지가 History에 자동 저장 → 바로 선택 가능
- Start / End 탭 있음 (시작/끝 프레임 지정 가능)

### 이미지→영상 대체 경로

이미지 상세 화면에서 **"Create video"** 버튼 → 직접 영상 생성으로 연결

## 파이프라인 흐름 (CDP 자동화)

```
[이미지 생성]
1. defaultViewport: null로 CDP 연결
2. 해상도 2K 확인/설정, AI prompt OFF 확인
3. 첫 장면: 프롬프트 입력 → Generate → 대기 → 갤러리에 저장됨
4. 첫 장면 이미지를 Reference로 등록 (Add → History에서 선택)
5. 이후 장면: 프롬프트에 @레퍼런스 멘션 → Generate

[영상 생성]
1. 이미지 상세에서 "Create video" 클릭 → 새 Video Generator 탭 열림 + Start Image 자동 삽입
2. **해상도 720p 확인 필수 (1080p 이상은 유료 — 절대 금지)**
3. 모션 프롬프트 입력 → 5초, 720p, 16:9 설정
4. Generate → ~50초 대기

[다운로드]
1. 이미지: URL에서 &preview=1 제거 후 XHR ArrayBuffer → 2K 원본 (~6MB)
2. 영상: XHR 또는 fetch 둘 다 가능 → ~7MB mp4. 단, 생성 완료 후 충분히 대기(3초+) 필요
3. 호버 → Download 버튼 CDP 클릭은 동작 안 함 (수동 클릭만 가능)

[캐릭터 일관성]
- 기존 코드(프롬프트에 외모 묘사 삽입)는 폐기
- Freepik References 시스템 사용: 이미지 등록 + @멘션
```

## 현재 코드 vs 실제 필요 (재설계 대상)

| 기능 | 현재 코드 | 실제 필요 |
|------|----------|----------|
| CDP 연결 | `puppeteer.connect()` viewport 미지정 | `defaultViewport: null` 필수 |
| 페이지 찾기 | `getFreepikPage()` 단일 | `getFreepikImagePage()` / `getFreepikVideoPage()` 분리 (완료) |
| 캐릭터 일관성 | `character-seed.ts` 프롬프트 텍스트 삽입 | References 등록 + @멘션 (재설계 필요) |
| 영상 소스 | `input[type=file]` 로컬 파일 업로드 | 갤러리 모달에서 History 이미지 선택 (재설계 필요) |
| 이미지 다운로드 | XHR로 URL 다운로드 | 동일 + &preview=1 제거 (수정 완료) |
| 해상도 설정 | `ensureResolution()` class 기반 감지 | 드롭다운 방식으로 수정 필요 |
| AI prompt | 미처리 | OFF 보장 로직 추가 필요 |

## 스크린샷 참조

`projects/highschool-romance-test/output/screenshots/` 디렉토리:
- `03-image-fullviewport.png` — 이미지 탭 전체 (1920x1032)
- `05-video-fullviewport.png` — 영상 탭 전체
- `08-gallery-hover.png` — 갤러리 호버 상태
- `12-ai-prompt-area.png` — AI prompt 토글 (ON 상태)
- `13-add-reference-modal.png` — References Add 모달
- `14-image-detail.png` — 이미지 상세 (Create video 버튼)
- `19-no-viewport.png` — defaultViewport:null 정상 화면
- `20-res-dropdown-novp.png` — 해상도 드롭다운 열린 상태
