# 환경 고정값

> **역할**: NanoBanana2 + Kling 2.5 파이프라인 고정 설정값 + Unlimited 조건 정의.
> **언제 읽나**: 세션 시작 / 설정 리셋 의심 시 검증용.
> **관련 파일**: [`ref-dropdowns.md`](ref-dropdowns.md) (값 선택 시 사용할 옵션), [`troubleshoot.md`](troubleshoot.md) (이미지→비디오 전환 후 리셋 대응)
> **마지막 실측**: 2026-04-17

---

## 고정 파이프라인 값

| 항목 | 값 | 변경 시 결과 |
|------|-----|------------|
| **이미지 모델** | Google Nano Banana 2 | - |
| **이미지 해상도** | 2K (2752×1536) | 1K/4K 변경 시 품질 변화 |
| **이미지 비율** | 16:9 (영상용) / 기타 (프로젝트 결정) | - |
| **AI prompt 토글** | **OFF** | ON 시 creative 프롬프트 임의 변형 |
| **영상 모델** | **Kling 2.5** | 다른 모델 = 유료 (크레딧 소모) |
| **영상 해상도** | **720** | 1080 = 유료 (약 650 크레딧) |
| **영상 길이** | 10" 또는 5" | Start Image가 대응 길이와 일치해야 Generate 활성 |
| **영상 비율** | **16:9 고정** (Kling 2.5에서 `disabled`) | - |
| **동시 생성** | 1장씩 | 결과 확인 후 다음 |

## Unlimited 조건 (Kling 2.5 기준)

**720 + 10" + 16:9** 조합만 `"GenerateUnlimited"` + enabled.

그 외 모든 조합은 **계정 차원에서 Generate `disabled`** 처리됨 → **우리 계정에선 유료 조합 차단**이라 실수로 크레딧 소모 거의 불가.

**단 하나의 예외 — 이미지→비디오 전환 직후**:
- 해상도가 1080p로 리셋되고 **Generate enabled 상태 유지**
- 사용자 보고: 간헐적으로 Auto 모델 / Kling 3.0 1080p 고정 케이스도 발생 (랜덤)
- → 반드시 `normalizeVideoTab()` 실행 ([`troubleshoot.md`](troubleshoot.md))

## Generate 버튼 텍스트 판독

| 텍스트 | 의미 |
|--------|------|
| `"GenerateUnlimited"` | Unlimited 조건 충족 (Kling 2.5 + 720 + 10" + 16:9). 무료. |
| `"Generate"` + 숫자 (예: `"Generate650"`) | 유료 조합. 숫자 = 소모 크레딧. **클릭 금지**. |
| `""` (빈 텍스트) | disabled=true. 프롬프트 없거나 조합 불가. |

## 모델 선택 ↔ 크레딧 비용 (영상)

| 모델 | data-cy | 크레딧 |
|------|---------|--------|
| Auto | `ai-model-item-slim-auto-mode` | 100-2800 |
| Multiple | `ai-model-item-slim-multi-model` | 4개 조합 |
| All models | `ai-model-selector-show-all-button` | 전체 목록 |
| Seedance 2.0 | `ai-model-item-slim-bytedance-seedance-pro-2.0` | 550-6500 |
| Seedance 2.0 Fast | `ai-model-item-slim-bytedance-seedance-fast-2.0` | 450-5000 |
| Kling 3.0 Omni | `ai-model-item-slim-kling-omni3` | 210-1725 |
| **Kling 2.5** | **`ai-model-item-slim-kling-25`** | **Unlimited (무료)** ← 고정 |
| Kling 3.0 | `ai-model-item-slim-kling-30` | 210-2400 |

## 파일 크기 / 생성 시간

자세한 실측 수치 및 다운로드 주의사항은 [`howto-download.md`](howto-download.md) SSOT 참조.

| 항목 | 요약 |
|------|------|
| 이미지 2K 원본 | ~7 MB (상세 표: howto-download.md) |
| 영상 720p 10s | ~12 MB |
| 이미지 생성 시간 | ~30-50초 |
| 영상 생성 시간 | `metadata.expectedGenerationTime` 필드 (실측 ~71초) |
