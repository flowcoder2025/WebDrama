# Step 2 계획 -- 로케이션 마스터 ref 16종 생성 (v2 재구조화)

**작성일**: 2026-04-19 (저녁, Cowork 파일명 동기화 A안 반영 + 1차 eval 8.53/10 REWORK 피드백 반영)
**목적**: Cowork `로케이션레퍼런스_v3.md 섹션 2.1~섹션 2.16` 16종 무인 establishing ref 생성 + Freepik 라이브러리 등록
**저장 위치**: `projects/나는괜찮아요/assets/refs/loc_*_v1.png`

---

## 0. 검증 근거 (SSOT 경로)

| 항목 | 경로, 라인 |
|---|---|
| 로케이션 원문 | `C:\Team-jane\Cowork\나는괜찮아요_로케이션레퍼런스_v3.md` 섹션 2.1~섹션 2.16 |
| 공통 원칙 | 섹션 1 (무인, 중립, 팔레트 고정, 픽셀 상속, 사용 흔적, 광고 회피, 자연어 1400~1700자, 네거티브 꼬리) |
| 등록 방침 | 섹션 3 "16개 로케이션 모두 **독립 생성**" (원문 L938 명시) |
| 슬롯 규약 | 섹션 4.0 / HANDOFF 섹션 2 Step 2 |
| 참조 규칙 | 섹션 4.1~섹션 4.6 (Step 3, Step 4에서 사용, Step 2 자체 생성에는 적용 안 됨) |
| HANDOFF 교체 명세 | 섹션 4.7 -- "16개 무인 로케이션 프롬프트를 순차 실행" + "불일치 시 **2번째만 재생성**하여 첫 번째를 앵커 기준으로 강제" (drift fallback 전용) |
| 검수 쌍 3조 | HANDOFF 섹션 2 Step 2 L65~L68 |
| 재시도 정책 | HANDOFF 섹션 4 "로케이션 연속성: 앵커 드리프트 재시도 2회, fallback 텍스트 강화 2회" |
| 파일명 정본 | PROJECT.md 섹션 4 각주 -- Cowork <-> WebDrama 1:1 매핑 (2026-04-19 21:28 동기화 완료) |
| 메타 JSON 스키마 | `docs/standards.md 섹션 4.3` (2026-04-19 `char_ref|loc_ref|anchor` enum 추가됨) |

## 0.1 파일명 (Cowork <-> WebDrama 1:1)

Cowork 동기화 완료로 양쪽 파일명 동일:

| loc_id | 파일명 |
|---|---|
| `loc_office_daytime` | `loc_office_daytime_v1.png` |
| `loc_home_oneroom` | `loc_home_oneroom_v1.png` |
| `loc_subway_morning` | `loc_subway_morning_v1.png` |
| `loc_busstop_rain_evening` | `loc_busstop_rain_evening_v1.png` |
| `loc_street_rain_cleared` | `loc_street_rain_cleared_v1.png` |
| `loc_cafe_night` | `loc_cafe_night_v1.png` |
| `loc_cafe_exterior` | `loc_cafe_exterior_v1.png` |
| `loc_alley_rain` | `loc_alley_rain_v1.png` |
| `loc_home_dining_cool` | `loc_home_dining_cool_v1.png` |
| `loc_home_dining_amber` | `loc_home_dining_amber_v1.png` |
| `loc_home_livingroom_window` | `loc_home_livingroom_window_v1.png` |
| `loc_home_hallway` | `loc_home_hallway_v1.png` |
| `loc_office_pantry` | `loc_office_pantry_v1.png` |
| `loc_sidewalk_after_rain` | `loc_sidewalk_after_rain_v1.png` |
| `loc_busstop_evening` | `loc_busstop_evening_v1.png` |
| `loc_sidewalk_morning` | `loc_sidewalk_morning_v1.png` |

**Freepik 라이브러리 등록명**: `loc_<id>` (버전, 확장자 없이, Cowork 섹션 4.7 지정)

## 0.2 공통 생성 조건

