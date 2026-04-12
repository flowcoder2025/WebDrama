# Sprint Contract — WI-003-feat 설정 로더 구현

## 수용 기준
- [ ] config/ JSON 파일을 타입 안전하게 로드하는 함수 구현
- [ ] loadConfig<T>(filename) → T 제네릭 로더
- [ ] 개별 로더: loadProjectConfig(), loadFreepikConfig(), loadTtsConfig(), loadBgmConfig(), loadRemotionConfig()
- [ ] 파일 없을 시 명확한 에러 메시지
- [ ] 단위 테스트 작성 (정상 로드 + 파일 미존재)
- [ ] npm run build, lint, test 전체 통과

## 산출물
- src/common/config.ts (확장)
- tests/config.test.ts
