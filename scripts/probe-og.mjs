import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const p = await b.newContext().then((c) => c.newPage());
p.on("console", (m) => console.log("console:", m.text().slice(0, 300)));
await p.goto("http://127.0.0.1:3001/opengraph-image?title=Hello&subtitle=World", { waitUntil: "load" });
await p.waitForTimeout(3000);
await b.close();
