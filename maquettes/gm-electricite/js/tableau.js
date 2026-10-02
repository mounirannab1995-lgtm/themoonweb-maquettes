/* =========================================================
   js/tableau.js — le tableau électrique interactif (+ les avis)
   ---------------------------------------------------------
   UN DISJONCTEUR = UNE PRESTATION.
   • etiquette : le mot court écrit sur le disjoncteur
   • titre / sousTitre / texte : ce qui s'affiche quand on l'enclenche
   • photos : identifiants des photos de la galerie
     (attribut data-photo="..." dans index.html). Liste vide [] = « Photo à fournir ».
   Les prestations viennent de son profil AlloVoisins (présentation + titres
   de ses photos). Les TEXTES ont été rédigés par themoonweb : À FAIRE VALIDER.
   Le premier disjoncteur de la liste est enclenché au chargement.
   ========================================================= */
var PRESTATIONS = [
  {
    etiquette: "Tableau",
    titre: "Tableau électrique",
    sousTitre: "Remplacement · réhabilitation · TGBT",
    texte: "Un tableau ancien, encombré ou qui disjoncte souvent ? Je le remplace ou je le remets à neuf : circuits identifiés, câblage rangé. Pour les locaux professionnels, je réalise aussi les tableaux généraux basse tension (TGBT).",
    photos: ["tableau-avant-apres", "tgbt"],
    icone: "tableau"
  },
  {
    etiquette: "Conformité",
    titre: "Mise en conformité",
    sousTitre: "Installations anciennes · mise aux normes",
    texte: "Installation ancienne, prises sans terre ou anomalies relevées lors d'un diagnostic ? Je réalise les travaux pour remettre votre installation électrique aux normes.",
    photos: ["tableau-avant-apres"],
    icone: "conformite"
  },
  {
    etiquette: "Neuf",
    titre: "Installation neuve",
    sousTitre: "Maison neuve · création d'appartement",
    texte: "Pour une construction ou la création d'un logement, je réalise l'installation électrique complète : passage des gaines, prises, points lumineux et tableau.",
    photos: ["maison-neuve", "creation-appartement"],
    icone: "neuf"
  },
  {
    etiquette: "Rénovation",
    titre: "Rénovation",
    sousTitre: "Transformation · réaménagement",
    texte: "Vous transformez une pièce ou réaménagez un garage ? Je reprends ou je crée l'installation électrique adaptée au nouvel usage des lieux.",
    photos: ["garage-suite-parentale"],
    icone: "renovation"
  },
  {
    etiquette: "Éclairage",
    titre: "Éclairage",
    sousTitre: "Création d'éclairage · automatisation",
    texte: "Éclairage intérieur ou extérieur, pour une maison comme pour un commerce : je crée l'éclairage et je peux automatiser son allumage.",
    photos: ["station-service-eclairage", "eclairage-automatisation"],
    icone: "eclairage"
  },
  {
    etiquette: "Visiophone",
    titre: "Visiophone",
    sousTitre: "Voir qui sonne avant d'ouvrir",
    texte: "Installation de visiophone à l'entrée d'une maison ou d'un local professionnel : vous voyez qui sonne avant d'ouvrir.",
    photos: ["visiophone"],
    icone: "visiophone"
  },
  {
    etiquette: "Caméras",
    titre: "Caméras de surveillance",
    sousTitre: "Vidéosurveillance",
    texte: "Pose de caméras de surveillance pour une maison, un local ou un commerce.",
    photos: ["camera-unifi"],
    icone: "cameras"
  },
  {
    etiquette: "Pros",
    titre: "Locaux professionnels",
    sousTitre: "Entreprises · commerces · station-service",
    texte: "Bureaux, entrepôts, commerces : installation électrique et éclairage de locaux professionnels, jusqu'au tableau général basse tension.",
    photos: ["locaux-entreprise", "eclairage-automatisation"],
    icone: "pros"
  }
];

