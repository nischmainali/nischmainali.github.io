# Nisch's homepage

Source for Nischal Mainali's Hugo website. The deployed site is built by Netlify
with Hugo 0.164.0; generated output is not stored in Git.

## Local development

```sh
hugo server --renderToMemory --disableFastRender --bind 127.0.0.1 --port 1315
```

Open <http://127.0.0.1:1315/>. Hugo may create a local `.hugo_build.lock`; it is
ignored by Git.

For a production-style build:

```sh
HUGO_ENV=production hugo --cleanDestinationDir
```

This writes the generated site to `public/`. That directory is intentionally
ignored: source files are authoritative, and Netlify builds `public/` during
deployment.

For mathematical drafts, run the strict source and build check:

~~~sh
./scripts/check_math.py
~~~

See `MATHEMATICS.md` for delimiters, numbered equations, statements, shared
macros, and ox-hugo guidance.

## Repository map

- `content/` — authored pages and posts. Some theme examples remain as drafts or
  unlinked reference pages.
- `static/` — files copied to stable public URLs, including images, PDFs, CSS,
  and JavaScript.
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
