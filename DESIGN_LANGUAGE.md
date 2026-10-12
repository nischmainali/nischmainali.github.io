# Design language and long-term visual working note

- Last baseline study: 2026-08-05
- Accepted production direction: **Lokta Sunlight reader + Lokta Field Note**,
  with a build-time mathematical apparatus, the instrument register, and the
  day and night room
- Production branch: `main`
- Accepted lineage: `experiment/toc-outside-sheet` promoted with the homepage
  paper readout and the Writing page (`45c3ed6`, 4 August 2026), then
  `experiment/scholarly-apparatus` promoted with section-scoped build-time
  numbering, cross-note references, article end matter, `/colophon/`, an authored
  404, the instrument register, and the removal of the vendored theme's published
  fixtures (5 August 2026), then `experiment/day-night` promoted with the day
  and night room in place of Shade and Sunset and each ink's own night proof
  (`3791247`, 12 October 2026)
- Pre-promotion main archives, never to be deleted:
  `archive/pre-day-night-2026-10-12` (`31f2934`),
  `archive/pre-apparatus-main-2026-08-05`,
  `archive/pre-writing-main-2026-08-04`,
  `archive/pre-field-note-main-2026-07-20` (`d37a896`)
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
- **Living light:** one room in two lights. By day a warm sun pool with slim
  window bars and peepal leaves; by night the moon's window in an ef-dream
  room. The shadows carry the change between them rather than merely
  recolouring the page.

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
very low opacity by day and by night.

Treat these as typographic marginalia, not logos. They should feel discovered on
the page. Do not multiply decorative symbols across every component or turn the
floral mark into a loud brand stamp.

### 4. The day and night room

Accepted by Nisch on 12 October 2026 after a long lab study (summarised in
`docs/history/2026-10-sunlit-day-and-night-study.md`). It replaces Shade and
Sunset, whose rules now live in
`docs/history/2026-07-lokta-sunlight-shade-and-sunset.md`.

The page is a sheet in one room, seen in two lights. Both lights come through
the same window, past the same peepal, and the shadows carry the change
between them.

**Day** is an afternoon sun pool from the top right. Slim window bars cast
their own soft shadows: each bar is a box blurred by a penumbra that grows with
distance, so far from the window a bar loses its dark core and becomes a soft,
translucent line, never a crease. The pool fades toward the left and ends at
the sill's shadow. The peepal stands high and to the right, so only its sparse
branch tips hang into the sun. Lone leaves are crisp enough to read as
heart-shaped peepal leaves. Where the crown is dense the shadow softens instead
of fusing into a stain. Leaf shadows are blurred by a round disc, as the sun
blurs them, stretched a little along the light. Sun coins gather near the
leaves rather than scattering across open light. Shadows near the window read a
touch deeper, by contrast with the sun around them. The light is a touch warmer
(`#fff7e8`) than the shade (`#e5e2dc`), so it reads as sunlight rather than
brightness. Grain is static and fine, and gathers in the shade, where the sun
burns it clean. There is no paper texture.

**Night** is ef-dream's room, one step deeper (`#1a181c`). The moon stands
higher than the sun, so the window lands as a compact 2×2 patch with its cross
and the peepal in the lower pane. Its light spills faintly into the room, and
its outer edges soften with distance while the cross stays crisp. About once
every eighty seconds a thin cloud crosses the moon: the patch dims and its
shadows soften for twenty seconds or so. Night's warmth lives in the ink:
warm light text and each ink's own soft hues (for Lokta Hybrid, ef-dream's
peach-cream text, gold headings and links, and rose accent). It never lives in
a brown or amber ground. Moonlight is a pale, near-neutral silver, never blue.

**Motion** is a breeze below the leaves' flutter threshold. Branches sway
slowly on their springs and single leaves swing gently, matched to the lab's
spring-driven tree. Coins drift and the light breathes by about one and a half
percent over forty seconds. The reading column softens the light behind the
text in both lights.

