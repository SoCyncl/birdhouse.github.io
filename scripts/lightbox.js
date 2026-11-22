// Click any <img class="art"> (on any page, anywhere in the HTML) to view it large.
// If the image has data-full="big-file.webp", the viewer shows that file instead of the small one in the grid.
// While the big file loads, the small one is shown right away; the next and previous images are
// loaded in the background so arrow-key browsing feels instant. Arrow keys / swipe move between the
// art currently visible on the page. Esc closes.
(function () {
  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Image viewer");
  dlg.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous">&#8249;</button>' +
    '<button class="lb-next" type="button" aria-label="Next">&#8250;</button>' +
    '<figure><img alt="" decoding="async"><figcaption></figcaption></figure>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector("img");
  var cap = dlg.querySelector("figcaption");
  var list = [], index = 0, seq = 0, asked = {};

  function fullOf(a) { return a.dataset.full || a.currentSrc || a.src; }

  function visibleArt() {
    return Array.from(document.querySelectorAll("img.art")).filter(function (a) { return !a.closest("[hidden]"); });
  }

  // Quietly download the big version of the neighbors so the next click is instant.
  function preload(a) {
    var src = fullOf(a);
    if (asked[src]) return;
    asked[src] = true;
    new Image().src = src;
  }
  function preloadNeighbors() {
    if (list.length < 2) return;
    preload(list[(index + 1) % list.length]);
    preload(list[(index - 1 + list.length) % list.length]);
  }

  function show(n) {
    index = (n + list.length) % list.length;
    var a = list[index];
    var mine = ++seq;
    var full = fullOf(a);
    var thumb = a.currentSrc || a.src;

    // Same box for the small and big version, so nothing jumps when the big one arrives.
    var ratio = a.naturalWidth && a.naturalHeight ? a.naturalWidth / a.naturalHeight
              : a.clientWidth && a.clientHeight ? a.clientWidth / a.clientHeight : 1.5;
    img.style.setProperty("--ratio", ratio);
    img.alt = a.alt;

    var fig = a.closest("figure");
    var fc = fig && fig.querySelector("figcaption");
    if (fc) cap.replaceChildren.apply(cap, Array.from(fc.cloneNode(true).childNodes));
    else cap.textContent = a.alt;
    dlg.classList.toggle("single", list.length < 2);

    function ready() {
      if (mine !== seq) return;            // you already moved on to another image
      img.src = full;
      img.classList.remove("loading");
      preloadNeighbors();
    }

    if (full === thumb) { ready(); return; }

    img.src = thumb;                       // already in the browser's cache from the grid
    img.classList.add("loading");
    var big = new Image();
    big.src = full;
    if (big.decode) {
      big.decode().then(ready, function () { if (mine === seq) img.classList.remove("loading"); });
    } else {
      big.onload = ready;
    }
  }

  function open(a) {
    list = visibleArt();
    show(list.indexOf(a));
    dlg.showModal();
  }

  document.querySelectorAll("img.art").forEach(function (a) {
    a.tabIndex = 0;
    a.addEventListener("keydown", function (e) { if (e.key === "Enter") open(a); });
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("img.art");
    if (a) { e.preventDefault(); open(a); }
  });

  dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
  dlg.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
  dlg.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.tagName === "FIGURE") dlg.close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  var x0 = null;
  dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
