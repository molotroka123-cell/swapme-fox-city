// Run with: node --test tests/*.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlFiles = [
  "index.html",
  "en/index.html",
  "challenge/fox-flight.html",
  "discover/prague-in-roblox.html",
  "creators/index.html",
  "guide/coin-merge-guide.html",
  "guide/roblox-tycoon-to-play-with-friends.html"
];

function localTarget(page, value) {
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(value)) return null;
  const clean = value.split(/[?#]/, 1)[0];
  if (!clean) return null;
  const absolute = path.resolve(root, path.dirname(page), clean);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new Error("Path escaped site root: " + page + " -> " + value);
  }
  return (clean.endsWith("/") || clean === "." || clean === "..")
    ? path.join(absolute, "index.html")
    : absolute;
}

test("every local link, stylesheet, script and asset resolves", () => {
  for (const page of htmlFiles) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const target = localTarget(page, match[1]);
      if (target) assert.ok(fs.existsSync(target), page + " -> " + match[1]);
    }
  }
});

test("sitemap includes all public HTML entry points", () => {
  const xml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  for (const page of htmlFiles) {
    const urlPath = page === "index.html" ? "/" : page.endsWith("/index.html") ? "/" + page.slice(0, -"index.html".length) : "/" + page;
    const expected = "https://molotroka123-cell.github.io/swapme-fox-city" + urlPath;
    assert.ok(xml.includes("<loc>" + expected + "</loc>"), page + " missing from sitemap");
  }
});

test("funnel pages can use configured Roblox Share Links", () => {
  const pages = ["challenge/fox-flight.html", "discover/prague-in-roblox.html", "creators/index.html", "guide/coin-merge-guide.html", "guide/roblox-tycoon-to-play-with-friends.html"];
  for (const p of pages) {
    const html = fs.readFileSync(path.join(root, p), "utf8");
    assert.match(html, /data-play/, p);
    assert.match(html, /assets\/share-links\.js/, p);
    assert.match(html, /assets\/site\.js/, p);
  }
});

test("campaign mapping does not leak visits or generate fake Share Links", () => {
  const js = fs.readFileSync(path.join(root, "assets/site.js"), "utf8");
  const config = fs.readFileSync(path.join(root, "assets/share-links.js"), "utf8");
  assert.match(js, /utm_source/);
  assert.match(js, /safeRobloxUrl/);
  assert.doesNotMatch(js, /location\.(?:replace|assign)\s*\(/);
  assert.doesNotMatch(js, /sendBeacon|fetch\s*\(|XMLHttpRequest|document\.cookie/);
  assert.match(config, /Create|Generate|verified|real/i);
  assert.ok(fs.existsSync(path.join(root, "og-cover.jpg")));
});
