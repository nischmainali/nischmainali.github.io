#!/usr/bin/env python3
"""Grow the sheet gardens round the built site's pages.

A garden is measured from the page it grows round, so it is grown ahead of
time and committed: Hugo cannot run Lua. Run this after a change to a page's
text or to the sheet's layout, look at the result, and commit
assets/gardens/ with data/gardens.json.

usage: scripts/garden/grow.py [PATH ...] [--widths 1440,1300,1180] [--seed N]
       scripts/garden/grow.py --check

PATH is a page's address, such as /blog/gp-code-notes/; without one every
page is grown again. --check measures the pages and reports the gardens whose
page has moved since they were grown.

Each page is built with `hugo --minify`, opened in Google Chrome at each
width the sheet changes through, and measured block by block with the head
and foot room the garden asks for. tikz-flora's parts, steered by our
composer (garden.lua), grow the plants round the measured printing; the
scene is painted with tikz-flora's own painter, split by hue into the leaf
ink and the flower ink, and given a growth map: how far each part of the
garden lies along its stems from the roots, which is the order it grows in.

Requires lua5.4, cwebp, Python 3 with Pillow and Playwright, and Google Chrome.
"""
from __future__ import annotations

import argparse
import base64
import functools
import hashlib
import http.server
import io
import json
import math
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

# Pillow and Playwright are imported where they are used, so that
# scripts/check_gardens.py can read this module in the site's check.

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
VENDOR = HERE / "vendor" / "tikz-flora"
ASSETS = ROOT / "assets" / "gardens"
MANIFEST = ROOT / "data" / "gardens.json"
WIDTHS = (1440, 1300, 1180)
HEIGHT = 900
SCALE = 1.5  # mask pixels per CSS pixel

# The pages that carry a garden: a note grows one at its head and one at its
# foot; a shorter sheet one round the whole of it. Lists and the missing page
# take the lighter garden.
def page_kind(path: str) -> tuple[str, list[str]] | None:
    if path == "/":
        return "home", ["whole"]
    if path in ("/blog/", "/papers/", "/404.html"):
        return "list", ["whole"]
    if path.startswith("/papers/") and path.count("/") == 3:
        return "paper", ["whole"]
    if path.startswith("/blog/") and path.count("/") == 3:
        return "note", ["head", "foot"]
    return None


# What a garden's page is made from, so check_gardens.py can say when a
# garden was grown for an earlier version of its page.
def page_sources(path: str) -> list[str]:
    if path.startswith("/blog/") and path != "/blog/":
        slug = path.strip("/").split("/")[-1]
        for f in sorted((ROOT / "content" / "blog").glob("*.md")):
            text = f.read_text(encoding="utf-8")
            if f.stem.lower() == slug or f"slug = '{slug}'" in text or f'slug = "{slug}"' in text:
                return [str(f.relative_to(ROOT))]
        return []
    if path.startswith("/papers/") or path == "/blog/":
        return ["data/selected_works.toml"] if path.startswith("/papers/") else sorted(
            str(f.relative_to(ROOT)) for f in (ROOT / "content" / "blog").glob("*.md"))
    if path == "/":
        return ["content/_index.md"]
    if path == "/404.html":
        return ["layouts/404.html"]
    return []


def source_hash(files: list[str]) -> str:
    h = hashlib.sha1()
    for f in files:
        h.update(f.encode())
        h.update((ROOT / f).read_bytes())
    return h.hexdigest()[:12]


def slug_for(path: str) -> str:
    s = path.strip("/").replace("/", "-").replace(".html", "")
    return s or "home"


