# Design language and long-term visual working note

- Last baseline study: 2026-07-20
- Baseline checkpoint: `7c9d201` (`main`)
- Current accepted environmental direction: **Lokta Conservatory**
- Design worktree: `experiment/lokta-conservatory`
- Current opened-article experiment: **Lokta Field Note**
- Article branch: `experiment/article-reading-system` (**not yet accepted**)
- Current environmental successor experiment: **Lokta Sunlight reader**
- Successor branch: `experiment/lokta-sunlight-reader` (**not yet accepted**)
- Archived predecessor checkpoint: `c26729b`
- Hugo pinned for the article experiment: `v0.164.0+extended`
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

### 4. The Lokta Conservatory environmental field

The environmental layer began as an independent reconstruction of the visible
behavior of `https://www.sunlit.place/`. The accepted successor keeps that
reference's excellent light physics—diagonal shutters, the vertical window-frame
shadow, six-stage directional blur, moving Gaussian grain, and the long mode
transition—but gives the surface and silhouettes an identity specific to this
site.

The scene still has two states rather than a conventional light/dark theme.
**Shade** is a gently graded lokta-paper field moving only slightly from warm
ivory toward lichen. The tonal distance across the page must stay shallow: it
should read as one fibrous sheet, not a beige-to-green split. A locally bundled,
procedural fibre texture sits under the finer moving grain. Broad shutter light
provides the environmental movement without visible foliage becoming a second
subject.

The paper also participates in the mode change. A sparse, non-repeating set of
paired highlight-and-shadow fibres is effectively absent in shade, then resolves
slowly behind the sunset color as raking light reveals the sheet's relief. This
response intentionally lags the main color transition and is quieter on mobile.
It should be perceived as thickness in the paper, never recognized immediately
as a drawn pattern. Keep the local tonal difference around three to five percent
and do not add cursor parallax or continuous movement to this layer.

**Sunset** is green-gold reflected light, not a dark mode and not an orange
filter. It narrows and separates the shutters, introduces a restrained
rhododendron blush, and reveals one niuro-like fern composition at the lower
right. The fern is deliberately feathered and edge-bound so it can be distinctive
without occupying the reading measure. Eight sparse peepal leaves fall on
desktop and five on mobile. Their role is an occasional sign of life, not a
continuous foreground event.

The governing rule is **silhouette identity and surface character, not more
darkness or more objects**. Preserve the single-frond composition, low object
count, quiet shadows, local paper fibre, and long motion. New Nepal-evoking
botanical references should refine the silhouette vocabulary rather than add a
second decorative layer. In particular, do not restore the generic 300-leaf
canopy, make the fern darker, or saturate the amber to create more drama.

Home, Docs, and articles share the same environmental grammar, but the accepted
strength is intentionally gentle enough for navigation and long reading. Check
all three before increasing any shadow opacity. Future animation should remain
slow and environmental; bouncing UI, scroll spectacle, parallax stacks, and
gratuitous hover motion are not part of this language. At Nisch's explicit
request, grain, falling leaves, and mode transitions continue even when
`prefers-reduced-motion` is active. Do not silently restore a motion override.

Page navigation must preserve one environmental moment. The chosen state is
applied before first paint, and the grain, fern, and falling leaves share a
session-wide clock so that following a link does not replay or visibly jump the
scene. Do not add a page-loading veil over the background. A deliberate press of
the sun/moon control should still produce the full atmospheric transition:
content pages change; the light does not.

Performance work follows the same rule: make the living page arrive sooner,
not visually poorer. Local CSS and JavaScript use deterministic content versions
so repeat visits can retain them safely. Linden Hill prose receives first-font
priority while the decorative grain is fetched at low priority. Shade does not
construct sunset-only falling leaves until they are needed; shutter and article
geometry are batched and reused rather than repeatedly measured. Do not trade
away the grain, progressive blur, motion continuity, or mathematical fidelity
for a synthetic loading state.

#### Experimental successor: Lokta Sunlight reader

