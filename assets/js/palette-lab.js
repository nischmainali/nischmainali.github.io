/* Development-only palette register.  See layouts/partials/palette-lab.html. */
(function () {
  "use strict";

  const STORAGE_KEY = "nisch-palette-lab";
  const DEFAULT_PALETTE = "lokta-hybrid";
  const PALETTES = [
    {
      id: "lokta-hybrid",
      name: "Lokta Hybrid",
      description: "Current field-note synthesis",
      swatches: ["#fbf7f0", "#202622", "#005077", "#184034", "#6f3b3f", "#6e678f"]
    },
    {
      id: "ef-arbutus",
      name: "Ef Arbutus",
      description: "Peach paper · green and madder",
      swatches: ["#ffead8", "#393330", "#00704f", "#007000", "#aa184f", "#6e678f"]
    },
    {
      id: "ef-cyprus",
      name: "Ef Cyprus",
      description: "Ochre paper · olive and wine",
      swatches: ["#fcf7ef", "#242521", "#a7601f", "#557400", "#ca3400", "#59786f"]
    },
    {
      id: "ef-elea-light",
      name: "Ef Elea Light",
      description: "Lichen paper · plum and olive",
      swatches: ["#edf5e2", "#221321", "#00601f", "#355500", "#9f356a", "#676470"]
    },
    {
      id: "ef-arcadia",
      name: "Ef Arcadia",
      description: "Verdant paper · plum and indigo",
      swatches: ["#d6e4d3", "#40314e", "#503094", "#113384", "#922e7f", "#646170"]
    },
    {
      id: "modus-operandi-tinted",
      name: "Modus Operandi Tinted",
      description: "Ochre paper · rigorous blue ink",
      swatches: ["#fbf7f0", "#000000", "#3546c2", "#574316", "#a0132f", "#595959"]
    }
  ];
  const paletteById = new Map(PALETTES.map((palette) => [palette.id, palette]));

  function safeStorage(storageName) {
    try {
      return window[storageName];
    } catch (_error) {
      return null;
    }
  }

  function readStorage(storage) {
    if (!storage) return null;
    try {
      const value = storage.getItem(STORAGE_KEY);
      return paletteById.has(value) ? value : null;
    } catch (_error) {
      return null;
    }
  }

  function writeStorage(storage, value) {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, value);
    } catch (_error) {
      /* A private browsing policy may refuse persistence; the page still works. */
    }
  }

  function queryPalette() {
    try {
      const value = new URL(window.location.href).searchParams.get("palette");
      return paletteById.has(value) ? value : null;
    } catch (_error) {
      return null;
    }
  }

  const local = safeStorage("localStorage");
  const session = safeStorage("sessionStorage");
  const markupPalette = document.documentElement.dataset.palette;
  const requestedPalette = queryPalette();
  let currentPalette = requestedPalette
    || readStorage(local)
    || readStorage(session)
    || (paletteById.has(markupPalette) ? markupPalette : DEFAULT_PALETTE);

  /* Run before DOMContentLoaded when the partial is placed in the document head. */
  document.documentElement.dataset.palette = currentPalette;
  if (requestedPalette) {
    writeStorage(local, requestedPalette);
    writeStorage(session, requestedPalette);
  }

  function element(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function swatchesFor(palette) {
    const group = element("span", "palette-lab__swatches");
    group.setAttribute("aria-hidden", "true");
    palette.swatches.forEach((color) => {
      const swatch = element("span", "palette-lab__swatch");
      swatch.style.setProperty("--palette-lab-swatch", color);
      group.append(swatch);
    });
    return group;
  }

  function buildRegister() {
    if (document.querySelector("[data-palette-lab]")) return;

    const register = element("aside", "palette-lab");
    register.dataset.paletteLab = "";
    register.setAttribute("aria-label", "Development palette comparison");

    const toggle = element("button", "palette-lab__toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "palette-lab-panel");
    toggle.append(element("span", "palette-lab__toggle-label", "Palette"));
    const current = element("span", "palette-lab__current");
    toggle.append(current);
    const toggleSwatches = element("span", "palette-lab__toggle-swatches");
    toggle.append(toggleSwatches);

    const panel = element("section", "palette-lab__panel");
    panel.id = "palette-lab-panel";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "palette-lab-heading");
    panel.append(element("p", "palette-lab__eyebrow", "Development proof"));
    const heading = element("h2", "palette-lab__heading", "Editorial ink register");
    heading.id = "palette-lab-heading";
    panel.append(heading);
    panel.append(element("p", "palette-lab__note", "Canonical source hues · sunlight optics held constant"));

    const choices = element("div", "palette-lab__choices");
    choices.setAttribute("role", "radiogroup");
    choices.setAttribute("aria-label", "Website palette");

    PALETTES.forEach((palette, index) => {
      const choice = element("button", "palette-lab__choice");
      choice.type = "button";
      choice.dataset.paletteValue = palette.id;
      choice.setAttribute("role", "radio");
      choice.setAttribute("aria-checked", "false");
      choice.tabIndex = -1;
      choice.append(element("span", "palette-lab__index", String(index + 1).padStart(2, "0")));

      const copy = element("span", "palette-lab__copy");
      copy.append(element("span", "palette-lab__name", palette.name));
      copy.append(element("span", "palette-lab__description", palette.description));
      choice.append(copy, swatchesFor(palette));
      choices.append(choice);
    });

    panel.append(choices);
    panel.append(element("p", "palette-lab__keys", "↑↓ choose · home/end · esc close"));
    const status = element("p", "palette-lab__status");
    status.setAttribute("aria-live", "polite");
    panel.append(status);
    register.append(panel, toggle);
    document.body.append(register);

    const choiceNodes = Array.from(choices.querySelectorAll("[data-palette-value]"));

    function updateToggleLabel() {
      const palette = paletteById.get(currentPalette);
      const action = panel.hidden ? "Open" : "Close";
      toggle.setAttribute("aria-label", `${action} palette register. Current palette: ${palette.name}`);
    }

    function updateRegister(announce) {
      const palette = paletteById.get(currentPalette);
      current.textContent = palette.name;
      toggleSwatches.replaceChildren(swatchesFor(palette));
      updateToggleLabel();
      choiceNodes.forEach((choice) => {
        const selected = choice.dataset.paletteValue === currentPalette;
        choice.setAttribute("aria-checked", String(selected));
        choice.tabIndex = selected ? 0 : -1;
      });
      if (announce) status.textContent = `${palette.name} applied`;
    }

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      register.toggleAttribute("data-open", open);
      updateToggleLabel();
      if (open) {
        const selected = choices.querySelector('[aria-checked="true"]');
        if (selected) selected.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    function applyPalette(id, options) {
      if (!paletteById.has(id)) return;
      const settings = Object.assign({ announce: true, persist: true }, options);
      currentPalette = id;
      document.documentElement.dataset.palette = id;
      if (settings.persist) {
        writeStorage(local, id);
        writeStorage(session, id);
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("palette", id);
        window.history.replaceState(window.history.state, "", url);
      } catch (_error) {
        /* URL synchronization is helpful for proofs, but never required. */
      }
      updateRegister(settings.announce);
      window.dispatchEvent(new CustomEvent("lokta:palettechange", {
        detail: { id, name: paletteById.get(id).name }
      }));
    }

    toggle.addEventListener("click", () => {
      setOpen(panel.hidden, false);
    });

    toggle.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true, false);
      }
    });

    choiceNodes.forEach((choice) => {
      choice.addEventListener("click", () => {
        applyPalette(choice.dataset.paletteValue);
      });

      choice.addEventListener("keydown", (event) => {
        const currentIndex = choiceNodes.indexOf(choice);
        let nextIndex = null;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % choiceNodes.length;
        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          nextIndex = (currentIndex - 1 + choiceNodes.length) % choiceNodes.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = choiceNodes.length - 1;
        } else if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false, true);
          return;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          const next = choiceNodes[nextIndex];
          applyPalette(next.dataset.paletteValue);
          next.focus();
        }
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!panel.hidden && !register.contains(event.target)) setOpen(false, false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) setOpen(false, true);
    });

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && paletteById.has(event.newValue)) {
        applyPalette(event.newValue, { announce: false, persist: false });
      }
    });

    window.paletteLab = Object.freeze({
      get: () => currentPalette,
      set: (id) => applyPalette(id),
      palettes: PALETTES.map(({ id, name }) => Object.freeze({ id, name }))
    });

    updateRegister(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildRegister, { once: true });
  } else {
    buildRegister();
  }
}());
