-- garden.lua: a garden grown round a sheet's printing, from the parts of
-- tikz-flora (MIT, github.com/wn-mitch/tikz-flora): its clearance field,
-- its steered and tapering stems, its leaves, blooms and sprays, its brush
-- and painter, and its growth clock.
--
-- tikz-flora grows one plant up a page's margin under a hero bloom. Here
-- the plant follows guides drawn round the printing instead, and it keeps
-- out of the printing twice over: nothing grows within `hard` pt of it,
-- and beyond that the clearance field is capped by the distance to it, so
-- the garden degrows as it nears the printing. Large blooms open only in
-- open space, leaves come nearer, and fine stems and leaflets nearest.
--
-- spec (pt, y up from the lower left):
--   width, height     the garden's sheet
--   open              {{x0, y0, x1, y1}, ...} where flora may grow
--   content           {{x0, y0, x1, y1}, ...} the printing it keeps clear of
--   keep              {{x0, y0, x1, y1}, ...} furniture it keeps clear of
--   guides            {{pts = {{x, y}, ...}, w0, w1, ahead, shoots}, ...}
--                     each main stem's way, from its root to its tip
--   hero              {x, y, R}, optional: the one large bloom, at a guide's tip
--   emph              {{x, y, r}, ...}, optional: where the garden is fullest
--   hard, soft, slope the clear margin (pt), the depth of the degrowing band
--                     beyond it (pt), and the room allowed per pt within it
--   mw                the scale of leaves and blooms, as tikz-flora's margin width
--   seed, mix, compose, grow (0-1: a growth frame)

local G = require("flora.geom")
local Rng = require("flora.rng")
local Paint = require("flora.paint")
local Space = require("flora.space")
local Grow = require("flora.grow")
local F = require("flora.flower")
local L = require("flora.leaf")
local S = require("flora.sprig")
local Tune = require("flora.tune")
local Plant = require("flora.plant")
local Brush = require("flora.brush")
local Mix = require("flora.mix")
local Clock = require("flora.clock")
local pal = Paint.palette

local M = {}
local pi, sqrt, max, min = math.pi, math.sqrt, math.max, math.min

