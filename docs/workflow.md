# WebDrama 실전 워크플로우

작품별 세부는 `projects/{작품}/PROJECT.md` 참조. 본 문서는 **Cowork 프롬프트 + RAG CDP 절차**의 연결 체크리스트.

---

## 1. 작품 착수 절차

1. 상위 프로젝트(Cowork)에서 작품 산출물 freeze 확인
2. `projects/{작품}/PROJECT.md` 작성 (상위 SSOT 링크 + 원문 표)
3. `projects/{작품}/assets/*` 트리 생성
4. 기존 작업물이 있으면 `projects/{작품}_v<N>/`로 보존
5. 작품 `PROJECT.md §12` 8단계 작업 순서대로 진행

---

## 2. 컷 단위 실전 체크리스트 (Start Image)

### 2.1 예시: EP1 C05 (오피스 사무실 모니터, 체인 대상)

```
1. 프롬프트 추출
   - Cowork 프롬프트북 `나는괜찮아요_시즌1_프롬프트북_v3_EP1.md`에서 C05 섹션 열기
   - Start Image 8단계 프롬프트 (Step 0~7 + Tail negative) 복사

2. 체인 주입 확인 (PROJECT.md §6 매핑 표 참조)
   - EP1 C05는 체인 대상 → `office_anchor_ep1_c00` 앵커 참조
   - 주입 문구를 프롬프트 **최상단 라인**에 삽입:
     @img3 = office_anchor_ep1_c00 (sequence anchor). Props, wall details, ...

3. 브라우저 탭 준비 (RAG: howto-navigate.md)
   - CDP 연결 확인 (port 9222)
   - 이미지 탭 활성화

4. Reference 전체 삭제 (RAG: howto-reference.md)
   - 이전 세션 잔여 ref 완전 제거 (dangling 방지)

5. Reference 등록 (RAG: howto-reference.md, ref-api.md)
   - @img1: 배경 (loc_office_daytime) — prodId 방식
   - @img2: char_eunseo (prodId 방식)
   - @img3: office_anchor_ep1_c00 (prodId 방식, 앵커)
   * 등록 후 prodId·@imgN 매핑 재확인

6. 프롬프트 입력 (RAG: howto-reference.md "멘션 분산")
   - contenteditable 에디터에 전체 삭제 → 주입 문구 + 본문 타이핑
   - 멘션은 자연 분산 (첫 줄에 몰지 말 것)

7. 해상도·AI prompt 체크
   - 2K / 16:9 / AI prompt OFF (RAG: ref-dropdowns.md)

8. Generate (RAG: howto-generate-image.md)
   - 생성 35~50초

9. 결과 Compliance 확인
   - `prompt-lab/cut-intents.md` 또는 PROJECT.md §10 EP별 체크포인트 대조
   - 의상·액세서리(골드 체인)·배경·의도된 감정·팔레트 확인
   - 이미지 모호 시 단정 금지 (memory: 이미지 검증 모호 요소 추측 금지)

10. 실패 대응 (RAG: troubleshoot.md)
    - 캐릭터 얼굴 드리프트 → Reference Binding Clause 강화 → 재생성 (3회 상한)
    - 라이팅이 ref 톤으로 유출 → "lighting dictated by the scene, NOT the reference" 강조
    - 해상도 초기화 → normalizeVideoTab 패턴 적용

11. 다운로드 (RAG: howto-download.md)
    - Node https.get + `&preview=1` 제거 (71KB 썸네일 방지)
    - 저장: `projects/나는괜찮아요/assets/stills/ep1/ep1_c05_still_v1.png`

12. 재작업 카운트 기록
    - 통과: `projects/{작품}/.session/retry-count.json` 에 `{"ep1_c05": {"attempts": N, "final_version": 1}}` 기록
    - 재작업: attempts 증가, 최대 10회
    - 10회 초과 시 최고 점수 버전 + 피드백을 사용자에게 제시

13. Evaluator 채점 (선택)
    - 시퀀스 단위 또는 에피소드 단위로 일괄 호출 권장
    - 단일 컷 채점 시: `projects/{작품}/assets/_logs/eval-ep1-c05-v1.json` 저장
```

### 2.2 일반 (비체인) 컷
Step 2 생략, Step 5에서 `@img3` 앵커 등록 생략. 나머지 동일.

### 2.2-B 앵커 기반 컷 (예: EP1 C00, EP2 C01 등 — `PROJECT.md §12 Step 3` 9종)

시퀀스 시작 컷 = 앵커. **체인 주입 대상이 아님** (자신이 앵커이므로). 절차:

1. 2.1의 Step 1, 3~11 동일하게 Start Image 생성 (Step 2 체인 주입 생략)
2. 다운로드 (Step 11)
3. **2개 위치에 동일 이미지 저장**:
   - `assets/stills/ep<n>/ep<n>_c<nn>_still_v1.png` (본편 Start Image 용도)
   - `assets/anchors/<앵커ID>_v1.png` (예: `office_anchor_ep1_c00_v1.png`)
4. Freepik Reference 라이브러리에 **앵커 ID로 별도 업로드 등록** (이후 체인 대상 클립이 `@img3`/`@img4`로 참조할 수 있게)
5. 이후 체인 대상 클립은 2.1 Step 2에서 이 앵커 ID 주입

### 2.3 인서트 컷 (캐릭터 없음)
- Cowork 프롬프트북에 "@img2 없음" 명시된 경우
- Step 5에서 char ref 등록 생략, 배경·앵커만

---

## 3. 컷 단위 실전 체크리스트 (Kling 모션)

