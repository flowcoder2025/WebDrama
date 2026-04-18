# 프롬프트 원칙 — NanoBanana2 (이미지) + Kling 2.5 (영상 모션)

> **역할**: 이미지/영상 프롬프트 작성 실측 원칙 — 두 모델 통합.
> **언제 읽나**: 프롬프트 작성 직전 (이미지용은 상단 파트, 모션용은 하단 파트).
> **관련 파일**: [`howto-generate-image.md`](howto-generate-image.md), [`howto-generate-video.md`](howto-generate-video.md)
> **마지막 실측**: 2026-04-17

---

# PART 1 — NanoBanana2 이미지 프롬프트

## 원칙 10가지

### 1. 자연어 문장형 서술 (키워드 나열 금지)
- ✅ "A Korean woman in her early 30s standing against a plain light gray studio background."
- ❌ "Korean woman, 30s, gray background, studio, portrait"

근거: Google Cloud 공식 권장. NanoBanana2는 자연어 맥락에서 더 일관된 결과.

### 2. Negative는 문장형으로 맨 뒤에
```
This is a real photograph only, not an illustration, not a painting, not anime, not 3D render.
No text, no watermark, no logo, no name tag.
```
- `negative:` 접두어 필드 사용 금지
- negative도 자연어 문장으로 구성

### 3. 소재/질감 구체화
- `merino-knit` / `pebbled-leather` / `brushed metal` / `sodium-vapor streetlight`
- 추상보다 구체 재질 지정이 결과 품질 향상

### 4. 핵심 지시 앞쪽 배치
모델이 앞쪽 토큰에 가중치 높게 줌. 중요한 주체/구도/분위기를 문장 시작에.

### 5. Reference 있을 때 전체 재묘사 금지
- ❌ 교실 전체를 다시 묘사 (1282자)
- ✅ "The exact same classroom as the reference. Only the lighting changes: golden hour sunset..."

**"keep identical" + 변경점만 짧게** 패턴.

### 6. 캐릭터 Reference 멘션 시 얼굴 + 핵심 의상 동시 언급

❌ "The same girl as the reference in her school uniform."
(교복만 언급 → 얼굴 변형됨)

❌ "The same girl as the reference, maintaining her exact facial features..."
(얼굴만 강조, 교복 생략 → 의상 변형됨)

✅ "The same woman as the reference, maintaining her exact facial features, face shape, hairstyle, and appearance, wearing her beige merino-knit top and charcoal wide-leg slacks."

**Reference가 의상을 100% 전달하지 않으므로 핵심 의상 키워드를 프롬프트에 반드시 포함**.

### 7. 인서트 컷 (사물/배경 단독)은 캐릭터 ref 없이 텍스트만
- 예: 모니터 화면 / 손 익스트림 CU / 부재중 알림 — 캐릭터 ref 붙이면 얼굴 침입 위험
- 안전한 인서트: 주체가 사물/화면일 때 `@img2` (character) 생략

### 8. 멘션은 문장 안에 분산 배치
- ❌ "@img1 @img2 @img3 The girl stands at the entrance, ..."
- ✅ "@img2 The girl stands at @img1 the entrance, and @img3 the boy approaches from behind."

### 9. AI가 자연 처리하는 효과는 프롬프트에서 빼기
- 유리 반사, 이중노출 같은 효과 상세 묘사 → 오히려 부자연 (샷시 반사, 과도한 겹침)
- 상황만 설정 ("유리 앞에 서서 바라봄") → AI가 자연광/반사 알아서 처리

### 10. 프롬프트 길이 ~2000자 이내 권장
- 너무 긴 프롬프트는 후반 토큰 가중치 하락
- 1000~1500자가 안정적

---

## Reference 활용 심화 패턴

### 시간대 변환 (같은 장소, 다른 조명)
```
@img1 The exact same classroom as the reference.
Only the lighting changes: golden hour sunset with deep orange light 
streaming through the windows, long shadows across the floor.
Fluorescent lights are off. No people.
```

