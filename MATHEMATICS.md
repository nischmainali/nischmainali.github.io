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

The repository contains a WOFF2 conversion of the official CTAN OpenType font
and its SIL Open Font License under `static/vendor/asana-math/000.962`. The font
loads only on pages that can contain mathematics. Do not replace KaTeX's HTML
font files or mix isolated glyphs from another family: KaTeX calculates that
layer with its own font metrics.

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
Forward and backward references are both valid. References are same-page only.
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
remark. The first five share one article-local sequence. Remarks and proofs are
unnumbered. Theorem-family bodies are italic; definitions, remarks, and proofs
are upright. These are typographic passages on the Lokta sheet, not cards.

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
code, validates same-page helper targets, then builds drafts in a temporary
directory. It never writes generated output into public.

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
