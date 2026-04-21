# 세션 핸드오프 -- 다음 세션 Claude에게

**작성일**: 2026-04-21
**이전 세션 주제**: Step 2 로케이션 EP1 5종 + Step 3 EP1 앵커 2종 완료 (인코딩 리팩토링 + Cowork Part 16 한글 스크립트 강제 반영)
**다음 세션 목표**: EP1 Start Image 나머지 16장 + Kling 모션 18편 생성 (비디오 본편 산출까지)

---

## 한 줄 요약

이전 세션에서 **EP1 로케이션 5종 PASS + EP1 앵커 2종(C00, C10) 완료**. 다음 세션은 **EP1 Start Image 나머지 16장** 생성 후 **Kling 모션 18편 제작**, 최종적으로 EP1 Remotion 합성 본편 영상 산출까지 진행.

---

## 세션 시작 시 읽어야 할 순서 (필수)

1. **이 파일** -- 전체 맥락
2. `projects/나는괜찮아요/PROJECT.md` -- 작품 메타 + Cowork SSOT 링크 + 캐릭터/로케이션/앵커 매트릭스 + 체인 주입 38 클립
3. `projects/나는괜찮아요/.session/plan-step2-locations.md` -- Step 2 실행 계획 (eval 10점 PASS 본)
4. `C:\Team-jane\Cowork\나는괜찮아요_시즌1_프롬프트북_v3_EP1.md` -- 18 클립 Start Image + Kling 프롬프트 원문 (절대 SSOT)
5. `C:\Team-jane\Cowork\나는괜찮아요_로케이션레퍼런스_v3.md` 섹션 5 -- 한글 스크립트 강제 신설 규약 (2026-04-20 업데이트)
6. `C:\Team-jane\Cowork\나는괜찮아요_공통프롬프트원칙.md` Part 16 (L1298~L1361) -- 한글 스크립트 강제 2-레이어 주입 규약
7. `.claude/memory/rag/cdp-pikaso/README.md` + `CHEATSHEET.md` -- CDP 연결 + 스니펫
8. `.claude/memory/rag/cdp-pikaso/troubleshoot.md` P-13 -- 텍스트/간판 렌더 침입 대응 (Cowork Part 16 이전 버전 자체 교훈)

**첫 Read 예상 비용**: ~25K 토큰

---

## 이전 세션에서 완료된 것

### 인코딩 통합 리팩토링 (7 커밋, 2026-04-20 머지 대기)
1. `WI-chore Step 2 준비 + 인코딩 규약 standards 섹션 5 확장`
2. `WI-chore 본 작품 문서 특수문자 ASCII 치환`
3. `WI-docs 글로벌 문서 특수문자 ASCII 치환`
4. `WI-docs RAG 디렉토리 특수문자 ASCII 치환`
5. `WI-chore 스크립트 주석 특수문자 ASCII 치환`
6. `WI-chore sh 파일 UTF-8 블록 보강 (PYTHONUTF8, chcp 가드 추가)`
7. `WI-chore CI 문서 인코딩 lint 추가`

### Cowork 동기화 (2026-04-20 반영)
- 파일명 규약: `_ref_v1` -> `_v1` 통일 (캐릭터 `_base_v1`/`_setA_v1`/`_setB_v1`, 로케이션 `loc_<id>_v1`)
- 로케이션레퍼런스_v3.md 섹션 5 신설: **한글 스크립트 강제** 2-레이어 주입 규약
- 공통프롬프트원칙.md Part 16 신설: 동 규약 상세 설명

### Step 2 EP1 로케이션 5종 PASS (사용자 새 eval 기준: CJK FAIL, 실제 상호/브랜드 가독 FAIL, 흐릿 한글/영어 OK)

| # | loc_id | 파일 | 점수 | 비고 |
|---|---|---|---|---|
| 1 | loc_office_daytime | v4 | 9.57 | 블라인드 수직 + 모니터 content + HP 로고 제거 |
| 2 | loc_home_oneroom | v4 | 8.86 | 창 한글 5행 해소, SSOT 세부 경미 |
| 3 | loc_subway_morning | v3 | 8.57 | LED OFF로 "1714 is" 치명 해소 |
| 4 | loc_busstop_rain_evening | v7 | 7.86 | v6 "강변" 실제 지명 해소 (재시도 7회) |
| 5 | loc_street_rain_cleared | v2 | 9.0 | 우상단 간판 경계선 수용 |

