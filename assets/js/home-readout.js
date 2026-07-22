(function () {
  "use strict";

  var disclosures = Array.prototype.slice.call(
    document.querySelectorAll("[data-paper-readout]")
  );
  if (!disclosures.length) return;

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var OPEN_DELAY = 45;
  var CLOSE_DELAY = 90;
  var active = null;
  var pinned = null;
  var pendingOpen = null;
  var openTimer = 0;
  var closeTimer = 0;
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

  function clearTimers() {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    pendingOpen = null;
    openTimer = 0;
    closeTimer = 0;
  }

  function setItemState(disclosure, state) {
    var item = itemFor(disclosure);
    if (!item) return;
    if (state) {
      item.dataset.readoutActive = state;
      disclosure.dataset.readoutState = state;
    } else {
      delete item.dataset.readoutActive;
      delete disclosure.dataset.readoutState;
    }
  }

  function close(disclosure) {
    if (!disclosure) return;
    disclosure.open = false;
    setItemState(disclosure, "");
    if (active === disclosure) active = null;
    if (pinned === disclosure) pinned = null;
  }

  function open(disclosure, state) {
    clearTimers();
    if (state === "transient" && pinned) return;
    if (active && active !== disclosure) close(active);
    disclosure.open = true;
    active = disclosure;
    if (state === "pinned") pinned = disclosure;
    setItemState(disclosure, state);
  }

  function scheduleTransientOpen(disclosure) {
    if (!finePointer.matches || pinned) return;
    window.clearTimeout(closeTimer);
    window.clearTimeout(openTimer);
    closeTimer = 0;
    pendingOpen = disclosure;
    openTimer = window.setTimeout(function () {
      var item = itemFor(disclosure);
      openTimer = 0;
      if (pendingOpen !== disclosure) return;
      pendingOpen = null;
      if (!item || pinned) return;
      if (!item.matches(":hover") && !item.contains(document.activeElement)) return;
      open(disclosure, "transient");
    }, OPEN_DELAY);
  }

  function scheduleTransientClose(disclosure) {
    if (pendingOpen === disclosure) {
      window.clearTimeout(openTimer);
      pendingOpen = null;
      openTimer = 0;
    }
    if (pinned || active !== disclosure) return;
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      var item = itemFor(disclosure);
      closeTimer = 0;
      if (!item || active !== disclosure || pinned) return;
      if (item.matches(":hover") || item.contains(document.activeElement)) return;
      close(disclosure);
    }, CLOSE_DELAY);
  }

  function togglePinned(disclosure) {
    if (pinned === disclosure) {
      close(disclosure);
    } else {
      open(disclosure, "pinned");
    }
  }

  disclosures.forEach(function (disclosure) {
    var item = itemFor(disclosure);
    var row = item && item.querySelector(".publication-row");
    var summary = disclosure.querySelector("summary");
    var closeButton = disclosure.querySelector("[data-paper-readout-close]");
    if (!item || !row || !summary || !closeButton) return;

    item.style.setProperty("--paper-row-height", row.getBoundingClientRect().height + "px");
    if (rowObserver) rowObserver.observe(row);

    item.addEventListener("pointerenter", function () {
      scheduleTransientOpen(disclosure);
    });

    item.addEventListener("pointerleave", function () {
      scheduleTransientClose(disclosure);
    });

    row.addEventListener("focus", function () {
      if (!pinned) open(disclosure, "transient");
    });

    item.addEventListener("focusout", function () {
      window.setTimeout(function () {
        if (!item.contains(document.activeElement)) {
          scheduleTransientClose(disclosure);
        }
      }, 0);
    });

    summary.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      event.preventDefault();
      summary.focus({ preventScroll: true });
      togglePinned(disclosure);
    });

    summary.addEventListener("click", function (event) {
      event.preventDefault();
      // Pointer input is handled before layout can move beneath it. A click
      // with no detail is keyboard or assistive-technology activation.
      if (event.detail === 0) togglePinned(disclosure);
    });

    summary.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      togglePinned(disclosure);
    });

    summary.addEventListener("keyup", function (event) {
      if (event.key === " ") event.preventDefault();
    });

    summary.addEventListener("focus", function () {
      if (!disclosure.open && !pinned) open(disclosure, "transient");
    });

    closeButton.addEventListener("click", function () {
      summary.focus();
      close(disclosure);
    });
  });

  document.addEventListener("pointerdown", function (event) {
    if (!pinned || itemFor(pinned).contains(event.target)) return;

    // Let another ledger control finish its click before the open note changes
    // the height of the list. Its click handler will switch notes atomically.
    if (event.target.closest(".publication-item")) return;
    close(pinned);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !active) return;
    var disclosure = active;
    var summary = disclosure.querySelector("summary");
    if (summary) summary.focus();
    close(disclosure);
  });

  window.addEventListener("pagehide", function () {
    clearTimers();
    if (rowObserver) rowObserver.disconnect();
  }, { once: true });
}());
