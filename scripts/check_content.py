#!/usr/bin/env python3
"""Validate authored content, then run the pinned Hugo draft build."""

from __future__ import annotations

import argparse
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urlsplit


PINNED_HUGO = "0.164.0"
ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"

SLUG_RE = re.compile(r"^[a-z][a-z0-9-]*$")
LATIN_INITIAL_RE = re.compile(r"^[A-Za-z]$")
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

SHORTCODE_RE = re.compile(
    r"\{\{<\s*(?P<angle_name>/?[A-Za-z][\w-]*)"
    r"(?P<angle_args>.*?)>\}\}"
    r"|\{\{%\s*(?P<percent_name>/?[A-Za-z][\w-]*)"
    r"(?P<percent_args>.*?)%\}\}",
    re.DOTALL,
)
MARKDOWN_IMAGE_RE = re.compile(
    r"!\[[^\]\n]*\]\(\s*(?P<destination><[^>\n]+>|[^)\s]+)",
    re.MULTILINE,
)
HTML_MEDIA_TAG_RE = re.compile(
    r"<(?:img|video|audio|source)\b[^>]*>", re.IGNORECASE | re.DOTALL
)
HTML_MEDIA_ATTRIBUTE_RE = re.compile(
    r"\b(?:src|poster)\s*=\s*(?P<quote>['\"])(?P<src>.*?)(?P=quote)",
    re.IGNORECASE | re.DOTALL,
)

VALID_PLACEMENTS = {"measure", "wide", "margin"}
VALID_TREATMENTS = {"natural", "ink"}


@dataclass(order=True)
class Diagnostic:
    path: Path
    line: int
    column: int
    message: str

    def display(self) -> str:
        return f"{self.path.relative_to(ROOT)}:{self.line}:{self.column}: {self.message}"


@dataclass(frozen=True)
class Shortcode:
    name: str
    arguments: str
    start: int
    end: int
    line: int
    column: int


@dataclass
class SourceScan:
    issues: list[Diagnostic]
    warnings: list[Diagnostic]


def frontmatter_end(lines: list[str]) -> int:
    if not lines or lines[0].strip() not in {"+++", "---"}:
        return 0

    marker = lines[0].strip()
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == marker:
            return index + 1
    return len(lines)


def page_is_draft(lines: list[str], body_start: int) -> bool:
    if body_start == 0:
        return False
    frontmatter = "\n".join(lines[1 : body_start - 1])
    match = re.search(
        r"(?im)^\s*draft\s*(?:=|:)\s*(?P<value>true|false)\b", frontmatter
    )
    return bool(match and match.group("value").lower() == "true")


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


def masked_lines(lines: list[str], body_start: int) -> list[str]:
    """Mask front matter and Markdown code while retaining source offsets."""

    masked = [" " * len(line) for line in lines]
    open_ticks: int | None = None
    fence: tuple[str, int] | None = None

    for index, raw_line in enumerate(lines[body_start:], start=body_start):
        if fence is not None:
            character, minimum = fence
            if re.match(rf"^\s*{re.escape(character)}{{{minimum},}}\s*$", raw_line):
                fence = None
            continue

        opening = FENCE_RE.match(raw_line)
        if opening:
            token = opening.group("fence")
            fence = (token[0], len(token))
            continue

        # Four-space indentation is a Markdown code block outside list contexts.
        if raw_line.startswith("    ") and raw_line.strip():
            continue

        clean, open_ticks = mask_inline_code(raw_line, open_ticks)
        masked[index] = clean

    return masked


def offset_line_column(text: str, offset: int) -> tuple[int, int]:
    line = text.count("\n", 0, offset) + 1
    previous_newline = text.rfind("\n", 0, offset)
    return line, offset - previous_newline


def find_shortcodes(text: str) -> list[Shortcode]:
    shortcodes: list[Shortcode] = []
    for match in SHORTCODE_RE.finditer(text):
        name = match.group("angle_name") or match.group("percent_name")
        arguments = match.group("angle_args")
        if arguments is None:
            arguments = match.group("percent_args") or ""
        line, column = offset_line_column(text, match.start())
        shortcodes.append(
            Shortcode(name, arguments, match.start(), match.end(), line, column)
        )
    return shortcodes


