# CDP 운영 원칙

> **역할**: Freepik Pikaso CDP 자동화의 핵심 원칙 -- 동적 UI 대응.
> **언제 읽나**: 새 세션 시작 시 1회 / 자동화 스크립트 작성 전 체크.
> **관련 파일**: [`01-environment.md`](01-environment.md), [`02-connection.md`](02-connection.md), [`troubleshoot.md`](troubleshoot.md)
> **마지막 실측**: 2026-04-17

---

## 동적 UI 대응 11원칙

| # | 원칙 | 근거 |
|---|------|------|
| 1 | **좌표 캐시 금지. 매 액션 직전 `getBoundingClientRect()` 재측정** | Reference 등록/프롬프트 입력/모달 상태에 따라 레이아웃 이동 |
| 2 | **버튼 텍스트 매칭 금지. `data-cy` 속성만 사용** | 해상도/비율/모델 버튼 텍스트는 "현재 선택값"으로 변함 (예: "2K" -> "1K") |
| 3 | 드롭다운 열림/닫힘 판별은 `data-state="open"\|"closed"` | 텍스트보다 정확 |
| 4 | 모달 탐지는 `[class*="modal" i]` + visible 필터 | `role="dialog"` 요소는 invisible 빈 상자로 존재 |
| 5 | **`page.close()` / `disconnectBrowser()` 금지** | 사용자 실제 브라우저 파괴 방지 |
| 6 | `Page.setDownloadBehavior` 금지 | 브라우저 기본 다운로드 깨짐 |
| 7 | 브라우저 내 `fetch` / XHR 다운로드 금지 | CORS 차단 (`Failed to fetch pikaso.cdnpk.net`) -- Node `https.get()` 사용 |
| 8 | 매 액션 후 DOM 상태 명시 검증 | 성공/실패 확정 |
| 9 | 프롬프트 `@imgN` 멘션 <-> Reference 등록 쌍 관리 | dangling 시 Generate disabled |
| 10 | 스크립트 파일보다 **`node -e "..."` 직접 실행** 선호 | 상태별 즉시 조정, 휘발 방지 |
| 11 | **`contenteditable.textContent`에 placeholder 섞임 주의** | "AI prompt" 등 placeholder가 실제 입력 뒤에 붙어 읽힘 -- exact 매칭 불안정 |

## 파괴적 동작 사전 확인 프로토콜

Reference 등록/삭제, 해상도 변경, 프롬프트 수정 등 **상태 변경 전**:

1. 현재 상태 덤프 (원복 기준점)
2. 사용자 확인 필요한 조작인지 판단
3. 복구 방법 명시 (ESC / 역방향 선택 / 재입력)
4. 실행
5. 결과 검증 + 필요 시 복구

## Generate 직전 체크리스트

| 체크 | 의미 |
|------|------|
| `generate-button` 텍스트 = `"GenerateUnlimited"` | Unlimited 조건 충족 (Kling 2.5: 720+10"+16:9) |
| `disabled === false` | 프롬프트 있음 + Reference 멘션 유효 |
| Start Image (영상) 또는 프롬프트 (이미지) 존재 | 생성 재료 확보 |
| 이미지->비디오 전환 직후라면 **`normalizeVideoTab()` 실행 필수** | 1080 리셋 방지 |

## 멀티 세션 안전 원칙

다른 탭/창에서 동시 생성 시 오판 방지:
- **baseline prodId 비교 단독 사용 금지** (사용자가 병행 생성 시 최상단이 내 것 아닐 수 있음)
- **API 응답 가로채기로 `creation.id` 직접 확보**가 유일한 안전한 식별 방법
- 상세: [`ref-api.md`](ref-api.md) + [`howto-generate-image.md`](howto-generate-image.md)

## 세션 종료 시 원상 복구

- 작업 중 등록한 Reference 전부 삭제 ([`howto-reference.md`](howto-reference.md))
- 프롬프트 영역 클리어 권장 (혼란 방지)
- 영상 탭 설정: Kling 2.5 / 720 / 10" / 16:9 유지 (Normalize 실행 후 종료)
- 탭 개수: 이미지 탭 + 영상 탭 2개 유지 (에디터 탭 생겼으면 goBack 또는 URL 이동으로 정리)