- Freepik NanoBanana2 / 2K / 16:9 / AI prompt OFF
- **16종 전부 Reference 등록 없이 텍스트 only 독립 생성** (Cowork 섹션 3 L938 "16개 로케이션 모두 독립 생성" + HANDOFF 섹션 2 Step 2 "순차 실행")
- 다운로드: `&preview=1` 제거 + Node `https.get()`
- 저장: `projects/나는괜찮아요/assets/refs/loc_<id>_v1.png`
- API 가로채기로 `creation.id` 직접 확보
- 다음 ref 전 원복: 프롬프트 클리어 (Ref 0개 상태 유지 -- 본 Step 2 정상 경로는 Ref 사용 없음)

## 0.3 NanoBanana2 슬롯 규약 (Cowork 섹션 4.0 / HANDOFF 섹션 2)

| 슬롯 | 용도 | Step 2 사용 여부 |
|---|---|---|
| `@img1` | 로케이션 마스터 | **정상 경로 사용 안 함**. 검수 drift fallback(섹션 4.2)에서만 기준 로케이션을 @img1로 Upload |
| `@img2` | 은서 (`char_eunseo`) | Step 2 사용 안 함 |
| `@img3` | EP1~3 시퀀스 앵커 / EP4 팬트리 지연 | Step 2 사용 안 함 |
| `@img4` | EP4 전용 시퀀스 앵커 | Step 2 사용 안 함 |

---

## 1. 공통 원칙 (Cowork 섹션 1 엄수)

1. **무인(無人)**: 인물 0명. 반사, 실루엣, 그림자 포함해 사람 흔적 0
2. **중립 establishing**: 미디엄 와이드, 카메라 높이 = 눈높이. 이후 클립 reframe 가능한 중립 앵글
3. **팔레트 고정**: FINAL 섹션 5 매트릭스 색온도, 무드를 프롬프트에 박아둠
4. **픽셀 상속 대상 명시**: 벽면, 창틀, 의자, 조명, 포스터, 바닥 등 후속 앵커 참조 요소를 문장 내 구체화
5. **사용된 흔적 (원칙 07)**: 새 공간 아닌 "사람이 살던 공간" (먼지, 얼룩, 벗겨짐, 자국)
6. **광고 회피 (원칙 06)**: 인테리어 카탈로그 톤 금지
7. **자연어 문장형 1400~1700자**, **네거티브 문장형 꼬리**
8. **출력**: 2K 가로 16:9 PNG

## 1.1 본 plan 추가 가드레일

9. **원문 엄격 준수**: Cowork 섹션 2.x 원문 프롬프트를 **그대로** 타이핑. 추가 디테일 주입 금지 (Step 1 eval 1차 ISSUE 1~5 교훈)
10. **줄바꿈 정규화**: NB2 contenteditable 입력 시 Cowork 섹션 2.x 원문의 **문단 구분 빈 줄과 단일 줄바꿈 모두 단일 공백(` `)으로 치환**. Step 1에서 검증된 정책 (민준 2280자, 지연 세트 A/B 2400자 케이스 전부 공백 정규화로 성공)
11. **원문 내 `loc_<id>` 텍스트 참조 그대로 유지**: 섹션 2.10, 섹션 2.15, 섹션 2.16의 `from loc_X` 같은 Cowork 원문 텍스트는 그대로 타이핑. (**NB2 해석 가정 없음 -- Cowork 작가 지정 원문이므로 변형 금지**)
12. **Step 2 정상 경로는 Reference 0개 상태 유지**: @img1 Upload는 검수 drift fallback(섹션 4.2)에서만 활성화

---

## 2. 생성 순서 (16종 독립, 4 그룹 -- EP별 배치)

전부 **독립 텍스트-only 생성**. 그룹은 EP별 묶음이고, **검수 쌍은 생성 직후 인접 배치**해 Read tool 대조를 즉시 수행.

### 그룹 1 -- EP1 로케이션 (5종)
| # | loc_id | 비고 |
|---|---|---|
| 1 | `loc_office_daytime` | EP1, EP4 공유 |
| 2 | `loc_home_oneroom` | EP1, EP2 공유 |
| 3 | `loc_subway_morning` | EP1 |
| 4 | `loc_busstop_rain_evening` | EP1 **+ 검수 쌍 #2 기준** (그룹 4 #16 evening과 비교) |
| 5 | `loc_street_rain_cleared` | EP1 |

