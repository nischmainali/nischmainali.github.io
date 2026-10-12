# Editorial ink system

Status: accepted and on `main` · Prepared: 21 July 2026 · Promoted: 4 August 2026
· Day and night proofs: accepted 12 October 2026 on `experiment/day-night`

## Purpose

The Ink control lets each browser keep one editorial impression of the Lokta
Field Note. It changes the printed vocabulary, by day and by night, and a
restrained tint in the day's paper, while typography, crop geometry, article
measure, marginalia, mathematics, the room's light, grain, and motion stay
fixed.

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
shows six representative colors: paper, ink, link, heading, accent, and muted
ink. By day they are the source colors; by night, the night proof on the shared
night paper (`night_swatches` in `data/inks.toml`). The stylesheet records the
complete selection, border, and syntax mapping.

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
washes. The room uses a lighter optical adaptation of each flat editor
background (`--sunlit-ink-paper`): peach for Arbutus, warm parchment for
Cyprus, lichen for Elea, verdant paper for Arcadia, and warm ivory for Modus.
The renderer turns it into a tint that changes the paper's hue, never the
light. The tint keeps the room's luminance, shifts the shade fully and the sun
pool by half, and fades out with the day. Every ink therefore reads against the
same light, and the sun stays warm under a green paper. Night has no tint; the
room is shared.

## Fitting the ink to the light

The source themes meet their contrast targets on their own flat backgrounds.
Here text sits on a lit room, so each ink carries two proofs, fitted to the
light actually measured behind text at 1440 and 390 pixels on Home, an article
opening, and a scrolled article.

| Tokens | What they hold |
| --- | --- |
| `--palette-*` | the source theme's colors, exact |
| `--day-*` | the day proof of the readable roles and syntax |
| `--night-*` | the night proof of the same roles and syntax |

**Day.** The darkest 1% behind text is L\* 85.4, the same for every ink now
that the tint keeps the room's brightness. Each readable role starts from its
source color and lowers OKLCH lightness, keeping hue and chroma, only until body
ink reaches 7:1 and every other role 4.5:1. Most roles are the source color or
within 0.04 of its lightness. Where the site deliberately gave a role another
source color (Arbutus's raspberry heading and red accent, Modus's blue accent
and sea-green heading, some diff and error roles), that choice keeps its proofed
value.

**Night.** The ground is ef-dream's, a step deeper (`#1a181c`); the brightest
light behind text, inside the moonlit window, is L\* 25.7. Every ink speaks on one
ladder measured from ef-dream, carrying the hues of its own day roles:

| Role | OKLCH lightness | Chroma ceiling |
| --- | --- | --- |
| Body ink | 0.89–0.93 | 0.035, warm or toward the ink's own voice |
| Muted | 0.715 | 0.022 |
| Link and heading | 0.79 | 0.10 |
| Secondary heading | 0.76 | 0.06 |
| Accent | 0.72 | 0.13 |
| Syntax | 0.72–0.80 | 0.10 (comments 0.05) |

Chroma is three quarters of the day role's, up to the ceiling. Each role then
rises in lightness, if needed, until it reaches 4.5:1 inside the moonlit
window. Lokta Hybrid's night is ef-dream itself, with only its muted ink,
accents, and two syntax roles lifted to clear the window. Body inks stay in a
warm band so the room stays cozy: rose-cream for Arbutus, parchment for Cyprus,
pale lichen for Elea, lilac-cream for Arcadia, and a near-white for Modus.

While the light changes, `body.ink-mixing` blends each role from its day proof
to its night proof in OKLab as the room passes mid-tone, so the turnover runs
through the ink's own colors. Print always uses Lokta Hybrid's day proof.

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
- `assets/js/sunlit.js`, `sunlit-worker.js`, and `sunlit-renderer.js` pass the
  ink's paper tint into the live room.

The controller listens to `lokta:inkchange`, reads the palette's paper tint,
and hands it to the renderer, which draws the next frame with it. It does not
restart the worker, the light's clock, or a change in progress.

## Review protocol

Inspect Home, Documents, the scratch opening, code and tables, mathematics,
TOC, and marginal notes. Check the closed and open selector by day and by night
at 1440, 1180, 1024, 768, 390, and 320 pixels. Verify pointer and keyboard
opening, arrow selection, Escape return, focus-leave dismissal, navigation and
reload persistence, linked overrides, tab synchronization, reduced motion,
forced colors, printing, no-JavaScript fallback, console output, and horizontal
overflow.

Automated screenshots must request `?ink=lokta-hybrid` (or another explicit
ink) so a clean JavaScript browser does not exercise the intentionally random
first-visit assignment. A linked ink is temporary and does not overwrite the
browser's remembered choice until the test deliberately selects a row.
