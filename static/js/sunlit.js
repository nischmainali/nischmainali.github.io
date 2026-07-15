// Shade/sunset controller and procedural foliage for the Sunlit scene.
(function() {
  var STORAGE_KEY = 'sunlit-theme';

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

  function makeLeaf(className) {
    var leaf = document.createElement('div');
    leaf.className = className;
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

  function renderFoliage() {
    var fallingLayer = document.querySelector('.sunlit-falling-leaves');
    var treeLayer = document.querySelector('.sunlit-tree-shadows');
    if (!fallingLayer || !treeLayer) return;

    fallingLayer.replaceChildren();
    treeLayer.replaceChildren();

    var width = window.innerWidth;
    var height = window.innerHeight;

    for (var fallingIndex = 0; fallingIndex < 30; fallingIndex += 1) {
      var fallingX = Math.random() * width * 0.25 + width * 0.8;
      var fallingY = Math.random() * height * 0.5;
      var fallingType = Math.ceil(Math.random() * 4);
      var fallingDepth = Math.random() + 1;
      var fallingBlur = 4 + 8 * fallingDepth;
      var fallingScale = 0.2 + 0.4 * fallingDepth;
      var fallingOpacity = 0.8 * (2 - fallingDepth);
      // The reference generates (but does not render) an initial rotation value.
      Math.random();

      var fallingWrapper = document.createElement('div');
      fallingWrapper.className = 'sunlit-leaf-wrapper';
      fallingWrapper.style.top = fallingY + 'px';
      fallingWrapper.style.left = fallingX + 'px';
      fallingWrapper.style.transform = 'scale(' + fallingScale + ')';

      var fallingLeaf = makeLeaf('sunlit-leaf-' + fallingType);
      fallingLeaf.style.opacity = fallingOpacity;
      fallingLeaf.style.filter = 'blur(' + fallingBlur + 'px)';
      fallingLeaf.style.animationDelay = (Math.random() * 3) + 's';
      fallingLeaf.style.animationDuration = (3 + Math.random() * 3) + 's';
      fallingWrapper.appendChild(fallingLeaf);
      fallingLayer.appendChild(fallingWrapper);
    }

    var clusterX = [0.95 * width, 0.75 * width];
    var clusterY = [0.15 * height, 0.4 * height];
    var offsets = [-100, -70, -40, -10, 20, 50, 80, 110, 140, 170];
    var xSpread = 0.2 * width;
    var ySpread = 0.4 * height;

    for (var cluster = 0; cluster < 2; cluster += 1) {
      var baseX = clusterX[cluster] + 0.2 * offsets[cluster];
      var baseY = clusterY[cluster] + 5 * offsets[cluster];

      for (var group = 0; group < 10; group += 1) {
        for (var leafIndex = 0; leafIndex < 15; leafIndex += 1) {
          var treeX = baseX + Math.random() * xSpread * 2 - xSpread;
          var treeY = baseY + Math.random() * ySpread * 2 - ySpread + 0.4 * (treeX - baseX);
          var treeType = Math.ceil(Math.random() * 4);
          var treeDepth = Math.random() + 1;
          var treeBlur = 4 + 4 * treeDepth;
          var treeScale = 0.2 + 0.6 * treeDepth;
          var treeOpacity = 2 - 1.1 * treeDepth;
          var treeRotation = 45 + Math.random() * 180;

          var treeWrapper = document.createElement('div');
          treeWrapper.className = 'sunlit-tree-leaf-wrapper';
          treeWrapper.style.top = treeY + 'px';
          treeWrapper.style.left = treeX + 'px';
          treeWrapper.style.transform = 'scale(' + treeScale + ') rotate(' + treeRotation + 'deg)';

          var treeLeaf = makeLeaf('sunlit-leaf-' + treeType);
          treeLeaf.style.opacity = treeOpacity;
          treeLeaf.style.filter = 'blur(' + treeBlur + 'px)';
          treeWrapper.appendChild(treeLeaf);
          treeLayer.appendChild(treeWrapper);
        }
      }
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

    if (!scene) return;
    if (loading) loading.classList.add('is-visible');
    renderFoliage();
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
      if (loading) loading.classList.add('is-visible');
      renderFoliage();
      applyState(document.body.classList.contains('sunset') ? 'sunset' : 'shade', false);
      window.setTimeout(function() {
        if (loading) loading.classList.remove('is-visible');
      }, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
