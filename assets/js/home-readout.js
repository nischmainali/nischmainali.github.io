(function () {
  "use strict";

  var disclosures = Array.prototype.slice.call(
    document.querySelectorAll("[data-paper-readout]")
  );
  if (!disclosures.length) return;

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var active = null;
  var rowObserver = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      var item = entry.target.closest(".publication-item");
      var sizes = entry.borderBoxSize;
      var borderBox = sizes && typeof sizes.length === "number"
        ? sizes[0]
        : sizes;
      var blockSize = borderBox && borderBox.blockSize
        ? borderBox.blockSize
        : entry.target.getBoundingClientRect().height;
      if (item) item.style.setProperty("--paper-row-height", blockSize + "px");
    });
  }) : null;

  function itemFor(disclosure) {
    return disclosure.closest(".publication-item");
  }

  function setItemState(disclosure, isOpen) {
    var item = itemFor(disclosure);
    if (!item) return;
    item.toggleAttribute("data-readout-active", isOpen);
  }

  function closeDisclosure(disclosure, restoreFocus) {
    if (!disclosure) return;
    disclosure.open = false;
    setItemState(disclosure, false);
    if (active === disclosure) active = null;
    if (restoreFocus) {
      var summary = disclosure.querySelector("summary");
      if (summary) summary.focus({ preventScroll: true });
    }
  }

  function syncDisclosure(disclosure) {
    var summary = disclosure.querySelector("summary");
    if (summary) {
      var label = disclosure.open ? summary.dataset.closeLabel : summary.dataset.openLabel;
      if (label) summary.setAttribute("aria-label", label);
      summary.setAttribute("aria-expanded", String(disclosure.open));
    }

    if (disclosure.open) {
      if (active && active !== disclosure) closeDisclosure(active, false);
      active = disclosure;
      setItemState(disclosure, true);
      return;
    }

    setItemState(disclosure, false);
    if (active === disclosure) active = null;
  }

  disclosures.forEach(function (disclosure) {
    var item = itemFor(disclosure);
    var row = item && item.querySelector(".publication-row");
    var summary = disclosure.querySelector("summary");
    var closeButton = disclosure.querySelector("[data-paper-readout-close]");
    if (!item || !row || !summary || !closeButton) return;

    item.style.setProperty("--paper-row-height", row.getBoundingClientRect().height + "px");
    if (rowObserver) rowObserver.observe(row);

    disclosure.addEventListener("toggle", function () {
      syncDisclosure(disclosure);
    });

    summary.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      disclosure.open = !disclosure.open;
    });

    summary.addEventListener("keyup", function (event) {
      if (event.key === " ") event.preventDefault();
    });

    closeButton.addEventListener("click", function () {
      closeDisclosure(disclosure, true);
    });

    syncDisclosure(disclosure);
  });

  document.addEventListener("click", function (event) {
    if (!finePointer.matches || !active || active.contains(event.target)) return;
    if (event.target.closest(".publication-item")) return;
    closeDisclosure(active, false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !active) return;
    event.preventDefault();
    closeDisclosure(active, true);
  });

  window.addEventListener("pagehide", function () {
    if (rowObserver) rowObserver.disconnect();
  }, { once: true });
}());
