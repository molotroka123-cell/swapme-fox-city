/* SwapMe Fox City landing: no cookies, no hidden analytics, no auto-redirect. */
(function () {
  "use strict";
  var BASE_GAME_URL = "https://www.roblox.com/games/124887751218092";
  var SITE_BASE = "https://molotroka123-cell.github.io/swapme-fox-city/";
  var LAUNCH_TIME = Date.parse("2026-11-11T17:00:00Z");
  var lang = document.documentElement.lang === "en" ? "en" : "ru";
  var allowedSources = new Set(["tiktok", "youtube", "yt_shorts", "instagram", "pinterest", "reddit", "discord", "creator", "x", "google", "friend", "direct"]);
  var params = new URLSearchParams(window.location.search);
  var rawSource = (params.get("src") || params.get("utm_source") || "").trim().toLowerCase();
  var aliases = { search: "google", shorts: "yt_shorts", youtube_shorts: "yt_shorts" };
  var normalizedSource = aliases[rawSource] || rawSource;
  var source = allowedSources.has(normalizedSource) ? normalizedSource : "direct";
  var configured = window.FOX_CITY_SHARE_LINKS || {};
  var candidate = configured[source];
  function safeRobloxUrl(value) {
    if (typeof value !== "string") return null;
    try {
      var parsed = new URL(value);
      if (parsed.protocol !== "https:" || !["roblox.com", "www.roblox.com"].includes(parsed.hostname)) return null;
      return parsed.href;
    } catch (_) { return null; }
  }
  var playUrl = safeRobloxUrl(candidate) || BASE_GAME_URL;
  document.querySelectorAll("[data-play]").forEach(function (link) {
    link.href = playUrl;
    link.rel = "noopener noreferrer";
  });

  var timer = document.getElementById("countdown");
  var launchText = document.getElementById("launch-text");
  function renderTime() {
    var diff = LAUNCH_TIME - Date.now();
    if (diff <= 0) {
      if (timer) timer.hidden = true;
      if (launchText) launchText.textContent = lang === "ru"
        ? "Запланированное время старта наступило. Проверяй доступность на странице Roblox."
        : "The scheduled launch time has arrived. Check availability on the Roblox game page.";
      return false;
    }
    var total = Math.floor(diff / 1000);
    var ids = ["days", "hours", "minutes", "seconds"];
    var vals = [Math.floor(total / 86400), Math.floor((total % 86400) / 3600), Math.floor((total % 3600) / 60), total % 60];
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(vals[i]).padStart(2, "0");
    });
    return true;
  }
  if (timer) {
    var running = renderTime();
    if (running) {
      var interval = setInterval(function () { if (!renderTime()) clearInterval(interval); }, 1000);
    }
  }

  var status = document.getElementById("action-status");
  function message(value) { if (status) status.textContent = value; }
  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    window.prompt(lang === "ru" ? "Скопируй текст:" : "Copy the text:", value);
    return Promise.resolve();
  }
  document.querySelectorAll("[data-copy-caption]").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-copy-caption");
      var el = document.getElementById(id);
      if (!el) return;
      copyText(el.textContent.trim()).then(function () {
        message(lang === "ru" ? "Текст готов — вставь в свой пост." : "Caption ready — paste it into your post.");
      }).catch(function () {
        message(lang === "ru" ? "Не удалось скопировать — выдели текст вручную." : "Copy failed — select the text manually.");
      });
    });
  });
  var share = document.getElementById("share-site");
  if (share) share.addEventListener("click", function () {
    var url = SITE_BASE + "?src=friend";
    if (navigator.share) {
      navigator.share({ title: "SwapMe Fox City", text: lang === "ru" ? "Пошли играть в Fox City 🦊" : "Let's play Fox City 🦊", url: url })
        .catch(function () { /* User cancelled sharing; no error popup needed. */ });
    } else {
      copyText(url).then(function () {
        message(lang === "ru" ? "Ссылка скопирована." : "Link copied.");
      }).catch(function () {
        message(lang === "ru" ? "Скопируй адрес сайта вручную." : "Copy the page address manually.");
      });
    }
  });
})();