# The page's printing, measured block by block: each block's lines, across
# its column, with pictures, formulas and figures whole. Coordinates are the
# document's.
MEASURE = """() => {
  const doc = (r) => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  const body = doc(document.body.getBoundingClientRect());
  const trim = { x: body.x + 32, y: body.y + 32, w: body.w - 64, h: body.h - 64 };
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--note-w, 0px)';
  document.body.appendChild(probe);
  const noteW = probe.getBoundingClientRect().width;
  probe.remove();
  const blocks = new Map();
  const range = document.createRange();
  const root = document.querySelector('body > main') || document.body;
  const isBlock = (el) => { const d = getComputedStyle(el).display; return !/^inline/.test(d) && d !== 'contents'; };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.textContent.trim()) continue;
    let el = n.parentElement;
    while (el && el !== root && !isBlock(el)) el = el.parentElement;
    if (!el) continue;
    if (getComputedStyle(n.parentElement).visibility === 'hidden') continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const b = blocks.get(el) || { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
      b.x0 = Math.min(b.x0, r.left + scrollX); b.y0 = Math.min(b.y0, r.top + scrollY);
      b.x1 = Math.max(b.x1, r.right + scrollX); b.y1 = Math.max(b.y1, r.bottom + scrollY);
      blocks.set(el, b);
    }
  }
  // A block's lines can run to its column's edge at another width, so the
  // garden keeps clear of the whole column, over the lines' height.
  const out = [...blocks.entries()].map(([el, b]) => {
    const r = el.getBoundingClientRect();
    const x0 = Math.min(b.x0, r.left + scrollX), x1 = Math.max(b.x1, r.right + scrollX);
    return { x: x0, y: b.y0, w: x1 - x0, h: b.y1 - b.y0 };
  });
  for (const el of root.querySelectorAll('img, svg, canvas, video, iframe, .katex-display, .article-dropcap, figure, pre, table, .scientific-plate')) {
    const r = el.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) out.push(doc(r));
  }
  const end = document.querySelector('.article-end');
  return { trim, body, noteW, content: out, end: end ? doc(end.getBoundingClientRect()) : null,
           vw: innerWidth, vh: innerHeight };
}"""


def plan(kind: str, part: str, geo: dict) -> tuple[dict, dict, list]:
    """The garden's box (document px), its stems' guides, hero and emphasis."""
    T, nw = geo["trim"], geo["noteW"]
    tl, tt, tr, tb = T["x"], T["y"], T["x"] + T["w"], T["y"] + T["h"]
    right = tr + (nw if kind in ("note", "paper") else 0)
    P: dict = {}
    if kind == "note" and part == "head":
        R = {"x": tl, "y": tt, "w": right - tl, "h": min(1150, tb - tt)}
        cx = tr + nw * 0.42
        P["guides"] = [
            # from the corner over the head, toward the title's middle
            {"pts": [[cx + 12, tt + 64], [cx - 70, tt + 54], [tl + (tr - tl) * 0.64, tt + 46], [tl + (tr - tl) * 0.4, tt + 52]], "w0": 2.1, "w1": 0.5, "shoots": 2, "ahead": 60, "amp": 8},
            # down the margin, tapering away within the screen
            {"pts": [[cx + 30, tt + 30], [cx + 8, tt + 260], [cx + 26, tt + 560], [cx - 6, tt + 860]], "w0": 2.2, "w1": 0.45, "shoots": 3, "ahead": 70},
            # a slender vine down the left of the sheet, under the light control
            {"pts": [[tl + 14, tt + 70], [tl + 18, tt + 260], [tl + 12, tt + 520]], "w0": 1.2, "w1": 0.35, "shoots": 0, "ahead": 50},
        ]
        P["hero"] = [cx + 6, tt + 74, 30]
        P["emph"] = [[cx, tt + 60, 260], [cx, tt + 420, 180]]
    elif kind == "note" and part == "foot":
        e = geo["end"]
        top = max(tt, (e["y"] if e else tb - 600) - 420)
        R = {"x": tl, "y": top, "w": right - tl, "h": tb - top}
        cx = tr + nw * 0.45
        P["guides"] = [
            {"pts": [[cx + 30, tb - 20], [cx - 10, tb - 260], [cx + 12, tb - 520]], "w0": 2.2, "w1": 0.45, "shoots": 3, "ahead": 70},
            {"pts": [[cx + 30, tb - 20], [tr - 60, tb - 14], [tl + (tr - tl) * 0.45, tb - 18], [tl + 60, tb - 26]], "w0": 2.0, "w1": 0.45, "shoots": 2, "ahead": 60},
            {"pts": [[tl + 14, tb - 30], [tl + 18, tb - 260], [tl + 12, tb - 420]], "w0": 1.2, "w1": 0.35, "shoots": 0, "ahead": 50},
        ]
        P["hero"] = [cx, tb - 70, 30]
        P["emph"] = [[cx, tb - 60, 260], [tl + (tr - tl) * 0.5, tb - 20, 220]]
    else:
        R = {"x": tl, "y": tt, "w": right - tl, "h": tb - tt}
        full = kind != "list"
        P["guides"] = [
            # along the foot, from the right corner toward the left
            {"pts": [[right - 40, tb - 18], [right - (right - tl) * 0.3, tb - 34], [tl + (right - tl) * 0.35, tb - 40], [tl + 70, tb - 30]], "w0": 2.2, "w1": 0.45, "shoots": 3 if full else 1, "ahead": 60, "amp": 18, "waves": 2.2},
            # up the right side, then over the head toward the middle
            {"pts": [[right - 18, tb - 70], [right - 22, tb - (tb - tt) * 0.5], [right - 44, tt + 70], [tl + (right - tl) * 0.68, tt + 52], [tl + (right - tl) * 0.5, tt + 58]], "w0": 1.8, "w1": 0.45, "shoots": 2 if full else 0, "ahead": 60, "amp": 8},
            # a slender vine up the left side
            {"pts": [[tl + 18, tb - 44], [tl + 22, tb - (tb - tt) * 0.4], [tl + 16, tb - (tb - tt) * 0.62]], "w0": 1.2, "w1": 0.35, "shoots": 0, "ahead": 50, "amp": 8},
        ]
        if not full:
            P["guides"][1]["pts"] = P["guides"][1]["pts"][:3]
        P["hero"] = [right - 70, tb - 70, 30] if full else None
        P["emph"] = [[right - 40, tb - 40, 300], [tl + (right - tl) * 0.5, tb - 20, 240], [right - 40, tt + 60, 180]]
    # Furniture: the light control and the crop corners.
    keep = [[tl - 40, tt - 40, tl + 52, tt + 52], [tr - 24, tt - 44, tr + 52, tt + 30], [tl - 40, tb - 30, tl + 40, tb + 40], [tr - 24, tb - 30, tr + 52, tb + 44]]
    return R, P, keep


