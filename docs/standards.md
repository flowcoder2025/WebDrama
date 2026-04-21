# WebDrama 표준

## 1. 파일 네이밍

### 1.1 에셋
| 종류 | 패턴 | 예시 |
|---|---|---|
| 캐릭터 ref | `char_<id>_<slot>_v<n>.png` | `char_eunseo_base_v1.png` |
| 로케이션 ref | `loc_<code>_v<n>.png` | `loc_office_daytime_v1.png` |
| 앵커 컷 | `<로케>_anchor_ep<n>_c<nn>_v<m>.png` | `busstop_anchor_ep1_c10_v1.png` |
| Start Image | `ep<n>_c<nn>_still_v<m>.png` | `ep1_c05_still_v1.png` |
| Kling 모션 | `ep<n>_c<nn>_v<m>.mp4` | `ep1_c05_v1.mp4` |
| TTS 음성 | `ep<n>_c<nn>_vo_<voice_id>_v<m>.wav` | `ep1_c05_vo_eunseo_v1.wav` |
| BGM | `bgm_<theme>_v<m>.wav` | `bgm_cool_office_v1.wav` |
| SFX | `sfx_<kind>_v<m>.wav` | `sfx_rain_start_v1.wav` |
| 본편 | `ep<n>_final_v<m>_<YYYYMMDD>.mp4` | `ep1_final_v1_20260428.mp4` |
| 쇼츠 | `ep<n>_shorts_<a\|b\|c>_v<m>.mp4` | `ep1_shorts_a_v1.mp4` |
| 썸네일 | `ep<n>_thumb_v<1-4>.jpg` | `ep1_thumb_v1.jpg` |

### 1.2 레거시 보관
- 이전 버전 작품: `projects/{작품}_v<N>/`
- 이전 버전 에셋: `{디렉토리}_v<N>_legacy/` 또는 동일 레벨 `legacy/` 하위

## 2. 버전 관리

### 2.1 에셋 버전
- `v1`, `v2`, ... 숫자 순번
- 재작업은 `v<N+1>` 신규 생성, 이전 버전 보존
- 10회 재작업 상한 초과 시 `v<N>_rev1`, `v<N>_rev2` 형식 검토

### 2.2 디렉토리 버전
- 전체 구조 변경 수준 리뉴얼 시 `_v<N>/` 접미사
- 새 구조는 접미사 없이 메인 위치

## 3. 커밋 규약

### 3.1 형식
```
WI-NNN-[type] 한글 작업명
```
- NNN: 3자리 순번 (작업 단위)
- type: feat, fix, docs, style, refactor, test, chore, perf, ci, revert

### 3.2 번호 없는 예외
- `WI-chore`: 환경 셋업, 인프라 조정
- `WI-docs`: 문서 작업

### 3.3 브랜치
- `feat/WI-NNN-feat-작업명-kebab`
- `fix/WI-NNN-fix-작업명-kebab`
- `chore/WI-chore-작업명-kebab` (번호 없는 경우)

### 3.4 main 보호
- 직접 push 금지 (pre-push hook 강제)
- PR을 통해서만 머지

## 4. 품질 기준

### 4.1 코드 (자동화 착수 후)
- TypeScript strict
- ESLint 규칙 준수
- 테스트 통과 (`npm run lint && npm run build && npm test`)
- 플레이스홀더·TODO·stub 금지

### 4.2 에셋
- Start Image: 2K, 16:9, PNG
- Kling 모션: 1920×1080, 30fps, h.264, 10초 (예외 20초 -- **EP4 C15만 해당**. Kling에서 10초 2개 개별 생성 후 FFmpeg concat으로 병합: `ffmpeg -f concat -safe 0 -i list.txt -c copy ep4_c15_v1.mp4` -- list.txt에 `file 'ep4_c15_partA.mp4'\nfile 'ep4_c15_partB.mp4'`. 둘째 파트 Start Image는 첫 파트 last frame에서 파생 -- `workflow.md 섹션 3.2` 절차 참조)
- 쇼츠: 1080×1920, 9:16
- 썸네일: 1280×720 또는 2K 정적
- 본편: 1920×1080, 30fps, h.264 crf 18

### 4.3 에셋 메타데이터

