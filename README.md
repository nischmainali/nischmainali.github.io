# Nisch's homepage

This repository contains Nischal Mainali's personal website. Hugo builds the
site as static HTML. The visual system combines a Lokta paper surface, changing
sunlight, book typography, mathematical publishing tools, and small technical
details that belong to this site.

## Current state

`main` is the accepted site. The canonical checkout is
`/Users/nisch/code/site/nisch-hugo-site`. Other local folders may be Git
worktrees for experiments. Worktrees share the same repository history and do
not form separate copies of the project.

The branch `archive/pre-writing-main-2026-08-04` preserves the exact main state
from before the accepted Writing page and background continuity work. Older
named archive branches preserve earlier design stages. Do not delete archive
branches during routine cleanup.

Local Git commands do not push or deploy the site. Netlify deploys from the
remote repository after a separate push.

## Quick start

The project requires Hugo 0.164.0 Extended. It also uses Python 3 for source
checks and Node for JavaScript syntax checks.

```sh
hugo version
./scripts/dev.sh
```

The preview opens at <http://127.0.0.1:1315/> and includes draft content. Set a
different port when another preview already uses 1315.

```sh
HUGO_PORT=1320 ./scripts/dev.sh
```

The preview renders into memory. It does not create or update `public/`.

## Checks

Run the full local check before committing a design or template change.

```sh
./scripts/qa.sh
```

The command checks content, draft rendering, JavaScript syntax, and a minified
production build. Netlify runs the source checks and production build again.

## Before changing the design

Read these files before editing layout, color, type, motion, or interaction.

1. [`AGENTS.md`](AGENTS.md) contains the working rules for coding agents.
2. [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) defines the accepted visual
   system and records its sources.
3. [`docs/README.md`](docs/README.md) separates current design documents from
   completed studies.
4. [`MATHEMATICS.md`](MATHEMATICS.md) defines the mathematical authoring tools.

The site has been designed in small passes. Change one page system at a time,
and compare the result with the accepted version before broadening the change.
Avoid generic cards, badges, dashboard layouts, large metadata blocks, and
decoration that has no function.

## Main site systems

### Background and paper

`assets/js/sunlit-renderer.js` draws the paper, light, shutter shadows, grain,
and sunset state on one canvas. `assets/js/sunlit-worker.js` runs that renderer
away from the main browser thread when the browser allows it.

`assets/js/sunlit.js` manages state, motion, resizing, and navigation
continuity. It saves a small copy of the live surface in session storage.
`layouts/partials/sunlit-handoff-head.html` restores that copy before the body
is painted, and `static/css/sunlit.css` supplies a complete static fallback.

Do not attach the background clock to scrolling. Do not add a second animation
system for page changes. Any performance change must keep the paper opaque and
must preserve the light position across links and refreshes.

### Ink schemes

`data/inks.toml` contains the approved Modus and Ef based ink schemes.
`assets/css/ink-register.css` maps their semantic colors into the site, while
`assets/js/ink-register.js` manages selection and persistence. Lokta Hybrid is
the canonical fallback. Read [`docs/INK_SYSTEM.md`](docs/INK_SYSTEM.md) before
changing the palette control or its storage rules.

### Homepage

The homepage is a compact frontispiece with an introduction, portrait, selected
works, and optional research previews. The selected works data lives in
`data/selected_works.toml`. The template and interaction are in
`layouts/shortcodes/selected-works.html`, `assets/css/home-readout.css`, and
`assets/js/home-readout.js`.

### Writing page and articles

The public Writing index stays at `/blog/`. Its template is
`layouts/_default/blog.html`. Article structure is owned by
`layouts/blog/single.html`, `static/css/article.css`, and
`assets/js/article.js`.

Articles support a table of contents, sidenotes, citations, epigraphs, figures,
drop capitals, statements, proofs, and numbered equations. Keep the prose
column readable and preserve the outside table of contents and right margin
notes at wide widths.

### Apparatus pages

Three registers report on the corpus rather than adding to it. `/statements/`
collects every numbered result across the notes, `/notation/` publishes the
shared symbol register from `data/notation.toml`, and `/colophon/` states what
the site is made of. Their templates are `layouts/_default/statements.html`,
`notation.html`, and `colophon.html`, sharing `assets/css/register.css`. The
authored missing page is `layouts/404.html`.

### Mathematics

Hugo renders mathematics during the build with KaTeX 0.17.0 and Asana Math.
Mathematical pages do not depend on a browser typesetting library or a content
delivery network. Invalid mathematics should fail the build. Read
[`MATHEMATICS.md`](MATHEMATICS.md) before changing delimiters, macros,
statements, equation references, or math assets.

## Content authoring

Published writing belongs in `content/blog/`. The private specimen
`content/blog/scratch.md` stays a draft and exercises the complete article
system. A new article should include a title, date, and a short description.

Numbered equations and statements are labelled by section, and a reference may
name a result in another note by writing its content path and identifier:

```markdown
See {{< statement-ref "/blog/level-sets#rice" >}}.
```

Set `register = "notes"` or `register = "essays"` in front matter to place an
entry in a named group on the Writing page, and `short_title` when a long title
needs a shorter form for references. Read [`MATHEMATICS.md`](MATHEMATICS.md) for
the numbering spine, cross-note references, and the notation register.

Use the explicit drop capital shortcode at the first textual position when an
article needs an initial.

```markdown
{{< dropcap "T" >}}his paragraph begins the article.
```

Use the figure shortcode when Hugo should control placement, responsive images,
captions, and the local image viewer.

```markdown
{{< figure
  src="images/article-specimens/gp-threshold-crossings.svg"
  alt="Gaussian process field crossings"
  caption="Threshold crossings across the sampled field."
  placement="margin"
  treatment="ink"
>}}
```

The optional Org source lives in `org/`. Hugo reads the Markdown under
`content/`, so read [`org/README.md`](org/README.md) before exporting over a
published file.

## Repository map

- `content/` contains pages and articles.
- `assets/` contains files that Hugo processes and fingerprints.
- `static/` contains files that require stable public URLs.
- `layouts/` contains site templates and render hooks.
- `data/` contains ink, mathematics, notation, citation, and selected work
  records.
- `scripts/` contains local preview and validation commands.
- `docs/` contains current design references and completed studies.
- `themes/hugo-paged/` is the locally modified base theme.
- `org/` contains optional Org authoring source.
- `hugo.toml` contains site configuration and navigation.
- `netlify.toml` contains the deployment build and cache rules.

The copy of `hugo-paged` under `themes/` contains intentional local changes. Do
not replace it wholesale from `/Users/nisch/code/site/hugo-paged`.

## Generated files and cleanup

Hugo may create `public/`, `resources/`, and `.hugo_build.lock`. Python may
create `__pycache__/`. Browser tests may create local report folders. Git
ignores all of them, and you may remove them when no build is using them.

Do not edit `public/` by hand. Source files are authoritative, and Netlify
builds the deployed copy from source.

## Git workflow

Use a branch or worktree for an experiment. Keep the accepted `main` checkout
clean, and preserve unrelated changes when a worktree is already dirty. Commit
an accepted design before starting the next large direction.

Create a named archive branch before replacing an accepted design. A useful
name includes the previous state and the date, such as
`archive/pre-writing-main-2026-08-04`.

Do not force push, delete archive branches, or rewrite shared history unless
Nisch asks for that exact operation.