### 그룹 2 -- EP2 로케이션 (3종)
| # | loc_id | 비고 |
|---|---|---|
| 6 | `loc_cafe_night` | EP2 메인 |
| 7 | `loc_cafe_exterior` | EP2 (Cowork 섹션 3 "독립 생성" 원칙 + 섹션 2.7 원문에 `loc_cafe_night palette -- same cafe` 텍스트 레퍼런스가 명시됐으므로 **원문 그대로 타이핑**) |
| 8 | `loc_alley_rain` | EP2 |

### 그룹 3 -- EP3 로케이션 + 검수 쌍 #1 (4종, 9, 10 인접)
| # | loc_id | 비고 |
|---|---|---|
| 9 | `loc_home_dining_cool` | EP3 **+ 검수 쌍 #1 기준** |
| 10 | `loc_home_dining_amber` | EP3 -- **검수 쌍 #1 대조 대상** (섹션 4 절차 즉시 적용) |
| 11 | `loc_home_livingroom_window` | EP3 |
| 12 | `loc_home_hallway` | EP3 C00 |

### 그룹 4 -- EP4 로케이션 + 검수 쌍 #2, #3 (4종, 14, 15, 16 인접)
| # | loc_id | 비고 |
|---|---|---|
| 13 | `loc_office_pantry` | EP4 |
| 14 | `loc_sidewalk_after_rain` | EP4 **+ 검수 쌍 #3 기준** (Cowork 섹션 2.16 L890에 "same width and paver pattern as loc_sidewalk_after_rain" 명시 -> `after_rain`이 기준, `morning`이 대조 대상) |
| 15 | `loc_sidewalk_morning` | EP1, EP4 공용 -- **검수 쌍 #3 대조 대상** (섹션 4 절차 즉시 적용) |
| 16 | `loc_busstop_evening` | EP4 -- **검수 쌍 #2 대조 대상** (기준은 그룹 1 #4 `loc_busstop_rain_evening`, 시차 12 단계 -- 섹션 4.3 시차 대응 절차 적용) |

---

## 3. 공간 공유 쌍 3조 (= HANDOFF 섹션 2 Step 2 검수 쌍)

Cowork 원문이 "같은 공간의 다른 시간, 조명"으로 **명시**한 쌍. 생성 후 픽셀 일치 대조 필수.

| # | 기준 | 대조 대상 | Cowork 원문 근거 |
|---|---|---|---|
| 1 | `loc_home_dining_cool` | `loc_home_dining_amber` | 섹션 2.10 "the same empty ... home dining area from loc_home_dining_cool, now at early evening" -- 공간 동일성 명시 |
| 2 | `loc_busstop_rain_evening` | `loc_busstop_evening` | 섹션 2.15 "the same Korean urban bus-stop shelter from loc_busstop_rain_evening, now on a dry warm evening" -- 공간 동일성 명시 |
| 3 | `loc_sidewalk_after_rain` | `loc_sidewalk_morning` | 섹션 2.16 L890 "the same width and paver pattern as loc_sidewalk_after_rain ... this is in fact the same stretch of city walk, documented at a different time of day" -- 공간 동일성 명시 |

**주의**: 위 3조는 **Cowork 원문에 공간 동일성이 텍스트로 명시된 유일한 쌍**. `cafe_night` / `cafe_exterior`는 섹션 2.7에 "same cafe palette"는 있으나 실체가 **내부 vs 외부**로 다른 공간이므로 검수 쌍이 아님 (1차 eval ISSUE 2 해소 -- 독립 생성으로 처리, 검수 대상 아님).

---

## 4. 검수 쌍 3조 대조, 재시도 절차