### 앵글 변환 (같은 공간, 다른 카메라 위치)
- 마스터 ref 1장 → 그것을 Reference로 등록 → 파생 앵글 생성
- 프롬프트: "Same space as the reference, seen from {새 카메라 위치}"
- 캐릭터가 포함된 마스터를 Reference로 쓰면 그 얼굴이 새 캐릭터 Reference를 덮어쓸 수 있음 → **배경만 있는 마스터를 Reference로 쓰는 게 안전**

### 장면 생성 2단계 (구도 → 캐릭터)
1. 마스터 배경 Reference → **원하는 구도의 배경 먼저 뽑기** (캐릭터 없이)
2. 그 배경 + 캐릭터 Reference → 장면 생성

한 번에 다 넣으면 구도/캐릭터 모두 불안정.

### 이전 생성 결과를 Reference로 재활용
- 구도/위치가 좋지만 디테일이 틀린 이미지를 Reference로 등록 → 변경점만 수정
- 단, **캐릭터 포함된 장면 결과를 Reference로 쓰면 그 안의 얼굴이 캐릭터 Reference를 덮어쓸 위험**

---

## 캐릭터 시그니처 유지 (이 프로젝트 학습)

### 은서 (char_eunseo) 시그니처 악세사리
**썸네일 포인트 컷 (C07, C13 등 얼굴 CU)** 에는 반드시:
```
Her signature thin gold chain necklace with a small round pendant 
is visible at her neckline, catching the light.
```

### 금지 (레퍼런스에 없는 것)
- 팔찌, 귀걸이, 반지 추가 금지
- 의상 색상/재질 변경 금지 (회색 카디건 층 추가는 C08 한정 허용)

### 의상 색상 편차 방지
```
medium-dark charcoal gray wool slacks, not black, not light gray
```
범위 명시 = 편차 감소.

---

## 이미지 프롬프트 체크리스트

- [ ] 자연어 문장형?
- [ ] negative가 `"This is a real photograph only..."` 문장 형태?
- [ ] 소재/질감 구체적?
- [ ] Reference 있으면 "keep identical" + 변경점만?
- [ ] 캐릭터 ref 있으면 얼굴 + 의상 동시 언급?
- [ ] 인서트 컷이면 캐릭터 ref 없이 텍스트만?
- [ ] 멘션 분산 배치?
- [ ] 길이 2000자 이내?

---

# PART 2 — Kling 2.5 모션 프롬프트

## Kling 2.5 핵심 제약

- **Start Image만 참조** (End Frame 주입 불가)
- **5초 또는 10초** 길이만 가능
- **720p 고정** (우리 파이프라인)
- 생성 시간 ~71초 (API response의 `expectedGenerationTime` 필드)

---

## 원칙 8가지

### 1. Start Image = 최종 자세에 가까운 정적 상태
- 큰 동작(서→앉, 가방 이동, 공간 이동) 제어 불가 (Start Frame만 있고 End Frame 없음)
- Start Image가 **이미 최종 자세**여야 Kling이 미세 모션만 추가
- 예: "서있다가 앉는 영상" → Start Image를 **앉은 상태**로

### 2. 10초 이내 물리적 가능한 미세 변화만 서술
가능한 동작:
- 눈 깜빡임, 입술 미세 움직임, 머리 미약한 끄덕임
- 손가락 말림, 손 떨림, 어깨 미세 떨림
- 유리 빗방울 흐름, 커튼 미약한 흔들림
- 가로등 반사 움직임, 차 지나감 (foreground)
- 눈물 한 방울 흘러내림

불가능/주의:
- 서있다 앉기, 걷기 (큰 공간 이동)
- 물건 꺼내기/놓기 (복잡 동작)
- 표정 극적 변화 (무표정 → 웃음 → 울음)

### 3. 복합 액션 금지 — 한 번의 동작만
- ❌ "She stands up, walks to the window, and opens it."
- ✅ "She blinks slowly, then a single tear traces down her cheek."

### 4. 카메라 기본 static
- `Static camera` 또는 `static side-angle camera` 등 명시
- 무브가 필요할 때만: `slow push-in`, `subtle handheld micro-movement`

