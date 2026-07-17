# Linden Hill source

Upstream: https://github.com/theleagueof/linden-hill

Pinned revision: `a3f7ae6c4cac1b7e5ce5269e1fcc6a2fbb9e31ee`

Inputs:

- `webfonts/LindenHill-webfont.woff`
  SHA-256: `cc4ef5a66891e22d773c9f0e39e03153b9d90207aa6c508a477ffe796e77e5e0`
- `webfonts/LindenHill-Italic-webfont.woff`
  SHA-256: `8bdcdce8607deaec71bb637b54c39b228aad26a00832a6d55309d0070c5d6d04`

The existing site used these same upstream WOFF files through jsDelivr. They
were recompressed losslessly as WOFF2 with fontTools 4.43.1 and were not
subset, preserving the current outlines, metrics, and character coverage.

License: SIL Open Font License 1.1. See `OFL-1.1.md`.
