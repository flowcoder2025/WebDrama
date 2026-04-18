# 세션 핸드오프 — 다음 세션 Claude에게

**작성일**: YYYY-MM-DD (세션 종료 시점)
**다음 세션 목표**: {한 줄 요약 — 예: "EP1 C11~C13 Start Image 재생성 + 영상 생성"}

---

## 🎯 한 줄 요약

{다음 세션이 이어받을 작업을 한 문장으로}

---

## 📖 세션 시작 시 읽어야 할 순서 (필수)

1. **이 파일** — 전체 맥락
2. `projects/{작품}/PROJECT.md` — 작품 메타 + Cowork SSOT 링크 + 원문 표
3. `docs/workflow.md §2~3` — 컷 단위 실전 체크리스트
4. `.claude/memory/rag/cdp-pikaso/README.md` — RAG 인덱스
5. `.claude/memory/rag/cdp-pikaso/CHEATSHEET.md` — 복붙 스니펫
6. Cowork `나는괜찮아요_터미널세션_HANDOFF_v3.1.md` — 상위 정본 단일 진입점
7. 해당 EP 프롬프트북 (`나는괜찮아요_시즌1_프롬프트북_v3_EP<n>.md`) — 클립 프롬프트 원문

**첫 Read 예상 비용**: ~15~20K 토큰

---

## ✅ 이전 세션에서 완료된 것

### 생성 완료 (기록 시점 기준)
- 캐릭터 ref: {완료 여부 + prodId}
- 로케이션 ref: {완료 개수/16}
- 앵커 컷: {완료 개수/9}
- Start Image: {EP별 진행 (예: EP1 C00~C10 완료, 8/18)}
- Kling 모션: {EP별 진행}
- TTS / BGM / Remotion: {상태}

### 의사결정
- {이전 세션에서 확정된 것 — 파라미터, 프롬프트 조정 등}

---

## 🚀 이번 세션에서 할 일

### 작업 대상
- {컷 ID 리스트 or 단계}
- {우선순위}

### 주의사항
- {재작업 중인 컷이 있으면 이전 실패 원인}
- {특수 제약 — 예: EP3 C10 phoneme 재시도 중}

---

## 🔑 핵심 의사결정 (기억해야 함)

1. {작품별 핵심 제약 재확인}
2. {이전 세션에서 확립된 것}

---

## ⚠ 반드시 피해야 할 실수

| 실수 | 결과 | 예방 |
|---|---|---|
| `page.close()` | 사용자 탭 파괴 | `browser.disconnect()`만 |
| 이미지→비디오 전환 후 바로 Generate | 1080p 유료 생성 | `normalizeVideoTab()` 먼저 |
| 브라우저 `fetch` 다운로드 | CORS 차단 | Node `https.get` 사용 |
| 이미지 URL 그대로 다운로드 | 71KB 썸네일만 | `&preview=1` 제거 |
| Reference `@imgN` 멘션 후 삭제 | dangling | 전체 삭제 후 재등록 |

---

## 🌐 브라우저 상태 (세션 종료 시점)

**Chrome CDP 포트 9222 유지됨**.

| 탭 | URL | 상태 |
|---|---|---|
| Tab 0 | `/ai-video-generator` | {상태} |
| Tab 1 | `/ai-image-generator` | {상태} |

### 이미지 탭
- Reference: {개수}
- 프롬프트: {내용 or empty}
- 모델/해상도/비율: {Nano Banana 2 / 2K / 16:9}
- AI prompt: {ON/OFF}

### 영상 탭
- 모델/해상도/길이/비율: {Kling 2.5 / 720 / 10" / 16:9}
- Start Image: {파일명 or null}
- 모션 프롬프트: {내용 or empty}
- Generate: {enabled/disabled}

---

## 📁 재시도 카운트 상태

참조: `projects/{작품}/.session/retry-count.json`

| 컷 | 시도 횟수 | 마지막 점수 | 상태 |
|---|---|---|---|
| ep1_c05 | 2 | 8.5 | REWORK |
| ... | ... | ... | ... |

---

## 🧭 다음 세션 첫 30초 액션

```
1. 이 TEMPLATE 파일 Read (전체)
2. PROJECT.md Read (해당 EP 섹션)
3. retry-count.json 확인 (진행률)
4. 브라우저 CDP 9222 연결 확인 (CHEATSHEET.md 스니펫 1)
5. 사용자에게 "C<nn>부터 재개할까요?" 확인
```

---

**세션 간 지식은 파일로만 전달된다. 이 핸드오프가 다음 세션의 유일한 연속성.**
