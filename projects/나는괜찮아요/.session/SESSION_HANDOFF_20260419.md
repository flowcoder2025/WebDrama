# 세션 핸드오프 — 다음 세션 Claude에게

**작성일**: 2026-04-19 (세션 종료 시점)
**이전 세션 주제**: WebDrama 구조 재편 v3.1 수용 (PR #23, merge 대기)
**다음 세션 목표**: EP1 C00부터 v3.1 Start Image·Kling 모션 본 작업 시작

---

## 🎯 한 줄 요약

이전 세션에서 **WebDrama 전체 구조를 Cowork v3.1(시즌 1 / 4 EP / 66 클립)에 맞춰 재편 완료 (evaluator 10/10 PASS)**. 다음 세션은 본 작업 **EP1 C00 (앵커 `office_anchor_ep1_c00`) Start Image 생성부터 실행**.

---

## 📖 세션 시작 시 읽어야 할 순서 (필수)

1. **이 파일** — 전체 맥락
2. `projects/나는괜찮아요/PROJECT.md` — 작품 메타 + Cowork SSOT 링크 + 원문 표 13종 (§1 → §12 순)
3. `docs/workflow.md §2~3` — 컷 단위 13단계 실전 체크리스트 (§2.1 EP1 C05 예시, §2.2-B 앵커 기반 컷, §3 Kling 모션)
4. `.claude/memory/rag/cdp-pikaso/README.md` — RAG 인덱스
5. `.claude/memory/rag/cdp-pikaso/CHEATSHEET.md` — 복붙 스니펫 10개
6. `C:\Team-jane\Cowork\나는괜찮아요_터미널세션_HANDOFF_v3.1.md` — 상위 정본 단일 진입점
7. `C:\Team-jane\Cowork\나는괜찮아요_시즌1_프롬프트북_v3_EP1.md` §C00 섹션 — 첫 작업 프롬프트 원문

**첫 Read 예상 비용**: ~20K 토큰

---

## ✅ 이전 세션에서 완료된 것

### 구조 재편 (PR #23)
- 루트 `PRD.md` 범용 플랫폼 정의로 재작성
- `projects/나는괜찮아요/PROJECT.md` 신규 (Cowork v3.1 원문 표 13종)
- `docs/` 신규 4파일 (README/architecture/workflow/standards)
- `.claude/rules/rag-context.md` 신규 (주제-RAG 매핑)
- `.claude/agents/evaluator.md` 수정 (WebDrama 컷 단위 모드 1-B 분기)
- `.claude/memory/rag/cdp-pikaso/` 범용 RAG 17파일 커밋 포함
- `.claude/settings.json` Vault hooks만 유지
- `.flowset/hooks/commit-msg` 필수 스크립트 리스트 축소 (Vault 3개)
- `.gitignore` projects/** 전체 ignore + 문서·메타는 예외
- `package.json` scripts no-op (자동화 착수 시 복원)

### 폐기
- `src/` 전체 (자동화 착수 시 재작성)
- `tests/` 전체 (src/ 의존 52건)
- `docs/L0~L4` 전체
- `projects/e2e-test/`, `projects/highschool-romance-test/`
- `tsconfig.json`, `vitest.config.ts`, `remotion.config.ts`
- FlowSet 루프·팀 기능 전부 (`flowset.sh`, `.flowset/teams/`, `specs/`, `contracts/`, `PROMPT.md`, `AGENT.md`, `fix_plan.md`, `prd-state.json`, `ownership.json`, 루프 스크립트 10개, lead-workflow·team-worker 에이전트, team-roles·flowset-operations 룰)
- `scripts/gen-scene.ts` (highschool-romance-test 전용 하드코딩)

### 레거시 보존
- `projects/나는괜찮아요_EP1/` → `projects/나는괜찮아요_EP1_v1/` 리네임 (사용자 비교용)
- 루트 임시파일 24개 (`.motion-C*.txt`, `.c*-render.json`, `.prompt-tmp*.txt`) → `projects/나는괜찮아요_EP1_v1/_artifacts/`
- 파일시스템 백업: `../projects.backup.20260419/`
- git tag: `backup/pre-restructure-20260419`

### 은서 ref 재활용 검증 완료
- `projects/나는괜찮아요_EP1_v1/characters/char_eunseo.png` → `projects/나는괜찮아요/assets/refs/char_eunseo_base_v1.png` 복사
- SESSION_HANDOFF_v1 L38 실측(세트 A 의상 + 골드체인 + 어깨길이 생머리)이 Cowork `캐릭터레퍼런스_v3.md §4.1`과 일치 → 재생성 불필요

### 활성 스크립트 경로 전부 업데이트
- `scripts/cdp-utils.ts` OUT → `projects/나는괜찮아요/assets/_logs/screenshots/`
- `scripts/gen-video.cjs` imgPath/outPath → 새 구조 네이밍 (`ep<n>_c<nn>_still_v1.png` / `ep<n>_c<nn>_v1.mp4`), cutId 형식 `ep<n>_c<nn>`로 변경

---

## 🚀 다음 세션에서 할 일

### 우선순위 1 — 캐릭터 ref 나머지 3파일 신규 생성 (Step 1)
은서는 재활용 완료. 민준·지연 A·지연 B 3파일 신규 생성 필요.

| ref | Cowork 프롬프트 출처 | 저장 파일명 |
|---|---|---|
| `char_exlover_base_v1.png` | `캐릭터레퍼런스_v3.md §A (L22~L66)` 원문 그대로 | `assets/refs/char_exlover_base_v1.png` |
| `char_coworker_jiyeon_setA_v1.png` | `§B 본문 (L70~L118)` 의상 원문 + **`L221` 헤어 정본(shoulder-length bob)으로 덮어쓰기** (L70의 "medium-length wavy collarbone"은 폐기됨) | `assets/refs/char_coworker_jiyeon_setA_v1.png` |
| `char_coworker_jiyeon_setB_v1.png` | `§B 본문 (L70~L118)` 프롬프트 골격 + **`L217` 의상 슬롯 B 스펙**(네이비 블레이저 / 흰 스트라이프 블라우스 / 베이지 슬랙스 / 블랙 플랫 로퍼 / 골드 스터드 / 실버 시계 왼손)으로 **조합** + `L221` 헤어 + `L223~L242` Clause C-EP4 참조 | `assets/refs/char_coworker_jiyeon_setB_v1.png` |

**지연 세트 B 프롬프트 조합 방법** (Cowork에 독립 프롬프트 없음):
1. `캐릭터레퍼런스_v3.md §B` 본문(L70~L118) 복사 (얼굴·피부·프로포션 등 공통)
2. 본문 내 의상 설명 블록을 `L217` 세트 B 스펙으로 치환
3. 본문 내 헤어 설명을 `L221` 정본(shoulder-length straight-to-gentle-wave bob)으로 치환
4. 완성 프롬프트를 Clause C-EP4(`L223~L242`)와 대조 검증

절차는 `PROJECT.md §12 Step 1`의 공통 7단계 + `docs/workflow.md §2` 참조.

### 우선순위 2 — 마스터 로케이션 ref 16종 (Step 2)
`PROJECT.md §4` 매트릭스 16개 로케이션별 개별 생성·라이브러리 등록.

### 우선순위 3 — 앵커 컷 9종 (Step 3)
**반드시 일반 Start Image보다 먼저**. `PROJECT.md §12 Step 3` 순서표 + `docs/workflow.md §2.2-B` 앵커 기반 컷 절차.

### 우선순위 4 — EP1 Start Image 18장 (Step 4)
- C00~C17 중 **C00이 앵커**이므로 Step 3에서 처리됨
- 나머지 C01~C17은 일반/체인 대상/인서트 구분하여 순서대로
- 체인 주입 대상 (C05, C06, C07, C08, C09, C11, C12, C13) = `PROJECT.md §6.1`
- 인서트 (C01, C05, C09, C12, C16) = `@img2` 없이 처리

---

## 🔑 핵심 의사결정 (기억해야 함)

1. **캐릭터 ref 파일명 정본**: HANDOFF v3.1 기준 `_base_v1` / `_setA_v1` / `_setB_v1`. Cowork 캐릭터레퍼런스_v3 L128의 `_ref_v1` 표기는 참고만 (PROJECT.md §3 각주).
2. **앵커 컷 생성 방식**: 기반 클립(예: C00)의 Start Image를 먼저 생성 → **2곳 저장**(`assets/stills/ep1/ep1_c00_still_v1.png` + `assets/anchors/office_anchor_ep1_c00_v1.png`) → Freepik 라이브러리에 앵커 ID로 **별도 업로드 등록**
3. **체인 주입**: Start Image 프롬프트 **최상단 라인**에 `@img3 = <앵커ID> (sequence anchor). ...` 삽입 (EP4는 `@img4` 사용)
4. **프레임 체이닝 fallback (§7.2)**: Kling이 last→first seed 거부 시 FFmpeg로 last frame 추출 → NanoBanana2 Reference 업로드 → 다음 Start Image 재생성
5. **립싱크 3컷 예외**: EP3 C10 "...엄마" / EP4 C06 "어, 은서 씨" / EP4 C10 "...요즘, 좀 힘들어요". 나머지 63컷은 전부 VO (`No lip-sync` 네거티브)
6. **재작업 최대 10회**: `projects/나는괜찮아요/.session/retry-count.json`에 카운트 기록. 초과 시 사용자 판단
7. **자동화 전환 트리거**: 이미지·영상 66컷 전부 PASS + 사용자 승인 시 TTS·BGM·Remotion 착수

---

## ⚠ 반드시 피해야 할 실수

| 실수 | 결과 | 예방 |
|---|---|---|
| `page.close()` | 사용자 탭 파괴 | `browser.disconnect()`만 |
| 이미지→비디오 전환 후 바로 Generate | 1080p 유료 생성 (크레딧 650) | `normalizeVideoTab()` 먼저 (troubleshoot.md P-2) |
| 브라우저 `fetch` 다운로드 | CORS 차단 | Node `https.get` 사용 |
| 이미지 URL 그대로 다운로드 | 71KB 썸네일만 | `&preview=1` 제거 |
| Reference `@imgN` 멘션 후 삭제 | dangling | 전체 삭제 후 재등록 |
| 앵커 생성 없이 체인 클립 먼저 생성 | `@img3` 참조 실패 | Step 3 앵커 9종 먼저 완료 |
| EP별 체인 앵커 번호 혼동 | EP4는 `@img4`, 나머지 `@img3` | PROJECT.md §6 매핑표 엄격 준수 |
| 결과물 Compliance 체크 시 생성물만 보기 | Cowork 컷 설계 의도 누락 검증 | **매 Compliance 체크마다** HANDOFF v3.1 + 해당 EP 프롬프트북 원문 동시 열람 (memory: feedback_verify_with_story) |
| 지연 세트 B ref 생성 시 L70 원문 헤어 그대로 사용 | L70 "wavy collarbone"은 폐기된 스펙, 드리프트 | **L221 정본 "shoulder-length bob"으로 덮어쓰기 필수** |

---

## 🌐 브라우저 상태 (세션 종료 시점)

**Chrome 146, CDP 9222 포트 유지**. 사용자 브라우저 살아있음.

| 탭 | URL | 상태 |
|---|---|---|
| Tab 0 | `/ai-video-generator` | 이전 세션(4/17) 기준: 초기화됨 (Start Image 없음, 프롬프트 empty) |
| Tab 1 | `/ai-image-generator` | Reference 0개, 프롬프트 empty, Nano Banana 2 / 2K / 16:9 / AI prompt OFF |

**다음 세션 첫 30초 액션 시 CHEATSHEET.md 스니펫 1로 실제 상태 재확인 필수**.

---

## 📁 재시도 카운트 상태

- `projects/나는괜찮아요/.session/retry-count.json` — **아직 없음** (첫 생성 시 Claude가 만듦)
- **확정 형식** (REWORK/PASS 공통):
  ```json
  {
    "ep1_c00": {
      "attempts": 3,
      "last_score": 9.2,
      "last_verdict": "PASS",
      "final_version": 2
    }
  }
  ```
- `attempts`: 총 시도 횟수 (PASS 시에도 누적)
- `last_score`: 가장 최근 evaluator 점수
- `last_verdict`: `PASS` | `REWORK` | `REGENERATE`
- `final_version`: PASS 판정된 버전 번호. REWORK 중엔 **생략 또는 null**

---

## 🧭 다음 세션 첫 체크리스트 (실제 소요 1~2분)

```
1. 이 SESSION_HANDOFF_20260419.md Read (전체, ~8KB)
2. projects/나는괜찮아요/PROJECT.md Read (§1~§3 우선)
3. docs/workflow.md §2 Read (컷 단위 체크리스트)
4. CHEATSHEET.md 스니펫 1로 브라우저 CDP 9222 연결·탭 상태 실측
5. PROJECT.md §1.1 Cowork mtime 체크 (freeze 해제 여부 — stat 5개)
6. 사용자에게 "EP1 C00 앵커부터 시작할까요? (C00은 은서 단독 CU, 민준/지연 ref 불필요)" 확인
```

---

## 📦 PR #23 머지 여부 확인

다음 세션 시작 시:
```bash
gh pr view 23 --json state,mergedAt,mergeStateStatus
```
- `state: MERGED` 면: `git checkout main && git pull` 후 작업
- `state: OPEN` 이면: 브랜치 `chore/WI-chore-restructure-webdrama`에서 계속 or 머지 후 작업

---

## 🕰 본 핸드오프 stale 감지

이 핸드오프는 **커밋 `237aaa3` 시점 기준**. 다음 세션 시작 시:

```bash
git log --oneline projects/나는괜찮아요/PROJECT.md docs/workflow.md .claude/agents/evaluator.md
```

위 명령으로 `PROJECT.md`/`workflow.md`/`evaluator.md` 최근 커밋 해시 확인. **237aaa3 이후의 커밋이 있으면** 본 핸드오프 내용이 실제 문서와 일치하는지 대조 필수 (특히 §🚀 우선순위·§🔑 핵심 의사결정·§📁 retry-count 형식).

---

**세션 간 지식은 파일로만 전달된다. 이 핸드오프가 다음 세션의 유일한 연속성.**
