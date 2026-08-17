# Mathematics authoring

Hugo 0.164.0 renders mathematics during the build. The deployed page contains
one native MathML tree, with no MathJax configuration, renderer JavaScript, or
mathematical CDN request. KaTeX is the build-time parser. It does not run in the
reader's browser.

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

Hugo renders with MathML output, strict errors, a 0.05 em minimum rule
thickness, and trusted HTML commands disabled. Unsupported or malformed TeX
fails the build at its source position. KaTeX's
[supported-function table](https://katex.org/docs/supported) is the practical
language reference.

## Mathematical type

The browser typesets the MathML tree with Asana Math 000.962. Its warm,
calligraphic forms sit closer to Linden Hill's old-style book face than KaTeX's
Computer Modern-derived default.

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

The default build emits MathML alone. A compatibility build can restore KaTeX
HTML alongside MathML:

~~~sh
HUGO_PARAMS_MATHOUTPUT=htmlAndMathml hugo --buildDrafts \
  --cacheDir /tmp/hugo-dual-math-cache \
  --destination /tmp/hugo-dual-math-public
~~~

MathML-only output avoids a second hidden rendering tree and removes the KaTeX
stylesheet request. This is important in long mathematical notes, where the
duplicate tree costs more than the diagrams or article script. The compatibility
switch changes emitted markup only. Both modes use the same strict build-time
renderer and Asana Math face.

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

Supported kinds are theorem, lemma, proposition, corollary, definition, remark,
and example. The first five share one sequence within each section. Remarks,
examples, and proofs are unnumbered. Theorem-family bodies are italic;
definitions, remarks, examples, and proofs are upright. These are typographic
passages on the Lokta sheet, not cards.

## Optional calculations

Keep every definition, result, and interpretation needed by the next paragraph
in the main reading path. Put a verification that some readers may want behind
the `calculation` helper:

~~~
{{< calculation id="readout-integral" title="Complete the square in the readout weight" >}}
The intermediate algebra and unnumbered displays go here.
{{< /calculation >}}
~~~

The `id` must be unique and slug-like. The `title` should name the operation in
plain language. Do not place a section heading or a numbered result inside the
fold. A fold is for algebra that checks a result already stated in the article,
not for an assumption or a step that the later argument needs.

On screen, a small printer's corner opens into a fading rule. The calculation
uses the same paper, prose face, and mathematical type as the article. It has no
panel or separate interface style. Print expands every calculation.

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

## Scientific plates

The Gaussian process field note adds a build-time numbered plate system. A
declaration stays on one source line so the registry can assign a stable label:

~~~markdown
{{< scientific-plate kind="spectrum" id="spectral-moments" title="Spectral moments" caption="Higher spectral moments give more weight to high frequencies." >}}
~~~

Supported kinds are construction, field, kac-rice, spectrum, excursion, error,
direction, overlap, rank-one, sample-complexity, and self-consistency. The field
and error kinds have optional validated control defaults.
Plates have a separate sequence that restarts in each level-two section.

Refer to a plate without writing its number by hand:

~~~markdown
See {{< plate-ref "spectral-moments" >}}.
~~~

Every plate is semantic HTML and inline SVG before JavaScript runs. Its
mathematical annotations use `layouts/partials/scientific-plates/math.html`,
which calls the same strict build-time renderer as the article and asks for its
MathML-only output. This keeps one semantic mathematical tree in the page and
in full-text feeds. Do not imitate mathematics with Unicode characters or SVG
text. Plain descriptive labels and changing numeric values can remain figure
text. Give each plate a short literal title, and refer to it from the article
where the comparison enters the argument. Place the serif caption in the right
margin on wide screens and below the figure on narrower screens. Do not add a
second explanatory line inside the plate body. Keep the graphic close to the
mathematical argument. Do not use the system as a general illustration gallery
or add a control that does not reveal a comparison.

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
