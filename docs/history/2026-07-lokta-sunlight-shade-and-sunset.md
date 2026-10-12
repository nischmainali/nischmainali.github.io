# Lokta Sunlight: Shade and Sunset (superseded 12 October 2026)

This is the design language's former section 4, moved here unchanged when the
day and night room replaced it on branch `experiment/day-night`. The accepted
Shade and Sunset field it describes remains on `main` and in
`archive/pre-day-night-2026-10-12`. Read it as history, not as current rules.

#### 4. The Lokta sunlight environmental field

The environmental layer reconstructs the visible optics of
`https://www.sunlit.place/` on a Nepal-biased fibrous sheet. Nisch removed the
reference's vertical mullion and all of the earlier canopy, falling-leaf, and
multi-frond systems after visual review. Its identity comes first from projected
window light, Lokta material, and a restrained lichen cast. The only current
botanical exception is the optional, sunset-only niuro study documented below;
it must remain one quiet cropped accent, never a second foliage system.

The scene has two states. **Shade** keeps a shallow move from warm covered paper
toward a clearer green-white window side. **Sunset** uses the reference's peach
multiply light with a small green-gold bias. Both states keep daylight ink.
Treat them as two positions of one sun and shutter system, rather than a light
theme and dark theme.

A finite projected slat field drives the rays. Each source slat is 180vw wide:
a 100vw solid `#c7c7c7` border joined to an 80vw material surface. Ten-pixel
transparent top and bottom mitres make that solid border taper from 76 to 56 px
in desktop shade and from 40 to 20 px at sunset. Phone shade tapers from 62 to
42 px. Source periods are 64/58 px in desktop/phone shade and 73.6/66.7 px at
sunset. Every slat shifts left by one viewport percent, rotates four degrees in
depth around 90vw, and passes through a 50vw perspective. The parent plane moves
from -20 to -16 degrees and travels 10vw along its own rotated axis. This is a
projective fan, not a parallel repeating texture. Do not cross-fade two stripe
textures or flatten the child plane back into a two-dimensional period.

The shade right edge keeps a six-pixel base blur. Sunset adds a restrained
optical bloom to 10.5 px; it softens the projected boundary without changing
slat width, phase, or depth. Sunlit's rotated progressive stack occupies
`[-0.5H, W-0.5H]`, not `[0,W]`, and layers 0.5, 8, 25, 50, and three overlapping
100 px masks. The cached shader uses their second-moment Gaussian equivalent;
the overlap reaches roughly 135 px at the covered edge. A separate 85-degree
desktop or 75-degree phone paper veil covers the left field and fades
continuously. In sunset its normalized reveal is raised to the power `1.52`,
allowing the mid-left repetition to dissolve sooner while leaving the
window-side depth nearly unchanged. Its aspect-ratio-aware coordinate must never
collapse into a vertical boundary.
The visible viewport lies almost entirely in the solid border extension, so it
uses one neutral shadow pigment in shade and sunset; warm light changes its
appearance without replacing it with a darker sunset color.

The slat aperture changes over 500 ms, the plane settles over 1.2 seconds, the
base diffusion blooms over 1.8 seconds, and the peach field over three seconds.
Raking paper relief enters after a 550 ms delay over 4.8 seconds and returns over
2.4 seconds. The rays stay still after reaching either endpoint. Continuous life
comes from the reference-matched Gaussian grain at twenty stepped positions per
second. Under `prefers-reduced-motion`, the renderer keeps the complete optics,
material texture, blur, and current endpoint but holds them as one still frame;
mode and route changes settle directly without replaying movement. This is not
the old flattened fallback. Returning to normal motion resumes the shared clock.

A sparse set of paired highlight-and-shadow fibres remains near-invisible in
shade and resolves under raking sunset light. Keep the local tonal difference
around three to five percent. The fibres should register as paper thickness on a
second look. Cursor parallax and drifting ray phases do not belong here.

Home, Writing, and articles share the field. Route attenuation protects the
article measure while the outer sheet retains the full projection. Check all
three before changing shadow strength. Page navigation preserves the mode,
grain clock, seed, and any active transition. The next page must enter the same
patch of light without a loading veil or replay.

Page navigation does not use the browser's document transition API. Its incoming
snapshot could expose the root paper color before the saved frame had decoded.
Links use normal static document navigation, so the browser replaces titles and
prose once without another compositing layer.

