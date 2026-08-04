/* Dedicated-worker adapter for the shared Lokta Sunlight WebGL2 renderer. */
(function(scope) {
  'use strict';

  var renderer = null;
  var surface = null;
  var initialized = false;
  var snapshotInFlight = false;

  function serializeError(error) {
    return {
      message: error && error.message ? String(error.message) : String(error),
      name: error && error.name ? String(error.name) : 'Error',
      stack: error && error.stack ? String(error.stack) : ''
    };
  }

  function post(type, detail) {
    var message = detail || {};
    message.type = type;
    scope.postMessage(message);
  }

  function fail(error, phase) {
    post('error', {
      phase: phase || 'runtime',
      error: serializeError(error)
    });
  }

  function requireRenderer(engineUrl) {
    if (scope.SunlitRenderer) return;
    if (!engineUrl || typeof engineUrl !== 'string') {
      throw new Error('The Sunlit worker requires a content-versioned engineUrl');
    }
    scope.importScripts(engineUrl);
    if (!scope.SunlitRenderer || typeof scope.SunlitRenderer.create !== 'function') {
      throw new Error('sunlit-renderer.js did not expose SunlitRenderer.create');
    }
  }

  function initialize(message) {
    if (initialized) throw new Error('The Sunlit worker has already been initialized');
    if (!message.canvas) throw new Error('The Sunlit worker init message requires an OffscreenCanvas');
    requireRenderer(message.engineUrl);
    initialized = true;
    surface = message.canvas;

    var options = message.options || {};
    options.onReady = function(detail) {
      post('ready', detail);
    };
    options.onError = function(error) {
      fail(error, 'renderer');
    };
    options.onContextLost = function() {
      post('context-lost');
    };
    options.onContextRestored = function() {
      post('context-restored');
    };
    options.autoStart = options.autoStart !== false;

    renderer = scope.SunlitRenderer.create(surface, options);
  }

  function captureSnapshot(message) {
    if (snapshotInFlight || !surface || !renderer ||
        typeof scope.OffscreenCanvas !== 'function') {
      post('snapshot-failed', { requestId: message.requestId });
      return;
    }

    snapshotInFlight = true;
    var sourceWidth = Math.max(1, Number(surface.width) || 1);
    var sourceHeight = Math.max(1, Number(surface.height) || 1);
    var maximumPixels = Math.max(160000, Number(message.maximumPixels) || 600000);
    var scale = Math.min(1, Math.sqrt(maximumPixels / (sourceWidth * sourceHeight)));
    var width = Math.max(1, Math.round(sourceWidth * scale));
    var height = Math.max(1, Math.round(sourceHeight * scale));
    var snapshot = new scope.OffscreenCanvas(width, height);
    var context = snapshot.getContext('2d', { alpha: false });

    if (!context) {
      snapshotInFlight = false;
      post('snapshot-failed', { requestId: message.requestId });
      return;
    }

    try {
      renderer.renderFrame(Number(message.nowMs) || Date.now());
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'medium';
      context.drawImage(surface, 0, 0, width, height);
    } catch (error) {
      snapshotInFlight = false;
      post('snapshot-failed', { requestId: message.requestId });
      return;
    }

    if (typeof snapshot.convertToBlob !== 'function') {
      snapshotInFlight = false;
      post('snapshot-failed', { requestId: message.requestId });
      return;
    }

    snapshot.convertToBlob({
      type: 'image/webp',
      quality: Math.max(0.4, Math.min(0.82, Number(message.quality) || 0.64))
    }).then(function(blob) {
      post('snapshot', {
        requestId: message.requestId,
        blob: blob,
        width: width,
        height: height,
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight
      });
    }).catch(function() {
      // A failed continuity frame never affects the live renderer or poster.
      post('snapshot-failed', { requestId: message.requestId });
    }).then(function() {
      snapshotInFlight = false;
    });
  }

  scope.onmessage = function(event) {
    var message = event.data || {};
    try {
      if (message.type === 'init') {
        initialize(message);
        return;
      }
      if (!renderer) throw new Error('Sunlit worker received "' + message.type + '" before init');

      switch (message.type) {
        case 'resize':
          renderer.resize(message.width, message.height, message.dpr);
          break;
        case 'theme':
          renderer.setTheme(message.theme, {
            nowMs: message.nowMs,
            startTimeMs: message.startTimeMs,
            immediate: message.immediate,
            fromValues: message.fromValues
          });
          break;
        case 'route':
          renderer.setRoute(message.route, {
            nowMs: message.nowMs,
            startTimeMs: message.startTimeMs,
            durationMs: message.durationMs
          });
          break;
        case 'reduced-motion':
          renderer.setReducedMotion(message.reduced, message.nowMs);
          break;
        case 'visibility':
          renderer.setVisible(message.visible);
          break;
        case 'ink-paper':
          renderer.setInkPaper(message.color, message.strength);
          break;
        case 'render':
          renderer.renderFrame(message.nowMs);
          break;
        case 'state':
          post('state', {
            requestId: message.requestId,
            state: renderer.getState(message.nowMs)
          });
          break;
        case 'snapshot':
          captureSnapshot(message);
          break;
        case 'start':
          renderer.start();
          break;
        case 'stop':
          renderer.stop();
          break;
        case 'dispose':
          renderer.dispose();
          renderer = null;
          surface = null;
          initialized = false;
          snapshotInFlight = false;
          post('disposed');
          break;
        default:
          throw new Error('Unknown Sunlit worker message type: ' + message.type);
      }
    } catch (error) {
      fail(error, message.type || 'message');
    }
  };

  scope.onerror = function(message, source, line, column, error) {
    fail(error || new Error(String(message)), 'worker');
    return true;
  };
})(self);
