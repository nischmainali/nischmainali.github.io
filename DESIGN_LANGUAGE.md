# Design language and long-term visual working note

- Last baseline study: 2026-07-20
- Accepted production direction: **Lokta Sunlight reader + Lokta Field Note**
- Production branch: `main`
- Accepted implementation lineage: `experiment/toc-outside-sheet`
- Pre-promotion main archive: `archive/pre-field-note-main-2026-07-20`
  (`d37a896`)
- Earlier article checkpoint: `c26729b`
- Hugo version: `v0.164.0+extended`
- Reference theme checkout: `/Users/nisch/code/site/hugo-paged`
- Live site repository: `/Users/nisch/code/site/nisch-hugo-site`

## Purpose of this note

This is a durable brief for future work on Nisch's personal website. It is not a
request to freeze the current implementation, and it is not a generic design
system specification. It records what already feels specific to this site, what
came from the base theme, which experiments have become meaningful, and how to
judge additions borrowed from the other website clones in the surrounding
project.

The governing constraint is simple: the site should feel authored. It should not
drift toward a fashionable portfolio template, a product landing page, or the
smooth but anonymous visual language commonly produced by AI site generators.
Changes should deepen the site's existing character instead of replacing it.

## Design north star

The clearest description of the current direction is **a living scholarly
page**: a lightly typeset piece of printed matter, placed in a changing patch of
natural light.

The two halves are equally important:

- **Scholarly page:** bookish serif typography, restrained measure, crop marks,
  editorial hierarchy, bibliographic content, dingbats, and very little interface
  chrome.
- **Living light:** a cool-white fibrous surface under soft architectural
  shadows, an organic portrait treatment, and a shade/sunset transition that
  changes the geometry and atmosphere rather than merely recoloring the page.

The site should remain calm, literate, personal, slightly eccentric, and
material. It can be playful, but the play should come from a small number of
recognizable gestures—not a pile of effects.

## What is already distinctive

### 1. The page as an object

At desktop widths the body is a centered 992 px sheet-like field with generous
inset space. Eight minimal crop-mark strokes sit at its corners. The marks evoke
printing and book production without drawing a literal border or card around the
page. On smaller screens the crop marks disappear rather than crowd the content.

This is inherited from `hugo-paged`, but it is still foundational. The local
version makes the marks more delicate than the upstream theme: it replaces the
old masking rectangles with eight one-pixel background strokes. Do not turn the
page into a rounded container, a floating glass panel, or a conventional centered
white card.

### 2. Editorial rather than interface typography

The main face is **Linden Hill**, falling back to Palatino and then a generic
serif. It gives the site its bookish, hand-shaped texture. **Jost** is reserved
for navigation, metadata, and footer matter. This division creates a useful
contrast: prose and titles feel literary; navigational data feels quietly
modern.

Current key measurements at the studied desktop viewport:

- body text: 16 px with a 1.5 line height;
- reading column: 720 px (locally widened from the upstream 620 px);
- home introduction: about 18.7 px with a 1.5 line height;
- home title: responsive, capped around 31.2 px;
- article title: 32 px with a 48 px line height;
- top navigation and metadata: about 14.4 px in Jost.

These numbers are a baseline, not immutable tokens. Preserve the relationships:
prose first, metadata quieter, headings expressive without becoming oversized
marketing display type. Avoid generic geometric sans-serif headings, overly bold
hero type, and type scales designed to advertise rather than invite reading.

### 3. Dingbats as a signature

The large, extremely faint `❧` behind page titles and the smaller `❡` before
publication entries are memorable signatures. The title mark is wine-brown at
very low opacity in both shade and sunset.

Treat these as typographic marginalia, not logos. They should feel discovered on
the page. Do not multiply decorative symbols across every component or turn the
floral mark into a loud brand stamp.

### 4. The Lokta sunlight environmental field

The environmental layer reconstructs the visible optics of
`https://www.sunlit.place/` on a Nepal-biased fibrous sheet. Nisch removed the
reference's vertical mullion and all of the earlier canopy, falling-leaf, and
multi-frond systems after visual review. Its identity comes first from projected
window light, Lokta material, and a restrained lichen cast. The only current
botanical exception is the optional, sunset-only niuro study documented below;
it must remain one quiet cropped accent, never a second foliage system.

The scene has two states. **Shade** keeps a shallow move from warm covered paper
toward a clearer green-white window side. **Sunset** uses the reference's peach
multiply light with a small green-gold bias. Both states keep daylight ink.
Treat them as two positions of one sun and shutter system, rather than a light
theme and dark theme.

A finite projected slat field drives the rays. Each source slat is 180vw wide:
a 100vw solid `#c7c7c7` border joined to an 80vw material surface. Ten-pixel
transparent top and bottom mitres make that solid border taper from 76 to 56 px
in desktop shade and from 40 to 20 px at sunset. Phone shade tapers from 62 to
42 px. Source periods are 64/58 px in desktop/phone shade and 73.6/66.7 px at
sunset. Every slat shifts left by one viewport percent, rotates four degrees in
depth around 90vw, and passes through a 50vw perspective. The parent plane moves
from -20 to -16 degrees and travels 10vw along its own rotated axis. This is a
projective fan, not a parallel repeating texture. Do not cross-fade two stripe
textures or flatten the child plane back into a two-dimensional period.

The shade right edge keeps a six-pixel base blur. Sunset adds a restrained
optical bloom to 10.5 px; it softens the projected boundary without changing
slat width, phase, or depth. Sunlit's rotated progressive stack occupies
`[-0.5H, W-0.5H]`, not `[0,W]`, and layers 0.5, 8, 25, 50, and three overlapping
100 px masks. The cached shader uses their second-moment Gaussian equivalent;
the overlap reaches roughly 135 px at the covered edge. A separate 85-degree
desktop or 75-degree phone paper veil covers the left field and fades
continuously. In sunset its normalized reveal is raised to the power `1.52`,
allowing the mid-left repetition to dissolve sooner while leaving the
window-side depth nearly unchanged. Its aspect-ratio-aware coordinate must never
collapse into a vertical boundary.
The visible viewport lies almost entirely in the solid border extension, so it
uses one neutral shadow pigment in shade and sunset; warm light changes its
appearance without replacing it with a darker sunset color.

The slat aperture changes over 500 ms, the plane settles over 1.2 seconds, the
base diffusion blooms over 1.8 seconds, and the peach field over three seconds.
Raking paper relief enters after a 550 ms delay over 4.8 seconds and returns over
2.4 seconds. The rays stay still after reaching either endpoint. Continuous life
comes from the reference-matched Gaussian grain at twenty stepped positions per
second. Under `prefers-reduced-motion`, the complete optics and mode transition
remain intact while the grain advances at a gentler ten positions per second;
the pause control freezes the ambient clock.

A sparse set of paired highlight-and-shadow fibres remains near-invisible in
shade and resolves under raking sunset light. Keep the local tonal difference
around three to five percent. The fibres should register as paper thickness on a
second look. Cursor parallax and drifting ray phases do not belong here.

