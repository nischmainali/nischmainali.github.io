# Nisch's homepage

Source for Nischal Mainali's Hugo website. The deployed site is built by Netlify
with Hugo 0.164.0; generated output is not stored in Git.

## Canonical state

The canonical checkout is `/Users/nisch/code/site/nisch-hugo-site`. Temporary
preview checkouts may exist elsewhere as Git worktrees; they share this
repository rather than forming separate copies. The accepted visual
implementation entered the history at `861a22d` through
`experiment/toc-outside-sheet`. The pre-reader mainline remains available at
`archive/pre-field-note-main-2026-07-20` (`d37a896`). Do not delete named
checkpoints merely because their physical worktrees have been removed.

Local `main` and the preview branch may advance through documentation or
maintenance commits after that accepted visual checkpoint. Nothing in the local
workflow pushes or deploys automatically.

## Local development

```sh
hugo server --buildDrafts --renderToMemory --disableFastRender --bind 127.0.0.1 --port 1315
```

Open <http://127.0.0.1:1315/>. Hugo may create a local `.hugo_build.lock`; it is
ignored by Git. The mathematics pipeline requires Hugo 0.164.0 Extended; check
`hugo version` before diagnosing template errors from an older local binary.

On the current experimental branch, local preview also exposes a development
palette register that is absent from production builds. See
[`docs/PALETTE_PROOF.md`](docs/PALETTE_PROOF.md) for the six comparison palettes,
their semantic mapping, and the review protocol.

For a production-style build:

```sh
HUGO_ENV=production hugo --cleanDestinationDir
```

This writes the generated site to `public/`. That directory is intentionally
ignored: source files are authoritative, and Netlify builds `public/` during
deployment.

For drafts, run the source checks and a strict draft build:

~~~sh
./scripts/check_content.py
~~~

The former `scripts/check_math.py` command remains as a compatibility entry
point. See `MATHEMATICS.md` for delimiters, numbered equations, statements,
shared macros, and ox-hugo guidance.

## Article initials, epigraphs, and figures

An article may open with one explicit two-ink initial:

```markdown
{{< dropcap "T" >}}his paragraph begins the article.
```

Keep the shortcode at the first textual position in a prose paragraph. The
explicit letter lets headings, quotations, links, emphasis, and mathematics
remain ordinary Markdown instead of relying on fragile first-letter rewriting.
In ox-hugo source, an inline macro can emit the same shortcode; `org/content.org`
contains the local example.

An epigraph is an opening quotation with authored attribution rather than a
decorated blockquote panel:

```markdown
{{< epigraph attribution="Rabindranath Tagore" source="Stray Birds" >}}
The butterfly counts not months but moments, and has time enough.
{{< /epigraph >}}
```

`attribution` or `source` is required. An optional `link` associates the source
with its canonical page. Epigraph contents are Markdown and may include the
same build-time mathematics as article prose.

The figure shortcode accepts three placements and two surface treatments:

```markdown
{{< figure
  src="images/article-specimens/gp-threshold-crossings.svg"
  alt="Gaussian-process field crossings"
  caption="Threshold crossings across the sampled field."
  placement="margin"
  treatment="ink"
>}}
```

- `placement="measure"` is the default. `wide` uses the shallow technical
  breakout, while `margin` enters the right marginal field on wide screens and
  returns to the reading measure below it.
- `treatment="natural"` preserves photographs and screenshots. `ink` lets
  diagrams take on the Lokta sheet and its shade/sunset ink calibration.
- Hugo derives dimensions and responsive sources for page resources and files
  under `assets/`. Static and remote paths remain compatibility fallbacks.
- `priority="true"` is reserved for one image that appears above the fold. All
  other figures use lazy loading.
- Informative figures link to their full-resolution source and use the local
  paper viewer when JavaScript is available. Set `zoom="false"` for a figure
  that should remain static; decorative figures and figures with author-supplied
  links do not acquire the viewer.
- Supply useful `alt` text. Use `decorative="true"` only when the image adds no
  information. Marginal figures require a caption.

## Repository map

- `content/` — authored pages and posts. Some theme examples remain as drafts or
  unlinked reference pages.
- `assets/` — Hugo-processed article images and minified, fingerprinted CSS and
  JavaScript sources.
- `static/` — files copied to stable public URLs, including images, PDFs, CSS,
  local fonts, and licensed surface textures.
- `layouts/` — site-level Hugo template overrides.
- `data/` — build-time registries for shared mathematics and citations.
- `scripts/` — source validation. `check_content.py` is the maintained entry
  point; `check_math.py` is its compatibility wrapper.
- `themes/hugo-paged/` — vendored and locally modified base theme. Do not replace
  it wholesale from the separate upstream checkout.
- `archetypes/` — defaults for new Hugo content.
- `org/` — optional Emacs Org authoring source. Hugo does not read it directly;
  read `org/README.md` before exporting over Markdown.
- `docs/history/` — completed plans retained as implementation provenance, not
  current instructions.
- `hugo.toml` — site configuration and navigation.
- `netlify.toml` — deployment build configuration.
- `DESIGN_LANGUAGE.md` — the site's design principles, provenance, and visual QA
  baseline.
- `MATHEMATICS.md` — the mathematical authoring and validation interface.
- `AGENTS.md` — working rules for future coding agents.

## Where new files belong

Put authored Markdown and page bundles in `content/`. Put images that Hugo should
resize or fingerprint in a page bundle or `assets/`; put files that require a
stable public URL in `static/`. Site JavaScript belongs in `assets/js/`. Keep
build-time records in `data/`, validation in `scripts/`, and durable design
decisions in `DESIGN_LANGUAGE.md`.

`public/`, `resources/`, `.hugo_build.lock`, Python bytecode, browser-test output,
and visual-audit screenshots are generated material. Do not commit them. Keep a
small review record outside the repository when visual comparison still has
value.

## Editing boundaries

Read `AGENTS.md` and `DESIGN_LANGUAGE.md` before visual or structural work. Treat
`content/`, `static/`, `layouts/`, configuration, and the intentional theme fork
as source. Do not hand-edit `public/`.

The site is developed incrementally. Repository maintenance must preserve the
rendered output unless a visible change is explicitly requested.
