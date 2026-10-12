/*
 * Lokta Sunlight Renderer: day and night.
 *
 * A dependency-free WebGL2 surface that draws one room in two lights. By day
 * a window's sun pool falls across the page, slim window bars and the tips
 * of a peepal's branches in it, sun coins gathered near the leaves, grain
 * gathered in the shade. By night the moon, standing higher, lays the same
 * window down as a compact patch with its cross, its light spilling softly
 * into an ef-dream room, and a thin cloud now and then. Between them the
 * shadows carry the change while the colours blend in a straight line.
 *
 * The same classic script runs in a dedicated worker or in the window for
 * the main-thread fallback. It owns no storage, controls, or scroll state;
 * the page controller sends the mode and any change in progress.
 */
(function(root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.SunlitRenderer = api;
  }
})(typeof self !== 'undefined' ? self : this, function(scope) {
  'use strict';

  var VERSION = '2.0.0';
  var CONTEXT_ATTRIBUTES = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power'
  };
  var GRAIN_SIZE = 512;
  var GRAIN_SPREAD = 0.16;
  var LEAF_SIZE = 1024;
  var CHANGE_MS = 1800;
  var REDUCED_CHANGE_MS = 480;
  /* The session clock starts a few seconds in, so the first frame already
   * has the leaves' and coins' settled positions. */
  var CLOCK_OFFSET_S = 8;
  /* Leaf sway at the outer twigs, in CSS pixels per unit of wind; matched
   * to the lab's spring-driven tree (change over one and two seconds). */
  var SWAY_PX = 640;

  /* ---------- The two lights ---------- */

  function assign(target) {
    for (var i = 1; i < arguments.length; i += 1) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
      }
    }
    return target;
  }

  var SHARED = {
    bow: 0.06, calm: 0.6, calmCenter: 0.46, calmFeather: 110, calmWidth: 300,
    crossCount: 1, crossPeriod: 400, dMass: 0.25, dScale: 40, exposure: 1,
    grainShade: 1, grainSize: 0.7, leafDisc: 0.75, leafElong: 1.3, leafGrow: 0.4,
    leafSize: 1450, leafStretch: 1.3, len: 2600, open: 0.9, originX: 1,
    barVar: 0, spillSoft: 380, cloudDur: 20, cloudEvery: 80
  };

  /* Day: a sun pool from an afternoon window. Slim bars whose shadows lose
   * their dark core with distance; the peepal's sparse branch tips hang into
   * the sun, lone leaves crisp, the dense crown soft; sun coins gather near
   * the leaves; the light is a touch warmer than the shade. */
  var DAY = assign({}, SHARED, {
    angle: 156, originY: 0.08, period: 300, barJitter: 0.2, span0: -280, span1: 560,
    reach: 0.5, reachSoft: 560, soft0: 3, softK: 0.018, presence: 1.12, glow: 0.11,
    falloff: 0, deepen: 0.2, cool: 1, flat: 0, cross: 0, crossAt: 500, crossShear: 0,
    crossWidth: 20, edgeK: 0, spill: 0, calmSoft: 140,
    dDepth: 0.5, coinNear: 0.5, motion: 0.8, wind: 0.095,
    leafX: 1.0, leafY: -0.18, leafLod: 1.0, leafDens: 2.0, leafDepth: 0.72,
    shade: '#e5e2dc', sun: '#fff7e8', grain: 0.005, clouds: 0
  });

  /* Night: ef-dream's room, the high moon drawn as a window. */
  var NIGHT = assign({}, SHARED, {
    angle: 138, originY: -0.05, period: 400, barJitter: 0, span0: -330, span1: 470,
    reach: 0.4, reachSoft: 60, soft0: 2.5, softK: 0.03, presence: 0.95, glow: 0.08,
    falloff: 0.12, deepen: 0, cool: 0, flat: 0.75, cross: 0.95, crossAt: 520, crossShear: 0.3,
    crossWidth: 22, edgeK: 0.05, spill: 0.14, calmSoft: 90,
    dDepth: 0, coinNear: 0, motion: 0.6, wind: 0.09,
    leafX: 0.86, leafY: 0.14, leafLod: 2.5, leafDens: 0, leafDepth: 0.62,
    shade: '#1a181c', sun: '#3b393e', grain: 0.004, clouds: 1
  });

  /* Where the day's light starts the night-only shapes: the transom begins
   * beyond the far end of the pool and slides in as the pool shortens. */
  var DAY_START = { cross: 0, crossAt: 1700, crossShear: 0, flat: 0 };
  /* The room's colour runs a little ahead of the window light's, so the
   * light keeps its shape and the shadows never wash out in a grey middle. */
  var LEAD = 0.1;

  /* ---------- Small maths ---------- */

  function clamp(value, minimum, maximum) {
    if (minimum === undefined) minimum = 0;
    if (maximum === undefined) maximum = 1;
    return Math.min(maximum, Math.max(minimum, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1;
    var bx = 3 * (x2 - x1) - cx;
    var ax = 1 - cx - bx;
    var cy = 3 * y1;
    var by = 3 * (y2 - y1) - cy;
    var ay = 1 - cy - by;
    return function(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i += 1) {
        var error = ((ax * t + bx) * t + cx) * t - x;
        var slope = (3 * ax * t + 2 * bx) * t + cx;
        if (Math.abs(error) < 1e-6 || slope === 0) break;
        t -= error / slope;
      }
      t = clamp(t);
      return ((ay * t + by) * t + cy) * t;
    };
  }

  /* Leaves promptly, so the click is answered, and settles long and soft. */
  var ease = bezier(0.45, 0.05, 0.2, 1);

  /* Dusk runs the path forward. Dawn runs it backward but should feel the
   * same, so its time is remapped: the shadows are ease(x) of the way home
   * after x of the time. Returns p: 0 day .. 1 night. */
  function along(x, toNight) {
    x = clamp(x);
    if (toNight) return x;
    var target = 1 - ease(x);
    var low = 0;
    var high = 1;
    for (var i = 0; i < 30; i += 1) {
      var middle = (low + high) / 2;
      if (ease(middle) < target) low = middle;
      else high = middle;
    }
    return (low + high) / 2;
  }

  function hexToLinear(hex) {
    return [1, 3, 5].map(function(index) {
      var c = parseInt(hex.slice(index, index + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
  }

  function hexToRgb(hex) {
    return [1, 3, 5].map(function(index) {
      return parseInt(hex.slice(index, index + 2), 16) / 255;
    });
  }

  /* Colours mix in OKLab: a straight line from one to the other. */
  function toLab(hex) {
    var v = hexToLinear(hex);
    var l = Math.cbrt(0.4122214708 * v[0] + 0.5363325363 * v[1] + 0.0514459929 * v[2]);
    var m = Math.cbrt(0.2119034982 * v[0] + 0.6806995451 * v[1] + 0.1073969566 * v[2]);
    var s = Math.cbrt(0.0883024619 * v[0] + 0.2817188376 * v[1] + 0.6299787005 * v[2]);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
  }

  function fromLab(lab) {
    var l = Math.pow(lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2], 3);
    var m = Math.pow(lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2], 3);
    var s = Math.pow(lab[0] - 0.0894841775 * lab[1] - 1.291485548 * lab[2], 3);
    var linear = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    ];
    return '#' + linear.map(function(c) {
      c = clamp(c);
      c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
      var hex = Math.round(c * 255).toString(16);
      return hex.length < 2 ? '0' + hex : hex;
    }).join('');
  }

  function mixColor(a, b, t) {
    if (t <= 0) return a;
    if (t >= 1) return b;
    var x = toLab(a);
    var y = toLab(b);
    return fromLab([lerp(x[0], y[0], t), lerp(x[1], y[1], t), lerp(x[2], y[2], t)]);
  }

  /* One continuous morph: the light swings steeper, the panes widen, the
   * pool shortens into a window and the transom slides in, the peepal
   * drifts; the colours blend. p: 0 day .. 1 night. */
  function passage(p) {
    p = clamp(p);
    if (p <= 0) return assign({}, DAY);
    if (p >= 1) return assign({}, NIGHT);
    var g = ease(p);
    var room = ease(clamp(p / (1 - LEAD)));
    var light = ease(clamp((p - LEAD) / (1 - LEAD)));
    var state = {};
    for (var key in NIGHT) {
      if (!Object.prototype.hasOwnProperty.call(NIGHT, key)) continue;
      var a = Object.prototype.hasOwnProperty.call(DAY_START, key) ? DAY_START[key] : DAY[key];
      var b = NIGHT[key];
      state[key] = typeof a === 'number' && typeof b === 'number' ? lerp(a, b, g) : (g < 0.5 ? a : b);
    }
    state.shade = mixColor(DAY.shade, NIGHT.shade, room);
    state.sun = mixColor(DAY.sun, NIGHT.sun, light);
    state.reachSoft = lerp(DAY.reachSoft, NIGHT.reachSoft, smooth(0, 0.55, g));
    state.cross = NIGHT.cross * smooth(0.25, 0.85, g);
    state.dDepth = DAY.dDepth * (1 - smooth(0.1, 0.6, g));
    return state;
  }

  function hash1(i) {
    var x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* A thin cloud crosses the moon now and then: one pass per interval, at
   * a varied moment, length and thickness, fading in and out over seconds. */
  function cloudAt(state, seconds) {
    if (!state.clouds) return 0;
    var index = Math.floor(seconds / state.cloudEvery);
    var start = index * state.cloudEvery + hash1(index + 5) * 0.45 * state.cloudEvery;
    var duration = state.cloudDur * (0.7 + 0.6 * hash1(index + 9));
    var x = (seconds - start) / duration;
    if (x <= 0 || x >= 1) return 0;
    return state.clouds * (0.55 + 0.45 * hash1(index + 13)) * smooth(0, 0.35, x) * (1 - smooth(0.65, 1, x));
  }

  function normalizeTheme(theme) {
    return theme === 'night' ? 'night' : 'day';
  }

  /* A change in progress: one path (dusk or dawn) run forward or, when the
   * visitor changes their mind, backward from wherever it is. */
  function normalizeChange(change) {
    if (!change || typeof change !== 'object') return null;
    var path = change.path === 'dawn' ? 'dawn' : 'dusk';
    var startTimeMs = Number(change.startTimeMs);
    if (!(startTimeMs > 0)) return null;
    return {
      path: path,
      x0: clamp(Number(change.x0) || 0),
      dir: Number(change.dir) < 0 ? -1 : 1,
      startTimeMs: startTimeMs,
      durationMs: Math.max(1, Number(change.durationMs) || CHANGE_MS),
      reduced: Boolean(change.reduced)
    };
  }

  function changeTarget(change) {
    var towardNight = (change.path === 'dusk') === (change.dir > 0);
    return towardNight ? 'night' : 'day';
  }

  function changePosition(change, nowMs) {
    var x = clamp(change.x0 + change.dir * (nowMs - change.startTimeMs) / change.durationMs);
    var done = change.dir > 0 ? x >= 1 : x <= 0;
    var p = change.path === 'dusk' ? along(x, true) : along(x, false);
    return { x: x, p: p, done: done };
  }

  /* ---------- Grain ---------- */

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function() {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* A fine, isotropic grain, one texel per CSS pixel, tileable. */
  function grainData() {
    var n = GRAIN_SIZE;
    var random = seededRandom(7);
    var white = new Float32Array(n * n);
    for (var i = 0; i < white.length; i += 1) white[i] = random() + random() - 1;
    var sigma = 0.6;
    var radius = 2;
    var kernel = [];
    var total = 0;
    for (var j = -radius; j <= radius; j += 1) {
      var w = Math.exp(-(j * j) / (2 * sigma * sigma));
      kernel.push(w);
      total += w;
    }
    kernel = kernel.map(function(value) { return value / total; });
    var pass = new Float32Array(n * n);
    var out = new Float32Array(n * n);
    var x;
    var y;
    var k;
    var sum;
    for (y = 0; y < n; y += 1) {
      for (x = 0; x < n; x += 1) {
        sum = 0;
        for (k = -radius; k <= radius; k += 1) sum += kernel[k + radius] * white[y * n + ((x + k + n) % n)];
        pass[y * n + x] = sum;
      }
    }
    var mean = 0;
    for (y = 0; y < n; y += 1) {
      for (x = 0; x < n; x += 1) {
        sum = 0;
        for (k = -radius; k <= radius; k += 1) sum += kernel[k + radius] * pass[((y + k + n) % n) * n + x];
        out[y * n + x] = sum;
        mean += sum;
      }
    }
    mean /= out.length;
    var variance = 0;
    for (i = 0; i < out.length; i += 1) variance += (out[i] - mean) * (out[i] - mean);
    var deviation = Math.sqrt(variance / out.length) || 1;
    var bytes = new Uint8Array(n * n);
    for (i = 0; i < out.length; i += 1) {
      bytes[i] = Math.max(0, Math.min(255, Math.round(255 * (0.5 + GRAIN_SPREAD * (out[i] - mean) / deviation))));
    }
    return bytes;
  }

  /* ---------- Shaders ---------- */

  var VERTEX = [
    '#version 300 es',
    'layout(location = 0) in vec2 a_pos;',
    'out vec2 v_uv;',
    'void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var FRAGMENT = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v_uv;',
    'out vec4 o;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform float u_angle;',
    'uniform vec2 u_origin;',
    'uniform float u_period;',
    'uniform float u_open;',
    'uniform vec2 u_span;',
    'uniform float u_len;',
    'uniform float u_soft0;',
    'uniform float u_softK;',
    'uniform float u_bow;',
    'uniform float u_dDepth;',
    'uniform float u_dScale;',
    'uniform float u_dMass;',
    'uniform float u_motion;',
    'uniform vec3 u_shade;',
    'uniform vec3 u_sun;',
    'uniform vec3 u_tint;',
    'uniform float u_glow;',
    'uniform float u_exposure;',
    'uniform float u_presence;',
    'uniform vec2 u_reach;',
    'uniform float u_barVar;',
    'uniform float u_barJitter;',
    'uniform vec2 u_spill;',
    'uniform float u_edgeK;',
    'uniform float u_deepen;',
    'uniform float u_cool;',
    'uniform float u_leafGrow;',
    'uniform float u_flat;',
    'uniform vec4 u_cross;',
    'uniform vec2 u_crossB;',
    'uniform float u_falloff;',
    'uniform sampler2D u_grainTex;',
    'uniform vec3 u_grain;',
    'uniform float u_cloud;',
    'uniform vec4 u_calm;',
    'uniform float u_calmSoft;',
    'uniform sampler2D u_leaf;',
    'uniform vec4 u_leafBox;',
    'uniform float u_leafLod;',
    'uniform float u_leafDepth;',
    'uniform vec2 u_leafDisc;',
    'uniform float u_coinNear;',
    'uniform float u_leafDens;',
    'uniform float u_wind;',
    '',
    'float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }',
    'vec2 hash2(vec2 p) { return vec2(hash(p), hash(p + 17.31)); }',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);',
    '}',
    'float fbm(vec2 p) { return 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.07 + 3.1) + 0.15 * vnoise(p * 4.13 + 7.7); }',
    'vec3 toLin(vec3 c) { return pow(c, vec3(2.2)); }',
    'vec3 toSrgb(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }',
    '',
    // Leaf shadow blurred the way the sun's or moon's disc blurs it: a round
    // penumbra, a little longer along the light.
    'float leafSample(vec2 uv, float lod) {',
    '  float r = u_leafDisc.x * exp2(lod) / ' + LEAF_SIZE + '.0;',
    '  float base = max(lod - 2.0, 0.0);',
    '  vec2 dir = vec2(cos(u_angle), sin(u_angle));',
    '  vec2 nrm = vec2(-dir.y, dir.x);',
    '  float s = 0.0;',
    '  for (int i = 0; i < 16; i++) {',
    '    float fi = float(i) + 0.5;',
    '    float rr = sqrt(fi / 16.0);',
    '    float a = fi * 2.39996323;',
    '    vec2 o = (cos(a) * rr * u_leafDisc.y) * dir + (sin(a) * rr) * nrm;',
    '    s += textureLod(u_leaf, uv + o * r, base).r;',
    '  }',
    '  return s / 16.0;',
    '}',
    '',
    // The window's light: each bar casts its own whole soft shadow, so no
    // shadow contains an edge; transoms cross the bars at night; the pool ends
    // at the sill's shadow. Softness grows with distance travelled.
    'float rays(vec2 p, float extraSoft, out float travelled) {',
    '  vec2 dir = vec2(cos(u_angle), sin(u_angle));',
    '  vec2 nrm = vec2(-dir.y, dir.x);',
    '  vec2 q = p - u_origin;',
    '  float v = dot(q, dir);',
    '  float u = dot(q, nrm) * (1.0 + u_bow * v / max(u_len, 1.0));',
    '  travelled = v;',
    '  float soft = u_soft0 + u_softK * max(v, 0.0) + extraSoft;',
    '  float band = 1.0;',
    '  if (u_open < 1.0) {',
    '    float i0 = floor(u / u_period + 0.5);',
    '    for (int j = -3; j <= 3; j++) {',
    '      float k = i0 + float(j);',
    '      float hk = hash(vec2(k, 3.1));',
    '      float w = u_period * (1.0 - clamp(u_open * (1.0 + u_barVar * (hk - 0.5)), 0.02, 1.0)) * (1.0 + u_barJitter * (2.0 * hk - 1.0));',
    '      float x = u - k * u_period;',
    '      band -= smoothstep(-soft, soft, x + 0.5 * w) - smoothstep(-soft, soft, x - 0.5 * w);',
    '    }',
    '    band = max(band, 0.0);',
    '  }',
    '  float es = 1.5 * (soft + u_edgeK * max(v, 0.0));',
    '  float env = smoothstep(u_span.x - es, u_span.x + es, u) * (1.0 - smoothstep(u_span.y - es, u_span.y + es, u));',
    '  if (u_cross.w > 0.0) {',
    '    float vc = v + u_crossB.x * u;',
    '    float bar = 0.0;',
    '    for (int n = 0; n < 4; n++) {',
    '      if (float(n) >= u_crossB.y) break;',
    '      float x = vc - (u_cross.x + float(n) * u_cross.y);',
    '      bar += smoothstep(-soft, soft, x + 0.5 * u_cross.z) - smoothstep(-soft, soft, x - 0.5 * u_cross.z);',
    '    }',
    '    band *= 1.0 - u_cross.w * min(bar, 1.0);',
    '  }',
    '  float along = smoothstep(-2.0 * soft, 2.0 * soft, v) * mix(pow(1.0 - smoothstep(0.0, u_len, v), 0.8), 1.0, u_flat);',
    '  float vEnd = v + u_crossB.x * u;',
    '  float fs = u_reach.y + soft + u_edgeK * max(v, 0.0);',
    '  along *= 1.0 - smoothstep(u_reach.x * u_len - fs, u_reach.x * u_len + fs, vEnd);',
    '  return band * env * along;',
    '}',
    '',
    // Sun coins: soft overlapping images of the sun through gaps in leaves.
    'float dapples(vec2 p, float t) {',
    '  vec2 dir = vec2(cos(u_angle), sin(u_angle));',
    '  vec2 q = vec2(dot(p, dir) / 1.35, dot(p, vec2(-dir.y, dir.x))) / u_dScale;',
    '  float sway = u_motion;',
    '  vec2 drift = sway * vec2(sin(t * 0.37) + 0.6 * sin(t * 0.23 + 1.3), cos(t * 0.29) + 0.5 * sin(t * 0.19 + 0.4)) * 0.08;',
    '  float sum = 0.0;',
    '  vec2 cell = floor(q);',
    '  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {',
    '    vec2 c = cell + vec2(i, j);',
    '    vec2 h = hash2(c);',
    '    float density = fbm(c * 0.11 + 5.0);',
    '    if (h.x > 0.35 + 0.5 * density) continue;',
    '    vec2 wob = sway * 0.12 * vec2(sin(t * (0.21 + 0.13 * h.y) + 6.28 * h.x), cos(t * (0.17 + 0.11 * h.x) + 6.28 * h.y));',
    '    vec2 centre = c + 0.2 + 0.6 * hash2(c + 3.7) + drift + wob;',
    '    float r = 0.32 + 0.38 * h.y;',
    '    float glow = 1.0 - smoothstep(r * 0.35, r * 1.25, length(q - centre));',
    '    glow *= 0.75 + 0.25 * sin(t * (0.11 + 0.07 * h.x) + 6.28 * h.y) * sway;',
    '    sum += glow;',
    '  }',
    '  float coins = clamp(sum * 0.8, 0.0, 1.0);',
    '  float mass = smoothstep(0.38, 0.72, fbm(q * 0.22 + drift * 0.6 + 11.0));',
    '  return mix(coins, 1.0, 0.25) * mix(1.0, mass, u_dMass);',
    '}',
    '',
    'void main() {',
    '  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_res;',
    '  float calm = u_calm.x * (1.0 - smoothstep(u_calm.z, u_calm.z + u_calm.w, abs(p.x - u_calm.y)));',
    '  float travelled;',
    '  float L = rays(p, calm * 28.0 + u_cloud * 90.0, travelled);',
    '  float D = dapples(p, u_time);',
    '  float depth = u_dDepth * (1.0 - 0.6 * calm) * smoothstep(-40.0, 200.0, travelled);',
    '  float tr3;',
    '  float Lsoft = rays(p, u_calmSoft, tr3);',
    '  L = mix(L, Lsoft, 0.7 * calm);',
    '  float leaf = 1.0;',
    '  float nearLeaves = 0.0;',
    '  if (u_leafDepth > 0.0) {',
    '    vec2 dir = vec2(cos(u_angle), sin(u_angle));',
    '    vec2 rel = p - u_leafBox.xy;',
    '    vec2 lr = vec2(dot(rel, dir) / u_leafBox.w, dot(rel, vec2(-dir.y, dir.x)));',
    '    vec2 back = lr.x * dir + lr.y * vec2(-dir.y, dir.x);',
    '    vec2 luv = back / u_leafBox.z + 0.5;',
    '    if (luv.x > 0.0 && luv.y > 0.0 && luv.x < 1.0 && luv.y < 1.0) {',
    '      vec2 e = min(luv, 1.0 - luv);',
    '      float edge = smoothstep(0.0, 0.12, min(e.x, e.y));',
    '      float grow = u_leafGrow * clamp(travelled / max(u_len * 0.6, 1.0), 0.0, 1.0);',
    '      float crown = smoothstep(0.2, 0.75, 1.0 - textureLod(u_leaf, luv, 5.0).r);',
    '      if (u_wind > 0.0) {',
    // A light breeze below the leaves' flutter threshold: branches sway on
    // their springs (about a third of a hertz), single leaves swing gently
    // on their stalks (about one hertz), the outer twigs more than the crown,
    // never in step.
    '        vec2 ph = luv * 2.3;',
    '        vec2 branch = vec2(vnoise(ph + vec2(u_time * 0.17, 0.0)), vnoise(ph.yx + vec2(u_time * 0.15, 9.0))) - 0.5;',
    '        vec2 lp = luv * 26.0;',
    '        vec2 swing = vec2(vnoise(lp + vec2(u_time * 0.9, 3.0)), vnoise(lp.yx + vec2(u_time * 1.1, 7.0))) - 0.5;',
    '        luv += (branch + 0.15 * swing) * (1.0 - 0.6 * crown) * u_wind / u_leafBox.z;',
    '      }',
    '      float dens = u_leafDens * crown;',
    '      if (u_coinNear > 0.0) nearLeaves = edge * smoothstep(0.02, 0.25, 1.0 - textureLod(u_leaf, luv, 7.0).r);',
    '      leaf = mix(1.0, leafSample(luv, u_leafLod + dens + grow + calm * 1.5), edge);',
    '    }',
    '  }',
    '  depth *= mix(1.0, mix(0.2, 1.0, nearLeaves), u_coinNear);',
    '  float light = L * mix(1.0, D, depth);',
    '  light *= mix(1.0, leaf, u_leafDepth * (1.0 - 0.55 * calm));',
    '  float breath = 1.0 - 0.015 * u_motion * (0.5 + 0.5 * sin(u_time * 0.16));',
    '  float tr2;',
    '  float halo = rays(p, 70.0 + calm * 40.0, tr2);',
    '  float spillL = 0.0;',
    '  if (u_spill.x > 0.0) { float tr5; spillL = rays(p, u_spill.y, tr5); }',
    '  float lit = max((light * breath + halo * u_glow + spillL * u_spill.x) * u_presence * (1.0 - 0.5 * u_cloud), 0.0);',
    '  if (lit > 1.0) lit = 1.0 + 0.15 * tanh((lit - 1.0) / 0.15);',
    '  vec3 shadeC = toLin(u_shade);',
    '  if (u_falloff > 0.0) {',
    '    float tr4;',
    '    float wide = rays(p, 480.0, tr4);',
    '    shadeC *= 1.0 - u_falloff * (1.0 - calm / max(u_calm.x, 1e-3)) * (1.0 - clamp(wide * 1.6, 0.0, 1.0));',
    '  }',
    '  if (u_deepen > 0.0) {',
    '    float tr6;',
    '    float pool = clamp(rays(p, 260.0, tr6) * 1.4, 0.0, 1.0);',
    '    float nearW = 1.0 - smoothstep(0.08 * u_len, 0.5 * u_len, tr6);',
    '    shadeC *= 1.0 - u_deepen * pool * nearW;',
    '  }',
    '  float deep = 1.0 - smoothstep(0.0, 0.35, halo);',
    '  shadeC = mix(shadeC, shadeC * vec3(0.985, 0.995, 1.02), u_cool * deep);',
    '  vec3 E = mix(shadeC * u_tint, toLin(u_sun) * mix(u_tint, vec3(1.0), 0.5), lit);',
    '  vec3 col = toSrgb(E * u_exposure);',
    '  float amt = u_grain.x * mix(1.0, 1.6 - 1.2 * clamp(lit, 0.0, 1.0), u_grain.z);',
    '  col += amt * (texture(u_grainTex, p / (u_grain.y * ' + GRAIN_SIZE + '.0)).r - 0.5) / ' + GRAIN_SPREAD + ';',
    '  float d = hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy + 71.3) - 1.0;',
    '  o = vec4(col + d / 255.0, 1.0);',
    '}'
  ].join('\n');

  /* For the reduced-motion change: the old light fades over the new. */
  var FADE_FRAGMENT = [
    '#version 300 es',
    'precision mediump float;',
    'in vec2 v_uv;',
    'out vec4 o;',
    'uniform sampler2D u_from;',
    'uniform float u_alpha;',
    'void main() { o = vec4(texture(u_from, v_uv).rgb, u_alpha); }'
  ].join('\n');

  var UNIFORMS = [
    'u_res', 'u_time', 'u_angle', 'u_origin', 'u_period', 'u_open', 'u_span', 'u_len',
    'u_soft0', 'u_softK', 'u_bow', 'u_dDepth', 'u_dScale', 'u_dMass', 'u_motion',
    'u_shade', 'u_sun', 'u_tint', 'u_glow', 'u_exposure', 'u_presence', 'u_reach',
    'u_barVar', 'u_barJitter', 'u_spill', 'u_edgeK', 'u_deepen', 'u_cool', 'u_leafGrow',
    'u_flat', 'u_cross', 'u_crossB', 'u_falloff', 'u_grainTex', 'u_grain', 'u_cloud',
    'u_calm', 'u_calmSoft', 'u_leaf', 'u_leafBox', 'u_leafLod', 'u_leafDepth',
    'u_leafDisc', 'u_coinNear', 'u_leafDens', 'u_wind'
  ];

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      var log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Sunlit shader failed to compile: ' + log);
    }
    return shader;
  }

  function createProgram(gl, fragmentSource) {
    var program = gl.createProgram();
    var vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
    var fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      var log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Sunlit program failed to link: ' + log);
    }
    return program;
  }

  /* ---------- Renderer ---------- */

  function Renderer(canvas, options) {
    if (!canvas || typeof canvas.getContext !== 'function') {
      throw new TypeError('SunlitRenderer requires an HTMLCanvasElement or OffscreenCanvas');
    }
    this.canvas = canvas;
    this.options = options || {};
    this.onReady = typeof this.options.onReady === 'function' ? this.options.onReady : function() {};
    this.onError = typeof this.options.onError === 'function' ? this.options.onError : function() {};
    this.onContextLost = typeof this.options.onContextLost === 'function' ? this.options.onContextLost : function() {};
    this.onContextRestored = typeof this.options.onContextRestored === 'function' ? this.options.onContextRestored : function() {};

    this.epochMs = Number(this.options.epochMs) || Date.now();
    this.maxDpr = clamp(Number(this.options.maxDpr) || 2, 0.5, 2);
    this.ambientFrameIntervalMs = 1000 / clamp(Number(this.options.ambientFps) || 30, 1, 60);
    this.width = Math.max(1, Number(this.options.width) || 1);
    this.height = Math.max(1, Number(this.options.height) || 1);
    this.dpr = clamp(Number(this.options.dpr) || 1, 0.5, this.maxDpr);
    this.theme = normalizeTheme(this.options.theme);
    this.change = null;
    this.reducedMotion = Boolean(this.options.reducedMotion);
    this.tint = [1, 1, 1];
    this.inkPaperRatio = [1, 1, 1];
    this.inkPaperStrength = 0;
    this.visible = this.options.visible !== false;
    this.active = false;
    this.disposed = false;
    this.contextLost = false;
    this.ready = false;
    this.frameHandle = null;
    this.frameUsesTimeout = false;
    this.lastRenderedAtMs = 0;
    this.gl = null;
    this.resources = null;
    this.leafImage = null;
    this.leafWaiting = Boolean(this.options.leafUrl);
    this.fadeFrom = null;

    this.boundLoop = this._loop.bind(this);
    this.boundContextLost = this._handleContextLost.bind(this);
    this.boundContextRestored = this._handleContextRestored.bind(this);
    if (typeof canvas.addEventListener === 'function') {
      canvas.addEventListener('webglcontextlost', this.boundContextLost, false);
      canvas.addEventListener('webglcontextrestored', this.boundContextRestored, false);
    }

    this.setInkPaper(this.options.inkPaper, this.options.inkPaperStrength);
    var initial = normalizeChange(this.options.change);
    if (initial && !initial.reduced && changeTarget(initial) === this.theme &&
        !changePosition(initial, this._now()).done) {
      this.change = initial;
    }

    try {
      this.gl = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
      if (!this.gl) throw new Error('WebGL2 is unavailable for the Sunlit renderer');
      this._createResources();
      this.resize(this.width, this.height, this.dpr, true);
    } catch (error) {
      this._reportError(error);
      this.dispose();
      throw error;
    }

    this._loadLeaves(this.options.leafUrl);
    if (this.options.autoStart !== false) this.start();
  }

  Renderer.prototype._now = function() {
    return Date.now();
  };

  Renderer.prototype._reportError = function(error) {
    try {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    } catch (callbackError) {
      // A reporting callback must never recurse into the renderer.
    }
  };

  Renderer.prototype._createResources = function() {
    var gl = this.gl;
    var resources = {};
    this.resources = resources;
    resources.program = createProgram(gl, FRAGMENT);
    resources.uniforms = {};
    UNIFORMS.forEach(function(name) {
      resources.uniforms[name] = gl.getUniformLocation(resources.program, name);
    });
    resources.fadeProgram = createProgram(gl, FADE_FRAGMENT);
    resources.fadeFrom = gl.getUniformLocation(resources.fadeProgram, 'u_from');
    resources.fadeAlpha = gl.getUniformLocation(resources.fadeProgram, 'u_alpha');

    resources.vao = gl.createVertexArray();
    resources.buffer = gl.createBuffer();
    gl.bindVertexArray(resources.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    resources.grain = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, resources.grain);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, GRAIN_SIZE, GRAIN_SIZE, 0, gl.RED, gl.UNSIGNED_BYTE, grainData());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    resources.leaf = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, resources.leaf);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    resources.leafLoaded = false;
    if (this.leafImage) this._uploadLeaves();
  };

  Renderer.prototype._destroyResources = function() {
    var gl = this.gl;
    var resources = this.resources;
    this.resources = null;
    if (!gl || !resources || gl.isContextLost()) return;
    gl.deleteProgram(resources.program);
    gl.deleteProgram(resources.fadeProgram);
    gl.deleteBuffer(resources.buffer);
    gl.deleteVertexArray(resources.vao);
    gl.deleteTexture(resources.grain);
    gl.deleteTexture(resources.leaf);
    this._releaseFade();
  };

  /* The peepal's silhouette is a small static image; its sway is drawn in
   * the shader. The first visible frame waits for it, briefly. */
  Renderer.prototype._loadLeaves = function(url) {
    var renderer = this;
    if (!url || typeof scope.fetch !== 'function' || typeof scope.createImageBitmap !== 'function') {
      this.leafWaiting = false;
      return;
    }
    var giveUp = scope.setTimeout(function() {
      if (!renderer.leafWaiting) return;
      renderer.leafWaiting = false;
      renderer._kick();
    }, 2500);
    scope.fetch(url).then(function(response) {
      if (!response.ok) throw new Error('The peepal silhouette could not be loaded');
      return response.blob();
    }).then(function(blob) {
      return scope.createImageBitmap(blob);
    }).then(function(image) {
      scope.clearTimeout(giveUp);
      if (renderer.disposed) return;
      renderer.leafImage = image;
      renderer._uploadLeaves();
      renderer.leafWaiting = false;
      renderer._kick();
    }).catch(function() {
      scope.clearTimeout(giveUp);
      renderer.leafWaiting = false;
      renderer._kick();
    });
  };

  Renderer.prototype._uploadLeaves = function() {
    var gl = this.gl;
    if (!gl || !this.resources || this.contextLost || !this.leafImage) return;
    gl.bindTexture(gl.TEXTURE_2D, this.resources.leaf);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, this.leafImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.resources.leafLoaded = true;
  };

  Renderer.prototype._kick = function() {
    if (this.disposed || this.contextLost) return;
    this.renderFrame();
    this._ensureLoop();
  };

  Renderer.prototype.resize = function(width, height, dpr, force) {
    if (this.disposed) return;
    width = Math.max(1, Math.round(Number(width) || this.width));
    height = Math.max(1, Math.round(Number(height) || this.height));
    dpr = clamp(Number(dpr) || this.dpr, 0.5, this.maxDpr);
    if (!force && width === this.width && height === this.height && dpr === this.dpr) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this._releaseFade();
    if (this.gl && this.resources && !this.contextLost) this.renderFrame();
  };

  /* theme: where the light is going. options.change: the change in progress
   * (path, x0, dir, startTimeMs, durationMs, reduced), or none to arrive at
   * once. */
  Renderer.prototype.setTheme = function(theme, options) {
    if (this.disposed) return;
    options = options || {};
    var nowMs = Number(options.nowMs) || this._now();
    var change = normalizeChange(options.change);
    var previous = this.theme;
    this.theme = normalizeTheme(theme);
    this._releaseFade();
    if (change && change.reduced) {
      this.change = null;
      this._beginFade(previous, nowMs, change);
    } else if (change && changeTarget(change) === this.theme) {
      this.change = change;
    } else {
      this.change = null;
    }
    this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype.setRoute = function() {
    // One room on every page; the reading column keeps the text calm.
  };

  Renderer.prototype.setReducedMotion = function(reduced, nowMs) {
    if (this.disposed) return;
    this.reducedMotion = Boolean(reduced);
    if (this.reducedMotion) this._cancelFrame();
    this.renderFrame(Number(nowMs) || this._now());
    this._ensureLoop();
  };

  Renderer.prototype.setVisible = function(visible) {
    if (this.disposed) return;
    this.visible = Boolean(visible);
    if (!this.visible) {
      this._cancelFrame();
    } else {
      this.renderFrame();
      this._ensureLoop();
    }
  };

  /* Each ink casts a restrained tint in the day's paper; night is one room.
   * The tint changes the paper's hue, never the light: it keeps the room's
   * luminance, and the sun pool keeps half its own colour. */
  Renderer.prototype.setInkPaper = function(color, strength) {
    var reference = hexToLinear('#fcfbf8');
    var paper = Array.isArray(color) && color.length >= 3 ? color : [0.989, 0.986, 0.975];
    var ratio = paper.slice(0, 3).map(function(c, index) {
      var linear = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return clamp(linear / reference[index], 0.85, 1.05);
    });
    var luminance = 0.2126 * ratio[0] + 0.7152 * ratio[1] + 0.0722 * ratio[2];
    this.inkPaperRatio = ratio.map(function(c) { return c / luminance; });
    this.inkPaperStrength = clamp(Number(strength) || 0);
    if (this.resources && !this.disposed) this.renderFrame();
  };

  Renderer.prototype._position = function(nowMs) {
    if (!this.change) return this.theme === 'night' ? 1 : 0;
    var position = changePosition(this.change, nowMs);
    if (position.done) {
      this.change = null;
      return this.theme === 'night' ? 1 : 0;
    }
    return position.p;
  };

  Renderer.prototype._seconds = function(nowMs) {
    if (this.reducedMotion) return CLOCK_OFFSET_S;
    return CLOCK_OFFSET_S + Math.max(0, nowMs - this.epochMs) / 1000;
  };

  Renderer.prototype._draw = function(p, seconds) {
    var gl = this.gl;
    var u = this.resources.uniforms;
    var s = passage(p);
    var W = this.width;
    var H = this.height;
    var k = Math.min(1.35, (W / 1440) * 0.5 + 0.5);
    var narrow = W < 700;
    var still = this.reducedMotion;
    var leaves = this.resources.leafLoaded;
    var dayness = 1 - clamp(p);
    var tintAmount = 0.6 * this.inkPaperStrength * dayness;
    var tint = this.inkPaperRatio.map(function(ratio) { return lerp(1, ratio, tintAmount); });

    gl.useProgram(this.resources.program);
    gl.bindVertexArray(this.resources.vao);
    gl.uniform2f(u.u_res, W, H);
    gl.uniform1f(u.u_time, seconds);
    gl.uniform1f(u.u_angle, (s.angle * Math.PI) / 180);
    gl.uniform2f(u.u_origin, s.originX * W, s.originY * H);
    gl.uniform1f(u.u_period, s.period * k);
    gl.uniform1f(u.u_open, s.open);
    gl.uniform2f(u.u_span, s.span0 * k, s.span1 * k);
    gl.uniform1f(u.u_len, s.len * k);
    gl.uniform1f(u.u_soft0, s.soft0);
    gl.uniform1f(u.u_softK, s.softK);
    gl.uniform1f(u.u_bow, s.bow);
    gl.uniform1f(u.u_dDepth, s.dDepth);
    gl.uniform1f(u.u_dScale, s.dScale * k);
    gl.uniform1f(u.u_dMass, s.dMass);
    gl.uniform1f(u.u_motion, still ? 0 : s.motion);
    gl.uniform3fv(u.u_shade, hexToRgb(s.shade));
    gl.uniform3fv(u.u_sun, hexToRgb(s.sun));
    gl.uniform3fv(u.u_tint, tint);
    gl.uniform1f(u.u_glow, s.glow);
    gl.uniform1f(u.u_exposure, s.exposure);
    gl.uniform1f(u.u_presence, s.presence);
    gl.uniform2f(u.u_reach, s.reach, s.reachSoft * k);
    gl.uniform1f(u.u_barVar, s.barVar);
    gl.uniform1f(u.u_barJitter, s.barJitter);
    gl.uniform2f(u.u_spill, s.spill, s.spillSoft * k);
    gl.uniform1f(u.u_edgeK, s.edgeK);
    gl.uniform1f(u.u_deepen, s.deepen);
    gl.uniform1f(u.u_cool, s.cool);
    gl.uniform1f(u.u_leafGrow, s.leafGrow);
    gl.uniform1f(u.u_flat, s.flat);
    gl.uniform4f(u.u_cross, s.crossAt * k, s.crossPeriod * k, s.crossWidth * k, s.cross);
    gl.uniform2f(u.u_crossB, s.crossShear, s.crossCount);
    gl.uniform1f(u.u_falloff, narrow ? 0 : s.falloff);
    gl.uniform3f(u.u_grain, s.grain, s.grainSize, s.grainShade);
    gl.uniform1f(u.u_cloud, still ? 0 : cloudAt(s, seconds));
    gl.uniform4f(u.u_calm, s.calm, narrow ? W / 2 : W * s.calmCenter, narrow ? W : s.calmWidth, s.calmFeather);
    gl.uniform1f(u.u_calmSoft, s.calmSoft * k);
    gl.uniform4f(u.u_leafBox, s.leafX * W, s.leafY * H, s.leafSize * k, s.leafStretch);
    gl.uniform1f(u.u_leafLod, s.leafLod);
    gl.uniform1f(u.u_leafDepth, leaves ? s.leafDepth : 0);
    gl.uniform2f(u.u_leafDisc, s.leafDisc, s.leafElong);
    gl.uniform1f(u.u_coinNear, s.coinNear);
    gl.uniform1f(u.u_leafDens, s.leafDens);
    gl.uniform1f(u.u_wind, still ? 0 : s.wind * SWAY_PX * k);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.resources.grain);
    gl.uniform1i(u.u_grainTex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.resources.leaf);
    gl.uniform1i(u.u_leaf, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* Reduced motion: no morph. The old light is held in a texture and fades
   * over the new one in under half a second. */
  Renderer.prototype._beginFade = function(fromTheme, nowMs, change) {
    var gl = this.gl;
    if (!gl || !this.resources || this.contextLost) return;
    var width = this.canvas.width;
    var height = this.canvas.height;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    this._draw(fromTheme === 'night' ? 1 : 0, this._seconds(nowMs));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.fadeFrom = {
      texture: texture,
      framebuffer: framebuffer,
      startTimeMs: Number(change.startTimeMs) || nowMs,
      durationMs: REDUCED_CHANGE_MS
    };
  };

  Renderer.prototype._releaseFade = function() {
    if (!this.fadeFrom) return;
    var gl = this.gl;
    if (gl && !gl.isContextLost()) {
      gl.deleteTexture(this.fadeFrom.texture);
      gl.deleteFramebuffer(this.fadeFrom.framebuffer);
    }
    this.fadeFrom = null;
  };

  Renderer.prototype.renderFrame = function(nowMs) {
    if (this.disposed || this.contextLost || !this.gl || !this.resources) return;
    nowMs = Number(nowMs) || this._now();
    var gl = this.gl;
    try {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.disable(gl.BLEND);
      this._draw(this._position(nowMs), this._seconds(nowMs));
      if (this.fadeFrom) {
        var alpha = 1 - clamp((nowMs - this.fadeFrom.startTimeMs) / this.fadeFrom.durationMs);
        if (alpha <= 0) {
          this._releaseFade();
        } else {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.useProgram(this.resources.fadeProgram);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, this.fadeFrom.texture);
          gl.uniform1i(this.resources.fadeFrom, 2);
          gl.uniform1f(this.resources.fadeAlpha, alpha * alpha * (3 - 2 * alpha));
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          gl.disable(gl.BLEND);
        }
      }
      this.lastRenderedAtMs = nowMs;
      if (!this.ready && !this.leafWaiting) {
        this.ready = true;
        this.onReady({ version: VERSION });
      }
    } catch (error) {
      this._reportError(error);
    }
  };

  Renderer.prototype._changing = function() {
    return Boolean(this.change || this.fadeFrom);
  };

  Renderer.prototype._requestFrame = function(delayMs) {
    var renderer = this;
    delayMs = Math.max(0, Number(delayMs) || 0);
    /* The light moves slowly; between changes it is drawn at the ambient
     * rate and the thread sleeps. A change is drawn with the display. */
    if (delayMs <= 20 && typeof scope.requestAnimationFrame === 'function') {
      this.frameUsesTimeout = false;
      return scope.requestAnimationFrame(this.boundLoop);
    }
    this.frameUsesTimeout = true;
    return scope.setTimeout(function() {
      renderer.boundLoop();
    }, Math.max(1, delayMs));
  };

  Renderer.prototype._cancelFrame = function() {
    if (this.frameHandle == null) return;
    if (this.frameUsesTimeout || typeof scope.cancelAnimationFrame !== 'function') {
      scope.clearTimeout(this.frameHandle);
    } else {
      scope.cancelAnimationFrame(this.frameHandle);
    }
    this.frameHandle = null;
  };

  Renderer.prototype._ensureLoop = function() {
    if (!this.active || !this.visible || this.disposed || this.contextLost || this.frameHandle != null) return;
    var changing = this._changing();
    /* Reduced motion holds a still room; only a deliberate change moves. */
    if (this.reducedMotion && !changing && !this.leafWaiting) return;
    var interval = changing ? 0 : this.ambientFrameIntervalMs;
    var elapsed = this.lastRenderedAtMs ? this._now() - this.lastRenderedAtMs : interval;
    this.frameHandle = this._requestFrame(Math.max(0, interval - elapsed));
  };

  Renderer.prototype._loop = function() {
    this.frameHandle = null;
    if (!this.active || !this.visible || this.disposed || this.contextLost) return;
    var nowMs = this._now();
    var interval = this._changing() ? 0 : this.ambientFrameIntervalMs;
    if (!this.lastRenderedAtMs || nowMs - this.lastRenderedAtMs >= interval - 2) this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype.start = function() {
    if (this.disposed) return;
    this.active = true;
    this.renderFrame();
    this._ensureLoop();
  };

  Renderer.prototype.stop = function() {
    this.active = false;
    this._cancelFrame();
  };

  Renderer.prototype._handleContextLost = function(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (this.disposed || this.contextLost) return;
    this.contextLost = true;
    this._cancelFrame();
    this.resources = null;
    this.fadeFrom = null;
    try {
      this.onContextLost();
    } catch (error) {
      this._reportError(error);
    }
  };

  Renderer.prototype._handleContextRestored = function() {
    if (this.disposed) return;
    try {
      this.contextLost = false;
      this._createResources();
      this.renderFrame();
      this.onContextRestored();
      this._ensureLoop();
    } catch (error) {
      this.contextLost = true;
      this._reportError(error);
    }
  };

  Renderer.prototype.getState = function(nowMs) {
    nowMs = Number(nowMs) || this._now();
    return {
      version: VERSION,
      theme: this.theme,
      position: this._position(nowMs),
      change: this.change ? assign({}, this.change) : null,
      reducedMotion: this.reducedMotion,
      visible: this.visible,
      ready: this.ready,
      contextLost: this.contextLost,
      epochMs: this.epochMs,
      width: this.width,
      height: this.height,
      dpr: this.dpr
    };
  };

  Renderer.prototype.dispose = function() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    if (this.canvas && typeof this.canvas.removeEventListener === 'function') {
      this.canvas.removeEventListener('webglcontextlost', this.boundContextLost, false);
      this.canvas.removeEventListener('webglcontextrestored', this.boundContextRestored, false);
    }
    this._destroyResources();
    if (this.leafImage && typeof this.leafImage.close === 'function') this.leafImage.close();
    this.leafImage = null;
    this.gl = null;
    this.canvas = null;
  };

  function create(canvas, options) {
    return new Renderer(canvas, options || {});
  }

  return {
    version: VERSION,
    contextAttributes: CONTEXT_ATTRIBUTES,
    changeDurationMs: CHANGE_MS,
    reducedChangeDurationMs: REDUCED_CHANGE_MS,
    passage: passage,
    along: along,
    create: create,
    Renderer: Renderer
  };
});
