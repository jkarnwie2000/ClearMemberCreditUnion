// Audit helpers are not project dependencies. Install them temporarily first:
//   npm i --no-save lighthouse chrome-launcher puppeteer-core axe-core
// Set CHROME_PATH if Chrome is not at the default Windows location.
// Runs Lighthouse (mobile + desktop presets) against the production server.
// Usage: node lighthouse-audit.mjs <baseUrl> <outJson>
import { writeFileSync } from "node:fs";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";

const [baseUrl = "http://localhost:3100", outJson = "lighthouse-results.json"] = process.argv.slice(2);
const pages = ["/", "/activity", "/help", "/help/authorization-holds", "/support/new"];
const categories = ["performance", "accessibility", "best-practices", "seo"];

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  chromeFlags: ["--headless=new", "--no-first-run"],
});

const results = [];
for (const formFactor of ["mobile", "desktop"]) {
  for (const path of pages) {
    const runnerResult = await lighthouse(
      baseUrl + path,
      { port: chrome.port, output: "json", logLevel: "error", onlyCategories: categories },
      formFactor === "desktop" ? desktopConfig : undefined,
    );
    const lhr = runnerResult.lhr;
    const scores = Object.fromEntries(categories.map((c) => [c, Math.round(lhr.categories[c].score * 100)]));
    const failing = Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable")
      .map((a) => `${a.id} (${a.displayValue ?? Math.round(a.score * 100)})`);
    const metrics = {
      FCP: lhr.audits["first-contentful-paint"].displayValue,
      LCP: lhr.audits["largest-contentful-paint"].displayValue,
      TBT: lhr.audits["total-blocking-time"].displayValue,
      CLS: lhr.audits["cumulative-layout-shift"].displayValue,
    };
    results.push({ formFactor, path, scores, metrics, failing, lighthouseVersion: lhr.lighthouseVersion, userAgent: lhr.environment.hostUserAgent });
    console.log(formFactor.padEnd(8), path.padEnd(28), JSON.stringify(scores), JSON.stringify(metrics));
    if (failing.length) console.log("          below 90:", failing.join(", "));
  }
}
await chrome.kill();
writeFileSync(outJson, JSON.stringify(results, null, 2));