### 3.1 일반 클립
```
1. 영상 탭으로 전환 (RAG: howto-navigate.md)
2. normalizeVideoTab 실행 (RAG: troubleshoot.md P-2 / 1080p 크레딧 방지)
3. Start Image 업로드 (생성한 ep<n>_c<nn>_still_v<m>.png)
4. Kling 프롬프트 입력 (Cowork 프롬프트북 해당 클립 §Kling 섹션)
5. 설정: Kling 2.5 / 720p / 10초 / 16:9 / Unlimited
6. Generate (71초 평균)
7. 다운로드 → assets/motions/ep<n>/ep<n>_c<nn>_v<m>.mp4
```

### 3.2 프레임 체이닝 대상 (PROJECT.md §7 8쌍)

**기본 방식 (last→first seed)**:
- Kling UI의 "last frame seed" 옵션 사용 (지원 시)
- 이전 클립의 last frame을 다음 Start Image로 자동 사용

**Fallback (seed 거부 시, 공통원칙 §12-D)**:
```
1. 이전 클립 last frame 추출:
   ffmpeg -sseof -0.04 -i assets/motions/ep<n>/ep<n>_c<prev>_v1.mp4 \
     -frames:v 1 assets/motions/ep<n>/ep<n>_c<prev>_lastframe.png

2. 해당 last frame을 NanoBanana2에 Reference 업로드:
   - 이미지 탭 → Reference Upload → ep<n>_c<prev>_lastframe.png
   - 업로드된 prodId 기록

3. 다음 클립 Start Image 재생성:
   - 프롬프트 맨 앞에: @img2 The scene continues from the exact last frame of the previous clip.
   - 원본 Start Image 프롬프트 이어서

4. 재생성된 Start Image로 Kling 투입:
   - 파일명: ep<n>_c<next>_still_v<m>_chained.png

5. 2회 실패 시: 편집 단계에서 0.3s 블랙 컷 또는 인서트 샷 배치
```

### 3.3 립싱크 예외 3컷 (EP3 C10, EP4 C06, EP4 C10)

```
1. 일반 절차 (3.1)와 동일하게 Start Image 준비
2. Kling 프롬프트 말미에 Cowork 공통원칙 Part 11 phoneme 구문 추가:
   attempt subtle phoneme-matched lip movement for the line "[대사]",
   but if lip sync fails, keep mouth closed or slightly parted —
   the line will be layered as voice-over in post.
3. Generate 후 결과의 입 모양 확인:
   - phoneme 시도가 자연스러우면 Kling 립싱크 PASS
   - 부자연 시 1회 재시도
   - 재실패 시 VO fallback (립싱크 OFF 버전으로 재생성, 편집 단계에서 TTS 덮어쓰기)
4. 예외 3컷 외 나머지 63컷은 모두 VO (Kling 프롬프트에 "No lip-sync, no articulation of words" 네거티브)
```

---

## 4. TTS·BGM·Remotion (자동화 단계)

**현재 상태**: 미착수. Step 4·5 (이미지·영상) 66컷 전부 통과 + 사용자 승인 시 착수.

**착수 시점 복원**:
- `src/` 디렉토리 신규 구현 (TTS 엔진 추상화, BGM 클라이언트, Remotion 컴포넌트)
- `tsconfig.json`, `vitest.config.ts` 재생성
- `package.json` scripts 복원 (`eslint src/`, `tsc`, `vitest run`)

---

## 5. 튜닝 루프

### 5.1 기본 사이클
```
생성 → Compliance 체크 (2.1 Step 9) → Evaluator 채점 → 재작업 결정 → 프롬프트 diff → 재생성
```

### 5.2 Evaluator 호출 (서브에이전트 프로토콜 — `.claude/agents/evaluator.md`)

- **호출 대상**: 시퀀스 또는 에피소드 단위 (단일 컷도 가능)
- **평가 기준**: PROJECT.md §11 표 + 각 EP별 체크포인트 (§10)
- **결과 저장**: `projects/{작품}/assets/_logs/eval-{ep}-{cc}-v{n}.json`
- **재작업 카운트**: `projects/{작품}/.session/retry-count.json`

### 5.3 재작업 상한
- 컷당 최대 10회. 초과 시 **최고 점수 버전 + 피드백**을 사용자에게 제시 → 사용자 직접 판단

### 5.4 전면 재생성
- 5점 미만: 처음부터 (프롬프트·ref·접근 전면 재검토)

---

## 6. 세션 핸드오프

### 6.1 생성 조건
- 사용자가 세션 종료 전 명시 요청 시
- 대형 작업 중간 저장 필요 시

### 6.2 저장 위치·템플릿
- `projects/{작품}/.session/SESSION_HANDOFF_<YYYYMMDD>.md`
- 템플릿: `projects/{작품}/.session/TEMPLATE.md` 복사 후 작성

### 6.3 내용
- 현재 작업 단계 (클립 ID·단계)
- 브라우저 상태 (탭·모델·해상도)
- 마지막 성공한 컷
- 미결 의사결정
- 다음 세션 첫 30초 액션

---

## 7. RAG 연계 지도

| 수행 작업 | RAG 파일 |
|---|---|
| CDP 연결·환경 | `cdp-pikaso/01-environment.md`, `02-connection.md` |
| Reference 등록 | `howto-reference.md`, `ref-api.md`, `ref-dom-attributes.md` |
| 이미지 생성 | `howto-generate-image.md` |
| 영상 생성 + normalize | `howto-generate-video.md`, `troubleshoot.md P-2` |
| 탭 전환 | `howto-navigate.md` |
| 다운로드 | `howto-download.md` |
| 실패 대응 | `troubleshoot.md` |
| 자연어 프롬프트 원칙 | `prompts.md` |
| 복붙 스니펫 | `CHEATSHEET.md` |