- 각 생성 에셋마다 메타 JSON 1개씩 기록 (재현 가능성 보장)
- 저장 위치: `projects/{작품}/assets/_logs/{ep}_{cc}_meta.json`
- 스키마:
  ```json
  {
    "asset": "ep1_c05_still_v1.png",
    "type": "char_ref|loc_ref|anchor|still|motion|vo|bgm|sfx|final|shorts|thumb",
    "created_at": "2026-04-19T20:00:00+09:00",
    "version": 1,
    "attempts": 3,
    "engine": "NanoBanana2|Kling2.5|Qwen3-TTS|GPT-SoVITS|edge-tts|ACE-Step",
    "references": ["char_eunseo_base_v1.png", "loc_office_daytime", "office_anchor_ep1_c00"],
    "prompt": "@img2 Strictly preserve the reference woman's ...",
    "negative": "no text, no watermark, no bracelet",
    "params": { "resolution": "2K", "ratio": "16:9", "aspect": "landscape" },
    "source_prompt_section": "Cowork/나는괜찮아요_시즌1_프롬프트북_v3_EP1.md 섹션 3 C05",
    "chained_from": null,
    "compliance_notes": ["의상 A세트 일치", "골드 체인 visible"]
  }
  ```
- `attempts`: 통과까지 걸린 횟수. `retry-count.json`과 일치해야 함.
- `chained_from`: 프레임 체이닝 시 이전 클립 ID (예: `ep1_c10_v1.mp4`)
- `references`: Freepik에 등록된 ref 파일명 또는 prodId 목록

## 5. 인코딩, 줄바꿈, 문자 규약

### 5.1 파일 인코딩
- 모든 텍스트 파일: UTF-8 (BOM 없음)
- 줄바꿈: LF (`.gitattributes` 강제)
- `.editorconfig`: `charset = utf-8`
- `.gitattributes`: `* text=auto eol=lf`

### 5.2 .sh 파일 UTF-8 블록 (필수)
모든 .sh 파일 shebang 직후:

```
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
[[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]] && chcp.com 65001 > /dev/null 2>&1
```

### 5.3 Git 설정 (로컬)
- core.quotepath = false
- i18n.commitEncoding = utf-8
- i18n.logOutputEncoding = utf-8
- gui.encoding = utf-8

### 5.4 Python 실행
- PYTHONUTF8=1 (섹션 5.2 블록 포함)
- open() 호출 시 encoding='utf-8' 명시 권장

### 5.5 특수 유니코드 기호 사용 금지
사용자 환경 렌더 깨짐 방지. ASCII로 표현 가능한 모든 기호는 ASCII 사용.

금지:
- em dash (U+2014), en dash (U+2013): "--", "-"
- horizontal ellipsis (U+2026): "..."
- 화살표 (U+2190, U+2192, U+2194): "<-", "->", "<->"
- 비교 연산자 (U+2264, U+2265): "<=", ">="
- 체크/엑스 마크 (U+2713, U+2714, U+2717): "[v]", "[x]"
- 경고/알림 (U+26A0, U+2705, U+274C): "[!]", "[OK]", "[NG]"
- 이모지 전체 (Unicode 블록 U+1F300~U+1FAFF, U+2600~U+27BF, U+2B00~U+2BFF)
- 박스 드로잉 (U+2500~U+257F, 디렉토리 트리는 ASCII "+-" "|" 사용)
- middle dot (U+00B7): ",", "/", "와/과" (맥락별)
- 별 기호 (U+2605, U+2606, U+2B50, U+2728): "*"
- bullet (U+2022): "-"
- section sign (U+00A7): "섹션" (한글)
- 삼각형 (U+25B6, U+25BC, U+25B3): "->", "v", "[~]"

예외:
- 체크박스 markdown `- [ ]`, `- [x]` (이미 ASCII)
- 코드 파일 내 식별자, 변수명, DOM 속성값, JSON 값 (외부 시스템 참조)
- 파일 경로 내 한글 디렉토리명 (실제 디렉토리와 일치)
- `_archive` 디렉토리 (원문 보존)
- 본 규약 문서 섹션 5.5~5.6 내 유니코드 코드포인트 표기 (예: U+00A7)

### 5.6 섹션 참조 기호 처리
Cowork 원본 문서는 section sign (U+00A7) 사용 중. WebDrama 측은 모두 "섹션 N" 한글로 치환. grep 정합성 유지:
- WebDrama 내부 참조: "섹션 N"
- Cowork 원본 참조: section sign 기호 + N (원본 유지)

양쪽 패턴 모두 확인하여 cross-reference. Cowork 측 동기화는 별도 PR.

## 6. 운영 환경 가정

- Windows 11 (Git Bash / MSYS2)
- Node.js 20+, TypeScript 5+
- GPU VRAM 12GB+ (ACE-Step)
- Chrome (CDP port 9222)
- FFmpeg (PATH)