**The change** takes 1.8 seconds each way and is one continuous morph. The
light swings steeper, the panes widen, the pool shortens into a patch while the
transom slides in from its far end, the peepal drifts, and the coins fade.
Colours blend in a straight OKLab line with no detour hues. The room's colour
runs a tenth of the path ahead of the window light, so the shadows never wash
out in a grey middle. Easing is `cubic-bezier(0.45, 0.05, 0.2, 1)`, prompt to
answer the click and long to settle. Dawn is the same path backward on a
remapped clock, so it feels like dusk rather than dusk reversed. A second click
mid-way turns back along the same path from where it is. The ink turns over
where light and dark text are equally legible against what is actually behind
the words (p 0.385 to 0.455, a blend of about a tenth of a second). Under
reduced motion there is no morph: the old light fades over the new in under
half a second, and the room is still. The full lighting stays.

**The control** is one glyph that changes with the light: the sun's rays draw
in and turn, the disc swells, and a crescent's shadow slides across it. It
keeps the crop-corner placement, 20 px, at half opacity.

**Choosing.** An explicit choice is stored as `day` or `night`, and the
earlier `shade` and `sunset` read as day and night. Without a choice the room
follows the system's light or dark setting, live. Day or night is decided in
the head before anything paints (`data-sunlit-mode` on the root). A change
still in progress from the previous page paints whichever side of the ink's
turnover it has reached, and continues on the new page. Print and no-script
pages are day.

**Inks.** The room is shared; the ink is the voice. Every ink carries two
proofs fitted to the light measured behind text, body at 7:1 and every other
role at 4.5:1 (`docs/INK_SYSTEM.md` has the method):

- By day, each role is its source theme's colour, lowered in lightness only
  where the darkest light behind text needs it.
- By night, each ink keeps its own hues on one ladder of lightness and chroma
  measured from ef-dream, raised where the moonlit window needs it. Lokta
  Hybrid's night is ef-dream. Body text stays in a warm band for every ink.
- Each ink casts a restrained tint into the day's paper. The tint changes the
  paper's hue, never the light: the room keeps its brightness, and the sun pool
  takes only half the tint, so the sun stays warm. Night has no tint.
- During a change, the text blends from the ink's own day colours to its own
  night colours. The proof slip, its mark, and the colophon show night
  swatches at night.

Rules that came out of the study:

- Shadows carry the change; colour stays simple. Do not tell a sunset or dawn
  story with detour hues; the purple middle was rejected.
- Never add at night anything that is not there by day: no lamps, flames,
  second plants, or cars. The cozy round was rejected as two worlds.
- Warm dark grounds go muddy. Keep the night ground near-neutral and put
  warmth in light ink.
- At night the window draws its shape. Day's long beams read as stage lights
  in the dark.
- Any soft shadow must be one whole shadow. Assembling a shadow from
  neighbouring panes produced the crease.
- Light-only changes gated by the reading column show a vertical seam. Gate by
  distance along the light instead.
- Motion stays gentle, no faster than the lab clips Nisch approved.

**Implementation.** `assets/js/sunlit-renderer.js` holds both lights, the
passage between them, clouds and grain in one classic script for the worker
or the main thread. `assets/images/sunlit-peepal.png` is the peepal's
silhouette, posed in the day's breeze; its sway is drawn in the shader, so no
CPU canvas is redrawn per frame. `assets/js/sunlit.js` owns the choice, the
change, the ink turnover, the control, and the continuity frames. The canvas
renders at the display's density within 5.2 megapixels, ambient at 30
frames a second and changes at the display's rate. The lab at
`/Users/nisch/code/site/sunlit-lab/` (`final.html`, `daynight.html`) keeps the
measured references, including readability behind the text, the ink
crossover, and hard-edge and shimmer sweeps.

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

The visible primary navigation is only `HOME` and `WRITING`, aligned to the upper
right above a one-pixel rule. The active item is indicated by a short, dark wine
underline. Links use a dark teal-blue (`#005077`) and usually a fine dashed or
dotted underline. Publication links invert to white on teal on hover; most other
links remain understated.

The theme toggle is the reference's tiny 18 px sun/moon control at half opacity.
Whenever the crop-mark frame is present, it occupies the open upper-left corner:
its center sits two pixels inward from the implied intersection of the two crop
strokes. Both are positioned by the same paper body, so the alignment does not
drift as exterior margins grow and the control leaves the viewport with the top
crop marks. Below the crop system it keeps the original 20 px paper inset. It
should remain a nearly ambient utility, not become a prominent call-to-action.

