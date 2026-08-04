#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BUILD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/nisch-site-build.XXXXXX")
CACHE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/nisch-site-cache.XXXXXX")

cleanup() {
  rm -rf "$BUILD_DIR" "$CACHE_DIR"
}

trap cleanup EXIT HUP INT TERM

cd "$ROOT"

python3 scripts/check_content.py
node --check assets/js/article.js
node --check assets/js/home-readout.js
node --check assets/js/ink-register.js
node --check assets/js/search.js
node --check assets/js/sunlit-renderer.js
node --check assets/js/sunlit-worker.js
node --check assets/js/sunlit.js
hugo --minify --noBuildLock --destination "$BUILD_DIR" --cacheDir "$CACHE_DIR"
