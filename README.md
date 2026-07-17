# Nisch's homepage

Source for Nischal Mainali's Hugo website. The deployed site is built by Netlify
with Hugo 0.164.0; generated output is not stored in Git.

## Local development

```sh
hugo server --renderToMemory --disableFastRender --bind 127.0.0.1 --port 1315
```

Open <http://127.0.0.1:1315/>. Hugo may create a local `.hugo_build.lock`; it is
ignored by Git. The mathematics pipeline requires Hugo 0.164.0 Extended; check
`hugo version` before diagnosing template errors from an older local binary.

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

## Article initials and figures

An article may open with one explicit two-ink initial:

```markdown
{{< dropcap "T" >}}his paragraph begins the article.
```

Keep the shortcode at the first textual position in a prose paragraph. The
explicit letter lets headings, quotations, links, emphasis, and mathematics
remain ordinary Markdown instead of relying on fragile first-letter rewriting.
In ox-hugo source, an inline macro can emit the same shortcode; `org/content.org`
contains the local example.

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
- Supply useful `alt` text. Use `decorative="true"` only when the image adds no
  information. Marginal figures require a caption.

## Repository map

- `content/` — authored pages and posts. Some theme examples remain as drafts or
  unlinked reference pages.
- `assets/` — Hugo-processed article images and other build-time resources.
- `static/` — files copied to stable public URLs, including images, PDFs, CSS,
  JavaScript, local fonts, and licensed surface textures.
- `layouts/` — site-level Hugo template overrides.
- `themes/hugo-paged/` — vendored and locally modified base theme. Do not replace
  it wholesale from the separate upstream checkout.
- `archetypes/` — defaults for new Hugo content.
- `org/` — Emacs Org authoring source and its generated LaTeX image support
  files; Hugo does not read this directory directly.
- `hugo.toml` — site configuration and navigation.
- `netlify.toml` — deployment build configuration.
- `DESIGN_LANGUAGE.md` — the site's design principles, provenance, and visual QA
  baseline.
- `MATHEMATICS.md` — the mathematical authoring and validation interface.
- `AGENTS.md` — working rules for future coding agents.

## Editing boundaries

Read `AGENTS.md` and `DESIGN_LANGUAGE.md` before visual or structural work. Treat
`content/`, `static/`, `layouts/`, configuration, and the intentional theme fork
as source. Do not hand-edit `public/`.

The site is developed incrementally. Repository maintenance must preserve the
rendered output unless a visible change is explicitly requested.