Home, Documents, and articles share the field. Route attenuation protects the
article measure while the outer sheet retains the full projection. Check all
three before changing shadow strength. Page navigation preserves the mode,
grain clock, seed, and any active transition. The next page must enter the same
patch of light without a loading veil or replay.

The worker renders one opaque canvas and caches the paper and shutter pass.
Ambient frames copy that surface, add grain, and apply the sunset multiplier.
The projective shader finds the nearest source slat analytically and evaluates
thirteen neighbours, enough for the widest overlapping blur while remaining
independent of viewport height. The renderer performs no work in response to
scroll. Keep the worker fallback, DPR cap, deterministic asset versions, and
static CSS poster. Performance work may remove redundant computation, but it
must preserve the progressive blur, transition continuity, paper relief, and
build-time mathematics.

#### Accepted successor: Lokta Sunlight reader

The implementation developed on `experiment/lokta-sunlight-reader` is the
accepted reconstruction of Sunlit's optics on the Lokta Field Note. The
checkpoint at `c26729b` preserves the preceding article and environmental
implementation; the accepted lineage continues through
`experiment/toc-outside-sheet` and `main`.

The pass notes below form a chronological record. Later headings supersede the
implementation claims in earlier headings. The ray-first optics pass records
the current environmental state.

The live Sunlit production bundle supplied the control measurements. The first
Sunlit-calibrated checkpoint matched these parts of the reference:

- the 85-degree desktop field and 75-degree phone field, including the 20 and
  45 percent clearing points;
- the 64/58 px shade periods, 74/67 px sunset periods, and 56/42/20 px shutter
  depths;
- the shutter plane's change from -20 to -16 degrees and its 10vw sunset travel;
- the independent 24 px vertical mullion with its right edge at 70 percent of
  the viewport, with shutter diffusion strongest on the left and sharpest on
  the right;
- a generated 512 px Gaussian grain field with the reference mean, deviation,
  eleven offsets, and twenty stepped positions per second;
- two cropped canopy envelopes, 300 instanced peepal silhouettes, and thirty
  edge-bound falling leaves with 3 to 6 second travel;
- the reference clocks: 0.5 seconds for slats, 1.2 seconds for the plane, one
  second to reveal foliage, 0.5 seconds to hide it, and three seconds for the
  sunset field.

Four choices remain specific to this site. The paper keeps a low-chroma lichen
cast at the reference luminance. Peepal and niuro forms replace the generic
rounded leaves. A broad attenuation field reduces shadow contrast beneath
Documents and article measures. The controls keep names, state, keyboard focus,
persistence, reduced-motion handling, and a remembered atmosphere pause.

The browser receives one opaque WebGL2 canvas. A worker owns it when
`OffscreenCanvas` is available; the same renderer runs on the main thread as the
first fallback, and a complete CSS poster remains beneath both. The renderer
caches paper and shutters in an RGBA8 texture. Steady frames copy that texture,
draw the instanced plants, add grain, then apply the sunset multiplier. It
redraws the paper texture during a mode or route change and after resize. Scroll
never enters the environmental controller.

The controller stores the mode, seed, scene epoch, ambient offset, and an active
transition. A destination page resumes the same phase. The poster remains until
the first canvas frame reaches full opacity. The renderer caps backing-store
area at 2,304,000 pixels, so a large display cannot create an unbounded canvas.

The branch also strengthens the static document plane. Hugo resolves equation
and statement references during the build. Citations use stable occurrence IDs
and an alphabetical author-year bibliography. The References heading enters the
ordinary Markdown outline. Wide code and figures clear marginal notes, while a
shared 2.6rem gutter separates notes from equation numbers. The dense specimen
keeps dual KaTeX HTML and MathML by default; a MathML-only build flag remains
available for browser and assistive-technology testing.

Visual QA on 19 July 2026 covered 1440, 1180, 1024, and 390 px in shade, settled
sunset, and during the mode change. A 3200 px immediate fling kept prose and
mathematics painted in the worker tier. The page reported no horizontal
overflow. The open contents fold cleared the theme control at phone width, and
the 1180 px layout retained 2.25rem between rail and prose plus 2.6rem between
prose and marginal notes. Safari, Firefox, VoiceOver, and a midrange phone remain
useful checks before future renderer changes.

#### Reference-calibrated finishing pass (20 July 2026)

The finishing pass compared live Sunlit captures with the local renderer at the
same desktop and phone sizes. Keep these values together. Small independent
changes can return the sunset field to brown or make the shade field look split
in two.

- The live paper runs from `vec3(0.992, 0.976, 0.962)` near the window to
  `vec3(0.962, 0.970, 0.948)` at the far edge. The CSS poster uses `#fdf9f5`
  and `#f5f7f2` so its first frame meets the canvas without a cool flash.
- Sunset uses the full `vec3(1.015, 0.758, 0.571)` multiplier. The extra red
  restores Sunlit's apricot luminance. The paper and shadows carry the site's
  green cast.
- A linear veil replaces the delayed smooth ramp. One broad field shadow models
  the overlap between Sunlit's blur bands, while a second periodic shadow keeps
  the shutter rhythm legible near the right edge. The shadow colors sit near
  neutral moss: `vec3(0.655, 0.660, 0.645)` in shade, with a small move toward
  `vec3(0.425, 0.435, 0.395)` at sunset.
- The canopy follows Sunlit's radial opacity envelope, correlated vertical
  displacement, and 45 to 225 degree rotation range. Blur grows toward the left
  from 8 to 38 px. Peepal outlines remain the local leaf vocabulary.
- The niuro frond ends at roughly `(0.76, 0.47)`. Its pinnae use 6 to 10 px blur
  and low gains, so the frond reads as a shadow signature near the edge. Falling
  leaves retain Sunlit's count and timing with less opacity on phones.
- Article route attenuation is `[0.74, 0.95]`; Documents uses `[0.84, 0.95]`;
  Home remains `[1, 1]`. Do not brighten an article's reading measure by
  weakening the whole environment.
- The CSS poster hands off in 140 ms. The controls keep their 20 px visible
  geometry and gain seven horizontal and three vertical pixels of invisible hit
  area. The two crop-corner controls do not overlap.
- A page with an opening initial preloads the 10 KB readable F2 face. Its fixed
  square can show the letter at once; the 169 KB F1 ornament may arrive later
  without moving the prose.
- Reduced-motion preference leaves the clock running at 30 frames per second. It
  lowers lateral leaf travel and fern sway to 32 percent. The pause control alone
  freezes the scene.

The local sunset keeps a small Nepal-specific green-gold bias. At 1440 px its
clean right field measured about `rgb(218,174,133)`, compared with Sunlit near
`rgb(217,169,129)`. The local shutter variation also remains softer. Nisch had
already asked for warmer light with less depth and weaker dark shadows, so treat
both differences as accepted constraints rather than missed calibration.

#### Hybrid shadow restoration pass (20 July 2026, superseded)

