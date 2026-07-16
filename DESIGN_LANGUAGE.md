# Design language and long-term visual working note

- Last baseline study: 2026-07-15
- Baseline checkpoint: `7c9d201` (`main`)
- Current accepted environmental direction: **Lokta Conservatory**
- Design worktree: `experiment/lokta-conservatory`
- Current opened-article experiment: **Lokta Field Note**
- Article branch: `experiment/article-reading-system` (**not yet accepted**)
- Hugo used for the study: `v0.128.0+extended`
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

Its governing choices are:

- the title, subtitle, and floral mark remain in the wide editorial field while
  prose uses a calmer 41 rem / 656 px measure. Code and explicitly wide figures
  may make only a modest 45 rem / 720 px breakout; tables stay with the prose;
- the opening begins one compact optical interval below the navigation rule.
  Title, subtitle, and date form a close descending stack; the floral mark is a
  restrained watermark tucked above and left of the title, never an icon, badge,
  or separate decorative component;
- the title area carries only the publication date beneath the subtitle. Author,
  revision, reading-time, category, and topic registers were explicitly removed
  after the first specimen proved them to be unnecessary complication;
- the title field ends in whitespace rather than a full-width divider. Section
  headings likewise rely on type and rhythm, not repeated horizontal rules;
- contents become a slim, article-local sticky rail in the left margin on truly
  wide screens. A single wine hairline and ink change mark the section currently
  crossing the reading line. Below the rail breakpoint, the same contents return
  to the reading flow and begin collapsed;
- the shade/sunset control keeps its crop-corner placement at the page opening
  but scrolls away with the masthead on articles, so it can never cover the TOC,
  code, or prose;
- section `§` links are generated by Hugo, appear quietly on hover or focus, and
  sit inside the flow on mobile;
- quotations, definition lists, code, tables, figures, mathematics, and endnotes
  use hairlines, paper-toned fields, and the site's ink colors rather than boxed
  components;
- fenced code is highlighted at build time with Chroma and receives a very small
  local copy control. Its shallow breakout is for long lines, not spectacle;
  article pages no longer depend on Prism or the theme's DOM mutation helpers;
- ordinary Markdown footnotes remain endnotes, while the explicit `sidenote`
  shortcode supplies optional Tufte-style right-margin notes on wide screens.
  These use the reading face, a generous measure, and a number hanging outside
  the note as in the slotThe reference. At smaller widths they become
  tap-to-reveal inline notes with no filled panel;
- the ending is only a rule and a text link back to Documents. It introduces no
  call-to-action card or additional ornament.

Experimental authoring controls are intentionally few:

- `subtitle`, `show_toc`, and `math` are optional front-matter controls;
- the local `figure` shortcode supports the usual image/caption fields plus
  `wide="true"` when an image should enter the wide editorial field;
- the `smallcaps` shortcode is available for genuinely editorial inline use;
- the `sidenote` shortcode is reserved for optional context that should remain
  adjacent to a sentence without becoming part of the endnote apparatus;
- headings, fenced code, tables, definition lists, blockquotes, mathematics, and
  footnotes otherwise remain ordinary Markdown.

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
- `static/js/sunlit.js` — viewport-derived slats, deterministic sparse peepal
  leaves, responsive scene setup, persistence, and state control;
- `layouts/_default/single.html` — experimental site-owned opened-article
  structure, leaving the vendored theme template untouched;
- `layouts/_default/_markup/render-heading.html` and `render-codeblock.html` —
  build-time article section permalinks and article-scoped Chroma output;
- `layouts/partials/article-meta.html` and `article-end.html` — experimental
  article opening and quiet return treatment;
- `layouts/partials/foot_custom.html` and `math.html` — article-specific removal
  of legacy runtime helpers and conditional mathematical rendering;
- `layouts/shortcodes/figure.html` and `smallcaps.html` — the small experimental
  authoring vocabulary;
- `static/css/article.css` — the scoped Lokta Field Note reading system;
- `static/js/article.js` — local narrow-screen contents and code-copy behavior;
- `layouts/partials/sunlit.html` — the fixed environmental layer and theme control;
- `themes/hugo-paged/layouts/partials/header.html` — pre-paint theme state and the
  session-wide environmental motion epoch;
- `themes/hugo-paged/` — a vendored and locally modified base theme;
- `/Users/nisch/code/site/hugo-paged` — a separate current upstream checkout for
  reference only.

The vendored theme is not identical to the current upstream checkout. Its layout
tree uses the older `_default/` and `partials/` structure appropriate to the
site's current Hugo version, while the upstream checkout has since moved to the
newer layout structure for Hugo 0.146+ and contains changes aimed at Hugo 0.163.
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

## Known rough edges: observe before fixing

These are implementation findings, not permission for a future agent to launch
a cleanup pass. Fix them only when in scope, and preserve the visual language
while doing so.

- The logo configuration creates an empty home link, and an empty optional menu
  item can create another unnamed link at desktop widths. These should eventually
  be removed or given meaningful content for accessibility.
- `hugo.toml` describes the site as `Nischal's adress on the web`; `address` is
  misspelled.
- Linden Hill and Jost depend on external font hosts. The current browser loaded
  them, but offline behavior and font-display behavior are not yet documented.
- The atmospheric background uses large fixed layers, progressive backdrop
  filters, one inline SVG fern, eight falling leaf elements on desktop (five on
  mobile), and continuous animation. This is substantially lighter than the
  earlier 330-leaf reconstruction, but performance on low-power devices has not
  been profiled and it intentionally does not reduce motion. Its Gaussian grain
  image is loaded from Wikimedia, matching the reference but adding another
  external dependency.
- Several hidden draft/example pages and the old theme `about`/`docs` material
  remain in `content/`. They are useful test fixtures but should not be mistaken
  for authored public content.
- The site uses an older vendored layout structure and Hugo 0.128. Upgrading Hugo
  or syncing the theme is a migration task, not incidental maintenance.

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
