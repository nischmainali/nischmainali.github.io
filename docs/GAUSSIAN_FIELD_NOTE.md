# Gaussian process field note

Status. Experimental on `experiment/gp-field-note`.

The article at `/blog/gp-code-notes/` is the complete web edition of Nisch's
Janelia chalk talk from 18 November 2024. The original source is
`/Users/nisch/code/site/Janelia/chalk_talk.org`. Its compiled PDF was used to
check order, emphasis, and completeness. The Markdown article is the deployment
source. Do not export the Org file over it.

## Editorial scope

The web edition keeps the complete argument, statements, proofs, derivations,
and bibliography. It corrects spelling, inconsistent symbols, broken
delimiters, and clear typesetting errors. It does not silently turn a simplifying
argument into a stronger result.

The final coding error calculation uses the talk's independent-segment
approximation. The article names that assumption. The corresponding plate uses
the stated formulas in normalized illustrative units and must not be described
as measured data or as an exact result.

## Plate system

The note contains six numbered scientific plates:

1. translated input fields, their weighted sum, and thresholded output;
2. crossings and connected excursions of one fixed field;
3. the finite Kac-Rice counting window;
4. normalized spectral moment contributions;
5. a conditioned excursion and its high-threshold limit;
6. the local and global coding error tradeoff.

Only the threshold and coding error plates have controls. They respond to input
and never animate while the reader is idle. All six plates contain complete SVG
geometry before JavaScript runs. Mathematical annotations use the article's
strict build-time renderer and its MathML-only output. This avoids duplicate
fallback markup in full-text feeds. Plain descriptive labels remain SVG text.
The plates stay readable in feeds and print as vector figures. Narrow screens
stack their panels and keep mathematical labels at a stable reading size.

The system follows a strict information design rule. Each plate makes one
claim, provides an explicit comparison, and shows the mechanism that connects
the mathematical objects. Curves are labelled directly. Axes and reference
lines recede. Decoration, separate legends, heavy grids, and duplicate labels
are removed. The Kac-Rice and spectral plates carry the densest explanatory
work.

The implementation lives in:

- `layouts/shortcodes/scientific-plate.html`;
- `layouts/partials/scientific-plates/`;
- `layouts/partials/math-registry.html`;
- `assets/css/scientific-plates.css`;
- `assets/js/scientific-plates.js`;
- `scripts/check_content.py`.

`scientific-plate` takes a kind, identifier, title, and caption on one source
line. Plate numbers reset in every level-two section, like equations and
statements. `plate-ref` resolves same-note and cross-note references during the
build.

## Performance contract

Hugo renders all article and plate mathematics before deployment. The plates
use no charting library, canvas, client math renderer, external font service, or
network data. The one shared plate script loads only when an interactive plate
is present.

The full note is intentionally much larger than an ordinary article. Its named
budget in `scripts/check_budget.py` separates that authored mathematical content
from the global stylesheet, script, and font limits. The Writing index must not
load mathematical assets merely because one listed article contains math.

## Review contract

Before the branch can be accepted:

- build production and drafts with Hugo 0.164.0;
- inspect all six plates in shade and sunset;
- inspect 1440, 1180, 1024, and 390 pixel widths;
- check every plate annotation for collision and clipping;
- operate both controls with pointer and keyboard;
- verify that the page never gains horizontal overflow;
- fling-scroll the long article and confirm that no section becomes blank;
- inspect print preview, references, and long proofs;
- confirm Home and Writing do not load plate assets;
- confirm feeds retain static plates but omit controls.

The parent branch `experiment/private-press-plates` and commit `e7a5b00`
preserve the earlier one-plate prototype.
