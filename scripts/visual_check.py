#!/usr/bin/env python3
"""Load every kind of page in a browser and check the layout holds.

This is an optional companion to ./scripts/qa.sh. It needs a running preview
(./scripts/dev.sh) and Python Playwright with Chrome installed, so it is not
part of the required check. For each page, width, and light it reports:

- horizontal overflow (the page must never scroll sideways);
- console errors and failed requests (a missing page's own 404 is expected);
- duplicate view-transition names, which break passages between pages;
- the index card, and on desktop that it lies inside the window beside the
  page without touching the page's frame;
- the page's frame (the theme's crop corners).

Usage:
    python3 scripts/visual_check.py
    python3 scripts/visual_check.py --base http://127.0.0.1:1320 --widths 1440,390
"""

import argparse
import sys
import urllib.request
from html.parser import HTMLParser

PAGES = [
    "/",
    "/papers/",
    "/blog/",
    # The article specimen: a draft, built only in previews and never listed.
    "/blog/scratch/",
    "/this-page-does-not-exist/",
]

WIDTHS = {1920: 1080, 1440: 900, 1280: 800, 1180: 820, 1024: 768, 390: 844}

PROBE = """() => {
  const card = document.querySelector('.index-slip');
  const body = document.body.getBoundingClientRect();
  const names = [...document.querySelectorAll('*')]
    .map((element) => getComputedStyle(element).viewTransitionName)
    .filter((name) => name && name !== 'none');
  const rect = card ? card.getBoundingClientRect() : null;
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    names,
    card: rect ? [rect.left, rect.right] : null,
    body: [body.left, body.right],
    frame: !!document.querySelector('body > .crop-c'),
  };
}"""


class CardItems(HTMLParser):
    """Collects the addresses of the items the index card lists."""

    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "slip-item" in (attrs.get("class") or "").split():
            self.hrefs.append(attrs.get("href") or "")


def page_list(base):
    """The fixed pages plus every paper and note the home page's card lists."""
    pages = list(PAGES)
    try:
        with urllib.request.urlopen(base + "/", timeout=10) as response:
            items = CardItems()
            items.feed(response.read().decode("utf-8"))
            pages += [href for href in items.hrefs if href.startswith("/")]
    except OSError as error:
        print(f"could not read {base}/: {error}", file=sys.stderr)
    return list(dict.fromkeys(pages))


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--base", default="http://127.0.0.1:1315")
    parser.add_argument("--widths", default=",".join(str(width) for width in WIDTHS))
    parser.add_argument("--modes", default="day,night")
    args = parser.parse_args()

    from playwright.sync_api import sync_playwright

    base = args.base.rstrip("/")
    widths = [int(width) for width in args.widths.split(",")]
    modes = args.modes.split(",")
    pages = page_list(base)
    problems = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        for mode in modes:
            for width in widths:
                height = WIDTHS.get(width, 900)
                context = browser.new_context(viewport={"width": width, "height": height})
                context.add_init_script(
                    "try{localStorage.setItem('sunlit-theme','%s');"
                    "sessionStorage.setItem('index-opened','1')}catch(e){}" % mode
                )
                page = context.new_page()
                errors = []
                page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
                page.on("pageerror", lambda error: errors.append(str(error)))
                for path in pages:
                    errors.clear()
                    response = page.goto(base + path, wait_until="networkidle")
                    page.wait_for_timeout(250)
                    found = page.evaluate(PROBE)
                    where = f"{mode} {width} {path}"
                    missing = response is not None and response.status == 404
                    unexpected = [error for error in errors if not (missing and "404" in error)]
                    if found["overflow"] > 0:
                        problems.append(f"{where}: scrolls sideways by {found['overflow']}px")
                    if unexpected:
                        problems.append(f"{where}: console {unexpected[:2]}")
                    if len(found["names"]) != len(set(found["names"])):
                        problems.append(f"{where}: repeated transition names {found['names']}")
                    if not found["card"]:
                        problems.append(f"{where}: no index card")
                    elif width >= 960:
                        left, right = found["card"]
                        if left < 0 or right > found["body"][0]:
                            problems.append(f"{where}: card at {left:.0f}-{right:.0f} meets the page at {found['body'][0]:.0f}")
                    if width >= 960 and not found["frame"]:
                        problems.append(f"{where}: no page frame")
                context.close()
        browser.close()

    checked = len(pages) * len(widths) * len(modes)
    if problems:
        print(f"{len(problems)} problem(s) in {checked} page views:")
        for problem in problems:
            print("  " + problem)
        return 1
    print(f"{checked} page views: no overflow, console errors, repeated transition names, or misplaced cards.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
