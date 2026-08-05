(function () {
  "use strict";

  var disclosures = Array.prototype.slice.call(
    document.querySelectorAll("[data-paper-readout]")
  );
  if (!disclosures.length) return;

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var connectedLayout = window.matchMedia("(min-width: 90rem)");
  var active = null;
  var connectorFrame = 0;

  function layoutBox(element, ancestor) {
    var x = 0;
    var y = 0;
    var node = element;

    while (node && node !== ancestor) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }

    if (node === ancestor) {
      return {
        x: x,
        y: y,
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    }

    var elementRect = element.getBoundingClientRect();
    var ancestorRect = ancestor.getBoundingClientRect();
    return {
      x: elementRect.left - ancestorRect.left,
      y: elementRect.top - ancestorRect.top,
      width: elementRect.width,
      height: elementRect.height
    };
  }

  function pointOnOrbit(center, target, radius) {
    var dx = target.x - center.x;
    var dy = target.y - center.y;
    var length = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: center.x + dx / length * radius,
      y: center.y + dy / length * radius
    };
  }

  function pathPoint(point) {
    return point.x.toFixed(2) + " " + point.y.toFixed(2);
  }

  function pointInRail(point, railBox) {
    return {
      x: point.x - railBox.x,
      y: point.y - railBox.y
    };
  }

  function clearConnector(disclosure) {
    var panel = disclosure.querySelector(".paper-readout");
    var rails = disclosure.querySelector(".paper-readout__rails");
    var paths = disclosure.querySelectorAll(".paper-readout__rail");
    var junctions = disclosure.querySelectorAll(".paper-readout__junction");

    if (panel) panel.style.removeProperty("--readout-panel-top");
    if (rails) {
      rails.style.removeProperty("left");
      rails.style.removeProperty("top");
      rails.style.removeProperty("width");
      rails.style.removeProperty("height");
      rails.removeAttribute("viewBox");
    }
    paths.forEach(function (path) {
      path.removeAttribute("d");
    });
    junctions.forEach(function (junction) {
      junction.removeAttribute("cx");
      junction.removeAttribute("cy");
    });
    disclosure.setAttribute("data-readout-connector", "none");
    disclosure.setAttribute("data-readout-route", "under");
  }

  function updateConnector(disclosure) {
    if (!disclosure.open) return;

    var item = itemFor(disclosure);
    var signal = disclosure.querySelector(".publication-inspect__signal");
    var panel = disclosure.querySelector(".paper-readout");
    var upper = disclosure.querySelector(".paper-readout__rail--upper");
    var lower = disclosure.querySelector(".paper-readout__rail--lower");
    var upperJunction = disclosure.querySelector(".paper-readout__junction--upper");
    var lowerJunction = disclosure.querySelector(".paper-readout__junction--lower");
    var rails = disclosure.querySelector(".paper-readout__rails");
    if (
      !item ||
      !signal ||
      !panel ||
      !rails ||
      !upper ||
      !lower ||
      !upperJunction ||
      !lowerJunction
    ) return;

    if (!connectedLayout.matches) {
      clearConnector(disclosure);
      return;
    }

    var signalBox = layoutBox(signal, item);
    var panelWidth = panel.offsetWidth;
    var panelHeight = panel.offsetHeight;
    if (!signalBox.width || !panelWidth || !panelHeight) return;

    var center = {
      x: signalBox.x + signalBox.width / 2,
      y: signalBox.y + signalBox.height / 2
    };
    var panelTop = center.y - panelHeight / 2;
    var centeredTop = panelTop.toFixed(2) + "px";
    if (panel.style.getPropertyValue("--readout-panel-top") !== centeredTop) {
      panel.style.setProperty("--readout-panel-top", centeredTop);
    }

    // `top` was just written above. Re-reading offsetTop here can return the
    // fallback position for one frame in Chrome and Safari, leaving the rails
    // attached to an imaginary copy of the panel. Use the centered value as the
    // one source of truth and read only the unchanged horizontal position.
    var panelLeft = parseFloat(window.getComputedStyle(panel).left);
    if (!Number.isFinite(panelLeft)) return;

    var radius = Math.min(signalBox.width, signalBox.height) * 8.65 / 24;
    var panelBottom = panelTop + panelHeight;
    var upperTarget = { x: panelLeft, y: panelTop };
    var lowerTarget = { x: panelLeft, y: panelBottom };
    var upperSource = pointOnOrbit(center, upperTarget, radius);
    var lowerSource = pointOnOrbit(center, lowerTarget, radius);

    // Give the SVG a real canvas covering only the connector envelope. This
    // avoids relying on root-SVG overflow outside the publication row, whose
    // behavior differs at zoom and across browser engines.
    var railPadding = 2;
    var railBox = {
      x: Math.min(upperSource.x, lowerSource.x, panelLeft) - railPadding,
      y: Math.min(upperSource.y, lowerSource.y, panelTop) - railPadding
    };
    var railRight = Math.max(upperSource.x, lowerSource.x, panelLeft) + railPadding;
    var railBottom = Math.max(upperSource.y, lowerSource.y, panelBottom) + railPadding;
    railBox.width = railRight - railBox.x;
    railBox.height = railBottom - railBox.y;

    rails.style.left = railBox.x.toFixed(2) + "px";
    rails.style.top = railBox.y.toFixed(2) + "px";
    rails.style.width = railBox.width.toFixed(2) + "px";
    rails.style.height = railBox.height.toFixed(2) + "px";
    rails.setAttribute(
      "viewBox",
      "0 0 " + railBox.width.toFixed(2) + " " + railBox.height.toFixed(2)
    );

    var upperSourceLocal = pointInRail(upperSource, railBox);
    var lowerSourceLocal = pointInRail(lowerSource, railBox);
    var upperTargetLocal = pointInRail(upperTarget, railBox);
    var lowerTargetLocal = pointInRail(lowerTarget, railBox);

    upper.setAttribute(
      "d",
      "M " + pathPoint(upperSourceLocal) + " L " + pathPoint(upperTargetLocal)
    );
    lower.setAttribute(
      "d",
      "M " + pathPoint(lowerSourceLocal) + " L " + pathPoint(lowerTargetLocal)
    );
    upperJunction.setAttribute("cx", upperSourceLocal.x.toFixed(2));
    upperJunction.setAttribute("cy", upperSourceLocal.y.toFixed(2));
    lowerJunction.setAttribute("cx", lowerSourceLocal.x.toFixed(2));
    lowerJunction.setAttribute("cy", lowerSourceLocal.y.toFixed(2));
    disclosure.setAttribute("data-readout-route", "symmetric");
    disclosure.setAttribute("data-readout-connector", "left");
  }

  function queueConnectors() {
    if (connectorFrame) return;
    connectorFrame = window.requestAnimationFrame(function () {
      connectorFrame = 0;
      disclosures.forEach(updateConnector);
    });
  }

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
    queueConnectors();
  }) : null;

  var geometryObserver = "ResizeObserver" in window ? new ResizeObserver(function () {
    queueConnectors();
  }) : null;

  function itemFor(disclosure) {
    return disclosure.closest(".publication-item");
  }

  function setItemState(disclosure, isOpen) {
    var item = itemFor(disclosure);
    if (!item) return;
    item.toggleAttribute("data-readout-active", isOpen);
  }

  // A native disclosure hides its content the instant `open` flips, so the
  // retraction has nothing left to animate. Extension therefore keeps the shell
  // open and marks it closing until the drawer has travelled back behind the
  // row, then flips `open`. Projection needs none of this: it is thrown clear of
  // the page and simply leaves.
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function finishClose(disclosure, restoreFocus) {
    if (disclosure.retractTimer) {
      window.clearTimeout(disclosure.retractTimer);
      disclosure.retractTimer = 0;
    }
    disclosure.removeAttribute("data-readout-closing");
    clearConnector(disclosure);
    disclosure.open = false;
    setItemState(disclosure, false);
    if (active === disclosure) active = null;
    if (restoreFocus) {
      var summary = disclosure.querySelector("summary");
      if (summary) summary.focus({ preventScroll: true });
    }
  }

  // The aperture's own transition is the assembly's clock, so the retraction is
  // held open for exactly as long as the CSS says it takes. Reading it back
  // rather than repeating the number keeps the two from drifting apart.
  function retractDuration(disclosure) {
    var frame = disclosure.querySelector(".paper-readout-frame");
    if (!frame) return 0;
    var declared = (window.getComputedStyle(frame).transitionDuration || "0s").split(",")[0].trim();
    var amount = parseFloat(declared);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return /ms$/.test(declared) ? amount : amount * 1000;
  }

  function closeDisclosure(disclosure, restoreFocus) {
    if (!disclosure) return;
    if (disclosure.hasAttribute("data-readout-closing")) return;

    var docked = !connectedLayout.matches;
    var duration = docked && !reducedMotion.matches ? retractDuration(disclosure) : 0;
    if (!docked || duration <= 0) {
      finishClose(disclosure, restoreFocus);
      return;
    }

    disclosure.setAttribute("data-readout-closing", "");
    if (active === disclosure) active = null;
    disclosure.retractTimer = window.setTimeout(function () {
      finishClose(disclosure, restoreFocus);
    }, duration);
  }

  function syncDisclosure(disclosure) {
    var summary = disclosure.querySelector("summary");
    if (summary) {
      var label = disclosure.open ? summary.dataset.closeLabel : summary.dataset.openLabel;
      if (label) summary.setAttribute("aria-label", label);
      summary.setAttribute("aria-expanded", String(disclosure.open));
    }

    if (disclosure.open) {
      if (disclosure.retractTimer) {
        window.clearTimeout(disclosure.retractTimer);
        disclosure.retractTimer = 0;
      }
      disclosure.removeAttribute("data-readout-closing");
      if (active && active !== disclosure) closeDisclosure(active, false);
      active = disclosure;
      setItemState(disclosure, true);
      updateConnector(disclosure);
      queueConnectors();
      return;
    }

    clearConnector(disclosure);
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
    if (geometryObserver) {
      geometryObserver.observe(item);
      geometryObserver.observe(disclosure.querySelector(".paper-readout"));
    }

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

  window.addEventListener("resize", queueConnectors, { passive: true });
  if (connectedLayout.addEventListener) {
    connectedLayout.addEventListener("change", queueConnectors);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(queueConnectors);
  }

  window.addEventListener("pagehide", function () {
    if (rowObserver) rowObserver.disconnect();
    if (geometryObserver) geometryObserver.disconnect();
    if (connectedLayout.removeEventListener) {
      connectedLayout.removeEventListener("change", queueConnectors);
    }
    if (connectorFrame) window.cancelAnimationFrame(connectorFrame);
  }, { once: true });
}());
