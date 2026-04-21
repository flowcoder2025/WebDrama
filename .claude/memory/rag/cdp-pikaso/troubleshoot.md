# 실패 패턴 + 복구

> **역할**: 자주 만나는 실패 패턴 + 원인 + 복구 방법 + Normalize 루틴.
> **언제 읽나**: 에러 조우 시 / 예상과 다른 결과 시 / 이미지->비디오 전환 직후.
> **관련 파일**: [`00-core-principles.md`](00-core-principles.md) (원칙), [`ref-dropdowns.md`](ref-dropdowns.md) (옵션 참조)
> **마지막 실측**: 2026-04-17

---

## P-1. Generate 버튼 disabled

### 원인 별 증상
| 원인 | 증상 | 복구 |
|------|------|------|
| 프롬프트 빈 상태 | `genText="..."`, disabled=true | 프롬프트 입력 |
| dangling 멘션 (`@imgN` 있는데 Reference 없음) | 프롬프트 있어도 disabled | Reference 등록 또는 프롬프트에서 멘션 제거 |
| 영상 탭 Unlimited 조합 아님 | `genText=""` or `"Generate650"` 등 | Normalize 실행 (P-2) |
| 설정 변경 직후 일시 disabled | 잠깐 disabled 후 풀림 | 다른 설정 한 번 토글 |

### 검증 코드
```js
const gi = await pg.$eval('[data-cy="generate-button"]', e => ({
 text: e.textContent.trim().slice(0, 30),
 disabled: e.disabled
}));
console.log(gi);
```

---

## P-2. 이미지->비디오 전환 시 설정 리셋 ([!] 가장 중요)

### 증상
- `image-detail-modal-create-video-button` 또는 `thumbnail-startframe-button` 클릭 후 영상 탭 진입
- **해상도가 1080p로 자동 설정**됨 (실측 4회 연속 재현)
- **Generate 버튼 "Generate650" + enabled 상태** -> 실수 클릭 시 크레딧 650 소모
- 간헐적으로 Auto 모델 / Kling 3.0 고정 케이스도 발생 (사용자 보고)
- 모션 프롬프트는 비워짐 (placeholder "Describe your video" 만)

### 복구 -- `normalizeVideoTab()` 필수

```js
async function normalizeVideoTab(vpg) {
 const sleep = ms => new Promise(r => setTimeout(r, ms));
 const steps = [];

 // 1. Model 확인 -> Kling 2.5 강제
 const model = await vpg.$eval('[data-cy="video-model-selector-trigger"]', e => e.textContent.trim());
 if (!/Kling 2\.5/i.test(model)) {
 steps.push('model->Kling25');
 await (await vpg.$('[data-cy="video-model-selector-trigger"]')).click();
 await sleep(800);
 const t = await vpg.evaluate(() => {
 const el = document.querySelector('[data-cy="ai-model-item-slim-kling-25"]');
 if (!el) return null;
 const r = el.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
 });
 if (t) await vpg.mouse.click(t.x, t.y);
 await sleep(1200);
 }

 // 2. Resolution -> 720 강제
 const res = await vpg.$eval('[data-cy="video-resolution-option"]', e => e.textContent.trim());
 if (!/^720/.test(res)) {
 steps.push('res->720');
 await (await vpg.$('[data-cy="video-resolution-option"]')).click();
 await sleep(500);
 const t = await vpg.evaluate(() => {
 const opt = [...document.querySelectorAll('[data-cy="popover-option"]')]
 .filter(o => o.getBoundingClientRect().height > 0)
 .find(o => /^720/.test(o.textContent.trim()));
 if (!opt) return null;
 const r = opt.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
 });
 if (t) await vpg.mouse.click(t.x, t.y);
 await sleep(700);
 }

 // 3. Duration -> 10" 강제
 const dur = await vpg.$eval('[data-cy="video-duration-option"]', e => e.textContent.trim());
 if (!/^10/.test(dur)) {
 steps.push('dur->10');
 await (await vpg.$('[data-cy="video-duration-option"]')).click();
 await sleep(500);
 const t = await vpg.evaluate(() => {
 const opt = [...document.querySelectorAll('[data-cy="popover-option"]')]
 .filter(o => o.getBoundingClientRect().height > 0)
 .find(o => /^10/.test(o.textContent.trim()));
 if (!opt) return null;
 const r = opt.getBoundingClientRect();
 return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
 });
 if (t) await vpg.mouse.click(t.x, t.y);
 await sleep(700);
 }

 return { steps };
}

// 검증
const final = await vpg.evaluate(() => ({
 model: document.querySelector('[data-cy="video-model-selector-trigger"]')?.textContent.trim().slice(0,30),
 resolution: document.querySelector('[data-cy="video-resolution-option"]')?.textContent.trim(),
 duration: document.querySelector('[data-cy="video-duration-option"]')?.textContent.trim(),
 gen: document.querySelector('[data-cy="generate-button"]')?.textContent.trim().slice(0,30)
}));
// 기대: { model: "Kling 2.5", resolution: "720", duration: "10\"", gen: "GenerateUnlimited" }
```

