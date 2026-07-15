// Shade/sunset controller with deterministic peepal foliage for Lokta Conservatory.
(function() {
  var STORAGE_KEY = 'sunlit-theme';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function normalizeState(value) {
    return value === 'sunset' || value === 'dark' ? 'sunset' : 'shade';
  }

  function getStoredState() {
    try {
      return normalizeState(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return 'shade';
    }
  }

  function storeState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch (error) {
      // The default shade state remains complete when storage is unavailable.
    }
  }

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function createSvgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);
    Object.keys(attributes).forEach(function(attribute) {
      element.setAttribute(attribute, attributes[attribute]);
    });
    return element;
  }

  function createPeepalLeaf() {
    var leaf = createSvgElement('svg', {
      'class': 'sunlit-peepal-leaf',
      'viewBox': '0 0 100 132',
      'aria-hidden': 'true'
    });
    var stem = createSvgElement('path', {
      'class': 'sunlit-peepal-stem',
      'd': 'M50 30 C49 19 45 10 42 2'
    });
    var blade = createSvgElement('path', {
      'class': 'sunlit-peepal-blade',
      'd': 'M50 31 C37 9 12 17 11 44 C10 70 34 87 49 126 C62 88 89 71 89 43 C89 17 64 10 50 31 Z'
    });
    leaf.appendChild(stem);
    leaf.appendChild(blade);
    return leaf;
  }

  function layoutShutters(isSunset) {
    var shutters = document.querySelector('.sunlit-shutters');
    if (!shutters) return;

    var count = Math.ceil(window.innerHeight / 36);
    var height = window.innerWidth < 600 ? 42 : 56;
    var gap = window.innerWidth < 600 ? 16 : 8;
    var spacing = height + gap;

    if (shutters.children.length !== count) {
      shutters.replaceChildren();
      for (var index = 0; index < count; index += 1) {
        var shutter = document.createElement('div');
        shutter.className = 'sunlit-shutter';
        shutters.appendChild(shutter);
      }
    }

    Array.prototype.forEach.call(shutters.children, function(shutter, index) {
      shutter.style.top = (index * spacing * (isSunset ? 1.15 : 1) - 300) + 'px';
      shutter.style.left = '-' + (window.innerWidth * 0.01 * index) + 'px';
      shutter.style.height = (isSunset ? 20 : height) + 'px';
    });
  }

  function renderFallingLeaves() {
    var fallingLayer = document.querySelector('.sunlit-falling-leaves');
    if (!fallingLayer) return;

    fallingLayer.replaceChildren();

    var isMobile = window.innerWidth < 600;
    var count = isMobile ? 5 : 8;
    var random = seededRandom(isMobile ? 0x4e495552 : 0x4c4f4b54);

    for (var index = 0; index < count; index += 1) {
      var wrapper = document.createElement('div');
      var duration = 11.5 + random() * 7;
      var direction = random() < 0.5 ? -1 : 1;
      var drift = 28 + random() * 76;

      wrapper.className = 'sunlit-peepal-wrapper';
      wrapper.style.setProperty('--leaf-x', (62 + random() * 40) + 'vw');
      wrapper.style.setProperty('--leaf-size', ((isMobile ? 26 : 32) + random() * (isMobile ? 25 : 30)) + 'px');
      wrapper.style.setProperty('--leaf-blur', (1.2 + random() * 3.4) + 'px');
      wrapper.style.setProperty('--leaf-opacity', (0.4 + random() * 0.3).toFixed(2));
      wrapper.style.setProperty('--leaf-duration', duration + 's');
      wrapper.style.setProperty('--leaf-delay', (-random() * duration) + 's');
      wrapper.style.setProperty('--leaf-drift-a', (direction * drift) + 'px');
      wrapper.style.setProperty('--leaf-drift-b', (-direction * drift * 0.62) + 'px');
      wrapper.style.setProperty('--leaf-drift-c', (direction * drift * 0.34) + 'px');
      wrapper.style.setProperty('--leaf-spin', (direction * (190 + random() * 250)) + 'deg');
      wrapper.appendChild(createPeepalLeaf());
      fallingLayer.appendChild(wrapper);
    }
  }

  function updateToggle(state) {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    var isSunset = state === 'sunset';
    button.setAttribute('aria-label', isSunset ? 'Switch to daylight' : 'Switch to sunset');
    button.setAttribute('aria-pressed', String(isSunset));
  }

  function applyState(state, persist) {
    var isSunset = state === 'sunset';
    var scene = document.getElementById('sunlit-scene');
    document.body.classList.toggle('sunset', isSunset);
    document.body.setAttribute('data-theme', state);
    if (scene) scene.classList.toggle('is-sunset', isSunset);
    layoutShutters(isSunset);
    updateToggle(state);
    if (persist) storeState(state);
  }

  function init() {
    var scene = document.getElementById('sunlit-scene');
    var loading = document.querySelector('.sunlit-loading-overlay');
    var button = document.getElementById('theme-toggle');
    var state = getStoredState();
    var resizeTimer = null;

    if (!scene) return;
    if (loading) loading.classList.add('is-visible');
    renderFallingLeaves();
    applyState(state, false);

    window.setTimeout(function() {
      if (loading) loading.classList.remove('is-visible');
    }, 250);

    if (button) {
      button.addEventListener('click', function() {
        state = document.body.classList.contains('sunset') ? 'shade' : 'sunset';
        applyState(state, true);
      });
    }

    window.addEventListener('resize', function() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function() {
        if (loading) loading.classList.add('is-visible');
        renderFallingLeaves();
        applyState(document.body.classList.contains('sunset') ? 'sunset' : 'shade', false);
        window.setTimeout(function() {
          if (loading) loading.classList.remove('is-visible');
        }, 250);
      }, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
