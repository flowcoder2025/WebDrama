# WebDrama

## 프로젝트 정보
- **이름**: WebDrama
- **타입**: TypeScript (Node.js CLI)
- **설명**: 프롬프트 기반 웹드라마/애니메이션 자동 제작 파이프라인
- **운영 모드**: 솔로 (리드 대화형 세션 중심 + evaluator 서브에이전트)

## 상위 프로젝트 연결
- **스토리, 시나리오, 프롬프트**: `C:\Team-jane\Cowork\` (별도 프로젝트)
- **WebDrama**: Cowork 산출물 수신 -> 이미지, 영상, 음성, 편집 실행

## 빌드/테스트
```bash
npm run lint # 현재 no-op (자동화 착수 시 eslint 복원)
npm run build # 현재 no-op (자동화 착수 시 tsc 복원)
npm test # 현재 no-op (자동화 착수 시 vitest 복원)
```

## 구조
```
PRD.md -> 범용 플랫폼 정의
CLAUDE.md -> 본 파일 (시스템 인지)
projects/{작품}/ -> 작품별 콘텐츠 (gitignore)
 +--- PROJECT.md -> 작품 메타 + Cowork SSOT 링크 + 원문 표
 +--- assets/{refs,anchors,stills,motions,vo,bgm,sfx,final,shorts,thumbs}/
docs/ -> 플랫폼 문서 (architecture/workflow/standards)
scripts/ -> 수작업 CDP 유틸
config/ -> 엔진 설정
voices/ -> 공통 음성 프로필
templates/ -> 평가 기준 템플릿
.claude/
 +--- agents/evaluator.md -> 품질 채점 서브에이전트
 +--- rules/ -> 규칙 (project.md, rag-context.md, wi-*.md)
 +--- memory/rag/cdp-pikaso/ -> 범용 CDP 지식 (RAG)
.flowset/
 +--- requirements.md -> 사용자 원본 요구사항 (수정 금지)
 +--- hooks/ -> commit-msg, pre-push
 +--- scripts/ -> Obsidian Vault 동기화 3개만 유지
.github/ -> CI/CD 워크플로우
```

## 파이프라인 (8단계)

Cowork 산출물 -> (1) 캐릭터 ref -> (2) 로케 ref -> (3) 앵커 컷 -> (4) Start Image -> (5) Kling 모션 -> (6) TTS -> (7) BGM/SFX -> (8) Remotion 합성.

상세: `docs/architecture.md`. 작품별 규약: `projects/{작품}/PROJECT.md`.

## 수작업 / 자동화 경계
- **CDP 이미지, 영상** = 현재 수작업 (cdp-pikaso RAG 원칙: 자동화 스크립트 금지)
- **TTS, BGM, Remotion** = 자동화 (스크립트 착수 대기)
- **수작업 -> 자동화 전환**: 사용자 최종 판단 시점에만

## 핵심 규칙 (반드시 숙지)
1. **requirements.md 수정 금지**: 사용자 원본. 변경 필요 시 사용자가 직접 수정.
2. **요구사항 충실 이행**: "나중에", "일단 빼고" 금지. 어려우면 확인.
3. **머지 확인 후 다음**: PR 머지 완료 -> `git pull` -> 다음 브랜치.
4. **코드 숙지 먼저**: 수정 전 관련 파일 전문 읽기. 추측 금지.
5. **영향도 평가**: 변경이 영향을 미치는 모든 파일 사전 파악.
6. **전수 조사**: 동일 패턴이 다른 곳에도 있는지 전수 검색.
7. **사이드이펙트 사전 분석**: 깨질 수 있는 기능 미리 식별.
8. **E2E = 브라우저 UI 조작**: `request.get/post`는 E2E가 아님.
9. **실행 증거 없이 "완료" 주장 금지**: 실제 테스트, 실행 결과 있어야 보고.
10. **인코딩 규약**: `docs/standards.md` 섹션 5 참조. ASCII 우선, 이모지 금지.

## 자동 강제 (hook)
- `commit-msg` hook: `WI-NNN-[type] 한글 작업명` 형식 강제 (예외: `WI-chore`, `WI-docs`)
- `pre-push` hook: main/master 직접 push 방지
- `SessionStart`/`Stop`/`PostCompact` hook: Obsidian Vault 동기화

## RAG 컨텍스트
작업 시작 전 `.claude/rules/rag-context.md`의 주제-파일 매핑 확인.

## 버전
- **v3.1 재정렬** (2026-04-19): Cowork v3.1 수용, FlowSet 루프, 팀 기능 제거, 작품 단위 구조(`projects/{작품}/`)로 일원화
