# 인코딩 통합 리팩토링 plan v5

작성일: 2026-04-20
버전: v5 (섹션 이중 표기 폐기 - 복잡성 뿌리 제거)
목적: WebDrama 프로젝트 글자 깨짐 + Windows UTF-8 이슈 통합 해결

---

## 0. v4 -> v5 핵심 변경

v4까지 section sign 이중 표기(`섹션 N (원문 섹션 N)`) 규칙이 혼합 라인 처리 복잡성의 뿌리였음. v5는 이를 완전 폐기하고 **모든 섹션 -> `섹션 N` 단순 치환**으로 축소.

효과:
- 5규칙 분기 -> 1규칙 (자체/Cowork/혼합 구분 없이 모두 `섹션`)
- 혼합 라인 문제 자동 해소 (섹션 이 문서에서 완전 사라짐)
- CI lint 단순화: `섹션 ` 발견 = 위반
- Python 매치 단위, 80자 창 규칙 등 복잡 로직 불필요

---

## 1. 문제 정의 (두 층위)

### 층위 1. 특수 문자 렌더 깨짐
한글 + 특수 유니코드 겹침으로 글자폭 계산 오류.

### 층위 2. Windows UTF-8 인코딩
wi-utf8.md 섹션 1 완전 준수 (환경변수 4종 + Windows 감지 chcp.com 65001).

---

## 2. 실측 현황

### 2.1 특수 문자 파일 카운트

| 분류 | 문자 | 파일 수 |
|---|---|---|
| A. section sign (U+00A7) | `섹션 ` | 11 |
| B. middle dot (U+00B7) | `, ` | 16 |
| C. white medium star (U+2B50) | `*` | 9 (_archive 1 포함) |
| D. box-drawing (U+2500~U+257F) | | 6 |
| E. 14종 매핑군 | | ~42 |

### 2.2 middle dot 샘플

CLAUDE.md, PRD.md, standards.md, architecture.md 4 파일 샘플 전수 AND 열거. OR/종속 0건. 나머지 12 파일은 Commit 2 diff 검수 단계에서 전수 확인.

### 2.3 standards.md 기존 섹션 5
line 98~103 4줄 존재. v5에서 확장 대상.

### 2.4 Cowork 원본
Cowork 측에는 여전히 섹션 존재 (외부 SSOT, 본 PR 수정 대상 아님). WebDrama 측 섹션 치환 후 Cowork grep 정합성은 별도 방식 유지 (아래 섹션 6 참조).

---

## 3. 치환 매핑 v5

### 3.1 안전 자동 치환 (1:1)

| 문자 | U+ | 대체 |
|---|---|---|
| section sign | 00A7 | `섹션` |
| em dash | 2014 | `--` |
| en dash | 2013 | `-` |
| horizontal ellipsis | 2026 | `...` |
| left-right arrow | 2194 | `<->` |
| right arrow | 2192 | `->` |
| left arrow | 2190 | `<-` |
| greater equal | 2265 | `>=` |
| less equal | 2264 | `<=` |
| check | 2713 | `[v]` |
| heavy check | 2714 | `[v]` |
| cross | 2717 | `[x]` |
| warning sign | 26A0 | `[!]` |
| white heavy check mark | 2705 | `[OK]` |
| cross mark | 274C | `[NG]` |
| black star | 2605 | `*` |
| white star | 2606 | `*` |
| white medium star | 2B50 | `*` |
| sparkles | 2728 | `*` |
| black triangle right | 25B6 | `->` |
| black triangle down | 25BC | `v` |
| white up triangle | 25B3 | `[~]` |
| bullet | 2022 | `-` |

### 3.2 이모지 Unicode 블록 전수 (제거)

- U+1F300~U+1F5FF
- U+1F600~U+1F64F
- U+1F680~U+1F6FF
- U+1F700~U+1F77F
- U+1F780~U+1F7FF
- U+1F800~U+1F8FF
- U+1F900~U+1F9FF
- U+1FA00~U+1FA6F
- U+1FA70~U+1FAFF
- U+2600~U+26FF
- U+2700~U+27BF
- U+2B00~U+2BFF

