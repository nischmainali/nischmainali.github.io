/*
 * The index card's small behaviours. Navigation itself is ordinary links
 * between static pages; this remembers the sections the reader left open on
 * the home page, folds the card on a phone, marks an opened note's current
 * section and keeps it in view inside the card, moves through the card by
 * arrow keys, and lets Escape close a paper.
 */
(function () {
  "use strict";

  var slip = document.querySelector(".index-slip");
  if (!slip) return;
  var state = slip.getAttribute("data-index-state");
  var card = slip.querySelector(".slip-card");
  var inner = slip.querySelector(".slip-card__inner");

  function store(key, value) {
    try { sessionStorage.setItem(key, value); } catch (error) {}
  }

  if (slip.hasAttribute("data-index-remember")) {
    slip.querySelectorAll("[data-slip-section]").forEach(function (section) {
      section.addEventListener("toggle", function () {
        var saved = {};
        slip.querySelectorAll("[data-slip-section]").forEach(function (each) {
          saved[each.getAttribute("data-slip-section")] = each.open;
        });
        store("index-sections", JSON.stringify(saved));
      });
    });
  }

  var fold = slip.querySelector("[data-slip-fold]");
  if (fold && card) {
    fold.addEventListener("click", function () {
      var folded = card.classList.toggle("is-folded");
      fold.setAttribute("aria-expanded", String(!folded));
      fold.querySelector(".visually-hidden").textContent = folded ? "Unfold the index" : "Fold the index";
    });
  }

  /* An opened note lists its sections beneath its row. Mark the one being
   * read, from heading positions measured once and again only on resize, and
   * keep it in view inside the card. */
  var links = Array.prototype.slice.call(slip.querySelectorAll("[data-slip-section-link]"));
  var sections = links.map(function (link) {
    var heading = document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)));
    return heading ? { link: link, heading: heading, top: 0 } : null;
  }).filter(Boolean);
  if (sections.length) {
    var frame = 0;
    var current = null;
    var measure = function () {
      sections.forEach(function (section) {
        section.top = section.heading.getBoundingClientRect().top + window.scrollY;
      });
    };
    var mark = function () {
      frame = 0;
      var line = window.scrollY + Math.min(window.innerHeight * 0.3, 240);
      var next = null;
      sections.forEach(function (section) { if (section.top <= line) next = section; });
      if (next === current) return;
      if (current) current.link.removeAttribute("aria-current");
      current = next;
      if (!current) return;
      current.link.setAttribute("aria-current", "location");
      if (inner && inner.scrollHeight > inner.clientHeight) {
        var box = inner.getBoundingClientRect();
        var row = current.link.getBoundingClientRect();
        if (row.top < box.top + 24) inner.scrollTop += row.top - box.top - 24;
        else if (row.bottom > box.bottom - 24) inner.scrollTop += row.bottom - box.bottom + 24;
      }
    };
    var schedule = function () { if (!frame) frame = window.requestAnimationFrame(mark); };
    /* The first measurement waits for the first frame, so it reads the layout
     * the browser makes for painting instead of forcing an early one that the
     * page's other scripts would undo. */
    window.requestAnimationFrame(function () { measure(); mark(); });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { measure(); schedule(); });
    window.addEventListener("load", function () { measure(); schedule(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); schedule(); });
  }

  /* Arrow keys move through the card, as on the reference: up and down to the
   * previous or next control that is showing, Home and End to its ends. Tab
   * still moves through the page as usual. The ink's colour bar is one stop,
   * its chosen patch; Left, Right, Home and End belong to the bar. */
  if (card) {
    card.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      var stops = Array.prototype.filter.call(card.querySelectorAll("a[href], summary, button"), function (stop) {
        if (stop.getAttribute("role") === "radio" && stop.tabIndex < 0) return false;
        if (card.classList.contains("is-folded") && stop.closest(".slip-card__body")) return false;
        return stop.getClientRects().length > 0 && !stop.closest("details:not([open]) > :not(summary)");
      });
      var at = stops.indexOf(document.activeElement);
      if (at === -1) return;
      var next = key === "Home" ? 0 : key === "End" ? stops.length - 1 :
        Math.min(stops.length - 1, Math.max(0, at + (key === "ArrowDown" ? 1 : -1)));
      event.preventDefault();
      stops[next].focus();
    });
  }

  /* Escape closes a paper, as the reference closes a node, unless the reader
   * is typing. */
  if (state === "paper") {
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      var target = event.target;
      if (target && target.closest && target.closest("input, textarea, select, [contenteditable], dialog")) return;
      location.href = "/";
    });
  }
}());
