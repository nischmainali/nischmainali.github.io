(function () {
  "use strict";

  var contents = document.querySelector("[data-article-contents]");
  var railQuery = window.matchMedia("(min-width: 1180px)");
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var contentsSummary = contents && contents.querySelector("summary");
  var contentsList = contents && contents.querySelector("[data-article-contents-list]");
  var readingProgress = contents && contents.querySelector("[data-article-reading-progress]");
  var contentsPreferenceKey = "nisch.articleContentsOpen";
  var contentsSyncing = false;

  function storedContentsPreference() {
    try {
      return window.localStorage.getItem(contentsPreferenceKey);
    } catch (error) {
      return null;
    }
  }

  function storeContentsPreference(value) {
    try {
      window.localStorage.setItem(contentsPreferenceKey, value);
    } catch (error) {
      // The disclosure remains fully usable when storage is unavailable.
    }
  }

  function syncContents(event) {
    if (!contents) return;
    contentsSyncing = true;
    if (event.matches) {
      contents.setAttribute("open", "");
      if (contentsSummary) contentsSummary.setAttribute("tabindex", "-1");
    } else {
      if (contentsSummary) contentsSummary.removeAttribute("tabindex");
      if (storedContentsPreference() === "open") {
        contents.setAttribute("open", "");
      } else {
        contents.removeAttribute("open");
      }
    }
    window.requestAnimationFrame(function () {
      contentsSyncing = false;
    });
  }

  if (contents) {
    contents.classList.add("is-managed");
    syncContents(railQuery);
    contents.addEventListener("toggle", function () {
      if (contentsSyncing) return;
      if (railQuery.matches) {
        if (!contents.open) contents.setAttribute("open", "");
        return;
      }
      storeContentsPreference(contents.open ? "open" : "closed");
    });
    if (railQuery.addEventListener) {
      railQuery.addEventListener("change", syncContents);
    } else if (railQuery.addListener) {
      railQuery.addListener(syncContents);
    }
  }

  var toc = contents && contents.querySelector("#TableOfContents");
  var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')) : [];
  var currentSectionTrace = contents && contents.querySelector("[data-article-current-section]");
  var tocSections = tocLinks.map(function (link) {
    var id = link.getAttribute("href").slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (error) {
      return null;
    }
    var heading = document.getElementById(id);
    return heading ? { link: link, heading: heading } : null;
  }).filter(Boolean);
  var currentTocLink = null;
  var tocFrame = 0;

  function keepCurrentTocLinkVisible(link) {
    if (!link || !contentsList || !railQuery.matches) return;
    var listRect = contentsList.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    var breathingRoom = 14;
    var target = null;

    if (linkRect.top < listRect.top + breathingRoom) {
      target = contentsList.scrollTop + linkRect.top - listRect.top - breathingRoom;
    } else if (linkRect.bottom > listRect.bottom - breathingRoom) {
      target = contentsList.scrollTop + linkRect.bottom - listRect.bottom + breathingRoom;
    }

    if (target !== null) {
      contentsList.scrollTo({
        top: Math.max(0, target),
        behavior: reducedMotionQuery.matches ? "auto" : "smooth"
      });
    }
  }

  function directTocLink(item) {
    if (!item) return null;
    return Array.prototype.find.call(item.children, function (child) {
      return child.tagName === "A" && child.getAttribute("href").charAt(0) === "#";
    }) || null;
  }

  function tocLabel(link) {
    var clone = link.cloneNode(true);
    var liveMath = link.querySelectorAll(".math-inline");
    var clonedMath = clone.querySelectorAll(".math-inline");

    Array.prototype.forEach.call(clonedMath, function (math, index) {
      var visibleMath = liveMath[index] ? liveMath[index].innerText : math.textContent;
      math.textContent = " " + visibleMath.replace(/\s+/g, "") + " ";
    });
    clone.querySelectorAll(".article-link-mark, .article-link-kind-sr").forEach(function (mark) {
      mark.remove();
    });
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  function tocPath(link) {
    var labels = [];
    var item = link && link.parentElement;

    while (item && item.tagName === "LI") {
      var itemLink = directTocLink(item);
      if (itemLink) labels.unshift(tocLabel(itemLink));
      var list = item.parentElement;
      item = list && list.parentElement && list.parentElement.tagName === "LI"
        ? list.parentElement
        : null;
    }

    return labels.slice(-2).join(" / ");
  }

  function setCurrentTocLink(link) {
    if (link === currentTocLink) return;
    if (toc) {
      toc.querySelectorAll("li.is-current-branch").forEach(function (item) {
        item.classList.remove("is-current-branch");
      });
    }
    tocLinks.forEach(function (candidate) {
      var active = candidate === link;
      candidate.classList.toggle("is-current", active);
      if (active) {
        candidate.setAttribute("aria-current", "location");
      } else {
        candidate.removeAttribute("aria-current");
      }
    });
    var item = link && link.parentElement;
    while (item && item.tagName === "LI") {
      item.classList.add("is-current-branch");
      var list = item.parentElement;
      item = list && list.parentElement && list.parentElement.tagName === "LI"
        ? list.parentElement
        : null;
    }
    currentTocLink = link;
    if (currentSectionTrace) {
      currentSectionTrace.textContent = link ? tocPath(link) : "Opening";
    }
    keepCurrentTocLinkVisible(link);
  }

  function updateReadingProgress(readingLine) {
    if (!readingProgress) return;
    var article = document.querySelector(".article-body");
    if (!article) return;
    var articleTop = article.getBoundingClientRect().top + window.scrollY;
    var articleEnd = articleTop + article.offsetHeight;
    var distance = Math.max(1, articleEnd - articleTop - window.innerHeight * 0.38);
    var value = (window.scrollY + readingLine - articleTop) / distance;
    value = Math.max(0, Math.min(1, value));
    readingProgress.style.transform = "scaleX(" + value.toFixed(4) + ")";
  }

  function updateCurrentSection() {
    tocFrame = 0;
    if (!tocSections.length) return;

    var readingLine = Math.min(window.innerHeight * 0.28, 220);
    updateReadingProgress(readingLine);
    var current = null;
    tocSections.forEach(function (section) {
      if (section.heading.getBoundingClientRect().top <= readingLine) {
        current = section;
      }
    });

    var page = document.documentElement;
    if (window.scrollY + window.innerHeight >= page.scrollHeight - 4) {
      current = tocSections[tocSections.length - 1];
    }
    setCurrentTocLink(current ? current.link : null);
  }

  function scheduleCurrentSection() {
    if (tocFrame) return;
    tocFrame = window.requestAnimationFrame(updateCurrentSection);
  }

  if (tocSections.length) {
    updateCurrentSection();
    window.addEventListener("scroll", scheduleCurrentSection, { passive: true });
    window.addEventListener("resize", scheduleCurrentSection);
    window.addEventListener("hashchange", scheduleCurrentSection);
  }

  function fallbackCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = document.execCommand("copy");
    field.remove();
    return copied;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return new Promise(function (resolve, reject) {
        var finished = false;

        function finishWithFallback() {
          if (finished) return;
          finished = true;
          fallbackCopy(text) ? resolve() : reject();
        }

        var timeout = window.setTimeout(finishWithFallback, 400);
        navigator.clipboard.writeText(text).then(function () {
          if (finished) return;
          finished = true;
          window.clearTimeout(timeout);
          resolve();
        }).catch(function () {
          window.clearTimeout(timeout);
          finishWithFallback();
        });
      });
    }
    return fallbackCopy(text) ? Promise.resolve() : Promise.reject();
  }

  function selectCode(code) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.querySelectorAll(".article-body .highlight").forEach(function (block) {
    var code = block.querySelector("code");
    if (!code || block.querySelector(".article-code-tools")) return;

    var tools = document.createElement("div");
    tools.className = "article-code-tools";

    var language = code.getAttribute("data-lang") || "";
    if (!language) {
      Array.prototype.some.call(code.classList, function (name) {
        if (name.indexOf("language-") === 0) {
          language = name.slice(9);
          return true;
        }
        return false;
      });
    }

    var label = document.createElement("span");
    label.className = "article-code-language";
    label.textContent = language || "code";
    tools.appendChild(label);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "article-copy-button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.setAttribute("aria-live", "polite");
    tools.appendChild(button);

    button.addEventListener("click", function () {
      copyText(code.textContent).then(function () {
        button.textContent = "Copied";
        button.dataset.state = "copied";
        window.setTimeout(function () {
          button.textContent = "Copy";
          delete button.dataset.state;
        }, 1600);
      }).catch(function () {
        selectCode(code);
        button.textContent = "Selected";
        button.setAttribute("aria-label", "Code selected; use your copy command");
        window.setTimeout(function () {
          button.textContent = "Copy";
          button.setAttribute("aria-label", "Copy code to clipboard");
        }, 5000);
      });
    });

    block.insertBefore(tools, block.firstChild);
  });

  function articleWarning(message) {
    if (window.console && typeof window.console.warn === "function") {
      window.console.warn("[article] " + message);
    }
  }

  var sidenotePairs = [];

  function setSidenoteCorrespondence(pair, active) {
    pair.reference.classList.toggle("is-corresponding", active);
    pair.note.classList.toggle("is-corresponding", active);
  }

  function syncSidenoteToggle(pair) {
    var wide = railQuery.matches;
    pair.toggle.setAttribute(
      "aria-label",
      wide ? "Sidenote " + pair.number : "Toggle sidenote " + pair.number
    );
    pair.toggle.setAttribute("aria-expanded", wide ? "true" : String(pair.toggle.checked));
  }

  document.querySelectorAll(".article-body .sidenote").forEach(function (note, index) {
    var number = index + 1;
    var reference = note.previousElementSibling;
    var toggle = reference && reference.previousElementSibling;

    if (!reference || !reference.classList.contains("sidenote-ref") ||
        !toggle || !toggle.classList.contains("sidenote-toggle")) {
      articleWarning("A sidenote is missing its reference or toggle.");
      return;
    }

    var referenceNumber = reference.querySelector(".sidenote-ref-number");
    var noteNumber = note.querySelector(".sidenote-number");
    if (referenceNumber) {
      referenceNumber.textContent = String(number);
      referenceNumber.dataset.numberReady = "true";
    }
    if (noteNumber) {
      noteNumber.textContent = String(number);
      noteNumber.dataset.numberReady = "true";
    }

    var pair = { toggle: toggle, reference: reference, note: note, number: number };
    sidenotePairs.push(pair);

    note.setAttribute("aria-label", "Sidenote " + number);
    note.dataset.sidenoteNumber = String(number);

    reference.addEventListener("pointerenter", function () {
      setSidenoteCorrespondence(pair, true);
    });
    reference.addEventListener("pointerleave", function () {
      setSidenoteCorrespondence(pair, false);
    });
    note.addEventListener("pointerenter", function () {
      setSidenoteCorrespondence(pair, true);
    });
    note.addEventListener("pointerleave", function () {
      if (!note.contains(document.activeElement)) setSidenoteCorrespondence(pair, false);
    });
    toggle.addEventListener("focus", function () {
      setSidenoteCorrespondence(pair, true);
    });
    toggle.addEventListener("blur", function () {
      setSidenoteCorrespondence(pair, false);
    });
    toggle.addEventListener("change", function () {
      syncSidenoteToggle(pair);
    });
    note.addEventListener("focusin", function () {
      setSidenoteCorrespondence(pair, true);
    });
    note.addEventListener("focusout", function (event) {
      if (!note.contains(event.relatedTarget)) setSidenoteCorrespondence(pair, false);
    });

    syncSidenoteToggle(pair);
  });

  if (sidenotePairs.length) {
    var syncAllSidenoteToggles = function () {
      sidenotePairs.forEach(syncSidenoteToggle);
    };
    if (railQuery.addEventListener) {
      railQuery.addEventListener("change", syncAllSidenoteToggles);
    } else if (railQuery.addListener) {
      railQuery.addListener(syncAllSidenoteToggles);
    }
  }

  var equationsById = Object.create(null);
  document.querySelectorAll("[data-equation]").forEach(function (equation, index) {
    var id = equation.dataset.equation;
    if (equationsById[id]) {
      articleWarning('Duplicate equation target "' + id + '".');
      return;
    }

    var number = index + 1;
    equationsById[id] = { element: equation, number: number };
    equation.dataset.equationNumber = String(number);

    var value = equation.querySelector(".equation-number-value");
    if (value) {
      value.textContent = "(" + number + ")";
      value.dataset.numberReady = "true";
    }

    var permalink = equation.querySelector(".equation-number");
    if (permalink) {
      permalink.setAttribute("aria-label", "Equation " + number);
    }
  });

  document.querySelectorAll("[data-equation-ref]").forEach(function (reference) {
    var id = reference.dataset.equationRef;
    var target = equationsById[id];
    if (!target) {
      articleWarning('Missing equation target "' + id + '".');
      reference.dataset.referenceState = "missing";
      return;
    }

    var text = "(" + target.number + ")";
    var value = reference.querySelector(".equation-ref-value");
    if (value) value.textContent = text;
    reference.setAttribute("aria-label", "Equation " + target.number);
    reference.dataset.referenceState = "resolved";
  });

  var statementsById = Object.create(null);
  var statementNumber = 0;
  document.querySelectorAll("[data-statement]").forEach(function (statement) {
    var id = statement.dataset.statement;
    if (statementsById[id]) {
      articleWarning('Duplicate statement target "' + id + '".');
      return;
    }

    var numbered = statement.dataset.statementNumbered === "true";
    if (numbered) statementNumber += 1;
    var kind = statement.dataset.statementKind || "statement";
    var label = kind.charAt(0).toUpperCase() + kind.slice(1);
    statementsById[id] = {
      element: statement,
      kind: label,
      number: numbered ? statementNumber : null
    };

    if (numbered) {
      statement.dataset.statementNumber = String(statementNumber);
      var value = statement.querySelector(".statement-number");
      if (value) {
        value.textContent = String(statementNumber);
        value.dataset.numberReady = "true";
      }
      var permalink = statement.querySelector(".statement-permalink");
      if (permalink) {
        permalink.setAttribute("aria-label", "Link to " + label + " " + statementNumber);
      }
    }
  });

  document.querySelectorAll("[data-statement-ref]").forEach(function (reference) {
    var id = reference.dataset.statementRef;
    var target = statementsById[id];
    if (!target) {
      articleWarning('Missing statement target "' + id + '".');
      reference.dataset.referenceState = "missing";
      return;
    }

    var label = target.kind + (target.number === null ? "" : " " + target.number);
    var kind = reference.querySelector(".statement-ref-kind");
    var number = reference.querySelector(".statement-ref-number");
    if (kind) kind.textContent = target.kind;
    if (number) {
      if (target.number === null) {
        number.remove();
      } else {
        number.textContent = String(target.number);
      }
    }
    reference.setAttribute("aria-label", label);
    reference.dataset.referenceState = "resolved";
  });

  var mathScrolls = Array.prototype.slice.call(document.querySelectorAll("[data-math-scroll]"));

  function formulaLabel(scroller) {
    var annotation = scroller.querySelector('annotation[encoding="application/x-tex"]');
    var tex = annotation ? annotation.textContent.replace(/\s+/g, " ").trim() : "";
    return tex ? "Scrollable mathematical formula: " + tex : "Scrollable mathematical formula";
  }

  function updateMathOverflow(scroller) {
    var maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    var scrollable = maxScroll > 1;
    var canScrollLeft = scrollable && scroller.scrollLeft > 1;
    var canScrollRight = scrollable && scroller.scrollLeft < maxScroll - 1;

    scroller.classList.toggle("is-scrollable", scrollable);
    scroller.classList.toggle("can-scroll-left", canScrollLeft);
    scroller.classList.toggle("can-scroll-right", canScrollRight);

    if (scrollable) {
      if (!scroller.hasAttribute("tabindex")) {
        scroller.setAttribute("tabindex", "0");
        scroller.dataset.mathTabManaged = "true";
      }
      scroller.setAttribute("role", "region");
      scroller.setAttribute("aria-label", formulaLabel(scroller));
    } else {
      if (scroller.dataset.mathTabManaged === "true") {
        scroller.removeAttribute("tabindex");
        delete scroller.dataset.mathTabManaged;
      }
      scroller.removeAttribute("role");
      scroller.removeAttribute("aria-label");
      if (scroller.scrollLeft !== 0) scroller.scrollLeft = 0;
    }
  }

  if (mathScrolls.length) {
    mathScrolls.forEach(function (scroller) {
      updateMathOverflow(scroller);
      scroller.addEventListener("scroll", function () {
        updateMathOverflow(scroller);
      }, { passive: true });
      scroller.addEventListener("keydown", function (event) {
        var maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        if (maxScroll <= 1) return;

        var target = null;
        var step = Math.max(40, Math.min(96, scroller.clientWidth * 0.16));
        if (event.key === "ArrowLeft") target = scroller.scrollLeft - step;
        if (event.key === "ArrowRight") target = scroller.scrollLeft + step;
        if (event.key === "Home") target = 0;
        if (event.key === "End") target = maxScroll;
        if (target === null) return;

        event.preventDefault();
        scroller.scrollTo({ left: Math.max(0, Math.min(maxScroll, target)), behavior: "auto" });
      });
    });

    if (typeof window.ResizeObserver === "function") {
      var mathObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          updateMathOverflow(entry.target);
        });
      });
      mathScrolls.forEach(function (scroller) {
        mathObserver.observe(scroller);
      });
    } else {
      window.addEventListener("resize", function () {
        mathScrolls.forEach(updateMathOverflow);
      });
    }

    window.addEventListener("load", function () {
      mathScrolls.forEach(updateMathOverflow);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        mathScrolls.forEach(updateMathOverflow);
      });
    }
  }

  var figureDialog = document.querySelector("[data-article-figure-dialog]");
  var figureFocusLinks = Array.prototype.slice.call(
    document.querySelectorAll("[data-article-figure-focus-link]")
  );

  if (figureDialog && figureFocusLinks.length && typeof figureDialog.showModal === "function") {
    var figureDialogImage = figureDialog.querySelector("[data-article-figure-focus-image]");
    var figureDialogCaption = figureDialog.querySelector("[data-article-figure-focus-caption]");
    var figureDialogClose = figureDialog.querySelector(".article-figure-focus-close button");
    var activeFigureLink = null;

    function openFigureDialog(link) {
      var figure = link.closest(".article-figure");
      var sourceImage = link.querySelector("img");
      if (!figure || !sourceImage || !figureDialogImage) return;

      activeFigureLink = link;
      figureDialogImage.src = link.href;
      figureDialogImage.alt = sourceImage.alt || "";
      if (sourceImage.naturalWidth) figureDialogImage.width = sourceImage.naturalWidth;
      if (sourceImage.naturalHeight) figureDialogImage.height = sourceImage.naturalHeight;

      var sourceCaption = figure.querySelector("figcaption");
      if (figureDialogCaption) {
        figureDialogCaption.innerHTML = sourceCaption ? sourceCaption.innerHTML : "";
        figureDialogCaption.hidden = !sourceCaption;
      }

      figureDialog.setAttribute(
        "aria-label",
        sourceImage.alt ? "Enlarged figure: " + sourceImage.alt : "Enlarged figure"
      );
      link.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("article-figure-is-open");
      figureDialog.showModal();
      window.requestAnimationFrame(function () {
        if (figureDialogClose) figureDialogClose.focus();
      });
    }

    function releaseFigureDialog() {
      document.documentElement.classList.remove("article-figure-is-open");
      if (activeFigureLink) {
        activeFigureLink.setAttribute("aria-expanded", "false");
        activeFigureLink.focus();
      }
      activeFigureLink = null;
      if (figureDialogImage) figureDialogImage.removeAttribute("src");
    }

    figureFocusLinks.forEach(function (link) {
      link.dataset.figureFocusReady = "true";
      link.setAttribute("aria-haspopup", "dialog");
      link.setAttribute("aria-controls", figureDialog.id);
      link.setAttribute("aria-expanded", "false");
      link.addEventListener("click", function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
            event.shiftKey || event.altKey) return;
        event.preventDefault();
        openFigureDialog(link);
      });
    });

    figureDialog.addEventListener("click", function (event) {
      if (event.target === figureDialog) figureDialog.close();
    });
    figureDialog.addEventListener("close", releaseFigureDialog);
  }
})();
