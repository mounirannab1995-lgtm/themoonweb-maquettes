/* =========================================================
   js/voiture.js — la voiture interactive
   Les textes des zones se modifient ci-dessous (ZONES).
   ========================================================= */
(function () {
  "use strict";
  var ZONES = {
    "carrosserie": {
      kicker: "Choc, bosse, portière enfoncée",
      titre: "Carrosserie",
      texte: "Après un accrochage ou un choc, on remet en forme les éléments de carrosserie abîmés pour que votre voiture retrouve sa ligne."
    },
    "peinture": {
      kicker: "Rayure, éclat, teinte passée",
      titre: "Peinture automobile",
      texte: "Une rayure à reprendre, un élément à repeindre ou la voiture entière : on vous conseille sur la teinte et la finition."
    },
    "pare-brise": {
      kicker: "Impact, fissure, pare-brise étoilé",
      titre: "Pare-brise",
      texte: "Vente, pose et réparation de pare-brise. Un impact peut s'étendre : mieux vaut le faire vérifier vite."
    },
    "toit": {
      kicker: "Toit ouvrant bloqué ou qui fuit",
      titre: "Toit ouvrant",
      texte: "Vente, pose et réparation de toits ouvrants."
    }
  };

  var kick = document.getElementById("zi-kicker"),
      title = document.getElementById("zi-title"),
      text = document.getElementById("zi-text"),
      info = document.querySelector(".zone-info");

  function select(z) {
    var d = ZONES[z]; if (!d) return;
    document.querySelectorAll(".hotspot, .zone-chips button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-zone") === z ? "true" : "false");
    });
    document.querySelectorAll(".car-diag .zone").forEach(function (p) {
      p.classList.toggle("on", p.getAttribute("data-zone") === z || (z === "peinture" && p.getAttribute("data-zone") === "carrosserie"));
    });
    if (info) { info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap"); }
    kick.textContent = d.kicker; title.textContent = d.titre; text.textContent = d.texte;
  }
  document.querySelectorAll(".hotspot, .zone-chips button").forEach(function (b) {
    b.addEventListener("click", function () { select(b.getAttribute("data-zone")); });
  });
  document.querySelectorAll(".car-diag .zone").forEach(function (p) {
    p.addEventListener("click", function () { select(p.getAttribute("data-zone")); });
  });
  select("carrosserie");

  /* Nuancier : change la teinte de la voiture du haut (illustration) */
  var car = document.querySelector(".hero-car");
  document.querySelectorAll(".sw").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".sw").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      car.style.setProperty("--paint", getComputedStyle(b).getPropertyValue("--c").trim());
      car.classList.remove("respray"); void car.offsetWidth; car.classList.add("respray");
    });
  });

  /* Comparateur avant / après */
  var stage = document.querySelector(".ba-stage"), range = document.getElementById("ba-range");
  if (stage && range) {
    var setPos = function (v) { stage.style.setProperty("--pos", v + "%"); };
    range.addEventListener("input", function () { setPos(range.value); });
    // petite démonstration automatique quand le bloc apparaît
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var done = false;
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) {
          if (!e.isIntersecting || done) return;
          done = true; o.disconnect();
          var t0 = null;
          (function step(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / 1800, 1);
            var v = 50 + 35 * Math.sin(p * Math.PI * 2) * (1 - p);
            range.value = v; setPos(v);
            if (p < 1) requestAnimationFrame(step); else { range.value = 50; setPos(50); }
          })(performance.now());
        });
      }, { threshold: .6 }).observe(stage);
    }
  }
})();
