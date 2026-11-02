# The sheet gardens

Each sheet carries a garden grown round its printing (DESIGN_LANGUAGE.md,
section 8). The gardens are grown here, ahead of time, and committed: each is
measured from the page it frames, and Hugo cannot run the Lua that grows it.

## When to grow them

After a change to a page's text, to the sheet's layout (`assets/css/`), or to
the composer, grow the affected gardens again and check them. The site's check
(`./scripts/qa.sh` runs `scripts/check_gardens.py`) names gardens grown for an
earlier version of their page.

```sh
python3 scripts/garden/grow.py /blog/gp-code-notes/
python3 scripts/garden/fit.py /blog/gp-code-notes/
```

Without a page address, every page that carries a garden is grown (about five
minutes) or checked (about two). Look at the page in the browser at 1440 and
1180 px, day and night, before committing `assets/gardens/` and
`data/gardens.json`.

`grow.py --check` reports gardens whose page has moved since they were grown;
`fit.py` is the stronger check, reading each garden's masks under every block
of text at twelve widths.

## What it needs

lua5.4, cwebp, Python 3 with Pillow and Playwright, and Google Chrome. The
site's check needs none of them.

## How a garden is grown

1. `hugo --minify` builds the site into a temporary folder, served locally.
2. Each page is opened at 1440, 1300 and 1180 px with the room a garden asks
   for at its head and foot, and its printing is measured block by block,
   each block across its column.
3. `plan()` in `grow.py` draws the guides the main stems follow for the kind
   of page; `garden.lua` grows tikz-flora's plants along them, keeping 22 px
   clear of the printing and thinning out as it nears it.
4. tikz-flora's painter paints the scene on a canvas; it is split by hue into
   the leaf ink's mask and the flower ink's, and a growth map is made from
   each point's distance along the garden from its roots.
5. The masks and growth maps are written as WebP to `assets/gardens/<page>/`,
   and their heights and the measured blocks to `data/gardens.json`.

`driver.lua` makes the site's small changes to tikz-flora's tuning: four
petals and narrower leaves.

## tikz-flora

`vendor/tikz-flora/` holds the parts of
[tikz-flora](https://github.com/wn-mitch/tikz-flora) the grower uses,
unmodified, with its MIT licence. `vendor/tikz-flora/UPSTREAM.md` records the
upstream commit and how to update it.