### Step 3 EP1 앵커 2종 완료 (2곳 저장)
- `projects/나는괜찮아요/assets/stills/ep1/ep1_c00_still_v1.png`
- `projects/나는괜찮아요/assets/anchors/office_anchor_ep1_c00_v1.png`
- `projects/나는괜찮아요/assets/stills/ep1/ep1_c10_still_v1.png`
- `projects/나는괜찮아요/assets/anchors/busstop_anchor_ep1_c10_v1.png`

### Step 1 캐릭터 ref 4종 (이전 세션 종료분, 재확인)
- `char_eunseo_base_v1.png` (재활용)
- `char_exlover_base_v1.png` (민준)
- `char_coworker_jiyeon_setA_v1.png` (지연 EP1 세트 A)
- `char_coworker_jiyeon_setB_v2.png` (지연 EP4 세트 B, 얼굴 일관성 위해 세트 A를 @img1로 업로드 재생성)

---

## 다음 세션에서 할 일

### 우선순위 1: EP1 Start Image 나머지 16장 (Step 4)

기준: Cowork EP1.md 각 클립 Start Image 섹션 원문 + Part 16 2-레이어 주입.
출력 파일명: `assets/stills/ep1/ep1_c<nn>_still_v1.png`

| # | 컷 | 타입 | Ref 슬롯 | Cowork EP1.md 섹션 |
|---|---|---|---|---|
| C01 | 원룸 알람 탑샷 | 인서트 | @img1 loc_home_oneroom_v4 | C01 Start Image |
| C02 | 원룸 거울 CU | 일반 | @img1 loc_home + @img2 eunseo | C02 |
| C03 | 원룸 유리병 전신 | 일반 | @img1 loc_home + @img2 eunseo | C03 |
| C04 | 지하철 창가 3/4 | 일반 | @img1 loc_subway + @img2 eunseo | C04 |
| C05 | 모니터 인서트 | 인서트+체인 | @img1 loc_office + @img3 office_anchor_ep1_c00 | C05 |
| C06 | 오피스 복도 OTS | 체인 | @img1 loc_office + @img2 eunseo + @img3 office_anchor | C06 |
| C07 | 오피스 정면 CU | 체인 | @img1 loc_office + @img2 eunseo + @img3 office_anchor | C07 |
| C08 | 오피스 복도 뒷모습 | 체인 | @img1 loc_office + @img2 eunseo + @img3 office_anchor | C08 |
| C09 | 폰 SNS 인서트 | 인서트+체인 | @img1 loc_office + @img3 office_anchor | C09 |
| C11 | 정류장 측면 미디엄 | 체인 | @img1 loc_busstop + @img2 eunseo + @img3 busstop_anchor | C11 (앵커 체인 주입 L904) |
| C12 | 손 인서트 | 인서트+체인 | @img1 loc_busstop + @img3 busstop_anchor | C12 |
| C13 | 정류장 정면 CU | 체인 | @img1 loc_busstop + @img2 eunseo + @img3 busstop_anchor | C13 |
| C14 | 정류장 전신 멀리 | 일반 | @img1 loc_busstop + @img2 eunseo | C14 |
| C15 | 정류장 뒷모습 | 일반 | @img1 loc_busstop + @img2 eunseo | C15 |
| C16 | 폰 부재중 인서트 | 인서트 | 배경 ref 없이, 폰 화면 CU | C16 |
| C17 | 비 갠 인도 뒷모습 | 일반 | @img1 loc_street + @img2 eunseo | C17 |

### 우선순위 2: EP1 Kling 모션 18편 (Step 5)

기준: Cowork EP1.md 각 클립 Kling 섹션 원문.
출력 파일명: `assets/motions/ep1/ep1_c<nn>_v1.mp4`

**프레임 체이닝 강제 2쌍** (PROJECT.md 섹션 7 / 공통원칙 Part 12):
- EP1 C10 -> C11 (last->first seed)
- EP1 C15 -> C16 -> C17 (last->first seed 2홉)

**립싱크 예외 없음** (EP1은 모두 VO. Cowork 프롬프트북 `No lip-sync, no articulation` 네거티브 포함).

영상 탭 설정 고정: **Kling 2.5 / 720p / 10s / 16:9 / Unlimited**
이미지->영상 전환 직후 `normalizeVideoTab()` 필수 (RAG `troubleshoot.md P-2`).

### 우선순위 3: (선택) Step 2 EP2/3/4 로케이션 11종

EP1 영상 완료 전이라면 skip 가능. EP2 진입 시 다시 착수.

---

## 핵심 의사결정 (기억해야 함)

