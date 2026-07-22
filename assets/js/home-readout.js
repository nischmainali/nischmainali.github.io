(function () {
  "use strict";

  var motionReview = new URLSearchParams(window.location.search).get("readout-motion");
  if (motionReview === "full") {
    document.documentElement.setAttribute("data-readout-motion", "full");
  }

  var disclosures = Array.prototype.slice.call(
    document.querySelectorAll("[data-paper-readout]")
  );
  if (!disclosures.length) return;

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
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

  function updateConnector(disclosure) {
    if (!disclosure.open) return;

    var item = itemFor(disclosure);
    var signal = disclosure.querySelector(".publication-inspect__signal");
    var panel = disclosure.querySelector(".paper-readout");
    var upper = disclosure.querySelector(".paper-readout__rail--upper");
    var lower = disclosure.querySelector(".paper-readout__rail--lower");
    if (!item || !signal || !panel || !upper || !lower) return;

    var signalBox = layoutBox(signal, item);
    var panelBox = layoutBox(panel, item);
    if (!signalBox.width || !panelBox.width || !panelBox.height) return;

    var center = {
      x: signalBox.x + signalBox.width / 2,
      y: signalBox.y + signalBox.height / 2
    };
    var radius = Math.min(signalBox.width, signalBox.height) * 8.65 / 24;
    var panelLeft = panelBox.x;
    var panelRight = panelBox.x + panelBox.width;
    var panelTop = panelBox.y;
    var panelBottom = panelBox.y + panelBox.height;
    var panelIsOutboard = panelLeft > signalBox.x + signalBox.width + 2;
    var side = panelIsOutboard ? "left" : "right";
    var targetX = side === "left" ? panelLeft : panelRight;
    var upperTarget = { x: targetX, y: panelTop };
    var lowerTarget = { x: targetX, y: panelBottom };
    var upperSource = pointOnOrbit(center, upperTarget, radius);
    var lowerSource;
    var lowerPath;

    upper.setAttribute("d", "M " + pathPoint(upperSource) + " L " + pathPoint(upperTarget));

    var overlapsOrbit = side === "right"
      && panelLeft < center.x
      && panelRight > center.x;

    if (overlapsOrbit) {
      var spineX = Math.min(item.offsetWidth - 2, panelRight + 5);
      var firstTurn = {
        x: spineX,
        y: Math.min(panelTop - 3, center.y + radius + 5)
      };
      lowerSource = pointOnOrbit(center, firstTurn, radius);
      lowerPath = "M " + pathPoint(lowerSource)
        + " L " + pathPoint(firstTurn)
        + " L " + pathPoint({ x: spineX, y: panelBottom })
        + " L " + pathPoint(lowerTarget);
      disclosure.setAttribute("data-readout-route", "bracket");
    } else {
      lowerSource = pointOnOrbit(center, lowerTarget, radius);
      lowerPath = "M " + pathPoint(lowerSource) + " L " + pathPoint(lowerTarget);
      disclosure.setAttribute("data-readout-route", "direct");
    }

    lower.setAttribute("d", lowerPath);
    disclosure.setAttribute("data-readout-connector", side);
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
      queueConnectors();
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
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(queueConnectors);
  }

  window.addEventListener("pagehide", function () {
    if (rowObserver) rowObserver.disconnect();
    if (geometryObserver) geometryObserver.disconnect();
    if (connectorFrame) window.cancelAnimationFrame(connectorFrame);
  }, { once: true });
}());