Nisch removed the vertical mullion and falling leaves after reviewing the
calibrated successor. This checkpoint retained two niuro fronds and an
edge-cropped peepal canopy. The later ray-first pass removed those remaining
forms.

The mode change now borrows the predecessor's optical choreography without
restoring its costly DOM filter stack. Shade and sunset use complete shutter
fields at their fixed endpoint periods and depths. The renderer cross-fades
those fields over 1.8 seconds while the plane moves for 1.2 seconds and paper
color changes over three. Botanicals use 1.6 seconds. Raking relief enters after
a 550 ms delay over 4.8 seconds and returns to shade over 2.4 seconds. A reversed
toggle scales each remaining channel duration to its current distance from the
new endpoint.

This pass also removes the broad dark field wash. A small paper-colored veil
keeps the window side luminous, while the periodic shutter field carries the
architectural shadow. Preserve the current worker, cached texture, route
attenuation, session clock, and active-transition handoff. Reduced-motion mode
keeps the full environmental timing and 20 fps ambient surface; it must not
collapse the mode transition.

The same pass restored the home portrait's crop-sheet registration. `.home`
remains an unpositioned flex item with its own stacking level, so the absolute
portrait uses the page as its containing field. At 1280 px the portrait begins
near `(788, 198)` and measures about `291 × 218` px. The semantic introduction
keeps its 1.17 em / 1.5 rhythm, and the portrait returns to document flow at
768 px and below.

The article finishing values are a 36rem prose measure, a 42rem breakout, an
8.25rem contents rail, and a 2.25rem rail gap. Prose uses 1.055rem at 1.61 line
height. At 1180 px the rail and title share the 134 px inset and prose begins at
302 px. At 1179 px the rail becomes the in-flow disclosure without overlap.

Final browser checks covered the opened and closed outline at 1180 and 1179 px,
the mathematical section at 1024 px, and the complete opening at 390 px. Home,
Documents, code, tables, equations, sidenotes, citations, shade, and sunset
showed no page-level overflow or console errors. A 5030 px phone fling painted
the destination content and fixed canvas in the first captured frame. Two
captures 700 ms apart under reduced motion differed across the live surface,
confirming that the environmental clock continued.

#### QA and continuity polish (20 July 2026)

The environmental controller now gives each saved mode change an exact end time.
It derives that time from the channel distances, so a partial reversal keeps
only the time needed to reach its new endpoint. The pre-paint header and the live
controller read the same value and discard expired records. During page changes,
the source poster stays beneath the canvas until the resumed frame reaches full
opacity. The sun control announces the requested destination during that short
handoff instead of describing the source poster.

Home now anchors its title dingbat to the title itself. The portrait keeps the
accepted crop-sheet geometry and cross-fades its shade and sunset veils over a
1.6 second interval. Documents constrains its
measure to the paper inset from 768 through 799 px, removes the doubled interval
before the first entry, and gives entry titles a wine hairline and forest-ink
focus state. These changes extend the existing print vocabulary without adding
cards or motion.

Opened articles place the skip link first in keyboard order and label both
navigation regions. The sticky outline keeps its small type, but interactive
nested entries and the return link use a stronger quiet ink over sunset. We
reviewed Home, Documents, the scratch specimen, and the Gaussian-process note at
1280, 1180, 1179, 768, and 390 px in shade and sunset. The 4200 px article fling
kept the prose and canvas painted. Route handoffs, active outline tracking,
mathematical overflow, focus treatment, page width, and the browser console
showed no new fault.

#### Ray-first optics pass (20 July 2026)

Nisch removed the remaining canopy and both fern compositions. The renderer now
uses five channels: aperture, plane, diffusion, sunset, and paper relief. It no
longer compiles a botanical shader, creates instance buffers, uploads foliage on
resize, or draws plant fragments during ambient frames.

The live Sunlit bundle corrected two earlier assumptions. Its slat aperture
morphs over 500 ms; an inert parent transition had made 1.8 seconds look like the
ray clock in the stylesheet. Its 10vw translation runs along the rotated slat
axis and does not shift an infinite stripe field across its normal. The current
shader follows those mechanics. It morphs one indexed field, applies the plane
translation in local coordinates, and keeps diffusion fixed in both modes. The
serialized diffusion channel remains only so an older in-flight page transition
can cross a navigation boundary without invalid state.

A Gaussian-damped Fourier field now convolves the complete periodic shutter
instead of blurring one isolated slat. It therefore preserves the correct shadow
duty cycle beneath the 50 and 100 px covered-side blur. The right edge begins at
six pixels; an independent 200-degree pigment feather, a one-percent-per-band
fan, and the broad oblique veil replace the former common cutoff. This removes
the periodic modulus seam, doubled midpoint pattern, and vertical dark boundary.
The shadow uses one green-biased neutral pigment in shade and sunset.

Browser checks covered Home and the scratch article at 1280 and 390 px in both
states, plus both directions of the transition. The pages kept their width, the
worker remained active, and the phone article preserved its reading hierarchy.
The final promotion matrix still needs the other routes and browsers listed in
the experiment gate.

#### Projective shutter correction pass (20 July 2026)

Direct matched captures showed that the ray-first field was not yet close
enough. Its direction was broadly right, but its bands remained parallel, the
shadow bodies were too thin, and their reveal began 350 to 500 px too late. The
cause was structural: the shader had reproduced the parent rotation but omitted
Sunlit's child `rotateY(4deg)`, `perspective: 50vw`, 100vw solid border, and
transparent border mitres.

The successor now inverts the complete CSS homography per fragment. At a
1280 × 720 viewport its computed shade shutter rectangles agree with the live
reference to sub-pixel rounding: shutter 0 begins near `(2.98, -801.91)` and
measures about `2084.06 × 750.35`; shutter 8 begins near `(93.20, -343.35)` and
measures about `2063.94 × 882.04`. The effective far-right periods now match at
roughly 70 px in shade and 79–80 px at sunset, while ray angle changes across
the fan instead of remaining globally fixed.

Filtered slats composite source-over rather than by additive clamping. The
progressive blur coordinate includes the rotated stack's `0.5H` offset, and its
overlapping mask variances are accumulated before the six-pixel base blur. The
paper veil uses the exact aspect-aware 85/75-degree direction. Because the DOM
reference blurs that veil after compositing while the cached renderer folds the
operations into one pass, the desktop analytical stop begins at 13 percent to
match the reference's apparent 20 percent stop; phone remains at 45 percent.

Endpoint audits at 1280 × 720 found matching projective slopes, periods, shadow
depths, and 10–90 edge widths. Shade and sunset retain a deliberately small
Nepal-specific difference in paper fibre and green cast. No vertical mullion,
canopy, fern, or falling leaf returned in that checkpoint. A 13-neighbour analytic lattice lookup
replaced the fixed 20-slat loop, preserving broad-blur tails while supporting
tall viewports and reducing transition work. Home, the mobile article, and a
long mathematical fling remained painted; the CSS poster still exists only as
the short pre-WebGL and failure fallback.

#### Optical edge and niuro experiment (20 July 2026)