### 1. 한글 스크립트 강제 2-레이어 주입 (모든 클립 필수)
공통원칙 Part 16-B 양성 블록 + 네거티브 블록을 모든 Start Image 프롬프트에 삽입:

**양성 (scene 묘사 끝단)**:
```
All visible text in the frame -- signs, posters, papers, screens, packaging, 
menus, notices, newspapers, business cards, receipts, product labels, shop 
fronts, transit displays -- appears exclusively in Korean Hangul script.
Individual characters read as the distinctive stacked-syllable blocks of 
Hangul with clearly visible consonant-vowel-final-consonant structure. 
Text may be softly out of focus so specific words remain non-identifiable, 
but the script identity as Hangul is unambiguous. No mixed-script signs.
```

**네거티브 (네거티브 꼬리)**:
```
No Chinese characters (hanzi), no Japanese kanji, no Japanese hiragana or 
katakana, no Traditional or Simplified Chinese characters, no CJK-generic 
scribbles, no Latin transliteration of Korean words replacing Hangul, no 
mixed Chinese-Korean or Japanese-Korean signage.
```

### 2. 특수 문자 제거 (줄바꿈 정규화)
프롬프트에 em dash, middle dot, section sign 등 특수 문자 제거. 원문의 `--`, `,`, `섹션` 등으로 치환하거나 공백 정규화.

### 3. 체인 주입 문구 (체인 대상 클립에만)
Cowork EP1.md 섹션 2.5 또는 각 클립 상단 **[앵커 체인 주입]** 블록쿼트 참조:
```
@img3 = office_anchor_ep1_c00 (sequence anchor). Props, wall details, 
lighting positions, and floor/ceiling geometry MUST match @img3 pixel-precise.
```
```
@img3 = busstop_anchor_ep1_c10 (sequence anchor). Shelter pillars, 
streetlamp position, bench, posters, wet ground reflections MUST match 
@img3 pixel-precise. Wetness level advances per clip (T1->T3).
```

### 4. Ref 업로드 순서 (슬롯 배정)
Freepik Reference는 업로드 순서대로 @img1, @img2, @img3 부여됨. 반드시 순서 준수.

### 5. 재시도 한도 (HANDOFF 섹션 4)
- 캐릭터 얼굴 드리프트: 3회
- 로케이션 연속성: 2회 + fallback 2회 = 최대 5회
- 초과 시 CYH 피드백 루프 or 현 버전 수용 (busstop v7처럼)

### 6. Kling 모션 설정
영상 탭: **Kling 2.5 + 720p + 10" + 16:9** 조합만 Unlimited. 다른 조합은 크레딧 650 소모 위험. `normalizeVideoTab()` 필수.

### 7. 프레임 체이닝 (Part 12)
last frame -> first seed 직접 지원 시 사용. 거부 시 fallback:
1. `ffmpeg -sseof -0.04 -i ep1_c<prev>_v1.mp4 -frames:v 1 ep1_c<prev>_lastframe.png`
2. Freepik Upload -> @img2 등록
3. 다음 클립 Start Image 재생성 프롬프트에 "scene continues from exact last frame of previous clip" 지시

### 8. 립싱크
EP1 18 클립 모두 VO (Kling 립싱크 OFF). 네거티브에 `No lip-sync, no articulation of words. Mouth closed or slightly parted` 포함.

---

## 반드시 피해야 할 실수

| 실수 | 결과 | 예방 |
|---|---|---|
| Part 16 2-레이어 누락 | CJK(한자/가나) 렌더 침입 | 모든 Start Image 프롬프트에 양성 + 네거티브 둘 다 주입 |
| Ref 업로드 순서 뒤집힘 | @img1/@img2 슬롯 오배정 | 스크립트 내 uploadRef() 순차 호출 확인 |
| 이미지->영상 전환 직후 즉시 Generate | 1080p 유료 생성 (650 크레딧) | `normalizeVideoTab()` 반드시 먼저 |
| 체인 클립에서 앵커 @img3 미등록 | "@img3 pixel-precise" 지시 누락 | 앵커 ref PNG 선행 Upload, dangling 확인 |
| 프롬프트에 대문자 "NO" 부정어 | 이미지 텍스트로 상속 (v4 "NO" 버그) | 소문자 서술형 "no ... at all" 형태로 |
| "at any zoom level" 긍정 강조 | 모델이 상세 디테일 강화 렌더 (busstop v3 퇴행) | "pure color bands only, no stroke shapes" 부정 강조 |
| 결과물 CJK 검출 간과 | EP 진행 후 뒤늦게 재생성 폭탄 | 매 생성 직후 확대 검증 (왼쪽/우측/중앙 전수) |

