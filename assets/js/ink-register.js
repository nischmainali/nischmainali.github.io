/* Persistent editorial ink register.  See layouts/partials/ink-register.html. */
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
  var toggle = register.querySelector("#ink-toggle");
  var panel = register.querySelector("#ink-register-panel");
  var note = register.querySelector("[data-ink-note]");
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

  function originText(origin) {
    if (origin === "assigned") return "Chosen for this copy · kept in this browser";
    if (origin === "linked") return "Linked impression · choose one to keep it";
    if (origin === "chosen") return "Your chosen impression · kept in this browser";
    if (origin === "temporary") return "Current impression · storage unavailable";
    return "House ink · sunlight held constant";
  }

  function updateMark(ink) {
    var swatches = ink.swatches || [];
    register.style.setProperty("--ink-mark-a", swatches[2] || "currentColor");
    register.style.setProperty("--ink-mark-b", swatches[3] || "currentColor");
    register.style.setProperty("--ink-mark-c", swatches[4] || "currentColor");
  }

  function updateToggleLabel() {
    var ink = inkById.get(currentInk);
    var action = panel.hidden ? "Choose ink" : "Close ink selector";
    toggle.setAttribute("aria-label", action + ". Current ink: " + ink.name);
  }

  function updateRegister(announce) {
    var ink = inkById.get(currentInk);
    note.textContent = originText(currentOrigin);
    updateMark(ink);
    choices.forEach(function (choice) {
      var selected = choice.dataset.inkValue === currentInk;
      choice.setAttribute("aria-checked", String(selected));
      choice.tabIndex = selected ? 0 : -1;
    });
    updateToggleLabel();
    if (announce) status.textContent = ink.name + " applied";
  }

  function setOpen(open, options) {
    var settings = Object.assign({ focusChoice: false, returnFocus: false }, options);
    panel.hidden = !open;
    panel.inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
    register.toggleAttribute("data-open", open);
    updateToggleLabel();

    if (open && settings.focusChoice) {
      var selected = panel.querySelector('[aria-checked="true"]');
      if (selected) selected.focus();
    } else if (!open && settings.returnFocus) {
      toggle.focus();
    }
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

  toggle.addEventListener("click", function (event) {
    setOpen(panel.hidden, {
      focusChoice: panel.hidden && event.detail === 0
    });
  });

  toggle.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true, { focusChoice: true });
    }
  });

  choices.forEach(function (choice) {
    choice.addEventListener("click", function () {
      applyInk(choice.dataset.inkValue);
    });

    choice.addEventListener("keydown", function (event) {
      var currentIndex = choices.indexOf(choice);
      var nextIndex = null;

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % choices.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + choices.length) % choices.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = choices.length - 1;
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false, { returnFocus: true });
        return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        var next = choices[nextIndex];
        applyInk(next.dataset.inkValue);
        next.focus();
      }
    });
  });

  register.addEventListener("focusout", function () {
    queueMicrotask(function () {
      if (!register.contains(document.activeElement)) setOpen(false);
    });
  });

  document.addEventListener("pointerdown", function (event) {
    if (!panel.hidden && !register.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      setOpen(false, { returnFocus: true });
    }
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
