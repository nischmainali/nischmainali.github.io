# Editorial ink system

Status: accepted and on `main` · Prepared: 21 July 2026 · Promoted: 4 August 2026

## Purpose

The Ink control lets each browser keep one editorial impression of the Lokta
Field Note. It changes the printed vocabulary and the sheet's restrained paper
cast while typography, crop geometry, article measure, marginalia, mathematics,
WebGL sunlight geometry, grain, and motion stay fixed.

The control occupies the crop frame's upper-right corner, opposite the light
control. The left instrument changes the atmosphere; the right instrument
changes the ink. Its registration-mark button opens a square Lokta proof slip
down and inward from the crop intersection. The slip uses no scrim, blur,
rounded card, or floating toolbar.

## Available inks

1. `lokta-hybrid` — the house synthesis of forest, teal, wine, and muted violet.
2. `ef-arbutus` — peach paper, green, and madder.
3. `ef-cyprus` — ochre, olive, teal, and wine.
4. `ef-elea-light` — lichen, plum, and olive.
5. `ef-arcadia` — verdant paper, violet, indigo, and cool green.
6. `modus-operandi-tinted` — a restrained high-legibility control.

The first-visit assignment draws only from Lokta Hybrid, Ef Arbutus, Ef Elea
Light, and Ef Arcadia. Cyprus and Modus remain available by choice but do not
define a visitor's first impression.

The upstream values come from the current 2026
[Ef themes](https://github.com/protesilaos/ef-themes) and
[Modus themes](https://github.com/protesilaos/modus-themes) sources. Each row
shows six representative source colors: paper, ink, link, heading, accent, and
muted ink. The stylesheet records the complete selection, border, and syntax
mapping.

## First paint and persistence

The HTML starts in `lokta-hybrid`. A small inline head script resolves the
visitor's ink before the browser paints:

1. a valid `?ink=` link for the current page;
2. a valid browser-local choice;
3. a same-tab fallback choice;
4. one random assignment from the approved four-ink pool;
5. Lokta Hybrid when storage cannot retain the assignment.

The browser stores one versioned local record. No cookie, account, visitor ID,
request, or server-side state participates. A manual choice replaces the random
assignment and synchronizes silently across open tabs. A linked impression is
temporary until the visitor chooses an ink; manual selection then removes the
query parameter. No JavaScript, invalid stored data, and printing retain the
canonical Lokta treatment.

The deferred interaction script wires the server-rendered control. This avoids
an inserted-control jump and leaves the page readable when the enhancement is
unavailable.

## Translation into the site

An Emacs theme describes semantic roles on a flat editor background. This site
places text over a moving translucent field, so it maps roles rather than
copying isolated hexadecimal values.

| Website role | Theme role |
| --- | --- |
| Main prose and mathematics | `fg-main` |
| Metadata, captions, marginalia | `fg-dim` |
| Links | semantic link ink |
| Main section heading | principal botanical accent |
| Secondary heading | complementary cool accent |
| Active TOC trace | second editorial accent |
| Dingbat and active navigation | source accent |
| Rules and crop marks | translucent border ink |
| Code and inline-code wash | translucent `bg-dim` |
| Selection | `bg-region` |
| Focus | dark outer line plus source cursor accent |
| Code syntax | source comment, keyword, string, function, type, constant, and variable roles |

Visited links share the normal contrast-safe link color. Navigation history
should not introduce an uncontrolled extra color into the comparison. The
source visited inks remain recorded for later review.

The source paper colors appear exactly on the proof slip and on small secondary
washes. The living sheet uses a lighter optical adaptation of each flat editor
background: peach for Arbutus, warm parchment for Cyprus, lichen for Elea,
verdant paper for Arcadia, and warm ivory for Modus. The adaptation shifts the
cached paper before the existing shadows and sunset multiplier are applied, so
fibres, relief, ray contrast, and the environmental choreography remain intact.

## Moving-surface correction

The source themes meet their contrast targets on their own backgrounds. The
site has a harder surface envelope:

- broad deep shade near `#c5c4c3`;
- broad deep sunset near `#c18f6b`;
- rare grain and fern floors near `#b1b1b1` and `#ad8060`.

Several source accents and each source `fg-dim` become too pale over those
bands. Readable roles use solid shade and sunset inks whose OKLCH lightness was
lowered until small text reached 4.5:1 on the broad field. Body ink also clears
the rare pixel floors. The correction retains the source hue and chroma;
decorative rules can remain translucent because they do not carry meaning.

## Interaction contract

- Enter, Space, or Arrow Down opens the selector; pointer opening leaves focus
  on the registration mark.
- Arrow keys, Home, and End move through the vertical radio choices.
- The selector stays open while comparing inks.
- Escape closes it and returns focus. Outside pointer use or keyboard focus
  leaving the register closes it without trapping focus.
- The active row carries a registration stroke as well as a color change.
- Reduced motion removes the proof-slip entrance. Forced colors remove texture
  and swatches while retaining selection and focus.
- Opened articles let the control scroll away with the masthead so it cannot
  cover the sticky outline, code, or marginalia.

## Implementation map

- `data/inks.toml` is the single registry for labels, descriptions, swatches,
  canonical fallback, and random pool.
- `layouts/partials/ink-head.html` provides the pre-paint resolver and
  fingerprinted assets.
- `layouts/partials/ink-register.html` contains the server-rendered control.
- `assets/css/ink-register.css` maps theme roles and draws the crop-registered
  proof slip.
- `assets/js/ink-register.js` owns interaction, persistence, and tab sync.
- `assets/js/sunlit.js`, `sunlit-worker.js`, and `sunlit-renderer.js` pass one
  calibrated paper impression into the existing cached environmental surface.

The renderer listens to `lokta:inkchange`, reads the palette's calibrated paper
impression, and redraws the cached paper pass exactly once. It does not restart
the worker, grain clock, theme transition, or continuous atmosphere pass.

## Review protocol

Inspect Home, Documents, the scratch opening, code and tables, mathematics,
TOC, and marginal notes. Check the closed and open selector in shade and sunset
at 1440, 1180, 1024, 768, 390, and 320 pixels. Verify pointer and keyboard
opening, arrow selection, Escape return, focus-leave dismissal, navigation and
reload persistence, linked overrides, tab synchronization, reduced motion,
forced colors, printing, no-JavaScript fallback, console output, and horizontal
overflow.

Automated screenshots must request `?ink=lokta-hybrid` (or another explicit
ink) so a clean JavaScript browser does not exercise the intentionally random
first-visit assignment. A linked ink is temporary and does not overwrite the
browser's remembered choice until the test deliberately selects a row.
