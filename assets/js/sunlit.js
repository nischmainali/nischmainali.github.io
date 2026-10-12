/*
 * Lokta Sunlight page controller: day and night.
 *
 * Storage, the control, continuity across pages, and capability selection
 * live here. The renderer never observes scroll position; a fast fling cannot
 * pause or downgrade the light's clock.
 *
 * A change between day and night is one path (dusk or dawn) run forward, or
 * backward from wherever it is when the visitor changes their mind. The
 * renderer draws the light along it; this controller turns the page's ink
 * over at the measured moment and morphs the control with the light.
 */
(function() {
  'use strict';

  var THEME_KEY = 'sunlit-theme';
  var EPOCH_KEY = 'sunlit-motion-epoch';
  var CHANGE_KEY = 'sunlit-change-v3';
  var HANDOFF_FRAME_KEY = 'sunlit-handoff-frame-v1';
  var HANDOFF_FRAME_VERSION = 2;
  var CHANGE_MS = 1800;
  var REDUCED_CHANGE_MS = 480;
  /* The ink turns over where light and dark text are equally legible
   * against what is actually behind the words (measured in the lab). */
  var INK_FROM = 0.385;
  var INK_TO = 0.455;

  var scene = document.getElementById('sunlit-scene');
  var canvas = document.getElementById('sunlit-canvas');
  var themeButton = document.getElementById('theme-toggle');
  var favicon = document.getElementById('sunlit-favicon');
  if (!scene || !canvas) return;

  var root = document.documentElement;
  var icon = {
    rays: document.getElementById('sunlit-icon-rays'),
    disc: document.getElementById('sunlit-icon-disc'),
    bite: document.getElementById('sunlit-icon-bite')
  };

  var worker = null;
  var renderer = null;
  var tier = 'poster';
  var transferred = false;
  var readyTimer = 0;
  var handoffTimer = 0;
  var resizeFrame = 0;
  var resizeSettleTimer = 0;
  var fallbackPromise = null;
  var disposed = false;
  var lastWidth = 0;
  var lastHeight = 0;
  var lastDpr = 0;
  var snapshotRequestId = 0;
  var snapshotInFlight = false;
  var snapshotQueued = false;
  var snapshotTimers = [];
  var snapshotHeartbeatTimer = 0;
  var latestHandoffFrame = null;
  var pendingSnapshots = Object.create(null);
  var change = null;
  var changeFrame = 0;
  var shownNight = null;
  var shownMix = -1;

  function storageGet(storage, key) {
    try {
      return storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function storageSet(storage, key, value) {
    try {
      storage.setItem(key, String(value));
    } catch (error) {
      // The complete poster and default state do not require storage.
    }
  }

  function storageRemove(storage, key) {
    try {
      storage.removeItem(key);
    } catch (error) {
      // Nothing to remove when storage is unavailable.
    }
  }

  function readJson(storage, key) {
    var source = storageGet(storage, key);
    if (!source) return null;
    try {
      return JSON.parse(source);
    } catch (error) {
      return null;
    }
  }

  function finiteNumber(value, fallback) {
    value = Number(value);
    return isFinite(value) ? value : fallback;
  }

  function clamp(value, minimum, maximum) {
    if (minimum === undefined) minimum = 0;
    if (maximum === undefined) maximum = 1;
    return Math.min(maximum, Math.max(minimum, value));
  }

  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  function parseHexColor(value) {
    var match = String(value || '').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) return null;
    var source = match[1];
    if (source.length === 3) {
      source = source.charAt(0) + source.charAt(0) +
        source.charAt(1) + source.charAt(1) +
        source.charAt(2) + source.charAt(2);
    }
    return [
      parseInt(source.slice(0, 2), 16) / 255,
      parseInt(source.slice(2, 4), 16) / 255,
      parseInt(source.slice(4, 6), 16) / 255
    ];
  }

  function readInkPaper() {
    var styles = window.getComputedStyle(root);
    return {
      color: parseHexColor(styles.getPropertyValue('--sunlit-ink-paper')) || [0.989, 0.986, 0.975],
      strength: clamp(finiteNumber(styles.getPropertyValue('--sunlit-ink-strength'), 0))
    };
  }

  /* ---------- Timing, shared with the renderer ---------- */

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

  var ease = bezier(0.45, 0.05, 0.2, 1);

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

  function changeTarget(value) {
    return (value.path === 'dusk') === (value.dir > 0) ? 'night' : 'day';
  }

  /* Where a change is now: x along its path, p from day (0) to night (1). */
  function changePosition(value, nowMs) {
    var x = clamp(value.x0 + value.dir * (nowMs - value.startTimeMs) / value.durationMs);
    var done = value.dir > 0 ? x >= 1 : x <= 0;
    var p;
    if (value.reduced) p = value.path === 'dusk' ? x : 1 - x;
    else p = value.path === 'dusk' ? along(x, true) : along(x, false);
    return { x: x, p: p, done: done };
  }

  function normalizeChange(value) {
    if (!value || typeof value !== 'object') return null;
    var startTimeMs = finiteNumber(value.startTimeMs, 0);
    if (!(startTimeMs > 0)) return null;
    return {
      path: value.path === 'dawn' ? 'dawn' : 'dusk',
      x0: clamp(finiteNumber(value.x0, 0)),
      dir: Number(value.dir) < 0 ? -1 : 1,
      startTimeMs: startTimeMs,
      durationMs: Math.max(1, finiteNumber(value.durationMs, CHANGE_MS)),
      reduced: Boolean(value.reduced)
    };
  }

  /* ---------- The visitor's choice ---------- */

  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reducedMotion = Boolean(reducedQuery && reducedQuery.matches);

  /* An explicit choice wins; Shade and Sunset from the earlier design are
   * read as day and night. Without one, the light follows the system. */
  function storedChoice() {
    var value = storageGet(localStorage, THEME_KEY);
    if (value === 'night' || value === 'sunset' || value === 'dark') return 'night';
    if (value === 'day' || value === 'shade') return 'day';
    return null;
  }

  function systemTheme() {
    return darkQuery && darkQuery.matches ? 'night' : 'day';
  }

  function getEpoch(now) {
    var stored = finiteNumber(storageGet(sessionStorage, EPOCH_KEY), 0);
    if (stored > 0 && stored <= now) return stored;
    storageSet(sessionStorage, EPOCH_KEY, now);
    return now;
  }

  /* Soft light needs fewer pixels than type: up to the display's density,
   * within a budget that keeps very large retina screens comfortable. */
  function getViewport() {
    var width = Math.max(1, Math.round(root.clientWidth || window.innerWidth || 1));
    var height = Math.max(1, Math.round(window.innerHeight || root.clientHeight || 1));
    var dpr = Math.min(2, Math.max(0.5, finiteNumber(window.devicePixelRatio, 1)));
    var maximumPixels = 5200000;
    if (width * height * dpr * dpr > maximumPixels) {
      dpr = Math.max(0.5, Math.sqrt(maximumPixels / (width * height)));
    }
    return { width: width, height: height, dpr: dpr };
  }

  var theme = storedChoice() || systemTheme();
  var epochMs = getEpoch(Date.now());

  function activeChange() {
    var saved = normalizeChange(readJson(sessionStorage, CHANGE_KEY));
    if (!saved || changeTarget(saved) !== theme || changePosition(saved, Date.now()).done) {
      storageRemove(sessionStorage, CHANGE_KEY);
      return null;
    }
    return saved;
  }

  /* ---------- The page in a light ---------- */

  function setNight(night) {
    if (night === shownNight) return;
    shownNight = night;
    var value = night ? 'night' : 'day';
    root.setAttribute('data-sunlit-mode', value);
    document.body.classList.toggle('night', night);
    document.body.setAttribute('data-theme', value);
    if (favicon) favicon.href = favicon.getAttribute(night ? 'data-night-href' : 'data-day-href');
  }

  /* The ink turns over in a short blend while the room passes mid-tone. */
  function setInkMix(mix) {
    var rounded = Math.round(mix * 50) / 50;
    if (rounded === shownMix) return;
    shownMix = rounded;
    var blending = rounded > 0 && rounded < 1;
    document.body.classList.toggle('ink-mixing', blending);
    if (blending) document.body.style.setProperty('--ink-mix', String(rounded));
    else document.body.style.removeProperty('--ink-mix');
  }

  /* The control changes with the light: the sun's rays draw in and turn,
   * the disc swells, and the crescent's shadow slides across it. */
  function drawIcon(p) {
    if (!icon.rays || !icon.disc || !icon.bite) return;
    var drawIn = function(a, b, x) {
      var t = clamp((x - a) / (b - a));
      return 1 - Math.pow(1 - t, 3);
    };
    var rays = drawIn(0, 0.45, p);
    var disc = smooth(0.2, 0.65, p);
    var bite = drawIn(0.35, 0.9, p);
    icon.rays.setAttribute('transform', 'rotate(' + (28 * rays).toFixed(2) + ') scale(' + (1 - 0.45 * rays).toFixed(3) + ')');
    icon.rays.setAttribute('opacity', (1 - rays).toFixed(3));
    icon.disc.setAttribute('r', (4.3 + 3.1 * disc).toFixed(3));
    icon.bite.setAttribute('cx', (14 - 10.4 * bite).toFixed(3));
    icon.bite.setAttribute('cy', (-12 + 9 * bite).toFixed(3));
  }

  function showPosition(p) {
    var ink = smooth(INK_FROM, INK_TO, p);
    setNight(ink >= 0.5);
    setInkMix(ink);
    drawIcon(p);
  }

  function applyThemeControl() {
    if (!themeButton) return;
    var night = theme === 'night';
    themeButton.setAttribute('aria-pressed', String(night));
    themeButton.setAttribute('aria-label', night ? 'Switch to day' : 'Switch to night');
  }

  function stepChange() {
    changeFrame = 0;
    if (disposed) return;
    if (!change) {
      showPosition(theme === 'night' ? 1 : 0);
      return;
    }
    var position = changePosition(change, Date.now());
    if (position.done) {
      change = null;
      storageRemove(sessionStorage, CHANGE_KEY);
      showPosition(theme === 'night' ? 1 : 0);
      return;
    }
    showPosition(position.p);
    changeFrame = window.requestAnimationFrame(stepChange);
  }

  function runChange() {
    if (changeFrame) window.cancelAnimationFrame(changeFrame);
    changeFrame = 0;
    stepChange();
  }

  /* ---------- Continuity frames ---------- */

  function releaseHandoffFrame() {
    root.classList.remove('sunlit-has-handoff');
    root.removeAttribute('data-sunlit-handoff');
    root.removeAttribute('data-sunlit-handoff-theme');
    root.style.removeProperty('--sunlit-handoff-frame');
  }

  function snapshotMetadata() {
    var viewport = getViewport();
    return {
      version: HANDOFF_FRAME_VERSION,
      theme: theme,
      ink: root.getAttribute('data-ink') || 'lokta-hybrid',
      cssWidth: viewport.width,
      cssHeight: viewport.height,
      capturedAt: Date.now()
    };
  }

  function finishSnapshotCapture() {
    snapshotInFlight = false;
    if (!snapshotQueued || disposed) return;
    snapshotQueued = false;
    window.setTimeout(requestHandoffSnapshot, 40);
  }

  function acceptSnapshot(message) {
    var metadata = pendingSnapshots[message.requestId];
    delete pendingSnapshots[message.requestId];
    if (!metadata || !message.blob || message.blob.size <= 0 ||
        message.blob.size > 900000 || typeof window.FileReader !== 'function') {
      finishSnapshotCapture();
      return;
    }
    var reader = new window.FileReader();
    reader.onload = function() {
      var dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl.indexOf('data:image/') === 0 && dataUrl.length <= 1200000) {
        metadata.dataUrl = dataUrl;
        metadata.pixelWidth = Number(message.width) || 0;
        metadata.pixelHeight = Number(message.height) || 0;
        latestHandoffFrame = metadata;
        persistHandoffFrame();
      }
      finishSnapshotCapture();
    };
    reader.onerror = finishSnapshotCapture;
    reader.readAsDataURL(message.blob);
  }

  function rejectSnapshot(message) {
    delete pendingSnapshots[message.requestId];
    finishSnapshotCapture();
  }

  function captureMainThreadSnapshot(requestId, metadata) {
    if (!renderer || !canvas || typeof canvas.toDataURL !== 'function') {
      delete pendingSnapshots[requestId];
      finishSnapshotCapture();
      return;
    }
    try {
      renderer.renderFrame(Date.now());
      var sourceWidth = Math.max(1, canvas.width || 1);
      var sourceHeight = Math.max(1, canvas.height || 1);
      var scale = Math.min(1, Math.sqrt(600000 / (sourceWidth * sourceHeight)));
      var width = Math.max(1, Math.round(sourceWidth * scale));
      var height = Math.max(1, Math.round(sourceHeight * scale));
      var snapshot = document.createElement('canvas');
      snapshot.width = width;
      snapshot.height = height;
      var context = snapshot.getContext('2d', { alpha: false });
      if (!context || typeof snapshot.toBlob !== 'function') {
        throw new Error('The continuity frame needs canvas encoding support');
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'medium';
      context.drawImage(canvas, 0, 0, width, height);
      snapshot.toBlob(function(blob) {
        acceptSnapshot({ requestId: requestId, blob: blob, width: width, height: height });
      }, 'image/webp', 0.64);
    } catch (error) {
      delete pendingSnapshots[requestId];
      finishSnapshotCapture();
    }
  }

  function requestHandoffSnapshot() {
    if (disposed || (!worker && !renderer)) return;
    if (snapshotInFlight) {
      snapshotQueued = true;
      return;
    }
    snapshotRequestId += 1;
    var requestId = snapshotRequestId;
    var metadata = snapshotMetadata();
    pendingSnapshots[requestId] = metadata;
    snapshotInFlight = true;
    if (worker) {
      worker.postMessage({
        type: 'snapshot',
        requestId: requestId,
        nowMs: metadata.capturedAt,
        maximumPixels: 600000,
        quality: 0.64
      });
    } else {
      captureMainThreadSnapshot(requestId, metadata);
    }
  }

  function scheduleHandoffSnapshot(delayMs) {
    snapshotTimers.push(window.setTimeout(requestHandoffSnapshot, Math.max(0, Number(delayMs) || 0)));
  }

  function scheduleSnapshotHeartbeat() {
    window.clearTimeout(snapshotHeartbeatTimer);
    snapshotHeartbeatTimer = 0;
    if (disposed || document.hidden) return;
    /* Keep the saved surface close to the live clock, so a later reload or
     * navigation never resumes from a frame captured minutes earlier. */
    snapshotHeartbeatTimer = window.setTimeout(function() {
      snapshotHeartbeatTimer = 0;
      requestHandoffSnapshot();
      scheduleSnapshotHeartbeat();
    }, 1600);
  }

  function persistHandoffFrame() {
    if (!latestHandoffFrame) return;
    latestHandoffFrame.storedAt = Date.now();
    storageSet(sessionStorage, HANDOFF_FRAME_KEY, JSON.stringify(latestHandoffFrame));
  }

  /* ---------- The renderer ---------- */

  function reveal() {
    if (disposed) return;
    window.clearTimeout(readyTimer);
    readyTimer = 0;
    scene.classList.remove('is-fallback');
    scene.classList.remove('is-handoff-complete');
    scene.classList.add('is-live');
    window.clearTimeout(handoffTimer);
    handoffTimer = window.setTimeout(function() {
      if (!disposed && scene.classList.contains('is-live')) {
        scene.classList.add('is-handoff-complete');
        releaseHandoffFrame();
      }
    }, 220);
    scene.setAttribute('data-renderer-tier', tier);
    scheduleHandoffSnapshot(60);
    scheduleSnapshotHeartbeat();
    if (window.performance && typeof window.performance.mark === 'function') {
      window.performance.mark('lokta-sunlight-ready');
    }
  }

  function showPoster() {
    window.clearTimeout(handoffTimer);
    handoffTimer = 0;
    scene.classList.remove('is-live');
    scene.classList.remove('is-handoff-complete');
  }

  function settleOnPoster() {
    tier = 'poster';
    showPoster();
    scene.classList.add('is-fallback');
    scene.setAttribute('data-renderer-tier', tier);
  }

  function replaceTransferredCanvas() {
    if (!transferred) return;
    var replacement = document.createElement('canvas');
    replacement.id = 'sunlit-canvas';
    replacement.setAttribute('aria-hidden', 'true');
    canvas.replaceWith(replacement);
    canvas = replacement;
    transferred = false;
  }

  function absoluteUrl(value) {
    if (!value) return '';
    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return value;
    }
  }

  function initialOptions() {
    var viewport = getViewport();
    var inkPaper = readInkPaper();
    lastWidth = viewport.width;
    lastHeight = viewport.height;
    lastDpr = viewport.dpr;
    return {
      width: viewport.width,
      height: viewport.height,
      dpr: viewport.dpr,
      maxDpr: 2,
      ambientFps: 30,
      epochMs: epochMs,
      theme: theme,
      change: change,
      reducedMotion: reducedMotion,
      inkPaper: inkPaper.color,
      inkPaperStrength: inkPaper.strength,
      leafUrl: absoluteUrl(scene.getAttribute('data-leaf-src')),
      visible: !document.hidden,
      autoStart: true
    };
  }

  function loadRenderer(source) {
    if (window.SunlitRenderer) return Promise.resolve(window.SunlitRenderer);
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = source;
      script.async = true;
      script.onload = function() {
        if (window.SunlitRenderer) resolve(window.SunlitRenderer);
        else reject(new Error('The environmental renderer did not initialize'));
      };
      script.onerror = function() {
        reject(new Error('The environmental renderer could not be loaded'));
      };
      document.head.appendChild(script);
    });
  }

  function stopWorker() {
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    worker.terminate();
    worker = null;
    pendingSnapshots = Object.create(null);
    snapshotInFlight = false;
    snapshotQueued = false;
  }

  function failMainRenderer() {
    var failed = renderer;
    renderer = null;
    if (failed) {
      try { failed.stop(); } catch (error) {}
      try { failed.dispose(); } catch (error) {}
    }
    settleOnPoster();
  }

  function mainThreadFallback() {
    if (disposed || renderer || fallbackPromise) return fallbackPromise;
    stopWorker();
    window.clearTimeout(readyTimer);
    showPoster();
    replaceTransferredCanvas();
    tier = 'main';
    fallbackPromise = loadRenderer(scene.getAttribute('data-engine-src')).then(function(api) {
      if (disposed) return;
      var options = initialOptions();
      options.onReady = reveal;
      options.onError = function() { window.setTimeout(failMainRenderer, 0); };
      options.onContextLost = showPoster;
      options.onContextRestored = function() { reveal(); };
      try {
        renderer = api.create(canvas, options);
      } catch (error) {
        renderer = null;
        settleOnPoster();
      }
    }).catch(settleOnPoster);
    return fallbackPromise;
  }

  function startWorker() {
    if (!window.Worker || !canvas.transferControlToOffscreen) {
      mainThreadFallback();
      return;
    }
    try {
      worker = new Worker(scene.getAttribute('data-worker-src'));
      tier = 'worker';
      worker.onmessage = function(event) {
        var message = event.data || {};
        if (message.type === 'ready') reveal();
        if (message.type === 'snapshot') acceptSnapshot(message);
        if (message.type === 'snapshot-failed') rejectSnapshot(message);
        if (message.type === 'context-lost') showPoster();
        if (message.type === 'context-restored') reveal();
        if (message.type === 'error') mainThreadFallback();
      };
      worker.onerror = function() {
        mainThreadFallback();
      };
      var offscreen = canvas.transferControlToOffscreen();
      transferred = true;
      worker.postMessage({
        type: 'init',
        canvas: offscreen,
        engineUrl: absoluteUrl(scene.getAttribute('data-engine-src')),
        options: initialOptions()
      }, [offscreen]);
      readyTimer = window.setTimeout(function() {
        if (!scene.classList.contains('is-live')) mainThreadFallback();
      }, 3600);
    } catch (error) {
      mainThreadFallback();
    }
  }

  function postResize(viewport) {
    if (worker) {
      worker.postMessage({ type: 'resize', width: viewport.width, height: viewport.height, dpr: viewport.dpr });
    } else if (renderer) {
      renderer.resize(viewport.width, viewport.height, viewport.dpr);
    }
  }

  function scheduleResize(force) {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(function() {
      resizeFrame = 0;
      var viewport = getViewport();
      var widthChanged = Math.abs(viewport.width - lastWidth) > 1;
      var dprChanged = Math.abs(viewport.dpr - lastDpr) > 0.01;
      var meaningfulHeight = Math.abs(viewport.height - lastHeight) > 96;
      if (!force && !widthChanged && !dprChanged && !meaningfulHeight) {
        window.clearTimeout(resizeSettleTimer);
        resizeSettleTimer = window.setTimeout(function() {
          if (disposed) return;
          var settled = getViewport();
          if (Math.abs(settled.height - lastHeight) <= 1) return;
          lastWidth = settled.width;
          lastHeight = settled.height;
          lastDpr = settled.dpr;
          postResize(settled);
        }, 180);
        return;
      }
      window.clearTimeout(resizeSettleTimer);
      lastWidth = viewport.width;
      lastHeight = viewport.height;
      lastDpr = viewport.dpr;
      postResize(viewport);
    });
  }

  function sendTheme(value, nowMs) {
    if (worker) {
      worker.postMessage({ type: 'theme', theme: value, nowMs: nowMs, change: change });
    } else if (renderer) {
      renderer.setTheme(value, { nowMs: nowMs, change: change });
    }
  }

  function sendReduced(value, at) {
    if (worker) worker.postMessage({ type: 'reduced-motion', reduced: value, nowMs: at });
    else if (renderer) renderer.setReducedMotion(value, at);
  }

  function sendVisibility(value) {
    if (worker) worker.postMessage({ type: 'visibility', visible: value });
    else if (renderer) renderer.setVisible(value);
  }

  function sendInkPaper() {
    var inkPaper = readInkPaper();
    if (worker) {
      worker.postMessage({ type: 'ink-paper', color: inkPaper.color, strength: inkPaper.strength });
    } else if (renderer) {
      renderer.setInkPaper(inkPaper.color, inkPaper.strength);
    }
    scheduleHandoffSnapshot(140);
  }

  /* ---------- Changing the light ---------- */

  function changeTo(next, remember) {
    if (next === theme && !change) return;
    var nowMs = Date.now();
    if (reducedMotion) {
      /* No morph: the old light fades over the new. */
      change = {
        path: next === 'night' ? 'dusk' : 'dawn',
        x0: 0,
        dir: 1,
        startTimeMs: nowMs,
        durationMs: REDUCED_CHANGE_MS,
        reduced: true
      };
    } else if (change && !change.reduced && changeTarget(change) !== next &&
        !changePosition(change, nowMs).done) {
      /* A change of mind: turn back along the same path, never a jump. */
      change = {
        path: change.path,
        x0: changePosition(change, nowMs).x,
        dir: -change.dir,
        startTimeMs: nowMs,
        durationMs: CHANGE_MS,
        reduced: false
      };
    } else {
      change = {
        path: next === 'night' ? 'dusk' : 'dawn',
        x0: 0,
        dir: 1,
        startTimeMs: nowMs,
        durationMs: CHANGE_MS,
        reduced: false
      };
    }
    theme = next;
    if (remember) storageSet(localStorage, THEME_KEY, theme);
    storageSet(sessionStorage, CHANGE_KEY, JSON.stringify(change));
    applyThemeControl();
    sendTheme(theme, nowMs);
    runChange();
    [90, 700, 1300, 1950, 2600].forEach(scheduleHandoffSnapshot);
  }

  function toggleTheme() {
    changeTo(theme === 'night' ? 'day' : 'night', true);
  }

  function systemThemeChanged() {
    if (storedChoice()) return;
    changeTo(systemTheme(), false);
  }

  function motionPreferenceChanged(event) {
    reducedMotion = Boolean(event.matches);
    sendReduced(reducedMotion, Date.now());
  }

  function listen(query, handler) {
    if (!query) return;
    if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
    else if (typeof query.addListener === 'function') query.addListener(handler);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(readyTimer);
    window.clearTimeout(handoffTimer);
    window.clearTimeout(resizeSettleTimer);
    snapshotTimers.forEach(function(timer) {
      window.clearTimeout(timer);
    });
    snapshotTimers = [];
    window.clearTimeout(snapshotHeartbeatTimer);
    snapshotHeartbeatTimer = 0;
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    if (changeFrame) window.cancelAnimationFrame(changeFrame);
    if (worker) {
      worker.postMessage({ type: 'dispose' });
      stopWorker();
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  }

  change = activeChange();
  applyThemeControl();
  runChange();
  if (themeButton) themeButton.addEventListener('click', toggleTheme);
  window.addEventListener('lokta:inkchange', sendInkPaper);
  listen(darkQuery, systemThemeChanged);
  listen(reducedQuery, motionPreferenceChanged);

  window.addEventListener('resize', function() { scheduleResize(false); }, { passive: true });
  window.addEventListener('orientationchange', function() { scheduleResize(true); });
  document.addEventListener('visibilitychange', function() {
    sendVisibility(!document.hidden);
    if (document.hidden) {
      window.clearTimeout(snapshotHeartbeatTimer);
      snapshotHeartbeatTimer = 0;
      persistHandoffFrame();
    } else {
      scheduleHandoffSnapshot(80);
      scheduleSnapshotHeartbeat();
    }
  });
  window.addEventListener('pagehide', function(event) {
    persistHandoffFrame();
    if (!event.persisted) dispose();
    else sendVisibility(false);
  });
  window.addEventListener('pageshow', function(event) {
    if (!event.persisted) return;
    sendVisibility(true);
    scheduleResize(true);
  });

  startWorker();
})();
