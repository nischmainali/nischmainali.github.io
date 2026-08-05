# Private press and field plate experiment

Status. Experimental on `experiment/private-press-plates`.

This branch tests a narrow synthesis from the comparative personal-site study.
It keeps the accepted paper, sunlight, type, crop marks, ink register, homepage,
Writing page, and article geometry. It adds craft where the change follows the
content rather than adding another site-wide effect.

## Visible proposal

The Gaussian-process note contains one interactive field plate. The plot is
complete inline SVG before JavaScript runs. A local script enhances one range
control so the reader can move a threshold and inspect the resulting crossing
points and connected excursion intervals.

The plate follows these rules:

- It explains material in the article and does not decorate navigation.
- It is drawn on the existing sheet without a card, white panel, or new font.
- It uses the active article inks, including alternate ink schemes and sunset.
- It has no idle animation or frame loop.
- It loads its script only on a page that contains the shortcode.
- It keeps a static plot, crossing marks, caption, and text reading without
  JavaScript.
- It hides the inactive range control from feed readers and no-script readers.
- It prints as a static figure.

The prototype is at `/blog/gp-code-notes/`. The implementation lives in:

- `layouts/shortcodes/field-plate.html`
- `assets/js/field-plate.js`
- the field-plate section of `static/css/article.css`

## Content-aware hierarchy

Opened notes receive an `article-depth-N` class during the Hugo build. The class
comes from the deepest rendered heading in the note. A note with only major
sections can use a larger second-level heading. A note with several heading
levels reserves enough visual range for the smaller levels.

Authors do not set this in front matter. The private
`/blog/scratch-apparatus/` note demonstrates the shallow hierarchy, while the
main `/blog/scratch/` specimen keeps the existing deeper hierarchy.

## Publishing and performance work

The experiment also adds work that is present without adding interface:

- Home, Writing entries, selected works, and article end matter have fuller
  microformat roles.
- RSS contains the complete article HTML rather than a summary.
- `scripts/check_budget.py` measures the initial compressed HTML, CSS, and
  JavaScript for Home, Writing, and the published article.
- The same check limits individual stylesheet and script growth and keeps the
  pinned Jost font inside its current budget.
- The content checker validates field-plate identifiers and required text.

The budget is a regression boundary, not a score. A page may stay far below its
limit. A future increase needs a named reason rather than a silent asset change.

## Deliberate omissions

The branch does not add tags, garden maturity labels, stacked notes, preview
popups, a graph, a command palette, or another navigation system. It does not
change Hugo. It does not add an article edition layout yet because no current
piece needs one.

## Review questions

- Does the field plate read as scientific content on the paper, or as a widget?
- Does direct manipulation add understanding to the Gaussian-process note?
- Does the wider plate keep a good relationship with the prose at desktop and
  phone widths?
- Does the shallow heading hierarchy improve the second specimen without making
  it grander than its content?
- Should the field-plate vocabulary become an authoring tool, or remain a single
  experiment?