The site saves a small WebP copy of the live canvas in session storage. The
worker limits the copy to 600,000 pixels and produces it after the first frame,
after a color change, during a shade or sunset transition, and every 1.6 seconds
while the page is visible. The rolling copy stays close to the live optical
clock without doing image work on the main thread. A script in the head checks
its age, color scheme, ink scheme, and aspect ratio before using it. The saved
frame is therefore present before the body is painted on a link, refresh, or
history traversal. The shade or sunset gradient remains beneath the WebP while
the browser decodes it, so the root color cannot show through. The new opaque
canvas removes the saved frame after its first frame and compositor fade are
complete. The sunlight controller starts near the top of the body, so it does
not wait for a long article to finish parsing. The CSS poster now appears only
on the first visit or when the browser cannot render or save a live frame.

The worker renders one opaque canvas and caches the paper and shutter pass.
Ambient frames copy that surface, add grain, and apply the sunset multiplier.
The projective shader finds the nearest source slat analytically and evaluates
thirteen neighbours, enough for the widest overlapping blur while remaining
independent of viewport height. The renderer performs no work in response to
scroll. Keep the worker fallback, DPR cap, deterministic asset versions, and
static CSS poster. Performance work may remove redundant computation, but it
must preserve the progressive blur, transition continuity, paper relief, and
build-time mathematics.

##### Accepted successor: Lokta Sunlight reader

The implementation developed on `experiment/lokta-sunlight-reader` is the
accepted reconstruction of Sunlit's optics on the Lokta Field Note. The
checkpoint at `c26729b` preserves the preceding article and environmental
implementation; the accepted lineage continues through
`experiment/toc-outside-sheet` and `main`.

The pass notes below form a chronological record. Later headings supersede the
implementation claims in earlier headings. The ray-first optics pass records
the current environmental state.

The live Sunlit production bundle supplied the control measurements. The first
Sunlit-calibrated checkpoint matched these parts of the reference:

- the 85-degree desktop field and 75-degree phone field, including the 20 and
  45 percent clearing points;
- the 64/58 px shade periods, 74/67 px sunset periods, and 56/42/20 px shutter
  depths;
- the shutter plane's change from -20 to -16 degrees and its 10vw sunset travel;
- the independent 24 px vertical mullion with its right edge at 70 percent of
  the viewport, with shutter diffusion strongest on the left and sharpest on
  the right;
- a generated 512 px Gaussian grain field with the reference mean, deviation,
  eleven offsets, and twenty stepped positions per second;
- two cropped canopy envelopes, 300 instanced peepal silhouettes, and thirty
  edge-bound falling leaves with 3 to 6 second travel;
- the reference clocks: 0.5 seconds for slats, 1.2 seconds for the plane, one
  second to reveal foliage, 0.5 seconds to hide it, and three seconds for the
  sunset field.

Four choices remain specific to this site. The paper keeps a low-chroma lichen
cast at the reference luminance. Peepal and niuro forms replace the generic
rounded leaves. A broad attenuation field reduces shadow contrast beneath
Documents and article measures. The controls keep names, state, keyboard focus,
persistence, and reduced-motion handling.

The browser receives one opaque WebGL2 canvas. A worker owns it when
`OffscreenCanvas` is available; the same renderer runs on the main thread as the
first fallback, and a complete CSS poster remains beneath both. The renderer
caches paper and shutters in an RGBA8 texture. Steady frames copy that texture,
draw the instanced plants, add grain, then apply the sunset multiplier. It
redraws the paper texture during a mode or route change and after resize. Scroll
never enters the environmental controller.

The controller stores the mode, seed, scene epoch, ambient offset, and an active
transition. A destination page resumes the same phase. The poster remains until
the first canvas frame reaches full opacity. The renderer caps backing-store
area at 2,304,000 pixels, so a large display cannot create an unbounded canvas.

The branch also strengthens the static document plane. Hugo resolves equation
and statement references during the build. Citations use stable occurrence IDs
and an alphabetical author-year bibliography. The References heading enters the
ordinary Markdown outline. Wide code and figures clear marginal notes, while a
shared 2.6rem gutter separates notes from equation numbers. The dense specimen
keeps dual KaTeX HTML and MathML by default; a MathML-only build flag remains
available for browser and assistive-technology testing.

