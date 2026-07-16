(function () {
  "use strict";

  var contents = document.querySelector("[data-article-contents]");
  var railQuery = window.matchMedia("(min-width: 1180px)");

  function syncContents(event) {
    if (!contents) return;
    if (event.matches) {
      contents.setAttribute("open", "");
    } else {
      contents.removeAttribute("open");
    }
  }

  if (contents) {
    syncContents(railQuery);
    if (railQuery.addEventListener) {
      railQuery.addEventListener("change", syncContents);
    } else if (railQuery.addListener) {
      railQuery.addListener(syncContents);
    }
  }

  var toc = contents && contents.querySelector("#TableOfContents");
  var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]')) : [];
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

  function setCurrentTocLink(link) {
    if (link === currentTocLink) return;
    tocLinks.forEach(function (candidate) {
      var active = candidate === link;
      candidate.classList.toggle("is-current", active);
      if (active) {
        candidate.setAttribute("aria-current", "location");
      } else {
        candidate.removeAttribute("aria-current");
      }
    });
    currentTocLink = link;
  }

  function updateCurrentSection() {
    tocFrame = 0;
    if (!tocSections.length) return;

    var readingLine = Math.min(window.innerHeight * 0.28, 220);
    var current = tocSections[0];
    tocSections.forEach(function (section) {
      if (section.heading.getBoundingClientRect().top <= readingLine) {
        current = section;
      }
    });

    var page = document.documentElement;
    if (window.scrollY + window.innerHeight >= page.scrollHeight - 4) {
      current = tocSections[tocSections.length - 1];
    }
    setCurrentTocLink(current.link);
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
})();