### 4.1 정상 경로 (Step 2 기본)
1. 대조 대상 생성 직후 Read tool로 **기준, 대조 대상** 이미지 로드하여 시각 대조
2. 체크: 벽, 창, 가구, 소품 **위치**가 눈대중으로 일치 (허용 오차: 가구 배치는 ±5% 이내, 색온도는 의도된 시간, 조명 변화 외 구조적 요소는 일치)
3. **일치**: PASS 기록 -> retry-count.json `last_verdict: PASS`
4. **구조 불일치**: REWORK -> 섹션 4.2 fallback 경로

### 4.2 Drift Fallback 경로 (Cowork 섹션 4.7 "2번째만 재생성" 명시 규약)
검수 쌍 대조 시 **구조 drift 발견**한 경우에만 활성화:

1. **기준 이미지(예: `loc_home_dining_cool_v1.png`)를 Freepik Upload** -> `@img1` 등록 (howto-reference.md Upload 탭 절차)
2. **대조 대상 재생성 프롬프트 강화**: Cowork 섹션 2.x 원문 앞에 한 줄 추가:
 ```
 @img1 MUST match @img1 pixel-precise: {공간 공유 구조 요소 나열 -- 벽, 창, 가구 위치}.
 ```
3. Generate -> 다운로드 -> **기존 `_v1.png` 덮어쓰지 않고 `_v2.png`로 신규 저장** (standards 섹션 2.1 "재작업 v<N+1> 신규 생성, 이전 버전 보존")
4. Reference 삭제 원복
5. 재시도 최대 **2회** (HANDOFF 섹션 4 로케이션 연속성 상한)
6. 2회 실패 시 CYH 피드백 루프 (HANDOFF 섹션 4 fallback)

### 4.3 시차 대응 (검수 쌍 #2 `busstop_rain_evening` <-> `busstop_evening`)
생성 순서 #4 -> #16은 약 12 단계 시차. Freepik Upload 세션 리셋 가능성:

1. #16 `loc_busstop_evening` 생성 직후 Read tool로 기준 `loc_busstop_rain_evening_v1.png`(이미 로컬 저장) 시각 대조
2. Drift 발견 시 섹션 4.2 fallback 활성화 -- 이 시점에 Upload 신규 실행 (세션 리셋 영향 없음, 그 세션 내 즉시 Upload)

### 4.4 cafe 검수 없음
`loc_cafe_night` / `loc_cafe_exterior`는 Cowork 섹션 2.7 "same cafe palette"에 **팔레트만 공유**, 공간 실체(내부 vs 외부)는 다름. 검수 쌍 아님. 각각 독립 생성 PASS만 확인.

---

## 5. 생성 절차 (16종 공통)

### 5-A. 정상 경로 (기본)

1. **이미지 탭 활성화** (`bringToFront()` + URL 확인)
2. **초기 상태 확인**: Ref 0개 / 프롬프트 empty / 2K / 16:9 / AI prompt OFF
3. **프롬프트 클리어**: 이전 프롬프트 Ctrl+A -> Backspace
4. **프롬프트 타이핑**: Cowork 섹션 2.x 원문 그대로 (섹션 1.1-10 공백 정규화, 섹션 1.1-9 추가 디테일 금지, 섹션 1.1-11 `loc_<id>` 원문 텍스트 유지)
5. **Generate 전제 검증**: `generate-button disabled === false` / GenerateUnlimited 텍스트 / Ref 0개
6. **API 가로채기 설정**: `start-tti-v2.family` -> `render/v4.creation.id`
7. **Generate 클릭** -> `creation.id` 확보 (~5s) -> 갤러리 render URL 대기 (~35~60s)
8. **다운로드**: `src.replace(/[?&]preview=1/, '')` + Node `https.get()` -> `loc_<id>_v1.png`
9. **Compliance 체크** (섹션 6 체크리스트)
10. **검수 쌍 해당 시**: 섹션 4.1 대조 즉시 수행
11. **다음 ref 전 원복**: 프롬프트 클리어 (Ref 0개 상태 유지)

### 5-B. Drift Fallback 경로 (섹션 4.2 활성화 시에만)