Visual QA on 19 July 2026 covered 1440, 1180, 1024, and 390 px in shade, settled
sunset, and during the mode change. A 3200 px immediate fling kept prose and
mathematics painted in the worker tier. The page reported no horizontal
overflow. The open contents fold cleared the theme control at phone width, and
the 1180 px layout retained 2.25rem between rail and prose plus 2.6rem between
prose and marginal notes. Safari, Firefox, VoiceOver, and a midrange phone remain
useful checks before future renderer changes.

##### Reference-calibrated finishing pass (20 July 2026)

The finishing pass compared live Sunlit captures with the local renderer at the
same desktop and phone sizes. Keep these values together. Small independent
changes can return the sunset field to brown or make the shade field look split
in two.

- The live paper runs from `vec3(0.992, 0.976, 0.962)` near the window to
  `vec3(0.962, 0.970, 0.948)` at the far edge. The CSS poster uses `#fdf9f5`
  and `#f5f7f2` so its first frame meets the canvas without a cool flash.
- Sunset uses the full `vec3(1.015, 0.758, 0.571)` multiplier. The extra red
  restores Sunlit's apricot luminance. The paper and shadows carry the site's
  green cast.
- A linear veil replaces the delayed smooth ramp. One broad field shadow models
  the overlap between Sunlit's blur bands, while a second periodic shadow keeps
  the shutter rhythm legible near the right edge. The shadow colors sit near
  neutral moss: `vec3(0.655, 0.660, 0.645)` in shade, with a small move toward
  `vec3(0.425, 0.435, 0.395)` at sunset.
- The canopy follows Sunlit's radial opacity envelope, correlated vertical
  displacement, and 45 to 225 degree rotation range. Blur grows toward the left
  from 8 to 38 px. Peepal outlines remain the local leaf vocabulary.
- The niuro frond ends at roughly `(0.76, 0.47)`. Its pinnae use 6 to 10 px blur
  and low gains, so the frond reads as a shadow signature near the edge. Falling
  leaves retain Sunlit's count and timing with less opacity on phones.
- Article route attenuation is `[0.74, 0.95]`; Documents uses `[0.84, 0.95]`;
  Home remains `[1, 1]`. Do not brighten an article's reading measure by
  weakening the whole environment.
- The CSS poster hands off in 140 ms. The controls keep their 20 px visible
  geometry and gain seven horizontal and three vertical pixels of invisible hit
  area. The two crop-corner controls do not overlap.
- A page with an opening initial preloads the 10 KB readable F2 face. Its fixed
  square can show the letter at once; the 169 KB F1 ornament may arrive later
  without moving the prose.
- Reduced-motion preference leaves the clock running at 30 frames per second. It
  lowers lateral leaf travel and fern sway to 32 percent. The scene remains live
  whenever the page is visible.

The local sunset keeps a small Nepal-specific green-gold bias. At 1440 px its
clean right field measured about `rgb(218,174,133)`, compared with Sunlit near
`rgb(217,169,129)`. The local shutter variation also remains softer. Nisch had
already asked for warmer light with less depth and weaker dark shadows, so treat
both differences as accepted constraints rather than missed calibration.

##### Hybrid shadow restoration pass (20 July 2026, superseded)

Nisch removed the vertical mullion and falling leaves after reviewing the
calibrated successor. This checkpoint retained two niuro fronds and an
edge-cropped peepal canopy. The later ray-first pass removed those remaining
forms.

The mode change now borrows the predecessor's optical choreography without
restoring its costly DOM filter stack. Shade and sunset use complete shutter
fields at their fixed endpoint periods and depths. The renderer cross-fades
those fields over 1.8 seconds while the plane moves for 1.2 seconds and paper
color changes over three. Botanicals use 1.6 seconds. Raking relief enters after
a 550 ms delay over 4.8 seconds and returns to shade over 2.4 seconds. A reversed
toggle scales each remaining channel duration to its current distance from the
new endpoint.

This pass also removes the broad dark field wash. A small paper-colored veil
keeps the window side luminous, while the periodic shutter field carries the
architectural shadow. Preserve the current worker, cached texture, route
attenuation, session clock, and active-transition handoff. Reduced-motion mode
keeps the full environmental timing and 20 fps ambient surface; it must not
collapse the mode transition.