---

## 브라우저 상태 (세션 종료 시점)

**Chrome 146, CDP 9222 포트 유지**. 사용자 브라우저 살아있음.

| 탭 | URL | 상태 |
|---|---|---|
| Tab 0 | `/ai-video-generator` | Kling 2.5 / 720 / 10" / 16:9 (Normalize 상태 유지 예상) |
| Tab 1 | `/ai-image-generator` | Ref 0개, 프롬프트 empty, Nano Banana 2 / 2K / 16:9 / AI prompt OFF |

**세션 시작 직후 CHEATSHEET.md 스니펫 1로 실제 상태 재확인 필수**. 이미지 탭 Ref 0 / 프롬프트 empty 확인. 영상 탭 Kling 2.5 / 720 / 10" / 16:9 확인. 불일치 시 normalizeVideoTab 적용.

---

## retry-count.json 상태

파일 위치: `projects/나는괜찮아요/.session/retry-count.json` (아직 작성 안 됨)

**Step 1~2 PASS 이력 정리 필요** (다음 세션 착수 시 일괄 기록):

```json
{
  "char_exlover_base": {"attempts": 1, "last_verdict": "PASS", "final_version": 1},
  "char_coworker_jiyeon_setA": {"attempts": 1, "last_verdict": "PASS", "final_version": 1},
  "char_coworker_jiyeon_setB": {"attempts": 2, "last_verdict": "PASS", "final_version": 2},
  "loc_office_daytime": {"attempts": 4, "last_verdict": "PASS", "final_version": 4, "last_score": 9.57},
  "loc_home_oneroom": {"attempts": 4, "last_verdict": "PASS", "final_version": 4, "last_score": 8.86},
  "loc_subway_morning": {"attempts": 3, "last_verdict": "PASS", "final_version": 3, "last_score": 8.57},
  "loc_busstop_rain_evening": {"attempts": 7, "last_verdict": "PASS", "final_version": 7, "last_score": 7.86, "note": "v6 '강변' 지명 해소 후 v7. v1~v5는 Part 16 전 생성, 참고용 보존"},
  "loc_street_rain_cleared": {"attempts": 2, "last_verdict": "PASS", "final_version": 2, "last_score": 9.0},
  "ep1_c00": {"attempts": 1, "last_verdict": "PASS_FRAMING_DRIFT", "final_version": 1, "note": "Cowork CU 명시 vs 실제 미디엄 샷 수용. 앵커 + Start 2곳 저장"},
  "ep1_c10": {"attempts": 1, "last_verdict": "PASS", "final_version": 1, "note": "앵커 + Start 2곳 저장"}
}
```

**assets/_logs/ 메타 JSON 미생성** -- 다음 세션 정리 필요. standards.md 섹션 4.3 스키마 준수.

---

## 다음 세션 첫 체크리스트 (실제 소요 2~3분)

```
1. 이 SESSION_HANDOFF_20260421.md Read (전체, ~12KB)
2. PROJECT.md Read (섹션 1.1 mtime 체크, 섹션 4 로케이션, 섹션 5 앵커, 섹션 6 체인 주입)
3. Cowork EP1.md 해당 세션 첫 클립 섹션 Read (예: C01)
4. CHEATSHEET.md 스니펫 1로 브라우저 CDP 9222 연결, 탭 상태 실측
5. Cowork mtime 체크 (업데이트 여부)
  stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_로케이션레퍼런스_v3.md"
  stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_공통프롬프트원칙.md"
  stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_시즌1_프롬프트북_v3_EP1.md"
  stat -c "%y %n" "/c/Team-jane/Cowork/나는괜찮아요_터미널세션_HANDOFF_v3.1.md"
6. retry-count.json 작성 (본 핸드오프 섹션 복붙)
7. 사용자에게 "EP1 C01부터 Start Image 재개할까요?" 확인
```

---

## 작업 전략 제안

### 전략 A (권장): 배치 + 중간 스냅샷
1. Start Image 16장 한 번에 순차 실행 (중간 사용자 확인 없음)
2. 매 클립 Read + 육안 Compliance (사람 수/스크립트/구조) 자체 체크
3. 치명 이슈(CJK 검출 / 실제 상호 가독 / 캐릭터 drift) 발견 시 단 1회 재생성
4. 경미 이슈 수용
5. 16장 완료 후 일괄 보고 및 사용자 승인
6. Kling 모션 18편 동일 배치 (normalizeVideoTab 필수)
7. Kling 완료 후 EP1 영상 본편 합성 (Step 6~8, 별도 세션 권장)