### 3.3 section sign 단일 규칙 (v5 핵심 변경)

**모든 섹션 -> `섹션 N` 단순 치환**. 자체 참조, Cowork 참조, 혼합 라인, 연쇄 패턴 구분 없음.

예시:
- `PROJECT.md 섹션 3` -> `PROJECT.md 섹션 3`
- `Cowork/로케이션레퍼런스_v3.md 섹션 2.4` -> `Cowork/로케이션레퍼런스_v3.md 섹션 2.4`
- `섹션 6, 섹션 7, 섹션 8, 섹션 9` -> `섹션 6, 섹션 7, 섹션 8, 섹션 9` (middle dot 치환 후)
- `섹션 2.1~섹션 2.16` -> `섹션 2.1~2.16` (두 번째 섹션 제거)
- `섹션 ` -> `섹션` (이모지 제거 + 치환)

### 3.4 middle dot 치환

기본 `, ` 쉼표 공백. 예외 (OR/종속)는 Commit 2 diff 검수 단계에서 파일별 판정.

### 3.5 치환 순서

section sign 치환 먼저, middle dot 치환 나중. 이유: `섹션 A, 섹션 B, 섹션 C` 패턴에서 middle dot 먼저 치환 시 `섹션 A, 섹션 B, 섹션 C`가 되어 섹션 잔존.

### 3.6 box-drawing

| 문자 | 대체 |
|---|---|
| `-` | `-` |
| `|` | `\|` |
| `+-`, `+-` | `+-` |
| `+`, `+`, `+` | `+` |

### 3.7 체크박스 예외

markdown 체크박스 `\[[\sxX]\]` 단독 패턴 보호.

---

## 4. 치환 범위

### 4.1 포함

#### A. 본 프로젝트 문서 (.md)
- projects/나는괜찮아요/PROJECT.md
- projects/나는괜찮아요/.session/plan-step1-characters.md
- projects/나는괜찮아요/.session/plan-step2-locations.md
- projects/나는괜찮아요/.session/plan-encoding-refactor.md (본 plan) - **포함**
 - v5에서 섹션 사용 최소화 (매핑 표의 U+00A7 코드포인트 언급만, 본문에서 섹션 직접 사용 없음)
- projects/나는괜찮아요/.session/SESSION_HANDOFF_20260419.md
- projects/나는괜찮아요/.session/TEMPLATE.md
- projects/나는괜찮아요/assets/_logs/README.md

#### B. 글로벌 문서
- CLAUDE.md (프로젝트)
- PRD.md
- docs/ 전체 (standards.md는 Commit 1에서 별도 처리)
- .claude/rules/ 전체 .md
- .claude/agents/evaluator.md

#### C. RAG
- .claude/memory/rag/cdp-pikaso/ 전체 .md
- _archive 제외
- ref-selectors.md data-cy 값 제외

#### D. 스크립트 (주석 + 출력)
- .flowset/scripts/ 3개
- .flowset/hooks/ 2개
- scripts/cdp-utils.ts, gen-video.cjs (주석만)

#### E. 설정
- .gitignore 주석
- .editorconfig, .gitattributes

### 4.2 제외

| 대상 | 이유 |
|---|---|
| C:\Team-jane\Cowork\* | 외부 SSOT |
| scripts/cdp-utils.ts 경로 한글 | 실제 디렉토리명 |
| config/bgm.json 외부 식별자 값 | API 참조 |
| ref-selectors.md data-cy 값 | DOM 선택자 |
| _archive 디렉토리 | 원문 보존 |
| Vault 기존 로그 | 신규부터 ASCII |
| git 히스토리 | 수정 금지 |

### 4.3 화이트리스트 (CI lint 제외)

