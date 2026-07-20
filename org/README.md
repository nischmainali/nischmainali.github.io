# Org authoring source

`content.org` is an optional ox-hugo authoring specimen. Hugo builds the Markdown
under `content/`; it does not read this directory.

Do not run a broad export over the site without comparing the generated Markdown
first. Later hand edits may exist only in `content/`. Ox-hugo may create
`ltximg/` as export scratch space; the site ignores that directory. Move media
that the published Markdown needs into a page bundle or `assets/` deliberately.
