# Fix Plan (Work Items)

PRD에서 생성된 WI 체크리스트입니다.

## Work Items

### Batch 1: 프로젝트 기반 (순차)
- [x] WI-001-feat 프로젝트 초기화 및 의존성 설치 | L1:공통 > L2:설정 > L3:패키지
- [x] WI-002-feat 공유 타입 정의 (production-spec 스키마) | L1:공통 > L2:타입 > L3:인터페이스
- [ ] WI-003-feat 설정 로더 구현 | L1:공통 > L2:설정 > L3:config 로더

### Batch 2: 리서치/분석 (순차)
- [ ] WI-004-feat YouTube 웹드라마 채널 수집기 | L1:리서치 > L2:성공작 분석 > L3:스토리 패턴
- [ ] WI-005-feat 스토리 구조 분석기 | L1:리서치 > L2:성공작 분석 > L3:스토리 패턴
- [ ] WI-006-feat 비주얼 스타일 분석기 | L1:리서치 > L2:성공작 분석 > L3:비주얼 패턴
- [ ] WI-007-feat 후킹 패턴 분석기 | L1:리서치 > L2:성공작 분석 > L3:후킹 패턴
- [ ] WI-008-feat 트렌드 키워드 수집기 | L1:리서치 > L2:트렌드 분석 > L3:인기 주제
- [ ] WI-009-feat 채널 벤치마킹 리포터 | L1:리서치 > L2:트렌드 분석 > L3:채널 벤치마킹

### Batch 3: 스토리/대본 (순차)
- [ ] WI-010-feat 시나리오 생성 엔진 | L1:스토리 > L2:시나리오 > L3:리서치 기반 구조
- [ ] WI-011-feat 장면 분할 + 후킹 주입기 | L1:스토리 > L2:시나리오 > L3:장면 분할
- [ ] WI-012-feat 대사 생성기 | L1:스토리 > L2:대사 > L3:캐릭터별 대사
- [ ] WI-013-feat 나레이션 생성기 | L1:스토리 > L2:대사 > L3:나레이션
- [ ] WI-014-feat Freepik 이미지 프롬프트 빌더 | L1:스토리 > L2:프롬프트 > L3:다중 시안
- [ ] WI-015-feat Freepik 영상 프롬프트 빌더 | L1:스토리 > L2:프롬프트 > L3:다중 시안
- [ ] WI-016-feat ACE-Step 음악 프롬프트 빌더 | L1:스토리 > L2:프롬프트 > L3:다중 시안
- [ ] WI-017-feat production-spec.json 조립기 | L1:스토리 > L2:프롬프트 > L3:다중 시안

### Batch 4: 에셋 생성 — CDP (순차)
- [ ] WI-018-feat CDP 브라우저 매니저 | L1:에셋 > L2:이미지 > L3:Freepik CDP
- [ ] WI-019-feat Freepik 이미지 생성기 | L1:에셋 > L2:이미지 > L3:Freepik CDP
- [ ] WI-020-feat 캐릭터 시드 관리자 | L1:에셋 > L2:이미지 > L3:캐릭터 일관성
- [ ] WI-021-feat Freepik 영상 생성기 | L1:에셋 > L2:영상 > L3:Freepik CDP
- [ ] WI-022-feat 모션 프롬프트 어댑터 | L1:에셋 > L2:영상 > L3:모션 제어

### Batch 5: 음성/음악 (순차)
- [ ] WI-023-feat TTS 엔진 추상화 인터페이스 | L1:음성 > L2:TTS > L3:엔진 전환
- [ ] WI-024-feat Qwen3-TTS 클라이언트 | L1:음성 > L2:TTS > L3:캐릭터 음성
- [ ] WI-025-feat GPT-SoVITS 클라이언트 | L1:음성 > L2:TTS > L3:캐릭터 음성
- [ ] WI-026-feat 나레이션 음성 생성기 | L1:음성 > L2:TTS > L3:나레이션
- [ ] WI-027-feat TTS 설정 관리자 | L1:음성 > L2:TTS > L3:엔진 전환
- [ ] WI-028-feat ACE-Step 클라이언트 | L1:음성 > L2:BGM > L3:ACE-Step
- [ ] WI-029-feat BGM 후처리기 | L1:음성 > L2:BGM > L3:볼륨/페이드

### Batch 6: 편집/합성 — Remotion (순차)
- [ ] WI-030-feat Remotion 프로젝트 초기화 | L1:편집 > L2:Remotion > L3:타임라인
- [ ] WI-031-feat Scene 컴포넌트 | L1:편집 > L2:Remotion > L3:타임라인
- [ ] WI-032-feat Drama 컴포넌트 (루트) | L1:편집 > L2:Remotion > L3:타임라인
- [ ] WI-033-feat Subtitle 컴포넌트 | L1:편집 > L2:Remotion > L3:자막
- [ ] WI-034-feat Transition 컴포넌트 | L1:편집 > L2:Remotion > L3:전환 효과
- [ ] WI-035-feat Shorts 렌더러 | L1:편집 > L2:출력 > L3:Shorts
- [ ] WI-036-feat 롱폼 렌더러 | L1:편집 > L2:출력 > L3:롱폼

### Batch 7: 검수 + 통합 (순차)
- [ ] WI-037-feat Evaluator 채점 기준 설정 | L1:검수 > L2:Evaluator > L3:채점 기준
- [ ] WI-038-feat 재작업 흐름 검증 | L1:검수 > L2:Evaluator > L3:판정
- [ ] WI-039-feat 리뷰 프레젠터 | L1:검수 > L2:사용자 리뷰 > L3:최종 확인
- [ ] WI-040-feat 피드백 반영기 | L1:검수 > L2:사용자 리뷰 > L3:수정 반영
