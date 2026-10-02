/* ==========================================================
   fx.js — moteur commun des maquettes themoonweb
   (infos depuis js/config.js, effets, menu mobile, carte, visionneuse)
   Rien à modifier ici : les infos se changent dans js/config.js
   Version GM Électricité : + liens SMS (data-cfg-sms),
   + visionneuse ouvrable depuis le tableau électrique.
   ========================================================== */
(function () {
  "use strict";
  var S = window.SITE || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Remplir les infos depuis config.js ----------
     data-cfg="cle"        -> texte
     data-cfg-tel="cle"    -> lien tel:
     data-cfg-sms="cle"    -> lien sms: (+ texte pré-rempli smsTexte)
     data-cfg-mail="cle"   -> lien mailto:
     data-cfg-link="cle"   -> lien (href)
     data-cfg-hide="cle"   -> bloc masqué si la valeur est vide  */
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, S);
  }
  function intl(v) { return String(v).replace(/[^\d+]/g, "").replace(/^0/, "+33"); }
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg"));
    if (v != null && v !== "") el.textContent = v;
  });
  document.querySelectorAll("[data-cfg-tel]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-tel"));
    if (v) el.setAttribute("href", "tel:" + intl(v));
  });
  document.querySelectorAll("[data-cfg-sms]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-sms"));
    /* « ?&body= » fonctionne sur iPhone et sur Android */
    if (v) el.setAttribute("href", "sms:" + intl(v) + (S.smsTexte ? "?&body=" + encodeURIComponent(S.smsTexte) : ""));
  });
  document.querySelectorAll("[data-cfg-mail]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-mail"));
    if (v) el.setAttribute("href", "mailto:" + v);
  });
  document.querySelectorAll("[data-cfg-link]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-link"));
    if (v) el.setAttribute("href", v);
  });
  document.querySelectorAll("[data-cfg-hide]").forEach(function (el) {
    var keys = el.getAttribute("data-cfg-hide").split(/\s+/);
    keys.forEach(function (k) {
      var v = get(k);
      if (v == null || v === "" || (Array.isArray(v) && !v.length)) el.hidden = true;
    });
  });
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  window.FX = { get: get, intl: intl };

  /* ---------- 2. Apparitions au défilement (+ tracés SVG qui se dessinent) ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("fx");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 3. Compteurs animés ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (isNaN(end)) return;
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    var sep = el.getAttribute("data-sep") || ",";
    if (reduce) { el.textContent = end.toFixed(dec).replace(".", sep); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec).replace(".", sep);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  } else counters.forEach(runCount);

  /* ---------- 4. Boutons magnétiques (souris uniquement) ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.2, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = "translate(" + x + "px," + y + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- 5. Barre de progression + en-tête compact ---------- */
  var bar = document.querySelector(".progress");
  var head = document.querySelector(".site-head");
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    if (head) head.classList.toggle("is-scrolled", y > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 6. Menu mobile (piège de focus + Échap) ---------- */
  var burger = document.querySelector(".burger"), nav = document.getElementById("menu-mobile");
  if (burger && nav) {
    var lastFocus = null;
    var focusables = function () {
      return Array.prototype.filter.call(nav.querySelectorAll("a[href], button"), function (x) { return !x.closest("[hidden]"); });
    };
    var close = function (restore) {
      nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
      document.body.classList.remove("no-scroll"); nav.setAttribute("aria-hidden", "true");
      nav.inert = true;
      if (restore !== false && lastFocus) lastFocus.focus();
    };
    var open = function () {
      lastFocus = document.activeElement;
      nav.inert = false;
      nav.classList.add("open"); burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Fermer le menu");
      document.body.classList.add("no-scroll"); nav.setAttribute("aria-hidden", "false");
      var f = focusables(); if (f.length) f[0].focus();
    };
    nav.inert = true;
    burger.addEventListener("click", function () { nav.classList.contains("open") ? close() : open(); });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
      else if (e.target.closest("a")) close(false);
    });
    document.addEventListener("keydown", function (e) {
      if (!nav.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        var f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- 7. Carte Google Maps chargée au clic ---------- */
  document.querySelectorAll("[data-map]").forEach(function (box) {
    var btn = box.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var q = encodeURIComponent(S.mapsQuery || "");
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + q + "&z=11&output=embed";
      f.title = "Carte : " + (S.zone || S.mapsQuery || "");
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = ""; box.appendChild(f); box.classList.add("loaded");
      f.setAttribute("tabindex", "0"); f.focus();
    });
  });

  /* ---------- 8. Visionneuse photo (retour du focus) ----------
     Les photos de la galerie portent data-lb (+ data-photo="identifiant").
     Le tableau électrique ouvre la visionneuse avec FX.openLightbox("identifiant", bouton). */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
    var lbClose = lb.querySelector("[data-lb-close]"), lbPrev = lb.querySelector("[data-lb-prev]"), lbNext = lb.querySelector("[data-lb-next]");
    var cur = 0, back = null;
    var items = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-lb]")); };
    var show = function (i) {
      var list = items(); if (!list.length) return;
      cur = (i + list.length) % list.length;
      var it = list[cur], im = it.querySelector("img");
      lbImg.src = it.getAttribute("href"); lbImg.alt = im ? im.alt : "";
      lbCap.textContent = it.getAttribute("data-caption") || (im ? im.alt : "");
      var count = lb.querySelector("[data-lb-count]");
      if (count) count.textContent = (cur + 1) + " / " + list.length;
    };
    var openAt = function (i, from) {
      back = from || null; show(i);
      lb.hidden = false; document.body.classList.add("no-scroll"); lbClose.focus();
    };
    var hide = function () {
      lb.hidden = true; document.body.classList.remove("no-scroll");
      lbImg.removeAttribute("src");
      if (back) back.focus();
    };
    document.addEventListener("click", function (e) {
      var it = e.target.closest("[data-lb]");
      if (!it) return;
      e.preventDefault(); openAt(items().indexOf(it), it);
    });
    lbClose.addEventListener("click", hide);
    lbPrev.addEventListener("click", function () { show(cur - 1); });
    lbNext.addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); hide(); }
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "Tab") {
        var f = [lbClose, lbPrev, lbNext], i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    window.FX.openLightbox = function (id, from) {
      var list = items(), idx = 0;
      for (var k = 0; k < list.length; k++) if (list[k].getAttribute("data-photo") === id) { idx = k; break; }
      openAt(idx, from);
    };
  }
})();
