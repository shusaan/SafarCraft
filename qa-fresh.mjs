/* eslint-disable */
// Comprehensive end-to-end QA script - fresh, with deeper checks
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3001";
const OUT_DIR = "/tmp/qa-shots";
const REPORT = [];

function logIssue(severity, area, message, detail = "") {
  const emoji = { critical: "[CRITICAL]", major: "[MAJOR]", minor: "[MINOR]", nit: "[NIT]", info: "[INFO]" }[severity] || "[?]";
  console.log(emoji + " [" + area + "] " + message + (detail ? "\n         -> " + detail : ""));
  REPORT.push({ severity, area, message, detail });
}

let SHOT_N = 1;
async function shot(page, name, opts = {}) {
  const n = String(SHOT_N++).padStart(3, "0");
  const file = OUT_DIR + "/" + n + "-" + name + ".png";
  try { await page.screenshot({ path: file, ...opts }); console.log("   [shot] " + file); }
  catch (e) { console.log("   [shot-fail] " + e.message); }
}

async function settle(page, ms = 400) { await page.waitForTimeout(ms); }

const issues = [];
function check(cond, severity, area, msg, detail = "") {
  if (!cond) { logIssue(severity, area, msg, detail); issues.push({ severity, area, msg }); }
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
  });

  const consoleErrors = [];
  context.on("pageerror", (err) => logIssue("major", "runtime", "Uncaught page error", err.message));
  context.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("google-analytics") || url.includes("favicon") || url.includes("chrome-extension") || url.includes("accounts.google.com")) return;
    logIssue("major", "network", "Request failed", req.method() + " " + url + " -> " + req.failure()?.errorText);
  });
  context.on("response", (resp) => {
    if (resp.status() >= 400 && !resp.url().includes("favicon") && !resp.url().includes("chrome-extension")) {
      if ((resp.url().endsWith("/api/parse-cv") || resp.url().endsWith("/api/resumes")) && resp.status() === 501) return;
      logIssue("major", "network", "HTTP " + resp.status(), resp.url());
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  /* ── 1. Home page ─────────────────────────────────────────────── */
  console.log("\n[1] HOMEPAGE /");
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await settle(page, 1000);
  await shot(page, "01-home");

  // Title & meta
  const title = await page.title();
  console.log("   title: " + title);
  check(title.toLowerCase().includes("careerforge"), "major", "seo", "Page title missing brand", title);

  // H1
  const h1 = await page.locator("h1").first().innerText().catch(() => "");
  console.log("   h1: " + h1.slice(0, 80) + "...");
  check(h1.length > 10, "major", "marketing", "Hero H1 missing or too short");

  // Hero CTA
  const cta = page.locator("a:has-text('Start building free')").first();
  check(await cta.isVisible().catch(() => false), "critical", "marketing", "Hero CTA missing");

  // GitHub link is hardcoded placeholder
  const ghLinks = await page.locator("a[href*='github.com/yourusername']").count();
  check(ghLinks === 0, "minor", "marketing", "GitHub link uses placeholder 'yourusername'", ghLinks + " occurrences");

  // Trust bar
  const trust = await page.locator("section[aria-label='Trust signals']").isVisible().catch(() => false);
  check(trust, "minor", "marketing", "Trust bar missing");

  // Footer
  check(await page.locator("footer").isVisible(), "minor", "marketing", "Footer missing");

  // Footer copyright year format
  const footerTxt = await page.locator("footer").innerText();
  check(!footerTxt.includes("2026CareerForge"), "nit", "marketing", "Footer copyright missing space", "Got: '2026CareerForge'");

  // Hero heading width (the headline takes 5+ lines on desktop - bad)
  const heroH1Box = await page.locator("h1#hero-heading").boundingBox().catch(() => null);
  if (heroH1Box) {
    console.log("   hero H1 box: " + heroH1Box.width + "x" + heroH1Box.height);
    // At 1440 viewport width, heading is too tall if it spans more than ~3 lines
    const lineHeight = heroH1Box.height / parseFloat(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("h1#hero-heading")).lineHeight)) || 1);
    console.log("   hero H1 approx lines: " + Math.round(lineHeight));
    if (heroH1Box.height > 380) logIssue("major", "ui", "Hero H1 too tall on desktop", heroH1Box.height + "px");
  }

  await shot(page, "02-home-full", { fullPage: true });

  /* ── 2. Navigate to builder ──────────────────────────────────── */
  console.log("\n[2] Navigate to /builder");
  await page.click("a:has-text('Start free')");
  await page.waitForURL(/\/builder/);
  await page.waitForLoadState("networkidle");
  await settle(page, 1800);
  await shot(page, "03-builder-fresh");

  // Sample loaded?
  const nameInput = page.locator("input#name");
  const initialName = await nameInput.inputValue().catch(() => "");
  check(!!initialName, "critical", "builder", "Sample resume did not auto-load");

  // Personal info fields
  const fields = {
    phone: page.locator("input#phone"),
    location: page.locator("input#location"),
    email: page.locator("input#email"),
    linkedin: page.locator("input#linkedin"),
    github: page.locator("input#github"),
    website: page.locator("input#website"),
    summary: page.locator("textarea#summary, [name='summary'], #summary"),
    title: page.locator("input#title, input#headline, [name='title'], [name='headline']"),
  };
  for (const [k, loc] of Object.entries(fields)) {
    const exists = await loc.count();
    if (k === "title") {
      check(exists > 0, "major", "editor", "Title/Headline field missing on Personal Info", "Most resumes use one");
    } else if (k === "summary") {
      check(exists > 0, "minor", "editor", "Summary field missing on Personal Info");
    } else {
      check(exists > 0, "major", "editor", `Personal Info field missing: ${k}`);
    }
  }

  /* ── 3. Section sidebar ──────────────────────────────────────── */
  console.log("\n[3] Section sidebar");
  const sections = ["Personal Info", "Experience", "Education", "Skills", "Certifications", "Projects", "Languages"];
  for (const s of sections) {
    // arialabel is either "X" or "X (completed)"
    const sel = `[role='button'][aria-label^='${s}']`;
    check(await page.locator(sel).first().isVisible({ timeout: 400 }).catch(() => false), "major", "sidebar", `Section button missing: ${s}`);
  }

  /* ── 4. Click Experience section ─────────────────────────────── */
  console.log("\n[4] Experience section");
  await page.locator("[role='button'][aria-label^='Experience']").first().click();
  await settle(page, 600);
  await shot(page, "04-experience");

  /* ── 5. Quick Actions panel ──────────────────────────────────── */
  console.log("\n[5] Quick Actions");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Quick Actions']").click();
  await settle(page, 500);
  await shot(page, "05-quick-actions");

  const tools = ["Verb Swap", "Bullet Rewrite", "Add Metric", "Achievements", "Grammar", "Summary", "Cover Letter", "Quality", "JD Tailor", "Snippets", "Insights"];
  const missing = [];
  for (const t of tools) {
    const ok = await page.locator(`button:has-text('${t}')`).first().isVisible({ timeout: 200 }).catch(() => false);
    if (!ok) missing.push(t);
  }
  check(missing.length === 0, "major", "qa-panel", `Quick Actions tools missing: ${missing.join(", ")}`);

  /* ── 6. ATS Panel ─────────────────────────────────────────────── */
  console.log("\n[6] ATS Panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='ATS']").click();
  await settle(page, 700);
  await shot(page, "06-ats");

  // README promises 5-axis breakdown (Content, Format, ATS, Brevity, Impact)
  const axes = ["Content", "Format", "Brevity", "Impact"];
  for (const a of axes) {
    const has = await page.locator(`text=${a}`).first().isVisible({ timeout: 200 }).catch(() => false);
    check(has, "major", "ats", `5-axis '${a}' breakdown missing — README promises it`);
  }

  // Missing keywords shown
  const mk = await page.locator("text=Missing Keywords").first().isVisible({ timeout: 300 }).catch(() => false);
  check(mk, "minor", "ats", "Missing Keywords section missing");

  /* ── 7. Templates ─────────────────────────────────────────────── */
  console.log("\n[7] Templates");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Templates']").click();
  await settle(page, 500);
  await shot(page, "07-templates");

  // Templates visually shown
  const tpls = ["Classic ATS", "Modern Professional", "Executive"];
  for (const t of tpls) {
    const ok = await page.locator(`text=${t}`).first().isVisible({ timeout: 200 }).catch(() => false);
    check(ok, "minor", "templates", `Template card missing: ${t}`);
  }

  /* ── 8. Export panel ──────────────────────────────────────────── */
  console.log("\n[8] Export");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Export']").click();
  await settle(page, 500);
  await shot(page, "08-export");

  // Expected export formats from README
  for (const fmt of ["PDF", "DOCX", "Markdown"]) {
    const ok = await page.locator(`text=${fmt}`).first().isVisible({ timeout: 200 }).catch(() => false);
    check(ok, "minor", "export", `${fmt} export option missing`);
  }

  // Trigger a PDF download
  const dlPromise = page.waitForEvent("download", { timeout: 4000 }).catch(() => null);
  await page.locator("button:has-text('Download'):right-of(:text('PDF'))").first().click().catch(() => {});
  const d = await dlPromise;
  check(!!d, "minor", "export", "PDF download did not trigger");

  /* ── 9. GitHub Intelligence ───────────────────────────────────── */
  console.log("\n[9] GitHub");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='GitHub']").click();
  await settle(page, 500);
  await shot(page, "09-github");
  check(await page.locator("text=GitHub Intelligence").first().isVisible({ timeout: 200 }).catch(() => false), "minor", "github", "Title missing");

  /* ── 10. JD Analyzer (deep check) ────────────────────────────── */
  console.log("\n[10] JD Analyzer");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='JD']").click();
  await settle(page, 500);
  await shot(page, "10-jd");

  const jdTextarea = page.locator("textarea").first();
  await jdTextarea.fill("Senior engineer. React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, Terraform, GraphQL, microservices.");
  await page.locator("button:has-text('Analyze Match')").first().click();
  await settle(page, 800);
  await shot(page, "11-jd-result");

  // Verify the bug: skills shown as "Detected" but includes missing ones
  const detectedSec = page.locator("text=Detected Skills");
  const hasDetected = await detectedSec.first().isVisible().catch(() => false);
  check(hasDetected, "minor", "jd", "Detected Skills section missing");

  // Now let's deeply check by clicking each tool in Quick Actions that goes to snippets etc
  /* ── 11. Snippets ─────────────────────────────────────────────── */
  console.log("\n[11] Snippets");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Quick Actions']").click();
  await settle(page, 400);
  await page.locator("button:has-text('Snippets')").first().click().catch(() => {});
  await settle(page, 600);
  await shot(page, "12-snippets");

  /* ── 12. Insights ─────────────────────────────────────────────── */
  console.log("\n[12] Insights");
  await page.locator("button:has-text('Insights')").first().click().catch(() => {});
  await settle(page, 600);
  await shot(page, "13-insights");

  /* ── 13. Portfolio ────────────────────────────────────────────── */
  console.log("\n[13] Portfolio");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Portfolio']").click();
  await settle(page, 600);
  await shot(page, "14-portfolio");

  /* ── 14. Compare (version comparison panel) ───────────────────── */
  console.log("\n[14] Compare");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Compare']").click();
  await settle(page, 400);
  await shot(page, "15-compare");
  // Without prior saved versions, this should tell the user
  const txt = await page.locator(":text('Save a version first')").first().isVisible({ timeout: 400 }).catch(() => false);
  check(txt, "minor", "compare", "Compare empty-state hint missing");

  /* ── 15. Version History dialog ──────────────────────────────── */
  console.log("\n[15] Version History");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Editor']").click();
  await settle(page, 200);
  await page.locator("button[aria-label='Version history']").click();
  await settle(page, 400);
  await shot(page, "16-version-history");
  await page.keyboard.press("Escape");

  /* ── 16. Manage Resumes ──────────────────────────────────────── */
  console.log("\n[16] Manage Resumes");
  await page.locator("button[aria-label='Manage resumes']").click();
  await settle(page, 500);
  await shot(page, "17-manage-resumes");
  // Bug check: empty list by default
  const noResumes = await page.locator(":text('No resumes yet')").first().isVisible({ timeout: 300 }).catch(() => false);
  const hasNewBtn = await page.locator("button:has-text('New')").first().isVisible({ timeout: 200 }).catch(() => false);
  // Either empty-state or list, but should be informative
  check(hasNewBtn, "minor", "resumes", "New resume button missing in Manage Resumes");

  // Check whether current resume is listed (BUG: resumes store is empty initially)
  const items = await page.locator("[role='button']").filter({ hasText: /untitled|sample|alex/i }).count();
  console.log("   resume items visible: " + items);
  check(items > 0, "major", "resumes", "Active sample resume not shown in Manage Resumes list", "resumes[] starts empty");

  await page.keyboard.press("Escape");

  /* ── 17. Shortcuts ? ──────────────────────────────────────────── */
  console.log("\n[17] Shortcuts help");
  await page.keyboard.press("?");
  await settle(page, 500);
  await shot(page, "18-shortcuts");
  const sh = await page.locator("[role='dialog']:has-text('Keyboard Shortcuts')").first().isVisible({ timeout: 400 }).catch(() => false);
  check(sh, "minor", "shortcuts", "Shortcuts dialog did not open with '?'");
  await page.keyboard.press("Escape");

  /* ── 18. Dark mode ────────────────────────────────────────────── */
  console.log("\n[18] Dark mode");
  await page.click("button[aria-label*='Switch to']");
  await settle(page, 600);
  await shot(page, "19-dark");
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  check(isDark, "minor", "theme", "Dark mode did not apply");
  // Check contrast: skill category labels should be readable in dark mode
  // (visual, see screenshots)
  await page.click("button[aria-label*='Switch to']");
  await settle(page, 400);

  /* ── 19. Undo / Redo ──────────────────────────────────────────── */
  console.log("\n[19] Undo/Redo");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Editor']").click();
  await settle(page, 200);
  await page.locator("[role='button'][aria-label^='Personal Info']").first().click().catch(() => {});
  await settle(page, 300);
  const before = await page.locator("input#name").inputValue();
  await page.locator("input#name").fill("Changed-" + Date.now());
  await settle(page, 200);
  await page.locator("button[aria-label='Undo']").click();
  await settle(page, 400);
  const after = await page.locator("input#name").inputValue();
  check(after === before, "major", "editor", "Undo did not revert the input", "before=" + before + ", after=" + after);

  /* ── 20. Toggle preview off ──────────────────────────────────── */
  console.log("\n[20] Preview toggle");
  await page.click("button[aria-label*='preview']").catch(() => {});
  await settle(page, 400);
  await shot(page, "20-preview-off");
  const stillVis = await page.locator("aside[aria-label='Resume preview']").isVisible({ timeout: 800 }).catch(() => false);
  check(!stillVis, "minor", "preview", "Preview did not hide after toggle");
  await page.click("button[aria-label*='preview']").catch(() => {});
  await settle(page, 300);

  /* ── 21. Responsive — Mobile 375 ─────────────────────────────── */
  console.log("\n[21] Responsive 375x812");
  await page.setViewportSize({ width: 375, height: 812 });
  await settle(page, 500);
  await shot(page, "21-mobile-builder");

  const burger = page.locator("button[aria-label='Toggle menu']");
  check(await burger.isVisible({ timeout: 500 }).catch(() => false), "critical", "responsive", "Hamburger missing on mobile");
  await burger.click().catch(() => {});
  await settle(page, 400);
  await shot(page, "22-mobile-menu");

  // On mobile, the Quick Setup overlay should not collide with Tip
  await page.click("button[aria-label='Close menu']").catch(() => {});
  await settle(page, 300);

  // Check that the editor is usable on mobile (sections sidebar hidden)
  const sideBarVisibleOnMobile = await page.locator("aside.w-52").first().isVisible({ timeout: 300 }).catch(() => false);
  check(!sideBarVisibleOnMobile, "minor", "responsive", "Section sidebar should be hidden on mobile");

  /* ── 22. Tablet 768 ───────────────────────────────────────────── */
  console.log("\n[22] Responsive 768x1024");
  await page.setViewportSize({ width: 768, height: 1024 });
  await settle(page, 500);
  await shot(page, "23-tablet");

  /* ── 23. Back to desktop & test Resume list create new ───────── */
  console.log("\n[23] Create a new resume");
  await page.setViewportSize({ width: 1440, height: 900 });
  await settle(page, 500);
  await page.locator("button[aria-label='Manage resumes']").click();
  await settle(page, 500);
  await shot(page, "24-manage-resumes-2");
  await page.locator("button:has-text('New')").first().click().catch(() => {});
  await settle(page, 400);
  await shot(page, "25-new-resume-dialog");
  await page.locator("button:has-text('Cancel')").first().click().catch(() => {});
  await page.keyboard.press("Escape");
  await settle(page, 300);

  /* ── 24. Accessibility scan on home ───────────────────────────── */
  console.log("\n[24] Accessibility");
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await settle(page, 500);
  await shot(page, "26-home-a11y");

  const a11y = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("img").forEach((img) => {
      if (!img.alt && !img.getAttribute("aria-hidden") && !img.closest("[aria-hidden='true']")) {
        out.push("img missing alt: " + (img.src || "").slice(0, 80));
      }
    });
    document.querySelectorAll("button, a").forEach((el) => {
      const txt = (el.innerText || "").trim();
      const aria = el.getAttribute("aria-label");
      const title = el.getAttribute("title");
      if (!txt && !aria && !title) {
        out.push("interactive missing accessible name: " + el.outerHTML.slice(0, 100));
      }
    });
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => +h.tagName.slice(1));
    if (!headings.includes(1)) out.push("page has no h1");
    return out;
  });
  if (a11y.length === 0) console.log("   [a11y] no obvious issues");
  else a11y.forEach((i) => logIssue("minor", "a11y", i));

  /* ── 25. PWA / manifest ──────────────────────────────────────── */
  console.log("\n[25] PWA / manifest");
  const manifest = await page.evaluate(async () => {
    try { const r = await fetch("/manifest.json"); return { status: r.status, ok: r.ok, body: await r.json() }; }
    catch { return { status: 0, ok: false }; }
  });
  console.log("   manifest status: " + manifest.status);
  check(manifest.ok, "minor", "pwa", "manifest.json missing or non-OK");

  // Check icons actually exist
  if (manifest.body && manifest.body.icons) {
    for (const icon of manifest.body.icons) {
      const r = await page.evaluate(async (src) => {
        try { const r = await fetch(src); return r.status; } catch { return 0; }
      }, icon.src);
      check(r === 200, "major", "pwa", `manifest icon 404: ${icon.src}`);
    }
  }

  // favicon
  const fav = await page.evaluate(async () => {
    try { const r = await fetch("/favicon.ico"); return r.status; } catch { return 0; }
  });
  check(fav === 200, "minor", "pwa", "favicon.ico missing");

  /* ── 26. Offline page ─────────────────────────────────────────── */
  console.log("\n[26] Offline page");
  await page.goto(BASE_URL + "/offline", { waitUntil: "networkidle" });
  await shot(page, "27-offline");
  const offTitle = await page.locator("h1").first().innerText().catch(() => "");
  console.log("   offline h1: " + offTitle);

  /* ── 27. Privacy page ─────────────────────────────────────────── */
  console.log("\n[27] Privacy page");
  await page.goto(BASE_URL + "/privacy", { waitUntil: "networkidle" });
  await shot(page, "28-privacy");

  /* ── 28. Login / Register pages ───────────────────────────────── */
  console.log("\n[28] Login & Register");
  await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
  await shot(page, "29-login");
  await page.goto(BASE_URL + "/register", { waitUntil: "networkidle" });
  await shot(page, "30-register");

  /* ── 29. Sitemap.xml ──────────────────────────────────────────── */
  console.log("\n[29] Sitemap");
  const sitemap = await page.evaluate(async () => {
    try { const r = await fetch("/sitemap.xml"); return { status: r.status, ok: r.ok }; }
    catch { return { status: 0, ok: false }; }
  });
  check(sitemap.ok, "minor", "seo", "sitemap.xml missing or non-OK");

  /* ── 30. robots.txt ───────────────────────────────────────────── */
  const robots = await page.evaluate(async () => {
    try { const r = await fetch("/robots.txt"); return { status: r.status, ok: r.ok }; }
    catch { return { status: 0, ok: false }; }
  });
  check(robots.ok, "minor", "seo", "robots.txt missing");

  /* ── Done ─────────────────────────────────────────────────────── */
  fs.writeFileSync("/tmp/qa-artifacts/report.json", JSON.stringify(REPORT, null, 2));
  console.log("\n========== SUMMARY ==========");
  const counts = { critical: 0, major: 0, minor: 0, nit: 0, info: 0 };
  REPORT.forEach((r) => counts[r.severity]++);
  Object.entries(counts).forEach(([k, v]) => console.log("  " + k + ": " + v));
  console.log("Total screenshots: " + (SHOT_N - 1));
  console.log("Report JSON: /tmp/qa-artifacts/report.json");
  console.log("consoleErrors captured: " + consoleErrors.length);

  await browser.close();
})().catch((e) => { console.error("FATAL: " + e.message); process.exit(1); });