-- Distance (pt) from each cell of grid g to the nearest box, beyond the
-- clear margin `hard`.
local function distance_to(g, boxes, hard)
  local nx, ny, c = g.nx, g.ny, g.c
  local out = {}
  for k = 0, nx * ny - 1 do
    local x, y = (k % nx + 0.5) * c, (k // nx + 0.5) * c
    local best = math.huge
    for _, b in ipairs(boxes) do
      local dx = max(b[1] - x, 0, x - b[3])
      local dy = max(b[2] - y, 0, y - b[4])
      local d = dx * dx + dy * dy
      if d < best then best = d end
    end
    out[k] = max(0, sqrt(best) - hard)
  end
  return out
end

local function smooth(a, b, x)
  local t = G.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
end

-- A main stem steered along its guide, stopping where the open region ends.
local function strand(g, gd)
  local guide = G.spline_points(gd.pts, 10)
  local total = G.length(guide)
  local pts, a = G.pursue(guide[1], G.angle(guide[1], guide[2]), G.follow(guide, gd.ahead or 56, 6), {
    step = 2, len = total * 1.3, kmax = 1 / (gd.bend or 60), dk = 1 / (gd.ease or 1400),
    stop = function(q) return not g:open_at(q[1], q[2]) end,
  })
  if #pts < 8 then return nil end
  local st = Plant.stem(pts, gd.w0 or 2.2, gd.w1 or 0.55)
  st.tip = { pts[#pts], a }
  st.root = gd.root ~= false
  return st
end

-- A shoot leaving stem `st` at fraction t, turned `turn` from it, about
-- `len` long, bending `bend` (pt of sideways swing) and ending in a tip.
local function shoot(g, st, t, turn, len, bend)
  local p, a = Plant.at(st, t * st.len)
  local h = a + turn
  local mid = G.polar(G.polar(p, h, len * 0.5), h + pi / 2, bend)
  local tip = G.polar(p, h + turn * 0.4, len)
  local guide = G.spline_points({ p, mid, tip }, 12)
  local pts, ea = G.pursue(p, h, G.follow(guide, 30, 4), {
    step = 2, len = len * 1.25, kmax = 1 / 40, dk = 1 / 900,
    stop = function(q) return not g:open_at(q[1], q[2]) end,
  })
  if #pts < 10 then return nil end
  local w = Plant.fork(st, t, 0.9)
  local sh = Plant.stem(pts, min(w * 0.7, 1.2), 0.4)
  sh.tip = { pts[#pts], ea }
  return sh
end

function M.page(spec)
  local palette = Mix.resolve(spec.palette, spec.seed, 0)
  return Mix.with_palette(palette, function() return M.plant(spec) end)
end

function M.plant(spec)
  local rng = Rng.new(spec.seed or 1)
  local W, H = spec.width, spec.height
  local hard, soft, slope = spec.hard or 22, spec.soft or 90, spec.slope or 0.45
  local g = Space.new(W, H, 3)
  for _, r in ipairs(spec.open or { { 0, 0, W, H } }) do g:open(r[1], r[2], r[3], r[4]) end
  local content = spec.content or {}
  for _, b in ipairs(content) do g:block_text(b[1] - hard, b[2] - hard, b[3] + hard, b[4] + hard) end
  for _, b in ipairs(spec.keep or {}) do g:close(b[1], b[2], b[3], b[4]) end
  g:field()

  -- Degrowing: near the printing the field is capped by the distance to
  -- it, so whatever is placed there must be small.
  local near = distance_to(g, content, hard)
  for k = 0, g.nx * g.ny - 1 do
    local cap = near[k] * slope
    if g.f[k] > cap then g.f[k] = cap end
  end
  local function near_at(x, y)
    local i, j = math.floor(x / g.c), math.floor(y / g.c)
    if i < 0 or j < 0 or i >= g.nx or j >= g.ny then return 0 end
    return near[j * g.nx + i]
  end
  local emph = spec.emph or {}
  local function dens(x, y)
    local e = 0
    for _, q in ipairs(emph) do
      local d = G.dist({ x, y }, q)
      e = max(e, 1 - smooth(q[3] * 0.4, q[3], d))
    end
    local base = #emph > 0 and (0.45 + 0.55 * e) or 0.8
    return G.clamp(base * (0.25 + 0.75 * smooth(0, soft, near_at(x, y))), 0.12, 1)
  end

  local cfg = Mix.cfg(Tune.compose, spec.mix)
  for k, v in pairs(spec.compose or {}) do cfg[k] = v end

  -- The hero bloom, where given, holds its place before anything grows.
  local hero = spec.hero
  if hero then
    local _, rh = F.tilt(hero[1], hero[2], hero[3], Tune.hero.tilt)
    g:disc(hero[1], hero[2], rh, 0.85)
    for _, sx in ipairs({ -1, 1 }) do g:disc(hero[1] + sx * hero[3] * 0.45, hero[2], hero[3] * 0.55, 0.85) end
  end

  local strands, stems = {}, {}
  local srng = rng:fork("shoots")
  for i, gd in ipairs(spec.guides or {}) do
    local st = strand(g, gd)
    if st then
      strands[#strands + 1] = st
      for k = 1, gd.shoots or 0 do
        local t = srng:range(0.22, 0.62)
        local side = srng:chance(0.5) and 1 or -1
        local sh = shoot(g, st, t, side * srng:range(0.45, 0.8), st.len * srng:range(0.18, 0.3), side * srng:range(8, 20))
        if sh then strands[#strands + 1] = sh end
      end
    end
  end
  for _, st in ipairs(strands) do
    st.width = Plant.width_fn(st)
    g:reserve_line(st.pts, 2, 4)
    stems[#stems + 1] = st
  end

  local blooms, leaves, leaflets, back = {}, {}, {}, {}
  local stem_batch, spray_batch = S.batch(), S.batch()
  local ctx = {
    cfg = cfg, mix = spec.mix, pos = spec.grow and setmetatable({}, { __mode = "k" }), mw = spec.mw or 120,
    dens = dens, ylo = 0, span = H, strands = strands, stems = stems,
    stem_batch = stem_batch, sprays = spray_batch, blooms = blooms, back = back,
    leaves = leaves, leaflets = leaflets, counts = { ghost = 1 },
  }
  local grow_rng = rng:fork("grow")
  Grow.node_leaves(g, grow_rng:fork("nodes"), strands, ctx)
  Grow.tips(g, grow_rng:fork("tips"), strands, ctx)
  Grow.holes(g, grow_rng:fork("holes"), ctx)
  for _, s in ipairs(strands) do
    for _, it in ipairs(S.leaflet_items(rng, s.pts, cfg.leaflet_spacing, cfg.leaflet_size)) do
      if g:room(it[1], it[2]) >= it[4] * 0.3 and rng:next() < dens(it[1], it[2]) then
        leaflets[#leaflets + 1] = it
      end
    end
  end

  -- Paint back to front, as tikz-flora does: stems, sprays, leaflets,
  -- leaves, blooms. A growth frame paints what the front has reached.
  local pt = Paint.new({ backend = os.getenv("FLORA_BACKEND") })
  local function layer(tag, fn)
    pt:begin_group(tag)
    fn()
    pt:end_group()
  end
  local clock = spec.grow and spec.grow < 1 and Clock.new(g, stems, spec.grow) or nil
  pt.clock = clock
  local function draw(f, dur, delay)
    if clock then clock:draw(pt, f, ctx.pos[f], dur, delay) else f(pt) end
  end
  layer("stems", function()
    local sr = rng:fork("stem paint")
    for _, s in ipairs(strands) do
      if clock then
        clock:stem(pt, s, Tune.plant.root_width, function(p) Brush.stem(p, sr, s.pts, s.width, Tune.plant) end)
      else
        Brush.stem(pt, sr, s.pts, s.width, Tune.plant)
      end
    end
    stem_batch:paint(pt)
  end)
  layer("sprays", function() spray_batch:paint(pt, Paint.mix(pal.ink, pal.sky, 0.4)) end)
  layer("leaflets", function()
    if clock then clock:leaflets(pt, rng:fork("leaflets"), leaflets, L.leaflets)
    else L.leaflets(pt, rng:fork("leaflets"), leaflets) end
  end)
  layer("leaves", function()
    for _, f in ipairs(leaves) do draw(f, 0.06) end
  end)
  layer("blooms", function()
    for _, f in ipairs(blooms) do draw(f, 0.1, 10) end
    if hero then
      local hf = function(p) F.hero(p, rng:fork("hero"), hero) end
      if clock then clock:draw(pt, hf, hero, 0.15) else hf(pt) end
    end
  end)
  pt.clock = nil
  pt.coverage = g:coverage()
  pt.counts = ctx.counts
  pt.counts.leaves = #leaves
  return pt
end

return M
