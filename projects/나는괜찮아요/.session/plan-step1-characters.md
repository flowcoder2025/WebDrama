# Step 1 계획 -- 캐릭터 ref 3종 생성

**작성일**: 2026-04-19
**목적**: Cowork 캐릭터레퍼런스_v3 원문 대조 후 프롬프트 완성본 확정 + evaluator 계획 검증
**대상**: 민준(`char_exlover_base_v1.png`) / 지연 세트 A(`char_coworker_jiyeon_setA_v1.png`) / 지연 세트 B(`char_coworker_jiyeon_setB_v1.png`)
**저장 위치**: `projects/나는괜찮아요/assets/refs/`

---

## 0. 검증 근거 (SSOT 경로)

| 항목 | 경로, 라인 |
|---|---|
| 캐릭터 원문 | `C:\Team-jane\Cowork\나는괜찮아요_캐릭터레퍼런스_v3.md` |
| 섹션 A 민준 프롬프트 | L22~L66 |
| 섹션 B 지연 본문 프롬프트 | L70~L114 |
| 의상 슬롯 매트릭스 (지연) | L214~L217 |
| 지연 헤어 정본 (EP4 기준) | L219~L221 |
| Clause C-EP4 (세트 B 참조 검증용) | L223~L242 |
| 은서 세트 A 의상 참조 | L201 |
| 공통 원칙 (스튜디오 포맷) | L10~L19 |
| 파일명 정본 | PROJECT.md 섹션 3 (HANDOFF v3.1 기준) |
| 세션 핸드오프 명세 | `projects/나는괜찮아요/.session/SESSION_HANDOFF_20260419.md` 섹션 우선순위 1 표 |

## 0.1 파일명 정본 확정

PROJECT.md 섹션 3 각주: Cowork L128, L252의 `_ref_v1` 표기는 참고만. 본 프로젝트 정본은 HANDOFF v3.1 기준:
- `char_exlover_base_v1.png`
- `char_coworker_jiyeon_setA_v1.png`
- `char_coworker_jiyeon_setB_v1.png`

(`docs/standards.md 섹션 1.1` 네이밍 `char_<id>_<slot>_v<n>.png` 패턴과 일치)

## 0.2 공통 생성 조건 (프롬프트 3종 공통)

- Freepik NanoBanana2 / 2K / 16:9 / AI prompt OFF
- Reference 등록 **없이** 텍스트 only 생성 (베이스 ref)
- 생성 후 저장: `projects/나는괜찮아요/assets/refs/<파일명>.png`
- 다운로드: `&preview=1` 제거 + Node `https.get()` (RAG `howto-download.md` / `00-core-principles.md` 원칙 7, 10)
- API 가로채기로 `creation.id` 직접 확보 (멀티 세션 안전 / 원칙 10)

---

## 1. 민준 프롬프트 완성본 (수정 없음)

**판단 근거**: Cowork 섹션 A 원문 L26~L64 그대로 사용. 조합, 치환 불필요. PROJECT.md 섹션 3 민준 제약(왼손 실버 아날로그 시계 / 반지, 목걸이 금지)은 원문에 이미 충실히 반영됨 (L46~L48 시계 + L59~L60 네거티브).

```
A real photograph of a 28-year-old Korean man standing in full-body vertical
composition against a plain light gray studio background with a clean matte
concrete floor, flat even studio lighting, 2K cinematic frame. He faces the
camera with a neutral relaxed expression -- not smiling, not performing -- the
expression of someone just existing in front of a camera rather than posing
for it.

He has short-to-medium length straight black hair, side-parted and softly
styled without product shine (not slicked, not gelled), with one strand near
his right temple sitting slightly out of place. His face is a typical Korean
late-20s oval-square shape with a defined but soft jawline, natural thick
eyebrows, warm fair skin with visible pore texture (not airbrushed),
clean-shaven with only a trace of light shadow.

He wears a medium-dark navy cotton-nylon blend bomber jacket with ribbed
cuffs and hem (slightly worn-in, subtle fabric pilling at the cuffs), a
plain white heavyweight cotton crew-neck t-shirt visible at the collar,
medium-dark indigo slim-straight denim jeans with a natural fabric break at
the ankle (not skinny, not baggy), and clean white leather low-top sneakers
with minimal branding and a trace of wear on the outsole. A thin
silver-steel analog wristwatch with a simple black leather strap sits on
his left wrist, partially visible under the jacket cuff.

His left hand rests in his jacket pocket with the thumb hooked out over the
seam, his right arm hangs naturally at his side with fingers softly curled
rather than stiff. Posture is relaxed with a slight weight shift to his
left leg, right shoulder sitting a fraction lower than the left -- a natural
everyday stance, not a rigid model pose. His gaze meets the camera gently
without performing confidence, attention partially turned inward.

This is a real photograph only, not an illustration, not a painting, not
anime, not a 3D render, not AI art, not a CGI composite. No text, no
watermark, no logo, no name tag anywhere in the frame. No earrings, no
necklace, no rings, no bracelets beyond the single wristwatch. No tattoos
visible. No sunglasses, no hat, no scarf. No patterned graphics or text
printed on the clothing. No exaggerated jawline, no model-catalog posture,
no studio-pose hand placement.
```