- **docs/standards.md 섹션 5 규약 설명 블록만** (section sign 코드포인트 언급 허용)
- 본 plan은 섹션 사용 최소화했으므로 화이트리스트 불필요 (섹션 직접 사용 시 `U+00A7`로 표기)

---

## 5. Windows UTF-8 보강 (wi-utf8.md 섹션 1)

### 5.1 표준 블록

```bash
#!/usr/bin/env bash

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
[[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] && chcp.com 65001 > /dev/null 2>&1
```

### 5.2 적용 대상
- .flowset/scripts/vault-helpers.sh
- .flowset/scripts/session-start-vault.sh
- .flowset/scripts/stop-vault-sync.sh
- .flowset/hooks/commit-msg
- .flowset/hooks/pre-push
- scripts/check-doc-encoding.sh (신규)

### 5.3 Git 설정 점검 (Commit 6 README)
```bash
git config --local --get core.quotepath || git config --local core.quotepath false
git config --local --get i18n.commitEncoding || git config --local i18n.commitEncoding utf-8
git config --local --get i18n.logOutputEncoding || git config --local i18n.logOutputEncoding utf-8
git config --local --get gui.encoding || git config --local gui.encoding utf-8
```

### 5.4 .editorconfig, .gitattributes 갱신
- .editorconfig: `charset = utf-8`
- .gitattributes: `* text=auto eol=lf`

---

## 6. 규약 문서화 (standards.md 섹션 5 확장)

### 6.1 SSOT 위치
- standards.md 섹션 5 확장 (정본)
- project.md, CLAUDE.md는 참조 라인만

### 6.2 standards.md 섹션 5 개정안

```
## 5. 인코딩, 줄바꿈, 문자 규약

### 5.1 파일 인코딩
- 모든 텍스트 파일: UTF-8 (BOM 없음)
- 줄바꿈: LF
- .editorconfig: charset = utf-8
- .gitattributes: * text=auto eol=lf

### 5.2 .sh 파일 UTF-8 블록 (필수)
(섹션 5.1 블록 내용)

### 5.3 Git 설정 (로컬)
core.quotepath = false
i18n.commitEncoding = utf-8
i18n.logOutputEncoding = utf-8
gui.encoding = utf-8

### 5.4 Python 실행
PYTHONUTF8=1, open(encoding='utf-8')

### 5.5 특수 유니코드 기호 사용 금지
ASCII 대체 가능 기호는 ASCII 사용.

금지:
- em dash, en dash, ellipsis, 화살표, 비교 연산자
- 체크/엑스 마크, 경고/OK/NG 표시
- 이모지 전체 (Unicode 블록 U+1F300~U+1FAFF, U+2600~U+27BF, U+2B00~U+2BFF)
- 박스 드로잉 (디렉토리 트리는 ASCII +- | 사용)
- middle dot, 별 기호, bullet

예외:
- 체크박스 markdown [ ], [x]
- 코드 식별자, 변수명, DOM 속성값, JSON 값 (외부 시스템 참조)
- 파일 경로 한글 디렉토리명
- _archive 디렉토리

### 5.6 섹션 참조 기호 (section sign U+00A7) 처리
WebDrama 문서 전체에서 section sign 사용 금지. 모두 "섹션 N" 한글로 치환.

Cowork 원본은 section sign 사용 중 (외부 SSOT). WebDrama 측 "섹션 N"과 Cowork 측 "섹션 N"이 의미상 동일. grep 시 양쪽 패턴 모두 확인:
- WebDrama 내부: "섹션 N"
- Cowork 원본: "섹션 N"

Cowork 측에도 장기적 동기화 요청 예정 (별도 PR).
```

### 6.3 project.md 참조
```
## 인코딩 규약
docs/standards.md 섹션 5 참조.
```

### 6.4 CLAUDE.md 참조 (핵심 규칙 끝)
```
10. 인코딩 규약: docs/standards.md 섹션 5 참조.
```

