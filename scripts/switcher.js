
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
