# Local type assets

These webfonts replace the site's former runtime font requests. Each family is
stored with its upstream license and an exact source note in its own directory.

- Linden Hill remains the prose face.
- Jost remains the interface and metadata face.
- EB Garamond Initials F1 and F2 are the ornament and foreground layers of the
  optional article drop cap. F1 is delivered as one exact-codepoint WOFF2 per
  capital, so a page requests only the ornament it actually prints; the pinned
  all-letter subset remains beside those delivery files for provenance.

The generated WOFF2 files should not be replaced without checking article
geometry, fallback behaviour, and the source notes.
