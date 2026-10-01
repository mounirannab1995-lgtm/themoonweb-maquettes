/* ==========================================================
   galerie.js — filtres de la galerie « Réalisations »,
   bouton « Voir plus », et aperçu photo au survol de la liste
   « Savoir-faire ». Rien à modifier ici : les photos se
   changent dans index.html (section « Réalisations »).
   ========================================================== */
(function () {
  "use strict";
  var grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.querySelectorAll("[data-cat]"));
  var btns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var more = document.querySelector("[data-more]");
  var countEl = document.querySelector("[data-gal-count]");
  var current = "tout", expanded = false;
  var small = window.matchMedia("(max-width: 759px)");

  function limit() { return small.matches ? 6 : 12; }
  function label(cat) {
    var b = btns.filter(function (x) { return x.getAttribute("data-filter") === cat; })[0];
    return b ? b.getAttribute("data-label") || b.textContent.trim() : "";
  }
  function apply(focusFrom) {
    var match = items.filter(function (it) { return current === "tout" || it.getAttribute("data-cat") === current; });
    var lim = expanded ? Infinity : limit();
    if (match.length - lim <= 2) lim = Infinity;   // pas de bouton pour 1 ou 2 photos cachées
    items.forEach(function (it) { it.hidden = true; });
    match.forEach(function (it, k) { it.hidden = k >= lim; });
    var rest = Math.max(0, match.length - lim);
    if (more) {
      more.hidden = rest === 0;
      var lab = more.querySelector("span");
      if (lab) lab.textContent = "Voir " + rest + " photo" + (rest > 1 ? "s" : "") + " de plus";
    }
    if (countEl) {
      countEl.textContent = match.length + " photo" + (match.length > 1 ? "s" : "") +
        (current === "tout" ? "" : " · " + label(current));
    }
    if (typeof focusFrom === "number" && match[focusFrom]) {
      var a = match[focusFrom].querySelector("a"); if (a) a.focus();
    }
  }
  function choose(cat) {
    current = cat; expanded = false;
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === cat)); });
    apply();
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function () { choose(b.getAttribute("data-filter")); });
  });
  if (more) more.addEventListener("click", function () {
    var first = limit(); expanded = true; apply(first);
  });
  small.addEventListener && small.addEventListener("change", function () { if (!expanded) apply(); });

  /* Liens de la liste « Savoir-faire » qui ouvrent la galerie filtrée */
  document.querySelectorAll("[data-goto]").forEach(function (a) {
    a.addEventListener("click", function () { choose(a.getAttribute("data-goto")); });
  });
  apply();

  /* ---- Aperçu photo qui suit la souris (ordinateur uniquement) ---- */
  var list = document.querySelector("[data-preview-list]");
  var fine = window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (list && fine) {
    var box = document.createElement("div");
    box.className = "preview"; box.setAttribute("aria-hidden", "true");
    var img = document.createElement("img"); img.alt = ""; img.decoding = "async";
    box.appendChild(img); document.body.appendChild(box);
    var tx = 0, ty = 0, x = 0, y = 0, on = false, raf = null;
    function loop() {
      x += (tx - x) * (reduce ? 1 : 0.16); y += (ty - y) * (reduce ? 1 : 0.16);
      box.style.transform = "translate3d(" + (x + 24) + "px," + (y - 90) + "px,0)";
      raf = on ? requestAnimationFrame(loop) : null;
    }
    list.querySelectorAll("[data-preview]").forEach(function (row) {
      row.addEventListener("pointerenter", function (e) {
        img.src = row.getAttribute("data-preview");
        tx = x = e.clientX; ty = y = e.clientY;
        on = true; box.classList.add("on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
      row.addEventListener("pointerleave", function () { on = false; box.classList.remove("on"); });
    });
    window.addEventListener("scroll", function () { if (on) { on = false; box.classList.remove("on"); } }, { passive: true });
  }
})();