1~3. 5-A Step 1~3과 동일
4. **기준 로케이션 Upload** (RAG `howto-reference.md` Upload 탭):
 - Add 모달 오픈 (`reference-add-button` 좌표 클릭)
 - Upload 탭 전환 (`reference-sidebar-upload`)
 - `fileInput.uploadFile(assets/refs/loc_<기준>_v1.png)` -> 4초 대기
 - Add 버튼 (`advanced-selection-add-images-button`) 클릭 -> `@img1` 등록 검증
5. **프롬프트 타이핑 (멘션 포함)**:
 - `@img1` 5글자 타이핑 (delay 50ms) -> 600ms 대기 -> **Enter로 멘션 확정** -> 600ms 대기
 - 본문 타이핑: "MUST match @img1 pixel-precise: {요소 나열}. " + Cowork 섹션 2.x 원문
6~8. 5-A Step 5~7과 동일
9. **다운로드** -> `loc_<대조>_v2.png` (v1은 보존)
10. **Compliance 체크** + 섹션 4.1 재대조
11. **Reference 전체 삭제** (howto-reference.md 전체 삭제 while 루프) + 프롬프트 클리어

---

## 6. Compliance 체크리스트 (로케이션 1종당)

### 공통 (16종 전부)
- [ ] 2K 16:9 landscape
- [ ] **인물 0명** (실루엣, 반사, 그림자 포함)
- [ ] 미디엄 와이드 establishing (카메라 눈높이)
- [ ] 팔레트 = FINAL 섹션 5 매트릭스 색온도
- [ ] 소품, 가구 픽셀 상속 대상 가시
- [ ] 사용된 흔적 (먼지, 얼룩, 자국)
- [ ] 광고 카탈로그 톤 없음
- [ ] 네거티브 위반 0 (가독 텍스트, 로고, 브랜드명, 드론, 피쉬아이, 잡지 스타일링)

### 공간 공유 쌍 대조 전용 (검수 쌍 3조)
- [ ] 기준과 **구조, 소품 위치 일치** (섹션 4.1 허용 오차 기준)
- [ ] 시간, 조명, 날씨만 다름 (공간 identity 보존)

---

## 7. Freepik 라이브러리 등록 방침 (섹션 11 미해결 1 결정 승격)

**본 Step 2 세션에서는 로컬 파일 저장까지만**. Freepik 영구 라이브러리 등록은 **Step 3 앵커 생성 직전 일괄 처리**.

**이유**:
- Freepik Reference 슬롯이 세션마다 리셋될 수 있어 Step 2 종료 후 Step 3 시작 시 재업로드 필요
- Step 3 앵커는 각 시퀀스당 **@img1에 해당 로케이션 ref 배정 + @img2에 은서 + 필요 시 @img3 등 동반 배정**이므로 앵커 생성 시점에 일괄 준비가 효율적
- Step 2 세션 종료 시 상태: 16개 PNG 파일 `assets/refs/` 저장 완료 + Freepik Reference 0개 (깨끗한 원복)

## 7.1 검수 쌍 대조 기준 (섹션 11 미해결 2 결정 승격)

공간 공유 쌍 3조 대조 시 **PASS/FAIL 기준**:
- **PASS**: 벽, 창, 가구, 주요 소품의 **상대적 위치**가 눈대중으로 일치 (가구 배치 ±5%, 창, 출입구 위치 ±1 단위). 시간, 조명, 날씨 변화는 허용 범위 내.
- **FAIL**: **구조 자체가 다름** (예: 창이 반대쪽으로 이동, 식탁 개수가 달라짐, 천장/바닥 재질 다름)
- **주관성 최소화**: Read tool로 이미지 2개 동시 로드 후 섹션 3 기준 테이블의 명시 요소를 1건씩 체크

---

## 8. 재시도, fallback (HANDOFF 섹션 4)

| 실패 유형 | 재시도 | Fallback |
|---|---|---|
| 인물 출현 (네트워크 효과) | 2회 | 네거티브 강화 "absolutely no human figures, no silhouettes, no reflections of people" (Cowork 섹션 2 원문에 이미 포함, 재시도 시 앞쪽으로 이동) |
| 팔레트 드리프트 | 2회 | Kelvin 값 명시 강화 ("approximately 2700K amber" 등) |
| 공간 구조 drift (검수 쌍만 해당) | 2회 | 섹션 4.2 fallback 경로 활성화 (기준 @img1 Upload + 강화 문구) |
| 3회 전부 실패 | -- | CYH 피드백 루프 (HANDOFF 섹션 4) |

