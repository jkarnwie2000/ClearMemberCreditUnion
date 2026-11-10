// Audit helpers are not project dependencies. Install them temporarily first:
//   npm i --no-save lighthouse chrome-launcher puppeteer-core axe-core
// Set CHROME_PATH if Chrome is not at the default Windows location.
// Runs axe-core against the running app in real Chrome, including interactive states,
// and captures screenshots. Usage: node axe-audit.mjs <baseUrl> <screenshotDir> <outJson>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import puppeteer from "puppeteer-core";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const [baseUrl = "http://localhost:3100", shotDir, outJson = "axe-results.json"] = process.argv.slice(2);
if (shotDir) mkdirSync(shotDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run", "--no-default-browser-check"],
});

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function runAxe(page, label) {
  await page.evaluate(axeSource);
  const result = await page.evaluate(async (tags) => {
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags } });
    return {
      violations: r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary })),
      })),
      passes: r.passes.length,
      incomplete: r.incomplete.map((i) => ({ id: i.id, nodes: i.nodes.length })),
    };
  }, TAGS);
  return { label, url: page.url(), ...result };
}

const results = [];
async function audit(label, path, { viewport = { width: 1366, height: 900 }, setup, shot } = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(baseUrl + path, { waitUntil: "networkidle0" });
  if (setup) await setup(page);
  await new Promise((r) => setTimeout(r, 300));
  results.push(await runAxe(page, label));
  if (shot && shotDir) await page.screenshot({ path: `${shotDir}/${shot}.png`, fullPage: false });
  await page.close();
}

const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

await audit("Overview", "/", { shot: "overview-desktop" });
await audit("Overview – balance explanation open", "/", {
  setup: async (p) => {
    const [btn] = await p.$$("xpath/.//button[contains(., \"What's the difference?\")]");
    await btn.click();
  },
});
await audit("Accounts", "/accounts", { shot: "accounts-desktop" });
await audit("Account Activity", "/activity", { shot: "activity-desktop" });
await audit("Account Activity – filtered (pending)", "/activity?status=pending");
await audit("Account Activity – no results", "/activity?q=zzzz-no-match");
await audit("Transaction detail – hotel hold", "/activity?txn=txn-1002", { shot: "transaction-explanation-desktop" });
await audit("Transaction detail – delayed transfer", "/activity?txn=txn-1018", { shot: "transfer-delay-desktop" });
await audit("Transaction detail – unfamiliar merchant", "/activity?txn=txn-1010");
await audit("Help Center", "/help", { shot: "help-center-desktop" });
await audit("Help Center – no results", "/help?q=zzzz-no-match");
await audit("Help article", "/help/authorization-holds", { shot: "help-article-desktop" });
await audit("Support Requests", "/support", { shot: "support-history-desktop" });
await audit("Support request – step 1", "/support/new", { shot: "support-step1-desktop" });
await audit("Support request – validation errors", "/support/new?topic=account-fee", {
  setup: async (p) => {
    const [btn] = await p.$$("xpath/.//button[contains(., 'Continue')]");
    await btn.click();
    await p.waitForSelector("input#support-subject");
    const [btn2] = await p.$$("xpath/.//button[contains(., 'Continue')]");
    await btn2.click();
    await p.waitForSelector("#error-summary-heading");
  },
  shot: "support-validation-desktop",
});
await audit("Settings", "/settings");
await audit("Notifications panel", "/", {
  setup: async (p) => {
    await p.click('button[aria-label^="Notifications"]');
    await p.waitForSelector('[role="dialog"]');
  },
});
await audit("404 page", "/does-not-exist");
await audit("Overview – mobile", "/", { viewport: mobile, shot: "overview-mobile" });
await audit("Mobile navigation open", "/", {
  viewport: mobile,
  setup: async (p) => {
    await p.click('button[aria-label="Open navigation menu"]');
    await p.waitForSelector('[role="dialog"]');
  },
  shot: "mobile-navigation",
});
await audit("Transaction detail – mobile", "/activity?txn=txn-1001", { viewport: mobile, shot: "transaction-explanation-mobile" });

await browser.close();
writeFileSync(outJson, JSON.stringify(results, null, 2));

let total = 0;
for (const r of results) {
  total += r.violations.length;
  console.log(`${r.violations.length === 0 ? "PASS" : "FAIL"}  ${r.label}  (violations: ${r.violations.length}, passed rules: ${r.passes}, needs review: ${r.incomplete.length})`);
  for (const v of r.violations) {
    console.log(`   - [${v.impact}] ${v.id}: ${v.help}`);
    for (const n of v.nodes.slice(0, 4)) console.log(`       ${n.target}`);
  }
}
console.log(`\nTOTAL VIOLATIONS: ${total} across ${results.length} page states`);
