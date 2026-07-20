# Unified site blueprint: the Lokta Sunlight reader

Status: accepted for `main` on 20 July 2026

Prepared: 19 July 2026

Predecessor checkpoint: `c26729b` on `experiment/article-reading-system`

> **Superseded environmental details, 20 July 2026:** Nisch removed the vertical
> mullion, canopy, ferns, and falling leaves after visual review. The current
> branch uses one five-channel ray field with no foliage. It morphs one indexed
> slat projection over 500 ms, moves the plane over 1.2 seconds, and preserves
> fixed six-pixel diffusion and a three-second color clock. Treat the vegetation,
> mullion, and two-field shutter specifications below as historical research.
> `DESIGN_LANGUAGE.md` records the current implementation.

## Accepted implementation record

Phases 1 through 4 were completed through the successor branches and accepted as
the production baseline. Hugo remains the compiler.
The environment uses one opaque WebGL2 canvas with worker, main-thread, and CSS
poster tiers. The article remains static HTML with build-time mathematics,
references, citations, highlighting, and responsive media.

The renderer follows the measured Sunlit geometry, blur direction, grain
statistics, and transition clocks. It keeps three authored departures:
lichen-white Lokta color, route-aware reading attenuation, and accessible motion
controls. The implementation omits Sunlit's foliage and vertical mullion as well
as its React bundle, loading veil, remote noise file, 715-node scene, and live
backdrop-filter stack.

The worker caches the procedural paper and shutter pass in an RGBA8 framebuffer.
It redraws that texture for theme, route, or geometry changes. Ambient frames
copy the cached texture through a shader, add the generated Gaussian grain, and
finish with the sunset multiply field. The shader copy replaces
`blitFramebuffer`, which produced an unpainted default buffer in Chromium during
browser QA. The controller has no scroll listener.

The visual control now uses these source measurements:

| Channel | Implemented control |
|---|---|
| shade plane | -20 degrees; periods 64 px desktop and 58 px phone |
| sunset plane | -16 degrees plus 10vw; periods 74 px and 67 px |
| shutter depth | 56 px desktop, 42 px phone, 20 px sunset |
| veil | 85 degrees/20 percent; 75 degrees/45 percent on phone |
| diffusion | broadest at left, six-pixel edge at right; fixed in both modes |
| grain | generated 512 x 512 R8 Gaussian field; 20 stepped states per second |
| foliage / mullion | deliberately absent |
| clocks | 0.5/1.2/3.0 seconds, plus 4.8-second Lokta relief |

The document pass resolves equation and statement references at build time. It
adds stable citation occurrence IDs, an alphabetical bibliography, References
in the TOC, named endnotes, a prose-targeting skip link, and shared rail/prose/
note geometry. The default math output remains `htmlAndMathml`; an environment
override supports the MathML-only compatibility matrix.

Browser QA on 19 July 2026 covered 1440, 1180, 1024, and 390 px. The worker tier
retained painted mathematics during an immediate 3200 px fling. The tested pages
had no horizontal overflow, and the open TOC cleared both prose and controls.
Production, draft, source, syntax, network, print, and cross-browser checks below
remain the promotion gate.

## Decision

Keep Hugo as the static content compiler for the next implementation pass. Replace
the layered DOM background with one isolated environmental rendering surface,
retain server-rendered article HTML, and measure whether one live MathML
representation can safely replace the current dual mathematical DOM. Add citation
intelligence only after the environmental and reading performance gates pass.

This plan does not propose a smaller ambition. It separates the two kinds of work
the browser must do:

```text
fixed environmental plane          static document plane
-------------------------          ---------------------
light, shutters, paper,             title, prose, MathML,
paper, grain, mode transition       TOC, notes, figures, links

one isolated rendered surface      ordinary streamed HTML
```

The environmental plane may remain elaborate because its updates do not invalidate
the layout or paint of the document plane. It still shares the compositor and GPU
budget with the page, so it must earn that budget in traces. The document may
remain typographically rich because it never becomes the input to a full-viewport
blur or blend pass.

## The target experience

The site should feel like a scholarly sheet of lokta paper lying in live window
light. The light is spatial, slow, and continuous. The page itself is immediate.

Five moments define success:

1. **First paint:** a complete paper field and readable title appear without a
   loading veil. The live field replaces its static first frame without a flash.
2. **Reading:** text, mathematics, code, tables, figures, and notes are already
   present before enhancement JavaScript runs.
3. **Scrolling:** a fast fling never exposes an unpainted band. The environmental
   motion does not pause, restart, or steal the next text paint.
4. **Changing light:** the sun/moon control produces Sunlit's long, physical shift
   in shutter geometry, color, grain, and paper relief. It is not a color-scheme fade.
5. **Following a link:** the new document appears like the next sheet in the same
   patch of light. State, seed, and animation phase do not visibly jump.

The design description remains **a living scholarly page**. “Living” belongs to
the light. “Scholarly” belongs to the document. Neither should make the other
wait.

## What the live Sunlit reference actually does

