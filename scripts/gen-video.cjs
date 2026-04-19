const p = require("puppeteer");
const fs = require("fs");
const cutId = process.argv[2]; // 형식: "ep1_c11" (EP번호_컷ID)
if (!cutId) { console.error("Usage: node gen-video.cjs <epN_cNN> (e.g., ep1_c11)"); process.exit(1); }
const epMatch = cutId.match(/^(ep\d+)_/);
if (!epMatch) { console.error("cutId는 ep<N>_c<NN> 형식 (예: ep1_c11)"); process.exit(1); }
const epDir = epMatch[1];
const imgPath = `C:/Team-jane/WebDrama/projects/나는괜찮아요/assets/stills/${epDir}/${cutId}_still_v1.png`;
const motionPath = `C:/Team-jane/WebDrama/projects/나는괜찮아요/.session/motion-${cutId}.txt`;
const outPath = `C:/Team-jane/WebDrama/projects/나는괜찮아요/assets/motions/${epDir}/${cutId}_v1.mp4`;

(async () => {
 const b = await p.connect({ browserURL: "http://localhost:9222", defaultViewport: null });
 const pg = (await b.pages()).find(x => x.url().includes("ai-video-generator"));
 if (!pg) throw new Error("video tab not found");

 // Start Image 교체 -- 기존 x 버튼 JS click으로 제거
 await pg.evaluate(() => {
 const card = document.querySelector('[data-cy="video-start-frame-input"]');
 const btn = [...card.querySelectorAll("button")].find(b => b.offsetWidth === 24 && b.offsetHeight === 24);
 if (btn) btn.click();
 });
 await new Promise(r => setTimeout(r, 1500));

 // Upload new start image (input 재등장 후)
 const input = await pg.$('[data-cy="video-start-frame-input"] input[type="file"]');
 if (!input) throw new Error("input 못 찾음");
 await input.uploadFile(imgPath);
 await new Promise(r => setTimeout(r, 4000));

 // Motion prompt 입력
 const ed = await pg.waitForSelector('[contenteditable]', { timeout: 5000 });
 await ed.focus(); await new Promise(r => setTimeout(r, 400));
 await pg.keyboard.down("Control"); await pg.keyboard.press("a"); await pg.keyboard.up("Control");
 await new Promise(r => setTimeout(r, 200));
 await pg.keyboard.press("Backspace");
 await new Promise(r => setTimeout(r, 300));
 const motion = fs.readFileSync(motionPath, "utf-8");
 await pg.keyboard.type(motion, { delay: 3 });
 await new Promise(r => setTimeout(r, 500));

 // 기존 갤러리 최신 비디오 URL 저장
 const prevUrl = await pg.evaluate(() => {
 const v = [...document.querySelectorAll("video")].find(v => v.offsetWidth > 100);
 return v?.src || v?.querySelector("source")?.src || "";
 });

 // Generate 클릭
 const genBtn = await pg.$('[data-cy="generate-button"]');
 await genBtn.click();
 console.log(`[${cutId}] Generate 클릭`);

 // 새 비디오 URL 등장 대기
 const start = Date.now();
 while (Date.now() - start < 300000) {
 await new Promise(r => setTimeout(r, 5000));
 const curUrl = await pg.evaluate(() => {
 const v = [...document.querySelectorAll("video")].find(v => v.offsetWidth > 100);
 return v?.src || v?.querySelector("source")?.src || "";
 });
 if (curUrl && curUrl !== prevUrl) {
 console.log(`[${cutId}] 생성 완료 ${Math.round((Date.now() - start) / 1000)}초`);
 break;
 }
 }
 await new Promise(r => setTimeout(r, 2000));

 // 다운로드
 const vidUrl = await pg.evaluate(() => {
 const v = [...document.querySelectorAll("video")].find(v => v.offsetWidth > 100);
 return v?.src || v?.querySelector("source")?.src;
 });
 if (!vidUrl) { console.error(`[${cutId}] 비디오 URL 없음`); b.disconnect(); process.exit(1); }
 const prodId = vidUrl.match(/production\/(\d+)\//)?.[1];
 const b64 = await pg.evaluate(async (u) => {
 return new Promise((res, rej) => {
 const x = new XMLHttpRequest(); x.open("GET", u, true); x.responseType = "arraybuffer";
 x.onload = () => { const a = new Uint8Array(x.response); let s = ""; for (let i = 0; i < a.length; i += 8192) { s += String.fromCharCode(...a.subarray(i, Math.min(i + 8192, a.length))); } res(btoa(s)); };
 x.onerror = () => rej(new Error("XHR"));
 x.send();
 });
 }, vidUrl);
 // 출력 디렉토리 보장
 const outDir = outPath.substring(0, outPath.lastIndexOf("/"));
 fs.mkdirSync(outDir, { recursive: true });
 fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
 const sz = fs.statSync(outPath).size;
 console.log(`[${cutId}] 저장 prod=${prodId} ${(sz / 1024 / 1024).toFixed(1)}MB`);
 b.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
