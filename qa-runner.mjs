/* eslint-disable */
// Comprehensive QA script — runs in real Chromium browser end-to-end
import { chromium } from "playwright";
import fs from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const OUT_DIR = "/tmp/qa-shots";
const REPORT = [];

function section(title) { console.log("\n" + "=".repeat(70) + "\n▶ " + title + "\n" + "=".repeat(70)); }
function info(title, detail = "") { console.log("   ℹ️  " + title + (detail ? "\n      " + detail : "")); }
function ok(title) { console.log("   ✓ " + title); }
function fail(title, detail = "") { console.log("   ✗ " + title + (detail ? "\n      " + detail : "")); }

function logIssue(severity, area, message, detail = "") {
  const emoji = { critical: "🔴", major: "🟠", minor: "🟡", nit: "🔵", info: "ℹ️" }[severity] || "•";
  console.log(emoji + "  [" + area + "] " + message + (detail ? "\n     → " + detail : ""));
  REPORT.push({ severity, area, message, detail });
}

let SHOT_N = 1;
async function shot(page, name, full = false) {
  const n = String(SHOT_N++).padStart(3, "0");
  const file = OUT_DIR + "/" + n + "-" + name + (full ? "-full" : "") + ".png";
  try { await page.screenshot({ path: file, fullPage: full }); console.log("   📸 " + file); }
  catch (e) { console.log("   ⚠ shot failed: " + e.message); }
}

