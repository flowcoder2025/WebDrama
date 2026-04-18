# WebDrama - Project Rules

이 파일은 글로벌 규칙(`~/.claude/rules/wi-*.md`)을 상속하며, 프로젝트 고유 규칙만 추가합니다.
**글로벌 규칙과 충돌 시 글로벌 규칙이 우선합니다.**

## 프로젝트 정보
- **이름**: WebDrama
- **타입**: TypeScript (Node.js CLI)
- **운영 모드**: 솔로 (FlowSet 루프·팀 기능 제거 상태)

## 작업 시작 전 체크리스트
- [ ] **관련 RAG 로드**: `.claude/rules/rag-context.md` 주제 매핑 확인
- [ ] **상위 프로젝트 참조**: `C:\Team-jane\Cowork\` 내 해당 작품 문서 확인 (스토리·프롬프트 SSOT)
- [ ] **작품 메타 확인**: `projects/{작품}/PROJECT.md` 읽기
- [ ] **경계 분리**: "이 작업의 경계는 무엇인가?" 정의
- [ ] **UTF-8**: 모든 파일 UTF-8 (BOM 없음)
- [ ] **실행 증거**: 추측·예상이 아닌 실제 실행 결과 기반 보고

## 작품 디렉토리 표준
```
projects/{작품}/
├── PROJECT.md                  # 메타 + Cowork SSOT 링크 + 원문 표
├── assets/
│   ├── refs/ anchors/
│   ├── stills/{ep1,ep2,...}/
│   ├── motions/{ep1,ep2,...}/
│   ├── vo/{ep1,ep2,...}/
│   ├── bgm/ sfx/ final/ shorts/ thumbs/
└── .session/                   # 세션 핸드오프 (선택, 요청 시 생성)
```

## 수작업 / 자동화 경계
- **CDP 이미지·영상 생성** = 수작업 (RAG `cdp-pikaso/00-core-principles.md` 원칙)
- **TTS·BGM·Remotion** = 자동화 (스크립트 착수 대기)
- **전환 조건**: 사용자 최종 판단

## 코드 품질
- **UTF-8** (BOM 없음), LF 줄바꿈
- **하드코딩 금지**: 상수는 `config/` 분리, 환경별은 환경변수
- **플레이스홀더·TODO·stub 금지**: 완전 구현만

## RAG 컨텍스트
- 작업 시작 전 `.claude/rules/rag-context.md` 매핑에 따라 관련 RAG 로드
- 작업 중 API·페이지·스키마 변경 발견 시 해당 RAG 파일 **즉시 업데이트**

## CI/CD
- PR 생성 시 자동 실행: lint → build → test → commit-check
- 현재 lint/build/test는 no-op (자동화 착수 시 복원)
- commit-check는 `WI-NNN-[type]` 형식 강제