Interaction vocabulary should stay small: underline, ink-color shift, subtle
background fill, and atmospheric theme transition. Avoid pill buttons, glowing
outlines, springy transforms, moving links, and fleets of icon buttons.

#### Editorial ink register (accepted 21 July 2026)

A tiny printer's registration mark occupies the
upper-right crop corner as the exact spatial counterpart to the upper-left
light control. It opens one square Lokta proof slip down and inward from the
crop intersection. The slip preserves the successful comparison register's
hairlines, representative swatches, Linden Hill/Jost division, and paper
texture. It adds no scrim, blur, rounded container, or toolbar.

The two crop instruments have separate responsibilities. The left control
moves the room between day and night; the right control changes editorial ink
and a restrained tint in the day's light. Selection never restarts the WebGL
worker or changes the light's clock. The source paper swatch stays exact in the
proof slip. At night every ink shares the moonlit room and keeps its own night
proof, and the slip shows night swatches. Both instruments are part of the paper
frame on every route and leave with its top crop marks, so neither can linger
over home content, the contents rail, or marginalia.

Lokta Hybrid remains the canonical HTML, no-JavaScript, print, and
storage-failure impression. On a first capable visit, the browser assigns one
ink from Lokta Hybrid, Ef Arbutus, Ef Elea Light, and Ef Arcadia and stores that
choice on the device. All six proof inks remain selectable in the
register; Ef Cyprus and Modus Operandi Tinted do not enter the random pool. A
manual choice replaces the assignment. A valid `?ink=` link applies only to the
linked page until the visitor chooses an ink.

Treat the random choice as local printing variation, not visitor tracking. It
uses no cookie, account, request, or server record. Each ink's day
and night proofs remain part of it, and the control must keep
its keyboard, touch, forced-color, reduced-motion, and cross-tab behavior. Nisch
accepted this register on 21 July 2026, and Lokta Hybrid remains the canonical
failure-safe and the colour baseline below.

## Page grammars

### Figure labels (15 September 2026)

Scientific illustrations are labelled “Figure” in headings, references, and
accessible names. Existing `scientific-plate` helpers and `plate-` anchors stay
in place so published links and controls continue to work.

### Home

The home page is a compact field-desk frontispiece, not a hero landing page. Its
existing paper shell, crop marks, navigation clearances, and environmental light
remain the frame. Inside that frame, one structural grid registers the italic
name and research proposition with a portrait plate; selected work spans below
as a compact bibliography. On desktop, the frontispiece and ledger share a
`51rem` register. The `17.25rem` portrait's right edge meets the tapered
ledger's right edge, while its smaller scale leaves a clear interval from the
identity column.

The opening has four facts only: the name, one exact research proposition, one
quiet affiliation sentence, and a curriculum-vitae link. A large but faint `❧`
sits behind the name as an explicit, assistively hidden ornament. It is part of
the title composition rather than a viewport-positioned decoration. There is no
eyebrow, portrait caption, status widget, or additional homepage subtitle.

Each selected work is one complete link whose year, `❡`, title, and collaborators
share a restrained ledger row. The year remains a separate left register and the
authors sit quietly below the title. Venue and record-type labels are deliberately
omitted. The text measure stops a little before the right edge and the horizontal
rules taper into the paper, so the open space reads as margin rather than a
missing column. Rows remain close together and invert as a whole on hover or
keyboard focus, using the active ink palette rather than fixed colors. They
should read like bibliography entries, never product tiles or cards. The ledger
caps at `51rem` while the frontispiece keeps its wider portrait composition.
This is an intentional instrument margin, not a global narrowing of Home.

Some records may include one dotted preview control when there is useful
material to show. It opens only by click or keyboard action. Hover does not open
it. At `90rem` and wider, two thin lines connect the control to a narrow preview
on the right. That threshold leaves room for the `2.7rem` interval and the
preview's full drift at the ordinary 1440 px desktop class. At narrower widths,
the preview appears below the row and the lines are removed. The preview may
contain a source label, one figure, one exact contribution sentence, and a few
links. It should not become a modal, tooltip, or second publication database.

