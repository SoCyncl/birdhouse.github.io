// Click any <img class="art"> (on any page, anywhere in the HTML) to view it large.
// Arrow keys / swipe move between the art that is currently visible on the page. Esc closes.
(function () {
  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Image viewer");
  dlg.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous">&#8249;</button>' +
    '<button class="lb-next" type="button" aria-label="Next">&#8250;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector("img");
  var cap = dlg.querySelector("figcaption");
  var list = [], index = 0;

  function visibleArt() {
    return Array.from(document.querySelectorAll("img.art")).filter(function (a) { return !a.closest("[hidden]"); });
  }

  function show(n) {
    index = (n + list.length) % list.length;
    var a = list[index];
    img.src = a.dataset.full || a.currentSrc || a.src;
    img.alt = a.alt;
    var fig = a.closest("figure");
    var fc = fig && fig.querySelector("figcaption");
    if (fc) cap.replaceChildren.apply(cap, Array.from(fc.cloneNode(true).childNodes));
    else cap.textContent = a.alt;
    dlg.classList.toggle("single", list.length < 2);
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