def sway(pts, amp, waves, phase):
    """Resample a guide and offset it sideways by a slow wave."""
    out = []
    segs = list(zip(pts[:-1], pts[1:]))
    lens = [math.dist(a, b) for a, b in segs]
    total = sum(lens) or 1
    n = max(4, int(total / 40))
    for i in range(n + 1):
        d = total * i / n
        j, run = 0, 0
        while j < len(lens) - 1 and run + lens[j] < d:
            run += lens[j]
            j += 1
        a, b = segs[j]
        t = (d - run) / (lens[j] or 1)
        x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        nx, ny = -(b[1] - a[1]) / (lens[j] or 1), (b[0] - a[0]) / (lens[j] or 1)
        w = amp * math.sin(phase + waves * 2 * math.pi * d / total) * min(1, d / 60) * min(1, (total - d) / 60 + 0.3)
        out.append([x + nx * w, y + ny * w])
    return out


def lua(v):
    if isinstance(v, dict):
        return "{" + ",".join(f"{k}={lua(x)}" for k, x in v.items()) + "}"
    if isinstance(v, (list, tuple)):
        return "{" + ",".join(lua(x) for x in v) + "}"
    if isinstance(v, str):
        return json.dumps(v)
    if isinstance(v, float):
        return repr(round(v, 2))
    return str(v)


def spec_for(kind: str, R: dict, P: dict, keep: list, geo: dict, seed: int) -> dict:
    """The composer's spec, in its own frame: pt from the box's lower left, y up."""
    def up_box(r):
        return [r["x"] - R["x"], R["h"] - (r["y"] + r["h"] - R["y"]), r["x"] + r["w"] - R["x"], R["h"] - (r["y"] - R["y"])]

    def up_pt(q):
        return [q[0] - R["x"], R["h"] - (q[1] - R["y"])]

    inside = lambda r: r["x"] < R["x"] + R["w"] and r["x"] + r["w"] > R["x"] and r["y"] < R["y"] + R["h"] and r["y"] + r["h"] > R["y"]
    dens = 1.0
    spec = {
        "width": round(R["w"], 1), "height": round(R["h"], 1),
        "open": [[0, 0, R["w"], R["h"]]],
        "content": [up_box(r) for r in geo["content"] if inside(r)],
        "keep": [up_box({"x": k[0], "y": k[1], "w": k[2] - k[0], "h": k[3] - k[1]}) for k in keep],
        "guides": [dict(g, pts=[up_pt(q) for q in sway(g["pts"], g.get("amp", 14), g.get("waves", 1.4), seed * 1.7 + i)]) for i, g in enumerate(P["guides"])],
        "emph": [up_pt(q[:2]) + [q[2]] for q in P["emph"]],
        "hard": 22, "soft": 110, "slope": 0.42, "mw": 118,
        "seed": seed,
        "mix": {"gyps": 0, "ghost": 0, "lily": 0, "soft": 0.5, "cyme": 0.55 * dens, "umbel": 0.6 * dens, "bloom": 1, "sprays": 0.5 * dens, "leaflets": 0.8, "curls": 0.6},
        "compose": {"sprays": int(26 * dens), "small_blooms": 5, "leaves": int(40 * dens), "leaf_size": 1.0, "hole_min": 10},
        "palette": {"hero": "momiji", "blooms": "momiji", "sprays": "momiji", "ghost": "momiji", "leaves": "kon-peki", "leaflets": "kon-peki", "stems": "kon-peki"},
    }
    if P.get("hero"):
        spec["hero"] = up_pt(P["hero"][:2]) + [P["hero"][2]]
    return spec


