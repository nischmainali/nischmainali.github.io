# Mathematics authoring

Hugo 0.164.0 renders mathematics during the build. The deployed page contains
KaTeX HTML and MathML, with no MathJax configuration, renderer JavaScript, or
mathematical CDN request. The repository holds KaTeX 0.17.0 CSS and WOFF2 fonts
under `static/vendor/katex/0.17.0`.

## Ordinary mathematics

Dollar delimiters are the concise default:

~~~
The posterior is $p(\theta \mid x)$.

$$
p(\theta \mid x)
\propto p(x \mid \theta)\,p(\theta)
$$
~~~

The compatible forms \( ... \) and \[ ... \] are also supported. Escape a
literal currency dollar in Markdown, for example \$2. Code spans and fenced
examples are ignored by the local checker.

Hugo renders with HTML and MathML output, strict errors, a 0.05 em minimum rule
thickness, and trusted HTML commands disabled. Unsupported or malformed TeX
fails the build at its source position. KaTeX's
[supported-function table](https://katex.org/docs/supported) is the practical
language reference.

## Mathematical type

Modern browsers typeset the MathML layer with Asana Math 000.962. Its warm,
calligraphic forms sit closer to Linden Hill's old-style book face than KaTeX's
Computer Modern-derived default. The site keeps KaTeX HTML as a fallback for
browsers without MathML Core support.

Blackboard, calligraphic, fraktur, and sans-serif letters are substituted for
their Mathematical Alphanumeric Symbols codepoints during rendering, from
`data/mathml.toml`. KaTeX writes them as a legacy `mathvariant` attribute, and
MathML Core keeps only `mathvariant="normal"`, so Chromium ignores the attribute
and would print `\RR` as an ordinary italic *R*. Do not reintroduce a dependency
on legacy `mathvariant`.

The repository contains a WOFF2 conversion of the official CTAN OpenType font
and its SIL Open Font License under `static/vendor/asana-math/000.962`. The font
loads only on pages that can contain mathematics. Do not replace KaTeX's HTML
font files or mix isolated glyphs from another family: KaTeX calculates that
layer with its own font metrics.

The default build emits KaTeX HTML plus MathML. A compatibility build can emit
MathML alone:

~~~sh
HUGO_PARAMS_MATHOUTPUT=mathml hugo --buildDrafts \
  --cacheDir /tmp/hugo-mathml-cache \
  --destination /tmp/hugo-mathml-public
~~~

MathML-only output cuts the dense specimen's HTML and live element count by more
than half and removes the KaTeX stylesheet request. Keep the dual output as the
deployment default until Chromium, Safari, Firefox, VoiceOver, NVDA, overflow,
and print checks pass. This switch changes emitted markup only; both modes use
the same strict build-time renderer and Asana Math face.

## The numbering spine

`layouts/partials/math-registry.html` reads a page's raw source once and assigns
every equation and statement its label. It is the single source of truth: the
build writes final numbers into the HTML, so a reader sees them with JavaScript
disabled, and `assets/js/article.js` only verifies them. There is no CSS counter
and no client-side renumbering.

Labels are scoped to the enclosing level-two section. An object in the third
section reads `3.1`, `3.2`; an object before the first section, or anywhere on a
note with no sections, keeps a bare `1`, `2`. A short note therefore stays
simple while a long one agrees with the numbered outline in its contents rail.

The registry skips fenced code, so a note may quote the shortcodes it documents.
A shortcode that renders but was found inside a fence fails the build and tells
you to escape the example instead.

## Numbered equations

Numbering restarts in every article. Contents are raw TeX without delimiters:

~~~
{{< equation id="posterior" >}}
p(\theta \mid x)
\propto p(x \mid \theta)\,p(\theta)
{{< /equation >}}

Equation {{< eqref "posterior" >}} gives the posterior.
~~~

Identifiers are lowercase slug-like values and must be unique on the page.
Forward and backward references are both valid.
If a deliberately unbreakable display is wider than the printed reading
measure, add `wide="true"` to its `equation` shortcode. The screen version keeps
the normal optical size and transparent overflow cues; print scales that one
display enough to preserve the complete expression and its number.
Do not use \tag, \label, \ref, \eqref, or a bare equation environment; those
interfaces are deliberately excluded because their layout and portability are
fragile here.

## Statements and proofs

~~~
{{< statement kind="theorem" id="consistency" title="Consistency" >}}
Markdown and inline mathematics are allowed here.
{{< /statement >}}

{{< proof >}}
The argument goes here.
{{< /proof >}}

See {{< statement-ref "consistency" >}}.
~~~

Supported kinds are theorem, lemma, proposition, corollary, definition, and
remark. The first five share one sequence within each section. Remarks and proofs
are unnumbered. Theorem-family bodies are italic; definitions, remarks, and
proofs are upright. These are typographic passages on the Lokta sheet, not cards.

## Referring to another note

A reference argument is either a bare identifier, which stays inside the note, or
a content path and an identifier joined by `#`, which reaches another note:

~~~
See {{< statement-ref "consistency" >}}.
See {{< statement-ref "/blog/level-sets#rice" >}}.
Compare {{< eqref "/blog/level-sets#rice-intensity" >}}.
~~~

A cross-note reference is bibliographic: it prints the target's kind, its
section-scoped label, and the target's title, and links to it. It is not a
transclusion, a preview, or a popup, and it adds no runtime request.

Set `short_title` in a note's front matter when its full title is too long to
name inside a sentence; references prefer it.

Both directions resolve because labels come from raw source rather than rendered
output, so two notes may reference each other with no ordering problem. A missing
note or a dangling identifier fails the build with its source position. A
published note cannot reference a draft, and the build will say so.

## Shared macros

The deliberately small macro table lives in data/math.toml:

- number fields: \RR, \NN, \ZZ, \QQ, \CC;
- probability: \EE, \PP, \GP, \Var, \Cov, \KL;
- optimization: \argmax, \argmin;
- delimiters: \abs{...}, \norm{...};
- calculus: \dd, \dv{...}{...}, \pdv{...}{...}.

Extend this table only after an abbreviation repeats in real writing.
Chemistry through \ce and \pu is available. KaTeX's simple CD environment and
the existing SVG/figure path cover current diagrams; TikZ and general diagram
compilation are deferred.

## Checking drafts

Run the source checker before publishing mathematical work:

~~~
./scripts/check_math.py
~~~

It requires the pinned Hugo 0.164.0. If that binary is not first on the path,
point to it explicitly:

~~~
HUGO_BIN=/path/to/hugo ./scripts/check_math.py
~~~

The command checks every content Markdown file while ignoring inline and fenced
code, validates same-page helper targets and the shape of cross-note references,
then builds drafts in a temporary directory. It never writes generated output
into public. Existence of a cross-note target is Hugo's to check: it knows the
content tree, and duplicating that lookup here would only let the two disagree.

## Org and ox-hugo

Markdown under content is the deployment source. Org under org is a manual
authoring source and must not be exported over later hand edits without review.
Use the same $ ... $ and $$ ... $$ convention in Org. Emit equation and
statement helpers through a Hugo export block:

~~~
#+begin_export hugo
{{< equation id="decoding-error" >}}
P = \frac{L}{2\pi\sigma}
{{< /equation >}}
#+end_export
~~~

Keep frontmatter titles and navigation labels plain text in this iteration.
Mathematics is first-class in article prose, headings, captions, tables,
footnotes, sidenotes, and statements.
