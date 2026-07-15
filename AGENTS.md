# Working agreement for this site

Before making any visual, interaction, layout, or content-structure change, read
[`DESIGN_LANGUAGE.md`](./DESIGN_LANGUAGE.md) in full. It records the design DNA,
the division between the upstream `hugo-paged` template and Nisch's custom work,
and the anti-generic constraints for this project.

Work gradually and keep changes easy to inspect. Do not redesign multiple page
systems at once. Preserve unrelated user changes and do not overwrite the
vendored theme from `/Users/nisch/code/site/hugo-paged` wholesale: the copy under
`themes/hugo-paged/` has intentional local modifications and an older Hugo layout
structure.

For visual changes, run the local site and verify the affected page in the in-app
browser at the normal desktop viewport and around 390 px wide. Check both light
and dark modes, keyboard focus where relevant, horizontal overflow, and browser
console errors. Prefer editing the site-level overrides and layouts over changing
vendored theme files unless the shared theme primitive itself is the intended
target.

When a decision materially changes the design language, update
`DESIGN_LANGUAGE.md` in the same change. Do not turn temporary experiments into
new design principles without Nisch's confirmation.
