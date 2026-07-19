// Shade/sunset controller with deterministic peepal foliage for Lokta Conservatory.
(function() {
  var STORAGE_KEY = 'sunlit-theme';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var renderedLeafLayout = null;
  var appliedState = null;
  var scrollActive = false;
  var scrollResumeTimer = 0;
  var leafCleanupTimer = 0;

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

  function renderFallingLeaves() {
    var fallingLayer = document.querySelector('.sunlit-falling-leaves');
    if (!fallingLayer) return;

    var isMobile = window.innerWidth < 600;
    var count = isMobile ? 5 : 8;
    var random = seededRandom(isMobile ? 0x4e495552 : 0x4c4f4b54);
    var fragment = document.createDocumentFragment();

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
      fragment.appendChild(wrapper);
    }

    fallingLayer.replaceChildren(fragment);
    renderedLeafLayout = isMobile ? 'mobile' : 'desktop';
  }

  function ensureFallingLeaves(layout) {
    if (renderedLeafLayout !== layout) renderFallingLeaves();
  }

  function clearFallingLeavesAfterFade() {
    var fallingLayer = document.querySelector('.sunlit-falling-leaves');
    window.clearTimeout(leafCleanupTimer);
    leafCleanupTimer = 0;
    if (!fallingLayer || !fallingLayer.children.length) return;
    leafCleanupTimer = window.setTimeout(function() {
      if (document.body.classList.contains('sunset')) return;
      fallingLayer.replaceChildren();
      renderedLeafLayout = null;
      leafCleanupTimer = 0;
    }, 2200);
  }

  function updateToggle(state) {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    var isSunset = state === 'sunset';
    var label = isSunset ? 'Switch to daylight' : 'Switch to sunset';
    var pressed = String(isSunset);
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
    if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
  }

  function applyState(state, persist, leafLayout) {
    var isSunset = state === 'sunset';
    var scene = document.getElementById('sunlit-scene');
    var stateChanged = appliedState !== state;

    if (stateChanged) {
      document.body.classList.toggle('sunset', isSunset);
      if (document.body.getAttribute('data-theme') !== state) {
        document.body.setAttribute('data-theme', state);
      }
      if (scene) scene.classList.toggle('is-sunset', isSunset);
      updateToggle(state);
      appliedState = state;
    }
    window.clearTimeout(leafCleanupTimer);
    leafCleanupTimer = 0;
    if (isSunset) {
      ensureFallingLeaves(leafLayout);
    } else {
      clearFallingLeavesAfterFade();
    }
    if (persist) storeState(state);
  }

  function syncAnimationPlayback(scene) {
    if (!scene) return;
    // CSS animation-play-state preserves phase and leaves the shade/sunset
    // transitions alone. This also works in browsers without Element#getAnimations.
    scene.classList.toggle('is-motion-paused', document.hidden || scrollActive);
  }

  function init() {
    var scene = document.getElementById('sunlit-scene');
    var button = document.getElementById('theme-toggle');
    var state = getStoredState();
    var resizeTimer = null;
    var leafLayout = window.innerWidth < 600 ? 'mobile' : 'desktop';

    function finishScroll() {
      window.clearTimeout(scrollResumeTimer);
      scrollResumeTimer = 0;
      if (!scrollActive) return;
      scrollActive = false;
      syncAnimationPlayback(scene);
    }

    if (!scene) return;
    applyState(state, false, leafLayout);
    syncAnimationPlayback(scene);

    if (button) {
      button.addEventListener('click', function() {
        state = document.body.classList.contains('sunset') ? 'shade' : 'sunset';
        applyState(state, true, leafLayout);
      });
    }

    window.addEventListener('resize', function() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function() {
        var nextLeafLayout = window.innerWidth < 600 ? 'mobile' : 'desktop';
        if (nextLeafLayout !== leafLayout) {
          leafLayout = nextLeafLayout;
        }
        applyState(document.body.classList.contains('sunset') ? 'sunset' : 'shade', false, leafLayout);
      }, 120);
    });

    window.addEventListener('scroll', function() {
      if (!scrollActive) {
        scrollActive = true;
        syncAnimationPlayback(scene);
      }
      window.clearTimeout(scrollResumeTimer);
      /* Keep the slow atmosphere still long enough for dense article tiles to
       * finish rastering after a fling. Against 19–24 s botanical cycles this
       * pause is imperceptible, while a 220 ms resume could steal the very next
       * paint slot on mathematical pages. */
      scrollResumeTimer = window.setTimeout(finishScroll, 800);
    }, { passive: true });

    document.addEventListener('visibilitychange', function() {
      syncAnimationPlayback(scene);
    });
  }

  // This script is loaded at the end of body, so initialize before the first
  // paint instead of waiting for DOMContentLoaded on every document navigation.
  init();
})();
