// Static regression tests for the published landing source. Run: node --test tests/landing.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const ru = fs.readFileSync(path.join(root, "index.html"), "utf8");
const en = fs.readFileSync(path.join(root, "en/index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "assets/site.js"), "utf8");
const config = fs.readFileSync(path.join(root, "assets/share-links.js"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

test("landing never forcibly redirects after launch", () => {
  assert.doesNotMatch(js, /location\\.(replace|assign)\\s*\\(/);
  assert.doesNotMatch(ru, /location\\.(replace|assign)\\s*\\(/);
  assert.doesNotMatch(en, /location\\.(replace|assign)\\s*\\(/);
});
test("both languages have valid CTA and canonical", () => {
  for (const page of [ru, en]) {
    assert.match(page, /data-play/);
    assert.match(page, /rel="canonical"/);
    assert.match(page, /hreflang="en"/);
    assert.match(page, /hreflang="ru"/);
    assert.match(page, /assets\\/site\\.js/);
  }
  assert.match(en, /lang="en"/);
  assert.match(ru, /lang="ru"/);
});
test("tracking is opt-in mapping with Roblox-only destination", () => {
  assert.match(js, /allowedSources/);
  assert.match(js, /safeRobloxUrl/);
  assert.match(js, /roblox\\.com/);
  assert.match(config, /real links/i);
});
test("sitemap includes English and Russian", () => {
  assert.match(sitemap, /swapme-fox-city\\/<\\/loc>/);
  assert.match(sitemap, /swapme-fox-city\\/en\\/<\\/loc>/);
});