**원문 글자수**: Cowork 섹션 A 주장 ~1680자 / 실측 공백 정규화 시 ~2,280자 (카운트 방식 차이: Cowork는 공백 축약, Unicode 카운트 기준, 실측은 문자 단위). NB2 입력 2000자 이내 권장(RAG prompts.md 원칙 10) 대비 실측 기준 ~15% 초과. **Cowork 원안 존중, 축약 금지**.

---

## 2. 지연 세트 A 프롬프트 완성본

**판단 근거**:
- Cowork 섹션 B 본문 L74~L113을 골격으로 사용 (의상, 자세, 네거티브 원문 유지)
- **헤어 길이, 파팅만 L221 정본으로 덮어쓰기** (이유: 섹션 B 본문 L82~L84의 "medium-length wavy ... collarbone" 길이, 파팅 스펙은 L221에서 "EP4 정본으로 덮어쓰기 완료"로 명시적으로 폐기됨). 웨이브 자연도(`rather than heat-curled rigid curls`), face framing(`a few strands softly framing her face`) 수식은 L221 정본과 상충하지 않으므로 **톤 보존**.
- 세트 A 의상(블러시 블라우스 + 카멜 스커트 + 누드 펌프스 + 버건디 크로스바디 + 펄 스터드 + 실버 팔찌)은 L216과 본문 완전 일치 -> 원문 그대로

**치환 내역 (1곳 -- 길이, 파팅만 덮어쓰기, 수식 보존)**:
| 위치 | 원문 (L82~L85) | 치환 |
|---|---|---|
| 헤어 길이, 파팅 | `medium-length wavy dark brown hair (not black, not light brown) falling just past her collarbone with soft natural waves rather than heat-curled rigid curls, center-to-slightly-side parted, one or two strands softly framing her face without looking styled-in.` | `shoulder-length straight-to-gentle-wave dark brown bob parted softly to one side with one side tucked behind her right ear, the ends falling around the jawline-to-collarbone area with subtle natural movement rather than heat-curled rigid curls, a few strands softly framing her face without looking styled-in.` |
| **덮어쓰기 부분** | `medium-length wavy ... falling just past her collarbone ... center-to-slightly-side parted, one or two strands softly framing her face` | L221 정본 `shoulder-length straight-to-gentle-wave ... bob ... parted softly to one side with one side tucked behind her right ear ... a few strands softly framing her face` |
| **보존 부분 (수식)** | `rather than heat-curled rigid curls ... without looking styled-in` | 동일 보존 (L221과 의미적 상충 없음, 톤 일관성 유지) |

**완성 프롬프트**:

```
A real photograph of a 27-year-old Korean woman standing in full-body
vertical composition against a plain light gray studio background with a
clean matte concrete floor, flat even studio lighting, 2K cinematic frame.
She faces the camera with a small warm unforced smile -- the kind of gentle
everyday expression people have when they're friendly by default, not a
performance.

She has a shoulder-length straight-to-gentle-wave dark brown bob parted
softly to one side with one side tucked behind her right ear, the ends
falling around the jawline-to-collarbone area with subtle natural movement
rather than heat-curled rigid curls, a few strands softly framing her face
without looking styled-in. Her face is a typical Korean late-20s
round-oval shape with warm fair skin showing subtle visible texture (not
airbrushed), softly-arched natural eyebrows, a light pink lip tint rather
than bold lipstick, and subtle everyday eye makeup.

She wears a soft blush-pink silk-blend short-cap-sleeve blouse with a small
pointed collar, lightly tucked into a camel-colored pleated A-line midi
skirt with a crisp waistband that falls just below the knee, and nude
low-heel pointed-toe leather pumps (not stilettos). A small soft-leather
burgundy crossbody bag hangs from her right shoulder with the strap
slightly twisted near the buckle -- a real worn-in detail, not a showroom
drape. She wears small pearl stud earrings and a delicate thin silver
bracelet on her right wrist; no other jewelry.

Her left hand rests lightly on the bottom of the crossbody bag, her right
arm hangs naturally at her side with softly relaxed fingers. Posture is
upright but not stiff, weight slightly shifted to her right leg, one
shoulder sitting a fraction lower than the other -- a natural everyday
stance, not a rigid model pose. Her gaze meets the camera gently with the
small smile, present but unperformed.

This is a real photograph only, not an illustration, not a painting, not
anime, not a 3D render, not AI art, not a CGI composite. No text, no
watermark, no logo, no name tag anywhere in the frame. No rings, no
necklace, no hair accessories beyond what is listed. No additional jewelry
beyond the pearl studs and silver bracelet. No tattoos visible. No
sunglasses, no hat. No patterned graphics or text printed on the clothing.
No heavy makeup, no false lashes, no bold lip color. No catalog-model
posture, no runway stance.
```

---

## 3. 지연 세트 B 프롬프트 완성본

**판단 근거**:
- Cowork 섹션 B 본문 골격 + **3곳 치환**
- Cowork에 독립 프롬프트 없음 -> HANDOFF 세션 지시 절차(섹션 우선순위 1 표)에 따라 조합
- Clause C-EP4 (L223~L242)와 대조 검증 완료: 의상 L231~L235(blazer + striped blouse + beige slacks + loafers + gold studs + silver watch on **left** wrist) 정렬

**치환 내역 (4곳 -- 원문 L217 + Clause C-EP4 L231~L235 엄격 준수, 추가 디테일 주입 금지)**:
| # | 위치 | 원문 | 치환 |
|---|---|---|---|
| 1 | L82~L85 헤어 | (세트 A와 완전 동일 치환 문장) | (세트 A와 완전 동일 -- shoulder-length bob 길이, 파팅 L221 덮어쓰기, 웨이브, framing 수식 보존) |
| 2 | L90~L97 의상 블록 전체 | 블러시 블라우스 + 카멜 스커트 + 누드 펌프스 + 버건디 크로스바디 + 펄 스터드 + 실버 팔찌 | L217 스펙 6요소 원문 그대로: `fitted medium-dark navy wool-blend blazer (unbuttoned)` + `thin gray-striped white cotton blouse tucked in` + `beige slim-fit tailored slacks` + `black pointed flat leather loafers` + `small simple gold stud earrings` + `thin silver analog wristwatch on left wrist`. **추가 디테일 금지** (`single-breasted`, `small pointed collar`, `break just above ankle`, `trace of everyday wear`, `silver-steel`, `black leather strap` 전부 배제) |
| 3 | L99 자세 (crossbody 의존) | `Her left hand rests lightly on the bottom of the crossbody bag` | `Her left hand rests lightly at her side with fingers softly relaxed` (시계 노출 수식 금지 -- 원문에 없음) |
| 4 | 네거티브 | `No additional jewelry beyond the pearl studs and silver bracelet` | `No additional jewelry beyond the gold stud earrings and silver wristwatch. No crossbody bag, no handbag, no tote in this shot.` |

**보존**: 나이, 얼굴, 피부, 눈썹, 표정(small warm unforced smile), 자세 오른손, 네거티브 나머지, 스튜디오 포맷. ref는 플랫 스튜디오 용도이므로 EP4 감정 맥락 주입 금지.

**완성 프롬프트**:

