/*
 * Lokta Sunlight page controller.
 *
 * Storage, controls, continuity, and capability selection live here. The
 * renderer never observes scroll position; a fast fling cannot pause or
 * downgrade the environmental clock.
 */
(function() {
  'use strict';

  var THEME_KEY = 'sunlit-theme';
  var EPOCH_KEY = 'sunlit-motion-epoch';
  var SEED_KEY = 'sunlit-scene-seed';
  var TRANSITION_KEY = 'sunlit-transition-v2';
  var TRANSITION_CHANNEL_COUNT = 5;
  /* Channel order: shutter aperture, plane, optical diffusion, sunset,
   * paper relief. The diffusion channel remains serialized so transitions
   * already in flight survive a page change, although the ray blur is fixed. */
  var TRANSITION_DURATIONS = {
    shade: [500, 1200, 1800, 3000, 2400],
    sunset: [500, 1200, 1800, 3000, 4800]
  };
  var TRANSITION_DELAYS = {
    shade: [0, 0, 0, 0, 0],
    sunset: [0, 0, 0, 0, 550]
  };

  var scene = document.getElementById('sunlit-scene');
  var canvas = document.getElementById('sunlit-canvas');
  var themeButton = document.getElementById('theme-toggle');
  var favicon = document.getElementById('sunlit-favicon');
  if (!scene || !canvas) return;

  var worker = null;
  var renderer = null;
  var tier = 'poster';
  var transferred = false;
  var readyTimer = 0;
  var handoffTimer = 0;
  var resizeFrame = 0;
  var resizeSettleTimer = 0;
  var fallbackPromise = null;
  var stateRequestId = 0;
  var pendingState = Object.create(null);
  var disposed = false;
  var themeGeneration = 0;
  var lastWidth = 0;
  var lastHeight = 0;
  var lastDpr = 0;

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
    var styles = window.getComputedStyle(document.documentElement);
    return {
      color: parseHexColor(styles.getPropertyValue('--sunlit-ink-paper')) ||
        [0.989, 0.986, 0.975],
      strength: Math.max(0, Math.min(1, finiteNumber(
        styles.getPropertyValue('--sunlit-ink-strength'), 0
      )))
    };
  }

  function normalizeTheme(value) {
    return value === 'sunset' || value === 'dark' ? 'sunset' : 'shade';
  }

  function transitionEndTime(value, startTimeMs, fromValues) {
    var target = value === 'sunset' ? 1 : 0;
    var durations = TRANSITION_DURATIONS[value];
    var delays = TRANSITION_DELAYS[value];
    var hasValues = Array.isArray(fromValues) && fromValues.length === TRANSITION_CHANNEL_COUNT;
    var remainingMs = 0;
    for (var index = 0; index < TRANSITION_CHANNEL_COUNT; index += 1) {
      var distance = 1;
      if (hasValues) {
        var from = Math.max(0, Math.min(1, finiteNumber(fromValues[index], 1 - target)));
        distance = Math.abs(target - from);
      }
      remainingMs = Math.max(remainingMs, (durations[index] + delays[index]) * distance);
    }
    return startTimeMs + remainingMs;
  }

  function getEpoch(now) {
    var stored = finiteNumber(storageGet(sessionStorage, EPOCH_KEY), 0);
    if (stored > 0 && stored <= now) return stored;
    storageSet(sessionStorage, EPOCH_KEY, now);
    return now;
  }

  function getSeed() {
    var stored = finiteNumber(storageGet(sessionStorage, SEED_KEY), 0);
    if (stored > 0) return stored >>> 0;
    var value = 0;
    try {
      var values = new Uint32Array(1);
      crypto.getRandomValues(values);
      value = values[0];
    } catch (error) {
      value = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    }
    if (!value) value = 0x4c4f4b54;
    storageSet(sessionStorage, SEED_KEY, value);
    return value;
  }

  function getViewport() {
    var width = Math.max(1, Math.round(document.documentElement.clientWidth || window.innerWidth || 1));
    var height = Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight || 1));
    var dpr = Math.min(1, Math.max(0.5, finiteNumber(window.devicePixelRatio, 1)));
    var maximumPixels = 2304000;
    if (width * height * dpr * dpr > maximumPixels) {
      dpr = Math.max(0.5, Math.sqrt(maximumPixels / (width * height)));
    }
    return { width: width, height: height, dpr: dpr };
  }

  var now = Date.now();
  var theme = normalizeTheme(storageGet(localStorage, THEME_KEY));
  var route = scene.getAttribute('data-route') || 'home';
  var epochMs = getEpoch(now);
  var seed = getSeed();
  var reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reducedMotion = Boolean(reducedQuery && reducedQuery.matches);

  function activeTransition() {
    var saved = readJson(sessionStorage, TRANSITION_KEY);
    if (!saved) return null;
    if (normalizeTheme(saved.to) !== theme) {
      storageRemove(sessionStorage, TRANSITION_KEY);
      return null;
    }
    var startTimeMs = finiteNumber(saved.startTimeMs, 0);
    var currentNow = Date.now();
    var endTimeMs = finiteNumber(
      saved.endTimeMs,
      transitionEndTime(theme, startTimeMs, saved.fromValues)
    );
    if (startTimeMs <= 0 || currentNow < startTimeMs || currentNow > endTimeMs) {
      storageRemove(sessionStorage, TRANSITION_KEY);
      return null;
    }
    return {
      from: normalizeTheme(saved.from),
      to: theme,
      startTimeMs: startTimeMs,
      fromValues: Array.isArray(saved.fromValues) &&
        saved.fromValues.length === TRANSITION_CHANNEL_COUNT ? saved.fromValues : null,
      endTimeMs: endTimeMs,
      nowMs: currentNow
    };
  }

  function applyThemeVisual(value) {
    var isSunset = value === 'sunset';
    document.body.classList.toggle('sunset', isSunset);
    document.body.setAttribute('data-theme', value);
  }

  function applyThemeControl(value) {
    var isSunset = value === 'sunset';
    if (favicon) {
      favicon.href = favicon.getAttribute(isSunset ? 'data-sunset-href' : 'data-shade-href');
    }
    if (!themeButton) return;
    themeButton.setAttribute('aria-pressed', String(isSunset));
    themeButton.setAttribute('aria-label', isSunset ? 'Switch to daylight' : 'Switch to sunset');
  }

  function applyThemeState(value) {
    applyThemeVisual(value);
    applyThemeControl(value);
  }

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
        /* Keep the saved source poster beneath the resuming canvas until the
         * opaque WebGL frame has completed its short fade. Changing the body
         * first exposes the target poster through that fade as a color pulse. */
        applyThemeVisual(theme);
        scene.classList.add('is-handoff-complete');
      }
    }, 220);
    scene.setAttribute('data-renderer-tier', tier);
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
    applyThemeState(theme);
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
      maxDpr: 1,
      /* The grain source itself has twenty discrete states per second. */
      ambientFps: 20,
      transitionFps: 60,
      seed: seed,
      epochMs: epochMs,
      theme: theme,
      route: route,
      reducedMotion: reducedMotion,
      fernStrength: Math.max(0, Math.min(1, finiteNumber(
        scene.getAttribute('data-fern-strength'), 0
      ))),
      inkPaper: inkPaper.color,
      inkPaperStrength: inkPaper.strength,
      visible: !document.hidden,
      transition: activeTransition(),
      nowMs: Date.now(),
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

  function resolvePendingState(message) {
    var pending = pendingState[message.requestId];
    if (!pending) return;
    window.clearTimeout(pending.timer);
    delete pendingState[message.requestId];
    pending.resolve(message.state || null);
  }

  function queryState() {
    if (renderer) return Promise.resolve(renderer.getState(Date.now()));
    if (!worker) return Promise.resolve(null);
    return new Promise(function(resolve) {
      stateRequestId += 1;
      var requestId = stateRequestId;
      var timer = window.setTimeout(function() {
        delete pendingState[requestId];
        resolve(null);
      }, 180);
      pendingState[requestId] = { resolve: resolve, timer: timer };
      worker.postMessage({ type: 'state', requestId: requestId, nowMs: Date.now() });
    });
  }

  function clearPendingState() {
    Object.keys(pendingState).forEach(function(key) {
      window.clearTimeout(pendingState[key].timer);
      pendingState[key].resolve(null);
      delete pendingState[key];
    });
  }

  function stopWorker() {
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    worker.terminate();
    worker = null;
    clearPendingState();
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
      return api.generateNoiseDataAsync(options.seed).then(function(noiseData) {
        if (disposed) return;
        var latestInkPaper = readInkPaper();
        options.noiseData = noiseData;
        options.inkPaper = latestInkPaper.color;
        options.inkPaperStrength = latestInkPaper.strength;
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
      });
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
        if (message.type === 'state') resolvePendingState(message);
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
        engineUrl: scene.getAttribute('data-engine-src'),
        options: initialOptions()
      }, [offscreen]);
      readyTimer = window.setTimeout(function() {
        if (!scene.classList.contains('is-live')) mainThreadFallback();
      }, 3200);
    } catch (error) {
      mainThreadFallback();
    }
  }

  function postResize(viewport) {
    if (worker) {
      worker.postMessage({
        type: 'resize',
        width: viewport.width,
        height: viewport.height,
        dpr: viewport.dpr
      });
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

  function sendTheme(value, startTimeMs, fromValues) {
    if (worker) {
      worker.postMessage({
        type: 'theme',
        theme: value,
        nowMs: startTimeMs,
        startTimeMs: startTimeMs,
        fromValues: fromValues || null
      });
    } else if (renderer) {
      renderer.setTheme(value, {
        nowMs: startTimeMs,
        startTimeMs: startTimeMs,
        fromValues: fromValues || null
      });
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
      worker.postMessage({
        type: 'ink-paper',
        color: inkPaper.color,
        strength: inkPaper.strength
      });
    } else if (renderer) {
      renderer.setInkPaper(inkPaper.color, inkPaper.strength);
    }
  }

  function changeTheme() {
    var previous = theme;
    var next = theme === 'sunset' ? 'shade' : 'sunset';
    var startTimeMs = Date.now();
    var generation = ++themeGeneration;
    theme = next;
    storageSet(localStorage, THEME_KEY, theme);
    applyThemeState(theme);
    var statePromise = queryState();
    storageSet(sessionStorage, TRANSITION_KEY, JSON.stringify({
      from: previous,
      to: theme,
      startTimeMs: startTimeMs,
      fromValues: null,
      endTimeMs: transitionEndTime(theme, startTimeMs, null)
    }));
    sendTheme(theme, startTimeMs, null);

    statePromise.then(function(state) {
      if (generation !== themeGeneration) return;
      var fromValues = state && Array.isArray(state.values) &&
        state.values.length === TRANSITION_CHANNEL_COUNT ? state.values : null;
      storageSet(sessionStorage, TRANSITION_KEY, JSON.stringify({
        from: previous,
        to: theme,
        startTimeMs: startTimeMs,
        fromValues: fromValues,
        endTimeMs: transitionEndTime(theme, startTimeMs, fromValues)
      }));
    });
  }

  function motionPreferenceChanged(event) {
    reducedMotion = Boolean(event.matches);
    sendReduced(reducedMotion, Date.now());
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(readyTimer);
    window.clearTimeout(handoffTimer);
    window.clearTimeout(resizeSettleTimer);
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    clearPendingState();
    if (worker) {
      worker.postMessage({ type: 'dispose' });
      stopWorker();
    }
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  }

  var startingTransition = activeTransition();
  var prepaintTheme = document.body.classList.contains('sunset') ? 'sunset' : 'shade';
  applyThemeVisual(startingTransition ? prepaintTheme : theme);
  applyThemeControl(theme);
  if (themeButton) themeButton.addEventListener('click', changeTheme);
  window.addEventListener('lokta:inkchange', sendInkPaper);

  window.addEventListener('resize', function() { scheduleResize(false); }, { passive: true });
  window.addEventListener('orientationchange', function() { scheduleResize(true); });
  document.addEventListener('visibilitychange', function() {
    sendVisibility(!document.hidden);
  });
  window.addEventListener('pagehide', function(event) {
    if (!event.persisted) dispose();
    else sendVisibility(false);
  });
  window.addEventListener('pageshow', function(event) {
    if (!event.persisted) return;
    sendVisibility(true);
    scheduleResize(true);
  });

  if (reducedQuery) {
    if (typeof reducedQuery.addEventListener === 'function') {
      reducedQuery.addEventListener('change', motionPreferenceChanged);
    } else if (typeof reducedQuery.addListener === 'function') {
      reducedQuery.addListener(motionPreferenceChanged);
    }
  }

  startWorker();
})();
