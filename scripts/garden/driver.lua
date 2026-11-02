-- Grow garden.lua on a spec read from stdin (a Lua table) and print the
-- painted scene as JSON. Run from scripts/garden/grow.py.
local here = arg[0]:match("^(.*)/[^/]*$") or "."
package.path = here .. "/vendor/tikz-flora/lua/?.lua;" .. here .. "/?.lua;" .. package.path
local spec = load("return " .. io.read("a"))()
local Tune = require("flora.tune")
-- The site's adaptations, made in small ways: four-petalled blooms, as the
-- lokta shrub's, and narrower leaves.
for _, st in pairs(Tune.blooms) do st.petals = { 4, 4 } end
Tune.hero.petals = 4
Tune.compose.leaf_width = { 0.13, 0.17 }
local Paint = require("flora.paint")
local Garden = require("garden")
local Pdf = require("flora.pdfout")
Paint.reset_resources()
local t0 = os.clock()
local pt = Garden.page(spec)
io.stderr:write(string.format("grown in %.1fs, coverage %.3f", os.clock() - t0, pt.coverage or -1))
io.write(Pdf.scene(pt, spec.width, spec.height))
