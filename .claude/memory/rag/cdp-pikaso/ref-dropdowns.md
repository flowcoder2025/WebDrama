# 드롭다운 옵션 전수

> **역할**: 해상도/비율/모델/폴더 드롭다운 옵션 + 선택 방법.
> **언제 읽나**: 드롭다운에서 특정 값 선택 시 / Normalize 루틴 구현 시.
> **관련 파일**: [`01-environment.md`](01-environment.md) (고정값 + Unlimited 조건), [`troubleshoot.md`](troubleshoot.md) (Normalize)
> **마지막 실측**: 2026-04-17

---

## 공통 드롭다운 패턴

모든 드롭다운 옵션은 **`[data-cy="popover-option"]`** 공통 data-cy. 구분은 `.textContent` 정규식:

```js
async function selectPopoverOption(pg, triggerDataCy, regex) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // 1. 트리거 클릭
  await (await pg.$(`[data-cy="${triggerDataCy}"]`)).click();
  await sleep(500);
  // 2. 매칭 옵션 클릭
  const pos = await pg.evaluate((rx) => {
    const opts = [...document.querySelectorAll('[data-cy="popover-option"]')]
      .filter(o => o.getBoundingClientRect().height > 0);
    const re = new RegExp(rx);
    const m = opts.find(o => re.test(o.textContent.trim()));
    if (!m) return null;
    const r = m.getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
  }, regex);
  if (pos) await pg.mouse.click(pos.x, pos.y);
  return !!pos;
}
```

**ESC 키로 닫힘** 확인 (비파괴 복구).

---

## 이미지 탭 — 해상도 드롭다운

트리거: `[data-cy="image-resolution-input"]`

| 옵션 텍스트 | 정규식 매칭 |
|-----------|------------|
| `1K~20s` | `/^1K/` |
| `2K~35s` | `/^2K/` ⭐ (기본) |
| `4K~1m 17s` | `/^4K/` |

**텍스트에 예상 생성 시간 포함** — 시간 변동해도 정규식은 접두어만 매칭.

---

## 이미지 탭 — 비율 드롭다운

트리거: `[data-cy="image-aspect-ratio-input"]`

| 옵션 텍스트 | 정규식 매칭 |
|-----------|------------|
| `autoAuto` | `/^auto/i` |
| `1:1 Square` | `/^1:1/` |
| `21:9 Ultrawide` | `/^21:9/` |
| `8:1 Panoramic` | `/^8:1/` |
| `4:1 Banner` | `/^4:1/` |
| `16:9 Widescreen` | `/^16:9/` ⭐ (영상용 고정) |
| `9:16 Social story` | `/^9:16/` |
| `1:4 Vertical banner` | `/^1:4/` |
| `1:8 Vertical panoramic` | `/^1:8/` |
| `4:3 Classic` | `/^4:3/` |
| `4:5 Social post` | `/^4:5/` |
| `5:4 Landscape` | `/^5:4/` |

**텍스트 = 비율 + 이름 합쳐짐** (예: `16:9Widescreen`). 정규식 접두어 안전.

---

## 영상 탭 — 해상도 드롭다운

트리거: `[data-cy="video-resolution-option"]`

| 옵션 텍스트 | 정규식 | 비고 |
|-----------|-------|------|
| `1080p` | `/^1080/` | **첫 번째 — 유료** ⚠ 실수 클릭 위험 |
| `720p` | `/^720/` | 두 번째 ⭐ Unlimited 대상 |

**안전 선택법**: 항상 `/^720/` 정규식으로.

### 이미지→비디오 전환 직후 1080 리셋
간헐적으로 Auto 모델 / Kling 3.0 고정 케이스도 발생. **`normalizeVideoTab()` 필수** — [`troubleshoot.md`](troubleshoot.md) 참조.

---

## 영상 탭 — 길이 드롭다운

트리거: `[data-cy="video-duration-option"]`

| 옵션 텍스트 | 정규식 |
|-----------|-------|
| `5"` | `/^5/` |
| `10"` | `/^10/` ⭐ |

**쌍따옴표(`"`) 포함** — 이스케이프 불필요 (정규식 접두어만 매칭).

---

## 영상 탭 — 비율 드롭다운

트리거: `[data-cy="video-aspect-ratio-option"]`

**Kling 2.5에서 `disabled=true`** — 16:9 자동 고정, 드롭다운 오픈 안 됨. 다른 모델(Kling 3.0 등) 선택 시에만 비율 변경 가능.

---

## 영상 탭 — 모델 선택 드롭다운

트리거: `[data-cy="video-model-selector-trigger"]`

Radix popper 패널 오픈. 옵션:

| 옵션 텍스트 | data-cy | 크레딧 |
|-----------|---------|--------|
| Auto | `ai-model-item-slim-auto-mode` | 100-2800 |
| Multiple | `ai-model-item-slim-multi-model` | 4개 조합 |
| All models | `ai-model-selector-show-all-button` | 목록 확장 |
| Seedance 2.0 | `ai-model-item-slim-bytedance-seedance-pro-2.0` | 550-6500 |
| Seedance 2.0 Fast | `ai-model-item-slim-bytedance-seedance-fast-2.0` | 450-5000 |
| Kling 3.0 Omni | `ai-model-item-slim-kling-omni3` | 210-1725 |
| **Kling 2.5** | **`ai-model-item-slim-kling-25`** | **Unlimited** ⭐ |
| Kling 3.0 | `ai-model-item-slim-kling-30` | 210-2400 |

**선택 시 data-cy 직접 사용**:
```js
await (await pg.$('[data-cy="video-model-selector-trigger"]')).click();
await sleep(800);
const pos = await pg.evaluate(() => {
  const el = document.querySelector('[data-cy="ai-model-item-slim-kling-25"]');
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
});
await pg.mouse.click(pos.x, pos.y);
```

**중복 감지 주의**: 모달 popper는 ancestor/descendant 둘 다 매칭될 수 있음. `data-cy` 직접 타겟팅이 안전.

---

## Add 모달 — 폴더 선택 드롭다운

트리거: `[data-cy="history-folder-selector-button"]`

| 옵션 텍스트 | data-cy |
|-----------|---------|
| Personal project | `history-folder-option-root` ⭐ (기본) |
| (사용자 폴더명 1) | `history-folder-option-{uuid}` |
| (사용자 폴더명 2) | `history-folder-option-{uuid}` |

실측 예시: "Personal project" / "주인공" / "하루" 폴더.

---

## 드롭다운 닫기

모든 드롭다운/팝오버는 **ESC 키**로 비파괴 닫힘 확인됨.

```js
await pg.keyboard.press('Escape');
await sleep(500);
```

---

## 드롭다운 선택 후 검증

```js
// 선택 후 현재값이 기대값 맞는지 확인
const cur = await pg.$eval('[data-cy="video-resolution-option"]', e => e.textContent.trim());
if (!/^720/.test(cur)) {
  // 실패 시 재시도 또는 로그
}
```