**이미지->비디오 전환 후 무조건 실행. 그 전엔 Generate 금지.**

---

## P-3. 재생성 시 얼굴 정체성 손상

### 증상
- 같은 캐릭터 Reference 사용했는데 얼굴이 약간 다르게 나옴
- "IGNORE @img2" 등 강한 negative 지시 시 얼굴까지 무시됨

### 원인
- Reference와 프롬프트 지시가 충돌
- "keep identical" 없이 큰 변경 지시
- 여러 Reference 혼합 (character + background) 시 서로 덮어씀

### 복구
- `"maintaining her exact facial features, face shape, hairstyle, and appearance"` 강하게 유지
- 변경점은 짧게
- 캐릭터 Reference 유지한 채로 **배경만 text로** 지시 (또는 배경 ref + 인물 text로 역전)
- 실패 시: 재생성 반복보다 **Start Image 자체를 다시 설계**

과거 실측 경험: C10 3차 / C17 4차 / C13 반복 재생성 시 발생.

---

## P-4. 조명 통합 실패 (배경 Reference 스튜디오 라이트 끌고 옴)

### 증상
- Reference 배경이 스튜디오에서 촬영한 인물이면, 그 스튜디오 라이트가 야외 씬에도 적용됨
- 예: 정류장 비 오는 밤인데 인물에게만 밝은 정면광

### 복구 (프롬프트 명시)
```
no studio lighting, match the reference's outdoor amber streetlight only
```

또는 배경과 캐릭터 Reference 분리 후 **배경만 먼저 뽑고** 그것을 캐릭터와 합성.

---

## P-5. 갤러리 이미지 클릭 시 상세 모달 미오픈

### 증상
- 갤러리 썸네일 클릭해도 상세 모달 안 열림
- 실측: 특정 이미지 `prodId 3992508054` 재현됨, reload 후에도 안 열림

### 복구
- 해당 이미지 스킵하고 **다른 아이템으로 진행**
- 원인 미상 -- 이미지 메타데이터/상태 이슈 추정
- 추가 시도: `page.reload()` -> 필터 재적용 -> 다시 클릭

---

## P-6. 모달 내 이미지 선택과 실제 등록 prodId 불일치

### 증상
- Add 모달에서 `feed-image-item-2805167874` 클릭
- 실제 등록된 Reference의 img src: `production/3992686399/render.png`
- 클릭한 공용 ID와 등록된 내 prodId가 다름

### 원인 추정
- 모달의 `feed-image-item-{XXX}` = Freepik 공용/세션 내부 ID
- 실제 render asset = 별도 체계
- `history-folder-selector-button` 기본값이 Personal project더라도 내부 매핑이 다를 수 있음

### 복구
1. 등록 직후 `reference-image-card` img src에서 prodId 추출
2. 의도와 다르면 카드 삭제 후 재시도
3. 다른 폴더 선택 (history-folder-option-{uuid}) 또는 **업로드 탭으로 로컬 파일 직접 주입**

---

## P-7. 브라우저 fetch / XHR 다운로드 CORS 차단

### 증상
```
TypeError: Failed to fetch (pikaso.cdnpk.net)
```

### 복구
**Node.js `https.get()` 사용** -- pre-signed URL이라 인증 없이 접근 가능. 자세한 건 [`howto-download.md`](howto-download.md).

---