### 전략 B: 분할 진행 (Start Image 완료 후 사용자 확인, Kling 별도)
- 안전하지만 사용자 대화 부담 증가

### 세션 분할 시 예상 시간
- Start Image 16장 = 약 60~80분
- Kling 모션 18편 = 약 40~60분
- 합계 약 100~140분 순수 작업. 1 세션 내 완료 가능하나 여력 여유 필요.

---

## 미해결 의사결정 (사용자 최종 판단)

1. **C00 프레이밍 drift**: Cowork 원문 "얼굴 CU" vs 실제 미디엄 샷. 수용했으나 EP4 C15 수미상관 renewer 시 재검토 가능
2. **재시도 상한 탄력 적용**: busstop v7(재시도 7회)처럼 경계선 결과 수용 기준 명확화 필요
3. **Kling 체이닝 fallback 시점**: EP1 C10->C11, C15->C16->C17이 last->first seed 실패 시 FFmpeg 경로 즉시 전환 여부

---

## PR 상태 확인

현 브랜치: **chore/WI-chore-restructure-webdrama** (PR #23, OPEN)

세션 시작 시:
```bash
gh pr view 23 --json state,mergedAt,mergeStateStatus
```
- MERGED: `git checkout main && git pull` 후 새 브랜치 분기
- OPEN: 본 브랜치에서 계속 작업

다음 세션 커밋 구성 (제안):
- `WI-chore EP1 C00 C10 앵커 + Start Image 2곳 저장` (기 생성 커밋)
- `WI-chore EP1 Start Image 나머지 16장 생성`
- `WI-chore EP1 Kling 모션 18편 생성`
- `WI-chore EP1 retry-count + 메타 JSON 일괄 기록`

---

## 본 핸드오프 stale 감지

이 핸드오프는 **2026-04-21 저녁 시점 기준**. 다음 세션 시작 시:

```bash
git log --oneline 1202be4..HEAD -- \
  projects/나는괜찮아요/PROJECT.md \
  docs/standards.md \
  .claude/agents/evaluator.md
```

위 명령이 하나 이상의 커밋을 반환하면 본 핸드오프 내용이 실제 문서와 일치하는지 대조 필수. 아무것도 반환하지 않으면 본 핸드오프가 최신.

---

## 핵심 파일 경로 요약

```
# 작업 대상 PNG 저장 경로
projects/나는괜찮아요/assets/stills/ep1/ep1_c<nn>_still_v1.png
projects/나는괜찮아요/assets/anchors/<loc>_anchor_ep1_c<nn>_v1.png
projects/나는괜찮아요/assets/motions/ep1/ep1_c<nn>_v1.mp4

# 기존 ref 경로 (Upload 시 사용)
projects/나는괜찮아요/assets/refs/char_eunseo_base_v1.png
projects/나는괜찮아요/assets/refs/loc_office_daytime_v4.png
projects/나는괜찮아요/assets/refs/loc_home_oneroom_v4.png
projects/나는괜찮아요/assets/refs/loc_subway_morning_v3.png
projects/나는괜찮아요/assets/refs/loc_busstop_rain_evening_v7.png
projects/나는괜찮아요/assets/refs/loc_street_rain_cleared_v2.png
projects/나는괜찮아요/assets/anchors/office_anchor_ep1_c00_v1.png
projects/나는괜찮아요/assets/anchors/busstop_anchor_ep1_c10_v1.png

# Cowork SSOT
C:/Team-jane/Cowork/나는괜찮아요_시즌1_프롬프트북_v3_EP1.md (18 클립 프롬프트 원문)
C:/Team-jane/Cowork/나는괜찮아요_로케이션레퍼런스_v3.md (섹션 5 한글 강제)
C:/Team-jane/Cowork/나는괜찮아요_공통프롬프트원칙.md (Part 16 L1298~L1361)
C:/Team-jane/Cowork/나는괜찮아요_터미널세션_HANDOFF_v3.1.md

# RAG
.claude/memory/rag/cdp-pikaso/CHEATSHEET.md
.claude/memory/rag/cdp-pikaso/howto-generate-image.md
.claude/memory/rag/cdp-pikaso/howto-generate-video.md
.claude/memory/rag/cdp-pikaso/troubleshoot.md (P-2 normalizeVideoTab, P-13 텍스트 침입)
```

---

**세션 간 지식은 파일로만 전달된다. 이 핸드오프가 다음 세션의 유일한 연속성.**