/* ---------- Rien à modifier en dessous ---------- */
(function () {
  "use strict";
  var S = window.SITE || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ICONS = {
    tableau: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7v5M12 7v5M16 7v5M7.5 16.5h9"/>',
    conformite: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    neuf: '<path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
    renovation: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8V20h3.2l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.3-.7-.7-2.3z"/>',
    eclairage: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.5 1.1-2.1A6 6 0 0 0 12 3z"/>',
    visiophone: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><circle cx="12" cy="8.5" r="2.6"/><path d="M9.5 15h5M10.5 18h3"/>',
    cameras: '<path d="M2.5 9.5L15 5.5l2 5.6-12.5 4z"/><path d="M8.2 13.6V19H4"/><path d="M17.4 8.2l3.6-1.1v4.8l-2.9.9"/>',
    pros: '<path d="M4 21V3h10v18"/><path d="M14 9h6v12h-6"/><path d="M7 7h4M7 11h4M7 15h4M2.5 21h19"/>'
  };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ================= 1. Le tableau ================= */
  var board = document.querySelector("[data-board]");
  var row = board && board.querySelector(".breakers");
  var circuit = document.getElementById("circuit");
  if (board && row && circuit && PRESTATIONS.length) {
    board.classList.add("is-ready");
    var cNum = circuit.querySelector("[data-c-num]"), cKick = circuit.querySelector("[data-c-kicker]");
    var cTitle = circuit.querySelector("[data-c-title]"), cText = circuit.querySelector("[data-c-text]");
    var cPhotos = circuit.querySelector("[data-c-photos]"), live = document.getElementById("circuit-live");
    var svg = board.querySelector(".wires");
    var pBase = svg.querySelector(".w-base"), pLive = svg.querySelector(".w-live"), pFlow = svg.querySelector(".w-flow");
    var btns = [], current = -1;

    PRESTATIONS.forEach(function (p, i) {
      var n = pad(i + 1);
      var et = p.etiquette, ti = p.titre;
      var name = ti.toLowerCase().indexOf(et.toLowerCase()) > -1 ? ti : et + " : " + ti.charAt(0).toLowerCase() + ti.slice(1);
      var b = document.createElement("button");
      b.type = "button"; b.className = "bk"; b.id = "bk-" + n;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-controls", "circuit");
      b.setAttribute("aria-label", name);
      b.innerHTML =
        '<span class="bk-tag">' + esc(et) + "</span>" +
        '<span class="bk-body" aria-hidden="true">' +
          '<span class="bk-screw"></span>' +
          '<span class="bk-top"><span class="bk-num">' + n + '</span><span class="bk-led"></span></span>' +
          '<span class="bk-track"><span class="bk-lever"></span></span>' +
          '<span class="bk-marks"><i>I</i><i>O</i></span>' +
          '<span class="bk-ico"><svg viewBox="0 0 24 24" focusable="false">' + (ICONS[p.icone] || ICONS.tableau) + "</svg></span>" +
          '<span class="bk-screw bk-screw-b"></span>' +
        "</span>";
      b.addEventListener("click", function () { activate(i, true); });
      b.addEventListener("keydown", function (e) {
        var k = null;
        if (e.key === "ArrowRight") k = (i + 1) % btns.length;
        if (e.key === "ArrowLeft") k = (i - 1 + btns.length) % btns.length;
        if (e.key === "Home") k = 0;
        if (e.key === "End") k = btns.length - 1;
        if (k !== null) { e.preventDefault(); btns[k].focus(); }
      });
      var slot = document.createElement("div");
      slot.className = "bk-slot";
      slot.appendChild(b);
      row.appendChild(slot);
      btns.push(b);
    });

    var photoFigure = function (id) {
      var fig = document.createElement("figure");
      fig.className = "c-photo";
      var src = document.querySelector('[data-lb][data-photo="' + id + '"]');
      if (!src) { fig.innerHTML = '<div class="ph-todo"><span>Photo à fournir</span></div>'; return fig; }
      var cap = src.getAttribute("data-caption") || "";
      var a = document.createElement("a");
      a.className = "c-photo-link";
      a.href = src.getAttribute("href");
      a.setAttribute("aria-label", "Agrandir la photo : " + cap);
      var pic = src.querySelector("picture").cloneNode(true);
      pic.querySelectorAll("source, img").forEach(function (x) { x.setAttribute("sizes", "(min-width: 1024px) 26vw, 46vw"); });
      var im = pic.querySelector("img");
      im.loading = "eager";
      a.appendChild(pic);
      a.insertAdjacentHTML("beforeend", '<span class="c-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span>');
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (window.FX && window.FX.openLightbox) window.FX.openLightbox(id, a);
      });
      fig.appendChild(a);
      var fc = document.createElement("figcaption");
      fc.textContent = cap;
      fig.appendChild(fc);
      return fig;
    };

    var render = function (p, n) {
      cNum.textContent = "Circuit " + n;
      cKick.textContent = p.sousTitre || "";
      cTitle.textContent = p.titre;
      cText.textContent = p.texte;
      cPhotos.innerHTML = "";
      var ph = (p.photos && p.photos.length) ? p.photos : [""];
      ph.forEach(function (id) { cPhotos.appendChild(photoFigure(id)); });
      cPhotos.setAttribute("data-n", ph.length);
    };

    var activate = function (i, fromUser) {
      var b = btns[i];
      if (i === current) {
        b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
        return;
      }
      btns.forEach(function (x, k) { x.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      current = i;
      board.setAttribute("data-active", pad(i + 1));
      var p = PRESTATIONS[i], n = pad(i + 1);
      if (fromUser && !reduce) {
        circuit.classList.add("is-switching");
        setTimeout(function () { render(p, n); circuit.classList.remove("is-switching"); drawWires(false); }, 170);
      } else render(p, n);
      if (live && fromUser) live.textContent = "Circuit " + n + " enclenché : " + p.titre;
      drawWires(fromUser && !reduce);
    };

    /* --- Les fils : du disjoncteur enclenché jusqu'à l'écran de la prestation --- */
    var centre = function (el, ref) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - ref.left, y: r.top + r.height / 2 - ref.top, r: r };
    };
    var drawWires = function (animate) {
      if (current < 0) return;
      var ref = board.getBoundingClientRect();
      var cof = board.querySelector(".coffret").getBoundingClientRect();
      var term = centre(circuit.querySelector(".c-terminal"), ref);
      var yBus = cof.bottom - ref.top + Math.max(10, Math.min(26, (term.y - (cof.bottom - ref.top)) / 2));
      svg.setAttribute("viewBox", "0 0 " + Math.round(ref.width) + " " + Math.round(ref.height));

      /* rangées : les disjoncteurs de la dernière rangée descendent tout droit */
      var pts = btns.map(function (b) { return centre(b.querySelector(".bk-screw-b"), ref); });
      var lastTop = Math.max.apply(null, btns.map(function (b) { return Math.round(b.getBoundingClientRect().top); }));
      var base = "", xs = [];
      btns.forEach(function (b, k) {
        if (Math.round(b.getBoundingClientRect().top) === lastTop) {
          base += "M" + pts[k].x.toFixed(1) + " " + pts[k].y.toFixed(1) + "V" + yBus.toFixed(1);
          xs.push(pts[k].x);
        }
      });
      xs.push(term.x);
      base += "M" + Math.min.apply(null, xs).toFixed(1) + " " + yBus.toFixed(1) + "H" + Math.max.apply(null, xs).toFixed(1);
      base += "M" + term.x.toFixed(1) + " " + yBus.toFixed(1) + "V" + term.y.toFixed(1);
      pBase.setAttribute("d", base);

      /* fil actif */
      var b = btns[current], p0 = pts[current], d = "M" + p0.x.toFixed(1) + " " + p0.y.toFixed(1);
      var bTop = Math.round(b.getBoundingClientRect().top);
      if (bTop !== lastTop) {
        /* rangée du haut : on passe entre deux disjoncteurs de la rangée du bas */
        var br = b.getBoundingClientRect(), below = null;
        btns.forEach(function (x) {
          var r = x.getBoundingClientRect();
          if (Math.round(r.top) === lastTop && Math.abs(r.left - br.left) < 2) below = r;
        });
        var gapY = below ? (below.top - ref.top - 7) : (p0.y + 14);
        var gx = (br.left - ref.left) - 3.5;
        if (gx < cof.left - ref.left + 14) gx = (br.right - ref.left) + 3.5;
        d += "V" + gapY.toFixed(1) + "H" + gx.toFixed(1) + "V" + yBus.toFixed(1);
      } else {
        d += "V" + yBus.toFixed(1);
      }
      d += "H" + term.x.toFixed(1) + "V" + term.y.toFixed(1);
      /* même tracé qu'avant (simple redimensionnement) : on ne coupe pas l'animation en cours */
      if (!animate && d === pLive.getAttribute("d")) return;
      pLive.setAttribute("d", d);
      pFlow.setAttribute("d", d);

      if (animate && pLive.getTotalLength) {
        var L = pLive.getTotalLength();
        pLive.style.transition = "none";
        pLive.style.strokeDasharray = L + " " + L;
        pLive.style.strokeDashoffset = L;
        pFlow.style.opacity = "0";
        void pLive.getBoundingClientRect();
        pLive.style.transition = "stroke-dashoffset .6s cubic-bezier(.6,0,.2,1)";
        pLive.style.strokeDashoffset = "0";
        clearTimeout(drawWires.t);
        drawWires.t = setTimeout(function () { pFlow.style.opacity = ""; }, 560);
      } else {
        pLive.style.transition = "none";
        pLive.style.strokeDasharray = "none";
        pLive.style.strokeDashoffset = "0";
        pFlow.style.opacity = "";
      }
    };

    activate(0, false);
    var redraw = function () { drawWires(false); };
    window.addEventListener("resize", redraw);
    if ("ResizeObserver" in window) new ResizeObserver(redraw).observe(board);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    window.addEventListener("load", redraw);
    window.GMBoard = { activate: function (i) { activate(i, true); }, redraw: redraw };
  }

  /* ================= 2. Avis + compteurs ================= */
  var avis = S.avis || [];
  var feat = document.getElementById("avis-vedette"), list = document.getElementById("avis-list");
  var hasFeat = false;
  avis.forEach(function (a) {
    var meta = '<span class="rv-who">' + esc(a.auteur) + "</span>" +
      '<span class="rv-when">' + esc(a.prestation ? a.prestation + " · " : "") + esc(a.date) + " · avis AlloVoisins</span>";
    if (a.vedette && feat && !hasFeat) {
      hasFeat = true;
      feat.innerHTML =
        '<p class="rv-hook">« ' + esc(a.accroche) + "</p>" +
        '<p class="rv-rest">' + esc(a.texte) + " »</p>" +
        '<p class="rv-meta">' + meta + "</p>";
      return;
    }
    if (!list) return;
    var art = document.createElement("article");
    art.className = "rv";
    art.setAttribute("data-reveal", "");
    art.innerHTML =
      '<p class="rv-txt">« ' + esc(a.texte) + " »</p>" +
      (a.compliment ? '<p class="rv-tag">Compliment reçu : ' + esc(a.compliment) + "</p>" : "") +
      '<p class="rv-meta">' + meta + "</p>";
    list.appendChild(art);
  });
  if (feat && !hasFeat) feat.hidden = true;
  if (list && !list.children.length) list.hidden = true;

  document.querySelectorAll("[data-count-from]").forEach(function (el) {
    var v = S[el.getAttribute("data-count-from")];
    if (v != null && v !== "") { el.setAttribute("data-count", v); el.textContent = v; }
  });

  /* ================= 3. Communes (si renseignées) ================= */
  var ul = document.getElementById("communes-list");
  if (ul && S.communes && S.communes.length) {
    ul.innerHTML = S.communes.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
  }
})();
