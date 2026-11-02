/*
 * The garden grows in.
 *
 * Once a session for each part of a page's garden: the head, or a shorter
 * sheet's whole garden, on arrival; a note's foot when it comes into view.
 * The growth is drawn on a canvas laid over the garden from its two masks
 * and its growth map, which says how far along the stems from the roots each
 * part lies: the stems run out from the roots, the leaves open as they reach
 * them, the flowers a moment later. Then the canvas gives way to the static
 * print, which is the same garden. Reduced motion, a garden already seen
 * this session, or a browser without WebGL shows the garden at once.
 */
(function() {
  'use strict';

  var root = document.documentElement;
  var KEY = 'garden-grown-v1';
  var DURATION_MS = 2800;
  var gardens = Array.prototype.slice.call(document.querySelectorAll('.garden[data-growth]'));
  if (!gardens.length) return;
  root.classList.add('garden-live');

  var seen = {};
  try {
    seen = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {};
  } catch (error) {
    seen = {};
  }

  function remember(key) {
    seen[key] = 1;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(seen));
    } catch (error) {
      // Without storage the garden grows again on the next visit.
    }
  }

  function show(garden) {
    garden.classList.add('is-grown');
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 1180px)').matches;

  function key(garden) {
    return location.pathname + '#' + garden.getAttribute('data-garden');
  }

  /* The growth map for the width the page is at, as garden.css picks it. */
  function growthUrl(garden) {
    var width = window.innerWidth >= 1400 ? '1440' : window.innerWidth >= 1240 ? '1300' : '1180';
    var entries = (garden.getAttribute('data-growth') || '').split(',');
    for (var i = 0; i < entries.length; i += 1) {
      var pair = entries[i].trim().split(' ');
      if (pair[0] === width) return pair[1];
    }
    return '';
  }

  function maskUrl(garden, name) {
    var value = getComputedStyle(garden).getPropertyValue(name);
    var match = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(value);
    return match ? match[1] : '';
  }

  function load(url) {
    return new Promise(function(resolve, reject) {
      var image = new Image();
      image.decoding = 'async';
      image.onload = function() { resolve(image); };
      image.onerror = reject;
      image.src = url;
    });
  }

  /* An ink as the browser resolves it, whatever its notation, with the share
   * the garden prints of it. */
  var probe = null;
  function ink(element, strength) {
    if (!probe) probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(element).backgroundColor;
    probe.fillRect(0, 0, 1, 1);
    var d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, strength];
  }

  var VERTEX = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*0.5+0.5,0.5-a.y*0.5);gl_Position=vec4(a,0.0,1.0);}';
  var FRAGMENT = [
    'precision mediump float;',
    'varying vec2 v;',
    'uniform sampler2D u_leaf;',
    'uniform sampler2D u_flower;',
    'uniform sampler2D u_birth;',
    'uniform float u_t;',
    'uniform vec4 u_leafInk;',
    'uniform vec4 u_flowerInk;',
    'void main() {',
    '  float b = texture2D(u_birth, v).r;',
    '  float l = texture2D(u_leaf, v).a * smoothstep(b, b + 0.05, u_t) * u_leafInk.a;',
    '  float f = texture2D(u_flower, v).a * smoothstep(b + 0.05, b + 0.13, u_t) * u_flowerInk.a;',
    '  gl_FragColor = vec4(u_flowerInk.rgb * f + u_leafInk.rgb * l * (1.0 - f), f + l * (1.0 - f));',
    '}'
  ].join('\n');

  function shader(gl, type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  }

  /* The masks are finer than most screens: WebGL2 filters them down as the
   * static print is, so the two match when the canvas gives way. */
  function texture(gl, unit, image) {
    var t = gl.createTexture();
    var mipmaps = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function grow(garden) {
    remember(key(garden));
    var urls = [maskUrl(garden, '--g-leaf'), maskUrl(garden, '--g-flower'), growthUrl(garden)];
    if (!urls[0] || !urls[1] || !urls[2]) { show(garden); return; }
    Promise.all(urls.map(load)).then(function(images) {
      var box = garden.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var canvas = document.createElement('canvas');
      canvas.className = 'garden__growth';
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      var attributes = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false };
      var gl = canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes);
      if (!gl) { show(garden); return; }
      var program = gl.createProgram();
      gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { show(garden); return; }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var a = gl.getAttribLocation(program, 'a');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ['u_leaf', 'u_flower', 'u_birth'].forEach(function(name, unit) {
        texture(gl, unit, images[unit]);
        gl.uniform1i(gl.getUniformLocation(program, name), unit);
      });
      /* The static print waits unseen while the garden grows, so its
       * strengths are read from the garden, not from the waiting layers. */
      var layers = garden.querySelectorAll('i');
      var style = getComputedStyle(garden);
      gl.uniform4fv(gl.getUniformLocation(program, 'u_leafInk'), ink(layers[0], parseFloat(style.getPropertyValue('--garden-leaf')) || 0.16));
      gl.uniform4fv(gl.getUniformLocation(program, 'u_flowerInk'), ink(layers[1], parseFloat(style.getPropertyValue('--garden-flower')) || 0.19));
      var time = gl.getUniformLocation(program, 'u_t');
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      garden.appendChild(canvas);
      var start = 0;
      function frame(now) {
        if (!start) start = now;
        var x = Math.min(1, (now - start) / DURATION_MS);
        /* Easing in and out, so the first stems are seen to start. */
        var t = 1.15 * x * x * (3 - 2 * x);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(time, t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (x < 1) {
          requestAnimationFrame(frame);
          return;
        }
        /* The static print takes over in the same frame: its masks are the
         * ones the canvas drew from, already decoded. */
        show(garden);
        canvas.remove();
        var lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
      requestAnimationFrame(frame);
    }).catch(function() {
      show(garden);
    });
  }

  gardens.forEach(function(garden) {
    if (reduced || !wide || seen[key(garden)] || !('IntersectionObserver' in window)) {
      show(garden);
      return;
    }
    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i += 1) {
        if (entries[i].isIntersecting) {
          observer.disconnect();
          grow(garden);
          return;
        }
      }
    }, { threshold: 0.2 });
    observer.observe(garden);
  });
})();
