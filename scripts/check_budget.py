#!/usr/bin/env python3
"""Check the small static shell against explicit production size limits."""

from __future__ import annotations

import argparse
import gzip
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


@dataclass(frozen=True)
class PageBudget:
    name: str
    path: str
    html_bytes: int
    shell_gzip_bytes: int


PAGES = (
    PageBudget("home", "index.html", 36_000, 100_000),
    PageBudget("writing", "blog/index.html", 24_000, 90_000),
    PageBudget("article", "blog/gp-code-notes/index.html", 48_000, 125_000),
)

MAX_STYLESHEET_BYTES = 80_000
MAX_SCRIPT_BYTES = 64_000
MAX_JOST_BYTES = 105_000
INITIAL_LINK_RELS = {"stylesheet", "preload", "modulepreload"}


class InitialAssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[str] = []

    def handle_starttag(
        self, tag: str, attributes: list[tuple[str, str | None]]
    ) -> None:
        attrs = {name.lower(): value or "" for name, value in attributes}
        if tag.lower() == "script" and attrs.get("src"):
            self.urls.append(attrs["src"])
            return
        if tag.lower() != "link" or not attrs.get("href"):
            return
        relationships = set(attrs.get("rel", "").lower().split())
        if relationships.intersection(INITIAL_LINK_RELS):
            self.urls.append(attrs["href"])


def compressed_size(data: bytes) -> int:
    return len(gzip.compress(data, compresslevel=9, mtime=0))


def local_asset_path(build: Path, url: str) -> Path | None:
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path).lstrip("/")
    if not path or path.endswith("/"):
        return None
    candidate = (build / path).resolve()
    try:
        candidate.relative_to(build.resolve())
    except ValueError:
        return None
    return candidate


def inspect_page(build: Path, budget: PageBudget) -> list[str]:
    problems: list[str] = []
    page = build / budget.path
    if not page.is_file():
        return [f"{budget.name}: missing {budget.path}"]

    html = page.read_bytes()
    if len(html) > budget.html_bytes:
        problems.append(
            f"{budget.name}: HTML is {len(html):,} bytes "
            f"(limit {budget.html_bytes:,})"
        )

    text = html.decode("utf-8")
    parser = InitialAssetParser()
    parser.feed(text)
    assets: set[Path] = set()
    for url in parser.urls:
        parsed = urlsplit(url)
        if parsed.scheme in {"http", "https"}:
            problems.append(f"{budget.name}: external runtime asset {url}")
            continue
        asset = local_asset_path(build, url)
        if asset is None:
            continue
        if not asset.is_file():
            problems.append(f"{budget.name}: missing initial asset {url}")
            continue
        assets.add(asset)

    shell_size = compressed_size(html)
    shell_size += sum(compressed_size(asset.read_bytes()) for asset in assets)
    if shell_size > budget.shell_gzip_bytes:
        problems.append(
            f"{budget.name}: initial HTML, CSS, and JavaScript compress to "
            f"{shell_size:,} bytes (limit {budget.shell_gzip_bytes:,})"
        )

    print(
        f"{budget.name:8} html={len(html):6,} bytes  "
        f"initial-gzip={shell_size:6,} bytes  assets={len(assets)}"
    )
    return problems


def inspect_assets(build: Path) -> list[str]:
    problems: list[str] = []
    for stylesheet in build.rglob("*.css"):
        size = stylesheet.stat().st_size
        if size > MAX_STYLESHEET_BYTES:
            problems.append(
                f"{stylesheet.relative_to(build)} is {size:,} bytes "
                f"(stylesheet limit {MAX_STYLESHEET_BYTES:,})"
            )
    for script in build.rglob("*.js"):
        size = script.stat().st_size
        if size > MAX_SCRIPT_BYTES:
            problems.append(
                f"{script.relative_to(build)} is {size:,} bytes "
                f"(script limit {MAX_SCRIPT_BYTES:,})"
            )

    jost = build / "vendor/fonts/jost/Jost-VF.woff2"
    if not jost.is_file():
        problems.append("Jost production font is missing")
    elif jost.stat().st_size > MAX_JOST_BYTES:
        problems.append(
            f"Jost is {jost.stat().st_size:,} bytes (limit {MAX_JOST_BYTES:,})"
        )
    return problems


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("build", type=Path)
    args = parser.parse_args()
    build = args.build.resolve()
    if not build.is_dir():
        parser.error(f"build directory does not exist: {build}")

    problems: list[str] = []
    for budget in PAGES:
        problems.extend(inspect_page(build, budget))
    problems.extend(inspect_assets(build))

    if problems:
        for problem in problems:
            print(f"budget: {problem}", file=sys.stderr)
        return 1
    print("Performance budgets passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