def compose(spec: dict) -> str:
    r = subprocess.run(["lua5.4", str(HERE / "driver.lua")], input=lua(spec), capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stderr)
    print("    " + r.stderr.strip(), flush=True)
    return r.stdout


# Paint the scene, split it by hue into the leaf and flower inks, and map
# its growth: the distance along the garden from its roots, through the
# painted plants (gaps cost more), at half the masks' resolution.
PAINT = """async ([sceneText, px, roots]) => {
  const { paint } = await import('/painter.js');
  const scene = JSON.parse(sceneText);
  const scale = px / scene.width;
  const w = Math.round(px), h = Math.round(scene.height * scale);
  const c = new OffscreenCanvas(w, h);
  paint(c.getContext('2d'), scene, scale);
  const src = c.getContext('2d').getImageData(0, 0, w, h).data;
  const leaf = new Uint8ClampedArray(w * h), flower = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < w * h; i++, p += 4) {
    const r = src[p], g = src[p + 1], b = src[p + 2], a = src[p + 3];
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    const dark = Math.min(255, Math.max(0, (255 - lum) * 1.5));
    const cov = dark * a / 255;
    const warm = Math.min(255, Math.max(0, r - b) * 5);
    const f = cov * warm / 255;
    flower[i] = f; leaf[i] = Math.max(0, cov - f);
  }
  const W2 = Math.ceil(w / 2), H2 = Math.ceil(h / 2), N = W2 * H2;
  const cv = new Uint8Array(N);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = leaf[y * w + x] + flower[y * w + x], i = (y >> 1) * W2 + (x >> 1);
    if (v > cv[i]) cv[i] = Math.min(255, v);
  }
  const dist = new Float32Array(N).fill(Infinity);
  let hi = new Int32Array(N * 2), hd = new Float32Array(N * 2), n = 0;
  const push = (i, d) => {
    if (n >= hi.length) { const a = new Int32Array(hi.length * 2); a.set(hi); hi = a; const b = new Float32Array(hd.length * 2); b.set(hd); hd = b; }
    let k = n++;
    while (k > 0) { const q = (k - 1) >> 1; if (hd[q] <= d) break; hi[k] = hi[q]; hd[k] = hd[q]; k = q; }
    hi[k] = i; hd[k] = d;
  };
  const pop = () => {
    const i = hi[0], d = hd[0]; n--;
    if (n > 0) {
      const li = hi[n], ld = hd[n]; let k = 0;
      for (;;) { let a = 2 * k + 1; if (a >= n) break; if (a + 1 < n && hd[a + 1] < hd[a]) a++; if (hd[a] >= ld) break; hi[k] = hi[a]; hd[k] = hd[a]; k = a; }
      hi[k] = li; hd[k] = ld;
    }
    return [i, d];
  };
  for (const [rx, ry] of roots) {
    const x = Math.max(0, Math.min(W2 - 1, Math.round(rx * scale / 2))), y = Math.max(0, Math.min(H2 - 1, Math.round(ry * scale / 2)));
    dist[y * W2 + x] = 0; push(y * W2 + x, 0);
  }
  const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];
  while (n > 0) {
    const [i, d] = pop();
    if (d > dist[i]) continue;
    const x = i % W2, y = (i / W2) | 0;
    for (let k = 0; k < 8; k++) {
      const X = x + DX[k], Y = y + DY[k];
      if (X < 0 || Y < 0 || X >= W2 || Y >= H2) continue;
      const j = Y * W2 + X, nd = d + (k < 4 ? 1 : 1.4142) * (cv[j] > 8 ? 1 : 8);
      if (nd < dist[j]) { dist[j] = nd; push(j, nd); }
    }
  }
  let max = 1;
  for (let i = 0; i < N; i++) if (cv[i] > 8 && dist[i] > max && dist[i] < Infinity) max = dist[i];
  const birth = new Uint8ClampedArray(N).fill(255);
  for (let i = 0; i < N; i++) if (cv[i] > 8) birth[i] = Math.round(255 * Math.min(1, dist[i] / max));
  // Carry each painted pixel's time a few pixels out, so the masks' soft
  // edges grow with the stroke they belong to.
  for (let pass = 0; pass < 3; pass++) {
    const prev = birth.slice();
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = y * W2 + x; if (cv[i] > 8) continue;
      let m = prev[i];
      for (let k = 0; k < 8; k++) { const X = x + DX[k], Y = y + DY[k]; if (X >= 0 && Y >= 0 && X < W2 && Y < H2) m = Math.min(m, prev[Y * W2 + X]); }
      birth[i] = m;
    }
  }
  const png = async (data, cw, ch) => {
    const o = new OffscreenCanvas(cw, ch), ctx = o.getContext('2d'), img = ctx.createImageData(cw, ch);
    for (let i = 0; i < cw * ch; i++) { img.data[4 * i] = img.data[4 * i + 1] = img.data[4 * i + 2] = data[i]; img.data[4 * i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    const buf = new Uint8Array(await (await o.convertToBlob({ type: 'image/png' })).arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  };
  return { leaf: await png(leaf, w, h), flower: await png(flower, w, h), birth: await png(birth, W2, H2) };
}"""


