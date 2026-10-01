/* ==========================================================
   thermostat.js — la molette « Chauffer / Rafraîchir » d'Ideal Froid
   + avis clients, communes, bouton devis par e-mail, ventilateur animé.
   Chargé AVANT fx.js. Les infos se changent dans js/config.js.
   ----------------------------------------------------------
   Astuce : ajoutez ?mode=frais (ou ?mode=chaud) à l'adresse du site
   pour l'ouvrir directement dans un mode. Sans rien, le mode suit la
   saison : « Rafraîchir » de mai à septembre, « Chauffer » le reste de l'année.
   ========================================================== */
(function () {
  "use strict";
  var S = window.SITE || {};
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- 1. Qualification RGE : masquée automatiquement après sa date de fin ---------- */
  (function () {
    var ok = !!S.rge;
    if (ok && S.rgeFinValidite) {
      var p = String(S.rgeFinValidite).split("-");
      var fin = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
      if (!isNaN(fin.getTime()) && new Date() > fin) ok = false;
    }
    S.rgeActif = ok ? "oui" : "";
  })();

  /* ---------- 2. Avis clients (depuis config.js) ---------- */
  var box = $("[data-reviews]");
  if (box && Array.isArray(S.avis)) {
    S.avis.forEach(function (a, i) {
      if (!a || !a.texte) return;
      var fig = document.createElement("figure");
      fig.className = "review glass";
      fig.setAttribute("data-reveal", "");
      fig.style.setProperty("--d", i % 3);
      var q = document.createElement("blockquote");
      String(a.texte).split("\n").forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        q.appendChild(p);
      });
      var cap = document.createElement("figcaption");
      cap.textContent = [a.source, a.date].filter(Boolean).join(" · ");
      var mark = document.createElement("span");
      mark.className = "q"; mark.setAttribute("aria-hidden", "true"); mark.textContent = "“";
      fig.appendChild(mark); fig.appendChild(q); fig.appendChild(cap);
      box.appendChild(fig);
    });
  }

  /* ---------- 3. Communes desservies ---------- */
  var ul = $("[data-communes]");
  if (ul && Array.isArray(S.communes)) {
    S.communes.forEach(function (c) {
      var li = document.createElement("li"); li.textContent = c; ul.appendChild(li);
    });
  }

  /* ---------- 4. Chiffres animés lus dans config.js (data-count-cfg) ---------- */
  $$("[data-count-cfg]").forEach(function (el) {
    var v = String(S[el.getAttribute("data-count-cfg")] || "").replace(",", ".");
    if (v && !isNaN(parseFloat(v))) {
      el.setAttribute("data-count", v);
      el.textContent = v.replace(".", el.getAttribute("data-sep") || ",");
    }
  });

  /* ---------- 5. Horaires résumés (bloc « Bureau » des repères) ---------- */
  (function () {
    var el = $("[data-hours-short]"), H = S.horaires;
    if (!el || !H) return;
    var f = function (h) { return h.replace(/^0/, "").replace(":", "h").replace("h00", "h"); };
    for (var d = 1; d <= 6; d++) {
      if ((H[d] || []).length) {
        el.textContent = H[d].map(function (s) { return f(s[0]) + "–" + f(s[1]); }).join(" · ");
        return;
      }
    }
  })();

  /* ---------- 6. Bouton « Demander un devis » = e-mail pré-rempli ---------- */
  var projet = "Pompe à chaleur", projetChoisi = false;
  function mailto() {
    if (!S.email) return "#contact";
    var sujet = (S.devisSujet || "Demande de devis") + (projet ? " – " + projet : "");
    var corps = String(S.devisMessage || "").replace("{projet}", projet || "");
    return "mailto:" + S.email + "?subject=" + encodeURIComponent(sujet) +
      "&body=" + encodeURIComponent(corps.replace(/\r?\n/g, "\r\n"));
  }
  function majDevis() { $$("[data-devis]").forEach(function (a) { a.setAttribute("href", mailto()); }); }
  var chips = $$("[data-chips] button");
  function choisir(btn) {
    chips.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
    projet = btn.textContent.trim();
    majDevis();
  }
  chips.forEach(function (b) {
    b.addEventListener("click", function () { projetChoisi = true; choisir(b); });
  });
  majDevis();

  /* ---------- 7. La molette du thermostat ---------- */
  var dial = $("[data-dial]");
  var box3 = (dial && dial.closest("[data-thermo]")) || root;   // porte --ang et --amt
  var ticksG = $("[data-ticks]"), arc = $("[data-arc]"), track = $(".dial-track");
  var srH1 = $("[data-h1-sr]"), themeMeta = $('meta[name="theme-color"]');
  var CX = 200, CY = 200, MAXA = 135;        // angle maxi de part et d'autre du haut
  var value = 75, mode = null, amt = 0.5, tween = 0;
  var ticks = [];

  function pt(r, a) {                          // a en degrés, 0 = en haut, sens horaire
    var rad = a * Math.PI / 180;
    return [CX + r * Math.sin(rad), CY - r * Math.cos(rad)];
  }
  function arcPath(r, a0, a1) {
    var p0 = pt(r, a0), p1 = pt(r, a1);
    var large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + "A" + r + " " + r + " 0 " + large + " " + sweep + " " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }

  if (ticksG) {
    var NS = "http://www.w3.org/2000/svg";
    for (var a = -MAXA; a <= MAXA + 0.01; a += 4.5) {
      var major = Math.abs(a % 45) < 0.01;
      var p0 = pt(major ? 168 : 173, a), p1 = pt(186, a);
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", p0[0].toFixed(2)); l.setAttribute("y1", p0[1].toFixed(2));
      l.setAttribute("x2", p1[0].toFixed(2)); l.setAttribute("y2", p1[1].toFixed(2));
      if (major) l.setAttribute("class", "major");
      l._a = a;
      ticksG.appendChild(l); ticks.push(l);
    }
    if (track) track.setAttribute("d", arcPath(156, -MAXA, MAXA));
  }

  var rolls = $$("[data-roll]");
  function sizeRolls() {
    rolls.forEach(function (r) {
      var w = r.querySelector(mode === "frais" ? ".rw-frais" : ".rw-chaud");
      if (w) r.style.width = Math.ceil(w.getBoundingClientRect().width) + "px";
    });
  }

  function applyMode(m) {
    if (m === mode) return;
    mode = m;
    root.setAttribute("data-mode", m);
    if (srH1) srH1.textContent = m === "chaud" ? "Au chaud cet hiver." : "Au frais cet été.";
    if (themeMeta) themeMeta.setAttribute("content", m === "chaud" ? "#fbf3ec" : "#eef5fb");
    $$("[data-set]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set") === m)); });
    if (!projetChoisi && chips.length) {          // projet proposé par défaut selon le mode
      var cible = chips.filter(function (b) { return b.textContent.trim() === (m === "chaud" ? "Pompe à chaleur" : "Climatisation"); })[0];
      if (cible) choisir(cible);
    }
    sizeRolls();
  }

  function setValue(v) {
    value = Math.max(0, Math.min(100, v));
    var ang = (value - 50) / 50 * MAXA;
    amt = Math.abs(value - 50) / 50;
    if (dial) {
      box3.style.setProperty("--ang", ang.toFixed(2) + "deg");
      box3.style.setProperty("--amt", amt.toFixed(3));
      var m = value >= 50 ? "chaud" : "frais";
      dial.setAttribute("aria-valuenow", String(Math.round(value)));
      dial.setAttribute("aria-valuetext", (m === "chaud" ? "Chauffer" : "Rafraîchir") + ", molette à " + Math.round(value) + " %");
      ticks.forEach(function (t) {
        var on = ang >= 0 ? (t._a >= -0.01 && t._a <= ang + 0.01) : (t._a <= 0.01 && t._a >= ang - 0.01);
        t.classList.toggle("on", on);
      });
      if (arc) arc.setAttribute("d", Math.abs(ang) < 0.5 ? "" : arcPath(156, 0, ang));
      applyMode(m);
    } else {
      applyMode(value >= 50 ? "chaud" : "frais");
    }
  }

  function tweenTo(target, duree) {
    cancelAnimationFrame(tween);
    if (reduce) { setValue(target); return; }
    var from = value, t0 = null, d = duree || 700;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / d, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setValue(from + (target - from) * e);
      if (p < 1) tween = requestAnimationFrame(step);
    }
    tween = requestAnimationFrame(step);
  }

  /* boutons « Chauffer » / « Rafraîchir » (héros + schéma) */
  $$("[data-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      var m = b.getAttribute("data-set");
      if (m === mode) return;
      tweenTo(m === "chaud" ? 75 : 25);
    });
  });

  if (dial) {
    /* souris : on attrape la molette et on la tourne (angle réel).
       doigt : on glisse vers la gauche / la droite (un glissement vertical fait
       défiler la page normalement) ; une simple touche règle la molette à cet endroit. */
    var drag = null;
    var fromPointer = function (e) {
      var r = dial.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) < r.width * 0.12) return;   // trop près du centre : on ignore
      var a = Math.atan2(dx, -dy) * 180 / Math.PI;                    // 0 = haut, sens horaire
      if (a > MAXA || a < -MAXA) a = value >= 50 ? MAXA : -MAXA;        // zone morte en bas : butée
      setValue(50 + a / MAXA * 50);
    };
    var finDrag = function () { drag = null; dial.classList.remove("is-drag"); };
    dial.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      cancelAnimationFrame(tween);
      drag = { id: e.pointerId, doigt: e.pointerType === "touch", x0: e.clientX, v0: value, bouge: false };
      if (!drag.doigt) {
        try { dial.setPointerCapture(e.pointerId); } catch (err) {}
        dial.classList.add("is-drag");
        fromPointer(e);
        e.preventDefault();
        dial.focus({ preventScroll: true });
      }
    });
    dial.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.doigt) { fromPointer(e); return; }
      var dx = e.clientX - drag.x0;
      if (!drag.bouge && Math.abs(dx) > 6) {
        drag.bouge = true; dial.classList.add("is-drag");
        try { dial.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (drag.bouge) setValue(drag.v0 + dx / dial.getBoundingClientRect().width * 130);
    });
    dial.addEventListener("pointerup", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.doigt && !drag.bouge) fromPointer(e);                  // simple touche
      finDrag();
    });
    dial.addEventListener("pointercancel", finDrag);                   // le navigateur fait défiler la page
    dial.addEventListener("lostpointercapture", function () { if (drag && !drag.doigt) finDrag(); });

    /* clavier : flèches, Page haut/bas, Début/Fin */
    dial.addEventListener("keydown", function (e) {
      var k = e.key, v = null;
      if (k === "ArrowRight" || k === "ArrowUp") v = value + 5;
      else if (k === "ArrowLeft" || k === "ArrowDown") v = value - 5;
      else if (k === "PageUp") v = value + 20;
      else if (k === "PageDown") v = value - 20;
      else if (k === "Home") v = 0;
      else if (k === "End") v = 100;
      if (v !== null) { e.preventDefault(); cancelAnimationFrame(tween); setValue(Math.round(v)); }
    });
  }

  /* mode de départ : ?mode=frais / ?mode=chaud, sinon selon la saison */
  var q = (location.search.match(/[?&]mode=(chaud|frais)/) || [])[1];
  var mois = new Date().getMonth();                       // 0 = janvier
  var depart = q ? q : (mois >= 4 && mois <= 8 ? "frais" : "chaud");
  var cibleDepart = depart === "chaud" ? 75 : 25;
  if (reduce || !dial) setValue(cibleDepart);
  else {
    setValue(depart === "chaud" ? 50 : 49.9);                  // part du milieu…
    setTimeout(function () { if (value === 50 || value === 49.9) tweenTo(cibleDepart, 1100); }, 450);   // …et tourne
  }
  root.classList.add("thermo-ready");

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeRolls);
  window.addEventListener("resize", sizeRolls);
  window.addEventListener("load", sizeRolls);

  /* ---------- 8. Ventilateur de l'unité extérieure (vitesse = position de la molette) ---------- */
  var fan = $("[data-fan]"), scene = $(".scene");
  if (fan && scene && !reduce) {
    var fa = 0, fv = 0, last = 0, running = false;
    var loop = function (t) {
      if (!running) return;
      var dt = last ? Math.min((t - last) / 1000, 0.05) : 0; last = t;
      var cible = 110 + amt * 620;                         // degrés par seconde
      fv += (cible - fv) * Math.min(dt * 2.5, 1);
      fa = (fa + fv * dt) % 360;
      fan.setAttribute("transform", "rotate(" + fa.toFixed(1) + " 600 284)");
      requestAnimationFrame(loop);
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; last = 0; requestAnimationFrame(loop); }
        if (!vis) running = false;
      }).observe(scene);
    } else { running = true; requestAnimationFrame(loop); }
  }

  window.THERMO = { set: setValue, mode: function () { return mode; }, value: function () { return value; } };
})();
