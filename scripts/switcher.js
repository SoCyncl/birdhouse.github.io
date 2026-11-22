// Tabs and filter buttons. No URL changes.
// A button with data-show="sketches" shows every element that has data-group="sketches"
// and hides the other groups. data-show="all" shows everything.
// An element can be in several groups: data-group="manga other".
document.querySelectorAll(".switcher").forEach(function (bar) {
  var buttons = Array.from(bar.querySelectorAll("button[data-show]"));
  var items = Array.from(document.querySelectorAll("[data-group]"));

  function show(name) {
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.show === name); });
    items.forEach(function (item) {
      item.hidden = !(name === "all" || item.dataset.group.split(" ").indexOf(name) !== -1);
    });
  }

  buttons.forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.show); }); });
  var start = buttons.find(function (b) { return b.getAttribute("aria-pressed") === "true"; }) || buttons[0];
  if (start) show(start.dataset.show);
});
