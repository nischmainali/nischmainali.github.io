/*
 * The index card's small behaviours. Navigation itself is ordinary links
 * between static pages; this remembers the sections the reader left open on
 * the home page, folds the card on a phone, marks an opened note's current section
 * and keeps it in view inside the card, and lets Escape close a paper.
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
    measure();
    mark();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { measure(); schedule(); });
    window.addEventListener("load", function () { measure(); schedule(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); schedule(); });
  }

  /* Escape closes a paper, as the reference closes a node, unless the reader
   * is typing or working a control. */
  if (state === "paper") {
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      var target = event.target;
      if (target && target.closest && target.closest("input, textarea, select, [contenteditable], dialog, .ink-register")) return;
      location.href = "/";
    });
  }
}());
