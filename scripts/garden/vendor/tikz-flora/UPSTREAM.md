# tikz-flora, vendored

These files are from [tikz-flora](https://github.com/wn-mitch/tikz-flora),
MIT licensed (see `LICENSE`), at upstream commit
`6885979469ca62c56ecfd4a358f4fada8cabffef` (31 October 2026). They are
unmodified: every file matches its upstream blob.

Only what the garden grower loads is kept: the Lua modules that
`scripts/garden/garden.lua` and `driver.lua` require (directly or through
tikz-flora's own requires), and the site's scene painter
(`site/src/lib/scene.js` with `scene-ops.json`), which paints the scene JSON
on a canvas.

To update, replace these files with a newer upstream copy, keep `LICENSE`,
record the new commit here, and grow the gardens again.
