# WebDrama 아키텍처

## 1. 계층 구조

```
[상위 프로젝트 Cowork] - 스토리, 시나리오, 프롬프트 (단일 진입점 HANDOFF)
 |
 v 작품별 SSOT 링크
[WebDrama] - 이미지, 영상, 음성, 편집 실행
 |
 +-- 수작업 레이어 (CDP) -> 이미지, 영상
 +-- 자동화 레이어 (스크립트) -> TTS, BGM, Remotion
```

## 2. 8단계 파이프라인

### Step 1 -- 캐릭터 레퍼런스 등록
- 캐릭터별 Freepik 라이브러리 등록 (작품마다 3~4종 수준)
- 의상 슬롯이 여러 개면 슬롯별 별도 ref (예: EP1용, EP4용)
- 출력: `assets/refs/char_<id>_<slot>_v<n>.png`

### Step 2 -- 마스터 로케이션 레퍼런스
- 작품의 로케이션 N종(예: 16종) 각각 생성, 등록
- 팔레트, 시간대, 계절을 로케이션마다 명시
- 출력: Freepik 라이브러리 `loc_<...>` ID

### Step 3 -- 앵커 컷 (시퀀스 체이닝)
- 같은 로케이션 연속 3컷 이상 시퀀스에서 첫 컷을 앵커로 등록
- 이후 체인 클립이 앵커를 ref로 참조해 소품, 조명, 벽 픽셀 수준 상속
- **앵커는 일반 Start Image보다 먼저 생성, 등록**
- 출력: `assets/anchors/<앵커ID>_v<n>.png`

### Step 4 -- Start Image 생성
- 클립마다 1장씩 (작품 총 N 클립 = N 장)
- 체인 대상 클립은 프롬프트 상단에 `[앵커 체인 주입]` 블록 삽입
- Kling Start Image 원칙: **최종 포즈** (시작 포즈 금지)
- 출력: `assets/stills/ep<n>/ep<n>_c<nn>_still_v<m>.png`

### Step 5 -- Kling 모션 클립
- 기본 10초, 필요 시 20초 (10s×2 병합)
- **프레임 체이닝**: 시퀀스 내 `last->first seed`로 연속성 확보
- **마이크로 체인지 원칙**: 10초 내 복합 동작 금지
- **립싱크**: 기본 OFF (`No lip-sync, no articulation`). 작품별 예외만 ON
- 출력: `assets/motions/ep<n>/ep<n>_c<nn>_v<m>.mp4`

### Step 6 -- TTS 음성
- 우선순위: Qwen3-TTS(localhost:8002) -> GPT-SoVITS(localhost:8003) -> edge-tts (fallback)
- 엔진 A/B 판정: 캐릭터별 대표 대사로 사전 확정
- 출력: `assets/vo/ep<n>/ep<n>_c<nn>_vo_<voice_id>_v<m>.wav`

### Step 7 -- BGM / SFX
- BGM: ACE-Step 1.5XL (localhost:8001), 작품별 테마 복수
- SFX: 라이브러리 또는 CC0 소스
- 출력: `assets/bgm/`, `assets/sfx/`

### Step 8 -- Remotion 합성 + FFmpeg
1. Kling 원본 MP4 import
2. 1차 LUT (작품별 팔레트 라이브러리)
3. 그레인, 비네팅
4. 자막 레이어 (font, 사이즈, 위치)
5. VO, BGM, SFX 믹스 (BGM duck -6dB 등)
6. 전환 (크로스 디졸브, 블랙 컷, 홀드)
7. FFmpeg h.264 crf 18 인코딩
8. 쇼츠 파생 + 썸네일
- 출력: `assets/final/`, `assets/shorts/`, `assets/thumbs/`

## 3. 저장소 표준

작품 디렉토리 = `projects/{작품}/`

```
projects/{작품}/
+--- PROJECT.md # 작품 메타 + 상위 SSOT 링크 + 원문 표
+--- assets/
| +--- refs/ # Step 1 산출
| +--- anchors/ # Step 3 산출
| +--- stills/{ep1,...}/ # Step 4 산출
| +--- motions/{ep1,...}/ # Step 5 산출
| +--- vo/{ep1,...}/ # Step 6 산출
| +--- bgm/ sfx/ # Step 7 산출
| +--- final/ shorts/ thumbs/ # Step 8 산출
+--- .session/ # 세션 핸드오프
```

## 4. 에이전트 역할

| 역할 | 책임 |
|---|---|
| 리드 (사용자 대화 세션) | 전체 실행, 단계별 판단, 수작업 CDP 조작 |
| Evaluator (`.claude/agents/evaluator.md`) | 결과물 채점, 재작업/재생성 판정 |
| Creative (옵션 서브에이전트) | 창작 판단 필요 시 소환 |

상호 통신: 파일 기반 (`PROJECT.md`, `eval-report.json` 등).

## 5. RAG 참조

작업 전 `.claude/rules/rag-context.md` 주제-RAG 매핑에 따라 관련 RAG 로드.
주요: `.claude/memory/rag/cdp-pikaso/` (CDP 조작 범용 지식).