def parse_shortcode_arguments(
    shortcode: Shortcode, path: Path, issues: list[Diagnostic]
) -> tuple[list[str], dict[str, str]] | None:
    # Hugo accepts whitespace around '='. Normalizing it lets shlex preserve quoted
    # values containing spaces while keeping this parser dependency-free.
    source = re.sub(r"([A-Za-z_][\w-]*)\s*=\s*", r"\1=", shortcode.arguments)
    lexer = shlex.shlex(source, posix=True)
    lexer.whitespace_split = True
    lexer.commenters = ""
    try:
        tokens = list(lexer)
    except ValueError as error:
        issues.append(
            Diagnostic(
                path,
                shortcode.line,
                shortcode.column,
                f"cannot parse {shortcode.name} shortcode arguments: {error}",
            )
        )
        return None

    positional: list[str] = []
    named: dict[str, str] = {}
    for token in tokens:
        if "=" not in token:
            positional.append(token)
            continue
        key, value = token.split("=", 1)
        key = key.lower()
        if not key:
            positional.append(token)
            continue
        if key in named:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f'{shortcode.name} repeats the "{key}" argument',
                )
            )
        named[key] = value
    return positional, named


def parse_bool(
    value: str | None,
    name: str,
    shortcode: Shortcode,
    path: Path,
    issues: list[Diagnostic],
) -> bool:
    if value is None:
        return False
    normalized = value.lower()
    if normalized == "true":
        return True
    if normalized == "false":
        return False
    issues.append(
        Diagnostic(
            path,
            shortcode.line,
            shortcode.column,
            f'{shortcode.name} "{name}" must be true or false',
        )
    )
    return False


