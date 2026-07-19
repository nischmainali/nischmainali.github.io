/* Dedicated-worker adapter for the shared Lokta Sunlight WebGL2 renderer. */
(function(scope) {
  'use strict';

  var renderer = null;
  var initialized = false;

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

    renderer = scope.SunlitRenderer.create(message.canvas, options);
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
        case 'pause':
          renderer.setPaused(message.paused, message.nowMs);
          break;
        case 'reduced-motion':
          renderer.setReducedMotion(message.reduced, message.nowMs);
          break;
        case 'visibility':
          renderer.setVisible(message.visible);
          break;
        case 'clock':
          renderer.setClock({
            epochMs: message.epochMs,
            ambientOffsetMs: message.ambientOffsetMs,
            ambientTimeMs: message.ambientTimeMs,
            nowMs: message.nowMs
          });
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
        case 'start':
          renderer.start();
          break;
        case 'stop':
          renderer.stop();
          break;
        case 'dispose':
          renderer.dispose();
          renderer = null;
          initialized = false;
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
