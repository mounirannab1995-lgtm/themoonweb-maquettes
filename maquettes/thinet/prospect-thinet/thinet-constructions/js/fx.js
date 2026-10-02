/* ==========================================================
   fx.js — moteur commun des maquettes themoonweb
   (infos depuis js/config.js, effets, menu mobile, carte, horaires)
   Rien à modifier ici : les infos se changent dans js/config.js
   ========================================================== */
(function () {
  "use strict";
  var S = window.SITE || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Remplir les infos depuis config.js ----------
     data-cfg="cle"        -> texte
     data-cfg-href="tel"   -> lien tel:
     data-cfg-hide="cle"   -> bloc masqué si la valeur est vide  */
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, S);
  }
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg"));
    if (v != null && v !== "") el.textContent = v;
  });
  document.querySelectorAll("[data-cfg-tel]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-tel"));
    if (v) el.setAttribute("href", "tel:" + String(v).replace(/[^\d+]/g, "").replace(/^0/, "+33"));
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
    var v = get(el.getAttribute("data-cfg-hide"));
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) el.hidden = true;
  });
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 2. Horaires + statut « ouvert maintenant » ---------- */
  var JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  function toMin(h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(h) { return h.replace(/^0/, "").replace(":", "h").replace("h00", "h"); }
  var H = S.horaires;
  if (H) {
    document.querySelectorAll("[data-hours]").forEach(function (list) {
      list.innerHTML = "";
      var today = new Date().getDay();
      [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
        var slots = H[d] || [];
        var li = document.createElement("li");
        if (d === today) li.className = "is-today";
        li.innerHTML = "<span>" + JOURS[d] + "</span><span>" +
          (slots.length ? slots.map(function (s) { return fmt(s[0]) + " – " + fmt(s[1]); }).join(" · ") : "Fermé") +
          "</span>";
        list.appendChild(li);
      });
    });
    var st = document.querySelectorAll("[data-status]");
    if (st.length) {
      var update = function () {
        var n = new Date(), d = n.getDay(), m = n.getHours() * 60 + n.getMinutes();
        var slots = H[d] || [], txt = "", open = false;
        for (var i = 0; i < slots.length; i++) {
          var a = toMin(slots[i][0]), b = toMin(slots[i][1]);
          if (m >= a && m < b) { open = true; txt = "Ouvert · jusqu'à " + fmt(slots[i][1]); break; }
          if (m < a) { txt = "Fermé · ouvre à " + fmt(slots[i][0]); break; }
        }
        if (!open && !txt) {
          for (var k = 1; k <= 7; k++) {
            var nd = (d + k) % 7;
            if ((H[nd] || []).length) {
              txt = "Fermé · ouvre " + (k === 1 ? "demain" : JOURS[nd].toLowerCase()) + " à " + fmt(H[nd][0][0]);
              break;
            }
          }
        }
        st.forEach(function (el) {
          el.textContent = txt;
          el.classList.toggle("is-open", open);
        });
      };
      update();
      setInterval(update, 60000);
    }
  }

  /* ---------- 3. Apparitions au défilement ---------- */
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

  /* ---------- 4. Compteurs animés ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var end = parseFloat(el.getAttribute("data-count"));
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

  /* ---------- 5. Halo qui suit la souris + boutons magnétiques ---------- */
  if (finePointer && !reduce) {
    var glow = document.querySelector(".cursor-glow");
    if (glow) {
      var gx = 0, gy = 0, tx = 0, ty = 0;
      window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); });
      (function loop() {
        gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
        glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
        requestAnimationFrame(loop);
      })();
    }
    document.querySelectorAll("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = "translate(" + x + "px," + y + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
    document.querySelectorAll("[data-tilt]").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (x * 100) + "%");
        c.style.setProperty("--my", (y * 100) + "%");
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 6) + "deg) rotateY(" + ((x - 0.5) * 6) + "deg)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ---------- 6. Barre de progression + en-tête compact ---------- */
  var bar = document.querySelector(".progress");
  var head = document.querySelector(".site-head");
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    if (head) head.classList.toggle("is-scrolled", y > 30);
    document.documentElement.style.setProperty("--scroll", y);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 7. Menu mobile (piège de focus + Échap) ---------- */
  var burger = document.querySelector(".burger"), nav = document.getElementById("menu-mobile");
  if (burger && nav) {
    var lastFocus = null;
    var focusables = function () { return nav.querySelectorAll("a, button"); };
    var close = function () {
      nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll"); nav.setAttribute("aria-hidden", "true");
      if (lastFocus) lastFocus.focus();
    };
    var open = function () {
      lastFocus = document.activeElement;
      nav.classList.add("open"); burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll"); nav.setAttribute("aria-hidden", "false");
      var f = focusables(); if (f.length) f[0].focus();
    };
    burger.addEventListener("click", function () { nav.classList.contains("open") ? close() : open(); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a") || e.target.closest("[data-close]")) close(); });
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

  /* ---------- 8. Onglets accessibles (flèches clavier) ---------- */
  document.querySelectorAll("[role=tablist]").forEach(function (tl) {
    var tabs = Array.prototype.slice.call(tl.querySelectorAll("[role=tab]"));
    function select(t) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      tl.dispatchEvent(new CustomEvent("tabchange", { detail: t }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n); n.focus(); }
      });
    });
  });

  /* ---------- 9. Carte Google Maps chargée au clic ---------- */
  document.querySelectorAll("[data-map]").forEach(function (box) {
    var btn = box.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var q = encodeURIComponent(S.mapsQuery || S.adresse || "");
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + q + "&output=embed";
      f.title = "Carte : " + (S.adresse || "");
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = ""; box.appendChild(f); box.classList.add("loaded");
    });
  });
  document.querySelectorAll("[data-itineraire]").forEach(function (a) {
    a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(S.mapsQuery || S.adresse || "");
  });

  /* ---------- 10. Visionneuse photo (retour du focus) ---------- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), lbClose = lb.querySelector("[data-lb-close]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lb]")), cur = 0, back = null;
    function show(i) {
      cur = (i + items.length) % items.length;
      var it = items[cur];
      lbImg.src = it.getAttribute("href"); lbImg.alt = it.querySelector("img").alt;
      lbCap.textContent = it.getAttribute("data-caption") || it.querySelector("img").alt;
    }
    items.forEach(function (it, i) {
      it.addEventListener("click", function (e) {
        e.preventDefault(); back = it; show(i);
        lb.hidden = false; document.body.classList.add("no-scroll"); lbClose.focus();
      });
    });
    function hide() { lb.hidden = true; document.body.classList.remove("no-scroll"); if (back) back.focus(); }
    lbClose.addEventListener("click", hide);
    lb.querySelector("[data-lb-prev]").addEventListener("click", function () { show(cur - 1); });
    lb.querySelector("[data-lb-next]").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "Tab") { e.preventDefault(); lbClose.focus(); }
    });
  }

  /* ---------- 11. Texte découpé lettre par lettre (titres) ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = words.map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + "</span></span>";
      }).join(" ");
      requestAnimationFrame(function () { el.classList.add("split-in"); });
    });
  }
})();
