# Sprint Contract — WI-001-feat 프로젝트 초기화 및 의존성 설치

## 수용 기준
- [ ] package.json 생성 (name: webdrama, type: module)
- [ ] TypeScript 5+ 설치 및 tsconfig.json 구성
- [ ] ESLint 설치 및 eslint.config.mjs 구성
- [ ] Vitest 설치 및 vitest.config.ts 구성
- [ ] 핵심 의존성 설치: puppeteer, @remotion/cli, @remotion/renderer, remotion, react, react-dom
- [ ] 보조 의존성 설치: edge-tts (fallback TTS)
- [ ] src/ 디렉토리 구조 생성 (research, story, asset, editor, common)
- [ ] npm run lint, npm run build, npm test 스크립트 동작 확인

## 산출물
- package.json, tsconfig.json, eslint.config.mjs, vitest.config.ts
- src/ 디렉토리 구조

## 검증 방법
```bash
npm run lint   # ESLint 에러 0건
npm run build  # tsc 컴파일 성공
npm test       # Vitest 실행 성공 (테스트 0건이어도 통과)
```