def add_target(
    issues: list[Diagnostic],
    targets: dict[str, tuple[int, int]],
    identifier: str,
    kind: str,
    path: Path,
    line: int,
    column: int,
) -> None:
    if not SLUG_RE.fullmatch(identifier):
        issues.append(
            Diagnostic(path, line, column, f'{kind} id "{identifier}" is not slug-like')
        )
    if identifier in targets:
        first_line, _ = targets[identifier]
        issues.append(
            Diagnostic(
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
    issues: list[Diagnostic],
    state: tuple[str, int, int] | None,
) -> tuple[str, int, int] | None:
    index = 0
    while index < len(text):
        if state is None:
            if text.startswith(r"\)", index) and not is_escaped(text, index):
                issues.append(
                    Diagnostic(path, line_number, index + 1, "closing \\) has no opening \\(")
                )
                index += 2
                continue
            if text.startswith(r"\]", index) and not is_escaped(text, index):
                issues.append(
                    Diagnostic(path, line_number, index + 1, "closing \\] has no opening \\[")
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
                    Diagnostic(
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


def scan_mathematics(
    path: Path, lines: list[str], clean_lines: list[str], body_start: int
) -> list[Diagnostic]:
    issues: list[Diagnostic] = []
    equation_targets: dict[str, tuple[int, int]] = {}
    statement_targets: dict[str, tuple[int, int]] = {}
    equation_refs: list[tuple[str, int, int]] = []
    statement_refs: list[tuple[str, int, int]] = []
    delimiter_state: tuple[str, int, int] | None = None
    in_equation = False

    for index in range(body_start, len(lines)):
        clean = clean_lines[index]
        if not clean.strip() and lines[index].strip():
            continue
        line_number = index + 1

        for match in STALE_REFERENCE_RE.finditer(clean):
            command = match.group(0).split("{", 1)[0]
            issues.append(
                Diagnostic(
                    path,
                    line_number,
                    match.start() + 1,
                    f"stale {command} command; use eqref or statement-ref shortcodes",
                )
            )
        for match in BARE_EQUATION_RE.finditer(clean):
            issues.append(
                Diagnostic(
                    path,
                    line_number,
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
                line_number,
                match.start() + 1,
            )
        for match in STATEMENT_RE.finditer(clean):
            add_target(
                issues,
                statement_targets,
                match.group("id"),
                "statement",
                path,
                line_number,
                match.start() + 1,
            )
        for match in EQREF_RE.finditer(clean):
            equation_refs.append((match.group("id"), line_number, match.start() + 1))
        for match in STATEMENT_REF_RE.finditer(clean):
            statement_refs.append((match.group("id"), line_number, match.start() + 1))

        if in_equation:
            if EQUATION_CLOSE in clean:
                in_equation = False
            continue
        if EQUATION_RE.search(clean):
            in_equation = True
            continue

        delimiter_state = scan_delimiters(
            clean, path, line_number, issues, delimiter_state
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
            Diagnostic(path, line, column, f"unclosed mathematics delimiter {names[kind]}")
        )

    for identifier, line, column in equation_refs:
        if identifier not in equation_targets:
            issues.append(
                Diagnostic(path, line, column, f'missing same-page equation "{identifier}"')
            )
    for identifier, line, column in statement_refs:
        if identifier not in statement_targets:
            issues.append(
                Diagnostic(path, line, column, f'missing same-page statement "{identifier}"')
            )

    return issues


def first_plain_prose_line(
    clean_lines: list[str], body_start: int, stop_before: int
) -> int | None:
    """Find ordinary prose before a drop cap, ignoring structural prelude material."""

    in_html_comment = False
    in_block_shortcode: str | None = None
    in_multiline_shortcode = False
    for index in range(body_start, min(stop_before, len(clean_lines))):
        stripped = clean_lines[index].strip()
        if not stripped:
            continue

        if in_html_comment:
            if "-->" in stripped:
                in_html_comment = False
            continue
        if stripped.startswith("<!--"):
            if "-->" not in stripped:
                in_html_comment = True
            continue

        if in_multiline_shortcode:
            if re.search(r"[>%]\}\}\s*$", stripped):
                in_multiline_shortcode = False
            continue

        if in_block_shortcode is not None:
            if re.search(
                rf"\{{\{{[<%]\s*/{re.escape(in_block_shortcode)}\b", stripped
            ):
                in_block_shortcode = None
            continue

        block_match = re.match(
            r"\{\{[<%]\s*(equation|statement|proof)\b", stripped
        )
        if block_match:
            name = block_match.group(1)
            if not re.search(rf"\{{\{{[<%]\s*/{name}\b", stripped):
                in_block_shortcode = name
            continue

        if re.match(r"^\{\{[<%]\s*[A-Za-z][\w-]*\b", stripped) and not re.search(
            r"[>%]\}\}", stripped
        ):
            in_multiline_shortcode = True
            continue

        if re.match(r"^#{1,6}(?:\s|$)", stripped):
            continue
        if re.match(r"^(?:-{3,}|\*{3,}|_{3,})\s*$", stripped):
            continue
        if re.match(r"^>\s*", stripped):
            continue
        if re.match(r"^!\[[^\]]*\]\([^)]*\)\s*$", stripped):
            continue
        if re.match(r"^\[[^\]]+\]:\s*\S+", stripped):
            continue
        if re.match(r"^\|?(?:\s*:?-+:?\s*\|)+", stripped):
            continue
        if re.match(r"^<[^>]+>\s*$", stripped):
            continue
        if re.match(r"^\{\{[<%]\s*/?[A-Za-z][\w-]*\b.*[>%]\}\}\s*$", stripped):
            continue

        return index + 1
    return None


def scan_dropcaps(
    path: Path,
    clean_lines: list[str],
    body_start: int,
    text: str,
    shortcodes: list[Shortcode],
) -> list[Diagnostic]:
    issues: list[Diagnostic] = []
    dropcaps = [shortcode for shortcode in shortcodes if shortcode.name == "dropcap"]

    if len(dropcaps) > 1:
        first = dropcaps[0]
        for shortcode in dropcaps[1:]:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f"only one dropcap is allowed per page (first used on line {first.line})",
                )
            )

    for shortcode in dropcaps:
        parsed = parse_shortcode_arguments(shortcode, path, issues)
        if parsed is None:
            continue
        positional, named = parsed
        letter = named.get("letter")
        if letter is None and positional:
            letter = positional[0]

        if letter is None:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    'dropcap requires one letter, for example {{< dropcap "T" >}}his',
                )
            )
        elif not LATIN_INITIAL_RE.fullmatch(letter):
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f'dropcap initial "{letter}" must be one Latin letter A–Z',
                )
            )

        if len(positional) > (0 if "letter" in named else 1):
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "dropcap accepts one letter only",
                )
            )

        line_start = text.rfind("\n", 0, shortcode.start) + 1
        if text[line_start : shortcode.start].strip():
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "dropcap must begin an opening prose paragraph",
                )
            )

        line_end = text.find("\n", shortcode.end)
        if line_end == -1:
            line_end = len(text)
        continuation = text[shortcode.end : line_end]
        if not continuation or continuation[0].isspace() or not continuation.strip():
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "dropcap must directly precede the rest of its opening word",
                )
            )

        preceding = first_plain_prose_line(
            clean_lines, body_start, shortcode.line - 1
        )
        if preceding is not None:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f"dropcap follows earlier prose on line {preceding}; place it in the opening prose paragraph",
                )
            )

    return issues