The same pass restored the home portrait's crop-sheet registration. `.home`
remains an unpositioned flex item with its own stacking level, so the absolute
portrait uses the page as its containing field. At 1280 px the portrait begins
near `(788, 198)` and measures about `291 × 218` px. The semantic introduction
keeps its 1.17 em / 1.5 rhythm, and the portrait returns to document flow at
768 px and below.

The article finishing values are a 36rem prose measure, a 42rem breakout, an
8.25rem contents rail, and a 2.25rem rail gap. Prose uses 1.055rem at 1.61 line
height. At 1180 px the rail and title share the 134 px inset and prose begins at
302 px. At 1179 px the rail becomes the in-flow disclosure without overlap.

Final browser checks covered the opened and closed outline at 1180 and 1179 px,
the mathematical section at 1024 px, and the complete opening at 390 px. Home,
Documents, code, tables, equations, sidenotes, citations, shade, and sunset
showed no page-level overflow or console errors. A 5030 px phone fling painted
the destination content and fixed canvas in the first captured frame. Two
captures 700 ms apart under reduced motion differed across the live surface,
confirming that the environmental clock continued.

##### QA and continuity polish (20 July 2026)

The environmental controller now gives each saved mode change an exact end time.
It derives that time from the channel distances, so a partial reversal keeps
only the time needed to reach its new endpoint. The pre-paint header and the live
controller read the same value and discard expired records. During page changes,
the source poster stays beneath the canvas until the resumed frame reaches full
opacity. The sun control announces the requested destination during that short
handoff instead of describing the source poster.

Home now anchors its title dingbat to the title itself. The portrait keeps the
accepted crop-sheet geometry and cross-fades its shade and sunset veils over a
1.6 second interval. Documents constrains its
measure to the paper inset from 768 through 799 px, removes the doubled interval
before the first entry, and gives entry titles a wine hairline and forest-ink
focus state. These changes extend the existing print vocabulary without adding
cards or motion.

Opened articles place the skip link first in keyboard order and label both
navigation regions. The sticky outline keeps its small type, but interactive
nested entries and the return link use a stronger quiet ink over sunset. We
reviewed Home, Documents, the scratch specimen, and the Gaussian-process note at
1280, 1180, 1179, 768, and 390 px in shade and sunset. The 4200 px article fling
kept the prose and canvas painted. Route handoffs, active outline tracking,
mathematical overflow, focus treatment, page width, and the browser console
showed no new fault.

##### Ray-first optics pass (20 July 2026)

Nisch removed the remaining canopy and both fern compositions. The renderer now
uses five channels: aperture, plane, diffusion, sunset, and paper relief. It no
longer compiles a botanical shader, creates instance buffers, uploads foliage on
resize, or draws plant fragments during ambient frames.

The live Sunlit bundle corrected two earlier assumptions. Its slat aperture
morphs over 500 ms; an inert parent transition had made 1.8 seconds look like the
ray clock in the stylesheet. Its 10vw translation runs along the rotated slat
axis and does not shift an infinite stripe field across its normal. The current
shader follows those mechanics. It morphs one indexed field, applies the plane
translation in local coordinates, and keeps diffusion fixed in both modes. The
serialized diffusion channel remains only so an older in-flight page transition
can cross a navigation boundary without invalid state.

A Gaussian-damped Fourier field now convolves the complete periodic shutter
instead of blurring one isolated slat. It therefore preserves the correct shadow
duty cycle beneath the 50 and 100 px covered-side blur. The right edge begins at
six pixels; an independent 200-degree pigment feather, a one-percent-per-band
fan, and the broad oblique veil replace the former common cutoff. This removes
the periodic modulus seam, doubled midpoint pattern, and vertical dark boundary.
The shadow uses one green-biased neutral pigment in shade and sunset.

Browser checks covered Home and the scratch article at 1280 and 390 px in both
states, plus both directions of the transition. The pages kept their width, the
worker remained active, and the phone article preserved its reading hierarchy.
The final promotion matrix still needs the other routes and browsers listed in
the experiment gate.

##### Projective shutter correction pass (20 July 2026)