---

## 7. 실행 순서 (커밋 7개)

### Commit 1: `WI-docs 인코딩 규약 standards.md 섹션 5 확장`
- docs/standards.md 섹션 5 확장 (기존 4줄 -> 6 하위 섹션)
- standards.md 본문 기존 섹션 치환 (line 67, 89 등 전수)
- .claude/rules/project.md 참조 라인
- CLAUDE.md 참조 라인
- diff: ~100줄

### Commit 2: `WI-chore 본 작품 문서 특수문자 치환`
- projects/나는괜찮아요/ 하위 .md 전체 (본 plan 포함)
- 치환 순서: section sign 먼저, middle dot 나중
- diff: ~700줄

### Commit 3: `WI-docs 글로벌 문서 특수문자 치환`
- CLAUDE.md 본문, PRD.md
- docs/ 나머지 (standards.md 제외)
- .claude/rules/ .md, .claude/agents/evaluator.md
- diff: ~300줄

### Commit 4: `WI-docs RAG 디렉토리 특수문자 치환`
- .claude/memory/rag/cdp-pikaso/ 전체 .md
- _archive 제외, ref-selectors.md data-cy 제외
- diff: ~400줄

### Commit 5: `WI-chore 스크립트 주석 특수문자 치환`
- .flowset/scripts/, hooks/, scripts/cdp-utils.ts, gen-video.cjs
- 주석만
- diff: ~50줄

### Commit 6: `WI-chore sh 파일 UTF-8 블록 보강`
- 5개 .sh 파일 UTF-8 블록 교체
- .editorconfig, .gitattributes 갱신
- git 설정 README 추가
- smoke 테스트 명령 1~2 실행
- diff: ~40줄

### Commit 7: `WI-chore CI 문서 인코딩 lint 추가`
- scripts/check-doc-encoding.py 신규 (단순)
- scripts/check-doc-encoding.sh 신규 (Python 래퍼)
- .github/workflows/doc-encoding.yml 신규
- smoke 테스트 명령 3 실행
- diff: ~80줄

Cowork 측 섹션 -> 섹션 동기화 요청은 별도 PR (본 PR 스코프 외).

---

## 8. scripts/check-doc-encoding.py 설계 v5 (단순)

### 8.1 Python 스크립트

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""WebDrama 문서 인코딩 lint v5 - 단순화.

