# Agent Instructions

프로젝트의 빌드, 테스트, 린트 명령을 정의합니다.

## 빌드 & 검증 명령

### Lint
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Type Check
```bash
npx tsc --noEmit
```

## 의존성 설치
```bash
npm install
```

## 인프라 환경

### 로컬 하드웨어
- **GPU**: NVIDIA RTX 4070 (12GB VRAM)
- **VRAM 제약**: TTS와 BGM 동시 실행 불가 → 순차 처리 필수

### 로컬 서비스
| 서비스 | 포트 | 상태 | 설정 파일 |
|--------|------|------|----------|
| Chrome CDP | 9222 | 설치됨 | config/freepik.json |
| ACE-Step 1.5XL | 8001 | XL 모델 미다운로드 | config/bgm.json |
| Qwen3-TTS | 8002 | 미설치 | config/tts.json |
| GPT-SoVITS | 8003 | 미설치 | config/tts.json |

### 외부 서비스
- 없음 (전부 로컬)

### DB
- 없음 (파일 기반 JSON)

### mock 정책
- DB 없으므로 mock 불필요
- TTS/BGM 서버 미실행 시 → edge-tts fallback 또는 에러 로그 + 스킵

## 아키텍처 계약
<!-- /wi:start Phase 4.6에서 자동 채워짐 -->

## 프로젝트 구조
```
src/
├── research/          # 리서치 모듈
├── story/             # 창작 에이전트 모듈
├── asset/             # 실행 에이전트 - 에셋
│   ├── cdp/           # Freepik CDP 자동화
│   ├── tts/           # TTS 음성 생성
│   └── bgm/           # ACE-Step BGM
├── editor/            # 실행 에이전트 - 편집
│   ├── compositions/  # Remotion 컴포넌트
│   └── renderer.ts    # 렌더링 실행
├── evaluator/         # Evaluator 모듈
└── common/            # 공유 타입/설정/로거
projects/              # 프로젝트별 콘텐츠 (gitignore)
voices/                # 음성 프로필 (공통)
config/                # 설정 파일
templates/             # 재사용 템플릿
```