All moving parts use the same animation. The control, lines, and preview follow
a 14-second closed path that stays under six horizontal pixels and about two
vertical pixels. The uneven path prevents an obvious reversal. Motion runs
whenever the preview is open and does not need a URL flag. JavaScript calculates
the line endpoints from the same panel position and creates a small SVG that
covers only those lines. It removes the line paths as soon as the preview
closes. Do not give these parts separate animation clocks or place the lines in
an overflowing SVG tied to the publication row, because either choice makes the
parts separate on screen.

At narrow widths the source order becomes the composition: identity first,
portrait second, bibliography third. The portrait remains in normal flow at
every width, the ornament stays attached to its heading, and neither element may
disturb the global crop-mark geometry. If future home sections are proposed,
first ask whether the content has earned another editorial passage. Default
answer: do not add a dashboard-like section.

#### Build-time numbering and cross-note references

Numbering is section-scoped and built once per note. Equations read `(2.1)` and
statements read `Theorem 2.1` against the numbered outline the contents rail
already prints; a note with no sections keeps bare numbers. The build is the only
source of truth. The former CSS counters and the client-side renumbering pass are
gone, because three systems for one number meant a reader without JavaScript saw
every equation number twice. Sidenotes keep their counter, which is correct:
their numbering follows rendered order.

A reference may leave its note, written as a content path and an identifier
joined by `#`. It prints the target's kind, its section-scoped label, and the
target's title, and links to it. This is bibliographic, in the same spirit as the
citation registry, and explicitly not transclusion: no preview, no popup, no
backlink graph, no runtime request. Because labels come from raw source rather
than rendered output, two notes may reference each other with no ordering
problem.

The article ending gains the two facts a technical reader needs and nothing else:
a revision date when one exists, and a bibliographic self-citation. Both are
plain lines in the ending's Jost register — never a copy-to-clipboard control —
and both survive into print, where the screen navigation drops away. Revision
stays out of the title field, where an earlier specimen proved such registers to
be unnecessary complication.

#### Typographic corrections found in review (4 August 2026)

Four defects came out of looking closely at an opened note. Each was a case of a
value set by eye, or of a browser assumption that had quietly stopped holding.

**Blackboard and calligraphic letters were printing as ordinary italics.** KaTeX
writes `\mathbb`, `\mathcal`, `\mathfrak`, and `\mathsf` as a legacy
`mathvariant` attribute on a Latin letter. MathML Core kept only
`mathvariant="normal"`, so Chromium ignores those attributes: every `\RR` on the
site was printing as an italic *R*, and `\GP` as *GP*. Firefox still honours
them, which is why it was easy to miss. `render-math.html` now substitutes the
Mathematical Alphanumeric Symbols codepoint from `data/mathml.toml`, which every
engine draws. Do not reintroduce a dependency on legacy `mathvariant`.

**Display mathematics was flush left, not centred.** The formula carried
`min-width: 100%`, which left its auto margins no free space to distribute. The
scroll box keeps the full measure so its overflow cues stay correct, and the
formula itself now shrinks to its content and centres; one wider than the column
exhausts that space and scrolls from its left edge, as before.

**Equation numbers below 860px were dropped a full line clear of the formula.**
The space was reserved underneath rather than beside. The number now takes the
same 2.6rem optical gutter on the right that the marginal notes keep, and sits on
the formula's centre. Above 860px it continues to hang outside the measure.

**A footnote reference was opening the leading of its own line.** Markdown
footnotes render as `sup` with `vertical-align: super`, which raises the whole
inline box so that its line-height pushes that line away from its neighbours: a
paragraph carrying one footnote measured 30.2px between baselines where the rest
of the page measured 27.5px. The sidenote markers already avoided this with a zero
line-height; ordinary footnotes did not. `sup` and `sub` now take
`line-height: 0` and an explicit offset. This is what made the opening's
three-line grid uneven, and therefore what defeated the first attempts to align
the initial to it.

**Notes were spaced by leaked prose margins.** Goldmark wraps each note in a
paragraph, which inherited the body margin and opened about 29px between two
20px lines — more air between notes than inside them. The interval is set on the
item now, deliberately a little under one line.

