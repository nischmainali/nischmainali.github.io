# Working agreement for this site

## Start here

Read `README.md` and `DESIGN_LANGUAGE.md` before changing layout, color, type,
motion, interaction, or content structure. Read `docs/INK_SYSTEM.md` for palette
work and `MATHEMATICS.md` for mathematical publishing work.

Run `git status --short`, `git branch --show-current`, and `git worktree list`
before editing. Existing changes belong to the user unless the task says
otherwise. Preserve them and do not clean or reset them to create an easier
starting point.

## Scope

Work in small, inspectable passes. Change one page system at a time unless the
user asks for a coordinated change. Keep Home, Writing, and opened articles
coherent, but do not redesign all three to solve a local problem.

The site should remain specific to Nisch. Avoid generic cards, rounded panels,
metadata chips, dashboard grids, stock gradients, and decoration that has no
clear role. Reuse the existing paper, crop mark, type, ink, and registration
details before adding a new visual language.

Update `DESIGN_LANGUAGE.md` when the user accepts a change that alters the
visual rules. Keep proposals and rejected directions in a study or history
document instead of presenting them as current rules.

## Source boundaries

Prefer site files under `assets/`, `layouts/`, `static/`, `data/`, and
`content/`. The theme under `themes/hugo-paged/` contains local changes. Edit it
only when the shared theme primitive is the intended target, and never replace
the directory from another checkout.

Do not edit `public/`, `resources/`, caches, or browser output. Git ignores those
files because local tools regenerate them.

Put files in these locations:

- Authored pages and articles go in `content/`.
- Images that Hugo should resize or fingerprint go in a page bundle or
  `assets/`.
- Files that need a stable public URL go in `static/`.
- Browser code that Hugo should fingerprint goes in `assets/js/`.
- Shared records go in `data/`.
- Current design decisions go in `DESIGN_LANGUAGE.md`.
- Completed plans and studies go in `docs/history/` or remain clearly marked as
  studies in `docs/`.

## Visual work

Start the site with `./scripts/dev.sh`. Use `HUGO_PORT=1320 ./scripts/dev.sh`
when port 1315 is busy.

Inspect every affected page in the in app browser. Check a normal desktop
viewport and a viewport near 390 pixels wide. Check shade and sunset, at least
one alternate ink scheme, keyboard focus, horizontal overflow, and browser
console errors.

For article changes, inspect the draft at `/blog/scratch/` and the Gaussian
process article. Check the table of contents, sidenotes, wide equations, code,
tables, figures, citations, and print rules when the change can affect them.

For background changes, capture the first frame, the settled frame, a page
change, a refresh, and a fast scroll. The page must keep one canvas. The light
clock must continue during scrolling, and navigation must not expose a white
frame.

Do not use screenshots as the only check. Inspect the live interaction and the
browser console as well.

## Performance and motion

Keep Hugo output static. Do not add a client router to hide rendering problems.
The sunlight renderer belongs in its worker when the browser supports it. Avoid
scroll handlers that read layout on every frame, and avoid filters on the full
scrolling document.

Respect reduced motion without removing the complete paper and lighting state.
Reduced motion may stop movement, but it should not collapse the design into a
flat background.

Keep local fonts, KaTeX assets, and stable image assets free from external
runtime dependencies. New third party code needs a clear reason and a local
version when it affects reading or rendering.

## Content and mathematics

Do not overwrite hand edited Markdown with a broad Org export. Compare the
generated file first and read `org/README.md`.

Keep mathematical rendering during the Hugo build. Invalid or unsupported
mathematics should fail the check rather than appearing as raw source in the
browser. Use the existing shortcodes for equations, statements, proofs,
citations, figures, epigraphs, and sidenotes.

Keep titles, descriptions, and navigation labels plain. Do not add filler copy,
placeholder posts, invented publication details, or generic subtitles.

## Required checks

Run the full check before handing off a completed change.

```sh
./scripts/qa.sh
```

For a small JavaScript edit, also run `node --check` on the changed file while
working. For a template edit, keep the draft server open and confirm that Hugo
rebuilds without an error.

Report which pages, widths, modes, and interactions you inspected. Do not claim
visual verification when you only ran a build.

## Git safety

Use `apply_patch` for source edits. Do not discard unrelated changes. Do not use
`git reset --hard`, force push, or rewrite shared history.

Use a branch or worktree for a design experiment. Create a named archive branch
before replacing an accepted main design. Do not delete named archives during
routine cleanup.

Commit only after the requested change and its checks are complete. A local
commit does not authorize a push or deployment.