## P-8. Kling 생성 대기 시 중복 클릭 위험

### 증상
- Generate 클릭 후 **11초 뒤 버튼이 `disabled=false`로 복귀**
- 실수로 한 번 더 누르면 **두 번 생성됨**

### 복구 로직
- 갤러리 최상단 상태 감지: `topKind === "unknown"` (플레이스홀더 상태) = 생성 중 -> 재클릭 금지
- 또는 폴링 루프 끝까지 대기:
```js
// Generate 클릭 후 최소 expectedGenerationTime 만큼 대기
for (let waited = 10; waited <= expectedSec * 1.5; waited += 10) {
 await sleep(10000);
 const done = await vpg.evaluate((id) => {
 const vb = document.querySelector('[data-cy="video-box-' + id + '"]');
 const video = vb?.closest('[data-cy="main-feed-item"]')?.querySelector('video');
 return video?.src && /production/.test(video.src);
 }, myIdentifier);
 if (done) break;
}
```

---

## P-9. 필터 토글 의도치 않게 OFF

### 증상
- `projects-filter-option-image` 두 번 클릭하면 필터가 풀림
- 갤러리에서 `image-creation-feed-item` 수가 0이 됨

### 복구
```js
// 안전한 필터 설정
await (await pg.$('[data-cy="projects-filter-shortcut-all"]')).click();
await sleep(800);
await (await pg.$('[data-cy="projects-filter-option-image"]')).click();
await sleep(1200);
```

---

## P-10. 멘션 삽입 실패

### 증상
- `@img1` 타이핑 후 그냥 텍스트로 남고 멘션 토큰 안 됨
- 드롭다운이 안 뜨거나 다른 요소가 가림

### 복구 패턴 (과거 RAG 확립)
```js
await ipg.keyboard.type('@img1', { delay: 50 });
await sleep(500); // 드롭다운 렌더 대기
await ipg.keyboard.press('Enter'); // 첫 제안 선택
await sleep(500);
```

**좌표 클릭 방식 폐기** (드롭다운 겹침 문제로 실패율 높음).

**검증**: 프롬프트 영역에 `<span data-key="img1" data-type="reference">@img1</span>` 형태 토큰 생성 확인.

---

## P-11. 일시적 설정 변경 후 Generate disabled 고착

### 증상
- 길이 10" -> 5" -> 10"로 복원해도 Generate 버튼 `disabled=true` 유지
- 해상도도 동일하게 재선택해도 안 풀리는 경우

### 복구
- 다른 설정을 한 번 더 토글하면 풀림 (예: 해상도 700->720 -> 잠시 후 다시 정상화)
- 충분한 대기 시간 (1초 이상) 후 재확인
- 최악: 페이지 reload

---

## P-12. 탭 상실 (page.close 하지 않아도 navigate로 사라짐)

### 증상
- 이미지 탭에서 "Edit image" 또는 "Create video" 클릭 -> **이미지 탭이 에디터/영상 탭으로 URL navigate**
- `pages.find(x => x.url().includes('ai-image-generator'))` 결과 `undefined`

### 복구
```js
// 변경된 탭 찾기
const pages = await browser.pages();
const editorPage = pages.find(x => x.url().includes('image-editor'));

// goBack 시도
try {
 await editorPage.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
} catch (e) {
 await editorPage.goto('https://www.freepik.com/pikaso/ai-image-generator', { waitUntil: 'domcontentloaded' });
}
await sleep(1500);
```

---

## P-13. 텍스트 간판 로고 렌더 침입 (네거티브만으로는 불완전)

### 증상
- `no text, no watermark, no logo, no brand names` 네거티브가 있어도 실제 상호, 브랜드, 광고처럼 **읽히는** 한글 텍스트가 렌더됨
- 실측: `loc_busstop_rain_evening_v1.png` (2026-04-19) -- 건물 간판 "견만", "경항도로" 실제 상호처럼 가독
- 실측: `loc_street_rain_cleared_v1.png` (2026-04-19) -- 노면 한글 도로 마킹 가독 + shop sign 실제 상호 형상

