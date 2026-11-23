
(function () {

  var NAV = [
    ["Gallery", "index"],
    ["About", "about"],
    // ["Contact", "contact"]
    // ["Works", "works"],
    // ["Commissions", "commissions"]
  ];

  var NOTE = "Commissions: open";         


  var SOCIALS = [
    ["instagram", "Instagram", "https://www.instagram.com/cyncl.art"],
    ["x",         "Twitter",   "https://x.com/Cyncl_art"],
    ["youtube",   "YouTube",   "https://www.youtube.com/@SoCyncl"],
    ["email",     "Email",     "mailto:cyncl.art@gmail.com"],
    ["tiktok",    "TikTok",    "https://www.tiktok.com/@cyncl.art"]
  ];
  var SOCIALS_FOOTER = SOCIALS;             

  var COPYRIGHT = "Cyncl.Art | All artwork is mine; please ask before reposting.";   

  var ICON = "/images/icon.png";             
  var BANNER = "/images/banner.png";         
  var BANNER_ALT = "Cyncl.Art";             
  var TO_TOP = "/images/to-top.png";         
  var TO_TOP_HOVER = "/images/to-top-hover.png";   


  var CLEAN_URL_HOSTS = ["cyncl.art"];
  // ======================================================

  var clean = CLEAN_URL_HOSTS.indexOf(location.hostname) !== -1 || /\.github\.io$/.test(location.hostname);

  function href(page) {
    if (page === "index") return location.protocol === "file:" ? "index.html" : "./";
    return page + (clean ? "" : ".html");
  }

  var seg = location.pathname.replace(/\/+$/, "").split("/").pop().replace(/\.html$/, "");
  var current = seg === "" || seg === "index" ? "index" : seg;

  function socialList(list, kind) {
    return '<ul class="socials ' + kind + '">' + list.map(function (s) {
      var rel = s[2].indexOf("mailto:") === 0 ? "" : ' rel="me noopener"';
      return '<li><a class="social" data-icon="' + s[0] + '" href="' + s[2] + '"' + rel + '><span>' + s[1] + '</span></a></li>';
    }).join("") + "</ul>";
  }

  var nav = NAV.map(function (n) {
    return '<a href="' + href(n[1]) + '"' + (n[1] === current ? ' aria-current="page"' : "") + ">" + n[0] + "</a>";
  }).join("");

  var top =
    '<div class="top-bar">' +
      (NOTE ? '<p class="top-note">' + NOTE + "</p>" : "<span></span>") +
      socialList(SOCIALS, "icons-only") +
    "</div>" +
    '<header class="site-header">' +
      '<a class="brand" href="' + href("index") + '">' +
        '<img class="logo" src="' + ICON + '" alt="" width="400" height="400">' +
        '<img class="banner" src="' + BANNER + '" alt="' + BANNER_ALT + '" width="1000" height="500">' +
      "</a>" +
      "<nav>" + nav + "</nav>" +
    "</header>";

  var bottom =
    '<footer class="site-footer">' +
      socialList(SOCIALS_FOOTER, "with-labels") +
      "<p>&copy; " + new Date().getFullYear() + " " + COPYRIGHT + "</p>" +
    "</footer>" +
    '<button class="to-top" type="button" aria-label="Back to top">' +
      '<img class="normal" src="' + TO_TOP + '" alt="" width="600" height="600">' +
      '<img class="hover" src="' + TO_TOP_HOVER + '" alt="" width="600" height="600">' +
    "</button>";


  var me = document.currentScript;
  if (me) me.insertAdjacentHTML("beforebegin", top);
  else document.body.insertAdjacentHTML("afterbegin", top);

  function addBottom() { document.body.insertAdjacentHTML("beforeend", bottom); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBottom);
  else addBottom();
})();