Direct matched captures showed that the ray-first field was not yet close
enough. Its direction was broadly right, but its bands remained parallel, the
shadow bodies were too thin, and their reveal began 350 to 500 px too late. The
cause was structural: the shader had reproduced the parent rotation but omitted
Sunlit's child `rotateY(4deg)`, `perspective: 50vw`, 100vw solid border, and
transparent border mitres.

The successor now inverts the complete CSS homography per fragment. At a
1280 × 720 viewport its computed shade shutter rectangles agree with the live
reference to sub-pixel rounding: shutter 0 begins near `(2.98, -801.91)` and
measures about `2084.06 × 750.35`; shutter 8 begins near `(93.20, -343.35)` and
measures about `2063.94 × 882.04`. The effective far-right periods now match at
roughly 70 px in shade and 79–80 px at sunset, while ray angle changes across
the fan instead of remaining globally fixed.

Filtered slats composite source-over rather than by additive clamping. The
progressive blur coordinate includes the rotated stack's `0.5H` offset, and its
overlapping mask variances are accumulated before the six-pixel base blur. The
paper veil uses the exact aspect-aware 85/75-degree direction. Because the DOM
reference blurs that veil after compositing while the cached renderer folds the
operations into one pass, the desktop analytical stop begins at 13 percent to
match the reference's apparent 20 percent stop; phone remains at 45 percent.

Endpoint audits at 1280 × 720 found matching projective slopes, periods, shadow
depths, and 10–90 edge widths. Shade and sunset retain a deliberately small
Nepal-specific difference in paper fibre and green cast. No vertical mullion,
canopy, fern, or falling leaf returned in that checkpoint. A 13-neighbour analytic lattice lookup
replaced the fixed 20-slat loop, preserving broad-blur tails while supporting
tall viewports and reducing transition work. Home, the mobile article, and a
long mathematical fling remained painted; the CSS poster still exists only as
the short pre-WebGL and failure fallback.

##### Optical edge and niuro experiment (20 July 2026)

The final ray pass leaves the already matched band width, ten-pixel mitre,
period, Gaussian edge, and progressive-blur field alone. Instead it corrects
the finite shutter boundary: the source blurs the ends of each projected slat,
whereas the first projective shader clipped them with a binary step. The new
finite mask converts the screen-space optical sigma back into shutter-local
space before feathering both ends. This extends the broad left penumbra without
softening the accurately matched window-side edges. The redundant 0.96 shadow
ceiling is also gone; the reference veil now sets the final limit by itself.

Sunset carries one restrained botanical shadow. It is a
partly opened niuro / pani-niuro frond, informed by the long pinnate form of the
Nepali wild food ferns documented in the [review of Nepalese food
ferns](https://pmc.ncbi.nlm.nih.gov/articles/PMC9699988/). This is not a return
to the old canopy: one deterministic rachis enters mostly from beyond the
upper-right crop, with paired lanceolate pinnae and a quiet crozier. It fades in
only after the shutter has opened, is weaker on Documents and articles, and has
its own smooth 640-to-760 px responsive entrance. That independent fade prevents
a cropped rachis from popping in or resembling the rejected vertical mullion on
tall narrow screens; it does not alter the shutter's exact 600 px breakpoint.

The niuro is deliberately static. It lives inside the cached paper shader,
beneath grain and sunset multiplication, so scrolling adds no draw call,
texture, filter surface, or DOM animation. Its strength is controlled
by `data-fern-strength` on `#sunlit-scene`; removing that attribute or setting it
to zero restores the foliage-free endpoint. The shader rejects the niuro path
before evaluating its morphology whenever the frond is invisible, including
shade and narrow widths. The ambient grain renders at its native twenty distinct
states per second rather than redrawing the same state three times at 60 fps.
Between those states the renderer sleeps instead of waking at display refresh
rate. Mode transitions remain 60 fps in the normal-motion experience; reduced
motion holds a fully rendered endpoint without a continuous loop.

The final sunset-boundary calibration is intentionally limited to diffusion and
veil response. A twelve-frame grain-averaged audit against the reference found
the 10–90 percent window-side edge widths within roughly one pixel at 1280 px;
the `1.52` veil curve removes the remaining over-defined mid-left shoulder. Do
not compensate by changing shutter period, finite-edge masking, progressive
blur geometry, pigment opacity, or the shade endpoint.