The opening initial was rebuilt around what the two faces actually are: **F1 is a
floral ground with no letter in it, F2 is the letter.** They are not
interchangeable styles and the overlay is not optional. The floral initial is one
of the site's few signature gestures; it is not decoration that may be dropped.
Reviewing this pass I first mistook the filigree showing around the letter for a
misregistration and removed the ornament, which Nisch rejected on 4 August 2026.

The two layers no longer share one em square. That was the real fault: at one
size, F1's ink fills the square while F2's letter sits barely inside it, so the
ground showed only as a narrow band and the crossbar reached past its edges — the
filigree read as texture behind the ink rather than a frame around it. The
TurnTrout reference does use one size for both, but its ground is a much paler
tint blended toward the page, which is why the clash never appears there.

The accepted arrangement, chosen from a four-way comparison on 4 August 2026:
the ground's ink spans from the **top of the tallest ink on the first line** to
the third line's baseline, and its left edge registers with the measure —
a hard-edged square cannot hang into the gutter the way a letter's side bearings
allow. The letter's ink is 0.77 of that square and centred in it. Aligning the
square's top to the ascender line instead leaves visible slack above and below and
makes the square read as too small; the correct size lands within a hair of the
4.65rem the original construction used, which was evidently the intent before the
offsets drifted.

Three lessons from getting this wrong repeatedly, and they generalise beyond the
initial.

**Measure the laid-out page; do not assume a grid.** The three-line grid was not
even until `sup` and `sub` were kept out of the line box, and deriving the
element's position from the same model used to place it only confirms itself.

**Take glyph extents from the font binary, not from canvas.** `fontTools` reads
F1's `T` as ink 0.0050–0.9950 on a 1000 em; `TextMetrics.fontBoundingBox*`
reports ascent/descent 0.900/0.250 for the same face, which matches neither its
`hhea` (1.000/−0.014) nor its `OS/2` typo metrics.

**Where the baseline sits inside a `line-height: 1` box is not predictable for
these faces, so calibrate it.** The three candidate metrics above imply 0.825em
and 0.993em; a metric-free strut probe in the live page measures 0.810em. Only
the last is what the browser does. The two SIZES in `article.css` are therefore
derived, and the two TOP offsets are calibrated against the rendered page and
carry a comment saying so. Do not "fix" them by recomputing from metrics.

The general lesson is worth keeping: several of these were numbers set by eye
that happened to look close. Where a value can be derived from the type, derive
it and leave the derivation in the file.

Nisch reviewed a first version of this pass on 4 August 2026 and rejected the
apparatus it had grown around the mathematics. An index of statements, a
published notation register, a `notation` shortcode, an authored introduction on
the Writing page, named registers with Jost group labels, and a revision date in
the register were all removed as pedantic. The Writing page is a title and its
posts. Take this as a standing constraint: build-time rigour belongs in the
build, not in extra pages that explain the corpus to the reader.

Two page-level additions survived that review, and both stay outside the reading
path. `/colophon/` states what the page is made of — paper, light, type, ink,
mathematics, making — reading its ink facts from `data/inks.toml` so they cannot
drift, with deep-linkable sections. It is a printer's colophon, not an about
page. The 404 is authored on the same paper: crop frame, light, and ornament
remain, with one plain line and two links. Both use `assets/css/register.css`,
which borrows the Writing index's measure, ornament, and Jost/Linden Hill
division rather than inventing a second grammar.

#### The instrument register

The site is a warm scholarly sheet under changing light. Laid over it is a
measuring device. That juxtaposition — paper against instrument — is an accepted
second register, and it is the one place the site is allowed to feel like a
terminal rather than a book. It is deliberate contrast, not ornament: remove it
and the page becomes merely tasteful.

It is a **vocabulary, not an effect**. Before this pass the idea existed once, as
the home ledger's projected panel, and the temptation was to copy that panel into
every other place it might fit. Repeating one gesture is what would make the idea
read as decoration. Instead the register has one crest, one easing family, and
several distinct mechanisms, each with its own meaning and its own axis of
movement. `assets/css/instrument.css` holds the invariants and the full
vocabulary; read it before adding anything to the register.

