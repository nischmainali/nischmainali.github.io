(function () {
  "use strict";

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

  function formatThreshold(value) {
    const number = Number(value);
    const sign = number > 0 ? "+" : "";
    return sign + number.toFixed(2);
  }

  function plural(value, singular, pluralForm) {
    return value === 1 ? singular : pluralForm;
  }

  function mountPlate(plate) {
    const curve = plate.querySelector("[data-field-curve]");
    const thresholdLine = plate.querySelector("[data-field-threshold-line]");
    const thresholdLabel = plate.querySelector("[data-field-threshold-label]");
    const clip = plate.querySelector("[data-field-clip]");
    const crossings = plate.querySelector("[data-field-crossings]");
    const input = plate.querySelector("[data-field-input]");
    const output = plate.querySelector("[data-field-output]");
    const status = plate.querySelector("[data-field-status]");
    const reading = plate.querySelector("[data-field-reading]");
    const controls = plate.querySelector("[data-field-controls]");

    if (
      !curve ||
      !thresholdLine ||
      !thresholdLabel ||
      !clip ||
      !crossings ||
      !input ||
      !output ||
      !status ||
      !reading ||
      !controls ||
      typeof curve.getTotalLength !== "function"
    ) {
      return;
    }

    const plotTop = 44;
    const plotBottom = 246;
    const centre = 160;
    const scale = 105;
    const samples = 360;
    let frame = 0;

    function draw() {
      frame = 0;
      const threshold = Number(input.value);
      const thresholdY = Math.max(
        plotTop,
        Math.min(plotBottom, centre - threshold * scale)
      );
      const formatted = formatThreshold(threshold);

      thresholdLine.setAttribute("y1", thresholdY.toFixed(2));
      thresholdLine.setAttribute("y2", thresholdY.toFixed(2));
      thresholdLabel.setAttribute("y", (thresholdY - 7).toFixed(2));
      thresholdLabel.textContent = "u = " + formatted;
      clip.setAttribute("height", Math.max(0, thresholdY - plotTop).toFixed(2));

      const totalLength = curve.getTotalLength();
      const points = [];
      const firstPoint = curve.getPointAtLength(0);
      let previousLength = 0;
      let previousDelta = firstPoint.y - thresholdY;

      for (let index = 1; index <= samples; index += 1) {
        const currentLength = (totalLength * index) / samples;
        const currentPoint = curve.getPointAtLength(currentLength);
        const currentDelta = currentPoint.y - thresholdY;

        if (
          (previousDelta < 0 && currentDelta >= 0) ||
          (previousDelta > 0 && currentDelta <= 0)
        ) {
          const denominator = previousDelta - currentDelta;
          const ratio = denominator === 0 ? 0.5 : previousDelta / denominator;
          const crossingLength =
            previousLength + (currentLength - previousLength) * ratio;
          points.push(curve.getPointAtLength(crossingLength));
        }

        previousLength = currentLength;
        previousDelta = currentDelta;
      }

      crossings.replaceChildren();
      points.forEach(function (point) {
        const circle = document.createElementNS(SVG_NAMESPACE, "circle");
        circle.setAttribute("cx", point.x.toFixed(2));
        circle.setAttribute("cy", point.y.toFixed(2));
        circle.setAttribute("r", "4.25");
        crossings.appendChild(circle);
      });

      const startsAbove = firstPoint.y < thresholdY;
      const intervals = startsAbove
        ? 1 + Math.floor(points.length / 2)
        : Math.ceil(points.length / 2);
      const crossingText =
        points.length + " " + plural(points.length, "crossing", "crossings");
      const intervalText =
        intervals + " connected " + plural(intervals, "interval", "intervals");

      output.value = formatted;
      output.textContent = formatted;
      status.textContent = "u = " + formatted + " / " + crossingText;
      reading.textContent = crossingText + "; " + intervalText + ".";
    }

    function scheduleDraw() {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      frame = requestAnimationFrame(draw);
    }

    input.addEventListener("input", scheduleDraw, { passive: true });
    draw();
    controls.hidden = false;
    plate.classList.add("is-ready");
  }

  document.querySelectorAll("[data-field-plate]").forEach(mountPlate);
})();