def is_remote_source(source: str) -> bool:
    parsed = urlsplit(source.strip())
    return source.strip().startswith("//") or parsed.scheme.lower() in {"http", "https"}


def source_is_dynamic(source: str) -> bool:
    return any(token in source for token in ("{{", "}}", "${", "*"))


def local_source_exists(path: Path, source: str) -> bool | None:
    if is_remote_source(source) or source.startswith(("data:", "#")):
        return None
    if source_is_dynamic(source):
        return None

    parsed = urlsplit(source)
    if parsed.scheme:
        return None
    relative = unquote(parsed.path).lstrip("/")
    if not relative:
        return None

    candidates = [ROOT / "static" / relative, ROOT / "assets" / relative]
    if not source.startswith("/"):
        candidates.extend(
            [
                path.parent / relative,
                CONTENT / relative,
            ]
        )
    return any(candidate.is_file() for candidate in candidates)


def report_remote_media(
    source: str,
    path: Path,
    line: int,
    column: int,
    draft: bool,
    public_blog_post: bool,
    issues: list[Diagnostic],
    warnings: list[Diagnostic],
) -> None:
    if not is_remote_source(source):
        return
    if public_blog_post and not draft:
        issues.append(
            Diagnostic(
                path,
                line,
                column,
                f'remote media "{source}" is not allowed in a published blog post; localize it',
            )
        )
        return
    warnings.append(
        Diagnostic(
            path,
            line,
            column,
            f'remote media "{source}" should be localized before publication',
        )
    )


def report_missing_local_media(
    source: str,
    kind: str,
    path: Path,
    line: int,
    column: int,
    issues: list[Diagnostic],
) -> None:
    if local_source_exists(path, source) is False:
        issues.append(
            Diagnostic(
                path,
                line,
                column,
                f'local {kind} source "{source}" does not exist',
            )
        )


