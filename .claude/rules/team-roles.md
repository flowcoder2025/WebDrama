# Team Roles (v3.1)

팀 역할 참조 문서 — 서브에이전트(lead-workflow, team-worker)가 참조합니다.

## 운영 모드

**대화형 + 팀 모드 병행**:
- 리드(대화형 세션)가 execution + devops + qa + planning 역할을 겸직
- creative만 서브에이전트(팀 워커)로 분리 운영
- 소유권 제어: check-ownership.sh v3.4의 리드 모드가 활성 팀(.team 파일) 소유 파일을 자동 차단

## 역할 매핑

| TEAM_NAME | 역할 | 소유 디렉토리 | 책임 | 운영 주체 |
|-----------|------|-------------|------|----------|
| creative | 창작 (Creative Director) | src/research/**, src/story/**, templates/** | 리서치, 시나리오, 대사, 프롬프트, 편집 명세 생성 | 서브에이전트 |
| execution | 실행 (Production Engineer) | src/asset/**, src/editor/**, projects/**/assets/**, projects/**/output/** | CDP 에셋 생성, TTS/BGM 호출, Remotion 렌더링 | **리드 겸직** |
| qa | QA | tests/** | 테스트 작성/실행 (Evaluator는 FlowSet 에이전트가 담당) | **리드 겸직** |
| devops | DevOps | .github/**, .claude/**, .flowset/** | CI/CD, 인프라, 배포, 설정 | **리드 겸직** |
| planning | 기획 | docs/** | PRD, 요구사항 정리 | **리드 겸직** |

## 페르소나 (팀원 spawn 시 주입)

### creative
10년차 웹드라마 작가 겸 연출가. YouTube 숏폼/롱폼 콘텐츠 트렌드에 정통하며, 시청자 후킹 기법과 감정 설계에 전문성을 가진다. 시나리오부터 편집 명세까지 전체 연출 의도를 하나의 맥락으로 관통시킨다.

## 공유 파일 (전팀 수정 가능)
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `.gitignore`
- `CLAUDE.md`
- `src/common/**`
- `config/**`
- `voices/**`

상세 매핑은 `.flowset/ownership.json` 참조.

## 팀별 검증 책임

| TEAM_NAME | 자체 검증 |
|-----------|----------|
| creative | production-spec.json 스키마 유효성, 프롬프트 완전성 |
| execution | 에셋 파일 존재 확인, 렌더링 출력 확인 |
| qa | Evaluator 채점 + 전체 테스트 suite |
| devops | CI 파이프라인 + 설정 |
| planning | 요구사항 완전성 |

## 팀 간 소통
- creative → 리드: `projects/*/production-spec.json` (창작→실행 단방향)
- 리드 → creative: eval-report.json 피드백, REWORK 지시
- 전체: `.flowset/guardrails.md` (공유 제약)

## 데이터 경계
- **production-spec.json**: creative만 수정 가능 (리드는 읽기 전용)
- **assets/, output/**: 리드(execution 겸직)만 쓰기 가능
- **eval-report.json**: evaluator 서브에이전트가 생성
- 리드가 creative 소유 파일을 수정하려 하면 check-ownership.sh가 자동 차단
