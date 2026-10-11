import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const p = await b.newContext().then((c) => c.newPage());
await p.goto("http://127.0.0.1:3001/onboarding/wizard", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const buttons = await p.$$eval("button", (els) =>
  els.map((b) => ({ text: b.textContent?.trim(), disabled: b.disabled })),
);
console.log(JSON.stringify(buttons, null, 2));
await b.close();
