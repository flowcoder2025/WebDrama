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
- Kling 모션: 1920×1080, 30fps, h.264, 10초 (예외 20초 — **EP4 C15만 해당**. Kling에서 10초 2개 개별 생성 후 FFmpeg concat으로 병합: `ffmpeg -f concat -safe 0 -i list.txt -c copy ep4_c15_v1.mp4` — list.txt에 `file 'ep4_c15_partA.mp4'\nfile 'ep4_c15_partB.mp4'`. 둘째 파트 Start Image는 첫 파트 last frame에서 파생 — `workflow.md §3.2` 절차 참조)
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
    "type": "still|motion|vo|bgm|sfx|final|shorts|thumb",
    "created_at": "2026-04-19T20:00:00+09:00",
    "version": 1,
    "attempts": 3,
    "engine": "NanoBanana2|Kling2.5|Qwen3-TTS|GPT-SoVITS|edge-tts|ACE-Step",
    "references": ["char_eunseo_base_v1.png", "loc_office_daytime", "office_anchor_ep1_c00"],
    "prompt": "@img2 Strictly preserve the reference woman's ...",
    "negative": "no text, no watermark, no bracelet",
    "params": { "resolution": "2K", "ratio": "16:9", "aspect": "landscape" },
    "source_prompt_section": "Cowork/나는괜찮아요_시즌1_프롬프트북_v3_EP1.md §3 C05",
    "chained_from": null,
    "compliance_notes": ["의상 A세트 일치", "골드 체인 visible"]
  }
  ```
- `attempts`: 통과까지 걸린 횟수. `retry-count.json`과 일치해야 함.
- `chained_from`: 프레임 체이닝 시 이전 클립 ID (예: `ep1_c10_v1.mp4`)
- `references`: Freepik에 등록된 ref 파일명 또는 prodId 목록

## 5. 인코딩·줄바꿈

- 모든 텍스트 파일: UTF-8 (BOM 없음)
- 줄바꿈: LF (`.gitattributes` 강제)
- `.editorconfig`에 `charset = utf-8` 명시
- Python: `PYTHONUTF8=1` 또는 `sys.stdout.reconfigure(encoding='utf-8')`

## 6. 운영 환경 가정

- Windows 11 (Git Bash / MSYS2)
- Node.js 20+, TypeScript 5+
- GPU VRAM 12GB+ (ACE-Step)
- Chrome (CDP port 9222)
- FFmpeg (PATH)
