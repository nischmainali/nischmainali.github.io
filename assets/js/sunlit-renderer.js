/*
 * Lokta Sunlight Renderer
 *
 * A dependency-free WebGL2 environmental surface. The same classic script is
 * loaded in a dedicated worker or in the window for the main-thread fallback.
 * It deliberately owns no storage, controls, route detection, or scroll state;
 * those remain responsibilities of the small page controller.
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

  var VERSION = '1.2.0-experimental';
  var CHANNEL_COUNT = 6;
  var SHADE = 0;
  var SUNSET = 1;

  /* Channel order: shutter field, plane, shutter field companion, sunset,
   * botanicals, paper relief. The two shutter channels intentionally share
   * one slow clock: they survive saved states from the first renderer while
   * now driving a fixed-endpoint cross-fade rather than a changing modulus. */
  var SUNSET_DURATIONS = [1800, 1200, 1800, 3000, 1600, 4800];
  var SHADE_DURATIONS = [1800, 1200, 1800, 3000, 1600, 2400];
  var SUNSET_DELAYS = [0, 0, 0, 0, 0, 550];
  var SHADE_DELAYS = [0, 0, 0, 0, 0, 0];
  var SUNSET_TIMING = { durations: SUNSET_DURATIONS, delays: SUNSET_DELAYS };
  var SHADE_TIMING = { durations: SHADE_DURATIONS, delays: SHADE_DELAYS };
  var NOISE_SIZE = 512;
  var NOISE_POSITIONS = [
    [0, 32], [-16, -32], [-64, 16], [72, -72], [-16, 56], [-72, -32],
    [16, 48], [56, -64], [-72, 8], [48, -40], [-56, 0]
  ];

  var CONTEXT_ATTRIBUTES = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power'
  };

  var FULLSCREEN_VERTEX = [
    '#version 300 es',
    'layout(location = 0) in vec2 a_position;',
    'out vec2 v_uv;',
    'void main() {',
    '  v_uv = a_position * 0.5 + 0.5;',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var PAPER_FRAGMENT = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v_uv;',
    'out vec4 out_color;',
    'uniform vec2 u_resolution;',
    'uniform float u_time;',
    'uniform float u_seed;',
    'uniform vec4 u_mixes;',
    'uniform vec2 u_extra;',
    'uniform vec2 u_route;',
    '',
    'float hash21(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32 + u_seed);',
    '  return fract(p.x * p.y);',
    '}',
    '',
    'float valueNoise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float a = hash21(i);',
    '  float b = hash21(i + vec2(1.0, 0.0));',
    '  float c = hash21(i + vec2(0.0, 1.0));',
    '  float d = hash21(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
    '}',
    '',
    'float fbm(vec2 p) {',
    '  float value = 0.0;',
    '  float amplitude = 0.5;',
    '  for (int i = 0; i < 4; i++) {',
    '    value += amplitude * valueNoise(p);',
    '    p = p * 2.03 + vec2(17.1, 9.2);',
    '    amplitude *= 0.5;',
    '  }',
    '  return value;',
    '}',
    '',
    'vec2 rotate2d(vec2 p, float angle) {',
    '  float c = cos(angle);',
    '  float s = sin(angle);',
    '  return mat2(c, -s, s, c) * p;',
    '}',
    '',
    'float attenuation(vec2 uv) {',
    '  float distanceFromMeasure = abs(uv.x - 0.5) / 0.285;',
    '  float field = exp(-pow(distanceFromMeasure, 4.0));',
    '  return mix(u_route.y, u_route.x, field);',
    '}',
    '',
    'float reliefPair(vec2 uv, float index) {',
    '  float base = hash21(vec2(index + 19.0, u_seed + 7.0));',
    '  float bend = (hash21(vec2(index + 41.0, u_seed)) - 0.5) * 0.16;',
    '  float frequency = 1.4 + hash21(vec2(index, u_seed + 31.0)) * 2.2;',
    '  float phase = hash21(vec2(index + 71.0, u_seed)) * 6.2831853;',
    '  float lineY = base + bend * sin(uv.x * frequency * 6.2831853 + phase);',
    '  float px = 1.0 / max(u_resolution.y, 1.0);',
    '  float d = uv.y - lineY;',
    '  float highlight = exp(-pow((d + 1.25 * px) / (1.15 * px), 2.0));',
    '  float shadow = exp(-pow((d - 1.10 * px) / (1.35 * px), 2.0));',
    '  return highlight - shadow;',
    '}',
    '',
    'float shutterStripe(float coordinate, float period, float depth, float softness) {',
    '  float phase = mod(coordinate, period);',
    '  float signedStripe = abs(phase - depth * 0.5) - depth * 0.5;',
    '  float stripe = 1.0 - smoothstep(-softness, softness, signedStripe);',
    '  float duty = depth / period;',
    '  return mix(stripe, duty, smoothstep(period * 0.28, period * 0.92, softness));',
    '}',
    '',
    'void main() {',
    '  vec2 uv = v_uv;',
    '  float slatMix = u_mixes.x;',
    '  float planeMix = u_mixes.y;',
    '  float architectureMix = u_mixes.z;',
    '  float sunsetMix = u_mixes.w;',
    '  float reliefMix = u_extra.y;',
    '',
    '  // A warm window-side white turning almost imperceptibly toward lichen.',
    '  // Keep the chroma below the threshold where the sheet reads as a green',
    '  // gradient; the environmental identity should arrive through light.',
    '  vec3 nearPaper = vec3(0.992, 0.976, 0.962);',
    '  vec3 farPaper = vec3(0.962, 0.970, 0.948);',
    '  float paperGradient = smoothstep(-0.08, 1.08, uv.x * 0.82 + uv.y * 0.10);',
    '  vec3 paper = mix(nearPaper, farPaper, paperGradient);',
    '  float windowBloom = 1.0 - smoothstep(0.0, 0.95, length((uv - vec2(0.18, 0.90)) * vec2(0.72, 1.0)));',
    '  paper += vec3(0.008, 0.007, 0.004) * windowBloom;',
    '',
    '  float pulp = fbm(uv * vec2(3.4, 29.0) + vec2(u_seed * 0.13, 4.7));',
    '  float crossPulp = fbm(uv.yx * vec2(7.0, 18.0) + vec2(11.2, u_seed * 0.09));',
    '  paper *= 0.984 + 0.026 * pulp + 0.009 * crossPulp;',
    '',
    '  float relief = 0.0;',
    '  for (int fibre = 0; fibre < 7; fibre++) {',
    '    relief += reliefPair(uv, float(fibre));',
    '  }',
    '  // Raking light begins as nearly invisible thickness in shade, then',
    '  // resolves continuously instead of appearing at the end of the fade.',
    '  float reliefVisibility = 0.07 + 0.93 * reliefMix;',
    '  paper += vec3(relief * reliefVisibility * 0.012);',
    '',
    '  // CSS transforms use a top-down Y axis; WebGL UVs are bottom-up. Work',
    '  // in screen coordinates so Sunlit\'s -20/-16 degree plane keeps the',
    '  // same visible direction instead of being mirrored vertically.',
    '  vec2 px = vec2((uv.x - 0.5) * u_resolution.x, (0.5 - uv.y) * u_resolution.y);',
    '  px.x -= u_resolution.x * 0.10 * planeMix;',
    '  float angle = radians(mix(-20.0, -16.0, planeMix));',
    '  vec2 shutter = rotate2d(px, angle);',
    '  shutter.y += 300.0;',
    '',
    '  float mobile = 1.0 - step(600.0, u_resolution.x);',
    '  float shadePeriod = mix(64.0, 58.0, mobile);',
    '  float sunsetPeriod = mix(74.0, 67.0, mobile);',
    '  float shadeDepth = mix(56.0, 42.0, mobile);',
    '  float sunsetDepth = 20.0;',
    '  float clarityRamp = smoothstep(0.10, 0.92, uv.x);',
    '  float clarity = pow(clarityRamp, 0.88);',
    '  float shadeSoftness = mix(shadePeriod * 1.58, 10.0, clarity);',
    '  float sunsetSoftness = mix(sunsetPeriod * 1.58, 10.0, clarity);',
    '  float shadeStripe = shutterStripe(shutter.y, shadePeriod, shadeDepth, shadeSoftness);',
    '  float sunsetStripe = shutterStripe(shutter.y, sunsetPeriod, sunsetDepth, sunsetSoftness);',
    '  // Cross-fade two complete optical fields. Interpolating the modulus made',
    '  // every ray slide through the others and caused the old half-second snap.',
    '  float shutterMix = clamp((slatMix + architectureMix) * 0.5, 0.0, 1.0);',
    '  float stripe = mix(shadeStripe, sunsetStripe, shutterMix);',
    '',
    '  float desktopVeil = (0.996 * uv.x + 0.087 * uv.y) / 1.083;',
    '  float mobileVeil = (0.966 * uv.x + 0.259 * uv.y) / 1.225;',
    '  float veilCoordinate = mix(desktopVeil, mobileVeil, mobile);',
    '  float veilStart = mix(0.20, 0.45, mobile);',
    '  float architectureReveal = clamp((veilCoordinate - veilStart) / (1.0 - veilStart), 0.0, 1.0);',
    '  float mobileStrength = mix(1.0, mix(0.85, 0.68, shutterMix), mobile);',
    '  vec3 shadowShade = mix(vec3(0.655, 0.660, 0.645), vec3(0.425, 0.435, 0.395), sunsetMix * 0.22);',
    '  // The predecessor cleared the window side with paper-colored veils.',
    '  // Keep that luminous air instead of laying a second dark field over the',
    '  // sheet; the periodic shutters alone carry the architectural shadow.',
    '  float luminousVeil = 1.0 - architectureReveal;',
    '  paper += vec3(0.006, 0.007, 0.004) * luminousVeil * mix(1.0, 0.65, sunsetMix);',
    '  float shadowAlpha = mix(0.42, 0.50, shutterMix) * architectureReveal * attenuation(uv) * mobileStrength;',
    '  paper = mix(paper, shadowShade, clamp(stripe * shadowAlpha, 0.0, 0.52));',
    '',
    '  paper = clamp(paper, vec3(0.0), vec3(1.0));',
    '  out_color = vec4(paper, 1.0);',
    '}'
  ].join('\n');

  var ATMOSPHERE_FRAGMENT = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v_uv;',
    'out vec4 out_color;',
    'uniform sampler2D u_noise;',
    'uniform sampler2D u_paper;',
    'uniform vec2 u_resolution;',
    'uniform vec2 u_noise_offset;',
    'uniform float u_sunset;',
    'uniform float u_pass;',
    '',
    'void main() {',
    '  if (u_pass < -0.5) {',
    '    out_color = texture(u_paper, v_uv);',
    '    return;',
    '  }',
    '',
    '  if (u_pass < 0.5) {',
    '    vec2 screenPixel = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);',
    '    float gray = texture(u_noise, (screenPixel + u_noise_offset) / 512.0).r;',
    '    gray = min(1.0, gray * 1.2);',
    '    vec3 sepiaGray = gray * vec3(1.1755, 1.1015, 0.9685);',
    '    vec3 filtered = mix(vec3(gray), sepiaGray, 0.5);',
    '    out_color = vec4(clamp(filtered, 0.0, 1.0), 0.12);',
    '    return;',
    '  }',
    '',
    '  // Sunlit\'s peach window light, biased only slightly toward green-gold.',
    '  // Applying the endpoint directly preserves the reference luminance and',
    '  // avoids the muddy mid-brown produced by a partially mixed multiplier.',
    '  vec3 multiplier = mix(vec3(1.0), vec3(1.015, 0.758, 0.571), u_sunset);',
    '  float coral = 1.0 - smoothstep(0.0, 0.45, distance(v_uv, vec2(0.86, 0.85)));',
    '  multiplier *= mix(vec3(1.0), vec3(0.925, 0.835, 0.840), coral * u_sunset * 0.12);',
    '  out_color = vec4(multiplier, 1.0);',
    '}'
  ].join('\n');

  var BOTANICAL_VERTEX = [
    '#version 300 es',
    'precision highp float;',
    'layout(location = 0) in vec2 a_corner;',
    'layout(location = 1) in vec4 a_instance0;',
    'layout(location = 2) in vec4 a_instance1;',
    'layout(location = 3) in vec4 a_instance2;',
    'uniform vec2 u_resolution;',
    'uniform float u_time;',
    'uniform float u_botanical;',
    'uniform float u_motion;',
    'uniform vec2 u_route;',
    'out vec2 v_local;',
    'out float v_opacity;',
    'out float v_blur;',
    'flat out float v_kind;',
    '',
    'float attenuation(float x) {',
    '  float distanceFromMeasure = abs(x - 0.5) / 0.285;',
    '  float field = exp(-pow(distanceFromMeasure, 4.0));',
    '  return mix(u_route.y, u_route.x, field);',
    '}',
    '',
    'void main() {',
    '  float x = a_instance0.x;',
    '  float y = a_instance0.y;',
    '  float size = a_instance0.z;',
    '  float rotation = a_instance0.w;',
    '  float opacity = a_instance1.x;',
    '  float blurPx = a_instance1.y;',
    '  float kind = a_instance1.z;',
    '  float phase = a_instance1.w;',
    '  float mobile = 1.0 - step(600.0, u_resolution.x);',
    '  float desktopVeil = (0.996 * x + 0.087 * (1.0 - y)) / 1.083;',
    '  float mobileVeil = (0.966 * x + 0.259 * (1.0 - y)) / 1.225;',
    '  float veilCoordinate = mix(desktopVeil, mobileVeil, mobile);',
    '  float veilStart = mix(0.20, 0.45, mobile);',
    '  float botanicalReveal = clamp((veilCoordinate - veilStart) / (1.0 - veilStart), 0.0, 1.0);',
    '',
    '  if (kind > 1.5 && kind < 2.5) {',
    '    rotation += sin(u_time * 0.29 + phase) * 0.018 * u_motion;',
    '    opacity *= mix(mix(0.024, 0.014, mobile), mix(0.105, 0.040, mobile), u_botanical);',
    '  } else if (kind > 2.5) {',
    '    rotation += sin(u_time * 0.22 + phase) * 0.007 * u_motion;',
    '    opacity *= mix(mix(0.018, 0.010, mobile), mix(0.075, 0.032, mobile), u_botanical);',
    '  } else {',
    '    opacity *= mix(0.0, mix(0.16, 0.040, mobile), u_botanical);',
    '  }',
    '',
    '  vec2 scale = vec2(size * 0.72, size);',
    '  if (kind > 1.5 && kind < 2.5) scale = vec2(size, size * 0.34);',
    '  if (kind > 2.5) scale = vec2(size, max(2.4, size * 0.055));',
    '',
    '  float c = cos(rotation);',
    '  float s = sin(rotation);',
    '  vec2 localPx = mat2(c, -s, s, c) * (a_corner * scale);',
    '  vec2 center = vec2(x * 2.0 - 1.0, 1.0 - y * 2.0);',
    '  vec2 clipOffset = vec2(localPx.x * 2.0 / u_resolution.x, -localPx.y * 2.0 / u_resolution.y);',
    '',
    '  v_local = a_corner;',
    '  v_opacity = opacity * botanicalReveal * attenuation(x);',
    '  v_blur = blurPx / max(size, 1.0);',
    '  v_kind = kind;',
    '  gl_Position = vec4(center + clipOffset, 0.0, 1.0);',
    '}'
  ].join('\n');

  var BOTANICAL_FRAGMENT = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v_local;',
    'in float v_opacity;',
    'in float v_blur;',
    'flat in float v_kind;',
    'out vec4 out_color;',
    '',
    'float peepalShape(vec2 p) {',
    '  float y = clamp(p.y, -1.0, 1.0);',
    '  float lower = 0.84 * max(0.0, y + 1.0);',
    '  float upper = 0.90 * sqrt(max(0.0, 1.0 - y * y));',
    '  upper *= 1.0 - 0.13 * smoothstep(0.70, 1.0, y);',
    '  float halfWidth = mix(lower, upper, step(0.0, y));',
    '  return max(abs(p.x) - halfWidth, abs(y) - 1.0);',
    '}',
    '',
    'float pinnaShape(vec2 p) {',
    '  float taper = max(0.0, 1.0 - abs(p.x));',
    '  return max(abs(p.x) - 1.0, abs(p.y) - (0.08 + 0.78 * taper));',
    '}',
    '',
    'float rachisShape(vec2 p) {',
    '  vec2 q = vec2(max(abs(p.x) - 0.88, 0.0), p.y);',
    '  return length(q) - 0.12;',
    '}',
    '',
    'void main() {',
    '  float distanceField;',
    '  if (v_kind > 2.5) {',
    '    distanceField = rachisShape(v_local);',
    '  } else if (v_kind > 1.5) {',
    '    distanceField = pinnaShape(v_local);',
    '  } else {',
    '    distanceField = peepalShape(v_local);',
    '  }',
    '  float edge = max(fwidth(distanceField) * 0.85, 0.012) + v_blur * 0.72;',
    '  float coverage = 1.0 - smoothstep(-edge, edge, distanceField);',
    '  if (coverage <= 0.001 || v_opacity <= 0.001) discard;',
    '  vec3 primary = vec3(0.408, 0.471, 0.400);',
    '  vec3 soft = vec3(0.529, 0.584, 0.514);',
    '  vec3 ink = mix(primary, soft, step(1.5, v_kind) * 0.34);',
    '  out_color = vec4(ink, coverage * v_opacity);',
    '}'
  ].join('\n');

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function normalizeTheme(theme) {
    return theme === 'sunset' || theme === 'dark' ? 'sunset' : 'shade';
  }

  function normalizeRoute(route) {
    if (route === 'article' || route === 'documents') return route;
    return 'home';
  }

  function routeValues(route) {
    if (route === 'article') return [0.74, 0.95];
    if (route === 'documents') return [0.84, 0.95];
    return [1.0, 1.0];
  }

  function easeInOut(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function easeOut(value) {
    value = clamp(value, 0, 1);
    return 1 - Math.pow(1 - value, 3);
  }

  function hashSeed(seed) {
    if (typeof seed === 'number' && isFinite(seed)) return seed >>> 0;
    var source = String(seed == null ? 'lokta-sunlight' : seed);
    var hash = 2166136261;
    for (var index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    var state = hashSeed(seed) || 0x6d2b79f5;
    return function() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function gaussianNoiseData(seed) {
    var random = seededRandom(seed ^ 0x47524149);
    var data = new Uint8Array(NOISE_SIZE * NOISE_SIZE);
    var inverseSigma = 1 / Math.sqrt(0.5);
    for (var index = 0; index < data.length; index += 1) {
      var sum = 0;
      for (var sample = 0; sample < 6; sample += 1) sum += random();
      var normal = (sum - 3) * inverseSigma;
      data[index] = Math.round(clamp(126.85 + normal * 27.38, 0, 255));
    }
    return data;
  }

  function gaussianNoiseDataAsync(seed, chunkSize) {
    var random = seededRandom(hashSeed(seed) ^ 0x47524149);
    var data = new Uint8Array(NOISE_SIZE * NOISE_SIZE);
    var inverseSigma = 1 / Math.sqrt(0.5);
    var index = 0;
    var size = Math.max(1024, Math.min(16384, Number(chunkSize) || 8192));

    return new Promise(function(resolve) {
      function fillChunk() {
        var end = Math.min(data.length, index + size);
        for (; index < end; index += 1) {
          var sum = 0;
          for (var sample = 0; sample < 6; sample += 1) sum += random();
          var normal = (sum - 3) * inverseSigma;
          data[index] = Math.round(clamp(126.85 + normal * 27.38, 0, 255));
        }
        if (index < data.length) {
          scope.setTimeout(fillChunk, 0);
        } else {
          resolve(data);
        }
      }
      fillChunk();
    });
  }

  function noiseOffsetAt(seconds) {
    var phase = ((seconds % 1) + 1) % 1;
    var frame = Math.min(19, Math.floor(phase * 20));
    var segment = Math.floor(frame * 0.5);
    var fraction = frame % 2 === 0 ? 0 : 0.5;
    var from = NOISE_POSITIONS[segment];
    var to = NOISE_POSITIONS[segment + 1];
    return [
      from[0] + (to[0] - from[0]) * fraction,
      from[1] + (to[1] - from[1]) * fraction
    ];
  }

  function copyChannels(values) {
    var result = new Float32Array(CHANNEL_COUNT);
    for (var index = 0; index < CHANNEL_COUNT; index += 1) {
      result[index] = values[index] == null ? 0 : Number(values[index]);
    }
    return result;
  }

  function endpointChannels(theme) {
    var endpoint = theme === 'sunset' ? 1 : 0;
    return new Float32Array([endpoint, endpoint, endpoint, endpoint, endpoint, endpoint]);
  }

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation failure';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    var vertex = null;
    var fragment = null;
    var program = null;
    var linked = false;
    try {
      vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
      fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var message = gl.getProgramInfoLog(program) || 'Unknown shader link failure';
        throw new Error(message);
      }
      linked = true;
      return program;
    } finally {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program && !linked) gl.deleteProgram(program);
    }
  }

  function uniformMap(gl, program, names) {
    var uniforms = {};
    names.forEach(function(name) {
      uniforms[name] = gl.getUniformLocation(program, name);
    });
    return uniforms;
  }

  function bezierPoint(points, t) {
    var oneMinus = 1 - t;
    var a = oneMinus * oneMinus * oneMinus;
    var b = 3 * oneMinus * oneMinus * t;
    var c = 3 * oneMinus * t * t;
    var d = t * t * t;
    return {
      x: a * points[0].x + b * points[1].x + c * points[2].x + d * points[3].x,
      y: a * points[0].y + b * points[1].y + c * points[2].y + d * points[3].y
    };
  }

  function bezierTangent(points, t) {
    var oneMinus = 1 - t;
    return {
      x: 3 * oneMinus * oneMinus * (points[1].x - points[0].x) +
        6 * oneMinus * t * (points[2].x - points[1].x) +
        3 * t * t * (points[3].x - points[2].x),
      y: 3 * oneMinus * oneMinus * (points[1].y - points[0].y) +
        6 * oneMinus * t * (points[2].y - points[1].y) +
        3 * t * t * (points[3].y - points[2].y)
    };
  }

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

    this.seed = hashSeed(this.options.seed);
    this.epochMs = Number(this.options.epochMs) || Date.now();
    this.ambientOffsetMs = Number(this.options.ambientOffsetMs) || 0;
    this.maxDpr = clamp(Number(this.options.maxDpr) || 1, 0.5, 1.5);
    this.ambientFrameIntervalMs = 1000 / clamp(Number(this.options.ambientFps) || 30, 1, 60);
    this.transitionFrameIntervalMs = 1000 / clamp(Number(this.options.transitionFps) || 60, 1, 60);
    this.width = Math.max(1, Number(this.options.width) || 1);
    this.height = Math.max(1, Number(this.options.height) || 1);
    this.dpr = clamp(Number(this.options.dpr) || 1, 0.5, this.maxDpr);
    this.route = normalizeRoute(this.options.route);
    this.routeCurrent = routeValues(this.route);
    this.routeTransition = null;
    this.theme = normalizeTheme(this.options.theme);
    this.channels = endpointChannels(this.theme);
    this.transition = null;
    this.paused = Boolean(this.options.paused);
    this.reducedMotion = Boolean(this.options.reducedMotion);
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
    this.paperCacheState = null;
    this.botanicalCount = 0;
    this.ambientFrozen = false;
    this.ambientFrozenMs = 0;

    this.boundLoop = this._loop.bind(this);
    this.boundContextLost = this._handleContextLost.bind(this);
    this.boundContextRestored = this._handleContextRestored.bind(this);

    if (typeof canvas.addEventListener === 'function') {
      canvas.addEventListener('webglcontextlost', this.boundContextLost, false);
      canvas.addEventListener('webglcontextrestored', this.boundContextRestored, false);
    }

    this._setInitialTransition(this.options.transition);
    this._synchronizeAmbientFreeze(Number(this.options.nowMs) || Date.now(), true);

    try {
      this._createContextAndResources();
      this.resize(this.width, this.height, this.dpr, true);
      if (this.options.autoStart !== false) this.start();
    } catch (error) {
      this._reportError(error);
      this.dispose();
      throw error;
    }
  }

  Renderer.prototype._now = function() {
    return Date.now();
  };

  Renderer.prototype._reportError = function(error) {
    try {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    } catch (callbackError) {
      // Renderer failures must not recurse through a reporting callback.
    }
  };

  Renderer.prototype._createContextAndResources = function() {
    this.gl = this.canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
    if (!this.gl) throw new Error('WebGL2 is unavailable for the Sunlit renderer');
    this._createResources();
  };

  Renderer.prototype._createResources = function() {
    var gl = this.gl;
    var resources = {
      paperProgram: null,
      paperUniforms: null,
      atmosphereProgram: null,
      atmosphereUniforms: null,
      botanicalProgram: null,
      botanicalUniforms: null,
      fullscreenVao: null,
      fullscreenBuffer: null,
      paperTexture: null,
      paperFramebuffer: null,
      noiseTexture: null,
      botanicalVao: null,
      botanicalQuadBuffer: null,
      botanicalInstanceBuffer: null
    };
    this.resources = resources;

    var paperProgram = resources.paperProgram = createProgram(gl, FULLSCREEN_VERTEX, PAPER_FRAGMENT);
    var atmosphereProgram = resources.atmosphereProgram = createProgram(gl, FULLSCREEN_VERTEX, ATMOSPHERE_FRAGMENT);
    var botanicalProgram = resources.botanicalProgram = createProgram(gl, BOTANICAL_VERTEX, BOTANICAL_FRAGMENT);

    var fullscreenVao = resources.fullscreenVao = gl.createVertexArray();
    var fullscreenBuffer = resources.fullscreenBuffer = gl.createBuffer();
    gl.bindVertexArray(fullscreenVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var botanicalVao = resources.botanicalVao = gl.createVertexArray();
    var botanicalQuadBuffer = resources.botanicalQuadBuffer = gl.createBuffer();
    var botanicalInstanceBuffer = resources.botanicalInstanceBuffer = gl.createBuffer();
    gl.bindVertexArray(botanicalVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, botanicalQuadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, botanicalInstanceBuffer);
    var stride = 12 * 4;
    for (var attribute = 1; attribute <= 3; attribute += 1) {
      gl.enableVertexAttribArray(attribute);
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, stride, (attribute - 1) * 4 * 4);
      gl.vertexAttribDivisor(attribute, 1);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var paperTexture = resources.paperTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paperTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    var paperFramebuffer = resources.paperFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, paperFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paperTexture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('The cached paper framebuffer is incomplete');
    }

    var noiseTexture = resources.noiseTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.R8, NOISE_SIZE, NOISE_SIZE, 0,
      gl.RED, gl.UNSIGNED_BYTE,
      this.options.noiseData instanceof Uint8Array ? this.options.noiseData : gaussianNoiseData(this.seed)
    );
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    resources.paperUniforms = uniformMap(gl, paperProgram, [
        'u_resolution', 'u_time', 'u_seed', 'u_mixes', 'u_extra', 'u_route'
      ]);
    resources.atmosphereUniforms = uniformMap(gl, atmosphereProgram, [
        'u_noise', 'u_paper', 'u_resolution', 'u_noise_offset', 'u_sunset', 'u_pass'
      ]);
    resources.botanicalUniforms = uniformMap(gl, botanicalProgram, [
        'u_resolution', 'u_time', 'u_botanical', 'u_motion', 'u_route'
      ]);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.SCISSOR_TEST);
    this.paperCacheState = null;
  };

  Renderer.prototype._destroyResources = function() {
    if (!this.gl || !this.resources || this.contextLost) {
      this.resources = null;
      return;
    }
    var gl = this.gl;
    var resources = this.resources;
    if (resources.paperProgram) gl.deleteProgram(resources.paperProgram);
    if (resources.atmosphereProgram) gl.deleteProgram(resources.atmosphereProgram);
    if (resources.botanicalProgram) gl.deleteProgram(resources.botanicalProgram);
    if (resources.fullscreenBuffer) gl.deleteBuffer(resources.fullscreenBuffer);
    if (resources.botanicalQuadBuffer) gl.deleteBuffer(resources.botanicalQuadBuffer);
    if (resources.botanicalInstanceBuffer) gl.deleteBuffer(resources.botanicalInstanceBuffer);
    if (resources.fullscreenVao) gl.deleteVertexArray(resources.fullscreenVao);
    if (resources.botanicalVao) gl.deleteVertexArray(resources.botanicalVao);
    if (resources.paperFramebuffer) gl.deleteFramebuffer(resources.paperFramebuffer);
    if (resources.paperTexture) gl.deleteTexture(resources.paperTexture);
    if (resources.noiseTexture) gl.deleteTexture(resources.noiseTexture);
    this.resources = null;
    this.paperCacheState = null;
  };

  Renderer.prototype._setInitialTransition = function(initial) {
    if (!initial || initial.immediate === true) return;
    var fromTheme = normalizeTheme(initial.from);
    var toTheme = normalizeTheme(initial.to || this.theme);
    var startMs = Number(initial.startTimeMs);
    if (!isFinite(startMs)) return;
    this.theme = toTheme;
    this.channels = initial.fromValues ? copyChannels(initial.fromValues) : endpointChannels(fromTheme);
    this.transition = {
      from: copyChannels(this.channels),
      target: endpointChannels(toTheme),
      startMs: startMs,
      toTheme: toTheme
    };
    this.channels = this._sampleTransition(Number(initial.nowMs) || Date.now());
  };

  Renderer.prototype._timingForTransition = function(transition) {
    return transition.toTheme === 'sunset' ? SUNSET_TIMING : SHADE_TIMING;
  };

  Renderer.prototype._sampleTransition = function(nowMs) {
    if (!this.transition) return copyChannels(this.channels);
    var transition = this.transition;
    var timing = this._timingForTransition(transition);
    var elapsed = Math.max(0, nowMs - transition.startMs);
    var values = new Float32Array(CHANNEL_COUNT);
    var complete = true;

    for (var index = 0; index < CHANNEL_COUNT; index += 1) {
      /* Reversals cover only the remaining channel distance. This retains the
       * endpoint clocks without making a half-finished transition take a full
       * second pass to return. The relief delay scales by the same distance. */
      var distance = Math.abs(transition.target[index] - transition.from[index]);
      var duration = timing.durations[index] * distance;
      var delay = timing.delays[index] * distance;
      var progress = duration <= 0 ? 1 : clamp((elapsed - delay) / duration, 0, 1);
      var eased = index === 1 ? easeOut(progress) : easeInOut(progress);
      values[index] = transition.from[index] +
        (transition.target[index] - transition.from[index]) * eased;
      if (elapsed < delay + duration) complete = false;
    }

    this.channels = values;
    if (complete) this.transition = null;
    return copyChannels(values);
  };

  Renderer.prototype._sampleRoute = function(nowMs) {
    if (!this.routeTransition) return this.routeCurrent.slice();
    var transition = this.routeTransition;
    var progress = easeInOut((nowMs - transition.startMs) / transition.durationMs);
    this.routeCurrent = [
      transition.from[0] + (transition.target[0] - transition.from[0]) * progress,
      transition.from[1] + (transition.target[1] - transition.from[1]) * progress
    ];
    if (progress >= 1) this.routeTransition = null;
    return this.routeCurrent.slice();
  };

  Renderer.prototype._rawSceneTimeMs = function(nowMs) {
    return Math.max(0, nowMs - this.epochMs);
  };

  Renderer.prototype._ambientTimeMs = function(nowMs) {
    if (this.ambientFrozen) return this.ambientFrozenMs;
    return Math.max(0, this._rawSceneTimeMs(nowMs) - this.ambientOffsetMs);
  };

  Renderer.prototype._synchronizeAmbientFreeze = function(nowMs, initializing) {
    var shouldFreeze = this.paused;
    if (shouldFreeze && !this.ambientFrozen) {
      this.ambientFrozenMs = initializing && isFinite(Number(this.options.ambientTimeMs)) ?
        Math.max(0, Number(this.options.ambientTimeMs)) :
        Math.max(0, this._rawSceneTimeMs(nowMs) - this.ambientOffsetMs);
      this.ambientFrozen = true;
    } else if (!shouldFreeze && this.ambientFrozen) {
      this.ambientOffsetMs = Math.max(0, this._rawSceneTimeMs(nowMs) - this.ambientFrozenMs);
      this.ambientFrozen = false;
    }
  };

  Renderer.prototype._buildBotanicalInstances = function() {
    var random = seededRandom(this.seed ^ 0x4c4f4b54);
    var instances = [];
    var minimumDimension = Math.max(320, Math.min(this.width, this.height));
    var mobile = this.width < 600;

    function push(x, y, size, rotation, opacity, blur, kind, phase, duration, delay, drift, spin) {
      instances.push(
        x, y, size, rotation,
        opacity, blur, kind, phase,
        duration || 0, delay || 0, drift || 0, spin || 0
      );
    }

    for (var leaf = 0; leaf < 300; leaf += 1) {
      var firstCluster = leaf < 150;
      /* Sunlit's two envelopes live mostly beyond the upper and right edges:
       * only their aggregate shadow enters the sheet. The silhouettes below
       * are local peepal leaves, but their crop and depth match that geometry. */
      var centerX = firstCluster ?
        0.95 - 20 / this.width :
        0.75 - 14 / this.width;
      var centerY = firstCluster ?
        0.15 - 500 / this.height :
        0.40 - 350 / this.height;
      var x = centerX + (random() - 0.5) * 0.40;
      var y = centerY + (random() - 0.5) * 0.80;
      var envelopeX = (x - centerX) / 0.20;
      var envelopeY = (y - centerY) / 0.40;
      var envelopeRadius = Math.sqrt(envelopeX * envelopeX + envelopeY * envelopeY) / Math.SQRT2;
      var canopyOpacity = Math.max(0, 0.90 - 1.10 * envelopeRadius);
      y += 0.40 * (x - centerX) * this.width / this.height;
      var canopySize = 40 + random() * 30;
      var canopyBlur = 8 + Math.pow(1 - clamp(x, 0, 1), 1.2) * 30;
      push(
        x, y, canopySize, 0.7853982 + random() * Math.PI,
        canopyOpacity, canopyBlur,
        0, random() * Math.PI * 2
      );
    }

    var renderer = this;
    function addFrond(points, pairs, scale, opacity, phaseOffset) {
      var previous = bezierPoint(points, 0);
      for (var index = 0; index <= pairs; index += 1) {
        var t = index / pairs;
        var point = bezierPoint(points, t);
        var tangent = bezierTangent(points, t);
        var tangentAngle = Math.atan2(tangent.y, tangent.x);
        var normalX = -tangent.y;
        var normalY = tangent.x;
        var normalLength = Math.max(0.0001, Math.sqrt(normalX * normalX + normalY * normalY));
        normalX /= normalLength;
        normalY /= normalLength;
        var envelope = Math.pow(Math.sin(Math.PI * clamp(t, 0.02, 0.98)), 0.72);
        var pinnaLength = minimumDimension * scale * (0.22 + 0.78 * envelope);
        var offset = (3 + envelope * 8) / Math.max(renderer.width, renderer.height);

        if (index > 0 && index < pairs) {
          push(
            point.x + normalX * offset, point.y + normalY * offset,
            pinnaLength, tangentAngle + Math.PI * 0.54,
            opacity, 6.0 + (1 - envelope) * 4.0,
            2, phaseOffset + t * 3.0
          );
          push(
            point.x - normalX * offset, point.y - normalY * offset,
            pinnaLength * 0.92, tangentAngle - Math.PI * 0.54,
            opacity * 0.94, 6.4 + (1 - envelope) * 4.2,
            2, phaseOffset + 1.4 + t * 3.0
          );
        }

        if (index > 0) {
          var dx = (point.x - previous.x) * renderer.width;
          var dy = (point.y - previous.y) * renderer.height;
          var segmentLength = Math.sqrt(dx * dx + dy * dy) * 0.52;
          push(
            (point.x + previous.x) * 0.5,
            (point.y + previous.y) * 0.5,
            segmentLength,
            Math.atan2(dy, dx),
            opacity * 0.88, 4.0,
            3, phaseOffset + t * 2.0
          );
        }
        previous = point;
      }
    }

    addFrond([
      { x: 1.16, y: -0.18 },
      { x: 1.07, y: 0.01 },
      { x: 0.94, y: 0.28 },
      { x: 0.76, y: 0.47 }
    ], mobile ? 18 : 23, mobile ? 0.066 : 0.074, 0.58, 0.3);

    if (!mobile) {
      addFrond([
        { x: 1.20, y: -0.04 },
        { x: 1.09, y: 0.10 },
        { x: 1.00, y: 0.26 },
        { x: 0.89, y: 0.40 }
      ], 16, 0.052, 0.32, 2.2);
    }

    var data = new Float32Array(instances);
    this.botanicalCount = data.length / 12;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.resources.botanicalInstanceBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  };

  Renderer.prototype._allocatePaperTarget = function() {
    var gl = this.gl;
    var resources = this.resources;
    gl.bindTexture(gl.TEXTURE_2D, resources.paperTexture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA8, this.canvas.width, this.canvas.height, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.paperFramebuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error('The resized paper framebuffer is incomplete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.paperCacheState = null;
  };

  Renderer.prototype.resize = function(width, height, dpr, force) {
    if (this.disposed) return;
    width = Math.max(1, Math.round(Number(width) || this.width));
    height = Math.max(1, Math.round(Number(height) || this.height));
    dpr = clamp(Number(dpr) || this.dpr, 0.5, this.maxDpr);
    var changed = force || width !== this.width || height !== this.height || dpr !== this.dpr;
    if (!changed) return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    if (this.gl && !this.contextLost && this.resources) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this._allocatePaperTarget();
      this._buildBotanicalInstances();
      this.renderFrame();
    }
  };

  Renderer.prototype.setTheme = function(theme, options) {
    if (this.disposed) return;
    options = options || {};
    var targetTheme = normalizeTheme(theme);
    var nowMs = Number(options.nowMs) || this._now();
    var current = this._sampleTransition(nowMs);
    this.theme = targetTheme;

    if (options.immediate === true) {
      this.transition = null;
      this.channels = endpointChannels(targetTheme);
    } else {
      this.transition = {
        from: options.fromValues ? copyChannels(options.fromValues) : current,
        target: endpointChannels(targetTheme),
        startMs: Number(options.startTimeMs) || nowMs,
        toTheme: targetTheme
      };
    }
    this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype.setRoute = function(route, options) {
    if (this.disposed) return;
    options = options || {};
    route = normalizeRoute(route);
    var target = routeValues(route);
    var nowMs = Number(options.nowMs) || this._now();
    var current = this._sampleRoute(nowMs);
    this.route = route;
    if (Number(options.durationMs) > 0) {
      this.routeTransition = {
        from: current,
        target: target,
        startMs: Number(options.startTimeMs) || nowMs,
        durationMs: Number(options.durationMs)
      };
    } else {
      this.routeTransition = null;
      this.routeCurrent = target;
    }
    this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype.setPaused = function(paused, nowMs) {
    if (this.disposed) return;
    nowMs = Number(nowMs) || this._now();
    this.paused = Boolean(paused);
    this._synchronizeAmbientFreeze(nowMs, false);
    this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype.setReducedMotion = function(reduced, nowMs) {
    if (this.disposed) return;
    nowMs = Number(nowMs) || this._now();
    if (this.transition) this.channels = this._sampleTransition(nowMs);
    this.reducedMotion = Boolean(reduced);
    this._synchronizeAmbientFreeze(nowMs, false);
    this.renderFrame(nowMs);
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

  Renderer.prototype.setClock = function(clock) {
    if (this.disposed || !clock) return;
    var nowMs = Number(clock.nowMs) || this._now();
    if (isFinite(Number(clock.epochMs))) this.epochMs = Number(clock.epochMs);
    if (isFinite(Number(clock.ambientOffsetMs))) this.ambientOffsetMs = Math.max(0, Number(clock.ambientOffsetMs));
    if (isFinite(Number(clock.ambientTimeMs)) && this.ambientFrozen) {
      this.ambientFrozenMs = Math.max(0, Number(clock.ambientTimeMs));
    }
    this._synchronizeAmbientFreeze(nowMs, false);
    this.renderFrame(nowMs);
    this._ensureLoop();
  };

  Renderer.prototype._paperChanged = function(channels, route) {
    var next = [
      this.canvas.width, this.canvas.height,
      channels[0], channels[1], channels[2], channels[3], channels[4], channels[5],
      route[0], route[1]
    ];
    var previous = this.paperCacheState;
    if (!previous || previous.length !== next.length) return next;
    for (var index = 0; index < next.length; index += 1) {
      if (Math.abs(next[index] - previous[index]) > 0.00005) return next;
    }
    return null;
  };

  Renderer.prototype._renderPaper = function(ambientSeconds, channels, route, cacheState) {
    var gl = this.gl;
    var resources = this.resources;
    var uniforms = resources.paperUniforms;
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.paperFramebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(resources.paperProgram);
    gl.bindVertexArray(resources.fullscreenVao);
    gl.uniform2f(uniforms.u_resolution, this.width, this.height);
    gl.uniform1f(uniforms.u_time, ambientSeconds);
    gl.uniform1f(uniforms.u_seed, (this.seed % 104729) / 104729);
    gl.uniform4f(uniforms.u_mixes, channels[0], channels[1], channels[2], channels[3]);
    gl.uniform2f(uniforms.u_extra, channels[4], channels[5]);
    gl.uniform2f(uniforms.u_route, route[0], route[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.paperCacheState = cacheState;
  };

  Renderer.prototype._blitPaper = function() {
    var gl = this.gl;
    var resources = this.resources;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(resources.atmosphereProgram);
    gl.bindVertexArray(resources.fullscreenVao);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, resources.paperTexture);
    gl.uniform1i(resources.atmosphereUniforms.u_paper, 1);
    gl.uniform1f(resources.atmosphereUniforms.u_pass, -1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
  };

  Renderer.prototype._renderBotanicals = function(ambientSeconds, channels, route) {
    if (!this.botanicalCount) return;
    var gl = this.gl;
    var resources = this.resources;
    var uniforms = resources.botanicalUniforms;
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(resources.botanicalProgram);
    gl.bindVertexArray(resources.botanicalVao);
    gl.uniform2f(uniforms.u_resolution, this.width, this.height);
    gl.uniform1f(uniforms.u_time, ambientSeconds);
    gl.uniform1f(uniforms.u_botanical, channels[4]);
    gl.uniform1f(uniforms.u_motion, this.reducedMotion ? 0.32 : 1.0);
    gl.uniform2f(uniforms.u_route, route[0], route[1]);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.botanicalCount);
    gl.disable(gl.BLEND);
  };

  Renderer.prototype._renderAtmosphere = function(ambientSeconds, channels) {
    var gl = this.gl;
    var resources = this.resources;
    var uniforms = resources.atmosphereUniforms;
    var offset = noiseOffsetAt(ambientSeconds);

    gl.useProgram(resources.atmosphereProgram);
    gl.bindVertexArray(resources.fullscreenVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.noiseTexture);
    gl.uniform1i(uniforms.u_noise, 0);
    gl.uniform2f(uniforms.u_resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(uniforms.u_noise_offset, offset[0] * this.dpr, offset[1] * this.dpr);
    gl.uniform1f(uniforms.u_sunset, channels[3]);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(uniforms.u_pass, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (channels[3] > 0.0001) {
      gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      gl.uniform1f(uniforms.u_pass, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  Renderer.prototype.renderFrame = function(nowMs) {
    if (this.disposed || this.contextLost || !this.gl || !this.resources) return false;
    nowMs = Number(nowMs) || this._now();
    try {
      var channels = this._sampleTransition(nowMs);
      var route = this._sampleRoute(nowMs);
      var ambientSeconds = this._ambientTimeMs(nowMs) / 1000;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      var cacheState = this._paperChanged(channels, route);
      if (cacheState) this._renderPaper(ambientSeconds, channels, route, cacheState);
      this._blitPaper();
      this._renderBotanicals(ambientSeconds, channels, route);
      this._renderAtmosphere(ambientSeconds, channels);
      this.gl.bindVertexArray(null);
      this.gl.flush();
      this.lastRenderedAtMs = nowMs;
      if (!this.ready) {
        this.ready = true;
        this.onReady({
          version: VERSION,
          width: this.width,
          height: this.height,
          dpr: this.dpr,
          instanceCount: this.botanicalCount
        });
      }
      return true;
    } catch (error) {
      this.active = false;
      this._cancelFrame();
      this._reportError(error);
      return false;
    }
  };

  Renderer.prototype._needsContinuousFrames = function() {
    return Boolean(this.transition || this.routeTransition || !this.paused);
  };

  Renderer.prototype._requestFrame = function() {
    var renderer = this;
    if (typeof scope.requestAnimationFrame === 'function') {
      this.frameUsesTimeout = false;
      return scope.requestAnimationFrame(this.boundLoop);
    }
    this.frameUsesTimeout = true;
    return scope.setTimeout(function() {
      renderer.boundLoop();
    }, 16);
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
    if (!this.ready || this._needsContinuousFrames()) this.frameHandle = this._requestFrame();
  };

  Renderer.prototype._loop = function() {
    this.frameHandle = null;
    if (!this.active || !this.visible || this.disposed || this.contextLost) return;
    var nowMs = this._now();
    var changingMode = Boolean(this.transition || this.routeTransition);
    var ambientInterval = this.reducedMotion ?
      Math.max(this.ambientFrameIntervalMs, 1000 / 30) :
      this.ambientFrameIntervalMs;
    var interval = changingMode ? this.transitionFrameIntervalMs : ambientInterval;
    if (!this.lastRenderedAtMs || nowMs - this.lastRenderedAtMs >= interval - 2) {
      this.renderFrame(nowMs);
    }
    this._ensureLoop();
  };

  Renderer.prototype.start = function() {
    if (this.disposed) return;
    this.active = true;
    if (!this.ready) this.renderFrame();
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
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this._allocatePaperTarget();
      this._buildBotanicalInstances();
      this.renderFrame();
      this.onContextRestored();
      this._ensureLoop();
    } catch (error) {
      this._destroyResources();
      this.contextLost = true;
      this._reportError(error);
    }
  };

  Renderer.prototype.getState = function(nowMs) {
    nowMs = Number(nowMs) || this._now();
    var channels = this._sampleTransition(nowMs);
    return {
      version: VERSION,
      theme: this.theme,
      route: this.route,
      paused: this.paused,
      reducedMotion: this.reducedMotion,
      visible: this.visible,
      ready: this.ready,
      contextLost: this.contextLost,
      epochMs: this.epochMs,
      ambientOffsetMs: this.ambientOffsetMs,
      ambientTimeMs: this._ambientTimeMs(nowMs),
      transition: this.transition ? {
        startTimeMs: this.transition.startMs,
        to: this.transition.toTheme,
        fromValues: Array.prototype.slice.call(this.transition.from)
      } : null,
      values: Array.prototype.slice.call(channels),
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      instanceCount: this.botanicalCount
    };
  };

  Renderer.prototype.dispose = function() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    if (typeof this.canvas.removeEventListener === 'function') {
      this.canvas.removeEventListener('webglcontextlost', this.boundContextLost, false);
      this.canvas.removeEventListener('webglcontextrestored', this.boundContextRestored, false);
    }
    this._destroyResources();
    this.gl = null;
    this.canvas = null;
  };

  function create(canvas, options) {
    return new Renderer(canvas, options || {});
  }

  return {
    version: VERSION,
    contextAttributes: CONTEXT_ATTRIBUTES,
    generateNoiseDataAsync: gaussianNoiseDataAsync,
    create: create,
    Renderer: Renderer
  };
});