```
A real photograph of a 27-year-old Korean woman standing in full-body
vertical composition against a plain light gray studio background with a
clean matte concrete floor, flat even studio lighting, 2K cinematic frame.
She faces the camera with a small warm unforced smile -- the kind of gentle
everyday expression people have when they're friendly by default, not a
performance.

She has a shoulder-length straight-to-gentle-wave dark brown bob parted
softly to one side with one side tucked behind her right ear, the ends
falling around the jawline-to-collarbone area with subtle natural movement
rather than heat-curled rigid curls, a few strands softly framing her face
without looking styled-in. Her face is a typical Korean late-20s
round-oval shape with warm fair skin showing subtle visible texture (not
airbrushed), softly-arched natural eyebrows, a light pink lip tint rather
than bold lipstick, and subtle everyday eye makeup.

She wears a fitted medium-dark navy wool-blend blazer unbuttoned over a
thin gray-striped white cotton blouse tucked into beige slim-fit tailored
slacks, with black pointed flat leather loafers. She wears small simple
gold stud earrings and a thin silver analog wristwatch on her left wrist;
no other jewelry.

Her left hand rests lightly at her side with fingers softly relaxed, her
right arm hangs naturally at her side with softly relaxed fingers.
Posture is upright but not stiff, weight slightly shifted to her right
leg, one shoulder sitting a fraction lower than the other -- a natural
everyday stance, not a rigid model pose. Her gaze meets the camera gently
with the small smile, present but unperformed.

This is a real photograph only, not an illustration, not a painting, not
anime, not a 3D render, not AI art, not a CGI composite. No text, no
watermark, no logo, no name tag anywhere in the frame. No rings, no
necklace, no hair accessories beyond what is listed. No additional jewelry
beyond the gold stud earrings and silver wristwatch. No crossbody bag, no
handbag, no tote in this shot. No tattoos visible. No sunglasses, no hat.
No patterned graphics or text printed on the clothing. No heavy makeup,
no false lashes, no bold lip color. No catalog-model posture, no runway
stance.
```

---

## 4. 생성 절차 (3종 공통)

RAG `howto-generate-image.md` + `howto-reference.md` + `howto-navigate.md` + `CHEATSHEET.md` 스니펫 6 기반.

