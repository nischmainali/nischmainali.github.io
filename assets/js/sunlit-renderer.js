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

  var VERSION = '1.5.2-experimental';
  var CHANNEL_COUNT = 5;
  var SHADE = 0;
  var SUNSET = 1;

  /* Channel order: shutter aperture, plane, optical diffusion, sunset,
   * paper relief. Sunlit's slats open quickly; the projection, softness,
   * paper color, and raking relief each keep their own physical clock. */
  var SUNSET_DURATIONS = [500, 1200, 1800, 3000, 4800];
  var SHADE_DURATIONS = [500, 1200, 1800, 3000, 2400];
  var SUNSET_DELAYS = [0, 0, 0, 0, 550];
  var SHADE_DELAYS = [0, 0, 0, 0, 0];
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
    'uniform float u_seed;',
    'uniform vec4 u_mixes;',
    'uniform float u_relief;',
    'uniform vec2 u_route;',
    'uniform float u_fern_strength;',
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
    'float erfApprox(float value) {',
    '  float polarity = sign(value);',
    '  float x = abs(value);',
    '  float t = 1.0 / (1.0 + 0.3275911 * x);',
    '  float polynomial = (((((1.061405429 * t - 1.453152027) * t) +',
    '    1.421413741) * t - 0.284496736) * t + 0.254829592) * t;',
    '  return polarity * (1.0 - polynomial * exp(-x * x));',
    '}',
    '',
    'float gaussianCdf(float value) {',
    '  return 0.5 + 0.5 * erfApprox(value * 0.70710678118);',
    '}',
    '',
    'float blurredInterval(float value, float lower, float upper, float scale, float sigma) {',
    '  float safeSigma = max(sigma, 0.25);',
    '  float entering = gaussianCdf((value - lower) * scale / safeSigma);',
    '  float leaving = gaussianCdf((value - upper) * scale / safeSigma);',
    '  return clamp(entering - leaving, 0.0, 1.0);',
    '}',
    '',
    'float trapezoidMask(float value, float start, float fullStart, float fullEnd, float end) {',
    '  float rise = clamp((value - start) / max(fullStart - start, 0.0001), 0.0, 1.0);',
    '  float fall = 1.0 - clamp((value - fullEnd) / max(end - fullEnd, 0.0001), 0.0, 1.0);',
    '  return rise * fall;',
    '}',
    '',
    'float progressiveBlur(float screenCoordinate) {',
    '  // The DOM reference layers partially overlap, so their Gaussian',
    '  // variances accumulate. This second-moment equivalent follows the',
    '  // actual 0.5/8/25/50/100px masks without eight backdrop surfaces.',
    '  float maskCoordinate = 1.0 - screenCoordinate;',
    '  float variance = 0.0;',
    '  variance += 0.25 * trapezoidMask(maskCoordinate, 0.000, 0.125, 0.250, 0.375);',
    '  variance += 64.0 * trapezoidMask(maskCoordinate, 0.125, 0.250, 0.375, 0.500);',
    '  variance += 625.0 * trapezoidMask(maskCoordinate, 0.250, 0.375, 0.500, 0.625);',
    '  variance += 2500.0 * trapezoidMask(maskCoordinate, 0.375, 0.500, 0.625, 0.750);',
    '  variance += 10000.0 * trapezoidMask(maskCoordinate, 0.500, 0.625, 0.750, 0.875);',
    '  variance += 10000.0 * trapezoidMask(maskCoordinate, 0.625, 0.750, 0.875, 1.000);',
    '  variance += 10000.0 * clamp((maskCoordinate - 0.750) / 0.125, 0.0, 1.0);',
    '  variance += 10000.0 * clamp((maskCoordinate - 0.875) / 0.125, 0.0, 1.0);',
    '  return sqrt(max(variance, 0.0));',
    '}',
    '',
    'float niuroPinna(',
    '  vec2 point, vec2 centre, vec2 direction,',
    '  float lengthPx, float widthPx, float featherPx',
    ') {',
    '  // Every caller supplies a unit direction. Keeping that invariant here',
    '  // avoids repeating a normalization for every pinna and every pixel.',
    '  vec2 tangent = direction;',
    '  vec2 normal = vec2(-tangent.y, tangent.x);',
    '  vec2 offset = point - centre;',
    '  vec2 local = vec2(dot(offset, tangent), dot(offset, normal));',
    '  float halfLength = max(lengthPx * 0.5, 0.001);',
    '  float along = clamp(abs(local.x) / halfLength, 0.0, 1.0);',
    '  // A broad linear-lanceolate pinna: recognisably niuro at native size,',
    '  // but without tiny serrations that would turn into decorative noise.',
    '  float halfWidth = widthPx * pow(max(0.0, 1.0 - along * along), 0.62);',
    '  float distanceField = max(abs(local.x) - halfLength, abs(local.y) - halfWidth);',
    '  return 1.0 - smoothstep(-featherPx, featherPx, distanceField);',
    '}',
    '',
    'float niuroShadow(vec2 point, vec2 resolution) {',
    '  float scale = clamp(min(resolution.x / 1280.0, resolution.y / 720.0), 0.30, 1.30);',
    '  vec2 root = vec2(resolution.x * 1.075, resolution.y * 0.88);',
    '  vec2 tip = vec2(resolution.x * 0.84, resolution.y * 0.22);',
    '  vec2 axis = tip - root;',
    '  float axisLength = max(length(axis), 1.0);',
    '  vec2 direction = axis / axisLength;',
    '  vec2 normal = vec2(-direction.y, direction.x);',
    '  vec2 fromRoot = point - root;',
    '  float alongPx = dot(fromRoot, direction);',
    '  float along = clamp(alongPx / axisLength, 0.0, 1.0);',
    '  float bend = scale * (14.0 * sin(along * 2.8274334) + 6.0 * along * along);',
    '  float crossPx = dot(fromRoot, normal) - bend;',
    '  float rachisWidth = mix(3.2, 1.45, along) * scale;',
    '  float rachisDistance = max(',
    '    abs(crossPx) - rachisWidth, max(-alongPx, alongPx - axisLength)',
    '  );',
    '  float feather = 8.0 * scale;',
    '  float shadow = 1.0 - smoothstep(-feather, feather, rachisDistance);',
    '',
    '  // Eleven mature pairs and four still-unfurling pairs share one rachis.',
    '  for (int pinna = 0; pinna < 15; pinna++) {',
    '    float index = float(pinna);',
    '    float t = 0.08 + index * 0.055;',
    '    float localBend = scale * (14.0 * sin(t * 2.8274334) + 6.0 * t * t);',
    '    float bendDerivative = scale * (39.584067 * cos(t * 2.8274334) + 12.0 * t);',
    '    vec2 tangent = normalize(direction + normal * bendDerivative / axisLength);',
    '    vec2 branchNormal = vec2(-tangent.y, tangent.x);',
    '    vec2 centre = root + direction * axisLength * t + normal * localBend;',
    '    float envelope = pow(max(0.0, sin(3.14159265 * clamp(t / 0.92, 0.0, 1.0))), 0.72);',
    '    float pinnaLength = mix(22.0, 58.0, envelope) * scale;',
    '    pinnaLength *= 1.0 - 0.76 * smoothstep(0.62, 0.90, t);',
    '    if (pinna < 2) pinnaLength *= 0.78;',
    '    float pinnaWidth = pinnaLength * 0.145;',
    '',
    '    // 0.34^2 + 0.94^2 is 0.9992, close enough to unit length that',
    '    // normalizing both sides would add cost without an optical change.',
    '    vec2 leftDirection = tangent * 0.34 + branchNormal * 0.94;',
    '    vec2 rightDirection = tangent * 0.34 - branchNormal * 0.94;',
    '    float leftLength = pinnaLength * (0.97 + 0.035 * sin(index * 2.13));',
    '    float rightLength = pinnaLength * (0.93 + 0.04 * cos(index * 1.71));',
    '    vec2 leftCentre = centre + leftDirection * leftLength * 0.47;',
    '    vec2 rightCentre = centre + tangent * (3.5 * scale) + rightDirection * rightLength * 0.47;',
    '    shadow = max(shadow, niuroPinna(',
    '      point, leftCentre, leftDirection, leftLength, pinnaWidth, feather',
    '    ));',
    '    shadow = max(shadow, niuroPinna(',
    '      point, rightCentre, rightDirection, rightLength, pinnaWidth * 0.94, feather',
    '    ));',
    '  }',
    '',
    '  // A slightly irregular one-turn crozier identifies the partly opened',
    '  // frond without turning the shadow into a perfect ornamental spiral.',
    '  vec2 crozierCentre = tip - direction * (17.0 * scale) + normal * (4.0 * scale);',
    '  vec2 curl = point - crozierCentre;',
    '  float curlAngle = atan(curl.y, curl.x);',
    '  float curlProgress = (curlAngle + 3.14159265) / 6.2831853;',
    '  float curlRadius = scale * mix(22.0, 6.0, curlProgress);',
    '  curlRadius += scale * 1.15 * sin(curlAngle * 2.0 + 0.7);',
    '  float curlDistance = abs(length(curl) - curlRadius) - 1.8 * scale;',
    '  shadow = max(shadow, 1.0 - smoothstep(-feather * 0.82, feather * 0.82, curlDistance));',
    '  return clamp(shadow, 0.0, 1.0);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = v_uv;',
    '  float apertureMix = u_mixes.x;',
    '  float planeMix = u_mixes.y;',
    '  float diffusionMix = u_mixes.z;',
    '  float reliefMix = u_relief;',
    '',
    '  // The covered side stays warm; the window side clears toward a barely',
    '  // green white. It is one sheet, not a beige-to-green gradient.',
    '  vec3 nearPaper = vec3(0.987, 0.977, 0.966);',
    '  vec3 farPaper = vec3(0.985, 0.989, 0.979);',
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
    '  // Reconstruct Sunlit\'s actual shutter plane rather than drawing an',
    '  // infinite stripe texture. The parent turns around the viewport\'s top',
    '  // centre; every finite 180vw slat then rotates 4 degrees in depth under',
    '  // a 50vw perspective. This projection is what makes the shadows deepen,',
    '  // thicken, and converge as they travel into the sheet.',
    '  vec2 screen = vec2(uv.x * u_resolution.x, (1.0 - uv.y) * u_resolution.y);',
    '  float angle = radians(mix(-20.0, -16.0, planeMix));',
    '  float angleCos = cos(angle);',
    '  float angleSin = sin(angle);',
    '  vec2 fromPivot = screen - vec2(u_resolution.x * 0.5, 0.0);',
    '  vec2 projected = vec2(',
    '    angleCos * fromPivot.x + angleSin * fromPivot.y,',
    '    -angleSin * fromPivot.x + angleCos * fromPivot.y',
    '  );',
    '  projected += vec2(u_resolution.x * (0.5 - 0.10 * planeMix), 0.0);',
    '',
    '  float mobile = 1.0 - step(600.0, u_resolution.x);',
    '  float shadePeriod = mix(64.0, 58.0, mobile);',
    '  float period = mix(shadePeriod, shadePeriod * 1.15, apertureMix);',
    '  float shadeDepth = mix(56.0, 42.0, mobile);',
    '  float contentDepth = mix(shadeDepth, 20.0, apertureMix);',
    '  float outerDepth = contentDepth + 20.0;',
    '  float origin = -300.0 + 18.0 * apertureMix;',
    '',
    '  // Keep shade at the source\'s six-pixel slat blur, then let sunset pick',
    '  // up a small optical bloom. This prevents its boundaries from reading',
    '  // like crisp painted bars while preserving the projective geometry.',
    '  float baseBlur = mix(6.0, 10.5, diffusionMix);',
    '  // Sunlit rotates a viewport-tall blur stack by 90 degrees around its',
    '  // centre. Its horizontal footprint is therefore [-.5H, W-.5H], not',
    '  // [0,W]; preserving that offset lets the rays resolve much farther in.',
    '  float blurCoordinate = clamp(',
    '    (screen.x + u_resolution.y * 0.5) / u_resolution.x, 0.0, 1.0',
    '  );',
    '  float spread = progressiveBlur(blurCoordinate);',
    '  float sigma = sqrt(baseBlur * baseBlur + spread * spread);',
    '',
    '  float perspective = u_resolution.x * 0.5;',
    '  float childCos = 0.99756405026;',
    '  float childSin = 0.06975647374;',
    '  float childOrigin = u_resolution.x * 0.90;',
    '  float childTranslate = u_resolution.x * 0.12;',
    '  float perspectiveU = (projected.x - perspective) / perspective;',
    '  float projectedU = projected.x - perspective;',
    '  float leftStep = u_resolution.x * 0.01;',
    '  float bodyOrigin = origin + 10.0;',
    '  float indexRatio = leftStep / period;',
    '  float lookupOffset = (',
    '    childOrigin + childTranslate - perspective +',
    '    indexRatio * (bodyOrigin - projected.y) - projectedU',
    '  ) / (',
    '    (childSin / perspective) * (projectedU + indexRatio * projected.y) - childCos',
    '  );',
    '  float lookupDepth = 1.0 + childSin * lookupOffset / perspective;',
    '  float projectedIndex = (projected.y * lookupDepth - bodyOrigin) / period;',
    '  float nearestIndex = floor(projectedIndex);',
    '  float bandCount = ceil(u_resolution.y / 36.0);',
    '  float coverage = 0.0;',
    '  // Thirteen neighbours cover more than 2.7 sigma even where the two',
    '  // widest blur masks overlap. Looking them up from the exact projective',
    '  // lattice avoids a viewport-height loop and remains safe on tall phones.',
    '  for (int neighbour = 0; neighbour < 13; neighbour++) {',
    '    float index = nearestIndex + float(neighbour - 6);',
    '    if (index < 0.0 || index >= bandCount) continue;',
    '    float bandLeft = -u_resolution.x * 0.01 * index;',
    '    float bandTop = origin + period * index;',
    '    float transformedOrigin = bandLeft + childOrigin + childTranslate;',
    '    float projectionDenominator = perspectiveU * childSin - childCos;',
    '    float localOffset = (transformedOrigin - perspective -',
    '      perspectiveU * perspective) / projectionDenominator;',
    '    float localX = childOrigin + localOffset;',
    '    float perspectiveDepth = perspective + childSin * localOffset;',
    '    float projectionScale = perspective / max(perspectiveDepth, 1.0);',
    '    float localY = projected.y / max(projectionScale, 0.001) - bandTop;',
    '',
    '    // The 100vw solid left border has ten-pixel transparent mitres.',
    '    // Their diagonal joins make each shadow 76->56px in shade and',
    '    // 40->20px at sunset instead of the constant-width bars we had.',
    '    // Every edge receives the same optical blur. A hard step here made',
    '    // the rays terminate abruptly at the finite shutter boundary.',
    '    float localDerivative = (',
    '      childCos - childSin * (transformedOrigin - perspective) / perspective',
    '    ) / (projectionDenominator * projectionDenominator);',
    '    float localSoftness = sigma * abs(localDerivative);',
    '    float onFiniteCore =',
    '      smoothstep(-2.0 * localSoftness, 2.0 * localSoftness, localX) *',
    '      (1.0 - smoothstep(',
    '        u_resolution.x - 2.0 * localSoftness,',
    '        u_resolution.x + 2.0 * localSoftness, localX',
    '      ));',
    '    float bevel = 10.0 * clamp(localX / u_resolution.x, 0.0, 1.0);',
    '    float interval = blurredInterval(',
    '      localY, bevel, outerDepth - bevel, projectionScale, sigma',
    '    );',
    '    float layerAlpha = interval * onFiniteCore;',
    '    coverage += layerAlpha * (1.0 - coverage);',
    '  }',
    '  coverage = clamp(coverage, 0.0, 1.0);',
    '  vec3 shadowPigment = vec3(0.78039215686);',
    '',
    '  // Sunlit\'s separate paper-coloured veil covers the window-side field.',
    '  // Keep it independent of the per-slat pigment so it cannot alter depth.',
    '  float desktopVeil = 0.5 + (',
    '    u_resolution.x * 0.996 * (uv.x - 0.5) +',
    '    u_resolution.y * 0.087 * (uv.y - 0.5)',
    '  ) / (u_resolution.x * 0.996 + u_resolution.y * 0.087);',
    '  float mobileVeil = 0.5 + (',
    '    u_resolution.x * 0.966 * (uv.x - 0.5) +',
    '    u_resolution.y * 0.259 * (uv.y - 0.5)',
    '  ) / (u_resolution.x * 0.966 + u_resolution.y * 0.259);',
    '  float veilCoordinate = mix(desktopVeil, mobileVeil, mobile);',
    '  // The reference blurs this paper veil with the shutter field. Folding',
    '  // that later backdrop pass into one cached shader shifts its apparent',
    '  // 20% stop left by about seven viewport percent on desktop.',
    '  float veilStart = mix(0.13, 0.45, mobile);',
    '  float linearVeilReveal = clamp(',
    '    (veilCoordinate - veilStart) / (1.0 - veilStart), 0.0, 1.0',
    '  );',
    '  // In sunset the projected field dissolves into the covered side more',
    '  // gradually. The right edge keeps its depth; only the long left tail',
    '  // loses contrast instead of ending as a visible periodic texture.',
    '  float sunsetVeilReveal = pow(linearVeilReveal, 1.52);',
    '  float veilReveal = mix(linearVeilReveal, sunsetVeilReveal, diffusionMix);',
    '  float shadowAlpha = coverage * veilReveal * attenuation(uv);',
    '  paper = mix(paper, shadowPigment, clamp(shadowAlpha, 0.0, 1.0));',
    '',
    '  // The optional sunset experiment is one cropped niuro (pani-niuro)',
    '  // crozier, not a canopy. It shares the shutter pigment and the cached',
    '  // paper pass, so it adds no steady-state or scroll-time rendering work.',
    '  float fernArrival = smoothstep(0.18, 0.82, min(apertureMix, planeMix));',
    '  // The frond has its own gentle responsive entrance. The previous hard',
    '  // 599/600px switch made a sparse rachis appear all at once on tall',
    '  // narrow screens, where it could resemble the rejected mullion shadow.',
    '  float fernEligibility = smoothstep(640.0, 760.0, u_resolution.x);',
    '  if (',
    '    u_fern_strength > 0.001 && fernArrival > 0.001 && fernEligibility > 0.001',
    '  ) {',
    '    float routeStrength = mix(',
    '      0.09, 0.24, clamp((u_route.x - 0.74) / 0.26, 0.0, 1.0)',
    '    );',
    '    float fernAlpha = u_fern_strength * fernArrival * fernEligibility *',
    '      routeStrength * niuroShadow(screen, u_resolution) * attenuation(uv);',
    '    vec3 fernPigment = vec3(0.52, 0.55, 0.51);',
    '    paper = mix(paper, fernPigment, clamp(fernAlpha, 0.0, 0.25));',
    '  }',
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

  function cubicBezier(value, x1, y1, x2, y2) {
    value = clamp(value, 0, 1);
    var t = value;
    for (var iteration = 0; iteration < 6; iteration += 1) {
      var oneMinus = 1 - t;
      var sampleX = 3 * oneMinus * oneMinus * t * x1 +
        3 * oneMinus * t * t * x2 + t * t * t;
      var derivative = 3 * oneMinus * oneMinus * x1 +
        6 * oneMinus * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (Math.abs(derivative) < 0.000001) break;
      t = clamp(t - (sampleX - value) / derivative, 0, 1);
    }
    var remaining = 1 - t;
    return 3 * remaining * remaining * t * y1 +
      3 * remaining * t * t * y2 + t * t * t;
  }

  function easeInOut(value) {
    return cubicBezier(value, 0.42, 0, 0.58, 1);
  }

  function easeOut(value) {
    return cubicBezier(value, 0, 0, 0.58, 1);
  }

  function easeMaterial(value) {
    return cubicBezier(value, 0.4, 0, 0.2, 1);
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
    return new Float32Array([endpoint, endpoint, endpoint, endpoint, endpoint]);
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
    this.fernStrength = clamp(Number(this.options.fernStrength) || 0, 0, 1);
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
      fullscreenVao: null,
      fullscreenBuffer: null,
      paperTexture: null,
      paperFramebuffer: null,
      noiseTexture: null
    };
    this.resources = resources;

    var paperProgram = resources.paperProgram = createProgram(gl, FULLSCREEN_VERTEX, PAPER_FRAGMENT);
    var atmosphereProgram = resources.atmosphereProgram = createProgram(gl, FULLSCREEN_VERTEX, ATMOSPHERE_FRAGMENT);

    var fullscreenVao = resources.fullscreenVao = gl.createVertexArray();
    var fullscreenBuffer = resources.fullscreenBuffer = gl.createBuffer();
    gl.bindVertexArray(fullscreenVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

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
        'u_resolution', 'u_seed', 'u_mixes', 'u_relief', 'u_route', 'u_fern_strength'
      ]);
    resources.atmosphereUniforms = uniformMap(gl, atmosphereProgram, [
        'u_noise', 'u_paper', 'u_resolution', 'u_noise_offset', 'u_sunset', 'u_pass'
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
    if (resources.fullscreenBuffer) gl.deleteBuffer(resources.fullscreenBuffer);
    if (resources.fullscreenVao) gl.deleteVertexArray(resources.fullscreenVao);
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
      var eased = index === 1 ? easeOut(progress) :
        (index === 4 && transition.toTheme === 'sunset' ?
          easeMaterial(progress) : easeInOut(progress));
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
    /* Diffusion is retained only as a saved-state compatibility channel, and
     * sunset is composited in the atmosphere pass. Neither invalidates the
     * cached paper surface. */
    var next = [
      this.canvas.width, this.canvas.height,
      channels[0], channels[1], channels[2], channels[4],
      route[0], route[1]
    ];
    var previous = this.paperCacheState;
    if (!previous || previous.length !== next.length) return next;
    for (var index = 0; index < next.length; index += 1) {
      if (Math.abs(next[index] - previous[index]) > 0.00005) return next;
    }
    return null;
  };

  Renderer.prototype._renderPaper = function(channels, route, cacheState) {
    var gl = this.gl;
    var resources = this.resources;
    var uniforms = resources.paperUniforms;
    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.paperFramebuffer);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(resources.paperProgram);
    gl.bindVertexArray(resources.fullscreenVao);
    gl.uniform2f(uniforms.u_resolution, this.width, this.height);
    gl.uniform1f(uniforms.u_seed, (this.seed % 104729) / 104729);
    gl.uniform4f(uniforms.u_mixes, channels[0], channels[1], channels[2], channels[3]);
    gl.uniform1f(uniforms.u_relief, channels[4]);
    gl.uniform2f(uniforms.u_route, route[0], route[1]);
    gl.uniform1f(uniforms.u_fern_strength, this.fernStrength);
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
      if (cacheState) this._renderPaper(channels, route, cacheState);
      this._blitPaper();
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
          dpr: this.dpr
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
      Math.max(this.ambientFrameIntervalMs, 1000 / 10) :
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
      dpr: this.dpr
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