모든 section sign(U+00A7)은 치환 대상. 이중 표기 예외 없음.
"""
import re
import sys
from pathlib import Path

FORBIDDEN_CHARS = set([
 '\u00a7', # section sign
 '\u00b7', # middle dot
 '\u2013', '\u2014', '\u2026',
 '\u2190', '\u2192', '\u2194',
 '\u2264', '\u2265',
 '\u2605', '\u2606', '\u2b50', '\u2728',
 '\u2713', '\u2714', '\u2717',
 '\u26a0', '\u2705', '\u274c',
 '\u25b6', '\u25bc', '\u25b3',
 '\u2022',
])

EMOJI_RANGES = [
 (0x1F300, 0x1F5FF), (0x1F600, 0x1F64F), (0x1F680, 0x1F6FF),
 (0x1F700, 0x1F77F), (0x1F780, 0x1F7FF), (0x1F800, 0x1F8FF),
 (0x1F900, 0x1F9FF), (0x1FA00, 0x1FA6F), (0x1FA70, 0x1FAFF),
 (0x2600, 0x26FF), (0x2700, 0x27BF), (0x2B00, 0x2BFF),
]
BOX_DRAWING_RANGE = (0x2500, 0x257F)

CHECKBOX_PATTERN = re.compile(r'\[[\sxX]\]')

WHITELIST_PATHS = {
 'docs/standards.md', # 섹션 5 규약 설명 블록에 U+00A7 코드포인트 언급 허용
}

EXCLUDED_DIRS = {'_archive', '.git', 'node_modules'}


def is_emoji(c):
 cp = ord(c)
 return any(start <= cp <= end for start, end in EMOJI_RANGES)


def is_box_drawing(c):
 cp = ord(c)
 return BOX_DRAWING_RANGE[0] <= cp <= BOX_DRAWING_RANGE[1]


def check_line(line):
 # 체크박스 토큰 마스킹
 line_masked = CHECKBOX_PATTERN.sub('', line)
 violations = []
 for c in line_masked:
 if c in FORBIDDEN_CHARS:
 violations.append((c, f'U+{ord(c):04X} forbidden'))
 elif is_emoji(c):
 violations.append((c, f'U+{ord(c):04X} emoji'))
 elif is_box_drawing(c):
 violations.append((c, f'U+{ord(c):04X} box-drawing'))
 return violations


def check_file(path, rel_path):
 rel = rel_path.replace('\\', '/')
 if rel in WHITELIST_PATHS:
 return []
 try:
 text = path.read_text(encoding='utf-8')
 except (UnicodeDecodeError, OSError) as e:
 return [(0, f'READ_ERROR: {e}')]
 violations = []
 for i, line in enumerate(text.splitlines(), 1):
 for ch, msg in check_line(line):
 violations.append((i, f'{msg} {repr(ch)} in: {line.strip()[:80]}'))
 return violations


def main():
 root = Path('.')
 total = 0
 for path in root.rglob('*.md'):
 if any(part in EXCLUDED_DIRS for part in path.parts):
 continue
 rel = str(path.relative_to(root))
 for line_no, msg in check_file(path, rel):
 print(f'{rel}:{line_no}: {msg}')
 total += 1
 if total:
 print(f'\nTotal violations: {total}', file=sys.stderr)
 return 1
 return 0


if __name__ == '__main__':
 sys.exit(main())
```

### 8.2 scripts/check-doc-encoding.sh (래퍼)

```bash
#!/usr/bin/env bash

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
[[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] && chcp.com 65001 > /dev/null 2>&1

set -euo pipefail

python3 "$(dirname "$0")/check-doc-encoding.py"
```

### 8.3 .github/workflows/doc-encoding.yml

```yaml
name: Document Encoding Check

on:
 pull_request:
 paths:
 - '**/*.md'
 - 'scripts/check-doc-encoding.*'
 - '.github/workflows/doc-encoding.yml'
 workflow_dispatch:

jobs:
 check:
 runs-on: ubuntu-latest
 steps:
 - name: Checkout
 uses: actions/checkout@v4

 - name: Setup Python
 uses: actions/setup-python@v5
 with:
 python-version: '3.11'

 - name: Run encoding check
 shell: bash
 env:
 PYTHONUTF8: '1'
 PYTHONIOENCODING: utf-8
 run: |
 chmod +x scripts/check-doc-encoding.sh
 ./scripts/check-doc-encoding.sh
```

### 8.4 검증 예시 (v5 단순 규칙)

- `PROJECT.md 섹션 3 참조` -> 섹션 없음 -> OK
- `PROJECT.md 섹션 3 참조` -> 섹션 위반 -> FAIL (치환 누락)
- step2-locations L315 치환 후 `Cowork 섹션 3, 섹션 4.7` -> 섹션 없음 -> OK
- 혼합 라인 문제 자동 해소

---

## 9. 롤백, smoke 테스트

### 9.1 롤백
- 소수 오탐: 후속 수정 커밋
- 다수: `git revert <커밋>` 후 재작업
- Commit 6 스크립트 에러 시 즉시 revert

### 9.2 커밋 전 검증
- `git diff --stat`
- 의도 외 파일 확인
- 마크다운 렌더 미리보기

### 9.3 smoke 테스트 (단계 의존성)

**Commit 6 시점**:
```bash
# 명령 1: Vault 로드
source .flowset/scripts/vault-helpers.sh && echo "vault-helpers OK"

# 명령 2: commit-msg dry-run (파일 경로 방식)
echo "WI-chore test" > /tmp/msg.txt
.flowset/hooks/commit-msg /tmp/msg.txt && echo "commit-msg OK"
rm /tmp/msg.txt
```

**Commit 7 시점**:
```bash
# 명령 3: Python lint
python3 scripts/check-doc-encoding.py && echo "doc-encoding OK"
```

명령 3은 Commit 7 이전에는 스크립트 부재로 실행 불가.

---

## 10. 리스크

| 리스크 | 대응 |
|---|---|
| 자동 치환 오탐 | 커밋 전 diff + 섹션 9 롤백 |
| 마크다운 표 정렬 | 수동 확인 |
| Cowork grep 정합성 | standards.md 섹션 5.6 "양쪽 패턴 확인" 명시 + Cowork 동기화 별도 PR |
| 코드 파일 리터럴 | 제외 기준 섹션 4.2 |
| Vault 로그 혼재 | 신규 ASCII, 과거 유지 |
| chcp 비Windows | OSTYPE 가드 |
| CI lint 초기 실패 | Commit 7은 Commit 2~6 완료 후 |
| middle dot 예외 | 4 파일 샘플 + 12 파일 Commit 2 diff 검수 |
| 치환 순서 오류 | 섹션 3.5 section sign 먼저, middle dot 나중 |
| 화이트리스트 모호성 | standards.md만 (본 plan은 섹션 사용 최소화로 화이트리스트 불필요) |
| Python 3 의존성 | CI workflow actions/setup-python@v5 |

---

## 11. 개정 이력 (v1 -> v5)

### v5 핵심 변경 (섹션 이중 표기 폐기)
| 이슈 | v4 | v5 |
|---|---|---|
| CI lint 혼합 라인 false negative (v4 차단) | Python 매치 단위 80자 창 (여전히 false negative) | **섹션 이중 표기 폐기, 모든 섹션 -> 섹션 단순 치환**. 혼합 라인 문제 자동 해소 |
| 5규칙 분기 복잡성 | 규칙 1~5 매치 단위 | **1규칙: 모든 섹션 -> 섹션** |
| 실측 연쇄 패턴 실증 | L307, L315 실증 필요 | 실증 불필요 (섹션 자체가 사라짐) |
| 화이트리스트 혼란 (본 plan, step2 등) | 여러 파일 화이트리스트 필요 | **standards.md만** (본 plan은 섹션 사용 최소화) |
| Python 스크립트 복잡도 | 매치 단위, context 검색 | **단일 라인 섹션 검출** (20 line 정도) |

### v3 eval 우선순위 1~3 유지 반영
- 실측 숫자 정확
- * 매핑
- wi-utf8.md 섹션 1 완전 블록
- standards.md 섹션 5 확장
- 커밋 7개 분리, WI-chore/WI-docs 단독
- _archive 제외, 스크립트 제외 기준
- 롤백 계획, smoke 테스트
- 이모지 블록 전수, 체크박스 예외
- 치환 순서 (section 먼저 middle dot 나중)

---

## 12. 검증 요청 (evaluator v5)

1. 섹션 이중 표기 폐기 단일 규칙 타당성
2. 치환 매핑 완결성 (v5 섹션 3)
3. Python 스크립트 단순화 (섹션 8.1)
4. 혼합 라인 문제 해소 실증 (섹션 8.4)
5. 화이트리스트 최소화 (standards.md만)
6. Cowork grep 정합성 대응 (섹션 6.2 섹션 5.6 양쪽 패턴)
7. 커밋 7개 분리, 스코프 명확
8. wi-utf8.md 섹션 1 완전 준수
9. wi-global.md 커밋 형식 준수
10. GitHub Actions workflow 유효성
11. smoke 테스트 단계 분리
12. Python 3 의존성 setup-python

판정: 단일 점수 0~10. 10점 임계치. 한글 12항목. PASS면 Commit 1 실행 착수.