1. **이미지 탭 활성화 + 페이지 초기 상태 확인** (RAG `howto-navigate.md`):
 - `pages.find(x => x.url().includes('ai-image-generator'))` -> `ipg.bringToFront()`
 - URL 확인 (`/pikaso/ai-image-generator` 포함)
 - CHEATSHEET 스니펫 1로 덤프 확인 (실측 완료, 2026-04-19 05:54 KST: 2K / 16:9 / ref 0개 / 프롬프트 empty / Generate disabled -- 프롬프트 없어서 정상)
 - 영상 탭은 Normalize된 상태 유지 (Kling 2.5 / 720 / 10" / 16:9)
2. **프롬프트 클리어**: `image-prompt-input` contenteditable -> Ctrl+A -> Backspace
3. **헤어 문장 diff 체크** (지연 세트 A, B 사이 일관성):
 - 본 문서 섹션 2 완성 프롬프트의 헤어 문장(문단 2 첫 문장)과 섹션 3 완성 프롬프트의 헤어 문장을 **bytewise 비교**
 - diff 0 확인 후 타이핑 진행. diff 발생 시 본 문서 수정 후 재실행.
 - (민준은 남성 프롬프트로 skip)
4. **프롬프트 타이핑**: 본 문서의 완성 프롬프트 한 덩어리 타이핑 (멘션 분산 불필요 -- 텍스트 only)
5. **Generate 전제 검증**: 2K / 16:9 / AI prompt OFF / `generate-button disabled === false` / Ref 0개 확인
6. **API 가로채기 설정** (멀티 세션 안전, RAG 원칙 10): `page.on('response')`로 `start-tti-v2.family` -> `render/v4.creation.id` 포착
7. **Generate 클릭** -> `creation.id` 확보 대기 (~5초) -> 갤러리 render URL 등장 대기 (~35~60초)
8. **다운로드**: `src.replace(/[?&]preview=1/, '')` + Node `https.get()` -> `projects/나는괜찮아요/assets/refs/<파일명>.png`
9. **Compliance 체크** (Cowork 섹션 A/섹션 B 체크리스트 L125~L127):
 - 민준: 표정 중립 + 어깨 비대칭 + 왼손 시계 / 네거티브 위반 없음 (귀걸이, 반지, 팔찌, 타투, 선글라스 0)
 - 지연 A: shoulder-length bob(L221 정본) + 크로스바디 스트랩 뒤틀림 + 블러시 블라우스
 - 지연 B: shoulder-length bob + 네이비 블레이저(unbuttoned) + 골드 스터드 + **왼손** 실버 시계 + 가방 없음
10. **재시도 한도**: 각 ref 3회 (캐릭터레퍼런스_v3 섹션 사용가이드 L125)
11. **retry-count.json 기록**: 생성 시 신규 생성. 형식 핸드오프 섹션 기준
12. **다음 ref 시작 전 원복**: 프롬프트 클리어 재실행 (Step 2 반복). Reference는 본 작업에서 등록하지 않으므로 삭제 불필요. 세션 종료 시 영상 탭 Normalize 상태 유지 확인 (RAG `00-core-principles.md` "세션 종료 시 원상 복구").

---

## 5. 생성 순서

1. **민준** -- 프롬프트 원문 수정 無, 워크플로우 첫 검증용
2. **지연 세트 A** -- 헤어 1곳 치환 (세트 B 준비)
3. **지연 세트 B** -- 조합 복잡, 세트 A 검증 후

---

## 6. 리스크, 가드레일

| 리스크 | 대응 |
|---|---|
| 지연 세트 A/B 헤어 일관성 (두 파일 간) | (a) 두 프롬프트에 완전 동일한 치환 문장 사용 (섹션 2, 섹션 3 치환 블록 비교). (b) 섹션 4 Step 3에서 타이핑 직전 bytewise diff 0 확인 절차 강제. |
| 세트 B 왼손 시계 누락 | 본문 + 네거티브 2곳에 명시 (L217, Clause C-EP4 원문 준수, 자세 문장에 시계 노출 수식 추가 금지) |
| 민준 프롬프트 ~2,280자 (실측) | RAG 원칙 10 권장 2000자 ~15% 초과 -- Cowork 원안 존중, 축약 금지. 후반 토큰 가중치 하락 위험 인지, Compliance 체크에서 프롬프트 후반 요소(네거티브 반영도) 점검. |
| ref에 실제 장면 조명 침입 | 베이스 ref는 플랫 스튜디오만. "lighting dictated by the scene, NOT the reference" Clause는 장면 클립용이므로 본 ref 생성에는 **포함 금지** |
| 세트 B에 `fitted` 어휘로 신체 과노출 | `fitted medium-dark navy wool-blend blazer` -- L217 원문 그대로. 사이즈 감각만. 본문의 "average Korean female build" 유지 |
| 원문에 없는 디테일 주입 (충실도 이탈) | Cowork 섹션 B/L217/Clause C-EP4에 **없는 스펙은 전가 금지** (eval 1차 ISSUE 1~5 반영). 예: `single-breasted`, `small pointed collar`, `break just above ankle`, `trace of everyday wear`, `silver-steel`, `black leather strap` 전부 배제. |

## 7. 미해결 판단 포인트 (사용자 최종 판단)

- 세트 B 표정: 원문은 "small warm unforced smile" (세트 A와 동일). EP4 face-on 최초 공개 맥락을 고려하면 더 **중립**으로 할지 여부 -- 본 ref는 **플랫 스튜디오 얼굴 추출용**이므로 원안 유지 권장 (감정은 장면 프롬프트에서 주입)
- 세트 B 스타킹/양말: Cowork L217, L233에 언급 없음 -> 프롬프트 미포함 (NB2 기본 처리 위임)

---

## 8. 검증 요청 항목 (evaluator 대상)

계획(프롬프트 3종 + 조합 로직 + 절차)이 아래를 충족하는지 확인:

1. **충실도**: Cowork 캐릭터레퍼런스_v3 섹션 A/섹션 B + L214~L242 원문과 완성 프롬프트 간 누락, 왜곡 0건
2. **지연 세트 B 조합 검증**: HANDOFF 섹션 우선순위 1 표의 세트 B 조합 방법 4단계(본문 복사 -> L217 의상 치환 -> L221 헤어 치환 -> Clause C-EP4 대조) 전부 반영
3. **PROJECT.md 섹션 3 핵심 제약 반영**: 은서 골드체인(해당無) / 은서 헤어 EP 분기(해당無) / 지연 의상 EP1=A / EP4=B / 지연 face-on EP4 C06 최초 / 민준 왼손 실버 아날로그 시계 / 민준 반지, 목걸이 금지
4. **RAG 부합**: `prompts.md` NB2 10원칙 + `00-core-principles.md` 11원칙 (특히 자연어 문장형 / negative 문장형 꼬리 / `@imgN` 없음 / contenteditable placeholder 충돌 없음)
5. **파일명 정본**: `_base_v1` / `_setA_v1` / `_setB_v1` (HANDOFF v3.1 기준, L128/L252 `_ref_v1` 아님)
6. **절차 완결성**: 프롬프트 클리어 -> 타이핑 -> Generate 검증 -> API 가로채기 -> 다운로드(&preview 제거) -> Compliance 체크 -> retry-count 기록 전부 포함
7. **리스크 커버리지**: 3회 재시도 한도 + ref에 장면 조명 주입 금지 + 세트 B 가방 삭제에 따른 자세 수정 반영

**주의**: 결과물(이미지)이 아직 없으므로 결과물 채점이 아닌 **계획 채점**. 10점 임계치 적용 가능하면 채점, 아니면 "계획 검토" 모드로 이슈만 나열.

---

## 9. 1차 eval 피드백 반영 이력 (2026-04-19)

1차 eval 판정: **8.8/10 REWORK**. 반영 내역:

| ISSUE | 원인 | 수정 내역 |
|---|---|---|
| 1. `single-breasted` 추가 | 원문에 없는 스펙 | 섹션 3 의상 블록에서 삭제. 섹션 3 치환표에 "추가 디테일 금지" 명시. |
| 2. 블라우스 `small pointed collar` | 세트 A 블라우스 속성 전가 | 섹션 3 의상 블록에서 삭제. |
| 3. 슬랙스 `break softly just above the ankle` | 민준 진스 속성 전가 | 섹션 3 의상 블록에서 삭제. |
| 4. 로퍼 `faint trace of everyday wear` | 민준 스니커즈 속성 전가 | 섹션 3 의상 블록에서 삭제. |
| 5. 시계 `silver-steel` + `black leather strap` | 민준 시계 속성 전가 | 섹션 3 의상 블록에서 `thin silver analog wristwatch on her left wrist`로 축소 (L217, Clause C-EP4 원문 일치). |
| 6. 세트 A 치환 선언 vs 실제 불일치 | "L82~L85 전체 치환" 선언했으나 수식 보존 | 섹션 2 판단 근거를 "헤어 길이, 파팅만 L221 덮어쓰기, 웨이브, framing 수식 보존"으로 명확화. 치환표에 덮어쓰기/보존 부분 분리. |
| 7. 헤어 diff 체크 절차 부재 | 세트 A, B 간 일관성 자동 검증 없음 | 섹션 4 Step 3에 "헤어 문장 bytewise diff 0 확인" 강제 단계 추가. 섹션 6 리스크 표에 반영. |
| 8. 매 ref 후 프롬프트 클리어 명시 누락 | 암묵적 포괄만 | 섹션 4 Step 12 "다음 ref 시작 전 원복" 명시 단계 추가. |
| 9. 이미지 탭 `bringToFront()` 액션 분리 누락 | 섹션 4-1에 포괄됐으나 명시 안 됨 | 섹션 4 Step 1을 "이미지 탭 활성화(`bringToFront()`) + URL 확인 + 덤프"로 구체화. |
| 10. 민준 문자수 주석 | Cowork 주장(~1680) vs 실측(~2280) 차이 근거 없음 | 섹션 1 마지막 라인에 카운트 방식 차이 + NB2 2000자 권장 대비 초과율 + 축약 금지 명시. 섹션 6 리스크 표에도 반영. |

**세트 B 의상 블록 최종 (섹션 3 완성 프롬프트)**: L217 + Clause C-EP4 L231~L235에 **있는 요소만** 포함:
- `fitted medium-dark navy wool-blend blazer unbuttoned over`
- `thin gray-striped white cotton blouse tucked into`
- `beige slim-fit tailored slacks`
- `black pointed flat leather loafers`
- `small simple gold stud earrings`
- `thin silver analog wristwatch on her left wrist`

자세 문장 L99 치환도 `the watch face partially visible under the blazer cuff` 수식 삭제 (원문에 없음) -> `Her left hand rests lightly at her side with fingers softly relaxed`만 유지.

---

## 10. 세트 B v2 재작업 (2026-04-19 생성 후 사용자 지적 반영)

**발견 이슈**: 세트 B v1(텍스트 only 생성)이 세트 A v1과 **얼굴 feature 불일치** -- NB2가 독립 호출 시 매번 다른 얼굴 생성. 지연은 **동일 인물의 다른 의상 세트**이므로 EP1 배경(세트 A)<->EP4 face-on(세트 B) 전환 시 관객이 다른 사람으로 인식할 위험.

**Cowork 지침 재해석**: L122~L123 "Reference 등록 없이 텍스트 only 생성"은 **민준 <-> 지연 간 독립 생성** 맥락. 지연 A<->B(동일 인물) 관계는 이 지침 범위 밖. Cowork L156~L174 Reference Binding Clause C 패턴이 정석.

**파일 처리 (standards.md 섹션 2.1 "재작업 v<N+1> 신규, 이전 보존")**:
- `char_coworker_jiyeon_setB_v1.png` -> **보존** (결함 ref, 실사용 금지 플래그)
- `char_coworker_jiyeon_setB_v2.png` **신규 생성 -> 정본**

**재작업 절차**:
1. 세트 A v1 Freepik Upload -> `@img1` 등록 (RAG `howto-reference.md` Upload 탭)
2. 프롬프트 입력: Clause C 패턴 차용, `@img1` 얼굴, 헤어 feature preserve + 의상 L217 재지정 + 플랫 스튜디오 조명 유지
3. Generate + 다운로드 -> `char_coworker_jiyeon_setB_v2.png`
4. Reference 전체 삭제 (원복)
5. retry-count.json 갱신 (세트 B: attempts 2, final_version 2)
6. 메타 JSON `assets/_logs/char_coworker_jiyeon_setB_v2_meta.json` 기록 (standards 섹션 4.3, `references: ["char_coworker_jiyeon_setA_v1.png"]`)

**v2 프롬프트 원문**:

```
@img1 Strictly preserve the reference woman's appearance: her exact
facial features, late-20s Korean round-oval face shape, warm fair Korean
skin with subtle visible texture, softly-arched natural eyebrows, a light
pink lip tint, and subtle everyday eye makeup. Maintain her shoulder-length
straight-to-gentle-wave dark brown bob parted softly to one side with one
side tucked behind her right ear, the ends falling around the
jawline-to-collarbone area with subtle natural movement rather than
heat-curled rigid curls, a few strands softly framing her face without
looking styled-in.

A real photograph of the same 27-year-old Korean woman standing in
full-body vertical composition against a plain light gray studio
background with a clean matte concrete floor, flat even studio lighting,
2K cinematic frame. She faces the camera with a small warm unforced
smile -- the kind of gentle everyday expression people have when they're
friendly by default, not a performance.

She wears a fitted medium-dark navy wool-blend blazer unbuttoned over a
thin gray-striped white cotton blouse tucked into beige slim-fit tailored
slacks, with black pointed flat leather loafers. She wears small simple
gold stud earrings and a thin silver analog wristwatch on her left wrist;
no other jewelry.

Her left hand rests lightly at her side with fingers softly relaxed, her
right arm hangs naturally at her side with softly relaxed fingers.
Posture is upright but not stiff, weight slightly shifted to her right
leg, one shoulder sitting a fraction lower than the other -- a natural
everyday stance, not a rigid model pose. Her gaze meets the camera gently
with the small smile, present but unperformed.

This is a real photograph only, not an illustration, not a painting, not
anime, not a 3D render, not AI art, not a CGI composite. No text, no
watermark, no logo, no name tag anywhere in the frame. No rings, no
necklace, no hair accessories beyond what is listed. No additional jewelry
beyond the gold stud earrings and silver wristwatch. No crossbody bag, no
handbag, no tote in this shot. No tattoos visible. No sunglasses, no hat.
No patterned graphics or text printed on the clothing. No heavy makeup,
no false lashes, no bold lip color. No catalog-model posture, no runway
stance.
```

**Clause C(L156~L174) 대비 차이**:
- `"Her lighting is dictated by the scene, NOT the reference"` 문장 **의도적 제외** (ref 생성은 장면이 아닌 플랫 스튜디오 용도, 2단락에 직접 "flat even studio lighting" 재지정)
- `[CLIP-SPECIFIC WARDROBE]` placeholder -> 세트 B 의상 L217 6요소로 채움

**향후 동일 패턴 적용 대상**: 향후 캐릭터별 다른 의상 세트(예: 은서 세트 C 비 젖은, 은서 세트 D 퇴근 피곤, 민준 세트 B 등) 생성 시 반드시 기존 base ref를 `@img1`로 등록 후 의상 재지정 방식 사용.
