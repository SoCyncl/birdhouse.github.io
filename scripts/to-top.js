// Back-to-top button: appears once you've scrolled past the banner, scrolls smoothly to the top when clicked.
(function () {
  function init() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    var banner = document.querySelector(".site-header .banner") || document.querySelector(".site-header");

    function set(on) { btn.classList.toggle("visible", on); }

    if (banner && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        set(!e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(banner);
    } else {
      window.addEventListener("scroll", function () {
        set(banner ? banner.getBoundingClientRect().bottom < 0 : window.scrollY > 300);
      }, { passive: true });
    }

    btn.addEventListener("click", function () {
      var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
    });
  }
  // wait for the page, because the button is added by scripts/layout.js
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
