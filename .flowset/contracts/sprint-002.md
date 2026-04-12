# Sprint Contract — WI-002-feat 공유 타입 정의 (production-spec 스키마)

## 수용 기준
- [ ] ProductionSpec 인터페이스 완전 정의 (metadata, characters, scenes)
- [ ] SceneSpec 인터페이스 (dialogues, narration, bgm, transition, subtitle)
- [ ] ResearchReport 인터페이스 (성공작 분석 + 트렌드 결과)
- [ ] EvalReport 인터페이스 (4대 기준 채점 + 판정)
- [ ] TTS/BGM 설정 타입 정의
- [ ] npm run build 통과 (타입 에러 0건)

## 산출물
- src/common/types.ts (확장)

## 검증 방법
```bash
npm run build  # tsc 컴파일 성공
npm run lint   # ESLint 에러 0건
```
