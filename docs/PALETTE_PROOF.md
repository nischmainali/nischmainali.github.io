# Palette proof register

Status: experimental, local-preview only · Branch: `experiment/toc-outside-sheet` · Prepared: 21 July 2026

## Purpose

This proof asks a narrow question: which Protesilaos color language belongs on
the Lokta Field Note? It does not redesign the page. Typography, crop geometry,
article measure, marginalia, WebGL sunlight, shade/sunset timing, grain, fern,
and motion remain fixed so that color is the only meaningful variable.

The six proofs are:

1. `lokta-hybrid` — the current website synthesis and comparison control.
2. `ef-arbutus` — warm peach, green, and madder.
3. `ef-cyprus` — ochre, olive, teal, and red.
4. `ef-elea-light` — lichen green, plum, and olive.
5. `ef-arcadia` — verdant paper, violet, indigo, and cool green.
6. `modus-operandi-tinted` — the restrained, high-legibility control.

The upstream values were transcribed from the current 2026
[Ef themes](https://github.com/protesilaos/ef-themes) and
[Modus themes](https://github.com/protesilaos/modus-themes) sources. Each
register strip shows six representative source colors—paper, ink, link,
heading, accent, and muted ink—while the complete selection, border, and syntax
mapping remains encoded in the proof stylesheet.

## Translation into the website

An Emacs theme is not a website skin. Its colors describe semantic roles on a
flat editor background; this site places text over a moving translucent field.
The proof therefore maps roles rather than copying isolated hex values.

| Website role | Theme role |
| --- | --- |
| Main prose and mathematics | `fg-main` |
| Metadata, captions, marginalia | `fg-dim` |
| Links | semantic `fg-link` |
| Main section heading | theme `name` or principal botanical accent |
| Secondary heading | complementary cool accent |
| Active TOC trace | a second editorial accent |
| Dingbat and active navigation | source accent, used decoratively |
| Rules and crop marks | translucent `border` |
| Code and inline-code wash | translucent `bg-dim` |
| Selection | `bg-region` |
| Focus accent | `cursor`, paired with a dark outer line |
| Code syntax | source `comment`, `keyword`, `string`, `fnname`, `type`, `constant`, and `variable` mappings |

The source paper color appears directly in the proof register and in small
secondary sheets or washes. It does not recolor the WebGL canvas in this round.
That separation is deliberate: a fixed physical field makes differences in
editorial ink easy to judge and prevents a palette switch from becoming a
lighting switch.

## Moving-surface correction

The source themes meet their contrast targets on their own `bg-main`. The site
has a harder surface envelope:

- broad deep shade: approximately `#c5c4c3`;
- broad deep sunset: approximately `#c18f6b`;
- rare grain and fern floors: approximately `#b1b1b1` and `#ad8060`.

Several source accents and every source `fg-dim` become too pale on those
bands. Readable roles therefore use solid, precomputed shade and sunset inks.
The correction preserves the source hue and chroma and lowers OKLCH lightness
only until small text reaches 4.5:1 on the broad field. Body ink is also checked
against the rare pixel floor. Decorative rules and ornaments may remain
translucent because they do not carry meaning.

This is why the register shows canonical source swatches while prose sometimes
uses a slightly deeper expression of the same hue. The adjustment is part of
the translation, not a change to the source palette.

Visited links deliberately share the ordinary safe link color in this proof.
That keeps navigation history from becoming an uncontrolled seventh variable;
the source visited-link colors remain recorded for a finalist pass.

## Using the proof

Run the ordinary local preview:

```sh
hugo server --buildDrafts --renderToMemory --disableFastRender \
  --bind 127.0.0.1 --port 1320
```

Open `http://127.0.0.1:1320/blog/scratch/`. The square **Palette** register at
the lower left is available on every preview page. It supports pointer use,
arrow keys, Home/End, and Escape. Selection persists across Home, Documents,
and articles, synchronizes across preview tabs, and is reflected in the URL:

```text
?palette=ef-elea-light
```

The register and its compiled assets exist only while Hugo is serving the site.
A production build contains neither the control nor its stylesheet or script.

For a useful comparison:

1. Pause the atmosphere so every palette sees the same shadow field.
2. Check the article opening for prose, TOC, epigraph, dropcap, links, and sidenote.
3. Check `#code` for small syntax colors and block washes.
4. Check `#mathematics` for inherited math ink, equation references, statements, and citations.
5. Repeat in shade and sunset.
6. Visit Home and Documents to make sure the choice works outside the article system.
7. Check a narrow viewport before choosing a finalist.

## Deliberate boundary

This round does not tint the Sunlit renderer. Once one or two editorial palettes
survive comparison, a finalist can receive a very shallow cached-paper offset.
That later experiment should add one paper uniform and one redraw on palette
change. It must not recolor shadows, add a full-viewport overlay, restart the
worker, or alter the sun, grain, fern, and motion clocks.

The palette proof is a decision tool, not a new public preference panel. A
winning palette should eventually be compiled into the design system; the
register should then be removed or retained only as a private development aid.
