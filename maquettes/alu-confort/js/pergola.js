/* ==========================================================
   pergola.js — l'illustration de pergola bioclimatique (en haut du site)
   Le visiteur oriente les lames (curseur ou boutons Ouvert / Mi-ombre /
   Fermé) : les lames pivotent, la lumière et les ombres changent.
   C'est une ILLUSTRATION (dessin), pas une photo ni un produit précis.
   Rien à modifier ici, sauf les textes de la liste ETATS si besoin.
   ========================================================== */
(function () {
  "use strict";
  var scene = document.querySelector("[data-scene]");
  var svg = scene && scene.querySelector("svg");
  var range = document.getElementById("lames");
  if (!svg || !range) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var root = document.documentElement;

  /* Textes affichés selon l'ouverture (modifiables) */
  var ETATS = [
    { max: 15, court: "À l'ombre", long: "À l'ombre : les lames se rejoignent et forment une toiture." },
    { max: 84, court: "Lumière filtrée", long: "Mi-ombre : la lumière passe entre les lames, l'air circule." },
    { max: 100, court: "Plein soleil", long: "Plein soleil : les lames s'effacent, la lumière entre." }
  ];

  /* ---- Géométrie du dessin (unités du viewBox 1600 × 900) ---- */
  var Y = 520;            // hauteur de l'axe des lames
  var G = 780;            // niveau du sol de la terrasse
  var K = 0.30;           // inclinaison des rayons du soleil (dx / dy)
  var X0 = 590, X1 = 1240;// début / fin de la toiture à lames
  var WALL = 1262;        // façade de la maison
  var N = 11, C = 60, T = 10;   // nombre de lames, largeur, épaisseur
  var PITCH = (X1 - X0) / N;
  var AMAX = Math.atan2(1, K) * 180 / Math.PI;   // angle « grand ouvert » (lames dans l'axe du soleil)

  var gL = svg.querySelector("[data-lames]");
  var gB = svg.querySelector("[data-beams]");
  var gP = svg.querySelector("[data-patches]");
  var shade = svg.querySelectorAll("[data-shade]");
  var glow = svg.querySelector("[data-sunglow]");
  var rays = svg.querySelector("[data-rays]");
  var stops = {
    top: svg.querySelector("[data-sky='top']"),
    mid: svg.querySelector("[data-sky='mid']"),
    low: svg.querySelector("[data-sky='low']")
  };
  /* Cadrage du dessin : sur grand écran la pergola se place à droite
     (le texte occupe la gauche) ; sur téléphone on recadre sur la pergola. */
  var wide = window.matchMedia("(min-width: 1100px)");
  function frame() { svg.setAttribute("viewBox", wide.matches ? "-400 0 2000 900" : "480 230 960 650"); }
  frame();
  if (wide.addEventListener) wide.addEventListener("change", frame); else wide.addListener(frame);

  var presets = Array.prototype.slice.call(document.querySelectorAll("[data-preset]"));
  var stateTxt = document.querySelector("[data-state]");
  var stateBox = document.querySelector("[data-state-box]");

  /* Création des lames */
  var lames = [];
  for (var i = 0; i < N; i++) {
    var g = document.createElementNS(NS, "g");
    var r = document.createElementNS(NS, "rect");
    r.setAttribute("x", -C / 2); r.setAttribute("y", -T / 2);
    r.setAttribute("width", C); r.setAttribute("height", T); r.setAttribute("rx", T / 2);
    r.setAttribute("class", "lame");
    var hl = document.createElementNS(NS, "line");
    hl.setAttribute("x1", -C / 2 + 5); hl.setAttribute("x2", C / 2 - 5);
    hl.setAttribute("y1", -T / 2 + 2); hl.setAttribute("y2", -T / 2 + 2);
    hl.setAttribute("class", "lame-hl");
    g.appendChild(r); g.appendChild(hl); gL.appendChild(g);
    lames.push({ g: g, cx: X0 + PITCH * (i + 0.5) });
  }

  /* Couleurs du ciel : soleil -> ombre */
  var SKY = {
    top: ["#a8d4f0", "#c3d1dc"],
    mid: ["#dcedf7", "#e2e8ec"],
    low: ["#fff0d2", "#eeeeea"]
  };
  function hex(h) { return [1, 3, 5].map(function (k) { return parseInt(h.substr(k, 2), 16); }); }
  function mix(a, b, t) {
    var A = hex(a), B = hex(b);
    return "rgb(" + A.map(function (v, k) { return Math.round(v + (B[k] - v) * t); }).join(",") + ")";
  }

  function lit(f) {
    var a = f * AMAX, rad = a * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
    var sh = [];
    lames.forEach(function (L) {
      L.g.setAttribute("transform", "translate(" + L.cx.toFixed(2) + " " + Y + ") rotate(" + a.toFixed(2) + ")");
      var xs = [[-C / 2, -T / 2], [C / 2, -T / 2], [C / 2, T / 2], [-C / 2, T / 2]].map(function (p) {
        var x = L.cx + p[0] * c - p[1] * s, y = Y + p[0] * s + p[1] * c;
        return x + (G - y) * K;            // projection au sol, le long des rayons
      });
      sh.push([Math.min.apply(null, xs), Math.max.apply(null, xs)]);
    });
    sh.sort(function (p, q) { return p[0] - q[0]; });
    var a0 = X0 + (G - Y) * K, a1 = WALL, out = [], x = a0;
    sh.forEach(function (p) {
      if (p[0] > x) out.push([x, Math.min(p[0], a1)]);
      x = Math.max(x, p[1]);
    });
    if (x < a1) out.push([x, a1]);
    return out.filter(function (p) { return p[1] - p[0] > 0.6; });
  }

  function render(f) {
    var spans = lit(f), d = (G - Y) * K;
    gB.innerHTML = ""; gP.innerHTML = "";
    spans.forEach(function (p) {
      var poly = document.createElementNS(NS, "polygon");
      poly.setAttribute("points", [
        (p[0] - d).toFixed(1) + "," + Y, (p[1] - d).toFixed(1) + "," + Y,
        p[1].toFixed(1) + "," + G, p[0].toFixed(1) + "," + G
      ].join(" "));
      gB.appendChild(poly);
      var rc = document.createElementNS(NS, "rect");
      rc.setAttribute("x", p[0].toFixed(1)); rc.setAttribute("y", G - 5);
      rc.setAttribute("width", (p[1] - p[0]).toFixed(1)); rc.setAttribute("height", 12);
      rc.setAttribute("rx", 4);
      gP.appendChild(rc);
    });
    var sun = Math.pow(f, 0.8);
    stops.top.setAttribute("stop-color", mix(SKY.top[0], SKY.top[1], 1 - sun));
    stops.mid.setAttribute("stop-color", mix(SKY.mid[0], SKY.mid[1], 1 - sun));
    stops.low.setAttribute("stop-color", mix(SKY.low[0], SKY.low[1], 1 - sun));
    glow.setAttribute("opacity", (0.45 + 0.55 * sun).toFixed(3));
    rays.setAttribute("opacity", (0.15 + 0.85 * sun).toFixed(3));
    Array.prototype.forEach.call(shade, function (el) {
      el.setAttribute("opacity", ((1 - f) * parseFloat(el.getAttribute("data-shade"))).toFixed(3));
    });
    root.style.setProperty("--sun", sun.toFixed(3));
    root.style.setProperty("--sky-top", stops.top.getAttribute("stop-color"));
  }

  /* ---- Interface : curseur, boutons, textes ---- */
  var current = -1, lastState = "";
  function etat(v) { for (var k = 0; k < ETATS.length; k++) if (v <= ETATS[k].max) return ETATS[k]; return ETATS[ETATS.length - 1]; }
  function update(v, announce) {
    v = Math.max(0, Math.min(100, Math.round(v)));
    if (+range.value !== v) range.value = v;
    var e = etat(v);
    range.setAttribute("aria-valuetext", "Ouverture des lames : " + v + " %, " + e.court.toLowerCase());
    presets.forEach(function (b) { b.setAttribute("aria-pressed", String(Math.abs(+b.getAttribute("data-preset") - v) <= 2)); });
    if (stateTxt && (announce || e.long !== lastState)) { stateTxt.textContent = e.long; lastState = e.long; }
    if (stateBox) stateBox.setAttribute("data-mode", v <= 15 ? "ombre" : v >= 85 ? "soleil" : "filtre");
    var pct = scene.querySelector("[data-pct]"); if (pct) pct.textContent = v + " %";
    range.style.setProperty("--val", v + "%");
  }
  function set(v, announce) { current = v; render(v / 100); update(v, announce); }

  var anim = null;
  function tween(to, dur) {
    if (anim) cancelAnimationFrame(anim);
    var from = current < 0 ? to : current;
    if (reduce || dur === 0 || from === to) { set(to, true); return; }
    var t0 = null;
    anim = requestAnimationFrame(function loop(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      set(from + (to - from) * e, p === 1);
      if (p < 1) anim = requestAnimationFrame(loop); else anim = null;
    });
  }

  range.addEventListener("input", function () {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    set(+range.value, false);
  });
  range.addEventListener("change", function () { update(+range.value, true); });
  presets.forEach(function (b) {
    b.addEventListener("click", function () { tween(+b.getAttribute("data-preset"), 900); });
  });

  /* Au chargement : les lames s'ouvrent doucement jusqu'à « Mi-ombre » */
  var start = +range.value || 60;
  if (reduce) { set(start, false); }
  else {
    set(0, false);
    setTimeout(function () { if (current === 0) tween(start, 1800); }, 500);
  }
})();