def save_mask(gray_png_b64: str, path: Path) -> None:
    """An ink's mask as WebP alpha. cwebp's lossy alpha halves the file; its
    error (a few levels in 255) is lost at watermark strength."""
    from PIL import Image
    gray = Image.open(io.BytesIO(base64.b64decode(gray_png_b64))).convert("L")
    encode_mask(gray, path)


def encode_mask(gray, path: Path) -> None:
    from PIL import Image
    rgba = Image.new("RGBA", gray.size, (0, 0, 0, 0))
    rgba.putalpha(gray)
    with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
        rgba.save(tmp.name)
        subprocess.run(["cwebp", "-quiet", "-q", "80", "-alpha_q", "60", "-alpha_filter", "best", "-m", "6", tmp.name, "-o", str(path)], check=True)


def save_gray(gray_png_b64: str, path: Path) -> None:
    from PIL import Image
    Image.open(io.BytesIO(base64.b64decode(gray_png_b64))).convert("L").save(path, "WEBP", quality=82, method=6)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def build_and_serve(tmp: Path) -> tuple[str, socketserver.TCPServer]:
    site = tmp / "site"
    subprocess.run(["hugo", "--minify", "--noBuildLock", "--destination", str(site), "--cacheDir", str(tmp / "cache")],
                   cwd=ROOT, check=True, capture_output=True)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(site)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{httpd.server_address[1]}", httpd


def pages_from_sitemap(base: str, site_dir: Path) -> list[str]:
    import re
    text = (site_dir / "sitemap.xml").read_text(encoding="utf-8")
    paths = [re.sub(r"^https?://[^/]+", "", u) for u in re.findall(r"<loc>([^<]+)</loc>", text)]
    return sorted({p for p in paths if page_kind(p)} | {"/404.html"})


def open_page(browser, base: str, path: str, width: int, parts: list[str]):
    ctx = browser.new_context(viewport={"width": width, "height": HEIGHT})
    ctx.add_init_script("try{sessionStorage.setItem('index-opened','1');localStorage.setItem('sunlit-theme','day');"
                        "localStorage.setItem('nisch-ink-v1', JSON.stringify({version:1,id:'lokta-hybrid',source:'chosen'}))}catch(e){}")
    page = ctx.new_page()
    page.goto(base + path, wait_until="networkidle")
    # The garden's own room at the head and foot, as the page has it with a
    # garden: replace any garden already there with empty ones of these parts.
    page.evaluate("""(parts) => {
      document.querySelectorAll('body > .garden').forEach((g) => g.remove());
      const main = document.querySelector('body > main');
      for (const p of parts) { const g = document.createElement('div'); g.className = 'garden garden--' + p; document.body.insertBefore(g, main); }
    }""", parts)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    return ctx, page