async function settle(page, ms = 500) { await page.waitForTimeout(ms); }

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "en-US",
  });

  context.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      const text = msg.text();
      if (msg.type() === "error" && !text.includes("Failed to load resource") && !text.includes("favicon") && !text.includes("ERR_ABORTED")) {
        logIssue("info", "console", "JS error", text.slice(0, 280));
      }
    }
  });
  context.on("pageerror", (err) => logIssue("major", "runtime", "Uncaught page error", err.message));
  context.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("google-analytics") || url.includes("favicon") || url.includes("chrome-extension")) return;
    logIssue("major", "network", "Request failed", req.method() + " " + url + " → " + req.failure()?.errorText);
  });
  context.on("response", (resp) => {
    if (resp.status() >= 400 && !resp.url().includes("favicon") && !resp.url().includes("chrome-extension")) {
      // 501 for /api/parse-cv and /api/resumes is "expected" because backend is not configured
      if ((resp.url().endsWith("/api/parse-cv") || resp.url().endsWith("/api/resumes")) && resp.status() === 501) {
        logIssue("info", "api", "Optional API not configured (501)", resp.url());
      } else {
        logIssue("major", "network", "HTTP " + resp.status(), resp.url());
      }
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  /* ─────────────────────────────────────────── */
  section("1) HOMEPAGE /");
  const t0 = Date.now();
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  info("loaded in " + (Date.now() - t0) + "ms");
  await shot(page, "01-home");

  const title = await page.title();
  info("title: " + title);
  if (!title.toLowerCase().includes("careerforge")) logIssue("major", "seo", "Title missing brand", title);

  const heroH1 = await page.locator("h1").first().innerText().catch(() => "");
  info("H1: " + heroH1.replace(/\n/g, " ").slice(0, 140));

  // Hero CTA presence
  const ctaStart = page.locator("a:has-text('Start building free')").first();
  if (!(await ctaStart.isVisible())) logIssue("critical", "marketing", "Hero 'Start building free' CTA missing");

  const ctaGitHub = page.locator("a:has-text('View on GitHub')").first();
  if (!(await ctaGitHub.isVisible())) logIssue("minor", "marketing", "GitHub CTA missing on hero");
  const ghHref = await ctaGitHub.getAttribute("href").catch(() => "");
  if (ghHref && ghHref.includes("yourusername")) logIssue("minor", "marketing", "GitHub link is placeholder", ghHref);

  // Hero preview
  const previewBox = await page.locator("section img, section svg, section [role='img']").count();
  if (previewBox === 0) logIssue("minor", "marketing", "Hero preview graphic missing");

  // Trust bar
  const trustBar = await page.locator("section[aria-label='Trust signals']").isVisible().catch(() => false);
  if (!trustBar) logIssue("minor", "marketing", "Trust bar missing");

  // Footer
  if (!(await page.locator("footer").isVisible())) logIssue("minor", "marketing", "Footer missing");

  await shot(page, "02-home-full", true);

  /* ─────────────────────────────────────────── */
  section("2) Navigate to /builder");
  await page.click("a:has-text('Start free')");
  await page.waitForURL(/\/builder/);
  await page.waitForLoadState("networkidle");
  await settle(page, 1500); // wait for hydration
  await shot(page, "03-builder-fresh");

  const nameInput = page.locator("input#name");
  const sampleName = await nameInput.inputValue().catch(() => "");
  if (!sampleName) logIssue("critical", "builder", "Sample resume did not auto-load");
  else ok("Sample resume auto-loaded (" + sampleName + ")");

  // Onboarding checklist
  if (!(await page.locator("text=Quick Setup").isVisible({ timeout: 1500 }).catch(() => false))) {
    logIssue("minor", "onboarding", "Quick Setup checklist not visible");
  }

  /* ─────────────────────────────────────────── */
  section("3) EDITOR — Personal info");
  await nameInput.fill("");
  await nameInput.fill("Husnain Ali");
  await settle(page);
  // Phone, location etc.
  const phone = page.locator("input#phone");
  if (await phone.count() === 0) logIssue("major", "editor", "Phone input missing");
  const loc = page.locator("input#location");
  if (await loc.count() === 0) logIssue("major", "editor", "Location input missing");
  await shot(page, "04-personal-edited");

  // Check missing title/headline field on personal info
  const titleField = await page.locator("input#title, input#headline, input[name='title']").count();
  if (titleField === 0) logIssue("major", "editor", "No Title/Headline input on personal info — typical resumes have one");

  /* ─────────────────────────────────────────── */
  section("4) EXPERIENCE section");
  // Use sidebar button
  const expBtn = page.locator("nav[aria-label='Mobile navigation menu'], nav[aria-label='Builder panels']").first();
  // Click sidebar item (it's the section sidebar)
  await page.click("button[aria-label='Experience']").catch(async () => {
    await page.locator("aside button, nav button:has-text('Experience')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "05-experience");

  /* ─────────────────────────────────────────── */
  section("5) EDUCATION section");
  await page.click("button[aria-label='Education']").catch(async () => {
    await page.locator("button:has-text('Education')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "06-education");

  /* ─────────────────────────────────────────── */
  section("6) SKILLS section");
  await page.click("button[aria-label='Skills']").catch(async () => {
    await page.locator("button:has-text('Skills')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "07-skills");

  /* ─────────────────────────────────────────── */
  section("7) PROJECTS section");
  await page.click("button[aria-label='Projects']").catch(async () => {
    await page.locator("button:has-text('Projects')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "08-projects");

  /* ─────────────────────────────────────────── */
  section("8) CERTIFICATIONS section");
  await page.click("button[aria-label='Certifications']").catch(async () => {
    await page.locator("button:has-text('Certifications')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "09-certifications");

  /* ─────────────────────────────────────────── */
  section("9) LANGUAGES section");
  await page.click("button[aria-label='Languages']").catch(async () => {
    await page.locator("button:has-text('Languages')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "10-languages");

  /* ─────────────────────────────────────────── */
  section("10) ATS Panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='ATS']").click().catch(async () => {
    await page.locator("button:has-text('ATS')").first().click().catch(() => {});
  });
  await settle(page, 1000);
  await shot(page, "11-ats");

  // Look for the 5-axis scoring
  const axes = ["Content", "Format", "ATS", "Brevity", "Impact"];
  const axesFound = await page.locator(":text('Content')").count();
  if (axesFound === 0) logIssue("major", "ats", "5-axis breakdown missing");

  // Look for deductions / recommendations
  if (!(await page.locator(":text('Suggestions')").first().isVisible({ timeout: 500 }).catch(() => false))) {
    logIssue("minor", "ats", "No suggestions section visible");
  }
  if (!(await page.locator(":text('Missing Keywords')").first().isVisible({ timeout: 500 }).catch(() => false))) {
    logIssue("minor", "ats", "No missing keywords section visible");
  }

  await shot(page, "12-ats-full", true);

  /* ─────────────────────────────────────────── */
  section("11) Templates panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Templates']").click().catch(async () => {
    await page.locator("button:has-text('Templates')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "13-templates");

  // Try switching to Modern
  const modern = page.locator("button:has-text('Modern Professional')").first();
  if (await modern.isVisible({ timeout: 1500 }).catch(() => false)) {
    await modern.click();
    await settle(page, 600);
    await shot(page, "14-template-modern");
  } else logIssue("major", "templates", "Modern Professional not selectable");

  // Try Executive
  const exec = page.locator("button:has-text('Executive')").first();
  if (await exec.isVisible({ timeout: 500 }).catch(() => false)) {
    await exec.click();
    await settle(page, 600);
    await shot(page, "15-template-executive");
  }

  // Back to classic
  await page.locator("button:has-text('Classic ATS')").first().click().catch(() => {});
  await settle(page, 400);

  /* ─────────────────────────────────────────── */
  section("12) Export panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Export']").click().catch(async () => {
    await page.locator("button:has-text('Export')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "16-export");

  // Try clicking PDF download
  const pdfDownload = page.locator("button:has-text('Download'):right-of(:text('PDF'))").first();
  if (await pdfDownload.isVisible({ timeout: 500 }).catch(() => false)) {
    const dl = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
    await pdfDownload.click().catch(() => {});
    const d = await dl;
    if (d) ok("PDF download triggered: " + d.suggestedFilename());
    else info("PDF click registered but no download event captured");
  } else {
    logIssue("minor", "export", "PDF Download button not found near 'PDF' label");
  }

  /* ─────────────────────────────────────────── */
  section("13) Quick Actions panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Quick Actions']").click().catch(async () => {
    await page.locator("button:has-text('Quick Actions')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "17-quick-actions");

  // Try each Quick Action tool
  const qaTools = ["Verb Swap", "Bullet Rewrite", "Add Metric", "Achievements", "Grammar", "Summary", "Cover Letter", "Quality", "JD Tailor", "Snippets", "Insights"];
  for (const t of qaTools) {
    const btn = page.locator("button:has-text('" + t + "')").first();
    if (await btn.isVisible({ timeout: 300 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await settle(page, 250);
    }
  }
  await shot(page, "18-qa-insights", true);

  /* ─────────────────────────────────────────── */
  section("14) GitHub panel");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='GitHub']").click().catch(async () => {
    await page.locator("button:has-text('GitHub')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "19-github");

  // Try a public user
  const ghInput = page.locator("input[placeholder*='GitHub'], input[placeholder*='username']").first();
  if (await ghInput.isVisible({ timeout: 500 }).catch(() => false)) {
    await ghInput.fill("torvalds");
    await settle(page, 200);
    await shot(page, "20-github-typed");
    const importBtn = page.locator("button:has-text('Import')").first();
    if (await importBtn.isEnabled({ timeout: 200 }).catch(() => false)) {
      const dl = page.waitForEvent("response", { timeout: 6000 }).catch(() => null);
      await importBtn.click().catch(() => {});
      const resp = await dl;
      if (resp) info("GitHub import response: " + resp.status() + " " + resp.url().slice(0, 100));
      else info("GitHub import clicked; no response captured");
      await settle(page, 500);
      await shot(page, "21-github-result");
    }
  }

  /* ─────────────────────────────────────────── */
  section("15) JD Analyzer");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='JD']").click().catch(async () => {
    await page.locator("button:has-text('JD')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "22-jd");

  const jdTextarea = page.locator("textarea").first();
  if (await jdTextarea.isVisible({ timeout: 500 }).catch(() => false)) {
    await jdTextarea.fill(
      "Senior Software Engineer — You will design, build, and operate distributed systems in React, " +
      "TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes. 5+ years experience required. CI/CD, " +
      "Terraform, GraphQL, microservices architecture."
    );
    await page.locator("button:has-text('Analyze Match')").first().click().catch(() => {});
    await settle(page, 500);
    await shot(page, "23-jd-result");
  }

  /* ─────────────────────────────────────────── */
  section("16) Portfolio");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Portfolio']").click().catch(async () => {
    await page.locator("button:has-text('Portfolio')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "24-portfolio");

  // Switch to GitHub README
  await page.locator("button:has-text('GitHub README')").first().click().catch(() => {});
  await settle(page, 400);
  await shot(page, "25-portfolio-readme");

  // Short bio
  await page.locator("button:has-text('Short Bio')").first().click().catch(() => {});
  await settle(page, 400);
  await shot(page, "26-portfolio-bio");

  // Landing page
  await page.locator("button:has-text('Landing Page')").first().click().catch(() => {});
  await settle(page, 400);
  await shot(page, "27-portfolio-landing");

  /* ─────────────────────────────────────────── */
  section("17) Compare (Version comparison)");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Compare']").click().catch(async () => {
    await page.locator("button:has-text('Compare')").first().click().catch(() => {});
  });
  await settle(page, 700);
  await shot(page, "28-compare");

  /* ─────────────────────────────────────────── */
  section("18) Version history dialog");
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Editor']").click().catch(async () => {
    await page.locator("button:has-text('Editor')").first().click().catch(() => {});
  });
  await settle(page, 300);
  await page.click("button[aria-label='Version history']");
  await settle(page, 400);
  await shot(page, "29-version-history");
  // Try save current version
  await page.locator("button:has-text('Save Current Version')").first().click().catch(() => {});
  await settle(page, 400);
  await shot(page, "30-version-saved");
  await page.keyboard.press("Escape");

  /* ─────────────────────────────────────────── */
  section("19) Resume list dialog (Manage resumes)");
  await page.locator("button[aria-label='Manage resumes']").click().catch(async () => {
    await page.locator("button:has-text('CareerForge')").first().click().catch(() => {});
  });
  await settle(page, 400);
  await shot(page, "31-resume-list");
  await page.keyboard.press("Escape");

  /* ─────────────────────────────────────────── */
  section("20) Keyboard shortcuts help (?)");
  await page.keyboard.press("?");
  await settle(page, 400);
  await shot(page, "32-shortcuts");
  await page.keyboard.press("Escape");

  /* ─────────────────────────────────────────── */
  section("21) Dark mode toggle");
  await page.click("button[aria-label*='Switch to']");
  await settle(page, 400);
  await shot(page, "33-dark");
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  if (!isDark) logIssue("minor", "theme", "Dark mode did not apply .dark class");

  // Toggle back
  await page.click("button[aria-label*='Switch to']");
  await settle(page, 300);

  /* ─────────────────────────────────────────── */
  section("22) Undo / Redo");
  // Switch back to editor + Personal Info
  await page.locator("nav[aria-label='Builder panels'] button[aria-label='Editor']").click().catch(() => {});
  await settle(page, 300);
  await page.click("button[aria-label='Personal Info']").catch(() => {});
  await settle(page, 300);
  const before = await page.locator("input#name").inputValue();
  await page.locator("input#name").fill("Changed Name " + Date.now());
  await settle(page, 200);
  await page.click("button[aria-label='Undo']");
  await settle(page, 300);
  const after = await page.locator("input#name").inputValue();
  if (after !== before) logIssue("major", "editor", "Undo did not revert input#name (" + before + " → " + after + ")");
  else ok("Undo works");

  /* ─────────────────────────────────────────── */
  section("23) Preview toggle");
  await page.click("button[aria-label*='preview']").catch(() => {});
  await settle(page, 400);
  await shot(page, "34-preview-off");
  const stillVisible = await page.locator("aside[aria-label='Resume preview']").isVisible({ timeout: 1000 }).catch(() => false);
  if (stillVisible) logIssue("minor", "preview", "Preview did not hide after toggle");
  await page.click("button[aria-label*='preview']").catch(() => {});
  await settle(page, 300);

  /* ─────────────────────────────────────────── */
  section("24) RESPONSIVE — Mobile 375x812");
  await page.setViewportSize({ width: 375, height: 812 });
  await settle(page, 500);
  await shot(page, "35-mobile-builder");

  // hamburger
  const burger = page.locator("button[aria-label='Toggle menu']");
  if (!(await burger.isVisible())) logIssue("critical", "responsive", "Hamburger menu missing on mobile");
  await burger.click().catch(() => {});
  await settle(page, 400);
  await shot(page, "36-mobile-menu");
  await page.click("button[aria-label='Close menu']").catch(() => {});
  await settle(page, 300);

  // Preview pane behaviour on mobile
  const mobilePreview = await page.locator("aside[aria-label='Resume preview']").isVisible({ timeout: 1000 }).catch(() => false);
  info("Preview visible on mobile: " + mobilePreview);

  /* ─────────────────────────────────────────── */
  section("25) RESPONSIVE — Tablet 768x1024");
  await page.setViewportSize({ width: 768, height: 1024 });
  await settle(page, 500);
  await shot(page, "37-tablet");

  /* ─────────────────────────────────────────── */
  section("26) ACCESSIBILITY scan");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
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
        out.push("interactive element missing accessible name: " + el.outerHTML.slice(0, 100));
      }
    });
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => +h.tagName.slice(1));
    if (!headings.includes(1)) out.push("page has no h1");
    return out;
  });
  if (a11y.length === 0) ok("no obvious a11y issues on home");
  else a11y.forEach((i) => logIssue("minor", "a11y", i));

  /* ─────────────────────────────────────────── */
  section("27) PERF rough check");
  const stats = await page.evaluate(() => ({
    nodes: document.querySelectorAll("*").length,
    scripts: Array.from(document.scripts).map((s) => s.src).filter(Boolean).length,
    size: document.documentElement.outerHTML.length,
  }));
  info("DOM nodes: " + stats.nodes);
  info("external scripts: " + stats.scripts);
  info("HTML size: " + (stats.size / 1024).toFixed(1) + " KiB");
  if (stats.nodes > 4000) logIssue("minor", "perf", "DOM has " + stats.nodes + " nodes");

  const navMs = await page.evaluate(() => {
    const t = performance.timing || performance.getEntriesByType("navigation")[0];
    return t.duration || (t.loadEventEnd - t.startTime);
  });
  info("Page load: " + navMs + "ms");

  /* ─────────────────────────────────────────── */
  section("28) PWA / manifest");
  const manifest = await page.evaluate(async () => {
    try { const r = await fetch("/manifest.json"); return { status: r.status, ok: r.ok }; }
    catch { return { status: 0, ok: false }; }
  });
  info("manifest.json → " + manifest.status);
  if (!manifest.ok) logIssue("minor", "pwa", "manifest.json missing or returning non-OK");

  const sw = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return { supported: false };
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      return { supported: true, count: regs.length };
    } catch { return { supported: true, count: -1 }; }
  });
  info("service worker: supported=" + sw.supported + " regs=" + (sw.count ?? "?"));

  /* ─────────────────────────────────────────── */
  section("29) Offline page");
  await page.goto(BASE_URL + "/offline", { waitUntil: "domcontentloaded" });
  await shot(page, "38-offline");
  const offlineTitle = await page.locator("h1, h2").first().innerText().catch(() => "");
  info("offline title: " + offlineTitle);

  /* ─────────────────────────────────────────── */
  section("30) Privacy page");
  await page.goto(BASE_URL + "/privacy", { waitUntil: "networkidle" });
  await shot(page, "39-privacy");

  /* ─────────────────────────────────────────── */
  section("31) Auth pages");
  await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
  await shot(page, "40-login");
  await page.goto(BASE_URL + "/register", { waitUntil: "networkidle" });
  await shot(page, "41-register");

  /* ─────────────────────────────────────────── */
  section("32) Sitemap & robots");
  const sitemap = await page.evaluate(async () => {
    try { const r = await fetch("/sitemap.xml"); return { status: r.status }; }
    catch { return { status: 0 }; }
  });
  info("sitemap.xml → " + sitemap.status);

  /* ─────────────────────────────────────────── */
  await browser.close();

  fs.writeFileSync("/tmp/qa-artifacts/report.json", JSON.stringify(REPORT, null, 2));

  // Summary
  const counts = { critical: 0, major: 0, minor: 0, nit: 0, info: 0 };
  REPORT.forEach((r) => counts[r.severity]++);
  console.log("\n" + "=".repeat(70));
  console.log("QA SUMMARY");
  console.log("=".repeat(70));
  Object.entries(counts).forEach(([k, v]) => console.log("  " + k + ": " + v));
  console.log("📸 " + (SHOT_N - 1) + " screenshots in " + OUT_DIR);
  console.log("📝 /tmp/qa-artifacts/report.json");
})();
