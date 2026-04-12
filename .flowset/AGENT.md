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
<!-- /wi:env에서 자동 채워짐 -->

### 외부 서비스 (로컬)
- **Freepik CDP**: Chrome --remote-debugging-port=9222
- **ACE-Step 1.5XL**: localhost:8001 (로컬 GPU, BGM 생성)
- **Qwen3-TTS**: localhost:8002 (로컬 GPU, TTS)
- **GPT-SoVITS**: localhost:8003 (로컬 GPU, TTS)

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
