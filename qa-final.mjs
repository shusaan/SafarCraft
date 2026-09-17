/* eslint-disable */
// Final QA pass — responsive layouts + final inspection
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const OUT = "/tmp/qa-shots";
const REPORT = [];
function issue(s, a, m, d="") { REPORT.push({ s, a, m, d }); console.log("  " + ({critical:"🔴",major:"🟠",minor:"🟡",nit:"🔵",info:"ℹ️"}[s]||"•") + " [" + a + "] " + m + (d ? " → " + d : "")); }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" });

  // Capture network failures & 4xx/5xx
  ctx.on("response", async (r) => {
    const u = r.url();
    if (r.status() >= 400 && !u.includes("favicon") && !u.includes("chrome-extension") && !u.includes("google-analytics")) {
      if (!(u.endsWith("/api/parse-cv") || u.endsWith("/api/resumes") || u.includes("/api/resumes/"))) {
        issue("major", "net", r.status() + " " + u);
      }
    }
  });

  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);

  let n = 50;
  async function shot(name, full = false) {
    const file = OUT + "/" + String(n++).padStart(3, "0") + "-" + name + (full ? "-full" : "") + ".png";
    try { await page.screenshot({ path: file, fullPage: full }); console.log("  📸 " + file); }
    catch (e) { console.log("  ⚠ " + e.message); }
  }

  console.log("\n=== A) HOMEPAGE — visual check ===");
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot("home-final");

  // Check that 'yourusername' GitHub placeholder exists
  const placeholderLinks = await page.locator("a[href*='yourusername']").count();
  if (placeholderLinks > 0) issue("minor", "marketing", "GitHub URL is placeholder", "Found " + placeholderLinks + " links to yourusername");

  console.log("\n=== B) BUILDER — initial state ===");
  await page.click("a:has-text('Start free')");
  await page.waitForURL(/\/builder/);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await shot("builder-initial");

  // Check welcome overlay appears
  const welcome = await page.locator("[aria-label='Welcome guide']").isVisible({ timeout: 1000 }).catch(() => false);
  console.log("  welcome visible: " + welcome);
  const checklist = await page.locator("[aria-label='Onboarding checklist']").isVisible({ timeout: 1000 }).catch(() => false);
  console.log("  checklist visible: " + checklist);
  if (welcome && checklist) issue("major", "ux", "Welcome overlay AND onboarding checklist both visible — they overlap at fixed bottom-right");

  console.log("\n=== C) BUILDER — quick action: Verb Swap ===");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Quick Actions']").click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("qa-verbs");

  // Check the "Domain: Engineering" detection
  const domainDetected = await page.locator("text=Detected domain").first().isVisible({ timeout: 500 }).catch(() => false);
  if (!domainDetected) issue("minor", "qa", "Verb Swap doesn't show 'Detected domain' hint");

  console.log("\n=== D) BUILDER — Quality score ===");
  await page.locator("button:has-text('Quality')").first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("qa-quality");

  console.log("\n=== E) BUILDER — Insights dashboard ===");
  await page.locator("button:has-text('Insights')").first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("qa-insights", true);

  console.log("\n=== F) BUILDER — Snippets ===");
  await page.locator("button:has-text('Snippets')").first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("qa-snippets");

  // Add a snippet
  const snipTextarea = page.locator("textarea").first();
  if (await snipTextarea.isVisible({ timeout: 500 }).catch(() => false)) {
    await page.locator("input").first().fill("Achievement");
    await snipTextarea.fill("Shipped v2 to 100k users in 4 weeks.");
    await page.locator("button:has-text('Save'), button:has-text('Add')").first().click().catch(() => {});
    await page.waitForTimeout(400);
    await shot("qa-snippet-added");
  }

  console.log("\n=== G) BUILDER — JD Tailor ===");
  await page.locator("button:has-text('JD Tailor')").first().click().catch(() => {});
  await page.waitForTimeout(500);
  await shot("qa-jd-tailor");

  console.log("\n=== H) BUILDER — Cover Letter ===");
  await page.locator("button:has-text('Cover Letter')").first().click().catch(() => {});
  await page.waitForTimeout(500);
  await shot("qa-cover-letter");

  // Fill & generate
  const clInputs = page.locator("input").filter({ hasNotText: "" });
  const clInputsCount = await clInputs.count();
  if (clInputsCount > 0) {
    await page.locator("input[placeholder*='Senior']").first().fill("Senior Backend Engineer").catch(() => {});
    await page.locator("input[placeholder*='Acme']").first().fill("Acme Corp").catch(() => {});
    await page.locator("textarea").first().fill("Reduced p99 latency by 40%.\nShipped v2 to 1M users.\nMentored 3 junior engineers.").catch(() => {});
    await page.locator("button:has-text('Generate')").first().click().catch(() => {});
    await page.waitForTimeout(500);
    await shot("qa-cover-letter-result", true);
  }

  console.log("\n=== I) Resume raw text preview ===");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Editor']").click().catch(() => {});
  await page.waitForTimeout(400);
  // Click Raw in preview toolbar
  await page.locator("button:has-text('Raw')").first().click().catch(() => {});
  await page.waitForTimeout(500);
  await shot("preview-raw");

  console.log("\n=== J) Modern template rendering ===");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Templates']").click().catch(() => {});
  await page.waitForTimeout(700);
  // Click on "Modern Professional" card (it's a Card with onClick, not button)
  await page.locator("[class*='cursor-pointer']:has-text('Modern Professional')").first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("modern-template-applied");

  console.log("\n=== K) Mobile responsive — full flow ===");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await shot("mobile-final");

  // Try opening menu and ATS
  await page.locator("button[aria-label='Toggle menu']").click().catch(() => {});
  await page.waitForTimeout(400);
  await shot("mobile-menu");
  await page.locator("button:has-text('ATS')").first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot("mobile-ats");

  console.log("\n=== L) Tablet responsive ===");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await shot("tablet-final");

  console.log("\n=== M) /login form ===");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot("login-form");
  const loginForm = await page.locator("form").count();
  const loginInputs = await page.locator("input").count();
  console.log("  login form: " + loginForm + ", inputs: " + loginInputs);
  if (loginForm === 0) issue("major", "auth", "No login form on /login");

  console.log("\n=== N) /register form ===");
  await page.goto(BASE_URL + "/register", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot("register-form");
  const regForm = await page.locator("form").count();
  if (regForm === 0) issue("major", "auth", "No register form on /register");

  console.log("\n=== O) /privacy page ===");
  await page.goto(BASE_URL + "/privacy", { waitUntil: "networkidle" });
  await shot("privacy-full", true);

  console.log("\n=== P) /offline page ===");
  await page.goto(BASE_URL + "/offline", { waitUntil: "domcontentloaded" });
  await shot("offline-full");

  console.log("\n=== Q) Console errors ===");
  // Visit /builder again and capture console errors
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(BASE_URL + "/builder", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  // Switch panels quickly to trigger potential errors
  for (const p of ["ATS", "Quick Actions", "Templates", "Export"]) {
    await page.locator("nav[aria-label='Builder panels'] button[aria-label='" + p + "']").click().catch(() => {});
    await page.waitForTimeout(300);
  }
  if (errs.length > 0) {
    const unique = [...new Set(errs)];
    console.log("  captured " + unique.length + " unique console errors:");
    unique.slice(0, 10).forEach((e) => issue("info", "console", e.slice(0, 200)));
  }

  await browser.close();
  fs.writeFileSync("/tmp/qa-artifacts/report-final.json", JSON.stringify(REPORT, null, 2));
  console.log("\n" + REPORT.length + " issues captured");
})();