The invariants, in short: one small geometric mark from
`layouts/partials/instrument-mark.html`; emission from a precise point rather
than a box edge; one clock per assembly; registration corners on whichever edge
the output arrives from; reader-initiated, reversible, and singular; it holds
still while in use; and no easings or durations outside the tokens.

**The law of contact.** What touches the sheet does not drift; what is suspended
beside it does. Drift belongs to Projection alone, because Projection is the only
gesture that leaves the page. This is what distinguishes Extension from a box
that merely wobbles, and it was the fault in the first narrow-width state.

The mechanisms, and how to choose between them: ask whether the evidence lives
elsewhere (**Projection**, thrown into free margin, drifting), is folded inside
the row (**Extension**, emerging from behind an edge and retracting behind it),
is already on the page (**Registration**, brackets snapping to its bounds and a
reticle drawing itself before the viewer commits), or whether the mark itself is
the display (**Dilation**, radial, designed but not built). **Trace** is the
ambient member: a graduated scale, a travelling index, and a figure in the
machine voice. It reports and never opens, which is why it carries no mark and is
the only member allowed to coexist with another gesture.

The crest differentiates with the mechanism at no cost: surveying open margin the
needle sweeps continuously; docked, it throws a single quarter-turn and stops,
like a latch.

The machine voice is the platform's own monospace, never a downloaded face, and it
appears only on instrument labels — scales, counts, indices, source tags. Never in
prose. It also stays a cool neutral in both lights, which is the one place the
instrument refuses to warm with the sun. Pushing that refusal further, to a fully
cool instrument layer indifferent to the weather, is the open experiment.

Current assignment: Projection on the home ledger at 90rem and wider; Extension
on the same ledger below that; Trace in the contents rail's reading rule and on a
formula that genuinely overflows. One revealing gesture per context, Trace
excepted.

Registration was built for the article figure viewer and **rejected** on
5 August 2026: brackets snapping to a figure's bounds before the viewer committed
read as unclear rather than as measurement, and 190ms of pre-roll before a modal
is a cost with no legible return. Do not rebuild it without a clearer proposal.
Dilation is designed for the ink proof slip and deliberately unbuilt, because it
would touch the accepted ink register.

Two faults from the first build are worth remembering. A docked gesture and a
projected one must not share a width rule: the drawer's full-slot width, written
with two classes, silently outranked the projected panel's narrower measure and
threw it off the right of the screen. And a retraction must run on the same clock
as its aperture — a 135ms fade inside a 210ms collapse made the panel vanish and
then leave empty space behind, which is exactly the abruptness the law of contact
is meant to prevent. The register never appears in
reading matter — not in prose, not in the Writing index, not in the colophon body,
not on the missing page.

### Writing list

The public `Writing` page keeps the stable Hugo `/blog/` route. It is a compact
paper register, not a feed, card grid, or documents shelf. A faint `❧` belongs
to the page title. Entries have no repeated dingbat. Their identity comes from
the exact order of title, description, date, and registration rule.

The register uses a `44rem` measure. Each entry is one large link with an
italic title, one short description when the article supplies it, and a very
small date placed last. It has no box, fill, thumbnail, tag, reading time
label, or metadata column. A small right angle registration corner begins the
separator. The line then loses strength toward the open right margin. This
detail belongs to the crop mark system and must not be replaced by a Unicode
ornament.

Hover and keyboard focus shift the title ink, raise the description contrast,
and strengthen the separator without changing the entry's geometry. Compact
screens keep the same source order and do not create an empty marker column.
Hugo decides whether drafts are part of the page, so an explicit draft build
must show them while production continues to omit them. This list system was
introduced on `experiment/docs-page` and accepted in its clean editorial form
on 23 July 2026.

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

The intricate F1 ornament is delivered as 26 single-letter WOFF2 subsets with
`unicode-range`, so an article downloads only the initial it actually prints
(5.3 KB for the current `T`) rather than the 168.6 KB all-letter source. The
source subset, checksum provenance, F2 face, and OFL remain together locally.

