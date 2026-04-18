# WebDrama PRD

**버전**: v3.1 기반 재작성 (2026-04-19)
**성격**: 범용 플랫폼 정의 (작품·시즌 무관, 재사용 가능)

---

## 1. 프로젝트 개요

- **이름**: WebDrama
- **목표**: 프롬프트 기반 웹드라마/애니메이션 자동 제작 파이프라인 (CLI)
- **대상 사용자**: 1인 (본인)
- **성공 기준**: 스토리(상위 프로젝트 산출물) → 이미지 → 영상 → 음성 → 편집 → 최종 MP4

## 2. 작품 경계

- **상위 프로젝트(Cowork)**: 스토리·시나리오·프롬프트 설계
  - 경로: `C:\Team-jane\Cowork\`
  - 산출물: 프롬프트북·캐릭터 레퍼런스·편집배포 규격 등
- **WebDrama (본 프로젝트)**: 이미지·영상·음성·편집 실행
  - 경로: `C:\Team-jane\WebDrama\`
  - 입력: Cowork 산출물 (작품별 단일 진입점 문서)
  - 출력: `projects/{작품}/assets/final/` 최종 영상

## 3. 기술 스택

- **언어**: TypeScript (Node.js 20+ CLI)
- **CDP**: Puppeteer — Freepik(NanoBanana2·Kling 2.5) 웹 자동화
- **TTS**: Qwen3-TTS / GPT-SoVITS — 추상화 인터페이스 + edge-tts fallback
- **BGM**: ACE-Step 1.5XL — 로컬 GPU REST API (`localhost:8001`)
- **영상 편집**: Remotion (`@remotion/renderer`) — React 기반 타임라인
- **인코딩**: FFmpeg (Remotion 내부)
- **브라우저 제어**: Chrome DevTools Protocol (port 9222)

## 4. 8단계 파이프라인

1. **캐릭터 레퍼런스 등록** (3종 이상) — Freepik 라이브러리
2. **마스터 로케이션 레퍼런스** 생성
3. **앵커 컷 생성** — 시퀀스 체인 참조용 (필요 시)
4. **Start Image 생성** — Freepik NanoBanana2
5. **Kling 모션 클립** 생성 (기본 10초)
6. **TTS 음성** 생성 (캐릭터별 VO + 나레이션)
7. **BGM/SFX** 생성
8. **Remotion 합성 + FFmpeg 인코딩** — 본편 + Shorts + 썸네일

상세는 `docs/architecture.md` 참조.

## 5. 저장소 표준

### 5.1 작품 디렉토리
```
projects/{작품}/
├── PROJECT.md                  # 작품 메타 + 상위 프로젝트 SSOT 링크
├── assets/
│   ├── refs/                   # 캐릭터 레퍼런스
│   ├── anchors/                # 앵커 컷 (시퀀스 체이닝용)
│   ├── stills/{ep1,ep2,...}/   # Start Image
│   ├── motions/{ep1,ep2,...}/  # Kling 클립
│   ├── vo/{ep1,ep2,...}/       # TTS 음성
│   ├── bgm/                    # 배경음악
│   ├── sfx/                    # 효과음
│   ├── final/                  # 본편 MP4
│   ├── shorts/                 # 쇼츠 MP4
│   └── thumbs/                 # 썸네일
└── .session/                   # 세션 핸드오프 (선택)
```

### 5.2 파일 네이밍
- Start Image: `ep<n>_c<nn>_still_v<m>.png`
- Motion: `ep<n>_c<nn>_v<m>.mp4`
- VO: `ep<n>_c<nn>_vo_<voice_id>_v<m>.wav`
- Final: `ep<n>_final_v<m>_<YYYYMMDD>.mp4`
- Shorts: `ep<n>_shorts_<a|b|c>_v<m>.mp4`
- Thumbnail: `ep<n>_thumb_v<1-4>.jpg`

### 5.3 레거시 보관
- 이전 버전 산출물은 `{디렉토리}_v1_legacy/` 또는 `{작품}_v1/` 네이밍으로 보존
- 사용자 비교·회귀 참조용

## 6. 품질 원칙

### 6.1 검수
- **Evaluator 서브에이전트** (`.claude/agents/evaluator.md`)가 결과물 채점
- 채점 기준: 스토리 구조(30%) / 비주얼 일관성(25%) / 음성 품질(20%) / 편집 완성도(25%)
- 10점 = 통과, 5~9.9 = 재작업(최대 10회), 5 미만 = 전면 재생성

### 6.2 자동화 전환 기준
- **현재 기본값**: CDP(이미지·영상) = 수작업 / TTS·BGM·Remotion = 자동화
- **수작업 → 자동화 전환 조건**: 사용자 최종 판단
- 전환 시: 당시 확정된 수작업 패턴을 스크립트화 (관련 RAG를 그대로 코드화)

### 6.3 재현성
- 모든 프롬프트·파라미터 기록 (프로젝트별 `PROJECT.md` 또는 `assets/_logs/`)
- 실행 증거 없이 "완료" 주장 금지 (글로벌 품질 기준)

## 7. 에이전트 역할

| 역할 | 책임 | 구현 |
|---|---|---|
| 리드 (대화형) | 요구사항 분석, 전체 실행, 단계별 판단 | 사용자 세션 |
| Evaluator | 결과물 채점·피드백 | `.claude/agents/evaluator.md` |
| Creative (옵션) | 창작 판단 필요 시 소환 | 서브에이전트 (필요 시에만) |

서브에이전트 간 통신은 파일 기반 (`production-spec.json`, `eval-report.json` 등 JSON).

## 8. 범용 파일 구조

```
WebDrama/
├── PRD.md                      # 본 문서
├── CLAUDE.md                   # 시스템 구조 인지
├── package.json
├── tsconfig.json               # (자동화 착수 시 생성)
├── eslint.config.mjs
├── config/                     # 엔진 설정 (freepik/tts/bgm/remotion)
├── voices/                     # 공통 음성 프로필
├── templates/                  # 평가 기준 등 템플릿
├── scripts/                    # CDP 유틸 (수작업 단계)
├── docs/                       # 플랫폼 문서 (architecture/workflow/standards)
├── projects/                   # 작품별 콘텐츠 (gitignore)
│   └── {작품}/
├── .claude/
│   ├── agents/evaluator.md
│   ├── rules/project.md, rag-context.md, wi-*.md
│   └── memory/rag/cdp-pikaso/  # 범용 CDP 지식
└── .flowset/
    ├── requirements.md         # 사용자 원본 요구사항 (수정 금지)
    ├── hooks/commit-msg, pre-push
    └── scripts/vault-*         # Obsidian Vault 동기화