The `experiment/lokta-sunlight-reader` branch tests a closer reconstruction of
Sunlit's optics on the Lokta Field Note. The checkpoint at `c26729b` preserves
the preceding article and environmental implementation. Promotion requires
Nisch's visual approval.

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
prose and marginal notes. A fresh source and browser matrix still needs Safari,
Firefox, VoiceOver, and a midrange phone before promotion.

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

#### Hybrid shadow restoration pass (20 July 2026)

Nisch removed two reference details after reviewing the calibrated successor.
The current branch has no vertical mullion in either the WebGL scene or its CSS
poster, and it creates no falling leaves. Keep both absences deliberate. The two
niuro fronds and the edge-cropped peepal canopy supply the remaining botanical
shadow; strengthen one frond before adding another moving object if the scene
needs more silhouette identity.

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
keeps the full environmental timing and 30 fps ambient surface; it must not
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

#### Lokta Field Note article system (experimental)

The `experiment/article-reading-system` branch develops the opened article into
a more complete editorial object while deliberately leaving the Documents list,
global navigation, environmental field, and page frame alone. This is an
experiment awaiting Nisch's visual approval; it must not be described as an
accepted mainline system until that approval happens.

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
This provenance and the entire mathematics layer remain experimental with the
rest of the branch.

The TurnTrout-derived successor pass adds editorial mechanics that strengthen
the existing paper without importing that site's visible identity. The site
now serves its text faces and grain texture itself, gives article images
intrinsic geometry, and lets selected scientific plates enter the right
marginal field. Its opening initial uses the complementary EB Garamond Initials
F1 and F2 faces from the official OFL source. Forest ink sits over a muted
madder ornament; the color stays fixed, and the glyph has no motion or
surrounding component. TurnTrout's random accent treatment and first-line
transformation do not belong here.

