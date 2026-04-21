# RAG Context Mapping

작업 시작 전 관련 RAG 파일을 로드하는 주제-RAG 매핑표입니다.
작업 중 변경사항은 해당 RAG 파일에 즉시 반영.

## 주제 -> RAG 매핑

| 주제 | RAG 파일 | 적용 시점 |
|---|---|---|
| CDP Pikaso/Freepik 조작 전반 | `.claude/memory/rag/cdp-pikaso/` 전체 | 이미지, 영상 생성 세션 시작 시 |
| 생성 원칙, 금지사항 | `.claude/memory/rag/cdp-pikaso/00-core-principles.md` | 매 CDP 세션 시작 시 (자동화 금지 등) |
| CDP 환경 설정 | `.claude/memory/rag/cdp-pikaso/01-environment.md` | 브라우저 연결 설정 시 |
| CDP 연결 | `.claude/memory/rag/cdp-pikaso/02-connection.md` | Puppeteer 연결 시 |
| Reference 관리 | `.claude/memory/rag/cdp-pikaso/howto-reference.md` | Reference 등록/멘션 작업 시 |
| Reference 셀렉터 | `.claude/memory/rag/cdp-pikaso/ref-selectors.md` | Reference DOM 조작 시 |
| Reference API | `.claude/memory/rag/cdp-pikaso/ref-api.md` | Reference 내부 API 호출 시 |
| Reference DOM 속성 | `.claude/memory/rag/cdp-pikaso/ref-dom-attributes.md` | ID 3체계 판별 시 |
| Reference 드롭다운 | `.claude/memory/rag/cdp-pikaso/ref-dropdowns.md` | 모델/해상도/비율 선택 시 |
| 이미지 생성 | `.claude/memory/rag/cdp-pikaso/howto-generate-image.md` | Start Image 생성 시 |
| 영상 생성 | `.claude/memory/rag/cdp-pikaso/howto-generate-video.md` | Kling 모션 생성 시 |
| 탭/페이지 네비게이션 | `.claude/memory/rag/cdp-pikaso/howto-navigate.md` | 이미지<->영상 탭 전환 시 |
| 다운로드 | `.claude/memory/rag/cdp-pikaso/howto-download.md` | 생성 결과물 저장 시 |
| 트러블슈팅 | `.claude/memory/rag/cdp-pikaso/troubleshoot.md` | 에러, 예상치 못한 동작 발생 시 |
| 프롬프트 원칙 | `.claude/memory/rag/cdp-pikaso/prompts.md` | 이미지/영상 프롬프트 작성 시 |
| CDP 치트시트 | `.claude/memory/rag/cdp-pikaso/CHEATSHEET.md` | 복붙 스니펫이 필요할 때 |
| 범용 RAG 인덱스 | `.claude/memory/rag/cdp-pikaso/README.md` | 전체 개요 확인 시 |

## 원칙

- 작업 시작 전 관련 주제의 RAG를 **먼저 읽고** 시작한다
- RAG의 원칙을 위반하지 않는다 (특히 `00-core-principles.md` "자동화 스크립트 금지")
- API/페이지/스키마 변경 발견 시 해당 RAG 파일을 **즉시 업데이트**한다
- 새 실수 패턴 발견 시 `troubleshoot.md`에 추가한다