### 원인
- NB2는 공간 필수 요소 (간판, 광고판, 도로 마킹, 벤딩머신 라벨)를 빈 공간으로 두지 않음
- Negative만 있으면 모델이 "뭔가로 채워야 함 = 가장 그럴듯한 현실 렌더"로 판정
- 한국 공간 맥락(Korean urban)에 실제처럼 읽히는 한글 상호, 도로명 생성이 기본 behaviour
- 제약의 진짜 범위는 한국어 자체 금지가 아닌 readable 실제 상호, 브랜드 금지

### 복구: positive 대체 묘사 명시
Cowork 원문 네거티브는 유지하고, 본문에서 해당 요소를 묘사하는 라인에 positive 대체 문구를 덧붙인다 (네거티브 앞쪽 이동 아님, 본문 강화).

중요 원칙: 제약은 "한국어/한글 자체 금지"가 아니라 "실제 상호, 브랜드, 광고 문구가 읽히면 안 됨". Cowork 원문 `No readable text, no real brand logos, no real ad text`의 "real"과 "readable" 키워드가 제약의 범위. 한국 도시 배경이니 한글 간판은 자연스러운 요소로 존재해야 하고, 다만 추상화/흐림/가공된 한글 형태여야 한다.

패턴 예 (한글 Korean-style 허용 + readable 실제 상호만 금지):
- 간판: `Shop signs visible as abstract blurred Korean-style signage shapes, no readable store names, no real brand identities, decorative color fields with illegible stroke impressions only.`
- 벤딩머신: `The vending machine's product display shows blurred color blocks and abstract Korean product shape impressions, no readable labels, no real brand graphics.`
- 도로 마킹: `Road markings as faint weathered paint residue patterns, no real street names, no legible lane numbers, only abstract stroke remnants.`
- 포스터: `Posters show indistinct graphic compositions with abstract Korean typography impressions, no readable text, no real advertisement content.`
- 건물 간판: `Building signs on facades as blurred Korean-style graphic fields, no real company names, no legible store identities, abstract stroke shapes only.`

### 적용 위치 규칙
Cowork 원문에 있는 해당 요소 묘사 문장 **바로 뒤에** positive 대체 문구 삽입.

예시 (loc_busstop_rain_evening 본문):
- 원문: `a vending machine standing adjacent to the shelter with cool blue internal light spilling out through its product display (label text unreadable)`
- 강화: `... product display. The vending machine's product display shows blurred color blocks only, no readable product labels, no brand graphics.`

### 원칙 9와의 관계
`prompts.md` 원칙 9 "AI가 자연 처리하는 효과는 프롬프트에서 빼기"의 예외. 텍스트는 자연 처리가 아닌 허위 생성 영역이라 positive 강제가 필요.

### 확대 검토 기준
"실제 상호, 브랜드, 도로명으로 읽히는가"가 판정 기준. 한글 형상이 있더라도 abstract/blurred 형태로 특정 단어로 읽히지 않으면 PASS. dot pattern이라도 특정 글자로 식별 가능하면 FAIL. 2K 16:9 풀프레임 시청 거리에서 노이즈로만 보이면 PASS.

### 재생성 순서
1. Cowork 원문 그대로 유지
2. 본문 내 텍스트 가능 요소 (간판, 벤딩머신, 포스터, 도로 마킹, 건물 표지) 식별
3. 각 요소 묘사 문장 뒤에 positive 대체 문구 삽입
4. 네거티브 꼬리는 그대로 유지 (Cowork 원문 보존)
5. Generate -> 재검증

---

## 빠른 복구 레시피

| 증상 한 줄 | 바로 실행할 것 |
|----------|-------------|
| Generate disabled | 프롬프트 + Reference 확인 -> Normalize |
| 영상 탭 1080p 리셋 | `normalizeVideoTab()` |
| 크레딧 표시 ("Generate650" 등) | **즉시 해상도 720 복원** |
| 얼굴 정체성 다름 | "maintaining exact facial features" 강화 |
| 상세 모달 안 열림 | 다른 이미지로 진행 |
| 다운로드 403 | 갤러리에서 src 재획득 (토큰 만료) |
| 브라우저 fetch CORS | Node https.get 사용 |
| 모달 내 prodId 불일치 | 등록 후 src 검증, 불일치 시 삭제 재등록 |
| 탭이 사라짐 (navigate) | goBack or URL 이동 |