### 5. 실내/실외 물리 구분 엄격
- 비 오는 **실내**에서 가능: 빗방울 유리 흐름, 창밖 나무 흔들림, 캐릭터 미세 호흡, 바닥 반사 미세 변화
- 비 오는 **실내** 불가능: 머리카락 바람 날림, 꽃잎 실내 날림, 커튼 펄럭임

### 6. 같은 공간 연속 컷은 Start Image에서 자세 고정 + 카메라 프레이밍만 변경
이 프로젝트 C11~C14 설계 원칙:
- C11 (앉음, 측면 미디엄, 평온 통화) → 모션: 입술 미세 움직임, 왼손 가방 스트랩 꽉
- C12 (같은 앉은 자세, 손 인서트) → 모션: 손 떨림 점증
- C13 (같은 앉은 자세, 얼굴 3/4 CU) → 모션: 눈물 한 방울, 입술 떨림
- C14 (같은 앉은 자세, 풀백 와이드) → 모션: 어깨 미세 떨림, 차 헤드라이트 지나감

**자세는 Start Image에서 일관 유지 + 감정은 표정/손/어깨**로만 표현.

### 7. 립싱크 포기 — 대사는 나레이션/보이스오버
- Kling에서 한국어 대사 립싱크 불안정
- 캐릭터 대사는 **나레이션 방식** (영상에서는 입 움직임 없이 감정 표현만)
- K-드라마 웹드라마에서 더 자연스러움

### 8. 짧고 물리적으로 가능한 것만
- "Slow push in. Raindrops slide down the window glass. The girl breathes quietly."
- 한 문장 3개 정도면 충분. 너무 많은 지시는 모델 혼란.

---

## 모션 프롬프트 구조 예시

```
{카메라 지시}. {주 동작 1~2개}. {부가 환경 모션}. {조명/대기 유지}.
```

### 예 1: 통화 평온 (C11)
```
She holds the phone steady to her ear, listening. Her lips move with brief responses. 
The half-smile holds, polite. Her left hand on the tote strap tightens almost imperceptibly. 
Rain continues behind her. Static side-angle camera.
```

### 예 2: 눈물 CU (C13)
```
Her lower lip trembles. Her eyes blink slowly, releasing a single tear that traces down her cheek 
catching the amber light. She inhales sharply through parted lips, attempting to steady herself but failing. 
The phone pressed to her ear trembles slightly. Static close-up camera.
```

### 예 3: 풀백 와이드 (C14)
```
The woman in the distance stands still inside the shelter, shoulders slowly shaking. 
Heavy rain continues to fall, blurring her figure slightly through the glass. 
A car passes through the foreground (just headlights as streaks of light), briefly washing the frame in red taillight glow. 
Static wide camera.
```

---

## 자주 하는 실수

### Start Image 교체 확인
"Create video" 클릭 시 현재 열린 이미지가 자동 삽입됨. **구버전 이미지가 들어갈 수 있으니** 반드시 확인 후 생성.

### Start Image-길이 대응 확인
길이(5"/10")를 변경하면 Start Image 재검증이 필요해서 Generate가 일시 disabled 될 수 있음. 다른 설정 한 번 더 토글하면 해결.

### 모션이 너무 많으면 Kling이 복잡하게 채움
10초 duration을 채우려 Kling이 **모션을 과하게 자의 생성**. 해결:
- "minimal movement" 명시
- 여러 동작 나열하지 말고 1~2개만
- "She holds still while..." 형태로 정적 시간 확보

### 물리적 모순
- 닫힌 창 안에서 바람/꽃잎 날림 → 모델이 어설프게 만들거나 실패
- 실내/실외 명시, 물리 가능 동작만

---

## 모션 프롬프트 체크리스트

- [ ] Start Image가 "변화 직전" 또는 "최종 자세"인가?
- [ ] 10초 이내 가능한 미세 변화인가?
- [ ] 복합 액션 없이 단일 동작인가?
- [ ] 카메라 지시 명시? (기본 static)
- [ ] 실내/실외 물리 모순 없음?
- [ ] 대사가 있다면 입 움직임 없이 나레이션 처리?
- [ ] 짧은 문장 3개 이내?
