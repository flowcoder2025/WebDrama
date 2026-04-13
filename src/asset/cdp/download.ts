import type { Page } from "puppeteer";

/**
 * XHR ArrayBuffer 다운로드 (CORS 우회)
 * Freepik CDN에서 이미지/영상을 브라우저 내부 XHR로 다운로드
 * 8KB 청크 분할로 메모리 오버플로우 방지
 */
export async function downloadViaXhr(page: Page, url: string): Promise<Buffer> {
  const base64 = await page.evaluate(async (downloadUrl: string) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", downloadUrl, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        const arr = new Uint8Array(xhr.response as ArrayBuffer);
        let binary = "";
        for (let i = 0; i < arr.length; i += 8192) {
          const chunk = arr.subarray(i, Math.min(i + 8192, arr.length));
          binary += String.fromCharCode(...chunk);
        }
        resolve(btoa(binary));
      };
      xhr.onerror = () => reject(new Error("XHR 다운로드 실패"));
      xhr.send();
    });
  }, url);

  return Buffer.from(base64, "base64");
}