def main() -> None:
    from playwright.sync_api import sync_playwright
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--widths", default=",".join(map(str, WIDTHS)))
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    widths = [int(w) for w in args.widths.split(",")]
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"pages": {}}

    tmp = Path(tempfile.mkdtemp(prefix="garden-"))
    try:
        base, httpd = build_and_serve(tmp)
        paths = args.paths or pages_from_sitemap(base, tmp / "site")
        ops = (VENDOR / "site/src/lib/scene-ops.json").read_text()
        painter = (VENDOR / "site/src/lib/scene.js").read_text().replace(
            'import OPERATORS from "./scene-ops.json";', f"const OPERATORS = {ops};")
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome")
            pp = browser.new_page()
            pp.route("**/painter.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=painter))
            pp.route("**/blank", lambda r: r.fulfill(status=200, content_type="text/html", body="<!doctype html><title>painter</title>"))
            pp.goto("http://painter.local/blank")
            stale = []
            for path in paths:
                kp = page_kind(path)
                if not kp:
                    print(f"{path}: no garden for this kind of page")
                    continue
                kind, parts = kp
                entry = manifest["pages"].get(path, {}) if args.check else {
                    "kind": kind, "sources": page_sources(path), "hash": source_hash(page_sources(path)), "parts": {}}
                for width in widths:
                    ctx, page = open_page(browser, base, path, width, parts)
                    geo = page.evaluate(MEASURE)
                    body = geo["body"]
                    for part in parts:
                        R, P, keep = plan(kind, part, geo)
                        content = [[round(r["x"] - body["x"]), round(r["y"] - body["y"]), round(r["w"]), round(r["h"])]
                                   for r in geo["content"]
                                   if r["x"] < R["x"] + R["w"] and r["x"] + r["w"] > R["x"] and r["y"] < R["y"] + R["h"] and r["y"] + r["h"] > R["y"]]
                        if args.check:
                            old = entry.get("parts", {}).get(part, {}).get("widths", {}).get(str(width))
                            if not old or old.get("content") != content:
                                stale.append(f"{path} {part} at {width}px")
                            continue
                        print(f"{path} {part} at {width}px: {R['w']:.0f}x{R['h']:.0f}, {len(content)} blocks", flush=True)
                        spec = spec_for(kind, R, P, keep, geo, args.seed)
                        scene = compose(spec)
                        roots = [[g["pts"][0][0], spec["height"] - g["pts"][0][1]] for g in spec["guides"]]
                        out = pp.evaluate(PAINT, [scene, R["w"] * SCALE, roots])
                        folder = ASSETS / slug_for(path)
                        folder.mkdir(parents=True, exist_ok=True)
                        names = {k: f"{part}-{width}-{k}.webp" for k in ("leaf", "flower", "birth")}
                        save_mask(out["leaf"], folder / names["leaf"])
                        save_mask(out["flower"], folder / names["flower"])
                        save_gray(out["birth"], folder / names["birth"])
                        # The box runs from trim to trim (or to the margin
                        # column's edge) and hangs from the top trim, or the
                        # bottom one at a note's foot; garden.css places it
                        # from the layout's own measures, so only its height
                        # is recorded, with its width for reference.
                        record = {"w": round(R["w"], 1), "h": round(R["h"], 1), "content": content}
                        record.update({k: f"gardens/{slug_for(path)}/{v}" for k, v in names.items()})
                        entry["parts"].setdefault(part, {"widths": {}})["widths"][str(width)] = record
                    ctx.close()
                if not args.check:
                    manifest["pages"][path] = entry
            browser.close()
        httpd.shutdown()
        if args.check:
            print("\n".join(["Gardens whose page has moved since they were grown:"] + stale) if stale else "Every garden fits its page.")
            sys.exit(1 if stale else 0)
        manifest.update({"tikz_flora": "6885979", "seed": args.seed, "widths": widths})
        MANIFEST.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
        print("wrote", MANIFEST.relative_to(ROOT))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
