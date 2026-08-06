(function () {
  "use strict";

  var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

  function formatSigned(value) {
    var number = Number(value);
    return (number > 0 ? "+" : "") + number.toFixed(2);
  }

  function plural(value, singular, pluralForm) {
    return value === 1 ? singular : pluralForm;
  }

  function mountFieldPlate(plate) {
    var curve = plate.querySelector("[data-field-curve]");
    var thresholdLine = plate.querySelector("[data-field-threshold-line]");
    var thresholdLabel = plate.querySelector("[data-field-threshold-label]");
    var thresholdValue = plate.querySelector("[data-field-threshold-value]");
    var clip = plate.querySelector("[data-field-clip]");
    var crossings = plate.querySelector("[data-field-crossings]");
    var input = plate.querySelector("[data-field-input]");
    var output = plate.querySelector("[data-field-output]");
    var status = plate.querySelector("[data-field-status]");
    var statusValue = plate.querySelector("[data-field-status-value]");
    var statusCount = plate.querySelector("[data-field-status-count]");
    var reading = plate.querySelector("[data-field-reading]");
    var controls = plate.querySelector("[data-field-controls]");

    if (
      !curve ||
      !thresholdLine ||
      !thresholdLabel ||
      !thresholdValue ||
      !clip ||
      !crossings ||
      !input ||
      !output ||
      !status ||
      !statusValue ||
      !statusCount ||
      !reading ||
      !controls ||
      typeof curve.getTotalLength !== "function"
    ) {
      return;
    }

    var plotTop = 44;
    var plotBottom = 246;
    var centre = 160;
    var scale = 105;
    var samples = 360;
    var frame = 0;

    function draw() {
      frame = 0;
      var threshold = Number(input.value);
      var thresholdY = Math.max(
        plotTop,
        Math.min(plotBottom, centre - threshold * scale)
      );
      var formatted = formatSigned(threshold);

      thresholdLine.setAttribute("y1", thresholdY.toFixed(2));
      thresholdLine.setAttribute("y2", thresholdY.toFixed(2));
      thresholdLabel.style.setProperty(
        "--plate-math-y",
        (((thresholdY - 12) / 300) * 100).toFixed(2) + "%"
      );
      thresholdValue.textContent = formatted;
      clip.setAttribute("height", Math.max(0, thresholdY - plotTop).toFixed(2));

      var totalLength = curve.getTotalLength();
      var points = [];
      var firstPoint = curve.getPointAtLength(0);
      var previousLength = 0;
      var previousDelta = firstPoint.y - thresholdY;

      for (var index = 1; index <= samples; index += 1) {
        var currentLength = (totalLength * index) / samples;
        var currentPoint = curve.getPointAtLength(currentLength);
        var currentDelta = currentPoint.y - thresholdY;

        if (
          (previousDelta < 0 && currentDelta >= 0) ||
          (previousDelta > 0 && currentDelta <= 0)
        ) {
          var denominator = previousDelta - currentDelta;
          var ratio = denominator === 0 ? 0.5 : previousDelta / denominator;
          var crossingLength =
            previousLength + (currentLength - previousLength) * ratio;
          points.push(curve.getPointAtLength(crossingLength));
        }

        previousLength = currentLength;
        previousDelta = currentDelta;
      }

      crossings.replaceChildren();
      points.forEach(function (point) {
        var circle = document.createElementNS(SVG_NAMESPACE, "circle");
        circle.setAttribute("cx", point.x.toFixed(2));
        circle.setAttribute("cy", point.y.toFixed(2));
        circle.setAttribute("r", "4.25");
        crossings.appendChild(circle);
      });

      var startsAbove = firstPoint.y < thresholdY;
      var intervals = startsAbove
        ? 1 + Math.floor(points.length / 2)
        : Math.ceil(points.length / 2);
      var crossingText =
        points.length + " " + plural(points.length, "crossing", "crossings");
      var intervalText =
        intervals + " connected " + plural(intervals, "excursion", "excursions");

      output.value = formatted;
      output.textContent = formatted;
      statusValue.textContent = formatted;
      statusCount.textContent = crossingText;
      reading.textContent = crossingText + " divide the sampled interval into " + intervalText + ".";
    }

    function scheduleDraw() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(draw);
    }

    input.addEventListener("input", scheduleDraw, { passive: true });
    draw();
    controls.hidden = false;
    plate.classList.add("is-ready");
  }

  function mountErrorPlate(plate) {
    var localPath = plate.querySelector("[data-error-local]");
    var globalPath = plate.querySelector("[data-error-global]");
    var totalPath = plate.querySelector("[data-error-total]");
    var minimum = plate.querySelector("[data-error-minimum]");
    var minimumLeader = plate.querySelector("[data-error-minimum-leader]");
    var minimumLabel = plate.querySelector("[data-error-minimum-label]");
    var localLabel = plate.querySelector("[data-error-local-label]");
    var globalLabel = plate.querySelector("[data-error-global-label]");
    var totalLabel = plate.querySelector("[data-error-total-label]");
    var yGrid = plate.querySelector("[data-error-y-grid]");
    var yTickLabels = Array.prototype.slice.call(
      plate.querySelectorAll("[data-error-y-tick]")
    );
    var input = plate.querySelector("[data-error-input]");
    var output = plate.querySelector("[data-error-output]");
    var status = plate.querySelector("[data-error-status]");
    var statusPopulation = plate.querySelector("[data-error-status-population]");
    var statusOptimum = plate.querySelector("[data-error-status-optimum]");
    var reading = plate.querySelector("[data-error-reading]");
    var readingPopulation = plate.querySelector("[data-error-reading-population]");
    var readingPhrase = plate.querySelector("[data-error-reading-phrase]");
    var readingOptimum = plate.querySelector("[data-error-reading-optimum]");
    var readingRange = plate.querySelector("[data-error-reading-range]");
    var controls = plate.querySelector("[data-error-controls]");

    if (
      !localPath ||
      !globalPath ||
      !totalPath ||
      !minimum ||
      !minimumLeader ||
      !minimumLabel ||
      !localLabel ||
      !globalLabel ||
      !totalLabel ||
      !yGrid ||
      !yTickLabels.length ||
      !input ||
      !output ||
      !status ||
      !statusPopulation ||
      !statusOptimum ||
      !reading ||
      !readingPopulation ||
      !readingPhrase ||
      !readingOptimum ||
      !readingRange ||
      !controls
    ) {
      return;
    }

    var left = 42;
    var right = 326;
    var top = 28;
    var bottom = 210;
    var xMin = 0.1;
    var xMax = 100;
    var xMinLog = Math.log(xMin);
    var xMaxLog = Math.log(xMax);
    var logTen = Math.log(10);
    var logEtaSquared = Math.log(0.35 * 0.35);
    var logGlobalScale = 3 * Math.log(12) - Math.log(24);
    var logSuppressionBase = Math.log1p(1 / (2 * 0.35 * 0.35));
    var samples = 72;
    var frame = 0;
    var yMinLog = Math.log(0.00002);
    var yMaxLog = Math.log(0.2);

    function xPosition(logValue) {
      return left + ((logValue - xMinLog) / (xMaxLog - xMinLog)) * (right - left);
    }

    function yPosition(logValue) {
      var clipped = Math.max(yMinLog, Math.min(yMaxLog, logValue));
      return bottom - ((clipped - yMinLog) / (yMaxLog - yMinLog)) * (bottom - top);
    }

    function logAdd(first, second) {
      var maximum = Math.max(first, second);
      return maximum + Math.log(Math.exp(first - maximum) + Math.exp(second - maximum));
    }

    function logValuesAt(logOmegaTwo, population) {
      var local = logEtaSquared - logOmegaTwo - Math.log(population - 2);
      var global =
        logGlobalScale +
        logOmegaTwo -
        ((population - 1) / 2) * logSuppressionBase;
      return { local: local, global: global, total: logAdd(local, global) };
    }

    function pathFor(key, population) {
      var commands = [];
      for (var index = 0; index <= samples; index += 1) {
        var logOmegaTwo =
          xMinLog + ((xMaxLog - xMinLog) * index) / samples;
        var value = logValuesAt(logOmegaTwo, population)[key];
        commands.push(
          (index === 0 ? "M" : "L") +
            xPosition(logOmegaTwo).toFixed(2) +
            " " +
            yPosition(value).toFixed(2)
        );
      }
      return commands.join("");
    }

    function placeLabel(label, omegaTwo, logValue, dx, dy) {
      var x = xPosition(Math.log(omegaTwo)) + dx;
      var y = Math.max(top + 11, Math.min(bottom - 5, yPosition(logValue) + dy));
      label.setAttribute("x", x.toFixed(2));
      label.setAttribute("y", y.toFixed(2));
    }

    function drawYTicks(minimumExponent, maximumExponent) {
      var exponentRange = maximumExponent - minimumExponent;
      var step = Math.max(1, Math.ceil(exponentRange / 4));
      var fragment = document.createDocumentFragment();

      yTickLabels.forEach(function (tick) {
        tick.hidden = true;
      });

      function showLabel(exponent, y) {
        var tick = yTickLabels.find(function (candidate) {
          return Number(candidate.dataset.errorYTick) === exponent;
        });
        if (!tick) return;
        tick.style.setProperty(
          "--plate-math-y",
          ((y / 250) * 100).toFixed(2) + "%"
        );
        tick.hidden = false;
      }

      for (
        var exponent = minimumExponent;
        exponent <= maximumExponent;
        exponent += step
      ) {
        var y = yPosition(exponent * logTen);
        var line = document.createElementNS(SVG_NAMESPACE, "path");
        line.setAttribute("d", "M" + left + " " + y.toFixed(2) + "H" + right);
        fragment.appendChild(line);
        showLabel(exponent, y);
      }

      if ((maximumExponent - minimumExponent) % step !== 0) {
        showLabel(maximumExponent, top);
      }

      yGrid.replaceChildren(fragment);
    }

    function formatOptimum(value) {
      if (value >= 1000) {
        return value.toLocaleString("en-GB", {
          maximumSignificantDigits: 3
        });
      }
      if (value < 0.01) return value.toFixed(3);
      if (value >= 10) return value.toFixed(1);
      return value.toFixed(2);
    }

    function draw() {
      frame = 0;
      var population = Math.max(6, Math.min(48, Math.round(Number(input.value))));
      var logLocalCoefficient = logEtaSquared - Math.log(population - 2);
      var logGlobalCoefficient =
        logGlobalScale - ((population - 1) / 2) * logSuppressionBase;
      var optimumLog = (logLocalCoefficient - logGlobalCoefficient) / 2;
      var optimum = Math.exp(optimumLog);
      var optimumText = formatOptimum(optimum);

      var endpoints = [
        logValuesAt(xMinLog, population),
        logValuesAt(xMaxLog, population)
      ];
      var smallest = Math.min(
        endpoints[0].local,
        endpoints[0].global,
        endpoints[1].local,
        endpoints[1].global
      );
      var largest = Math.max(
        endpoints[0].local,
        endpoints[0].global,
        endpoints[0].total,
        endpoints[1].local,
        endpoints[1].global,
        endpoints[1].total
      );
      var minimumExponent = Math.floor(smallest / logTen);
      var maximumExponent = Math.ceil(largest / logTen);
      if (maximumExponent - minimumExponent < 3) {
        minimumExponent = maximumExponent - 3;
      }
      yMinLog = minimumExponent * logTen;
      yMaxLog = maximumExponent * logTen;
      drawYTicks(minimumExponent, maximumExponent);

      localPath.setAttribute("d", pathFor("local", population));
      globalPath.setAttribute("d", pathFor("global", population));
      totalPath.setAttribute("d", pathFor("total", population));

      var minimumIsVisible = optimum >= xMin && optimum <= xMax;
      minimum.style.display = minimumIsVisible ? "" : "none";
      minimumLeader.style.display = minimumIsVisible ? "" : "none";
      minimumLabel.style.display = minimumIsVisible ? "" : "none";
      if (minimumIsVisible) {
        var minimumLogValue = logValuesAt(optimumLog, population).total;
        var minimumX = xPosition(optimumLog);
        var minimumY = yPosition(minimumLogValue);
        var labelOnLeft = minimumX > right - 76;
        minimum.setAttribute("cx", minimumX.toFixed(2));
        minimum.setAttribute("cy", minimumY.toFixed(2));
        minimumLeader.setAttribute(
          "d",
          "M" + minimumX.toFixed(2) + " " + (minimumY + 5).toFixed(2) +
            "V" + Math.min(bottom - 20, minimumY + 39).toFixed(2)
        );
        minimumLabel.setAttribute("text-anchor", labelOnLeft ? "end" : "start");
        minimumLabel.setAttribute("x", (minimumX + (labelOnLeft ? -7 : 7)).toFixed(2));
        minimumLabel.setAttribute("y", Math.min(bottom - 7, minimumY + 47).toFixed(2));
        minimumLabel.textContent = "minimum " + optimumText;
      }

      var localLabelValues = logValuesAt(Math.log(0.45), population);
      var globalLabelValues = logValuesAt(Math.log(25), population);
      var totalLabelOmega = Math.max(0.7, Math.min(35, optimum * 1.45));
      var totalLabelValues = logValuesAt(Math.log(totalLabelOmega), population);
      placeLabel(localLabel, 0.45, localLabelValues.local, 3, -6);
      placeLabel(globalLabel, 25, globalLabelValues.global, -50, -6);
      placeLabel(totalLabel, totalLabelOmega, totalLabelValues.total, 5, -6);

      input.value = String(population);
      output.value = String(population);
      output.textContent = String(population);
      statusPopulation.textContent = String(population);
      statusOptimum.textContent = optimumText;
      readingPopulation.textContent = String(population);
      readingOptimum.textContent = optimumText;
      readingPhrase.textContent = minimumIsVisible
        ? "the two approximations balance near"
        : "the formal balance lies at";
      readingRange.textContent = minimumIsVisible
        ? "."
        : ", beyond the plotted range.";
    }

    function scheduleDraw() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(draw);
    }

    input.addEventListener("input", scheduleDraw, { passive: true });
    draw();
    controls.hidden = false;
    plate.classList.add("is-ready");
  }

  document
    .querySelectorAll('[data-scientific-plate="field"]')
    .forEach(mountFieldPlate);
  document
    .querySelectorAll('[data-scientific-plate="error"]')
    .forEach(mountErrorPlate);
})();