재시도 카운트: `projects/나는괜찮아요/.session/retry-count.json`에 `"loc_<id>": {"attempts": N, "last_verdict": ...}` 기록.

---

## 9. 메타 JSON (standards.md 섹션 4.3)

각 로케이션 ref 생성 완료 시 `projects/나는괜찮아요/assets/_logs/loc_<id>_v1_meta.json` 저장:

```json
{
 "asset": "loc_<id>_v1.png",
 "type": "loc_ref",
 "created_at": "2026-04-19T...+09:00",
 "version": 1,
 "attempts": N,
 "engine": "NanoBanana2",
 "references": [],
 "prompt_source": "Cowork/나는괜찮아요_로케이션레퍼런스_v3.md 섹션 2.X",
 "negative_source": "Cowork 섹션 2.X 원문 네거티브 꼬리",
 "params": { "resolution": "2K", "ratio": "16:9", "aspect": "landscape" },
 "api_ids": { "creation_id": "...", "family": "...", "render_prod_id": "..." },
 "chained_from": null,
 "compliance_notes": [...]
}
```

**drift fallback으로 v2 생성 시** `"references": ["loc_<기준>_v1.png"]`, `"api_ids"`에 `"ref_upload_prod_id"` 추가.

**standards 섹션 4.3 enum 확장 완료** (2026-04-19): `type`에 `char_ref|loc_ref|anchor` 추가됨.

---

## 10. 리스크, 가드레일

| 리스크 | 대응 |
|---|---|
| 인물 침입 (NB2가 가끔 사람 포함) | Cowork 섹션 2 원문 네거티브에 "No people, no hands, no figures" 이미 포함. 재시도 시 네거티브를 프롬프트 앞쪽으로 이동 |
| 검수 쌍 공간 drift | 섹션 4.1 대조 -> drift 발견 시 섹션 4.2 fallback 경로 (기준 @img1 Upload + 강화 문구, Cowork 섹션 4.7 명시 규약) |
| cafe 쌍 혼동 | 섹션 2.7 "same palette"이지만 내부/외부 다른 공간. 검수 쌍 아님을 섹션 3, 섹션 4.4에 명시 |
| 대조 주관성 | 섹션 7.1 PASS/FAIL 기준 명시 + Read tool로 2개 이미지 동시 로드 + 섹션 3 요소 체크 |
| 파일명 혼동 | Cowork 동기화 완료로 1:1 매핑 (섹션 0.1 표) |
| Freepik 세션 리셋 | 섹션 7 결정: Step 3 직전 일괄 재등록. 섹션 4.3 시차 대응(busstop 쌍) 명시 |
| 검수 쌍 #2 시차 (#4 -> #16) | 섹션 4.3 절차: #16 생성 직후 로컬 `_v1.png` Read -> 시각 대조. Upload는 drift 시점에만 신규 실행 |
| 민준 같은 좌우 반전 | 로케이션은 공간 구조라 영향 미미. 검수 쌍 대조 시 카메라 각도 반전 여부 확인 |
| 원문에 없는 디테일 주입 (Step 1 ISSUE 교훈) | 섹션 1.1-9 "원문 엄격 준수" + 섹션 11 (해소된 판단 포인트 없음, 전 항목 plan에서 결정 완료) |
| 긴 프롬프트 후반 가중치 하락 | 각 로케이션 1400~1700자 (RAG 원칙 10 권장 범위 내) |
| contenteditable 멘션 확정 실수 | 섹션 5-B Step 5: `@img1` 타이핑 -> 600ms -> Enter -> 600ms 패턴 (howto-generate-image.md 검증 패턴) |

---

## 11. 본 plan의 결정 사항 (사용자 판단 불필요)

