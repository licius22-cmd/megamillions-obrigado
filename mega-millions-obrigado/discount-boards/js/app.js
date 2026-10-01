(function () {
  var TRACK = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];
  var body = document.body;
  var extra = Number(body.getAttribute("data-extra") || "0");
  var fromPack = body.getAttribute("data-from") || "";
  var toPack = body.getAttribute("data-to") || "";
  var checkout = body.getAttribute("data-checkout") || "";
  var skip = body.getAttribute("data-skip") || "";

  function qs() {
    try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
  }

  function stamp(url) {
    var next = new URL(url, location.href);
    var q = qs();
    TRACK.forEach(function (k) {
      var v = (q.get(k) || q.get("metadata[" + k + "]") || "").trim();
      if (v) {
        next.searchParams.set(k, v);
        next.searchParams.set("metadata[" + k + "]", v);
      }
    });
    var email = (q.get("email") || "").trim();
    if (email.indexOf("@") !== -1) {
      next.searchParams.set("email", email);
      next.searchParams.set("email.disabled", "1");
    }
    if (toPack) {
      next.searchParams.set("pack", toPack);
      next.searchParams.set("metadata[pack]", toPack);
    }
    if (fromPack) next.searchParams.set("metadata[upsell_from]", fromPack);
    next.searchParams.set("metadata[upsell]", "1");
    next.searchParams.set("metadata[locale]", "en");
    return next.toString();
  }

  function stampSkip(url) {
    var next = new URL(url, location.href);
    var q = qs();
    TRACK.forEach(function (k) {
      var v = (q.get(k) || "").trim();
      if (v) next.searchParams.set(k, v);
    });
    var email = (q.get("email") || "").trim();
    if (email) next.searchParams.set("email", email);
    return next.toString();
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  function nextDrawMs() {
    var now = new Date();
    var et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    var days = [2, 5];
    for (var n = 0; n < 9; n++) {
      var d = new Date(et);
      d.setDate(et.getDate() + n);
      if (days.indexOf(d.getDay()) === -1) continue;
      var close = new Date(d);
      close.setHours(23, 0, 0, 0);
      if (close.getTime() > et.getTime() + 1000) return close - et;
    }
    return 0;
  }
  function tick() {
    var el = document.getElementById("timer");
    if (!el) return;
    var ms = nextDrawMs();
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    el.textContent =
      pad(Math.floor(s / 86400)) + "d " +
      pad(Math.floor((s % 86400) / 3600)) + "h " +
      pad(Math.floor((s % 3600) / 60)) + "m " +
      pad(s % 60) + "s";
  }
  tick();
  setInterval(tick, 1000);

  var skipA = document.getElementById("skip");
  if (skipA && skip) skipA.href = stampSkip(skip);

  var cta = document.getElementById("lock");
  if (cta) {
    cta.addEventListener("click", function () {
      if (cta.disabled) return;
      cta.disabled = true;
      try {
        if (typeof fbq === "function") fbq("track", "InitiateCheckout", { currency: "USD", value: extra });
      } catch (e) {}
      location.href = stamp(checkout);
    });
  }
})();
