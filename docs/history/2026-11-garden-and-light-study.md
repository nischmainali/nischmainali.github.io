# The garden and the light: the November 2026 study

Nisch accepted the garden on 2 November 2026, and the light drawn again for
it the same day; both were promoted to `main` together. The current rules are
in `DESIGN_LANGUAGE.md`, sections 3, 4 and 8. This note records the rounds and
what was rejected, so a later pass does not repeat them. The working labs are
outside the repository at `/Users/nisch/code/site/garden-lab/`: `flora/` (the
first generator), `tikz-flora/` (the mocks of the garden on real pages) and
`light/` (the light variants, photographed on real pages with their gardens).

## The garden

1. **Procedural flora.** The question was whether flowers grown by a program,
   in the manner of florilegium (Wong, Zongker and Salesin's floral ornament),
   belonged on the site. A full margin garden did not fit then: the left wing
   holds the index card, the margin column holds sidenotes, and the room
   already carried foliage as light. A small generator of our own (lokta,
   rhododendron, primula and peepal, in wash or engraving) found its best
   place in the empty margin column beside a note's opening.
2. **tikz-flora.** Nisch found tikz-flora, a much richer engine in the same
   lineage, and asked for its core as a growing watermark. Its own composer
   pins a large bloom to a tall margin and always draws a compass, a gilt
   chain and sparkles, so the site uses its parts with a composer of its own.
   A headpiece crowning the title was the first mock; behind the body text it
   lowered contrast, and filling the empty paper with pattern was too busy.
3. **Round the whole sheet.** Nisch rejected the headpiece alone as not clean
   enough and asked for the garden in the margins and at the foot too,
   "degrowing" round the content. The composer now steers stems along guides
   round the printing, keeps a clear margin, and caps each plant's room by its
   distance to the printing. Two inks of the page at watermark strength beat
   tikz-flora's own blue and a paper-pale true watermark.
4. **Removing the peepal.** The room's peepal and its sun coins clashed with
   the garden: its leaf shadows landed on the garden's crown. Nisch accepted
   giving it up.

## The light

5. **Three lights.** With the peepal gone, the light was drawn again from the
   original sources: sunlit.place's fanned blind slats and progressive blur,
   and Daylight's site, whose opening image is a botanical engraving in soft
   leaf shade and whose slits are crisp at the edge and dissolve. The rule
   taken from them: keep the sharp detail where the light comes in, in the
   empty corner, and let only broad, soft light reach the garden and the text.
   Blinds, today's window refined, and a single beam were offered.
6. **The beam, with blinds.** Nisch liked the beam best and asked for a blinds
   feeling nearer sunlit.place. Slits of light cut into the shaft halved its
   light and lost its glow, so the slats became shadows in a bright shaft.
   Slats that reached the reading column stopped at a seam; they now blur
   away over a wide band toward it.
7. **Softer, larger beams.** The fine slats were too sharp and took attention.
   Broad, soft beams (170 px apart at 1440, each slat's shadow letting a fifth
   of the light through) replaced them; 120 and 250 px were the neighbours.
8. **Finishing.** The brightest bands had a lemon cast where the red channel
   clipped past full sun, so highlights now roll off into the sun's colour;
   the top band's cap at the corner went with the window moved beyond it; the
   breeze comes in gusts; and the night's cross was softened to match.

## Into the site

The gardens are grown ahead of time: Hugo cannot run Lua, and each garden is
measured from its page. The sheet's measure narrows between 1440 and 1180 px,
so each garden is grown at 1440, 1300 and 1180 px. Pinned to one corner, a
garden drifted up to 39 px toward the text at the edges of those ranges; hung
between the sheet's trims instead, it stretches with the sheet and keeps its
distance within about 2 px. Measuring each block of text across its whole
column, rather than its lines' ink, removed the last touch, in the Writing
list, where ragged lines run longer at other widths. `scripts/garden/fit.py`
reads every garden's masks under every block at twelve widths and three
heights; none touches the text.

Growing in on a canvas showed three faults in turn, each fixed: the garden
drew nothing because the waiting print's opacity was read as its strength;
then it grew too fast, an ease-out front-loading it; and it printed darker
than the static garden because the strength was applied twice. The canvas
now hands over to the print in the same frame, and the two match.
