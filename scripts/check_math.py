#!/usr/bin/env python3
"""Check mathematical Markdown, then run Hugo's strict draft build."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


PINNED_HUGO = "0.164.0"
ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
SLUG_RE = re.compile(r"^[a-z][a-z0-9-]*$")
FENCE_RE = re.compile(r"^\s*(?P<fence>(?:\x60{3,}|~{3,}))")
STALE_REFERENCE_RE = re.compile(r"\\(?:label|ref|eqref)\s*\{")
BARE_EQUATION_RE = re.compile(r"\\begin\s*\{equation\*?\}")
EQUATION_RE = re.compile(
    r'\{\{<\s*equation\b[^>]*\bid\s*=\s*"(?P<id>[^"]+)"[^>]*>\}\}'
)
STATEMENT_RE = re.compile(
    r'\{\{<\s*statement\b[^>]*\bid\s*=\s*"(?P<id>[^"]+)"[^>]*>\}\}'
)
EQREF_RE = re.compile(r'\{\{<\s*eqref\s+"(?P<id>[^"]+)"\s*>\}\}')
STATEMENT_REF_RE = re.compile(
    r'\{\{<\s*statement-ref\s+"(?P<id>[^"]+)"\s*>\}\}'
)
EQUATION_CLOSE = "{{< /equation >}}"


@dataclass(order=True)
class Issue:
    path: Path
    line: int
    column: int
    message: str

    def display(self) -> str:
        return f"{self.path.relative_to(ROOT)}:{self.line}:{self.column}: {self.message}"


def is_escaped(text: str, index: int) -> bool:
    slashes = 0
    index -= 1
    while index >= 0 and text[index] == "\\":
        slashes += 1
        index -= 1
    return slashes % 2 == 1


def mask_inline_code(line: str, open_ticks: int | None) -> tuple[str, int | None]:
    chars = list(line)
    index = 0
    while index < len(line):
        if line[index] != "\x60":
            if open_ticks is not None:
                chars[index] = " "
            index += 1
            continue

        end = index
        while end < len(line) and line[end] == "\x60":
            end += 1
        run = end - index
        for cursor in range(index, end):
            chars[cursor] = " "

        if open_ticks is None:
            open_ticks = run
        elif run == open_ticks:
            open_ticks = None
        index = end

    return "".join(chars), open_ticks


def add_target(
    issues: list[Issue],
    targets: dict[str, tuple[int, int]],
    identifier: str,
    kind: str,
    path: Path,
    line: int,
    column: int,
) -> None:
    if not SLUG_RE.fullmatch(identifier):
        issues.append(
            Issue(path, line, column, f'{kind} id "{identifier}" is not slug-like')
        )
    if identifier in targets:
        first_line, _ = targets[identifier]
        issues.append(
            Issue(
                path,
                line,
                column,
                f'duplicate {kind} id "{identifier}" (first used on line {first_line})',
            )
        )
    else:
        targets[identifier] = (line, column)


def scan_delimiters(
    text: str,
    path: Path,
    line_number: int,
    issues: list[Issue],
    state: tuple[str, int, int] | None,
) -> tuple[str, int, int] | None:
    index = 0
    while index < len(text):
        if state is None:
            if text.startswith(r"\)", index) and not is_escaped(text, index):
                issues.append(
                    Issue(path, line_number, index + 1, "closing \\) has no opening \\(")
                )
                index += 2
                continue
            if text.startswith(r"\]", index) and not is_escaped(text, index):
                issues.append(
                    Issue(path, line_number, index + 1, "closing \\] has no opening \\[")
                )
                index += 2
                continue
            if text.startswith(r"\(", index) and not is_escaped(text, index):
                state = ("paren", line_number, index + 1)
                index += 2
                continue
            if text.startswith(r"\[", index) and not is_escaped(text, index):
                state = ("bracket", line_number, index + 1)
                index += 2
                continue
            if text.startswith("$$", index) and not is_escaped(text, index):
                state = ("display-dollar", line_number, index + 1)
                index += 2
                continue
            if text[index] == "$" and not is_escaped(text, index):
                state = ("inline-dollar", line_number, index + 1)
                index += 1
                continue
            index += 1
            continue

        kind = state[0]
        if kind == "paren":
            if text.startswith(r"\)", index) and not is_escaped(text, index):
                state = None
                index += 2
                continue
        elif kind == "bracket":
            if text.startswith(r"\]", index) and not is_escaped(text, index):
                state = None
                index += 2
                continue
        elif kind == "display-dollar":
            if text.startswith("$$", index) and not is_escaped(text, index):
                state = None
                index += 2
                continue
        elif kind == "inline-dollar":
            if text.startswith("$$", index) and not is_escaped(text, index):
                issues.append(
                    Issue(
                        path,
                        line_number,
                        index + 1,
                        "display delimiter $$ appears inside inline $…$ mathematics",
                    )
                )
                index += 2
                continue
            if text[index] == "$" and not is_escaped(text, index):
                state = None
                index += 1
                continue
        index += 1
    return state


def scan_file(path: Path) -> list[Issue]:
    issues: list[Issue] = []
    lines = path.read_text(encoding="utf-8").splitlines()
    equation_targets: dict[str, tuple[int, int]] = {}
    statement_targets: dict[str, tuple[int, int]] = {}
    equation_refs: list[tuple[str, int, int]] = []
    statement_refs: list[tuple[str, int, int]] = []
    delimiter_state: tuple[str, int, int] | None = None
    open_ticks: int | None = None
    fence: tuple[str, int] | None = None
    in_equation = False

    start = 0
    if lines and lines[0].strip() in {"+++", "---"}:
        marker = lines[0].strip()
        start = 1
        while start < len(lines):
            if lines[start].strip() == marker:
                start += 1
                break
            start += 1

    for offset, raw_line in enumerate(lines[start:], start=start + 1):
        stripped = raw_line.lstrip()
        if fence is not None:
            character, minimum = fence
            closing = re.match(
                rf"^\s*{re.escape(character)}{{{minimum},}}\s*$", raw_line
            )
            if closing:
                fence = None
            continue

        opening = FENCE_RE.match(raw_line)
        if opening:
            token = opening.group("fence")
            fence = (token[0], len(token))
            continue

        clean, open_ticks = mask_inline_code(raw_line, open_ticks)

        for match in STALE_REFERENCE_RE.finditer(clean):
            command = match.group(0).split("{", 1)[0]
            issues.append(
                Issue(
                    path,
                    offset,
                    match.start() + 1,
                    f"stale {command} command; use eqref or statement-ref shortcodes",
                )
            )
        for match in BARE_EQUATION_RE.finditer(clean):
            issues.append(
                Issue(
                    path,
                    offset,
                    match.start() + 1,
                    "bare equation environment; use the equation shortcode",
                )
            )

        for match in EQUATION_RE.finditer(clean):
            add_target(
                issues,
                equation_targets,
                match.group("id"),
                "equation",
                path,
                offset,
                match.start() + 1,
            )
        for match in STATEMENT_RE.finditer(clean):
            add_target(
                issues,
                statement_targets,
                match.group("id"),
                "statement",
                path,
                offset,
                match.start() + 1,
            )
        for match in EQREF_RE.finditer(clean):
            equation_refs.append((match.group("id"), offset, match.start() + 1))
        for match in STATEMENT_REF_RE.finditer(clean):
            statement_refs.append((match.group("id"), offset, match.start() + 1))

        if in_equation:
            if EQUATION_CLOSE in clean:
                in_equation = False
            continue
        if EQUATION_RE.search(clean):
            in_equation = True
            continue

        delimiter_state = scan_delimiters(
            clean, path, offset, issues, delimiter_state
        )

    if delimiter_state is not None:
        names = {
            "paren": r"\(…\)",
            "bracket": r"\[…\]",
            "display-dollar": "$$…$$",
            "inline-dollar": "$…$",
        }
        kind, line, column = delimiter_state
        issues.append(
            Issue(path, line, column, f"unclosed mathematics delimiter {names[kind]}")
        )

    for identifier, line, column in equation_refs:
        if identifier not in equation_targets:
            issues.append(
                Issue(path, line, column, f'missing same-page equation "{identifier}"')
            )
    for identifier, line, column in statement_refs:
        if identifier not in statement_targets:
            issues.append(
                Issue(path, line, column, f'missing same-page statement "{identifier}"')
            )

    return issues


def find_hugo() -> str | None:
    configured = os.environ.get("HUGO_BIN")
    if configured:
        return configured
    return shutil.which("hugo")


def verify_hugo(hugo: str) -> bool:
    try:
        result = subprocess.run(
            [hugo, "version"],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError as error:
        print(f"Unable to run Hugo: {error}", file=sys.stderr)
        return False

    version_text = (result.stdout + result.stderr).strip()
    match = re.search(r"\bhugo v([0-9]+\.[0-9]+\.[0-9]+)", version_text)
    if result.returncode != 0 or match is None:
        print(f"Unable to determine Hugo version from: {version_text}", file=sys.stderr)
        return False
    if match.group(1) != PINNED_HUGO:
        print(
            f"Hugo {PINNED_HUGO} is required; found {match.group(1)}. "
            "Set HUGO_BIN to the pinned binary.",
            file=sys.stderr,
        )
        return False
    return True


def run_hugo(hugo: str) -> int:
    with tempfile.TemporaryDirectory(prefix="nisch-math-check-") as temporary:
        temporary_path = Path(temporary)
        command = [
            hugo,
            "--buildDrafts",
            "--cacheDir",
            str(temporary_path / "cache"),
            "--destination",
            str(temporary_path / "site"),
            "--cleanDestinationDir",
        ]
        return subprocess.run(command, cwd=ROOT, check=False).returncode


def main() -> int:
    files = sorted(CONTENT.rglob("*.md")) + sorted(CONTENT.rglob("*.markdown"))
    issues = sorted(issue for path in files for issue in scan_file(path))
    if issues:
        for issue in issues:
            print(issue.display(), file=sys.stderr)
        print(f"\nMath source check failed with {len(issues)} issue(s).", file=sys.stderr)
        return 1

    hugo = find_hugo()
    if hugo is None:
        print(
            "Hugo was not found. Install 0.164.0 or set HUGO_BIN to its path.",
            file=sys.stderr,
        )
        return 1
    if not verify_hugo(hugo):
        return 1

    result = run_hugo(hugo)
    if result != 0:
        return result

    print(f"Math source checks passed; Hugo {PINNED_HUGO} draft build completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