```

## 9. 외부 연동

- **Freepik** (CDP): 이미지(NanoBanana2 2K) + 영상(Kling 2.5 1080p)
- **ACE-Step 1.5XL** (localhost:8001): BGM
- **Qwen3-TTS** (localhost:8002), **GPT-SoVITS** (localhost:8003): TTS
- **edge-tts**: Fallback TTS
- **YouTube 업로드**: 수동 (자동화 범위 외)

## 10. 비기능 요구사항

- GPU VRAM 12GB+ (ACE-Step 1.5XL)
- Chrome 설치 필수 (CDP 연결: `--remote-debugging-port=9222`)
- FFmpeg 설치 필수 (Remotion 내부)
- Node.js 20+ / TypeScript 5+
- 생성 에셋은 로컬 저장 (`projects/` gitignore)
- 운영 환경: Windows 11 (Git Bash / MSYS2), UTF-8 필수

## 11. 버전·변경

| 버전 | 날짜 | 주요 변경 |
|---|---|---|
| v1 | 2026-04-12 | 초기 (자동 파이프라인 + 5팀 분리 전제) |
| **v3.1 기반 재작성** | **2026-04-19** | Cowork v3.1 수용, 작품 단위 구조, 수작업·자동화 경계 명시, FlowSet 루프·팀 기능 제거 |
