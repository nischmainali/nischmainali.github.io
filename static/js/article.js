(function () {
  "use strict";

  var contents = document.querySelector("[data-article-contents]");
  if (contents && window.matchMedia("(max-width: 639px)").matches) {
    contents.removeAttribute("open");
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