The accepted Gwern-intelligence pass borrows editorial behavior from
[Gwern.net's design system](https://gwern.net/design) while leaving its
grayscale appearance and interface chrome behind. It adds an authored
epigraph, a compact academic-link grammar, reciprocal sidenote focus, a running
section trace and progress rule in the contents rail, and a full-resolution
figure viewer. Each addition uses the existing Linden Hill/Jost division, wine
hairlines, square paper geometry, and the ink variables of both lights.
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
  leaves a deliberate interval before the rest of the word. By day it takes
  the ink's heading colour; by night it is gold on a rose ornament;
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
- the day/night control keeps its crop-corner placement at the page opening
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
- optional `calculation` folds keep supporting algebra on the same sheet. A
  small printer's corner opens into one fading rule and an inset derivation,
  with no box, fill, shadow, or animated height. Definitions and results stay
  in the main reading path, and print expands every fold;
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
  `proof` helpers documented in `MATHEMATICS.md`. The `calculation` helper holds
  optional algebra that verifies a result already stated in the article;
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

- day: shade `#e5e2dc`, sunlight `#fff7e8` mixed in linear light, the deep
  shade leaning very slightly cool, each ink adding a restrained tint;
- night: ef-dream's room a step deeper, `#1a181c`, moonlight `#3b393e`;
- night ink: peach-cream `#efd5c5`, muted `#a39a94`, gold links and headings
  `#deb07a`, rose accent `#e47980`, with ef-dream's syntax roles;
- surface: static fine grain gathered in the shade; no paper texture;
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
   the whole, by day and by night.
5. Keep it only if the result feels inevitable here. A recognizable collage of
   borrowed website sections is a failure even when each section is attractive.

Record provenance in code comments or this note when a borrowed interaction is
complex or likely to be revisited. Do not preserve source-site quirks that do not
serve Nisch's content.

## Implementation map and provenance

The site is intentionally small:

- `hugo.toml` — site identity, menus, theme selection, output formats;
- `content/_index.md` — home structure and selected works;
- `content/blog/` — Writing entries and private draft test pages;
- `static/css/custom.css` — local page/layout refinements and portrait treatment;
- `static/css/sunlit.css` — day and night posters, root colour, handoff, and the control;
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
- `layouts/baseof.html` and `layouts/_default/list-baseof.html` — the Hugo 0.164
  site-owned list-template bridge, kept outside the vendored theme;
- `layouts/_default/blog.html` — the public Writing register at the stable
  `/blog/` route, including its title ornament, optional description, compact
  date, fading registration corner, and stable responsive source order;
- `layouts/_markup/` — Hugo 0.164 site-owned heading, link, image, code, and
  mathematical passthrough hooks;
- `layouts/partials/article-meta.html` and `article-end.html` — article opening
  and quiet return treatment;
- `layouts/partials/render-math.html` — the one strict build-time KaTeX entry
  point shared by Markdown and numbered equations;
- `data/math.toml` — the deliberately small central macro table;
- `layouts/partials/math-registry.html` — one cached, fence-aware pass over a
  note's raw source that assigns every equation and statement its section-scoped
  label. The single source of truth for numbering;
- `layouts/partials/reference-target.html` — resolves a reference to a page and
  an identifier, so a reference may name a result in another note;
- `layouts/_default/colophon.html` with `assets/css/register.css` — the
  colophon and the shared register grammar;
- `layouts/404.html` — the authored missing page;
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

On 2026-07-21 a release-candidate QA pass covered Home, Documents, Search, the
Gaussian-process article, and the complete private specimen. The six editorial
inks were checked in shade and sunset with no page-level overflow; every
prose, heading, link, and quiet-text role cleared 4.5:1 against the measured
broad shadow field in both modes. Pointer and keyboard ink choice, sunlight
mode changes, active outline tracking, wide-equation keyboard scrolling,
mobile sidenote disclosure, figure focus and return, code-copy feedback, and a
fast jump through the long specimen all remained operative without a blank
content frame or console error.

That pass also established the current performance and accessibility contract.
Reduced motion holds the complete rendered endpoint still between interactions.
A deliberate shade or sunset change still runs the five authored transition
channels before returning to the still endpoint. The ordinary ambient loop
sleeps between its twenty authored grain states instead of waking at display
refresh rate. Visible desktop sidenotes no longer
expose a misleading hidden checkbox, modified browser shortcuts pass through a
focused equation, and no-script visitors see the complete static poster without
a dead mode button. Per-letter ornament subsets reduce the present `T` drop-cap
request from 168.6 KB to 5.3 KB without changing its geometry. Strict production
and draft builds, both source validators, JavaScript syntax checks, local-only
asset checks, and font-subset validation passed. The sole retained content
warning is the already documented remote GIF in an unpublished legacy fixture.

On 12 October 2026 the day and night room was verified on `experiment/day-night`
at `http://127.0.0.1:1321/`. Home, Writing, the nonlinear field note, the
Gaussian-process note, the scratch specimen, and the colophon were inspected by
day and by night at 1440 × 900 and 390 × 844, with Lokta Hybrid, Ef Arcadia, Ef
Elea Light, and Ef Arbutus. There was no horizontal overflow and no console
error. Screencasts of first load, two link changes, a fast fling, a reload, and
a step back showed no white frame at night and no dark frame by day, with one
canvas throughout and the light's clock running while scrolling. A change begun
on one page continued on the next. Reduced motion held a pixel-still room and
replaced the morph with a half-second fade. The system's dark setting was
followed live when no choice was stored. The control was the first Tab stop, with
a visible ring, and Enter changed the light. Printing at night produced day ink
on white. The main-thread fallback rendered and changed the light. Changing ink
retinted the day without restarting the worker.

The same day the ink proofs were checked on all six inks by day and by night,
on Home, the nonlinear field note, the scratch specimen's code, and the open
proof slip. Measured behind text, the day's darkest 1% is L\* 85.4 for every
ink and the night's brightest moonlit light is L\* 25.7. Every day and night
role meets its target there. During a change, the text blended from each ink's
day colours to its own night colours, and the colophon and slip showed night
swatches at night. There was no console error, and `./scripts/qa.sh` passed.

## Known rough edges: observe before fixing

These are implementation findings, not permission for a future agent to launch
a cleanup pass. Fix them only when in scope, and preserve the visual language
while doing so.

- A midrange phone still needs GPU, memory, power, and scroll traces before any
  renderer expansion. Keep the single canvas and the static leaf silhouette; do
  not add animated or DOM foliage, CPU-drawn plants, or viewport filter stacks as
  part of that test.
- MathML-only output cuts the dense specimen's HTML and element count by more
  than half. Dual HTML and MathML remains the default until Safari, Chromium,
  Firefox, VoiceOver, NVDA, overflow, and print checks pass.
- Several hidden draft/example pages and the old theme `about`/`docs` material
  remain in `content/`. They are useful test fixtures but should not be mistaken
  for authored public content.
- The vendored theme keeps its older layout structure even though deployment now
  uses Hugo 0.164.0. Site-owned templates bridge the current section lists;
  syncing or fully migrating the theme remains a separate task.
- `hugo.toml` sets `baseurl = "/"`, so `.Permalink` is relative. The canonical
  link in the vendored header and the article's "Cite as" locator are therefore
  both relative. Setting a real canonical URL fixes both at once; it was left
  alone because the deployed domain is not recorded in this repository.
- The five large stylesheets under `static/css/` are still served unminified
  through the deterministic `?v=` scheme, while `assets/css/` stylesheets are
  minified and fingerprinted. Unifying on `assets/` would need an edit to the
  vendored header's stylesheet loop, and after compression the saving is small,
  so it was deliberately not attempted alongside the apparatus work.
- The home portrait remains hand-made WebP in `static/` rather than going
  through Hugo's image pipeline. Its crop-sheet geometry is pinned to exact
  measurements above, so changing that markup deserves its own pass.
- MathML-only output remains gated on the browser and assistive-technology
  matrix. On the current specimen the dual output measures 124 KB of HTML and
  additionally requests the 24 KB KaTeX stylesheet and several of its twenty
  font files, so the switch is the largest single saving still available.

## Change protocol for future visual work

1. Start from a concrete page and a concrete user intention.
2. Read the relevant source plus this note; check the working tree before edits.
3. Make the smallest coherent change that can be judged on its own.
4. Inspect it in the visible in-app browser so Nisch can point at it directly.
5. Check the normal desktop view and approximately 390 px width.
6. Check day and night, a change between them, focus behavior, overflow, and console errors.
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