def scan_figures_and_media(
    path: Path,
    draft: bool,
    text: str,
    shortcodes: list[Shortcode],
) -> SourceScan:
    issues: list[Diagnostic] = []
    warnings: list[Diagnostic] = []
    relative = path.relative_to(CONTENT)
    public_blog_post = (
        len(relative.parts) >= 2
        and relative.parts[0] == "blog"
        and path.stem != "_index"
    )
    priority_figures: list[Shortcode] = []

    for shortcode in shortcodes:
        if shortcode.name != "figure":
            continue
        parsed = parse_shortcode_arguments(shortcode, path, issues)
        if parsed is None:
            continue
        positional, named = parsed
        source = named.get("src") or (positional[0] if positional else "")
        if not source:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "figure requires a src",
                )
            )

        decorative = parse_bool(
            named.get("decorative"), "decorative", shortcode, path, issues
        )
        priority = parse_bool(
            named.get("priority"), "priority", shortcode, path, issues
        )
        legacy_wide = parse_bool(named.get("wide"), "wide", shortcode, path, issues)
        if priority:
            priority_figures.append(shortcode)

        placement = named.get("placement") or ("wide" if legacy_wide else "measure")
        placement = placement.lower()
        if placement not in VALID_PLACEMENTS:
            choices = ", ".join(sorted(VALID_PLACEMENTS))
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f'figure placement "{placement}" is invalid; use {choices}',
                )
            )

        treatment = named.get("treatment", "natural").lower()
        if treatment not in VALID_TREATMENTS:
            choices = ", ".join(sorted(VALID_TREATMENTS))
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f'figure treatment "{treatment}" is invalid; use {choices}',
                )
            )

        alt = named.get("alt")
        if not decorative and (alt is None or not alt.strip()):
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "figure requires alt text unless decorative=true",
                )
            )
        if placement == "margin" and not named.get("caption", "").strip():
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    "margin figure requires a caption",
                )
            )

        if source:
            report_remote_media(
                source,
                path,
                shortcode.line,
                shortcode.column,
                draft,
                public_blog_post,
                issues,
                warnings,
            )
            report_missing_local_media(
                source,
                "figure",
                path,
                shortcode.line,
                shortcode.column,
                issues,
            )

    if len(priority_figures) > 1:
        first = priority_figures[0]
        for shortcode in priority_figures[1:]:
            issues.append(
                Diagnostic(
                    path,
                    shortcode.line,
                    shortcode.column,
                    f"only one priority figure is allowed per page (first used on line {first.line})",
                )
            )

    for match in MARKDOWN_IMAGE_RE.finditer(text):
        source = match.group("destination")
        if source.startswith("<") and source.endswith(">"):
            source = source[1:-1]
        line, column = offset_line_column(text, match.start("destination"))
        report_remote_media(
            source,
            path,
            line,
            column,
            draft,
            public_blog_post,
            issues,
            warnings,
        )
        report_missing_local_media(
            source, "Markdown image", path, line, column, issues
        )

    for tag_match in HTML_MEDIA_TAG_RE.finditer(text):
        for attribute_match in HTML_MEDIA_ATTRIBUTE_RE.finditer(tag_match.group(0)):
            source = attribute_match.group("src")
            source_offset = tag_match.start() + attribute_match.start("src")
            line, column = offset_line_column(text, source_offset)
            report_remote_media(
                source,
                path,
                line,
                column,
                draft,
                public_blog_post,
                issues,
                warnings,
            )
            report_missing_local_media(
                source, "HTML media", path, line, column, issues
            )

    return SourceScan(issues, warnings)


def scan_file(path: Path) -> SourceScan:
    lines = path.read_text(encoding="utf-8").splitlines()
    body_start = frontmatter_end(lines)
    clean_lines = masked_lines(lines, body_start)
    text = "\n".join(clean_lines)
    shortcodes = find_shortcodes(text)
    draft = page_is_draft(lines, body_start)

    issues = scan_mathematics(path, lines, clean_lines, body_start)
    issues.extend(
        scan_dropcaps(path, clean_lines, body_start, text, shortcodes)
    )
    media = scan_figures_and_media(path, draft, text, shortcodes)
    issues.extend(media.issues)
    return SourceScan(issues, media.warnings)


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
    with tempfile.TemporaryDirectory(prefix="nisch-content-check-") as temporary:
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


def content_files() -> list[Path]:
    return sorted(CONTENT.rglob("*.md")) + sorted(CONTENT.rglob("*.markdown"))


def parse_arguments(argv: list[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate mathematics, drop caps, figures, and remote media."
    )
    parser.add_argument(
        "--source-only",
        action="store_true",
        help="skip the pinned Hugo draft build (intended for Netlify preflight)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    arguments = parse_arguments(argv)
    scans = [scan_file(path) for path in content_files()]
    issues = sorted(issue for scan in scans for issue in scan.issues)
    warnings = sorted(warning for scan in scans for warning in scan.warnings)

    for warning in warnings:
        print(f"warning: {warning.display()}", file=sys.stderr)
    if issues:
        for issue in issues:
            print(issue.display(), file=sys.stderr)
        print(
            f"\nContent source check failed with {len(issues)} issue(s) "
            f"and {len(warnings)} warning(s).",
            file=sys.stderr,
        )
        return 1

    if arguments.source_only:
        print(
            f"Content source checks passed with {len(warnings)} warning(s); "
            "Hugo build skipped."
        )
        return 0

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

    print(
        f"Content source checks passed with {len(warnings)} warning(s); "
        f"Hugo {PINNED_HUGO} draft build completed."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