1차 plan 섹션 11에 있던 미해결 3건은 전부 plan 본문에서 결정 반영:
- (구 섹션 11-1) Freepik 영구 등록 시점 -> **섹션 7 Step 3 직전 일괄** (결정 완료)
- (구 섹션 11-2) 검수 쌍 대조 기준 -> **섹션 7.1 PASS/FAIL 기준 명시** (결정 완료)
- (구 섹션 11-3) cafe_exterior 파생 처리 여부 -> **독립 생성** (섹션 2, 섹션 3, 섹션 4.4 명시, Cowork 섹션 3 "16종 독립 생성" 원문 충실)

---

## 12. 1차 eval 피드백 반영 이력 (8.53/10 REWORK -> 10점 타겟)

| ISSUE | 원인 | 수정 내역 |
|---|---|---|
| 1. Critical. 파생 4쌍 Upload 자동 전환 근거 부재 | Cowork 섹션 3 "16종 독립 생성" 원문과 충돌 | **섹션 2, 섹션 3, 섹션 5 전면 재구조화** -- 16종 전부 독립 텍스트-only 정상 경로. @img1 Upload는 섹션 4.2 drift fallback에서만 활성화 (Cowork 섹션 4.7 "2번째만 재생성" 명시 규약 준수) |
| 2. Critical. cafe_exterior 내부 모순 | 섹션 11 미해결 vs 섹션 2, 섹션 3 파생 확정 | 섹션 3 공간 공유 쌍 3조로 축소, cafe는 섹션 4.4 "검수 쌍 아님" 명시. ISSUE 1 해결로 자동 해소 |
| 3. Major. standards 섹션 4.3 enum 위반 | `loc_ref`가 enum에 없음 | **standards.md 섹션 4.3 enum 확장 반영 완료** (2026-04-19) -- `char_ref\|loc_ref\|anchor` 추가. 섹션 9 "standards 섹션 4.3 enum 확장 완료" 명시 |
| 4. Major. busstop 검수 쌍 시차 | #4 -> #16 12 단계, Upload 세션 리셋 | **섹션 4.3 시차 대응 절차 추가** -- #16 생성 직후 로컬 `_v1.png` Read 시각 대조. Upload는 drift 발견 시 그 세션 내 즉시 실행 (세션 리셋 영향 없음) |
| 5. Minor. NB2 텍스트 해석 가정 근거 없음 | 1차 섹션 3 L129 근거 부재 문장 | **섹션 1.1-11로 교체**: "원문 내 `loc_<id>` 텍스트 참조 그대로 유지 -- NB2 해석 가정 없음, Cowork 작가 지정 원문이므로 변형 금지". 추론 근거 제거. |
| 6. Minor. 줄바꿈 정규화 세부 | 공백 정규화 정책 모호 | 섹션 1.1-10 명시: "문단 구분 빈 줄과 단일 줄바꿈 모두 단일 공백(` `)으로 치환" + Step 1 검증 사례 인용 |
| 7. Minor. 멘션 타이핑 세부 | contenteditable dropdown 확정 절차 | 섹션 5-B Step 5 명시: `@img1` 타이핑(delay 50ms) -> 600ms -> Enter -> 600ms (howto-generate-image.md 검증 패턴) |
| 8. Minor. 섹션 11-1 Freepik 등록 시점 판단 불필요 | 섹션 6-B로 이미 결정 | **섹션 7 결정 승격**, 섹션 11에서 삭제. 섹션 11은 결정 사항 나열로 재정의 |

### 핵심 구조 변경 요약

- **정상 경로**: 16종 전부 독립 텍스트-only (섹션 5-A) + 검수 쌍 3조 즉시 대조 (섹션 4.1)
- **Fallback 경로**: drift 발견 시에만 기준 @img1 Upload + 강화 문구 (섹션 4.2 = Cowork 섹션 4.7 "2번째만 재생성" 명시 규약)
- **파생 관계 4쌍 개념 폐기**: Cowork 원문은 "공간 공유 쌍 3조"만 명시 (검수 쌍 = 섹션 3 = HANDOFF 섹션 2). cafe 쌍은 독립 생성 후 대조 없음.
