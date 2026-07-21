# EB Garamond Initials source

Upstream: https://github.com/georgd/EB-Garamond-Initials

Pinned revision and release tag: `a11b10a68bc3b55ad16e95af346453702df22b33`

Release archive:
https://github.com/georgd/EB-Garamond-Initials/releases/download/nightly/EBGaramond.zip

Archive SHA-256:
`4628c053d3b2b97724db1f2ed98f550372ec1de4ec4ef10800e5a335b5a42e2e`

Inputs:

- `EBGaramond-InitialsF1.otf`, the ornamental background layer
  SHA-256: `ae5de3a6545346c7a5589864f5ffc0b4aa578b05510d14dd9c7b0c7d3e0169bd`
- `EBGaramond-InitialsF2.otf`, the foreground letter layer
  SHA-256: `5fa6d580045252cdebe597fe15e8148103e14bb0d48551547698800339d5df4d`

The two fonts were subset to `U+0041-005A` and encoded as WOFF2 with
pyftsubset/fontTools 4.43.1. The large ornamental F1 face was then split into
26 single-codepoint WOFF2 files under `f1-by-letter/`. CSS `unicode-range`
selection makes a page fetch only its authored initial (currently 5.3 KB for
`T`) instead of the 168.6 KB all-letter ornament. The full F1 subset remains
beside those delivery files as the pinned, reproducible source. No outlines
were edited. The source font calls these faces “EB Garamond Initials Fill1”
and “EB Garamond Initials Fill2”; the site-facing family names are declared in
`static/css/fonts.css`.

License: SIL Open Font License 1.1. See `OFL-1.1.txt`.
