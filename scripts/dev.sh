#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
PORT=${HUGO_PORT:-1315}
BIND=${HUGO_BIND:-127.0.0.1}
CACHE_DIR=${HUGO_CACHE_DIR:-${TMPDIR:-/tmp}/nisch-hugo-preview-cache}

cd "$ROOT"

exec hugo server \
  --buildDrafts \
  --renderToMemory \
  --disableFastRender \
  --bind "$BIND" \
  --port "$PORT" \
  --baseURL "http://$BIND:$PORT/" \
  --cacheDir "$CACHE_DIR"
