# WebDrama PRD

## 프로젝트 개요
- **이름**: WebDrama
- **목표**: 프롬프트 하나로 웹드라마/애니메이션을 자동 제작하는 CLI 파이프라인
- **대상 사용자**: 1인 (본인)
- **성공 기준**: 프롬프트 입력 → 리서치 → 대본 → 에셋 → 검수 → 최종 영상 파일 자동 출력

## 기술 스택
- **언어**: TypeScript (Node.js CLI)
- **CDP**: Puppeteer — Freepik 웹 자동화 (이미지/영상 생성)
- **TTS**: Qwen3-TTS / GPT-SoVITS — 추상화 인터페이스, 테스트 후 확정
- **BGM**: ACE-Step 1.5XL — 로컬 GPU, REST API (localhost:8001)
- **영상 편집**: Remotion (@remotion/renderer) — React 기반 프로그래머틱 영상 합성
- **인코딩**: FFmpeg (Remotion 내부 사용)
- **기타**: edge-tts (fallback TTS)

## 팀 아키텍처 (FlowSet Agent Teams)

FlowSet의 기존 팀 시스템을 사용합니다:
- **리드(PM)**: `.claude/agents/lead-workflow.md` — 요구사항 분석, 팀 구성, 태스크 분배, evaluator 호출
- **팀원**: `.claude/agents/team-worker.md` — 역할별 구현, 소유 디렉토리만 수정
- **평가자**: `.claude/agents/evaluator.md` — 채점 기반 품질 검증

팀 역할/소유 매핑: `.claude/rules/team-roles.md`, `.flowset/ownership.json`

### 팀 구성

