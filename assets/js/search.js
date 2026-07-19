(function() {
  'use strict';

  var root = document.querySelector('[data-site-search]');
  if (!root) return;

  var input = root.querySelector('input[type="search"]');
  var status = root.querySelector('[role="status"]');
  var results = root.querySelector('.site-search-results');
  var index = null;
  var timer = 0;

  function groupsFor(query) {
    return query.split('|').map(function(part) {
      var terms = [];
      var matcher = /"([^"]+)"|(\S+)/g;
      var match;
      while ((match = matcher.exec(part))) {
        terms.push((match[1] || match[2]).toLocaleLowerCase());
      }
      return terms;
    }).filter(function(group) {
      return group.length > 0;
    });
  }

  function score(entry, groups) {
    var title = String(entry.title || '').toLocaleLowerCase();
    var content = String(entry.content || '').toLocaleLowerCase();
    var haystack = title + '\n' + content;
    var best = -1;
    groups.forEach(function(group) {
      if (!group.every(function(term) { return haystack.indexOf(term) !== -1; })) return;
      var value = 0;
      group.forEach(function(term) {
        if (title === term) value += 12;
        else if (title.indexOf(term) !== -1) value += 7;
        var position = content.indexOf(term);
        if (position !== -1) value += 3 + Math.max(0, 2 - position / 600);
      });
      best = Math.max(best, value);
    });
    return best;
  }

  function previewFor(content, groups) {
    var source = String(content || '').replace(/\s+/g, ' ').trim();
    var lower = source.toLocaleLowerCase();
    var first = source.length;
    groups.forEach(function(group) {
      group.forEach(function(term) {
        var position = lower.indexOf(term);
        if (position !== -1) first = Math.min(first, position);
      });
    });
    var start = Math.max(0, first - 72);
    var end = Math.min(source.length, start + 230);
    return (start ? '…' : '') + source.slice(start, end).trim() + (end < source.length ? '…' : '');
  }

  function render() {
    var query = input.value.trim();
    var groups = groupsFor(query);
    results.replaceChildren();
    if (!query || !groups.length) {
      status.textContent = 'Type a word or phrase.';
      return;
    }
    if (!index) {
      status.textContent = 'Preparing the index…';
      return;
    }

    var matches = index.map(function(entry) {
      return { entry: entry, score: score(entry, groups) };
    }).filter(function(item) {
      return item.score >= 0;
    }).sort(function(a, b) {
      return b.score - a.score || String(a.entry.title).localeCompare(String(b.entry.title));
    }).slice(0, 24);

    var fragment = document.createDocumentFragment();
    matches.forEach(function(item) {
      var row = document.createElement('li');
      var heading = document.createElement('h2');
      var link = document.createElement('a');
      var preview = document.createElement('p');
      link.href = item.entry.uri;
      link.textContent = item.entry.title;
      heading.append(link);
      preview.className = 'site-search-preview';
      preview.textContent = previewFor(item.entry.content, groups);
      row.append(heading, preview);
      fragment.append(row);
    });
    results.append(fragment);
    status.textContent = matches.length ?
      matches.length + (matches.length === 1 ? ' result.' : ' results.') :
      'No matching documents.';
  }

  input.addEventListener('input', function() {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 70);
  });

  fetch('/index.json', { credentials: 'same-origin' }).then(function(response) {
    if (!response.ok) throw new Error('Search index request failed');
    return response.json();
  }).then(function(entries) {
    index = Array.isArray(entries) ? entries : [];
    render();
  }).catch(function() {
    status.textContent = 'Search is unavailable on this copy of the site.';
  });
})();