The experimental Gwern-intelligence pass borrows editorial behavior from
[Gwern.net's design system](https://gwern.net/design) while leaving its
grayscale appearance and interface chrome behind. It adds an authored
epigraph, a compact academic-link grammar, reciprocal sidenote focus, a running
section trace and progress rule in the contents rail, and a full-resolution
figure viewer. Each addition uses the existing Linden Hill/Jost division, wine
hairlines, square paper geometry, and shade/sunset variables.
The pass adds no remote annotations, recursive popups, backlinks,
transclusion, or second toolbar. Citation previews remain part of the later
bibliography phase.

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
  The float reserves the ornament's full em square, begins with the first prose
  line, and leaves a deliberate interval before the rest of the word. Shade and
  sunset use fixed two-ink calibrations, with a quieter ornament at sunset;
- the title area carries only the publication date beneath the subtitle. Author,
  revision, reading-time, category, and topic registers were explicitly removed
  after the first specimen proved them to be unnecessary complication;
- the title field ends in whitespace rather than a full-width divider. Section
  headings likewise rely on type and rhythm, not repeated horizontal rules;
- at 1180 px and above, contents become a slim, article-local sticky rail in the
  left margin. The rail is 8.25rem wide with a 2.25rem inner interval; its left
  edge lands exactly on the title's paper inset while the interval remains open
  beside wide code and figures. Reserved old-style section
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

Experimental authoring controls are intentionally few:

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

### Deferred article capabilities

Citation and bibliography support is the next substantive article-system phase,
not part of the present mathematics implementation. It should remain entirely
build-time and preserve readable HTML, print output, and source text without a
client citation runtime. Choose the bibliography source and authoring syntax
only when a real article supplies representative citations; do not grow an
ad-hoc shortcode vocabulary in advance.

The intended visual treatment adapts slotThe's useful bibliographic discipline
to this paper rather than copying its table. Inline citations should be concise
and link to stable entries. On wide articles, a short citation label may hang
into the left optical gutter while the entry remains unboxed in the reading
measure; on narrow screens, both return to ordinary document flow. DOI, arXiv,
and external links should be quiet, every entry should offer citation backlinks,
and the result should use semantic bibliography and biblioref roles. References
must feel like the final pages of the same field note, not a new component.

The branch's private draft `content/blog/scratch.md` is the visual specimen for
this system. Keep it as a broad regression fixture rather than turning a public
post into a component catalogue. Before promoting the experiment, verify the
real Gaussian-process article as well as this specimen in shade and sunset, at
1440, 1280, 1180, 1024, and approximately 390 px, including sticky/active TOC
behavior, keyboard focus, code/table overflow, copy feedback, mathematical
rendering, and the absence of article console errors.

## Color and material palette

The current colors are best understood by role rather than as a large token set:

- shade surface: a shallow `#f5f2e8` through `#f1f1e8` to `#eef0e7` field;
- sunset overlay: muted amber `#d9ad84` at restrained opacity, multiply-blended;
- reflected accent: rhododendron wine `rgba(143, 58, 65, 0.15)` near the upper right;
- architectural shadow: moss-gray `#bcc5b5`, made softer and more diffuse at sunset;
- botanical shadow: `#687866`, used at low opacity for the fern and peepal leaves;
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
- `static/css/sunlit.css` — shade/sunset geometry, blur, grain, foliage, and toggle;
- `static/textures/lokta-fibres.svg` — the repeating pulp-scale paper field;
- `static/textures/lokta-raking-relief.svg` — non-repeating paired fibres that
  become visible only as sunset settles;
- `static/textures/gaussian-noise.png` — the licensed local reference for the
  source grain; production synthesizes the same 512-pixel Gaussian statistics
  once in the worker and does not request this 231 KB file;
- `assets/js/sunlit.js`, `sunlit-worker.js`, and `sunlit-renderer.js` — state and
  route continuity, worker lifecycle, the cached light plane, procedural grain,
  and the instanced Nepalese botanical silhouettes;
- `layouts/_default/single.html` — experimental site-owned opened-article
  structure, leaving the vendored theme template untouched;
- `layouts/baseof.html`, `layouts/blog/section.html`, and
  `layouts/docs/section.html` — the Hugo 0.164 list-template bridge. It preserves
  the vendored theme's existing Documents and Notes markup while keeping its
  legacy layout files untouched;
- `layouts/_markup/` — Hugo 0.164 site-owned heading, link, image, code, and
  mathematical passthrough hooks;
- `layouts/partials/article-meta.html` and `article-end.html` — experimental
  article opening and quiet return treatment;
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
- With reduced motion active, the grain, sparse falling leaves, and transitions
  intentionally continue.
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

On 2026-07-17 we reviewed the experimental Gwern-intelligence pass at 1440,
1180, 1179, and 390 px in shade and sunset. We checked the running mathematical
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
primary reading face now precedes low-priority grain; shade defers sunset-only
leaf construction; and the environmental, outline, and formula scripts batch
or cache repeated work. Warm local reloads of the complete scratch specimen
settled at 47–48 ms in the inspected browser. The narrower 36rem prose measure
and right-growing 42rem technical measure leave a 2.25rem interval between
contents and code while registering the rail exactly with the title. The exact
1180/1179 transition, active section trace, shade and sunset, closed and open
phone contents, and widths from 1440 through 390 px were checked without
horizontal overflow or console warnings.

On 2026-07-19 the first paint-budget pass replaced the old fixed-element tree
with one scene. The successor experiment above removes that pass's scroll pause,
restores stepped grain and full foliage motion, and keeps the expensive paper
work in a cached texture. Opened posts place the environmental and reading
sheets on explicit sibling paint planes. The first article image fetches at
normal priority. Future work must preserve this separation.

## Known rough edges: observe before fixing

These are implementation findings, not permission for a future agent to launch
a cleanup pass. Fix them only when in scope, and preserve the visual language
while doing so.

- The experimental renderer draws 300 edge-cropped canopy instances and two
  procedural fern fronds in one instanced pass. A midrange phone still needs
  GPU, memory, power, and scroll traces before promotion. Do not translate these
  forms back into DOM nodes or viewport filter stacks, and do not restore the
  removed falling-leaf loop as a performance test.
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
