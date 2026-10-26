/* Persistent editorial ink: the colour bar in the index card's foot.
 * See layouts/partials/ink-register.html. */
(function () {
  "use strict";

  var STORAGE_KEY = "nisch-ink-v1";
  var root = document.documentElement;
  var data = document.getElementById("ink-register-data");
  var register = document.querySelector("[data-ink-register]");

  if (!data || !register) return;

  var config;
  try {
    config = JSON.parse(data.textContent);
  } catch (error) {
    return;
  }

  var inkById = new Map(config.inks.map(function (ink) {
    return [ink.id, ink];
  }));
  var fallback = inkById.has(config.default) ? config.default : "lokta-hybrid";
  var status = register.querySelector(".ink-register__status");
  var choices = Array.from(register.querySelectorAll("[data-ink-value]"));
  var local = safeStorage("localStorage");
  var session = safeStorage("sessionStorage");
  var linkedInk = queryInk();
  var currentInk = inkById.has(root.dataset.ink) ? root.dataset.ink : fallback;
  var currentOrigin = root.dataset.inkOrigin || "canonical";

  function safeStorage(name) {
    try {
      return window[name];
    } catch (error) {
      return null;
    }
  }

  function readRecord(value) {
    try {
      var record = JSON.parse(value || "null");
      if (!record || record.version !== 1 || !inkById.has(record.id)) return null;
      return {
        id: record.id,
        source: record.source === "assigned" ? "assigned" : "chosen",
        version: 1
      };
    } catch (error) {
      return null;
    }
  }

  function writeRecord(store, record) {
    if (!store) return false;
    try {
      var value = JSON.stringify(record);
      store.setItem(STORAGE_KEY, value);
      return store.getItem(STORAGE_KEY) === value;
    } catch (error) {
      return false;
    }
  }

  function queryInk() {
    try {
      var params = new URL(window.location.href).searchParams;
      var value = params.get("ink") || params.get("palette");
      return inkById.has(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function clearQueryInk() {
    if (!linkedInk) return;
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete("ink");
      url.searchParams.delete("palette");
      window.history.replaceState(window.history.state, "", url);
    } catch (error) {
      /* Persistence remains useful even if the address cannot be normalized. */
    }
    linkedInk = null;
  }

  function updateRegister(announce) {
    var ink = inkById.get(currentInk);
    choices.forEach(function (choice) {
      var selected = choice.dataset.inkValue === currentInk;
      choice.setAttribute("aria-checked", String(selected));
      choice.tabIndex = selected ? 0 : -1;
    });
    if (announce) status.textContent = ink.name + " applied";
  }

  function applyInk(id, options) {
    if (!inkById.has(id)) return;
    var settings = Object.assign({ announce: true, persist: true }, options);
    var changed = id !== currentInk || currentOrigin === "linked";

    currentInk = id;
    if (settings.persist) {
      var record = { id: id, source: "chosen", version: 1 };
      var keptLocally = writeRecord(local, record);
      var keptForSession = writeRecord(session, record);
      currentOrigin = keptLocally || keptForSession ? "chosen" : "temporary";
      clearQueryInk();
    } else if (settings.origin) {
      currentOrigin = settings.origin;
    }

    root.dataset.ink = id;
    root.dataset.inkOrigin = currentOrigin;
    updateRegister(settings.announce && changed);

    if (changed) {
      var detail = { id: id, name: inkById.get(id).name, source: currentOrigin };
      window.dispatchEvent(new CustomEvent("lokta:inkchange", { detail: detail }));
      window.dispatchEvent(new CustomEvent("lokta:palettechange", { detail: detail }));
    }
  }

  /* The bar runs left to right, so its own keys are Left, Right, Home and
   * End; Up and Down still move through the index card around it. */
  choices.forEach(function (choice) {
    choice.addEventListener("click", function () {
      applyInk(choice.dataset.inkValue);
    });

    choice.addEventListener("keydown", function (event) {
      var currentIndex = choices.indexOf(choice);
      var nextIndex = null;

      if (event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % choices.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + choices.length) % choices.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = choices.length - 1;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        var next = choices[nextIndex];
        applyInk(next.dataset.inkValue);
        next.focus();
      }
    });
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY || linkedInk) return;
    var record = readRecord(event.newValue);
    if (record) {
      applyInk(record.id, {
        announce: false,
        persist: false,
        origin: record.source
      });
    }
  });

  updateRegister(false);
  register.dataset.ready = "";
}());
