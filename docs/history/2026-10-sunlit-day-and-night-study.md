# Sunlit day and night: the October 2026 study

Nisch accepted the result on 12 October 2026; it is integrated on
`experiment/day-night`. The current rules are in `DESIGN_LANGUAGE.md`,
section 4. This note records how the study got there and what was rejected, so
a later pass does not repeat it. The working lab lives outside the repository at
`/Users/nisch/code/site/sunlit-lab/`; its `final.html` and `daynight.html` hold the
accepted references and measurements.

## What started it

A review of Shade and Sunset found static shadows with only grain moving, light
slits darker than the unlit paper, a sunset that multiplied the whole frame,
and no night. The direction was to model the light itself (warm sun, cool sky,
a shadow floor) and to add a night.

## Rounds and decisions

1. **Relighting the existing field** (variants A–D) was judged too timid.
2. **A physically based lab** (window treatments, sun angles, foliage, skylight,
   room bounce, glass and water caustics) was rich but overengineered.
3. **A quiet, readability-first set** (paper window, sun pool, desk light) beat
   the live site on every text measure, but none of the three was liked.
4. **An art-directed sketch** returned to what Nisch had liked first: slanting
   rays of warm light, a sun pool, softer foliage, much gentler motion. The sun
   pool was chosen.
5. **Refinement of the sun pool:** varied bars, a pool that ends, room falloff.
   Rejected along the way: a warm rim at light edges (it drew outlines), coins
   only under the canopy (the pool went flat), a pool lighting the whole column
   (it lost its shape), and bounce light (it washed out).
6. **Texture:** paper fibres and specks were removed. A fine static grain that
   gathers in the shade was chosen over plain grain and a sun-raked tooth.
7. **Night, first attempts:** a cool blue moon felt cold. A cozy round (lamp,
   flame, lokta sprig, passing cars) felt like two worlds, and the added plant
   moved too much. A warm, lamplit version went muddy.
8. **Research on warm dark schemes** (Flexoki, Kanagawa Dragon, Gruvbox, Rosé
   Pine, and all seventeen dark ef-themes) found that loved warm themes keep
   near-neutral grounds and put warmth in light ink. **ef-dream**, a step
   deeper, was chosen.
9. **At night the window draws its shape:** a flat patch with a sheared cross,
   ending at the sill, rather than day's beams. The high moon was chosen.
10. **The transition:** a 4.4-second sunset, dusk and moonrise story was too long,
    and its purple middle was disliked. It was replaced by one 1.8-second morph in
    which the shadows carry the change and colours blend straight. A polish pass
    staggered the room ahead of the window light, gave dawn its own clock, and
    measured the ink's turnover.
11. **A crease** inside the soft bars came from assembling each shadow from
    two panes of different width. Every bar now casts its own whole shadow.
12. **Refined night** (light spilling into the room, far edges softening with
    distance) was accepted at once. **Refined day** (slim bars, presence near
    the window, a fade to the left) first showed splotchy foliage: the pool
    lit the peepal's dense crown. Moving the tree so only its branch tips hang
    into the sun, with blur that follows canopy density, fixed it.
13. **Final round:** leaf shadows blurred by a round disc as the sun blurs
    them, coins gathered near the leaves, and day's light a touch warmer
    than its shade.

## Integration notes

The lab redrew a simulated tree on a CPU canvas 24 times a second. The site
uses a static silhouette posed in the day's breeze, and the sway is drawn in
the shader, matched to the lab by the change over one and two seconds. Outside
the leaves, the site renderer reproduces the lab pixel for pixel. The 99th
percentile of difference is at most 4 levels.
