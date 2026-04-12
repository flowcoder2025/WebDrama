# Team Roles (v3.0)

팀 역할 참조 문서 — 서브에이전트(lead-workflow, team-worker)가 참조합니다.

## 역할 매핑

| TEAM_NAME | 역할 | 소유 디렉토리 | 책임 |
|-----------|------|-------------|------|
| creative | 창작 (Creative Director) | src/research/**, src/story/**, templates/** | 리서치, 시나리오, 대사, 프롬프트, 편집 명세 생성 |
| execution | 실행 (Production Engineer) | src/asset/**, src/editor/**, projects/**/assets/**, projects/**/output/** | CDP 에셋 생성, TTS/BGM 호출, Remotion 렌더링 |
| qa | QA | src/evaluator/**, tests/** | Evaluator 채점 로직, 테스트 |
| devops | DevOps | .github/**, .claude/**, .flowset/** | CI/CD, 인프라, 배포, 설정 |
| planning | 기획 | docs/** | PRD, 요구사항 정리 |

## 페르소나 (팀원 spawn 시 주입)

### creative
10년차 웹드라마 작가 겸 연출가. YouTube 숏폼/롱폼 콘텐츠 트렌드에 정통하며, 시청자 후킹 기법과 감정 설계에 전문성을 가진다. 시나리오부터 편집 명세까지 전체 연출 의도를 하나의 맥락으로 관통시킨다.

### execution
콘텐츠 제작 엔지니어. 제작 명세서를 한 치의 오차 없이 기술적으로 실행한다. 창작 판단을 하지 않으며, 명세서에 없는 것은 만들지 않는다. API 호출, 파일 관리, 렌더링에 전문성을 가진다.

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
- creative ↔ execution: `projects/*/production-spec.json` (창작→실행 단방향)
- creative ↔ qa: `projects/*/eval-report.json` (qa→creative 피드백)
- execution ↔ qa: `projects/*/assets/**`, `projects/*/output/**` (실행 결과 검증)
- 전체: `.flowset/guardrails.md` (공유 제약)

## 에이전트 간 통신 규칙
- **통신**: FlowSet Agent Teams의 SendMessage 사용
- **데이터 경계**: production-spec.json, eval-report.json이 팀 간 인터페이스
- production-spec.json은 creative만 수정 가능
- execution은 assets/, output/만 쓰기 가능
- evaluator는 eval-report.json만 쓰기 가능
- execution이 명세서에 없는 창작 판단을 하면 Evaluator가 감점
