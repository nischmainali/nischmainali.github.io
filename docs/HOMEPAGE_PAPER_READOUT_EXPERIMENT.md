# Homepage paper readout experiment

Status: experimental

Branch: `experiment/home-paper-readout`

Stable parent: `790f2d3`

## Purpose

The selected-work ledger should stay compact. A visitor who wants more context can inspect a paper without leaving the homepage or turning every row into a large project card.

The readout combines three parts of the site’s visual language:

- the ledger remains a quiet printed register;
- a second piece of Lokta paper carries the extra information;
- the reveal behaves like a fast instrument readout, with a short connector and precise registration marks.

The computer-like quality comes from the interaction and the small technical plate. It does not introduce a black terminal, neon colour, glass panels, or a separate interface style.

## Scope

Only the first two selected works have readouts in this experiment. Each readout contains one short contribution statement, a small conceptual figure, and direct links. The remaining rows test whether enhanced and ordinary records can coexist without making the ledger look incomplete.

Publication data now lives in `data/selected_works.toml`. The homepage shortcode renders both the ledger and the optional readouts from that source.

## Behaviour

- On a wide screen, the note sits beyond the reading column and crosses the right crop line.
- On a medium screen, it opens below the selected row as a compact two-column sheet.
- On a phone, it becomes a single-column note inside the page measure.
- A fine pointer can preview a note by resting on a row. Clicking the inspect mark pins it.
- Keyboard focus opens the same note. Escape closes it. The close control returns focus to the inspect mark.
- Only one note can be open at a time.

The title remains a normal link. The inspect control has its own hit area so opening a note cannot accidentally follow the paper link.

## Performance and access

The figures are inline SVG. There are no preview-image downloads, remote data calls, canvas renders, or scroll handlers. The small stylesheet and script load only on the homepage. The content is present in the built HTML before the script runs, and the native `details` element remains usable without JavaScript.

Motion is limited to a short entrance shift and is removed when reduced motion is requested. The note uses the active ink palette and both lighting modes. It is hidden in print because the ledger already contains the durable record.

## Decision rule

This file records an experiment, not a permanent design principle. If the readout is accepted, its settled rules can be folded into `DESIGN_LANGUAGE.md`. If it is rejected, the stable homepage remains available at commit `790f2d3`.
