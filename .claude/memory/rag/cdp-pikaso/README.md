# Freepik Pikaso CDP 운영 지식 — 인덱스

> **역할**: 이 디렉토리의 모든 파일에 대한 지도 + 상황별 빠른 진입점.
> **언제 읽나**: 세션 시작 시 **먼저 1회**, 이후 필요 시 재참조.
> **범용**: 다른 WebDrama 프로젝트도 이 RAG 사용. 프로젝트별 조작·제약은 `projects/{작품}/PROJECT.md` 참조.
> **마지막 실측**: 2026-04-17

---

## 🚀 상황별 빠른 진입점

| 상황 | 어디로 |
|------|--------|
| **처음 보는데 뭐부터?** | [00-core-principles.md](00-core-principles.md) → [01-environment.md](01-environment.md) → [CHEATSHEET.md](CHEATSHEET.md) |
| **복붙해서 바로 실행** | [CHEATSHEET.md](CHEATSHEET.md) (10개 스니펫) |
| **셀렉터 찾기** | [ref-selectors.md](ref-selectors.md) (Grep 타겟) |
| **API 응답 구조** | [ref-api.md](ref-api.md) |
| **prodId / creation.id 혼동** | [ref-dom-attributes.md](ref-dom-attributes.md) |
| **드롭다운 값 선택** | [ref-dropdowns.md](ref-dropdowns.md) |
| **Reference 등록/삭제/업로드** | [howto-reference.md](howto-reference.md) |
| **이미지 생성** | [howto-generate-image.md](howto-generate-image.md) |
| **영상 생성 (Kling 2.5)** | [howto-generate-video.md](howto-generate-video.md) |
| **탭 이동/복귀** | [howto-navigate.md](howto-navigate.md) |
| **이미지/영상 다운로드** | [howto-download.md](howto-download.md) |
| **NB2 이미지 프롬프트** | [prompts.md](prompts.md) PART 1 |
| **Kling 모션 프롬프트** | [prompts.md](prompts.md) PART 2 |
| **에러 조우 / 실패 원인** | [troubleshoot.md](troubleshoot.md) |
| **⚠ 이미지→비디오 전환 후** | [troubleshoot.md#p-2](troubleshoot.md) (P-2 Normalize 필수) |

---

## 📂 파일 분류

### 0. 원칙 (00~02) — 한 번만 익히면 됨
- [**00-core-principles.md**](00-core-principles.md) — 동적 UI 대응 11원칙
- [**01-environment.md**](01-environment.md) — 고정값 + Unlimited 조건
- [**02-connection.md**](02-connection.md) — CDP 연결 + 탭 관리

### 1. 참조 (`ref-*`) — 빠른 조회용
- [**ref-selectors.md**](ref-selectors.md) — 전체 data-cy 맵 (페이지별)
- [**ref-api.md**](ref-api.md) — 이미지/영상 API 엔드포인트 + 응답 구조
- [**ref-dom-attributes.md**](ref-dom-attributes.md) — creation.id / identifier / renderProdId 3가지 ID 체계
- [**ref-dropdowns.md**](ref-dropdowns.md) — 드롭다운 옵션 전수 + 선택 헬퍼

### 2. How-to (`howto-*`) — 작업 시 복붙 가능
- [**howto-reference.md**](howto-reference.md) — Reference 등록/다중/업로드/삭제/번호관리
- [**howto-generate-image.md**](howto-generate-image.md) — 이미지 생성 + API 식별 + 다운로드
- [**howto-generate-video.md**](howto-generate-video.md) — 영상 생성 + Normalize + 다운로드
- [**howto-navigate.md**](howto-navigate.md) — 탭/상세/에디터 이동 + 복귀
- [**howto-download.md**](howto-download.md) — Node https.get + `&preview=1` 제거

### 3. 프롬프트 원칙
- [**prompts.md**](prompts.md) — PART 1: NB2 이미지 10원칙 + PART 2: Kling 2.5 모션 8원칙

### 4. 실패 복구
- [**troubleshoot.md**](troubleshoot.md) — 12개 실패 패턴 + Normalize + 빠른 복구 레시피

### 5. 치트시트 (매일 사용)
- [**CHEATSHEET.md**](CHEATSHEET.md) — 복붙 즉시 실행 가능 SOP 10개

### 6. 아카이브
- [_archive/exploration-2026-04-17.archived.md](_archive/exploration-2026-04-17.archived.md) — 분할 전 원본 단일 파일 (히스토리). **`.archived.md` 접미어 = Grep 제외 규칙**: `Grep --glob='!*.archived.md'` 로 아카이브 노이즈 방지

---

## 🔑 핵심 요점 4가지 (암기)

### 1. Unlimited 조건 = Kling 2.5 + 720 + 10" + 16:9
- `GenerateUnlimited` 텍스트 나타날 때만 안전
- 그 외 조합은 **계정 차원 disabled** (유료 실수 차단)
- **예외**: 이미지→비디오 전환 직후 1080p 리셋 → [troubleshoot.md](troubleshoot.md) P-2 필수

### 2. 멀티 세션 안전 식별 = API 가로채기
- 다른 탭에서 동시 생성 시 "갤러리 최상단 비교" 로직은 오판
- **`page.on('response')`로 `creation.id` 직접 추출**이 유일한 안전 방법
- 이미지: `start-tti-v2` (family) + `render/v4` (creation.id)
- 영상: `video/generate` (identifier)

### 3. ID 3체계 혼동 금지
3가지 ID 체계 (creation.id / identifier / render asset prodId) 구분 필수. 상세 표 + DOM 매핑: [`ref-dom-attributes.md`](ref-dom-attributes.md) SSOT.

### 4. 다운로드 = Node https.get (CORS 우회)
브라우저 fetch는 CORS 차단. 이미지는 `&preview=1` 제거 필수. 실측 크기 + 코드: [`howto-download.md`](howto-download.md) SSOT.

---

## ⚡ 세션 시작 추천 순서

새 세션 Claude 기준:

```
1. ls .claude/memory/rag/cdp-pikaso/     ← 구조 파악
2. README.md (이 파일)                    ← 인덱스 습득
3. 00-core-principles.md                  ← 원칙 암기
4. 01-environment.md                      ← 고정값 확인
5. CHEATSHEET.md                          ← 상황 발생 시 복붙
6. 실제 작업 시작 → howto-* 해당 것만
7. 에러 조우 시 → troubleshoot.md
```

**첫 세션 필수 Read: 4개 파일** (실측 기반)
| 파일 | 라인 수 | KB | 추정 토큰 |
|------|--------|-----|---------|
| README.md | 153 | 6.7 | ~1.7K |
| 00-core-principles.md | 57 | 3.3 | ~0.8K |
| 01-environment.md | 65 | 3.1 | ~0.8K |
| CHEATSHEET.md | 366 | 13.7 | ~3.4K |
| **합계** | **641** | **26.8** | **~6.7K** |

---

## 🔍 Grep 사용 팁 (아카이브 제외)

`_archive/*.archived.md` 는 분할 전 원본 — 검색 노이즈가 됨. 항상 제외:

```
Grep pattern="..." glob="!*.archived.md"
```

또는:
```bash
grep -r "pattern" --include="*.md" --exclude="*.archived.md" .claude/memory/rag/cdp-pikaso/
```

---

## 📌 프로젝트 전용 OPERATIONS 연결

이 RAG는 **범용 CDP 지식**. 작품별 메타 + 상위 프로젝트 SSOT 링크 + 원문 표 + 작업 순서는 작품 폴더 내:

```
projects/{작품}/PROJECT.md
projects/{작품}/.session/                  # 세션 핸드오프 (TEMPLATE.md + 저장본)
projects/{작품}/assets/_logs/              # 에셋 메타 JSON (생성 기록)
```

현재 작품 예: `projects/나는괜찮아요/PROJECT.md` (시즌 1 / 4 EP / 66 클립 / 앵커 9종 / 체인 주입 38)

---

## 🔄 유지보수 규칙

### 이 RAG 업데이트 시
- **실측 기반**만 반영 (추측 금지)
- 파일 상단 "마지막 실측" 날짜 갱신
- 여러 파일에 같은 내용 있으면 **1곳에만 상세**, 나머지는 링크
- 새 data-cy 발견 → `ref-selectors.md` 우선 반영 (다른 파일에서 참조)

### 파일 추가 시
- 네이밍 규칙: `00-`, `ref-`, `howto-`, `prompts-`, `troubleshoot.md` 중 하나
- 상단 표준 헤더 포함 (역할/언제/관련/실측일)
- 이 README.md에 **상황별 진입점** + **파일 분류** 에 추가

### 파일 이름 변경 시
- 다른 파일들의 링크 깨짐 주의 — 전체 grep 후 일괄 수정