The live reference was inspected at [sunlit.place](https://www.sunlit.place/) on
19 July 2026. Its current implementation is a small React page rather than the
Jacky Zhao demonstration in the local `sunlit` folder. The observed production
assets were an 8,487-byte stylesheet and a 146,961-byte uncompressed JavaScript
bundle:

- [production stylesheet](https://www.sunlit.place/static/css/main.bee2816d.css)
- [production JavaScript](https://www.sunlit.place/static/js/main.50412513.js)

At a 1280 × 720 viewport the rendered scene contained 715 elements:

- 20 horizontal shutter elements;
- one 24 px vertical mullion shadow at `right: 30vw`;
- 300 static canopy leaves in two broad clusters;
- 30 falling leaves generated along the rightmost quarter of the viewport;
- eight masked progressive-blur stages;
- one moving Gaussian-noise plate;
- a warm multiply overlay for sunset;
- one tiny sun/moon control.

### Reference geometry

The daylight base is a very shallow 85-degree gradient from `#fff` to `#fbf9fa`.
The shutter color is `#c7c7c7`, feathering through translucent `#e8e6e5`.

On desktop, daylight slats are 56 px deep with an 8 px interval. On viewports
under 600 px they are 42 px deep with a 16 px interval. Their initial top offset
is -300 px. Each successive slat shifts left by one percent of the viewport
width. The plane is rotated -20 degrees with a 50vw perspective and a 4-degree
Y rotation.

Sunset changes the plane to -16 degrees and translates it 10vw to the right. The
slats narrow to 20 px and their vertical step expands by 15 percent. Their
individual geometry changes over 0.5 seconds; the larger shutter and perspective
movement settles over 1.2 seconds. The bundle declares a 1.8-second transition
on an unchanged wrapper transform; that inert rule is not reproduced as a
second visible movement.

The reference blur is not one ordinary blur. It rotates an eight-band mask over
the viewport and progresses through approximately 0.5, 8, 25, 50, and 100 px of
backdrop blur, with the 100 px diffusion continuing through the far bands. That
spatial diffusion is what makes the shadows read as depth rather than gray lines.

### Reference motion

The Gaussian-noise plate is oversized by 10rem on each edge. It jumps among ten
offsets during a one-second `steps(2)` loop. The grain therefore moves as a film
texture rather than as a smooth drifting image.

Falling leaves loop for a random 3 to 6 seconds with a random 0 to 3 second delay.
They sway about 50 px to either side, rotate through 180 degrees, grow slightly,
and travel from the upper-right region through the viewport. The canopy itself
does not billow. It appears over one second in sunset and disappears in half a
second in daylight.

The warm `#ffbd8d` multiply field takes three seconds to settle. The container,
slats, canopy, grain, and icon move on different clocks. That stagger is central
to the physical feeling: the scene seems to reorient before the color fully
arrives.

### What to copy and what not to copy

Copy the visible physics:

- shallow daylight gradient;
- diagonal shutter plane and single mullion;
- left-to-right diffusion ramp;
- stepped moving grain;
- peripheral canopy and falling leaves;
- asymmetric, multi-clock mode transition;
- small, quiet control.

Do not copy implementation accidents:

- 715 DOM elements behind every article;
- eight live `backdrop-filter` surfaces sampling the whole viewport;
- a React runtime for a scene with one control;
- a gray 250 ms loading cover;
- new random foliage on every resize;
- a button without an accessible name or state;
- the remote Wikimedia noise image;
- source code or assets whose rights and provenance are not ours.

The rule is **perceptual fidelity, not implementation fidelity**. A clean-room
renderer should reproduce the frames and timings while using local, documented
paper and botanical assets.

Use this fidelity order whenever two goals appear to conflict:

1. match the reference geometry and transition timing;
2. match its luminance, contrast, diffusion, and density;
3. translate hue toward lokta ivory, lichen, and green-gold;
4. translate generic leaves into peepal and fern silhouettes;
5. replace the reference implementation whenever a different method produces
   the same visible frame with less browser work.

## The Nepal translation

The reference's luminance, geometry, depth, and timing remain the control. Hue,
surface, and silhouette carry this site's identity.

### Color map

These are prototype start values. They must be tuned against reference frames in
the browser, but their relationships are fixed.

| Role | Sunlit reference | Lokta translation | Constraint |
|---|---:|---:|---|
| near paper | `#ffffff` | `#f7f6ec` | warm ivory, never beige |
| far paper | `#fbf9fa` | `#edf1e6` | low-chroma lichen, no obvious green split |
| shutter core | `#c7c7c7` | `#b9c3b4` | preserve reference luminance |
| shutter feather | `#e8e6e5a5` | `#dde4d9ad` | soft sage diffusion |
| botanical core | generic gray | `#687866` | peepal/fern register, not black shadow |
| botanical distance | generic gray | `#899785` | cooler and softer than the core |
| sunset field | `#ffbd8d` | `#d7b28a` | green-gold reflected light, restrained amber |
| sunset accent | none | `rgba(143, 58, 65, .08)` | a trace of rhododendron/madder, not a red wash |

The daylight field should change by no more than a few percentage points in
perceived lightness across the 992 px sheet. Green should register after a few
seconds, not announce itself as a gradient. “Solarpunk” here means healthy light,
paper, and plant life. It does not mean neon chlorophyll, glowing controls, or a
green user-interface theme.

### Material

Lokta fibre remains a property of the sheet, not an overlay pasted on the page.
Use two scales:

- a small, irregular pulp texture that is always present;
- sparse raking-light relief that becomes legible only as sunset settles.

Both belong inside the environmental renderer. No blend mode should require the
browser to sample the article text beneath or above them. The current local fibre,
relief, and Gaussian-noise sources remain the provenance-controlled starting
assets.

### Silhouette

Use two botanical voices, no more:

1. a niuro-like fern arc that enters from the lower-right boundary;
2. peepal leaves in the canopy and falling field.

The original canopy density can be retained as one precomposed or procedural mask,
not 300 live elements. The original 30 falling instances can also be retained in
one instanced draw. Their placement stays within approximately 80 to 105 percent
of viewport width, so only a handful are prominent at once. This preserves the
reference's density while respecting the reading measure.

The shade state may retain a three-to-five-percent botanical registration because
that trace is part of the accepted current identity. Sunset reveals the full
composition. This is the one deliberate foliage departure from the live reference,
whose canopy is completely hidden in daylight.

Do not add mountains, prayer flags, mandalas, temple silhouettes, or a catalogue
of regional plants. Those would turn identity into illustration. The distinct
signature is paper and silhouette, not iconography.

## Route-aware calm without separate backgrounds

Home, Documents, and articles must use one scene, seed, and clock. They should not
look like three themes.

They may use one broad **reading attenuation field** inside the renderer:

| Route | Center shadow contrast | Marginal contrast | Purpose |
|---|---:|---:|---|
| Home | 100% | 100% | let the environmental identity establish itself |
| Documents | 86% | 96% | keep titles easy to scan |
| Open article | 78% | 96% | protect long prose and mathematics |

This is not a rectangle, panel, glass card, or paper-colored overlay. It is a
large feathered reduction in shadow alpha under the reading measure. Grain,
fibres, hue, and animation remain continuous across the entire viewport. A
persistent renderer may interpolate the attenuation over 300 ms without changing
phase. Under ordinary Hugo navigation, the destination initializes directly at
its route value; it must not replay a cross-page fade that calls attention to
surface reconstruction.

## Environmental rendering architecture

### Recommended engine

Use a fixed, pointer-inert `<canvas>` controlled by a small WebGL2 renderer. Send
the canvas to an `OffscreenCanvas` worker where supported. Use the same renderer
on the main thread as the first fallback and a static two-state poster as the
final fallback.

Request a deliberately plain context: `alpha: false`, `antialias: false`, no
depth or stencil buffer, no preserved drawing buffer, and a low-power preference.
The scene is opaque and softly diffused, so those buffers cannot improve the
image. If context creation or restoration fails, reveal the poster immediately
and leave the document untouched.

MDN documents both WebGL and worker `requestAnimationFrame()` on
[OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas).
The important property is not “GPU” as a slogan. It is that the whole field becomes
one composited surface. Moving a leaf no longer asks the browser to repaint or
re-blur the article, although the scene still consumes GPU, compositor, texture,
and—under Tier B—main-thread time.

```text
Tier A   WebGL2 in OffscreenCanvas worker   full motion and transitions
Tier B   WebGL2 on main thread              same frames, still one surface
Tier C   local shade/sunset posters         full material and depth, static motion
```

No tier should fall back to hundreds of DOM leaves or viewport backdrop filters.

The canvas must be a top-level sibling of the document, not an ancestor of it.
Give only the canvas an explicit compositor hint. Keep the long article free of
`transform`, `will-change`, or other properties that can promote the entire
4,000-plus-pixel sheet into one giant texture. No `mix-blend-mode`, filter, or
backdrop filter may cross from the scene into the document. Paper, sunset, and
grain blending finish inside the scene before the browser composites ordinary
HTML above it.

The canvas is decorative: `aria-hidden="true"`, pointer-inert, absent from the
tab order, and excluded from print and forced-colors output. The ordinary CSS
paper field is the complete fallback, not a loading placeholder. Text and control
contrast must pass in shade, sunset, and every transition frame.

### Scene passes

The production renderer should remain small and purpose-built. Do not add
Three.js or another scene framework.

1. **Paper pass:** shallow two-color gradient, tiled lokta pulp, sparse relief.
2. **Architectural pass:** analytical shutter stripes, perspective matrix,
   vertical mullion, and the reference diffusion curve.
3. **Botanical pass:** one seeded canopy mask plus instanced peepal leaves.
4. **Atmosphere pass:** sunset multiply field, rhododendron trace, stepped grain.
5. **Reading pass:** route-specific soft attenuation, applied only to shadow
   contrast.

The blur ramp can be implemented by blending prefiltered mask levels or by an
analytical soft-edge function. It should reproduce the reference's 0.5/8/25/50/100
px visual stops without asking CSS to re-sample the viewport eight times.

### Resolution and frame policy

The scene is intentionally soft. Its internal raster does not need retina text
resolution.

- Cap the canvas near one backing pixel per CSS pixel, even on a 2× display.
- Preserve full CSS dimensions so crop, slat, and leaf positions remain exact.
- Target 60 frames per second for leaf travel and mode transitions.
- Permit a 30-frame ambient cadence between transitions only if side-by-side
  motion comparison shows no visible stutter; never change cadence because the
  reader is scrolling.
- Reduce internal resolution before reducing frame cadence if a device misses
  the budget.
- Keep grain as a small tiled texture; do not allocate a viewport-sized noise
  bitmap.
- Recalculate geometry only after a debounced resize, never on scroll.

The worker reads an absolute session epoch rather than accumulating frame deltas.
If the browser suppresses animation in a hidden tab, the next visible frame is
computed from the same clock. MDN notes that
[`requestAnimationFrame()` normally pauses in background tabs](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame);
that is good battery behavior and should not be confused with pausing on scroll.

Treat renderer lifecycle as part of correctness. A route or resize must not create
a second worker, canvas, animation loop, or texture set. Exercise
`webglcontextlost` and `webglcontextrestored`, worker termination, resize/DPR
changes, and fallback activation. Record allocated texture and buffer sizes and
watch process/GPU memory across repeated navigation rather than inferring health
from worker CPU alone.

### State and continuity

Persist three small values:

- `theme`: shade or sunset, in `localStorage`;
- `sceneSeed`: generated once per browsing session, in `sessionStorage`;
- `sceneEpoch`: a session timestamp, in `sessionStorage`.

The seed prevents resize and page navigation from rearranging the canopy. The
epoch lets every new document calculate the same leaf and grain phase. The first
background is an inline CSS gradient plus a small local poster containing only
phase-neutral paper, fibre, and low-frequency light. It deliberately excludes
falling leaves and moving grain, because a fixed image cannot match every session
epoch. The canvas reveals itself only after its first frame is ready and after a
measured, non-flashing handoff. There is no loading overlay.

The mode transition stores its start time and direction. A navigation during the
three-second change must resume at the corresponding physical state rather than
snap to either endpoint.

These values provide **phase continuity**, not **surface persistence**. Hugo's
full-document navigation destroys the old canvas and reconstructs a new one at
the same phase. Test the old-canvas-to-destination-poster and destination-poster-
to-live-canvas handoffs separately, under cold cache and CPU throttling. A later
persistent-navigation proof may keep the surface alive; it must not be credited
with that behavior before it exists.

### Scrolling

The environmental renderer must have no scroll listener. It does not read scroll
position, change quality during a fling, or toggle `animation-play-state`.

This is a direct correction to the archived implementation. Its
`static/js/sunlit.js` set `scrollActive` on every scroll, added
`.is-motion-paused`, and resumes only 800 ms after scrolling stops. The reported
pause is therefore deliberate current behavior, not a mysterious browser defect.

### Motion preference and control

Reduced motion must preserve the complete paper, light, diffusion, and foliage
composition; it must not collapse the blur system or erase the environmental
identity. It should freeze continuous grain and falling-leaf travel, shorten the
spatial part of the mode change, and crossfade between the same fully composed
end states. This refines the earlier design note's wish to preserve the scene:
the scene stays; involuntary continuous motion does not.

Phase 2 must also provide a keyboard-accessible, persistently remembered “pause
atmosphere” action. Its presentation should be as quiet as the sun/moon control
and need not add permanent dashboard chrome, but it cannot be deferred. Pausing
freezes grain and travel at the current frame while leaving light, depth, paper,
and route attenuation intact.

## Static reading architecture

### Keep Hugo

Hugo is not the cause of runtime lag. On the study machine, Hugo 0.164.0 built 50
pages, including drafts, to a clean `/tmp` destination in about 102 ms and emitted
complete static HTML. That number is evidence, not a universal benchmark; every
future comparison must record Hugo version, exact command, cache state, draft
policy, destination medium, and machine profile. Hugo already provides:

- strict build-time KaTeX through `transform.ToMath`;
- current Goldmark render hooks;
- conditional mathematical assets;
- build-time syntax highlighting;
- intrinsic responsive images;
- stable Markdown/frontmatter sources;
- direct HTML with no framework hydration.

Hugo's official [`transform.ToMath`](https://gohugo.io/functions/transform/tomath/)
documentation confirms that mathematics is rendered during the build and can be
emitted as MathML, HTML, or both. Changing the generator would not change the
cost of the current full-screen filters or the number of mathematical elements
the browser lays out.

### Generator decision table

| Candidate | Static prose and math | Persistent scene | Migration cost | Decision |
|---|---|---|---|---|
| Hugo 0.164 + isolated renderer | already complete | session-clock continuity; full document reload | low | **use now** |
| Astro static + `ClientRouter` | possible, but math/render hooks must be rebuilt | a persisted canvas may remain alive | high | two-route proof only if Hugo continuity fails |
| Eleventy | possible with new plugins/build steps | no built-in advantage | high | no runtime benefit |
| Quartz | strong graph features, larger client system | SPA machinery available | very high | reject for this site |
| Hakyll/Pandoc | strong compilation, complex toolchain | no browser advantage | very high | use Pandoc only as a possible citation subprocess |
| Next/Gatsby/full React | can pre-render, adds an application runtime | possible | extreme | reject |

Astro is the only reasonable migration candidate because its optional client
router can persist state while its default output remains static. Its own
[documentation](https://docs.astro.build/en/guides/view-transitions/) also notes
the costs: client navigation intercepts links, scripts need reinitialization,
and CSS animations can restart even on persisted elements. Astro must therefore
prove continuity on the real canvas, history, focus, fragments, and print before
it earns a migration.

Do not write a custom partial-navigation router under Hugo merely to avoid that
test. Correct focus, history, hash, form, download, error, and back/forward
behavior is a product of its own.

### The migration gate

After the isolated renderer is integrated under Hugo, record 50 same-origin
navigations across Home, Documents, the scratch specimen, and the Gaussian
process article.

Stay on Hugo if all of the following hold:

- no white or gray field is visible between documents;
- neither the old-canvas-to-poster nor poster-to-live handoff produces a
  perceptible luminance flash or foliage jump in 60 fps recordings on the
  reference machine and a throttled profile;
- mode and session phase are perceptually continuous;
- content is interactive immediately;
- back, forward, and fragment navigation remain native.

Build a two-route Astro proof only if the isolated renderer passes its per-page
performance and visual gates but Hugo's destruction of the live surface still
causes a visible navigation discontinuity. Migrate only if the proof preserves
the canvas across navigation **and** matches or improves HTML size, first paint,
focus behavior, math accessibility, print, and no-JavaScript fallback. A
framework change is a measured last step, not a design reset.

## Mathematics that feels printed and immediate

### Current evidence

The current dense scratch page contains about 110 KB of raw HTML, 2,645 total
elements, and 28 formula pairs. Its mathematical output includes roughly 1,354
KaTeX-HTML elements and 582 MathML elements. Modern browsers display MathML while
the entire KaTeX HTML tree remains parsed and retained but hidden. `display:none`
keeps it out of ordinary layout, so a trace—not element count alone—must show that
removing it materially improves parsing, style, memory, or first display.

The hidden KaTeX-HTML subtrees account for about 57 KB of source, compared with
about 13.8 KB for the MathML. The whole page still compresses to roughly 14 KB,
so network transfer is not the main opportunity. DOM construction, style, and
layout are.

This supports one controlled experiment: **one live mathematical representation**.

### Proposed mathematical baseline

1. Keep Hugo's strict build-time parsing, source-position errors, macros, equation
   and statement helpers.
2. Prototype `output: mathml` with local Asana Math as the modern baseline.
3. Compare it with the current `htmlAndMathml` output in Chrome, Safari, and
   Firefox; VoiceOver with Safari; NVDA with Firefox; keyboard overflow; and
   print. The corpus must include aligned equations, cases, matrices, `CD`,
   chemistry (`\\ce` and `\\pu`), every central macro, headings and TOC labels,
   captions, tables, footnotes, sidenotes, numbered equations, and statements.
4. Adopt MathML-only only if the full specimen passes. MathML has been
   [widely available across major browsers since January 2023](https://developer.mozilla.org/en-US/docs/Web/MathML),
   but browser availability does not replace assistive-technology testing. State
   an explicit supported-browser floor; do not infer support from
   `@supports(math-style)`.
5. Verify that MathML retains its TeX annotation and that equation numbering,
   forward/back references, overflow focus, edge cues, accessible labels, and
   `ResizeObserver` logic work without `.katex-html`.
6. If any supported browser/assistive-technology or print path regresses, retain
   the current dual output. Do not ship a client-side renderer or a runtime tree
   swap as an escape hatch.

Do not return to runtime MathJax or KaTeX. Do not use client rendering to make a
generator migration easier.

### Font delivery

Asana Math remains the correct visual companion to Linden Hill. It is currently
256 KB and loaded only on mathematical pages. Keep its early conditional preload
and immutable cache.

Do not subset Asana casually. A mathematical font's MATH table, stretchy variants,
GSUB, and GPOS data must survive. A subset is acceptable only after the complete
regression corpus covers roots, delimiters, matrices, aligned equations, cases,
operators, scripts, chemistry, and print.

Cold font arrival is a layout gate of its own. Asana loading must not move formula
widths, equation numbers, overflow boundaries, headings, or TOC entries; test with
the font cache disabled rather than judging only a warm reload.

The ordinary Linden Hill regular face is only about 21 KB. It should remain the
single universal high-priority font. Jost, italics, initials, and Asana stay
conditional or naturally discoverable. Web.dev's
[font guidance](https://web.dev/articles/font-best-practices) supports cautious
preload and script-based subsetting rather than indiscriminate font preloads.

### Do not skip core article paint

Do not put `content-visibility: auto` on prose sections, mathematical blocks, or
the main article. Paint skipping can make a benchmark look good while recreating
the exact blank bands the reader sees during a fast fling. Use lazy loading only
for later raster images and media with intrinsic dimensions. The first relevant
article image remains eager; `fetchpriority="high"` remains reserved for an image
explicitly marked as the route's priority image.

## The article system: one coherent source map

The reference sites should contribute different kinds of intelligence. Copying
all their visible devices would make a collage.

The global navigation and Documents list are not redesign targets in this plan.
They receive the shared environment, local-asset cleanup, and performance checks,
but their information structure stays intact. The scholarly synthesis applies to
opened articles.

| Source | Owns | Already present | Next useful import | Do not import |
|---|---|---|---|---|
| current Hugo/Lokta work | crop frame, title field, Linden Hill/Jost voice, dingbats, paper identity | complete visual shell and article grammar | stabilization and tokens | rounded cards, generic design system |
| slotThe | static scholarly compilation and marginal discipline | section links, build-time code/math, right notes, narrow measure | central citations, semantic bibliography, optional block note | global sidebar, duplicate TOCs, huge title, Hakyll stack |
| TurnTrout | editorial quality engineering | local assets, explicit dropcap, intrinsic media, accessible math overflow | source validation, media formats, citation durability | Quartz, automatic prose mutation, random dropcap color, claimed sidenotes it does not have |
| Gwern | link-graph, navigation, and annotation intelligence | hierarchical numbering adapted into the current active rail, epigraph, figure focus | restrained citation previews and, later, useful local backlinks | grayscale chrome, recursive popups, transclusion, two-margin runtime note manager |
| Sunlit | environmental optics and time | shade/sunset vocabulary and control | exact geometry, diffusion, motion, transition sequence | React bundle, loading veil, remote noise, 715-element scene |

The division is intentional: slotThe supplies compile-time citation discipline;
Gwern supplies navigation, link-graph, and preview principles; TurnTrout supplies
validation, durability, and accessibility. Bibliography occurrence backlinks are
a conventional scholarly feature rather than a Gwern-specific invention.

### Geometry to preserve

The accepted article geometry is already stronger than the references' literal
layouts:

- 36.5rem / 584 px reading measure;
- 1.04rem Linden Hill body with a slightly larger opening paragraph;
- 8.15rem left contents rail with a 2.1rem inner interval;
- 13.25 to 16.5rem right marginal field;
- a shallow 42.5rem breakout for genuinely wide code and figures;
- crop-aware notes and plates that may cross the right mark;
- title, subtitle, date, and faint floral registration without a divider.

Do not widen the body to imitate TurnTrout or Gwern. Do not restore metadata that
was removed after visual review.

### TOC

The present TOC already improves on Gwern and slotThe in the relevant ways. Keep:

- one semantic outline, not desktop and mobile duplicates;
- hierarchy and reserved tabular Jost numbering;
- active ancestor trail and current-section trace;
- reading progress;
- independent internal rail scroll;
- native disclosure fallback and remembered compact state;
- contents returning to article flow below the wide breakpoint.

The next pass is stabilization, not another aesthetic redesign. Its rail must
never overlap a technical breakout, and all geometry should come from shared
layout tokens rather than compensating offsets. Lint prose headings likely to
wrap awkwardly in the rail, while exempting headings whose mathematical notation
makes length heuristics misleading.

### Sidenotes and block notes

Keep explicit right-margin sidenotes and ordinary endnotes as different authoring
forms. The existing inline sidenote shortcode should stay inline-only. If real
writing needs slotThe's tables, code, or display math in a margin note, add a
separate block-note interface with a separate inline reference and semantic
`<aside>`. Do not silently turn every footnote into a sidenote.

### Dropcap, epigraph, figures, and code

- Keep the explicit, optically tuned two-ink initial. Reserve its full geometry
  before the face arrives. Do not auto-transform the first paragraph.
- Keep the complete paired quotation marks and right-aligned epigraph source.
- Keep intrinsic image dimensions, local responsive variants, natural/ink
  treatments, and the optional full-resolution viewer.
- Move the `ink` treatment from runtime `mix-blend-mode` to a build-time alpha
  treatment when source material permits. Fibres should remain visible through
  diagrams without making the live scene a backdrop dependency of a large image.
- Add a subfigure helper only when a real article needs it.
- Keep Chroma build-time highlighting and the small copy enhancement.
- Never require article JavaScript for legibility.

### Citations: the next substantive article feature

After the environment and math gates pass, add a build-time citation registry:

1. one central BibTeX or CSL JSON source;
2. one pinned citation-processor version and one pinned CSL style;
3. concise linked citations with `role="doc-biblioref"`;
4. page-scoped stable reference identifiers;
5. an unboxed References section labelled with `role="doc-bibliography"`, whose
   entries use `role="doc-biblioentry"`;
6. conventional `role="doc-backlink"` links from each entry to every occurrence;
7. DOI, arXiv, PDF, and full-text suffixes adapted from Gwern's semantic link-icon
   grammar but drawn in the existing quiet type and ink;
8. correct treatment of repeated works, adjacent citations, missing dates, and
   repeated author/year combinations;
9. build failure for missing keys or duplicate identifiers.

Print must retain citation labels, every bibliography entry, and unambiguous
occurrence relationships without preview-only content or clipped identifiers.

Use a real mathematical article to choose authoring syntax and processor. A small
Pandoc/citeproc prebuild is acceptable if Hugo templates become awkward. A
generator rewrite is not. Before adoption, prove that the subprocess preserves
Hugo shortcodes, render hooks, source positions, math, headings, captions,
marginalia, drafts, and acceptable incremental rebuild latency; also diff its
output to detect processor or CSL drift.

Gwern-style previews may follow, but only for formal citations. Generate the
preview fragment at build time, wait roughly 120 to 160 ms for hover intent, and
show one nonrecursive paper-like preview. Its content must be local and either
author-written or rights-cleared—not copied abstracts, remote images, arbitrary
HTML, or runtime API results. The ordinary link must remain complete without
JavaScript. Do not preview every link or embed remote pages and PDFs.

Previews open on focus or hover intent without moving focus; their contents remain
hoverable; Escape dismisses them; Enter or click follows the ordinary citation;
and coarse pointers may omit them. They use square Lokta paper, Linden Hill/Jost,
and existing ink, with no radius, arrow, drop shadow, title bar, toolbar, or chips.
Test viewport and crop-mark collisions at every article breakpoint.

Local backlinks should appear only after the article graph has enough real density
to make them useful: at least two distinct published articles must contain
meaningful in-prose links. Exclude drafts, the private scratch route, utilities,
bibliography self-links, navigation, unpublished pages, tag co-membership, shared
citations, and inferred similarity. A quiet “Elsewhere” section is preferable to
a universal backlink apparatus.

## Asset and runtime policy

### Required baseline

- Every content route is a complete static HTML document.
- No runtime mathematical renderer.
- No runtime syntax highlighter.
- No remote font, script, stylesheet, texture, or analytics dependency.
- All stable assets use content-derived version URLs and immutable production
  caching.
- Core reading survives script failure.
- The environment survives as a static high-fidelity poster if its renderer fails.

The remaining conditional jsDelivr/Prism/xiee paths on non-article routes should
be vendored, replaced, or removed during the site-wide asset phase.

The local baseline explains where to look first. On the dense specimen,
`article.js` is about 26.4 KB raw/6.1 KB gzip, `sunlit.js` about 7.7/2.4 KB,
`article.css` about 48.5/9.7 KB, Asana Math about 256 KB, and the current Gaussian
noise PNG about 236 KB. The current environmental subtree is roughly 72 elements,
while the complete page is 2,645. These are not all equivalent costs: the trace
must distinguish transfer, parsing, layout, paint, compositing, decoded memory,
and animation work before deleting a visible detail.

### Budgets

These are release gates, not aspirations.

| Area | Budget |
|---|---|
| article enhancement JS | at or below 8 KB gzip; current file is about 6.1 KB |
| environmental bootstrap + worker | at or below 16 KB gzip; no framework runtime |
| Gaussian grain texture | at or below 16 KB; current local source is about 236 KB |
| paper + botanical textures | at or below 96 KB combined after visual comparison |
| first-frame poster | at or below 80 KB per responsive state |
| complete environmental cold transfer | at or below 220 KB for the state actually loaded |
| renderer allocation | one canvas, one worker/loop, one texture set; target below 24 MiB decoded GPU resources on desktop and 12 MiB on tested mobile |
| dense scratch raw HTML | below 65 KB if MathML-only passes |
| dense scratch live DOM | below 1,500 elements if MathML-only passes |
| long tasks after first content | none over 50 ms during ordinary reading |
| layout shift | project target below 0.02; never exceed Core Web Vitals 0.1 |
| input response | lab target below 100 ms; never exceed p75 INP 200 ms |
| largest contentful paint | p75 below 2.5 seconds on production mobile |
| environmental render | p95 below 4 ms desktop and 8 ms tested mobile |
| scroll | no blank frame in ten repeated top-to-bottom flings |

Record these numbers for both the scratch specimen and the real Gaussian-process
article, not only the synthetic winner. “Live DOM” means
`document.getElementsByTagName('*').length` after enhancement, including hidden
KaTeX, MathML, and connected SVG descendants; report those three subcounts too.
Raw and gzip HTML come from the same clean production build.

For motion, use five traces per state on the reference Mac and a named midrange
mobile device or fixed throttle profile. Record dropped frames, long animation
frames, main-thread and worker CPU, paint flashing, layer count, and process/GPU
memory where the browser exposes it. Use timer queries only as supporting GPU
evidence: moving work to a worker does not make shader or compositing cost vanish.
For assets, report transfer bytes, decoded dimensions, and buffer/texture
allocations so a tiny compressed file cannot hide an excessive resident cost.

The public Core Web Vitals thresholds are documented by
[web.dev](https://web.dev/articles/vitals): LCP at most 2.5 seconds, INP at most
200 ms, and CLS at most 0.1 at the 75th percentile. This project should beat
those thresholds because a quiet static article has no excuse to sit near them.

CSS transforms and opacity can remain compositor-only, but filters and large
paint areas need direct measurement. MDN's
[rendering guide](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
describes the style, layout, paint, and composition waterfall. The design must
be judged with frame traces, not by counting fewer lines of code.

## Implementation sequence

Each phase has a pass condition. Do not move forward by accumulating visual
patches around a failed architecture.

### Phase 0: freeze and measure

1. Commit the current branch as a named checkpoint without changing its output.
2. Keep the current main background as an archive branch/tag.
3. Create a new experimental worktree for this blueprint.
4. Capture deterministic shade and sunset frames at 1440, 1280, 1180, 1024,
   and 390 px.
5. Record DOM size, raw/gzip HTML, asset transfer, font timing, long tasks, frame
   times, paint flashing, layer count, decoded/GPU allocation, and five-second
   scroll traces for both scratch and the Gaussian-process article.
6. Capture the live Sunlit reference at the same viewport and transition times:
   0, 250, 500, 1200, 1800, and 3000 ms.
7. Record the exact Hugo version and production/draft commands, cache state,
   machine/device profile, and cold/warm condition beside every number.

At minimum, preserve this build record and its output rather than paraphrasing it:

```sh
hugo --buildDrafts --destination /tmp/lokta-baseline --cleanDestinationDir
python3 scripts/check_content.py
```

For each live page, record `document.getElementsByTagName('*').length` plus
`querySelectorAll('math')`, `.katex-html`, and `svg` subcounts after enhancement.

**Pass condition:** the baseline report can explain every visible delay and can
be repeated by a future agent.

### Phase 1: renderer proof

Build three isolated test routes using the same local palette and masks:

1. a literal CSS reconstruction as a visual control;
2. the single-surface WebGL2 renderer;
3. the static poster fallback.

Place the real scratch article above each route. Compare transition frames,
grain, slat geometry, canopy density, scroll traces, and power use. The CSS
control is not expected to ship; it defines fidelity. Re-run on the Gaussian-
process article, then force context loss/restoration, resize and DPR changes,
worker termination, and Tier C fallback.

**Pass condition:** the WebGL route is visually indistinguishable at normal
reading distance, never pauses on scroll, and uses less main-thread/paint time
than both the CSS control and current scene.

If WebGL does not pass, test a pre-rendered two-state video/canvas sequence before
returning to DOM filters. Do not reintroduce viewport backdrop filters on faith.

### Phase 2: environmental integration

1. Replace the current scene only inside the experimental worktree.
2. Add the prepaint poster, worker, state/seed/epoch persistence, and three
   fallback tiers.
3. Recreate the exact multi-clock mode transition.
4. Add route-aware reading attenuation.
5. Remove the scroll pause and all environment scroll listeners.
6. Keep the current sun/moon placement, accessible label, pressed state, and
   crop-corner alignment.
7. Add reduced-motion behavior and the remembered “pause atmosphere” action.
8. Enforce the decorative-canvas, print, forced-colors, and transition-contrast
   contract.
9. Verify Home, Documents, scratch, and the Gaussian-process article before any
   palette micro-tuning.

**Pass condition:** one continuous field serves all routes, no content paint is
coupled to the scene, and all fallback tiers retain the paper identity.

### Phase 3: mathematical and asset pass

1. Run the MathML-only/Asana experiment.
2. Keep the dual output if tracing shows no material win or if browser,
   assistive-technology, overflow, reference, or print behavior regresses;
   otherwise remove the hidden KaTeX tree and only the assets proven unused.
3. Preserve strict build failures and the existing authoring API.
4. Run the complete math-context corpus and cold Asana arrival tests.
5. Audit font timing and subset only safe text/UI faces.
6. Remove every remaining CDN dependency.
7. Preserve eager first media, lazy later media, intrinsic dimensions, and local
   responsive variants; reserve high fetch priority for explicit priority media.

**Pass condition:** the dense specimen visibly paints and scrolls faster, all
mathematical semantics remain exposed, and no mathematical or media layout shifts.

### Phase 4: article intelligence

1. Stabilize shared TOC/prose/note geometry tokens.
2. Add the pinned citation pipeline, semantic bibliography, occurrence backlinks,
   print treatment, and regression fixtures.
3. Add citation-only previews after a real bibliography exists and their complete
   focus, hover, Escape, collision, and coarse-pointer behavior passes.
4. Add block notes, subfigures, local backlinks, or source inclusion only when a
   real article demands each one.
5. Expand source lint for missing references, alt text, invalid dropcaps, duplicate
   IDs, citation keys, and unsupported math.

**Pass condition:** every new behavior has a static semantic core, adds no generic
component chrome, and stays absent from pages that do not use it.

### Phase 5: navigation gate

Run the 50-navigation Hugo test. If it passes, stay on Hugo. If it fails only on
scene persistence, build the two-route Astro static proof described above. Do not
migrate content, shortcodes, or all routes until that proof passes every visual,
performance, accessibility, and print test.

**Pass condition:** the chosen navigation model preserves both native-document
correctness and the environmental moment.

### Phase 6: promotion

1. Run production and draft builds.
2. Run the full visual/performance matrix.
3. Review the result beside the archived accepted background.
4. Update `DESIGN_LANGUAGE.md` only after visual approval.
5. Promote the experiment in one commit series with the archive reference named
   in the merge note.

## Test matrix

### Pages

- Home
- Documents list
- private scratch specimen
- Gaussian-process article
- one short article without math or media
- print output of the scratch and Gaussian-process pages

### Viewports and states

- 1440, 1280, 1180, 1024, and approximately 390 px
- shade and settled sunset
- every reference transition timestamp
- fresh load, warm cache, reload, back/forward, fragment entry
- toggle at rest and while scrolling
- resize during both states
- hidden-tab return

### Browsers and devices

- Codex in-app Chromium, where visual collaboration happens
- current Safari on macOS and iOS
- current Firefox
- one real midrange Android device or an equivalent throttled profile
- VoiceOver with Safari and NVDA with Firefox for article, equation, reference,
  TOC, note, preview, and dialog paths

### Failure checks

- no page-level horizontal overflow;
- no TOC, toggle, equation number, note, or crop collision;
- no white or transparent band during a fast fling;
- no animation pause attributable to scrolling;
- reduced motion and manual pause retain the full composed field without travel;
- no formula flash from a runtime renderer;
- no clipped wide formula, missing equation number, edge mask, or scrollbar in
  print; equations and statements avoid destructive page breaks;
- no unresolved citation/equation/statement warning;
- no remote request;
- no console error;
- no loading veil;
- no movement of prose when fonts or media arrive;
- no renderer memory growth after repeated navigation or resizing;
- context loss, worker failure, and forced colors reveal a complete readable
  fallback without duplicate loops or controls.

## Anti-generic release questions

Before accepting a change, answer all of these:

- Does the scene still match Sunlit's light behavior at the agreed frames?
- Is the difference specifically lokta, peepal, fern, and this site's color, or
  merely “more green”?
- Does the page remain one piece of printed matter rather than a set of cards?
- Did a borrowed feature gain this site's typography and spacing, or does its
  source remain visibly pasted on?
- Does the feature encode meaning, or is it decorative interface inventory?
- Can the prose, mathematics, notes, and references be read with scripts blocked?
- Does fast scrolling show every line immediately?
- Is the environmental motion continuous without competing with the reading
  measure?
- Could the same treatment be dropped unchanged into a generic generated
  portfolio? If so, it is not finished.

## Explicitly rejected directions

- a literal copy of Sunlit's React bundle or generated DOM;
- live full-viewport backdrop filters behind long articles;
- pausing the environment during scroll;
- `content-visibility` on core prose or mathematics;
- runtime MathJax or KaTeX;
- two live mathematical layout trees without a proven compatibility need;
- a framework migration before the isolated renderer is measured;
- a hand-rolled partial-navigation router;
- Quartz, Hakyll, Next, Gatsby, or a custom generator as a performance cure;
- recursive link popups, remote transclusion, two-sided runtime notes, or dense
  Gwern interface chrome;
- restoring article metadata, global sidebars, cards, pills, glass panels,
  gradients with a conspicuous green split, or ornamental Nepal iconography;
- trading the grain, paper, transition, or mathematical fidelity for a spinner or
  placeholder skeleton.

## Source map for future agents

### Current site

- `DESIGN_LANGUAGE.md`: accepted visual language and article provenance
- `MATHEMATICS.md`: authoring contract
- `static/css/sunlit.css`: complete poster, canvas handoff, and quiet controls
- `assets/js/sunlit.js`: state, continuity, capability selection, and fallbacks
- `assets/js/sunlit-worker.js`: worker lifecycle and renderer command bridge
- `assets/js/sunlit-renderer.js`: cached projected paper, periodic ray optics,
  procedural fibres, grain, and clocks
- `static/css/article.css`: article geometry and visual grammar
- `assets/js/article.js`: progressive article enhancements
- `layouts/partials/render-math.html`: strict Hugo/KaTeX entry point
- `static/css/math.css`: native MathML and hidden HTML selection

### Local references

- `/Users/nisch/code/site/sunlit/README.md`: Jacky Zhao's separate CSS/SVG
  reconstruction and its progressive-blur explanation
- `/Users/nisch/code/site/slotThe.github.io`: build-time math/citations, section
  links, marginal-note compilation
- `/Users/nisch/code/site/TurnTrout.com`: validation, media, font rhythm,
  accessibility, and citation engineering
- [Gwern design](https://gwern.net/design),
  [style guide](https://gwern.net/style-guide), and
  [sidenote analysis](https://gwern.net/sidenote): editorial intelligence and
  warnings about runtime marginalia complexity

### Platform references

- [Hugo `transform.ToMath`](https://gohugo.io/functions/transform/tomath/)
- [KaTeX rendering options](https://katex.org/docs/options)
- [MathML Core overview](https://developer.mozilla.org/en-US/docs/Web/MathML)
- [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [animation rendering waterfall](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [paint complexity and paint area](https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Astro static rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro view transitions and persistence](https://docs.astro.build/en/guides/view-transitions/)

## Final architectural rule

Do not make the background simpler to make the article fast. Do not make the
article app-like to keep the background alive. Render the field as one independent
environment, compile the document as static semantic HTML, and let the browser
compose the two.
