#!/usr/bin/env python3
"""Check the sheet gardens against the site.

Every garden in data/gardens.json must have its masks and growth maps in
assets/gardens/, and every page it names must print it in the build. A
garden grown for an earlier version of its page is reported, not failed:
scripts/garden/grow.py grows it again and scripts/garden/fit.py checks that
it keeps clear of the text.

usage: scripts/check_gardens.py BUILD_DIR
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts" / "garden"))
from grow import MANIFEST, page_kind, page_sources, source_hash  # noqa: E402


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    build = Path(sys.argv[1])
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    errors, stale = [], []
    for path, page in sorted(manifest["pages"].items()):
        kind = page_kind(path)
        if not kind:
            errors.append(f"{path}: not a page that carries a garden")
            continue
        html_path = build / (path.lstrip("/") or "index.html")
        if html_path.is_dir() or path.endswith("/"):
            html_path = build / path.lstrip("/") / "index.html"
        if not html_path.exists():
            errors.append(f"{path}: the build has no such page")
            continue
        html = html_path.read_text(encoding="utf-8")
        for part in kind[1]:
            if part not in page["parts"]:
                errors.append(f"{path}: no {part} garden grown")
            elif f"garden garden--{part}" not in html:
                errors.append(f"{path}: the page does not print its {part} garden")
        for part, garden in page["parts"].items():
            for width, record in garden["widths"].items():
                for key in ("leaf", "flower", "birth"):
                    if not (ROOT / "assets" / record[key]).exists():
                        errors.append(f"{path}: {part} at {width}px is missing {record[key]}")
        if page.get("hash") != source_hash(page.get("sources") or page_sources(path)):
            stale.append(path)
    for path in stale:
        print(f"garden: {path} changed since its garden was grown; run scripts/garden/grow.py {path} and scripts/garden/fit.py {path}")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print(f"gardens: {len(manifest['pages'])} pages, all present")


if __name__ == "__main__":
    main()
