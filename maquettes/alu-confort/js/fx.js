/* ==========================================================
   fx.js — moteur commun des maquettes themoonweb
   (infos depuis js/config.js, horaires, effets, menu mobile,
   carte au clic, visionneuse photo)
   Rien à modifier ici : les infos se changent dans js/config.js
   Version Alu Confort du Forez : + lien « Demander un devis »
   (e-mail pré-rempli), visionneuse limitée aux photos affichées.
   ========================================================== */
(function () {
  "use strict";
  var S = window.SITE || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Remplir les infos depuis config.js ----------
     data-cfg="cle"        -> texte
     data-cfg-tel="cle"    -> lien tel:
     data-cfg-mail="cle"   -> lien mailto:
     data-cfg-devis        -> lien mailto: avec objet + message pré-remplis
     data-cfg-link="cle"   -> lien (href)
     data-cfg-hide="cle"   -> bloc masqué si la valeur est vide
                              (plusieurs clés séparées par un espace) */
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, S);
  }
  function empty(v) { return v == null || v === "" || (Array.isArray(v) && !v.length); }
  function intl(v) { return String(v).replace(/[^\d+]/g, "").replace(/^0/, "+33"); }
  function devisHref(sujet) {
    if (!S.email) return "";
    var q = [];
    var objet = sujet ? "Demande de devis : " + sujet : (S.devisObjet || "");
    if (objet) q.push("subject=" + encodeURIComponent(objet));
    if (S.devisMessage) q.push("body=" + encodeURIComponent(S.devisMessage));
    return "mailto:" + S.email + (q.length ? "?" + q.join("&") : "");
  }
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg"));
    if (!empty(v)) el.textContent = v;
  });
  document.querySelectorAll("[data-cfg-tel]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-tel"));
    if (v) el.setAttribute("href", "tel:" + intl(v));
  });
  document.querySelectorAll("[data-cfg-mail]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-mail"));
    if (v) el.setAttribute("href", "mailto:" + v);
  });
  document.querySelectorAll("[data-cfg-devis]").forEach(function (el) {
    var h = devisHref(el.getAttribute("data-cfg-devis"));
    if (h) el.setAttribute("href", h); else el.hidden = true;
  });
  document.querySelectorAll("[data-cfg-link]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg-link"));
    if (v) el.setAttribute("href", v);
  });
  document.querySelectorAll("[data-cfg-hide]").forEach(function (el) {
    el.getAttribute("data-cfg-hide").split(/\s+/).forEach(function (k) {
      if (k && empty(get(k))) el.hidden = true;
    });
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 2. Horaires + statut « ouvert maintenant » ----------
     Les horaires viennent de SITE.horaires (null = blocs masqués). */
  var JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  function toMin(h) { var p = h.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(h) { return h.replace(/^0/, "").replace(":", "h").replace("h00", "h"); }
  function hoursAt(path) { return path ? get(path) : S.horaires; }
  function statusOf(H) {
    if (!H) return { txt: "", open: false };
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
    return { txt: txt, open: open };
  }
  function renderHours(list, H) {
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
  }
  function refreshHours() {
    document.querySelectorAll("[data-hours]").forEach(function (list) {
      var H = hoursAt(list.getAttribute("data-hours"));
      var wrap = list.closest("[data-hours-wrap]") || list;
      if (H) { renderHours(list, H); wrap.hidden = false; } else wrap.hidden = true;
    });
    document.querySelectorAll("[data-status]").forEach(function (el) {
      var H = hoursAt(el.getAttribute("data-status"));
      var r = statusOf(H);
      el.textContent = r.txt;
      el.classList.toggle("is-open", r.open);
      var wrap = el.closest("[data-status-wrap]");
      if (wrap) { wrap.hidden = !H; wrap.classList.toggle("is-open", r.open); }
    });
  }
  refreshHours();
  setInterval(refreshHours, 60000);
  window.FX = { get: get, intl: intl, statusOf: statusOf, devisHref: devisHref, reduce: reduce };

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

  /* ---------- 5. Boutons magnétiques (souris uniquement) ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = "translate(" + x + "px," + y + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- 6. Barre de progression + en-tête compact ---------- */
  var bar = document.querySelector(".progress");
  var head = document.querySelector(".site-head");
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    if (head) head.classList.toggle("is-scrolled", y > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 7. Menu mobile (piège de focus + Échap) ---------- */
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
    window.addEventListener("resize", function () { if (innerWidth > 980 && nav.classList.contains("open")) close(false); });
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

  /* ---------- 9. Carte Google Maps chargée au clic + itinéraire ---------- */
  document.querySelectorAll("[data-map]").forEach(function (box) {
    var btn = box.querySelector("button");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var q = encodeURIComponent(S.mapsQuery || S.adresse || "");
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + q + "&z=15&output=embed";
      f.title = "Carte : " + (S.adresse || S.mapsQuery || "");
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = ""; box.appendChild(f); box.classList.add("loaded");
      f.setAttribute("tabindex", "0"); f.focus();
    });
  });
  document.querySelectorAll("[data-itineraire]").forEach(function (a) {
    a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(S.mapsQuery || S.adresse || "");
  });

  /* ---------- 10. Visionneuse photo (retour du focus) ----------
     Les photos portent data-lb (lien vers la grande image).
     Seules les photos actuellement affichées sont parcourues
     (respecte le filtre de la galerie). */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
    var lbClose = lb.querySelector("[data-lb-close]"), lbPrev = lb.querySelector("[data-lb-prev]"), lbNext = lb.querySelector("[data-lb-next]");
    var lbCount = lb.querySelector("[data-lb-count]");
    var cur = 0, back = null, group = [];
    var visible = function (x) { return !x.closest("[hidden]") && x.getClientRects().length > 0; };
    var listFor = function (it) {
      var g = it.getAttribute("data-lb") || "galerie";
      return Array.prototype.filter.call(document.querySelectorAll("[data-lb]"), function (x) {
        return (x.getAttribute("data-lb") || "galerie") === g && visible(x);
      });
    };
    var show = function (i) {
      if (!group.length) return;
      cur = (i + group.length) % group.length;
      var it = group[cur], im = it.querySelector("img");
      lbImg.src = it.getAttribute("href"); lbImg.alt = im ? im.alt : "";
      lbCap.textContent = it.getAttribute("data-caption") || (im ? im.alt : "");
      if (lbCount) lbCount.textContent = (cur + 1) + " / " + group.length;
      var multi = group.length > 1;
      lbPrev.hidden = !multi; lbNext.hidden = !multi;
    };
    var openAt = function (it) {
      group = listFor(it); back = it;
      show(Math.max(0, group.indexOf(it)));
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
      e.preventDefault(); openAt(it);
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
        var f = [lbClose, lbPrev, lbNext].filter(function (b) { return !b.hidden; });
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }

  /* ---------- 11. Titres qui apparaissent mot par mot ---------- */
  if (!reduce) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var label = el.textContent.trim().replace(/\s+/g, " ");
      el.setAttribute("aria-label", label);
      var i = 0;
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
              var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
              var s = document.createElement("span"); s.style.setProperty("--i", i++); s.textContent = part;
              w.appendChild(s); frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) { n.setAttribute("aria-hidden", "true"); wrap(n); }
        });
      })(el);
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("split-in"); }); });
    });
  }
})();