| TEAM_NAME | 역할 | 페르소나 | 소유 디렉토리 |
|-----------|------|---------|-------------|
| creative | 창작 | 10년차 웹드라마 작가 겸 연출가 | src/research/**, src/story/**, templates/** |
| execution | 실행 | 콘텐츠 제작 엔지니어 | src/asset/**, src/editor/**, projects/**/assets/**, projects/**/output/** |
| qa | QA | 테스트 작성/실행 | tests/** |
| devops | DevOps | CI/CD, 인프라 | .github/**, .claude/**, .flowset/** |
| planning | 기획 | PRD, 요구사항 | docs/** |

### Evaluator 커스터마이징 (이 프로젝트용)

#### Evaluator 채점 기준 (0~10점)

| 기준 | 평가 내용 | 비중 |
|------|----------|------|
| 스토리 구조 | 리서치 성공 패턴 반영, 후킹, 감정 아크 | 30% |
| 비주얼 일관성 | 장면 간 화풍/색감 통일, 명세서 충실도 | 25% |
| 음성 품질 | 캐릭터 음성 일관성, 감정 톤 적합성 | 20% |
| 편집 완성도 | 타이밍, 전환, BGM 싱크, 자막 정확성 | 25% |

#### Evaluator 판정

| 점수 | 판정 |
|------|------|
| 10점 | Pass → 사용자 리뷰 |
| 5~9.9점 | 피드백 + creative 팀 재작업 (최대 10회) |
| 5점 미만 | 전면 재생성 (처음부터 다시) |
| 10회 초과 | 현재 최고 점수 버전 + 피드백을 사용자에게 제시 → 직접 판단 |

### 에이전트 간 통신

- **통신**: FlowSet Agent Teams의 SendMessage 사용
- **데이터 경계**: production-spec.json, eval-report.json 등 JSON 파일이 팀 간 데이터 인터페이스
- 각 팀은 자기 소유 디렉토리 파일만 수정 가능 (ownership.json + PreToolUse hook 강제)
- production-spec.json은 creative 팀만 수정 가능
- execution 팀이 명세서에 없는 창작 판단을 하면 Evaluator가 감점

### production-spec.json 스키마

```json
{
  "metadata": {
    "title": "에피소드 제목",
    "genre": "romance",
    "format": "shorts|longform",
    "episodes": 1,
    "target_duration": 60
  },
  "characters": [
    {
      "id": "char_01",
      "name": "수아",
      "voice_profile": "female_young_soft",
      "voice_sample": "voices/samples/sua.wav"
    }
  ],
  "scenes": [
    {
      "id": "scene_01",
      "duration": 8,
      "description": "교실 창가, 석양",
      "image_prompt": "anime style, classroom window, sunset light...",
      "video_prompt": "slow zoom in, hair blowing in wind...",
      "dialogues": [
        {
          "character_id": "char_01",
          "text": "대사 내용",
          "emotion": "nostalgic"
        }
      ],
      "narration": null,
      "bgm": {
        "prompt": "soft piano, 80bpm, melancholic school life",
        "volume": 0.3,
        "fade_in": 2,
        "fade_out": 1
      },
      "transition": {
        "type": "crossfade",
        "duration": 1.5
      },
      "subtitle": true
    }
  ]
}
```

## 파이프라인 흐름

```
사용자 프롬프트
    ↓
[1] 리서치/분석 (창작 에이전트)
    ├─ 성공작 스토리/비주얼/후킹 패턴 추출
    └─ 트렌드 분석 + 채널 벤치마킹
    → research-report.json
    ↓
[2] 스토리/대본 (창작 에이전트)
    ├─ 리서치 기반 시나리오 생성
    ├─ 캐릭터 대사 + 나레이션
    ├─ 이미지/영상/음악 프롬프트 (2~3개 시안)
    └─ 편집 명세 (타이밍, 전환, BGM 진입점)
    → production-spec.json
    ↓
[3] 에셋 생성 (실행 에이전트)
    ├─ Freepik CDP 이미지 (Nano Banana Pro 2K)
    ├─ Freepik CDP 영상 (Kling 2.5 720p)
    ├─ TTS 음성 (Qwen3-TTS / GPT-SoVITS)
    └─ BGM (ACE-Step 1.5XL, 로컬 GPU)
    → assets/
    ↓
[4] 편집/합성 (실행 에이전트)
    └─ Remotion 타임라인 조립 + 자막 + 전환 + 렌더링
    → output/final.mp4
    ↓
[5] 검수 (Evaluator)
    ├─ 4대 기준 채점 (0~10점)
    ├─ 10점 → 사용자 리뷰
    ├─ 5~9.9점 → 피드백 + 재작업 (최대 10회)
    └─ 5점 미만 → 전면 재생성
    ↓
[6] 사용자 최종 확인
    └─ 확정 → 최종 파일 출력
```

## L1: 리서치/분석

### L2: 성공작 분석

#### L3: 스토리 패턴 추출
조회수 상위 웹드라마/애니메이션의 스토리 구조, 에피소드 길이, 전개 방식 분석

##### 태스크 (L4)
1. **YouTube 웹드라마 채널 수집기**
   - 장르별 인기 채널/영상 목록 자동 수집
   - 수용 기준: 장르별 상위 10개 채널, 채널당 상위 5개 영상 메타데이터 수집

2. **스토리 구조 분석기**
   - 수집된 영상의 댓글, 설명, 제목에서 스토리 패턴 추출
   - 수용 기준: 장르별 공통 구조 패턴 3개 이상 도출

#### L3: 비주얼 패턴 추출
화풍, 색감, 구도, 썸네일 스타일 분석

##### 태스크 (L4)
3. **비주얼 스타일 분석기**
   - 성공작 썸네일/장면의 색감, 구도, 화풍 패턴 분류
   - 수용 기준: 장르별 비주얼 가이드라인 JSON 생성

#### L3: 후킹 패턴 추출
첫 3초 구성, 클리프행어, 다음화 유도 방식 분석

##### 태스크 (L4)
4. **후킹 패턴 분석기**
   - 성공작의 오프닝 3초, 엔딩 클리프행어 패턴 분류
   - 수용 기준: 후킹 유형별 템플릿 생성

### L2: 트렌드 분석

#### L3: 인기 주제/키워드
현재 YouTube 트렌딩 주제 파악

##### 태스크 (L4)
5. **트렌드 키워드 수집기**
   - YouTube 트렌딩, 검색량 기반 인기 주제 추출
   - 수용 기준: 주제별 검색량 + 경쟁도 데이터 포함

#### L3: 타겟 채널 벤치마킹
경쟁 채널 분석

##### 태스크 (L4)
6. **채널 벤치마킹 리포터**
   - 타겟 채널의 업로드 주기, 평균 조회수, 구독자 대비 참여율 분석
   - 수용 기준: 벤치마킹 결과 JSON + research-report.json 통합

## L1: 스토리/대본

### L2: 시나리오 생성

#### L3: 리서치 기반 구조 설계
성공 패턴을 적용한 에피소드 구조 생성

##### 태스크 (L4)
7. **시나리오 생성 엔진**
   - research-report.json의 성공 패턴을 기반으로 에피소드 구조 자동 생성
   - 수용 기준: 장르/분위기/에피소드 수에 맞는 기승전결 구조 + 장면 목록

#### L3: 장면 분할 + 후킹 적용
에피소드를 장면(Scene)으로 분해, 후킹 패턴 적용

##### 태스크 (L4)
8. **장면 분할 + 후킹 주입기**
   - 에피소드를 개별 장면으로 분해, 첫 장면 후킹 + 엔딩 클리프행어 배치
   - 수용 기준: 장면별 배경/등장인물/���황 기술 완비, 후킹 패턴 포함

### L2: 대사/나레이션

#### L3: 캐릭터별 대사
장면별 캐릭터 대사 생성, TTS 캐릭터 ID 매핑

##### 태스크 (L4)
9. **대사 생성기**
   - 장면별 캐릭터 대사 + 감정 태그 + voice_profile 매핑
   - 수용 기준: 모든 대사에 character_id + emotion 필드 포함

#### L3: 나레이션 스크립트
장면 전환, 상황 설명 나레이터 텍스트

##### 태스크 (L4)
10. **나레이션 생성기**
    - 장면 전환부 나레이션 텍스트 생성
    - 수용 기준: 필요한 장면에 narration 필드 채워짐

### L2: 프롬프트 생성

#### L3: 다중 시안 생성
이미지/영상/음악 프롬프트 2~3개 버전 생성

##### 태스크 (L4)
11. **Freepik 이미지 프롬프트 빌더**
    - 장면별 배경/캐릭터 이미지 프롬프트 생성 (화풍, 구도, 표정, 조명)
    - 수용 기준: 장면당 2~3개 시안, Freepik Nano Banana Pro 최적화 프롬프트

12. **Freepik 영상 프롬프트 빌더**
    - 이미지 → 5초 영상 변환용 모션 프롬프트 (카메라 이동, 동작)
    - 수용 기준: Freepik Kling 2.5 최적화 프롬프트

13. **ACE-Step 음악 프롬프트 빌더**
    - 장면 분위기에 맞는 BGM 프롬프트 (장르, 템포, 악기, 분위기)
    - 수용 기준: ACE-Step 1.5XL 입력 형식 준수

14. **production-spec.json 조립기**
    - 위 모든 결과를 production-spec.json으로 통합
    - 수용 기준: 스키마 완전 준수, 모든 필수 필드 채워짐

## L1: 에셋 생성

### L2: 이미지 생성

#### L3: Freepik CDP 이미지
Nano Banana Pro 2K (2752x1536) 이미지 생성

##### 태스크 (L4)
15. **CDP 브라우저 매니저**
    - Chrome CDP 연결, 브라우저 세션 관리, 뷰포트 설정
    - 수용 기준: localhost:9222 연결 + 안정적 세션 유지

16. **Freepik 이미지 생성기**
    - production-spec의 image_prompt로 Freepik 이미지 자동 생성 + 다운로드
    - 수용 기준: 장면별 PNG 파일 assets/images/에 저장

#### L3: 캐릭터 일관성 관리
동일 캐릭터 외형 유지

##### 태스크 (L4)
17. **캐릭터 시드 관리자**
    - 캐릭터별 프롬프트 프리픽스 + 시드 관리로 일관된 외형 유지
    - 수용 기준: 동일 캐릭터의 장면 간 외형 편차 최소화

### L2: 영상 생성

#### L3: Freepik CDP 영상
Kling 2.5 720p (1284x716, 5초) 영상 생성

##### 태스크 (L4)
18. **Freepik 영상 생성기**
    - 생성된 이미지 + video_prompt로 5초 영상 클립 생성 + 다운로드
    - 수용 기준: 장면별 MP4 파일 assets/videos/에 저장

#### L3: 장면 모션 제어
카메라 이동, 캐릭터 동작

##### 태스크 (L4)
19. **모션 프롬프트 어댑터**
    - production-spec의 video_prompt를 Freepik Kling 형식에 맞게 변환
    - 수용 기준: Kling 2.5 최적화된 프롬프트 적용

## L1: 음성/음악

### L2: TTS 음성

#### L3: 캐릭터 음성 생성
production-spec의 character별 voice_profile로 대사 음성 생성

##### 태스크 (L4)
20. **TTS 엔진 추상화 인터페이스**
    - Qwen3-TTS / GPT-SoVITS 공통 인터페이스 정의
    - 수용 기준: generateVoice(text, profile, emotion) → WAV 파일

21. **Qwen3-TTS 클라이언트**
    - Qwen3-TTS REST API 연동 (localhost:8002)
    - 수용 기준: 캐릭터 음성 클로닝 + 대사 생성 + WAV 저장

22. **GPT-SoVITS 클라이언트**
    - GPT-SoVITS REST API 연동 (localhost:8003)
    - 수용 기준: 캐릭터 음성 클로닝 + 대사 생성 + WAV 저장

#### L3: 나레이션 생성
나레이터 전용 음성 처리

##### 태스크 (L4)
23. **나레이션 음성 생성기**
    - 나레이터 전용 voice_profile로 나레이션 음성 생성
    - 수용 기준: 장면별 나레이션 WAV 파일 assets/voices/에 저장

#### L3: 엔진 전환
설정 파일로 TTS 엔진 선택

##### 태스크 (L4)
24. **TTS 설정 관리자**
    - config/tts.json 기반 엔진 선택 + 엔드포인트 관리
    - 수용 기준: 설정 변경만으로 엔진 전환 가능

### L2: BGM/OST

#### L3: ACE-Step 1.5XL 생성
장면별 BGM 로컬 GPU 생성

##### 태스크 (L4)
25. **ACE-Step 클라이언트**
    - ACE-Step 1.5XL REST API 연동 (localhost:8001)
    - release_task → query_result → 오디오 다운로드
    - 수용 기준: 장면별 BGM WAV 파일 assets/bgm/에 저장

#### L3: 볼륨/페이드 제어
production-spec의 bgm 설정값 적용

##### 태스크 (L4)
26. **BGM 후처리기**
    - 볼륨 조절, fade_in/fade_out 적용
    - 수용 기준: production-spec의 bgm 설정값 정확히 반영

## L1: 편집/합성

### L2: Remotion 합성

#### L3: 타임라인 조립
production-spec 기반 장면 순서 배치

##### 태스크 (L4)
27. **Remotion 프로젝트 초기화**
    - Remotion 프로젝트 구조 + remotion.config.ts 설정
    - 수용 기준: npx remotion render 실행 가능

28. **Scene 컴포넌트**
    - 이미지/영상 + 음성 + BGM을 장면 단위로 합성하는 React 컴포넌트
    - 수용 기준: production-spec의 scene 1개를 완전히 렌더링

29. **Drama 컴포넌트 (루트)**
    - 전체 장면을 타임라인으로 조립하는 루트 컴포넌트
    - 수용 기준: production-spec의 모든 장면이 순서대로 연결

#### L3: 자막 렌더링
대사/나레이션 자막 오버레이

##### 태스크 (L4)
30. **Subtitle 컴포넌트**
    - 대사/나레이션 텍스트를 화면 하단에 자막으로 표시
    - 수용 기준: 음성 타이밍과 자막 싱크 일치

#### L3: 전환 효과
장면 간 트랜지션

##### 태스크 (L4)
31. **Transition 컴포넌트**
    - crossfade, cut 등 장면 전환 효과
    - 수용 기준: production-spec의 transition 설정값 정확히 반영

### L2: 출력

#### L3: Shorts 렌더링 (9:16)
YouTube Shorts 형식 출력

##### 태스크 (L4)
32. **Shorts 렌더러**
    - 1080x1920 (9:16), 60초 이내, H.264 MP4
    - 수용 기준: YouTube Shorts 업로드 가능한 포맷

#### L3: 롱폼 렌더링 (16:9)
일반 YouTube 영상 형식 출력

##### 태스크 (L4)
33. **롱폼 렌더러**
    - 1920x1080 (16:9), 자유 길이, H.264 MP4
    - 수용 기준: YouTube 일반 영상 업로드 가능한 포맷

## L1: 검수

### L2: Evaluator 자동 검증

#### L3: 4대 기준 채점
스토리 구조, 비주얼 일관성, 음성 품질, 편집 완성도

##### 태스크 (L4)
34. **Evaluator 채점 기준 설정**
    - templates/eval-criteria.json + 스프린트 계약에 프로젝트별 기준 반영
    - FlowSet evaluator 에이전트(.claude/agents/evaluator.md)가 채점 수행
    - 수용 기준: evaluator spawn 시 4대 기준으로 정확히 채점

#### L3: 재작업/재생성 판정
점수에 따른 판정 (FlowSet lead-workflow가 관리)

##### 태스크 (L4)
35. **재작업 흐름 검증**
    - lead-workflow가 10점=통과, 5~9.9=재작업(최대 10회), 5미만=전면재생성 흐름 정확히 수행
    - 수용 기준: 판정에 따라 팀원에게 정확한 지시 전달

### L2: 사용자 리뷰

#### L3: 최종 확인
Evaluator 통과 후 사용자에게 결과물 제시

##### 태스크 (L4)
36. **리뷰 프레젠터**
    - 최종 영상 + eval-report 요약을 사용자에게 제시
    - 수용 기준: 사용자가 확정/수정 요청 가능

#### L3: 수정 요청 반영
사용자 피드백 → 부분 재생성

##### 태스크 (L4)
37. **피드백 반영기**
    - 사용자 수정 요청을 창작 에이전트에 전달하여 부분 재작업
    - 수용 기준: 수정 요청 사항이 정확히 반영된 재출력

## 디렉토리 구조

```
WebDrama/
├── src/
│   ├── research/                 # creative 팀 - 리서치
│   │   ├── analyzer.ts
│   │   └── trend.ts
│   ├── story/                    # creative 팀 - 대본/프롬프트
│   │   ├── scenario.ts
│   │   ├── dialogue.ts
│   │   └── prompt-builder.ts
│   ├── asset/                    # execution 팀 - 에셋
│   │   ├── cdp/
│   │   │   ├── browser.ts
│   │   │   ├── image-gen.ts
│   │   │   └── video-gen.ts
│   │   ├── tts/
│   │   │   ├── engine.ts
│   │   │   ├── qwen3.ts
│   │   │   └── gpt-sovits.ts
│   │   └── bgm/
│   │       └── ace-step.ts
│   ├── editor/                   # execution 팀 - 편집
│   │   ├── compositions/
│   │   │   ├── Scene.tsx
│   │   │   ├── Subtitle.tsx
│   │   │   ├── Transition.tsx
│   │   │   └── Drama.tsx
│   │   └── renderer.ts
│   └── common/                   # 공유
│       ├── types.ts
│       ├── config.ts
│       └── logger.ts
├── projects/                     # 프로젝트별 콘텐츠 (gitignore)
│   └── {project-name}/
│       ├── research-report.json
│       ├── production-spec.json
│       ├── eval-report.json
│       ├── assets/
│       │   ├── images/
│       │   ├── videos/
│       │   ├── voices/
│       │   └── bgm/
│       └── output/
│           ├── final.mp4
│           └── thumbnail.png
├── voices/                       # 음성 프로필 (프로젝트 공통)
│   ├── profiles.json
│   └── samples/
├── config/                       # 설정
│   ├── default.json
│   ├── freepik.json
│   ├── tts.json
│   ├── bgm.json
│   └── remotion.json
├── templates/                    # 재사용 템플릿
│   ├── research-prompt.md
│   ├── story-prompt.md
│   └── eval-criteria.json
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## 에이전트별 소유 경계

| TEAM_NAME | 쓰기 가능 | 읽기 가능 |
|-----------|----------|----------|
| creative | src/research/**, src/story/**, templates/**, projects/*/production-spec.json, projects/*/research-report.json | config/, voices/profiles.json |
| execution | src/asset/**, src/editor/**, projects/*/assets/**, projects/*/output/** | projects/*/production-spec.json, config/, voices/ |
| qa | tests/** | projects/*/ 전체 (읽기 전용) |
| Evaluator (FlowSet 에이전트) | projects/*/eval-report.json | projects/*/ 전체 (읽기 전용) |

## 비기능 요구사항
- GPU VRAM 12GB+ (ACE-Step 1.5XL 실행)
- Chrome 설치 필수 (CDP 연결용, --remote-debugging-port=9222)
- FFmpeg 설치 필수 (Remotion 내부 사용)
- Node.js 20+ / TypeScript 5+
- 생성 에셋은 로컬 저장 (projects/ 디렉토리, gitignore)

## 외부 연동
- **Freepik**: CDP 웹 자동화 (이미지: Nano Banana Pro 2K, 영상: Kling 2.5 720p)
- **ACE-Step 1.5XL**: 로컬 GPU REST API (localhost:8001) — BGM 생성
- **Qwen3-TTS**: 로컬 GPU REST API (localhost:8002) — TTS 음성
- **GPT-SoVITS**: 로컬 GPU REST API (localhost:8003) — TTS 음성
- **YouTube**: 업로드는 수동 (자동화 범위 외)
