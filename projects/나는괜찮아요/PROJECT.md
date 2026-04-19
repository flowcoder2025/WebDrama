# 나는 괜찮아요 — 프로젝트 메타

**작품명**: 나는 괜찮아요
**유형**: 웹드라마 (감정 드라마 / 내면 독백 / 일상 회복)
**범위**: 시즌 1 (EP1~EP4) / 66 클립 / 약 12분
**상위 프로젝트**: `C:\Team-jane\Cowork\` (스토리·시나리오·프롬프트)
**본 디렉토리**: WebDrama 내 이미지·영상·음성·편집 실행 전용
**기준 버전**: Cowork v3.1 (2026-04-19 freeze)

---

## 1. Cowork SSOT 링크 (단일 진입점)

```
단일 진입점: C:\Team-jane\Cowork\나는괜찮아요_터미널세션_HANDOFF_v3.1.md
```

### 읽는 순서 (HANDOFF v3.1 §1.1)
1. `나는괜찮아요_시즌1_프롬프트북_v3_FINAL.md` — 단일 진입점, 시즌 개요 + 66 클립 인덱스 + 앵커 매트릭스
2. `나는괜찮아요_공통프롬프트원칙.md` — 원칙 v3 Part 1~15
3. `나는괜찮아요_캐릭터레퍼런스_v3.md` — 캐릭터 3종 + 의상 슬롯 + Clause A/B/C/C-EP4/D
4. `나는괜찮아요_시즌1_프롬프트북_v3_EP1.md` / EP2.md / EP3.md / EP4.md — 클립별 프롬프트 원문
5. `나는괜찮아요_편집배포규격_v3.md` — EDL + 쇼츠 크롭 + 배포 체크리스트
6. `나는괜찮아요_EP{1~4}/ep<n>-full-script.md` — 내러티브 대본
7. `나는괜찮아요_시즌1_제작패키지.docx` — 전체 인쇄용 요약본

### 1.1 Cowork 버전 감지 (세션 시작 시 체크)

Cowork가 상위 프로젝트에서 갱신될 수 있으므로, 세션 시작 시 **파일 mtime**을 본 문서 기록치와 비교:

```bash
# 마지막 동기화 시점 (mtime 기록)
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_터미널세션_HANDOFF_v3.1.md"
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_시즌1_프롬프트북_v3_FINAL.md"
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_공통프롬프트원칙.md"
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_캐릭터레퍼런스_v3.md"
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_로케이션레퍼런스_v3.md"
stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_편집배포규격_v3.md"
```

**본 PROJECT.md가 기준으로 삼은 Cowork 파일 mtime (2026-04-19 21:28 기준, 파일명 동기화 A안 반영 완료)**:
- `HANDOFF_v3.1.md`: 2026-04-19 21:17 (Step 2 재정의 + 로케이션레퍼런스 분책 반영)
- `프롬프트북_v3_FINAL.md`: 2026-04-19 21:28 (파일명 동기화 반영)
- `공통프롬프트원칙.md`: 2026-04-19 21:28 (파일명 동기화 반영)
- `캐릭터레퍼런스_v3.md`: 2026-04-19 21:28 (파일명 동기화 — `_base_v1` / `_setA_v1` / `_setB_v1` 정본화)
- `로케이션레퍼런스_v3.md`: 2026-04-19 21:28 (파일명 동기화 — `loc_<id>_v1.png` 정본화)
- `편집배포규격_v3.md`: 2026-04-19 03:33
- `프롬프트북_v3_EP1~EP4.md`: 2026-04-19 03:29~03:32

> **파일명 규약 동기화 완료** (2026-04-19 21:28): Cowork 전체 문서 `_ref_v1` 표기를 standards 형식(`_v<n>`)으로 일괄 업데이트. 캐릭터는 `_base_v1` / `_setA_v1` / `_setB_v1`(슬롯 분리), 로케이션은 `loc_<id>_v1.png`. Cowork ↔ WebDrama 1:1 매핑 확보. 파일 내용·슬롯 규약·참조 관계 변화 없음, 접미사만 통일. `grep -r "_ref_v" /c/Team-jane/Cowork/` 결과 0건.

### 1.2 Cowork 업데이트 발견 시 갱신 절차

mtime이 기준보다 **새로우면**:
1. **본 문서 어느 섹션이 영향받는지 체크**:
   - HANDOFF 변경 → §1.1 읽는 순서 재확인 + §12 작업 순서 영향 점검
   - FINAL 변경 → §2 시즌 구조, §4 로케이션, §11 품질 기준 재확인
   - 캐릭터레퍼런스 변경 → §3 캐릭터 매트릭스 재동기화
   - 편집배포규격 변경 → §9 발사 전 12항, §10 EP별 체크포인트 재확인
   - 프롬프트북 EP<n> 변경 → §6 체인 주입 매핑표 재동기화
   - 공통원칙 변경 → §7 프레임 체이닝, §8 립싱크, §12-D fallback 재확인

2. **원문 표 병합**: 본 문서의 §6·§7·§8·§9 원문 표가 stale해지므로 해당 Cowork 섹션에서 신규 내용 복사

3. **버전 기록**: §14 버전 히스토리에 새 항목 추가 (예: "v3.2 2026-MM-DD — {변경 요지}")

4. **기준 mtime 갱신**: §1.1 mtime 기록치 업데이트

---

## 2. 시즌 구조 (FINAL §1)

| EP | 부제 | 클립 수 | 러닝 | 핵심 기둥 | 팔레트 아크 |
|---|---|---|---|---|---|
| **EP1** | 오늘도 괜찮아요 | 18 | ~2분 50초 | 습관으로서의 "괜찮아요" | 쿨 지배 → 앰버 비 |
| **EP2** | 괜찮았다고 말했어요 | 16 | ~3분 15초 | 과거 "괜찮았다" 봉인 자각 | 앰버(착각) → 쿨(자각) |
| **EP3** | 엄마, 하고 불렀어요 | 16 | ~3분 15초 | 처음 입 밖으로 꺼낸 "불러봄" | 쿨(혼자) → 앰버(연결) |
| **EP4** | 요즘, 좀 힘들어요 | 16 | ~3분 20초 | 처음 받아들여지는 "괜찮지 않음" | 혼합 안정 (EP1 수미상관) |

**수미상관**: EP1 C00 ↔ EP4 C15 버스정류장 동일 앵글, 반대 빛. EP1 "괜찮아요" 4회 ↔ EP4 0회.

---

## 3. 캐릭터 매트릭스 (HANDOFF §2 Step 1 / 캐릭터레퍼런스_v3)

| char_id | 한글 표기 | 나이·성별 | 등장 EP | 의상 슬롯 | ref 파일 |
|---|---|---|---|---|---|
| `char_eunseo` | 은서 | 29세 여 | 전 EP | A(출근)/B(홈웨어)/C(비 젖은 A)/D(퇴근 피곤) + EP3 전용(오트밀 니트+포니테일) | `assets/refs/char_eunseo_base_v1.png` (재활용) |
| `char_exlover` | 민준 | 28세 남 | EP2~ | 네이비 봄버 + 화이트 크루넥 + 인디고 진 | `assets/refs/char_exlover_base_v1.png` (신규) |
| `char_coworker_jiyeon` | 지연 | 27세 여 | EP1 배경 / EP4 주역 | A(블러시 블라우스, EP1) / B(네이비 블레이저, EP4) | `assets/refs/char_coworker_jiyeon_setA_v1.png` + `_setB_v1.png` (신규) |
| `char_mom` | 엄마 | 중년 여 | EP3 | **음성 전용** (이미지 ref 없음) | — |

> **파일명 정본** (2026-04-19 21:28 동기화 완료): Cowork `캐릭터레퍼런스_v3.md`도 `_base_v1` / `_setA_v1` / `_setB_v1` 형식으로 업데이트 반영됨. Cowork ↔ WebDrama 1:1 매핑. `docs/standards.md §1.1 char_<id>_<slot>_v<n>.png` 패턴과 일치.

### 핵심 제약
- **은서 골드 체인**: EP1·EP2만 착용. EP3·EP4 금지 (CU 시 오인 생성 방지)
- **은서 헤어**: EP3 낮은 포니테일. EP1·EP2·EP4 어깨길이 내림
- **지연 의상**: EP1 = 세트 A (뒷모습/측면만, ref 없이 텍스트 묘사). EP4 = 세트 B (face-on 최초)
- **지연 face-on 최초 공개**: EP4 C06
- **민준 액세서리**: 왼손 실버 아날로그 시계. 반지·목걸이 금지

### Reference Binding Clause 4 variants
- **A**: `char_eunseo` (Her)
- **B**: `char_exlover` (His)
- **C**: `char_coworker_jiyeon` (Her, 세트 A 기본)
- **C-EP4**: `char_coworker_jiyeon` (Her, 세트 B 전용)
- **D**: 다인물 결합 (A+B, A+C, OTS·크로스·투샷용)

---

## 4. 로케이션 매트릭스 (FINAL §5, 16종)

| 로케이션 코드 | EP | 팔레트 |
|---|---|---|
| `loc_office_daytime` | EP1, EP4 | 쿨 형광등 + 모니터 블루 |
| `loc_home_oneroom` | EP1, EP2 | 쿨 → 앰버 혼합 |
| `loc_subway_morning` | EP1 | 쿨 백열 + 창 빛 |
| `loc_busstop_rain_evening` | EP1 | 앰버 가로등 + 쿨 비 |
| `loc_street_rain_cleared` | EP1 | 앰버 반영 |
| `loc_cafe_night` | EP2 | 앰버 내 / 쿨 외 |
| `loc_cafe_exterior` | EP2 | 앰버·쿨 경계 |
| `loc_alley_rain` | EP2 | 쿨 비 + 앰버 등불 |
| `loc_home_dining_cool` | EP3 | 쿨 6000K + 창 블루 |
| `loc_home_dining_amber` | EP3 | 앰버 2700K 식탁등 |
| `loc_home_livingroom_window` | EP3 | 창 역광 (쿨→앰버 전환) |
| `loc_home_hallway` | EP3 | 낮은 쿨 간접광 |
| `loc_office_pantry` | EP4 | 따뜻한 백색 LED + 창 오후 |
| `loc_sidewalk_after_rain` | EP4 | 앰버 가로등 + 웅덩이 반영 |
| `loc_busstop_evening` | EP4 | 따뜻한 앰버 (EP1 반대 빛) |
| `loc_sidewalk_morning` | EP1, EP4 | 쿨 아침 빛 (EP4 C01 = EP1 C00 공간 재사용) |

> **프롬프트 원문 출처**: `C:\Team-jane\Cowork\나는괜찮아요_로케이션레퍼런스_v3.md §2.1~§2.16` (무인 establishing 16종 독립 프롬프트, 2026-04-19 21:10 분책).
>
> **파일명 정본** (2026-04-19 21:28 동기화 완료): Cowork `로케이션레퍼런스_v3.md §3`도 `loc_<id>_v1.png` 형식으로 업데이트 반영됨 (예: `loc_office_daytime_v1.png`). `docs/standards.md §1.1 loc_<code>_v<n>.png` 패턴과 일치, Cowork ↔ WebDrama 1:1 매핑. Freepik 라이브러리 등록명은 `loc_<id>` (버전·확장자 없이) 그대로 사용.
>
> **검수 쌍** (HANDOFF §2 Step 2 / 로케이션레퍼런스 §4.7): 공간 공유 쌍 생성 후 픽셀 일치 대조 필수. 불일치 시 **두 번째만 재생성**하여 첫 번째를 앵커 기준으로 강제.
> - `loc_home_dining_cool` ↔ `loc_home_dining_amber` (EP3, 시간·조명만 다름)
> - `loc_busstop_rain_evening` ↔ `loc_busstop_evening` (EP1 ↔ EP4 수미상관 척추)
> - `loc_sidewalk_morning` ↔ `loc_sidewalk_after_rain` (EP1·EP4 공용 인도)
>
> **NanoBanana2 슬롯 규약** (로케이션레퍼런스 §4.0, HANDOFF §2 Step 2):
> - `@img1` = 로케이션 마스터 (`loc_*`) — **모든 클립 Step 0 헤더 필수 선언**
> - `@img2` = 은서 (`char_eunseo`)
> - `@img3` = EP1·EP2·EP3 시퀀스 앵커 / **EP4 팬트리(두 인물 공존) 한정 = 지연(`char_coworker_jiyeon`)**
> - `@img4` = EP4 전용 시퀀스 앵커 (`@img3`가 지연에 점유된 경우)

---

## 5. 앵커 컷 9종 (HANDOFF §2 Step 3)

**일반 Start Image보다 먼저 생성하고 Freepik 라이브러리에 등록**해야 이후 체인 클립이 참조 가능.

| 앵커 ID | EP | 기반 클립 |
|---|---|---|
| `office_anchor_ep1_c00` | EP1 | C00 기반 |
| `busstop_anchor_ep1_c10` | EP1 | C10 기반 (EP4 C15도 크로스 참조) |
| `cafe_anchor_ep2_c01` | EP2 | C01 기반 |
| `alley_anchor_ep2_c12` | EP2 | C12 기반 |
| `home_dining_cool_anchor_ep3_c01` | EP3 | C01 기반 |
| `livingroom_anchor_ep3_c09` | EP3 | C09 기반 |
| `home_dining_amber_anchor_ep3_c13` | EP3 | C13 기반 (C01 이중 참조) |
| `pantry_anchor_ep4_c05` | EP4 | C05 기반 |
| `street_rain_cleared_anchor_ep4_c13` | EP4 | C13 기반 |

출력: `assets/anchors/{anchor_id}_v1.png`

---

## 6. 체인 주입 38 클립 — 전체 매핑 표

체인 대상 클립은 Start Image 프롬프트 **최상단** (Step 0 Reference Binding Clause 첫 줄)에 아래 주입 문구를 삽입한 후 Freepik 호출. EP4는 `@img3` 대신 `@img4`를 사용 (두 인물 동시 등장으로 `@img3` 자리 충돌 방지).

### 6.1 EP1 (8 클립) — 출처: `프롬프트북_v3_EP1.md §2.5`
| 시퀀스 | 앵커 | 체인 대상 | 주입 문구 |
|---|---|---|---|
| 오피스 주간 | `office_anchor_ep1_c00` | C05, C06, C07, C08, C09 | `@img3 = office_anchor_ep1_c00 (sequence anchor). Props, wall details, lighting positions, and floor/ceiling geometry MUST match @img3 pixel-precise.` |
| 버스정류장 비 | `busstop_anchor_ep1_c10` | C11, C12, C13 | `@img3 = busstop_anchor_ep1_c10 (sequence anchor). Shelter pillars, streetlamp position, bench, posters, and wet ground reflections MUST match @img3 pixel-precise. Wetness level advances per clip (T1→T3).` |

**주의**: 인서트(C05·C09·C12)는 `@img2` 없음, `@img3`만 추가.

### 6.2 EP2 (11 클립) — 출처: `프롬프트북_v3_EP2.md §2.5`
| 시퀀스 | 앵커 | 체인 대상 | 주입 문구 |
|---|---|---|---|
| 카페 내부 | `cafe_anchor_ep2_c01` | C02, C03, C04, C05, C06, C07, C08, C09, C10 | `@img3 = cafe_anchor_ep2_c01 (sequence anchor). Table position, chair geometry, banquette pattern, pendant-lamp placement, coffee-cup positions, window-rain pattern MUST match @img3 pixel-precise. Amber→cool LUT shift in grading only.` |
| 골목 비 | `alley_anchor_ep2_c12` | C13, C14 | `@img3 = alley_anchor_ep2_c12 (sequence anchor). Alley wall textures, puddle placements, signage silhouettes, and streetlamp positions MUST match @img3 pixel-precise.` |

**주의**: C06→C07 LUT 전환 경계. Start Image는 앵커 동일 상속, Kling·색보정에서만 톤 분기.

### 6.3 EP3 (11 클립) — 출처: `프롬프트북_v3_EP3.md §3.5`
| 시퀀스 | 앵커 | 체인 대상 | 주입 문구 |
|---|---|---|---|
| 홈 다이닝 쿨 | `home_dining_cool_anchor_ep3_c01` | C02, C03, C04, C05, C06, C07, C08 | `@img3 = home_dining_cool_anchor_ep3_c01 (sequence anchor). Dining table surface, chair position, window frame, wall pattern, tableware layout MUST match @img3 pixel-precise.` |
| 거실 창가 | `livingroom_anchor_ep3_c09` | C10, C11, C12 | `@img3 = livingroom_anchor_ep3_c09 (sequence anchor). Window frame, curtain fold, floor wood texture, and furniture edges MUST match @img3 pixel-precise.` |
| 홈 다이닝 앰버 (이중 참조) | `home_dining_amber_anchor_ep3_c13` + `home_dining_cool_anchor_ep3_c01` | C14 | `@img3 = home_dining_amber_anchor_ep3_c13 (sequence anchor). @img4 = home_dining_cool_anchor_ep3_c01 (cool mirror). Framing and geometry mirror @img4; only the lighting and LUT shift to amber per @img3.` |

### 6.4 EP4 (9 클립) — 출처: `프롬프트북_v3_EP4.md §3.5` — **앵커는 `@img4`**
| 시퀀스 | 앵커 | 체인 대상 | 주입 문구 |
|---|---|---|---|
| 오피스 팬트리 | `pantry_anchor_ep4_c05` | C06, C07, C08, C09, C10, C11, C12 | `@img4 = pantry_anchor_ep4_c05 (sequence anchor). Counter surface, espresso machine, cabinet handles, sugar jar position, pendant-light direction MUST match @img4 pixel-precise. Two-shot proximity forbidden — OTS / cross / insert framing per Clause D.` |
| 비 갠 인도 | `street_rain_cleared_anchor_ep4_c13` | C14 | `@img4 = street_rain_cleared_anchor_ep4_c13 (sequence anchor). Puddle reflections, storefront lights, signage positions, sidewalk brick pattern MUST match @img4 pixel-precise.` |
| 버스정류장 피날레 (크로스-EP) | `busstop_anchor_ep1_c10` | C15 | `@img4 = busstop_anchor_ep1_c10 (cross-episode mirror anchor). Shelter pillars, streetlamp, bench, overall angle MUST match @img4 pixel-precise for season symmetry. Wetness level T3→dry.` |

**주의**: EP4 C15는 20s 단일 편집 블록 — 첫 10s / 둘째 10s 모두 앵커 참조.

### 6.5 통합 통계
- 총 체인 대상 클립: **EP1 8 + EP2 11 + EP3 11 + EP4 9 = 38 클립**
- `@img3` 사용: EP1, EP2, EP3 (30 클립)
- `@img4` 사용: EP3 C14 이중참조 + EP4 전체 (10 클립)

---

## 7. 프레임 체이닝 8쌍 — 실행 절차

Kling `last→first seed` 체이닝 강제 대상 (Cowork 공통원칙 §12-B):

| 쌍 | 방식 | 이유 |
|---|---|---|
| EP1 C10 → C11 | last→first seed | 버스정류장 비 젖음 연속 |
| EP1 C15 → C16 → C17 | last→first seed (2홉) | 수미상관 앵글 고정 |
| EP2 C03 → C04 | ref chain | 카페 OTS 페어, 포즈 고정 |
| EP3 C01 → C02 | ref chain | 홈 다이닝 정적 연속 |
| EP3 C09 → C10 | last→first seed | "…엄마" 직전 침묵 유지 |
| EP3 C13 → C14 | ref chain | 앰버 pivot 후 정리 |
| EP4 C05 → C06 → C07 | last→first seed (2홉) | 팬트리 진입 연쇄 |
| EP4 C09 → C10 | last→first seed | K6 포즈 유지, 실토 결정 |

### 7.1 Kling 프롬프트 부가 라인 (공통원칙 §12-C)

체이닝 대상 Kling 프롬프트 말미에 삽입:
```
Continuity: This clip begins at the exact frame the previous clip ended.
Character pose, props, and lighting MUST match the previous clip's final frame.
Camera may shift gently but the subject's body position remains identical.
```

### 7.2 **"Kling이 last→first seed 거부" fallback 실행 절차 (공통원칙 §12-D)**

Kling 2.5는 기본적으로 Start Image만 참조 (End Frame 주입 불가). seed 체이닝이 엔진단에서 불가할 때:

**절차**:
1. 이전 클립 마지막 프레임 추출 (FFmpeg):
   ```bash
   ffmpeg -sseof -0.04 -i assets/motions/ep<n>/ep<n>_c<prev>_v1.mp4 \
     -frames:v 1 assets/motions/ep<n>/ep<n>_c<prev>_lastframe.png
   ```
2. 해당 last frame을 NanoBanana2에 **Reference 이미지로 업로드** (`howto-reference.md` 참조 — Upload 탭 → uploadFile)
3. 다음 클립 Start Image **재생성** — 업로드된 last frame을 `@img2` 또는 `@img<n>` 으로 멘션 포함:
   ```
   @img2 The scene continues from the exact last frame of the previous clip.
   <<원본 Start Image 프롬프트 Step 0~7>>
   ```
4. 재생성된 Start Image를 Kling의 새 Start Image로 투입 (`howto-generate-video.md`)
5. **2회 실패 시**: 두 클립 사이에 **0.3s 블랙 컷** 또는 **인서트 샷** 배치 (편집 규약 — `편집배포규격_v3.md §1.1 크로스 페이드 기본 6 프레임` 참조)

### 7.3 체인 파일 네이밍
- last frame 추출: `ep<n>_c<prev>_lastframe.png` (같은 디렉토리)
- 재생성 Start: `ep<n>_c<next>_still_v<m>_chained.png`

---

## 8. 립싱크 예외 3컷 (HANDOFF §2 Step 5 / FINAL §8)

**시즌 1 전체에서 Kling 립싱크 ON은 아래 3개뿐**. 나머지 63컷은 VO (AI TTS 덮어쓰기).

| 클립 | 대사 | 전략 |
|---|---|---|
| **EP3 C10** | "...엄마" (2음절) | phoneme 시도 → 실패 시 옆얼굴 유지 + VO |
| **EP4 C06** | "어, 은서 씨" | 지연 미디엄 정면 — 입 모양 얇게 → 실패 시 순간 cutaway. TTS voice_id: `vo_jiyeon` (Cowork 공통원칙 Part 10) |
| **EP4 C10** | "...요즘, 좀 힘들어요" | 은서 CU — 입 모양 주 목표. 실패 시 C09 확장 + VO |

**기본 원칙**: 나머지는 `No lip-sync, no articulation of words` 네거티브 강제.

---

## 9. 발사 전 12항 체크 (편집배포규격 §3.4)

최종 업로드 직전 12 항목 확인:

1. LUT 적용 후 1차 컬러 드리프트 (Temp ±100K 이내)
2. 자막 오타·줄바꿈 (18자/14자 룰)
3. VO 피크 -3dBFS 이하, LUFS -14 ±1
4. BGM duck 동작 확인 (대사 구간 -6dB)
5. 쇼츠 크롭 안전영역 (상 220px / 하 380px)
6. 썸네일 4 variant 업로드 + A 최초 노출
7. 카드·끝화면 링크 활성
8. 태그 10개 이하, 해시태그 3개 이하
9. 자동번역 자막 비활성 / 수동 SRT 업로드
10. 저작권 주장 걸릴 BGM/SFX 없음 확인 (ACE-Step 자체 생성본)
11. 예약 공개 시간대 20:00 KST 고정
12. 커뮤니티 탭 티저 포스트 D-1 18:00 게시

---

## 10. EP별 핵심 체크포인트 (HANDOFF §3)

### EP1 (18 클립 / 2분 43초~2분 50초)
- 앵커 2종: `office_anchor_c00`, `busstop_anchor_c10`
- Wet staging T0→T4 (C10~C14 역행 금지)
- 골드 체인 EP1·EP2만
- EP4 C15 미러 포즈 고정 기준

### EP2 (16 클립 / 2분 52초~3분 15초)
- 앵커 2종: `cafe_anchor_c01`, `alley_anchor_c12`
- C06→C07 크로스 디졸브 0.5s + 앰버→쿨 LUT 동기화
- 민준 립싱크 OFF

### EP3 (16+1 클립 / 2분 46초~3분 15초)
- 앵커 3종 (앰버 앵커는 C01 이중 참조)
- C09→C10 "…엄마" 직전 4프레임 홀드
- C10 립싱크 예외 (Kling 1.8s)
- 팔레트 pivot 쿨→앰버

### EP4 (16+1 클립 / 3분 00초~3분 20초)
- 앵커 3종: `pantry_c05`, `street_c13`, (크로스) `busstop_c10` 미러
- C06 지연 세트 B face-on 최초
- C06 / C10 립싱크 예외 (Kling 0.7s / 1.8s)
- C09→C10 K6 포즈 Kling last→first seed
- C15 **20초 단일 블록** (Kling 10s×2 병합)
- **두샷 근접 공존 0개** (OTS·크로스·인서트만)

---

## 11. 품질 판정·재시도 (HANDOFF §4)

| 레이어 | 실패 | 재시도 | fallback |
|---|---|---|---|
| 캐릭터 얼굴 | 드리프트 | 3회 | CYH 피드백 |
| 로케이션 연속성 | 앵커 드리프트 | 2회 | 텍스트 강화 2회 |
| Kling 모션 과잉 | 복합동작 | 2회 | 5초 단축 |
| 립싱크 예외 | phoneme 부자연 | 1회 | VO only + 인서트 |
| TTS 발음 | 오류 | 2회 엔진 교체 | edge-tts |
| TTS 길이 | ±20% 초과 | 1회 속도 | 자막 재편집 |
| BGM 매칭 | 무드 이탈 | 2회 | 수동 픽 |

3회 모두 실패 → Cowork 측(CYH) 피드백 루프로 스토리 사이드 앵글·세트 재조정.

---

## 12. 8단계 작업 순서 (구체 절차)

### Step 1 — 캐릭터 ref 4파일 등록

| ref | 상태 | 절차 |
|---|---|---|
| `char_eunseo_base_v1.png` | ✅ 재활용 완료 (`assets/refs/`에 복사됨) | Freepik Reference 라이브러리에 업로드만 남음 |
| `char_exlover_base_v1.png` | 신규 생성 필요 | Cowork `캐릭터레퍼런스_v3.md §A (L22~L66)` 프롬프트 사용 → NanoBanana2 호출 → 2K 저장 → Freepik 라이브러리 등록 |
| `char_coworker_jiyeon_setA_v1.png` | 신규 (EP1 배경용) | Cowork `§B (L70~L118) 세트 A` 프롬프트 사용 |
| `char_coworker_jiyeon_setB_v1.png` | 신규 (EP4 face-on) | Cowork `§B 세트 B` 프롬프트 사용 |

각 신규 ref 생성 절차 (공통):
1. Cowork 캐릭터레퍼런스 파일에서 해당 §의 프롬프트 전체 복사
2. Freepik 이미지 탭 이동 (`howto-navigate.md`)
3. Reference 전체 삭제 (`howto-reference.md`)
4. 프롬프트 입력 (Reference 없이 순수 텍스트)
5. Generate → 결과 확인 (Cowork 의상 스펙 부합)
6. 다운로드 (`howto-download.md`) → `assets/refs/<파일명>` 저장
7. Freepik Reference 라이브러리에 업로드 등록 → prodId 기록

### Step 2 — 마스터 로케이션 ref 16종 생성
FINAL §5 매트릭스 기준. 각 로케이션별 개별 생성·라이브러리 등록. 파일명: `loc_<code>_v1.png` (예: `loc_office_daytime_v1.png`). 저장: `assets/refs/` (캐릭터 ref와 동일 디렉토리, prefix로 구분).

### Step 3 — 앵커 컷 9종 생성 (체인 대상보다 **먼저**)

**방식**: 앵커 컷은 **기반 클립의 Start Image와 동일** (별도 앵커용 프롬프트 없음). 절차:
1. 기반 클립의 Start Image를 **일반 Step 4 절차대로** 먼저 생성 (예: EP1 C00 Start Image 생성)
2. 생성된 이미지를 **2개 위치에 저장**:
   - `assets/stills/ep1/ep1_c00_still_v1.png` (본편 Start Image 용도)
   - `assets/anchors/office_anchor_ep1_c00_v1.png` (앵커 라이브러리 용도)
3. Freepik Reference 라이브러리에 **앵커 ID로 별도 등록** (이름: `office_anchor_ep1_c00`)
4. 체인 대상 클립 생성 시 이 앵커 ID로 `@img3`/`@img4` 참조

**앵커 9종 생성 순서**:
| 순서 | 앵커 | 기반 클립 | 비고 |
|---|---|---|---|
| 1 | `office_anchor_ep1_c00` | EP1 C00 | EP1 5 체인 대상의 기반 |
| 2 | `busstop_anchor_ep1_c10` | EP1 C10 | EP1 3 + EP4 C15 크로스-EP |
| 3 | `cafe_anchor_ep2_c01` | EP2 C01 | EP2 9 체인 대상 |
| 4 | `alley_anchor_ep2_c12` | EP2 C12 | EP2 2 체인 대상 |
| 5 | `home_dining_cool_anchor_ep3_c01` | EP3 C01 | EP3 7 + EP3 C14 이중참조 |
| 6 | `livingroom_anchor_ep3_c09` | EP3 C09 | EP3 3 체인 대상 |
| 7 | `home_dining_amber_anchor_ep3_c13` | EP3 C13 | EP3 C14 이중참조 |
| 8 | `pantry_anchor_ep4_c05` | EP4 C05 | EP4 7 체인 대상 |
| 9 | `street_rain_cleared_anchor_ep4_c13` | EP4 C13 | EP4 C14 |

### Step 4 — Start Image 66장 (38클립은 앵커 체인 주입)

컷별 절차는 `docs/workflow.md §2 "컷 단위 실전 체크리스트"` 참조. 체인 대상 클립은 §6의 매핑 표에 따라 `@img3` 또는 `@img4` 멘션 **최상단 삽입**.

출력: `assets/stills/ep<n>/ep<n>_c<nn>_still_v<m>.png`

### Step 5 — Kling 모션 66편

일반 Kling 절차 (`howto-generate-video.md`) + 아래 특수 규칙:
- **프레임 체이닝 8쌍**: §7 실행 절차 (`last→first seed` 또는 `§12-D fallback`)
- **립싱크 예외 3컷**: §8 phoneme 시도 (실패 시 VO fallback)
- **나머지 55컷**: 립싱크 OFF (`No lip-sync, no articulation of words` 네거티브)
- **EP4 C15만 20s**: Kling 10s×2 병합

출력: `assets/motions/ep<n>/ep<n>_c<nn>_v<m>.mp4`

### Step 6 — TTS 음성 (엔진 A/B 판정 후 일괄)
- 엔진 A/B 판정: 캐릭터별 대표 대사 3종으로 Qwen3-TTS vs GPT-SoVITS 비교 → 엔진 확정 (Cowork 공통원칙 Part 10 Voice Card)
- Fallback: edge-tts
- **착수 시점**: Step 4·5 (이미지·영상) 66컷 전부 통과 + 사용자 승인 후
- 출력: `assets/vo/ep<n>/ep<n>_c<nn>_vo_<voice_id>_v<m>.wav`

### Step 7 — BGM / SFX
- BGM: ACE-Step 1.5XL (`localhost:8001`) — EP별 10 테마 (Cowork 공통원칙 Part 6)
- SFX: 12종 라이브러리 또는 CC0 (편집배포규격 §9.2)
- **착수 시점**: Step 6 완료 후

### Step 8 — Remotion 합성 + FFmpeg
- LUT 라이브러리 (공통원칙 Part 13) → 자막 (Pretendard 32/40pt) → VO·BGM·SFX 믹스 (BGM -20dB / VO -8dB / SFX -14dB / duck -6dB) → 전환 → FFmpeg h.264 crf 18
- 쇼츠 12편 파생 (편집배포규격 §2 매트릭스)
- 썸네일 16장 (EP당 4 variant)
- **발사 전 12항 체크 (§9)** 필수
- **착수 시점**: Step 7 완료 후 + 사용자 승인

---

## 13. 레거시 v1 정책

- **위치**: `projects/나는괜찮아요_EP1_v1/`
- **내용**: v3.1 리뉴얼 이전의 EP1 18클립 스틸·영상·프롬프트·production-ids.json 등
- **용도**: 사용자가 v3.1 신규 결과물과 **직접 비교**
- **삭제 시점**: 사용자가 v3.1 결과물 확정 후 판단

---

## 14. 버전

| 버전 | 날짜 | 비고 |
|---|---|---|
| v1 | ~2026-04-17 | 레거시 EP1 18클립 (단일 에피소드 기준, ad-hoc) |
| **v3.1** | 2026-04-19 | Cowork v3.1 기반 전 시즌(4 EP / 66 클립) 수용. 본 PROJECT.md 신설. |