The final ray pass leaves the already matched band width, ten-pixel mitre,
period, Gaussian edge, and progressive-blur field alone. Instead it corrects
the finite shutter boundary: the source blurs the ends of each projected slat,
whereas the first projective shader clipped them with a binary step. The new
finite mask converts the screen-space optical sigma back into shutter-local
space before feathering both ends. This extends the broad left penumbra without
softening the accurately matched window-side edges. The redundant 0.96 shadow
ceiling is also gone; the reference veil now sets the final limit by itself.

Sunset carries one restrained botanical shadow. It is a
partly opened niuro / pani-niuro frond, informed by the long pinnate form of the
Nepali wild food ferns documented in the [review of Nepalese food
ferns](https://pmc.ncbi.nlm.nih.gov/articles/PMC9699988/). This is not a return
to the old canopy: one deterministic rachis enters mostly from beyond the
upper-right crop, with paired lanceolate pinnae and a quiet crozier. It fades in
only after the shutter has opened, is weaker on Documents and articles, and has
its own smooth 640-to-760 px responsive entrance. That independent fade prevents
a cropped rachis from popping in or resembling the rejected vertical mullion on
tall narrow screens; it does not alter the shutter's exact 600 px breakpoint.

The niuro is deliberately static. It lives inside the cached paper shader,
beneath grain and sunset multiplication, so scrolling adds no draw call,
texture, filter surface, or DOM animation. Its strength is controlled
by `data-fern-strength` on `#sunlit-scene`; removing that attribute or setting it
to zero restores the foliage-free endpoint. The shader rejects the niuro path
before evaluating its morphology whenever the frond is invisible, including
shade and narrow widths. The ambient grain renders at its native twenty distinct
states per second rather than redrawing the same state three times at 60 fps;
reduced motion uses ten. Mode transitions remain 60 fps.

The final sunset-boundary calibration is intentionally limited to diffusion and
veil response. A twelve-frame grain-averaged audit against the reference found
the 10–90 percent window-side edge widths within roughly one pixel at 1280 px;
the `1.52` veil curve removes the remaining over-defined mid-left shoulder. Do
not compensate by changing shutter period, finite-edge masking, progressive
blur geometry, pigment opacity, or the shade endpoint.

### 5. An unboxed portrait

On the home page the portrait occupies the right side of the introductory area.
It has no radius, card, frame, or visible drop shadow. A gentle mask softens the
outer edge, while a very light veil tunes it toward the surrounding page. On
mobile it moves into normal flow and centers at a restrained width.

This treatment was deliberately developed across recent commits and then made
flatter and brighter. Preserve the sense that the photograph is printed or
burned into the page. Do not default to a circular avatar, a rounded profile card,
or a heavily filtered cutout.

### 6. Sparse navigation and quiet interaction

The visible primary navigation is only `HOME` and `DOCS`, aligned to the upper
right above a one-pixel rule. The active item is indicated by a short, dark wine
underline. Links use a dark teal-blue (`#005077`) and usually a fine dashed or
dotted underline. Publication links invert to white on teal on hover; most other
links remain understated.

The theme toggle is the reference's tiny 18 px sun/moon control at half opacity.
Whenever the crop-mark frame is present, it occupies the open upper-left corner:
its center sits two pixels inward from the implied intersection of the two crop
strokes. At wide viewports its fixed coordinates follow the centered 992 px
sheet, so the alignment does not drift as exterior margins grow. Below the crop
system it returns to the original 20 px viewport inset. It should remain a nearly
ambient utility, not become a prominent call-to-action.

Interaction vocabulary should stay small: underline, ink-color shift, subtle
background fill, and atmospheric theme transition. Avoid pill buttons, glowing
outlines, springy transforms, moving links, and fleets of icon buttons.

#### Experimental editorial ink register (21 July 2026)

The palette proof now has a public-candidate successor on
`experiment/toc-outside-sheet`. A tiny printer's registration mark occupies the
upper-right crop corner as the exact spatial counterpart to the upper-left
light control. It opens one square Lokta proof slip down and inward from the
crop intersection. The slip preserves the successful comparison register's
hairlines, representative swatches, Linden Hill/Jost division, and paper
texture. It adds no scrim, blur, rounded container, or toolbar.

The two crop instruments have separate responsibilities. The left control
moves the sun and shutter field; the right control changes editorial ink. Ink
selection never restarts the WebGL worker, redraws its cached paper, or changes
the grain and transition clocks. Opened articles let both instruments leave
with the masthead so neither can cover the contents rail or marginalia.

Lokta Hybrid remains the canonical HTML, no-JavaScript, print, and
storage-failure impression. On a first capable visit, the browser assigns one
ink from Lokta Hybrid, Ef Arbutus, Ef Elea Light, and Ef Arcadia and stores that
choice on the device. All six proof inks remain selectable in the experimental
register; Ef Cyprus and Modus Operandi Tinted do not enter the random pool. A
manual choice replaces the assignment. A valid `?ink=` link applies only to the
linked page until the visitor chooses an ink.

Treat the random choice as local printing variation, not visitor tracking. It
uses no cookie, account, request, or server record. The accepted shade and
sunset contrast corrections remain part of each ink, and the control must keep
its keyboard, touch, forced-color, reduced-motion, and cross-tab behavior. This
section records an experiment pending Nisch's visual review; it does not yet
replace the Lokta Hybrid color baseline below.

## Page grammars

### Home

The home page is a compact self-introduction, not a hero landing page. It contains
a name, two short statements of research interest, a CV link, a portrait, and a
plain selected-works list. Its asymmetry—the portrait beside the introduction,
with publications spanning below—adds character without introducing a grid of
cards.

Keep the opening direct and conversational. The publications should read like a
bibliography, not like product tiles. If future home sections are added, first
ask whether they belong in the same editorial flow. Default answer: do not add a
new dashboard-like section.

### Documents list

The `Docs` page is technically the Hugo `blog` section but is presented as a
documents shelf. Each entry uses an italic title, quiet date, and a short preview
with a thin vertical rule. The local design intentionally removed the base
theme's dotted leaders and auto-numbered page counts.

New listing treatments should preserve the feeling of an annotated contents
page. Do not convert this into a card grid with thumbnails, tags, read-time badges,
and rounded metadata chips.

### Article

Article pages give the title and floral mark the full page width, followed by a
subtitle and a single low-contrast metadata line. The actual prose is narrowed to
the 720 px reading measure. Categories and topics are text with delicate dotted
baselines, not badges. Headings, blockquotes, tables, code, footnotes, and an
optional table of contents come from the print-oriented theme vocabulary.

Preserve the distinction between wide editorial matter and the narrower reading
column. Avoid wrapping the article in a second container, adding a sticky social
rail, or surrounding metadata with UI chrome.

#### Lokta Field Note article system (accepted)

The system developed on `experiment/article-reading-system` makes the opened
article a more complete editorial object while deliberately leaving the
Documents list, global navigation, environmental field, and page frame alone.
It was accepted for mainline use on 20 July 2026 after the sunlight-reader and
exterior-contents passes.

The experiment borrows editorial machinery from the local
`slotThe.github.io`/Tony Zorman reference, particularly its clear post opening,
section permalinks, server-rendered technical material, and attention to notes.
It does not copy the reference's global sidebar, enormous bold titles, stark
palette, or mobile composition. Its local contents rail and sidenotes instead
translate the reference's useful proportions and reading behavior into a
scholarly field note typeset directly onto the existing lokta sheet.

Its mathematical system combines slotThe's build-time and strict-source
discipline with TurnTrout's accessible HTML+MathML delivery, responsive
overflow cues, keyboard focus, and print care. Those ideas are re-authored for
this page: formulas remain bare ink on the Lokta surface, numbers use the quiet
Jost marginal voice, and statements read as book passages rather than panels.
This provenance and the mathematics layer are part of the accepted reader.

The TurnTrout-derived successor pass adds editorial mechanics that strengthen
the existing paper without importing that site's visible identity. The site
now serves its text faces and grain texture itself, gives article images
intrinsic geometry, and lets selected scientific plates enter the right
marginal field. Its opening initial uses the complementary EB Garamond Initials
F1 and F2 faces from the official OFL source. Forest ink sits over a muted
madder ornament; the color stays fixed, and the glyph has no motion or
surrounding component. TurnTrout's random accent treatment and first-line
transformation do not belong here.

The accepted Gwern-intelligence pass borrows editorial behavior from
[Gwern.net's design system](https://gwern.net/design) while leaving its
grayscale appearance and interface chrome behind. It adds an authored
epigraph, a compact academic-link grammar, reciprocal sidenote focus, a running
section trace and progress rule in the contents rail, and a full-resolution
figure viewer. Each addition uses the existing Linden Hill/Jost division, wine
hairlines, square paper geometry, and shade/sunset variables.
The pass adds no remote annotations, recursive popups, backlinks,
transclusion, or second toolbar. Citation previews remain deferred even though
the build-time bibliography is now present.

The accepted `experiment/toc-outside-sheet` lineage adds one further spatial
idea. On a
genuinely wide viewport, the crop marks become the edge of a real reading
sheet: the contents rail leaves that sheet completely and hangs in the quiet
left desk field. It keeps a 1.5rem interval from the crop boundary. At the
opening it occupies the approved subtitle/date–epigraph hinge; as the article
moves, it travels into a quiet upper reading band rather than remaining at
decorative dead center. Its real box stays bounded by the article, so it still
arrives and departs with the text. The prose grows continuously from 36rem at
1360px to 37.5rem at 1440px instead of changing measure at the breakpoint.
This is not a generic fixed sidebar and must never acquire its own card, veil,
or page chrome; its character comes from the asymmetry and its dialogue with
the crop marks. At the default type size, the exterior arrangement begins only
at 1360px, where the full 8.25rem rail retains a 28px viewport margin. Enlarged
reader type delays that change until the rail can still fit honestly. From
1180–1359px the accepted inset rail returns unchanged, and below 1180px the
existing in-flow treatments remain in force. A full-screen review exposed one
exception to the otherwise useful asymmetry: when both the exterior TOC and a
real right marginal field are present, the old 220px/41.6px channels read as an
accidentally missing column. Those pages now declare their marginalia at build
time and form a calibrated triad. The TOC and marginalia retain their approved
outer positions. An initial arithmetically equal arrangement proved too close
because the compact, dark TOC carries more visual weight than the wider, quieter
note. The final composition therefore gives the TOC side a steady 10rem channel
and lets the note side contract gently from about 7.1rem to 6.35rem as the prose
grows. This places the prose between its original centered position and the
literal midpoint: balanced by perception rather than generic symmetry. If
either the TOC or marginalia is absent, prose remains centered on the sheet;
never reserve an empty column merely for template symmetry.

Asana Math 000.962 supplies the mathematical voice. Linden Hill revives
Goudy's Deepdene, and its page texture calls for a warm old-style companion.
Times-derived math brought an institutional tone. KaTeX's Computer Modern
looked like default TeX. Asana's Palatino lineage brings open counters, soft
curves, and a calligraphic italic without the upright system that Euler would
impose. TeX discussions pair Asana and Pagella with Palatino-like book faces;
Asana's softer drawing suits the live specimen.
Modern browsers render the native MathML with Asana's OpenType MATH table.
KaTeX's metric-matched HTML stays in the document as a legacy fallback.

Its governing choices are:

- the title, subtitle, and floral mark remain in the wide editorial field while
  prose uses a calmer 36rem / 576 px measure. Its 1.055rem Linden Hill body
  and 1.08rem opening paragraph are slightly more generous than the surrounding
  site type; mathematics keeps its previous optical size rather than scaling up
  with the prose. Code and explicitly wide figures may make only a modest
  42rem / 672 px breakout; at rail widths these technical objects grow into
  the right gutter rather than centering back across the contents rail. Tables
  stay with the prose;
- the opening begins one compact optical interval below the navigation rule.
  Title, subtitle, and date form a close descending stack; the floral mark is a
  restrained watermark tucked above and left of the title, never an icon, badge,
  or separate decorative component;
- an authored opening may begin with one three-line Lokta initial. It hangs a
  fraction into the left optical gutter and keeps the following Linden Hill
  prose unchanged. The foreground letter remains selectable and readable. A
  separate empty, accessibility-hidden span carries the ornamental layer.
  One invariant float reserves exactly three opening lines at every measure;
  the painted square is aligned independently inside it, so neither responsive
  reflow nor font scaling can move its ink away from the first line. There is no
  second mobile calibration and no transform on the float itself. The initial
  leaves a deliberate interval before the rest of the word. Shade and sunset
  use fixed two-ink calibrations, with a quieter ornament at sunset;
- the title area carries only the publication date beneath the subtitle. Author,
  revision, reading-time, category, and topic registers were explicitly removed
  after the first specimen proved them to be unnecessary complication;
- the title field ends in whitespace rather than a full-width divider. Section
  headings likewise rely on type and rhythm, not repeated horizontal rules;
- at 1180 px and above, contents become a slim, article-local sticky rail in the
  left margin. From 1180–1359px, the rail is 8.25rem wide with a 2.25rem inner
  interval; its left edge lands exactly on the title's paper inset while the
  interval remains open beside wide code and figures. At 1360px and above, the
  outside-sheet experiment moves that same rail wholly past the left crop mark,
  preserves a 1.5rem exterior interval, enters beside the date/epigraph, then
  settles between 2.5rem and 4.5rem from the viewport top while scrolling. Its
  prose measure interpolates from 36rem to the restrained 37.5rem maximum
  described above. On an article with real marginalia, the prose axis shifts
  left to form weighted optical channels: more air follows the denser rail,
  while the quieter note remains visibly attached to its sentence. The two
  outer fields themselves do not move. Reserved old-style section
  numbers, typographic indentation, and an active ancestor trail make hierarchy
  legible at a glance. A wine reading-progress rule and the current H2/H3 path
  remain fixed above the independently scrolling outline, which quietly keeps
  the active entry in view. The managed wide rail stays open and its summary
  leaves the tab order; without JavaScript the native disclosure remains usable.
  Below that breakpoint, contents return to the reading flow and remember the
  reader's disclosure choice. From 768 to 1179 px, an expanded outline becomes
  two balanced columns; on phones it returns to one. A small `top` link at the
  far edge of the wide rail targets the article title rather than an empty URL
  fragment;
- the shade/sunset control keeps its crop-corner placement at the page opening
  but scrolls away with the masthead on articles, so it can never cover the TOC,
  code, or prose;
- section `§` links are generated by Hugo, appear quietly on hover or focus, and
  sit inside the flow on mobile;
- quotations, definition lists, code, tables, figures, mathematics, and endnotes
  use hairlines, paper-toned fields, and the site's ink colors rather than boxed
  components;
- figures use the same measure, shallow breakout, and right marginal field as
  the surrounding article. Natural media retain their source color. The `ink`
  treatment lets diagrams multiply into the visible fibres without a white
  card. A marginal “Lokta plate” may cross the right crop mark at wide sizes and
  returns to the prose measure before the marginal field becomes cramped.
  Informative figures retain a full-resolution source link without JavaScript.
  The article reader enhances that link with one native dialog: a square second
  sheet, two restrained crop corners, the original caption, and a translucent
  environmental veil. Figures with author-supplied links, decorative figures,
  and `zoom="false"` figures stay outside this behavior;
- Hugo renders mathematics at build time as KaTeX HTML and MathML. Pages load
  exact local assets only where needed, with no runtime renderer or math CDN.
  MathML Core browsers use local Asana Math; KaTeX HTML provides the fallback.
  Unnumbered displays have no border, fill, or label; numbered equations borrow
  a narrow optical gutter without entering the sidenote field;
- genuinely wide formulas scroll without shrinking. Directional edge masks are
  transparent, appear only while overflow exists, and preserve the visible
  fibres and changing light beneath them. Only scrollable formulas enter the
  keyboard order;
- theorem, definition, remark, and proof helpers remain unboxed typographic
  passages. Small-cap labels, shared local numbering, italic theorem bodies,
  upright definitions, and a quiet proof square extend the old-book grammar;
- fenced code is highlighted at build time with Chroma and receives a very small
  local copy control. Its shallow breakout is for long lines, not spectacle;
  article pages no longer depend on Prism or the theme's DOM mutation helpers;
- ordinary Markdown footnotes remain endnotes, while the explicit `sidenote`
  shortcode supplies optional Tufte-style right-margin notes on wide screens.
  Their field grows fluidly from 13.25 to 16.5 rem, begins one quiet 2 rem interval
  beyond the prose, and may cross the right crop mark: the crop frames the paper,
  not the annotation. These use the reading face and a number hanging outside
  the note as in the slotThe reference. At smaller widths they become
  tap-to-reveal inline notes with no filled panel. Pointer or keyboard focus on
  either member of a sidenote pair inks both members and reveals one short wine
  registration stroke beside the marginal note. The interaction changes no
  geometry;
- epigraphs form a narrow italic pause before opening prose. Unequal pale
  opening and closing marks make the quotation complete without forming a
  symmetrical frame; a right-aligned attribution replaces the border and fill
  used by ordinary blockquotes;
- Markdown article links receive a small build-time grammar. PDF, DOI, arXiv,
  and same-page section destinations gain quiet Jost suffixes. Ordinary
  external links keep the existing baseline treatment. Marks stay out of TOCs,
  figure links, equation references, footnotes, and print;
- the ending is only a rule and a text link back to Documents. It introduces no
  call-to-action card or additional ornament.
- print preserves the article hierarchy rather than imitating the screen
  environment. It removes blending, fades, controls, and marginal positioning;
  keeps equations, statements, and figures together where possible; and adds
  the destination of external links in plain text.

Article authoring controls are intentionally few:

- `subtitle` and `show_toc` are optional front-matter controls. Mathematics is
  detected during rendering and requires no page flag;
- the inline `dropcap` shortcode takes one Latin letter and appears only at the
  opening of a prose paragraph. The source checker permits one per article;
- the local `figure` shortcode accepts `placement="measure|wide|margin"` and
  `treatment="natural|ink"`. Legacy `wide="true"` maps to the wide placement.
  Hugo supplies responsive variants and intrinsic dimensions for processable
  resources. Authors mark at most one above-fold image with `priority="true"`
  and may opt out of full-resolution focus with `zoom="false"`;
- the `epigraph` shortcode requires attribution or a source and accepts Markdown
  within its quotation. It belongs before opening prose and remains distinct
  from ordinary blockquotes;
- the `smallcaps` shortcode is available for genuinely editorial inline use;
- the `sidenote` shortcode is reserved for optional context that should remain
  adjacent to a sentence without becoming part of the endnote apparatus;
- ordinary mathematics uses `$...$` and `$$...$$`, with the longer slash
  delimiters retained for compatibility. Numbered equations and restrained
  statements use the `equation`, `eqref`, `statement`, `statement-ref`, and
  `proof` helpers documented in `MATHEMATICS.md`;
- headings, fenced code, tables, definition lists, blockquotes, unnumbered
  mathematics, and footnotes otherwise remain ordinary Markdown.

### Accepted citations and deferred intelligence

Citation and bibliography support now runs entirely at build time. A small,
hand-verified registry in `data/citations.toml` supplies the `cite` and
`references` shortcodes. Hugo emits stable occurrence IDs, linked author-year
labels, an alphabetical list of works cited on the page, reciprocal backlinks,
and semantic bibliography and biblioref roles. The source checker rejects
unknown keys, duplicate keys within one citation, a missing or prematurely
placed `references` shortcode, and multiple bibliographies.

The visual treatment adapts slotThe's bibliographic discipline without copying
its table. Citations remain concise; entries stay unboxed in the reading measure;
DOI, arXiv, and external links use the quiet link grammar. References should
read as the final pages of the same field note. Remote citation previews,
automatic metadata fetching, CSL processing, and cross-page citation graphs
remain deferred until real articles justify their cost.

The private draft `content/blog/scratch.md` is the visual specimen for this
system. Keep it as a broad regression fixture rather than turning a public post
into a component catalogue. For future changes, verify the real Gaussian-process
article as well as this specimen in shade and sunset, at
1440, 1280, 1180, 1024, and approximately 390 px, including sticky/active TOC
behavior, keyboard focus, code/table overflow, copy feedback, mathematical
rendering, and the absence of article console errors.

## Color and material palette

The current colors are best understood by role rather than as a large token set:

- shade surface: warm `vec3(0.987, 0.977, 0.966)` clearing toward a faint
  green-white `vec3(0.985, 0.989, 0.979)`;
- sunset light: the reference-calibrated `vec3(1.015, 0.758, 0.571)` multiply
  field with a restrained rhododendron cast near the upper right;
- architectural shadow: one moss-neutral `vec3(0.772, 0.786, 0.766)` pigment,
  shaped by progressive diffusion rather than a darker sunset color;
- paper surface: locally generated lokta-like pulp beneath fine moving grain,
  plus a sparse paired-stroke relief revealed by sunset's raking light;
- legacy warm page variable: `#fbf7f0` (not the active environmental surface);
- daylight ink: near-black;
- primary link: `#005077`;
- active navigation in light mode: `#40141f`;
- title dingbat in light mode: `#5d3026` at very low opacity;
- article heading greens/blues: `#184034` and `#093060`;
- borders: muted violet-brown at low opacity;
- block backgrounds and shadows: warm rose/peach, never neutral gray by default.

Do not expand this into a rainbow palette. New colors should look plausible as
ink, paper, plant shadow, dusk, or reflected light. Saturated color should be a
small event.

## Anti-generic guardrails

Unless Nisch explicitly asks for one in a particular context, avoid:

- rounded cards, nested panels, dashboards, bento grids, and masonry portfolios;
- generic oversized hero copy with a gradient-filled keyword;
- glassmorphism, blurred floating navigation bars, and luminous borders;
- pill-shaped tags, skill chips, status badges, and button-heavy sections;
- purple/blue AI gradients, mesh blobs, particles, star fields, or circuit motifs;
- anonymous geometric sans-serif type as the dominant voice;
- stock illustrations, generic 3D objects, and decorative laptop mockups;
- scroll-triggered entrance animation on every block;
- uniform twelve-column layouts used merely because a framework makes them easy;
- excessive explanatory labels, eyebrow text, and `Learn more` calls-to-action;
- copy that sounds like a personal-brand landing page rather than Nisch speaking.

This does not prohibit modern CSS or rich interaction. It means every visible
device must earn its place in this particular editorial world.

## Borrowing from the other website clones

The surrounding folders are references, not a parts bin to empty into this site.
When Nisch points to an element from another site:

1. Identify the underlying quality being requested—rhythm, information
   structure, transition, texture, typographic behavior, or interaction.
2. Separate that quality from the source site's branding and component styling.
3. Adapt one element at a time into this site's type, ink, paper, spacing, and
   motion vocabulary.
4. Put it next to the current pages in the in-app browser and judge it as part of
   the whole, in both shade and sunset states.
5. Keep it only if the result feels inevitable here. A recognizable collage of
   borrowed website sections is a failure even when each section is attractive.

Record provenance in code comments or this note when a borrowed interaction is
complex or likely to be revisited. Do not preserve source-site quirks that do not
serve Nisch's content.

## Implementation map and provenance

The site is intentionally small:

- `hugo.toml` — site identity, menus, theme selection, output formats;
- `content/_index.md` — home structure and selected works;
- `content/blog/` — documents and draft test pages;
- `static/css/custom.css` — local page/layout refinements and portrait treatment;
- `static/css/sunlit.css` — shade/sunset poster, paper handoff, and controls;
- `static/textures/lokta-fibres.svg` — the repeating pulp-scale paper field;
- `static/textures/lokta-raking-relief.svg` — archived predecessor plate; the
  current renderer synthesizes the paired raking fibres procedurally;
- `static/textures/gaussian-noise.png` — the licensed local reference for the
  source grain; production synthesizes the same 512-pixel Gaussian statistics
  once in the worker and does not request this 231 KB file;
- `assets/js/sunlit.js`, `sunlit-worker.js`, and `sunlit-renderer.js` — state and
  route continuity, worker lifecycle, the cached projected-light plane, paper
  relief, and procedural grain;
- `layouts/blog/single.html` — site-owned opened-article structure scoped to
  Blog posts, leaving generic pages and the vendored theme template untouched;
- `layouts/baseof.html`, `layouts/blog/section.html`, and
  `layouts/docs/section.html` — the Hugo 0.164 list-template bridge. It preserves
  the vendored theme's existing Documents and Notes markup while keeping its
  legacy layout files untouched;
- `layouts/_markup/` — Hugo 0.164 site-owned heading, link, image, code, and
  mathematical passthrough hooks;
- `layouts/partials/article-meta.html` and `article-end.html` — article opening
  and quiet return treatment;
- `layouts/partials/render-math.html` — the one strict build-time KaTeX entry
  point shared by Markdown and numbered equations;
- `data/math.toml` — the deliberately small central macro table;
- `layouts/partials/foot_custom.html` — article-specific removal of legacy
  runtime helpers and conditional local article behavior;
- `layouts/shortcodes/` — figures, epigraphs, sidenotes, small caps, numbered
  equations, references, statements, proofs, and the explicit opening initial;
- `layouts/partials/responsive-image.html` and
  `layouts/_markup/render-image.html` — one Hugo-native image path for figure
  shortcodes and ordinary Markdown images;
- `assets/images/` — processable article media and the private technical
  specimens used for layout review;
- `static/css/fonts.css` and `static/vendor/fonts/` — local Linden Hill, Jost,
  and EB Garamond Initials faces with pinned source revisions, checksums, and
  license records beside each family;
- `static/vendor/katex/0.17.0/`, `static/vendor/asana-math/000.962/`, and
  `static/css/math.css` — pinned KaTeX fallback assets, the local OpenType MATH
  face, native-MathML selection, and transparent overflow behavior;
- `static/css/article.css` — the scoped Lokta Field Note reading system;
- `assets/js/article.js` — local contents and running trace, code copy,
  sidenote/reference numbering and coupling, figure focus, mathematical
  overflow focus, and resize behavior; it never typesets mathematics;
- `scripts/check_content.py`, the compatibility `scripts/check_math.py`, and
  `MATHEMATICS.md` — strict source/build validation and the authoring contract
  shared with future agents;
- `layouts/partials/sunlit.html` — the fixed environmental layer and theme control;
- `layouts/partials/static-asset-url.html` — deterministic source-byte versions
  for stable static CSS and texture paths;
- `layouts/partials/js-asset-url.html` — Hugo-minified, content-fingerprinted
  JavaScript URLs, paired with immutable production browser-cache headers;
- `themes/hugo-paged/layouts/partials/header.html` — pre-paint theme state and the
  session-wide environmental motion epoch;
- `themes/hugo-paged/` — a vendored and locally modified base theme;
- `/Users/nisch/code/site/hugo-paged` — a separate current upstream checkout for
  reference only.

The vendored theme is not identical to the current upstream checkout and must
not be synchronized wholesale. Hugo is now pinned at 0.164.0, while only the
site-owned render hooks were moved to the current `_markup/` lookup structure;
the locally modified theme otherwise remains the visual foundation.
The vendored CSS also changes the reading width, warm palette, link colors,
heading colors, crop-mark construction, metadata spacing, and dark-mode
strategy. Never replace the vendored directory wholesale during routine work.

Prefer site-level files for page-specific additions. Change a vendored theme file
only when the primitive genuinely belongs to every page or cannot be overridden
cleanly. When touching a vendored file, compare it with the upstream checkout and
keep the local divergence explicit.

The `public/` directory is generated output and is intentionally ignored. Treat
source files as authoritative; do not hand-edit generated HTML or generated CSS.

## Current behavior verified in the in-app browser

On 2026-07-15 the baseline was served at `http://127.0.0.1:1315/`. The accepted
Lokta Conservatory worktree was separately verified at `http://localhost:1316/`
so the checkpoint remained untouched. The baseline server command was:

```sh
hugo server --renderToMemory --disableFastRender --bind 127.0.0.1 \
  --port 1315 --baseURL http://127.0.0.1:1315/
```

The following behavior was observed in the accepted worktree:

- Home, Docs, and the Gaussian-process article load and navigate correctly.
- Linden Hill and Jost load successfully in the browser.
- The theme toggle changes the environmental geometry and atmosphere and persists
  the choice for later page loads. Text remains daylight ink in both states.
- Link navigation preserves the settled shade/sunset geometry and the shared
  animation phase without inserting a loading-color flash. Only an intentional
  theme-toggle press replays the atmospheric transition.
- The initial toggle label states the actual action; its pressed state and label
  update correctly after each theme change.
- No browser console warnings or errors appeared in the tested flow.
- At a 390 x 844 viewport, the home, documents list, and article had no
  horizontal overflow.
- At mobile width the portrait moves into flow and measures about 240 px; the
  title and prose use the available 358 px content width.
- With reduced motion active, the grain and mode transitions continue.
- Home, Docs, and article pages intentionally share the same gently calibrated
  environmental strength.

On 2026-07-17 the TurnTrout-derived successor was built with Hugo 0.164.0 and
reviewed at `http://127.0.0.1:1318/`. The review covered the private scratch
specimen and the Gaussian-process article in shade and sunset at 1440, 1280,
1180, 1024, and 390 px widths. It established that:

- the initial keeps one readable, selectable letter while its second ink remains
  hidden from accessibility text. Its two local font layers load only on pages
  that use the shortcode;
- the marginal scientific plate occupies the right field at wide widths and
  returns to the prose measure at narrower widths without page-level overflow;
- the `ink` treatment preserves the visible fibres in both environmental states;
- sidenote identifiers remain stable across Hugo's repeated content renders,
  while visible numbering restarts at one and mobile tap-to-reveal behavior
  continues to work;
- Home retains its accepted geometry and does not request remote type or grain
  assets; and
- the browser console remained clear in the tested article flow.

A final site-wide QA pass on 2026-07-17 also confirmed that production and draft
builds complete with Hugo 0.164.0; malformed mathematics stops the build with its
source position; Home, Documents, and non-mathematical articles do not request
KaTeX or Asana Math; the mathematical specimen still receives its complete local
math system; and the main routes contain no empty links, broken images, or
page-level overflow at 1280 px and 390 px.

On 2026-07-17 we reviewed the Gwern-intelligence pass, later accepted into the
reader, at 1440, 1180, 1179, and 390 px in shade and sunset. We checked the
running mathematical
section trace, paired sidenote hover and focus, mobile note disclosure, academic
link names, and the figure dialog's focus transfer and return. The dialog kept
its full-resolution fallback link, caption, square paper geometry, and quiet
fibre undertone at each size. Home, Documents, and the Gaussian-process article
kept their previous geometry, and the browser reported no console errors. Both
strict production and draft builds passed; the old remote-GIF draft warning
remains unchanged.

A second 2026-07-17 review refined the contents apparatus and epigraph. The
numbered outline, active ancestor trail, progress rule, nested breadcrumb,
internal scrolling, exact 1180/1179 transition, two-column compact outline,
remembered phone disclosure, and focus treatment were checked in shade and
sunset; the no-JavaScript disclosure fallback was source-verified. A long
legacy article confirmed that
the rail keeps deep active entries visible. The epigraph now carries unequal
paired marks at wide and phone measures. Browser consoles remained clean, and
strict production, draft, syntax, and content checks passed.

A third 2026-07-17 pass addressed mathematical-page arrival and the last rail
collision. Timestamp cache-busters became deterministic source hashes; the
primary reading face now precedes low-priority grain; the then-current shade
deferred sunset-only leaf construction; and the environmental, outline, and formula scripts batch
or cache repeated work. Warm local reloads of the complete scratch specimen
settled at 47–48 ms in the inspected browser. The narrower 36rem prose measure
and right-growing 42rem technical measure leave a 2.25rem interval between
contents and code while registering the rail exactly with the title. The exact
1180/1179 transition, active section trace, shade and sunset, closed and open
phone contents, and widths from 1440 through 390 px were checked without
horizontal overflow or console warnings.

On 2026-07-19 the first paint-budget pass replaced the old fixed-element tree
with one scene. The successor experiment above removes that pass's scroll pause,
keeps stepped grain, and stores the expensive paper work in a cached texture.
Opened posts place the environmental and reading
sheets on explicit sibling paint planes. The first article image fetches at
normal priority. Future work must preserve this separation.

## Known rough edges: observe before fixing

These are implementation findings, not permission for a future agent to launch
a cleanup pass. Fix them only when in scope, and preserve the visual language
while doing so.

- A midrange phone still needs GPU, memory, power, and scroll traces before any
  renderer expansion. Preserve the single cached paper pass; do not expand the
  optional niuro into animated/DOM foliage, restore DOM shutters, or add viewport
  filter stacks as part of that test.
- MathML-only output cuts the dense specimen's HTML and element count by more
  than half. Dual HTML and MathML remains the default until Safari, Chromium,
  Firefox, VoiceOver, NVDA, overflow, and print checks pass.
- Several hidden draft/example pages and the old theme `about`/`docs` material
  remain in `content/`. They are useful test fixtures but should not be mistaken
  for authored public content.
- The vendored theme keeps its older layout structure even though deployment now
  uses Hugo 0.164.0. Site-owned templates bridge the current section lists;
  syncing or fully migrating the theme remains a separate task.

## Change protocol for future visual work

1. Start from a concrete page and a concrete user intention.
2. Read the relevant source plus this note; check the working tree before edits.
3. Make the smallest coherent change that can be judged on its own.
4. Inspect it in the visible in-app browser so Nisch can point at it directly.
5. Check the normal desktop view and approximately 390 px width.
6. Check shade and sunset states, focus behavior, overflow, and console errors.
7. Compare against the anti-generic guardrails and the living-scholarly-page
   north star.
8. Do not silently generalize a one-page experiment into a site-wide component.
9. If a change establishes a real new design principle, update this note after
   Nisch has accepted it.

## Short review questions

Before presenting a visual change, the implementer should be able to answer:

- What specifically became more Nisch, more legible, or more useful?
- Which existing gesture does the change extend?
- Could this exact treatment appear unchanged on a thousand AI-generated
  portfolio sites? If yes, it is not finished.
- Does it still feel like one page under changing light?
- Is the quiet version sufficient?
- Does mobile preserve the idea rather than merely stack the desktop layout?
- Can Nisch inspect and comment on the result in the in-app browser?

The site is allowed to evolve. The aim is not consistency for its own sake; it
is continuity of authorship.
