const p = require("puppeteer");

async function main() {
  const b = await p.connect({ browserURL: "http://localhost:9222", defaultViewport: null });
  const pg = (await b.pages()).find(p => p.url().includes("ai-image-generator"));
  const ed = await pg.waitForSelector("[contenteditable]", { timeout: 5000 });
  await ed.click();
  await pg.keyboard.down("Control");
  await pg.keyboard.press("a");
  await pg.keyboard.up("Control");
  await pg.keyboard.press("Backspace");
  await new Promise(r => setTimeout(r, 300));

  const mentions = process.argv[2] ? process.argv[2].split(",") : [];
  for (const ref of mentions) {
    await pg.keyboard.type("@" + ref, { delay: 50 });
    await new Promise(r => setTimeout(r, 500));
    await pg.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 500));
    await pg.keyboard.type(" ");
  }

  const text = process.argv[3] || "";
  await pg.keyboard.type(text, { delay: 5 });

  const html = await pg.evaluate(() => document.querySelector("[contenteditable]").innerHTML);
  for (const ref of mentions) {
    console.log(ref + ":", html.includes('data-key="' + ref + '"'));
  }
  console.log("입력 완료");
  b.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
