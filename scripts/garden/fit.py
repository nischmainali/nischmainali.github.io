#!/usr/bin/env python3
"""Check that no garden prints under the page's text, at every width.

usage: scripts/garden/fit.py [PATH ...] [--widths 1180,1210,...] [--heights 900,768]

Builds the site, opens each page that has a garden at each width, and reads
the garden's masks under every block of text, picture and formula (with a
few pixels to spare). A garden is grown at three widths and stretched
between them; this is the check that the stretching keeps it clear.
Exits non-zero if any garden inks a block.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from grow import MANIFEST, build_and_serve  # noqa: E402

WIDTHS = (1180, 1210, 1239, 1240, 1270, 1300, 1340, 1399, 1400, 1440, 1600, 1920)
SPARE = 4  # px round each block
INK = 24  # mask alpha (of 255) that counts as ink: about 1.5% at print strength

FIT = """async ([spare, ink]) => {
  const root = document.querySelector('body > main') || document.body;
  const isBlock = (el) => { const d = getComputedStyle(el).display; return !/^inline/.test(d) && d !== 'contents'; };
  const blocks = new Map(), range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.textContent.trim()) continue;
    let el = n.parentElement;
    while (el && el !== root && !isBlock(el)) el = el.parentElement;
    if (!el || getComputedStyle(n.parentElement).visibility === 'hidden') continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const b = blocks.get(el) || { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
      b.x0 = Math.min(b.x0, r.left + scrollX); b.y0 = Math.min(b.y0, r.top + scrollY);
      b.x1 = Math.max(b.x1, r.right + scrollX); b.y1 = Math.max(b.y1, r.bottom + scrollY);
      blocks.set(el, b);
    }
  }
  const boxes = [...blocks.values()];
  for (const el of root.querySelectorAll('img, svg, canvas, video, iframe, .katex-display, .article-dropcap, figure, pre, table, .scientific-plate')) {
    const r = el.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) boxes.push({ x0: r.left + scrollX, y0: r.top + scrollY, x1: r.right + scrollX, y1: r.bottom + scrollY });
  }
  const out = [];
  for (const g of document.querySelectorAll('body > .garden')) {
    const r = g.getBoundingClientRect();
    if (r.width < 1) continue;
    const box = { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    const cs = getComputedStyle(g);
    let worst = 0, inked = 0;
    for (const name of ['--g-leaf', '--g-flower']) {
      const m = /url\\(\\s*["']?([^"')]+)/.exec(cs.getPropertyValue(name));
      if (!m) continue;
      const img = new Image(); img.src = m[1]; await img.decode();
      const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight), ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      const sx = c.width / box.w, sy = c.height / box.h;
      for (const b of boxes) {
        const x0 = Math.max(0, Math.floor((b.x0 - spare - box.x) * sx)), x1 = Math.min(c.width, Math.ceil((b.x1 + spare - box.x) * sx));
        const y0 = Math.max(0, Math.floor((b.y0 - spare - box.y) * sy)), y1 = Math.min(c.height, Math.ceil((b.y1 + spare - box.y) * sy));
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const a = d[4 * (y * c.width + x) + 3];
          if (a > worst) worst = a;
          if (a > ink) inked++;
        }
      }
    }
    out.push({ part: g.dataset.garden, worst, inked });
  }
  return out;
}"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--widths", default=",".join(map(str, WIDTHS)))
    ap.add_argument("--heights", default="900")
    args = ap.parse_args()
    manifest = json.loads(MANIFEST.read_text())
    paths = args.paths or sorted(manifest["pages"])
    tmp = Path(tempfile.mkdtemp(prefix="garden-fit-"))
    faults = 0
    try:
        base, httpd = build_and_serve(tmp)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome")
            for path in paths:
                for height in (int(h) for h in args.heights.split(",")):
                    for width in (int(w) for w in args.widths.split(",")):
                        ctx = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
                        ctx.add_init_script("try{sessionStorage.setItem('index-opened','1')}catch(e){}")
                        page = ctx.new_page()
                        page.goto(base + path, wait_until="networkidle")
                        page.evaluate("document.fonts.ready")
                        for g in page.evaluate(FIT, [SPARE, INK]):
                            if g["inked"]:
                                faults += 1
                                print(f"{path} {g['part']} at {width}x{height}: {g['inked']} inked pixels under the printing (worst alpha {g['worst']})")
                        ctx.close()
                print(f"{path}: checked", flush=True)
            browser.close()
        httpd.shutdown()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print("Every garden keeps clear of the printing." if not faults else f"{faults} garden(s) touch the printing.")
    sys.exit(1 if faults else 0)


if __name__ == "__main__":
    main()
