# CDP 연결 + 탭 관리

> **역할**: Puppeteer로 사용자 브라우저에 안전하게 붙는 방법 + 탭 찾기 + 복귀 패턴.
> **언제 읽나**: 자동화 스크립트 최초 작성 시 / 탭 상실 복구 시.
> **관련 파일**: [`00-core-principles.md`](00-core-principles.md) (page.close 금지 원칙), [`howto-navigate.md`](howto-navigate.md) (페이지 전환 시 탭 동작)
> **마지막 실측**: 2026-04-17

---

## CDP 연결 표준 패턴

```js
const puppeteer = require('puppeteer');
const browser = await puppeteer.connect({
 browserURL: 'http://localhost:9222',
 defaultViewport: null, // 필수. 미지정 시 puppeteer가 800x600 강제 (사용자 창 좁아짐)
 protocolTimeout: 30000 // 장시간 영상 생성 시 60000+로 늘리기
});
```

### 금기 (사용자 브라우저 파괴)
- `page.close()` -- 사용자 실제 탭 삭제
- `browser.disconnect()` 후 `browser.close()` -- 브라우저 종료
- `page.setViewport()` -- 사용자 창 크기 변경
- `Page.setDownloadBehavior` -- 다운로드 경로 변경 (일부 세션에서 브라우저 다운로드 깨짐)

### 권장 해제
```js
browser.disconnect(); // 연결만 해제, 브라우저 유지
```

## 탭 식별

```js
const pages = await browser.pages();

// URL 패턴으로 찾기
const ipg = pages.find(x => x.url().includes('ai-image-generator'));
const vpg = pages.find(x => x.url().includes('ai-video-generator'));
const epg = pages.find(x => x.url().includes('image-editor'));
```

### URL 패턴
| 페이지 | URL |
|--------|-----|
| 이미지 생성기 | `https://www.freepik.com/pikaso/ai-image-generator` |
| 영상 생성기 | `https://www.freepik.com/pikaso/ai-video-generator` |
| 이미지 에디터 | `https://www.freepik.com/pikaso/image-editor/{uuid1}/{uuid2}` |

## 탭 활성화

```js
await pg.bringToFront();
await sleep(400); // 탭 전환 안정화
```

## 실제 환경 파라미터 (2026-04-17 실측)

- Chrome 146.0.7680.180
- CDP 포트: 9222
- 실제 window 크기: 1920×1032 (사용자 전체화면)

## 연결 확인 헬스 체크

```bash
curl -s --max-time 3 http://localhost:9222/json/version
# 응답에 "Browser": "Chrome/..." 있으면 정상
curl -s --max-time 3 http://localhost:9222/json | head -20
# 열린 탭 목록 (type: "page")
```

## 탭 복구 패턴

### 이미지 탭이 에디터/영상 탭으로 navigate된 경우
에디터 / Create video 버튼 클릭 시 **같은 탭에서 URL 이동**. 복귀:
```js
try {
 await pg.goBack({ waitUntil: 'domcontentloaded', timeout: 8000 });
} catch (e) {
 await pg.goto('https://www.freepik.com/pikaso/ai-image-generator', { waitUntil: 'domcontentloaded' });
}
await sleep(1500);
```

상세: [`howto-navigate.md`](howto-navigate.md)

## 필수 sleep 타이밍 (실측)

| 액션 | 대기 (ms) |
|------|----------|
| bringToFront 후 | 300~500 |
| 모달 열기 | 2000 |
| 드롭다운 열기 | 500~700 |
| ESC 닫기 | 500~800 |
| 파일 업로드 처리 | 3500 |
| 이미지 생성 완료 | 5000씩 폴링 최대 90s |
| 영상 생성 완료 | 10000씩 폴링 최대 180s (expectedGenerationTime 기반) |
| 페이지 reload | 2000~2500 |
| 설정 변경 후 안정화 | 700 |
