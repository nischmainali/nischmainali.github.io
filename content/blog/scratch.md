+++
title = "trying things out"
draft = true
author = "Nisch"
date = 2026-07-10
lastmod = 2026-07-15
subtitle = "A private specimen for the article reading system"
categories = ["Notes"]
tags = ["Typography", "Gaussian Process"]
+++

{{< epigraph attribution="Rabindranath Tagore" source="Stray Birds" >}}
The butterfly counts not months but moments, and has time enough.
{{< /epigraph >}}

{{< dropcap "T" >}}his specimen checks the {{< smallcaps >}}editorial vocabulary{{< /smallcaps >}} of an opened post: ordinary prose, an `inline expression`, keyboard input such as <kbd>⌘</kbd> + <kbd>K</kbd>, and a footnote.[^fn:1] It also carries a margin note for comparison.{{< sidenote >}}This is an explicit sidenote: optional context stays beside the sentence without interrupting the reading line. On narrower screens, its reference number becomes a tap-to-reveal control.{{< /sidenote >}}

Its small link grammar distinguishes the [talk notes](/pdfs/chalk_talk.pdf), a [published record](https://doi.org/10.1101/2024.06.11.597569), and a [preprint](https://arxiv.org/abs/1807.02582). A [same-page direction](#mathematics) receives only the quiet section mark.

## Heading 1 {#heading-1}

The reading column should remain calm even when the material around it becomes more technical. It is deliberately narrower than the title field and should never become a second card resting on top of the paper.


### Heading 2 {#heading-2}

The smaller heading retains the old-book small-cap gesture without turning every section into a display element.

- A short unordered observation.
- Another observation with a nested qualification:
  - the marker remains quiet;
  - the indentation remains legible.

Term
: A definition-list entry for technical vocabulary and compact glosses.

> Roses are red,<br />
> Violets are blue,<br />
> Sugar is sweet,<br />
> And so are you.

---


## Code {#code}

```python
def generate_tuning_curves(L, N, space, sigma):
    """Generates Gaussian tuning curves for place cells"""
    centers = np.linspace(0, L, N)
    return np.array([np.exp(-((space - c) ** 2) / (2 * sigma**2)) for c in centers])

L = 200  # Length of the 1D space
N = 150  # Number of place cells
dx = 0.1  # Space discretization
sigma = 3*L / N  # Width of the bump
space = np.arange(0, L, dx)

tuning_curves = generate_tuning_curves(L, N, space, sigma)


def plot_tuning_curves(space, tuning_curves, subtitle):
    """Plots place cell tuning curves"""
    plt.figure(figsize=(10, 6))
    for curve in tuning_curves:
        plt.plot(space, curve)
        plt.title(f"Place Cell Tuning Curves: {subtitle}")
        plt.xlabel("Position in 1D space")
        plt.ylabel("Activation")

plot_tuning_curves(space, tuning_curves[::20], "Sample of CA3 Place Cells")
plt.show()
```


## Table {#table}

| Sepal.Length | Sepal.Width | Petal.Length | Petal.Width | Species |
|--------------|-------------|--------------|-------------|---------|
| 5.1          | 3.5         | 1.4          | 0.2         | setosa  |
| 4.9          | 3.0         | 1.4          | 0.2         | setosa  |
| 4.7          | 3.2         | 1.3          | 0.2         | setosa  |
| 4.6          | 3.1         | 1.5          | 0.2         | setosa  |
| 5.0          | 3.6         | 1.4          | 0.2         | setosa  |
| 5.4          | 3.9         | 1.7          | 0.4         | setosa  |


## Marginal plate {#image}

The right field can carry a compact scientific plate without turning it into a second sidebar. Below the wide breakpoint, the same figure returns to the reading measure. Its image remains an ordinary full-resolution link without JavaScript and opens as a second Lokta sheet when the article reader is available.

{{< figure src="images/article-specimens/gp-threshold-crossings.svg" alt="Gaussian-process posterior sample paths crossing a threshold" title="Plate 1" caption="Posterior sample paths crossing a reference threshold." placement="margin" treatment="ink" width="960" height="560" >}}


## Mathematics: $\GP$ fields {#mathematics}

The posterior is $p(\theta \mid x)$, and the longer delimiter remains available for compatibility: \(L = 200\). A literal price is written as \$2 in the source so that it remains currency rather than mathematics. The same ink should survive a footnote with $\sigma^2$[^fn:2] and a margin note.{{< sidenote >}}A mathematical sidenote keeps $\Cov(X,Y)$ compact and aligned with the smaller marginal type.{{< /sidenote >}}

Equation {{< eqref "posterior" >}} is a forward reference to the first numbered display. Its unnumbered form remains plain Markdown:

$$
p(\theta \mid x)
\propto p(x \mid \theta)\,p(\theta).
$$

{{< equation id="posterior" >}}
p(\theta \mid x)
= \frac{p(x \mid \theta)\,p(\theta)}
       {\int_{\Theta} p(x \mid \vartheta)\,p(\vartheta)\,\dd \vartheta}
{{< /equation >}}

The backward reference to {{< eqref "posterior" >}} should resolve to the same number. Alignment, cases, and matrices remain ordinary unnumbered displays:

$$
\begin{aligned}
m(x_*) &= k_*^{\mathsf T}(K + \sigma^2 I)^{-1}y, \\
v(x_*) &= k(x_*,x_*) - k_*^{\mathsf T}(K + \sigma^2 I)^{-1}k_*.
\end{aligned}
$$

$$
\ell(u) =
\begin{cases}
\frac{1}{2}u^2, & \abs{u} \leq 1, \\
\abs{u} - \frac{1}{2}, & \abs{u} > 1,
\end{cases}
\qquad
K = \begin{pmatrix} 1 & \rho \\ \rho & 1 \end{pmatrix}.
$$

The deliberately wide Equation {{< eqref "wide-posterior" >}} checks the transparent edge cues and keyboard scrolling without shrinking the type.

{{< equation id="wide-posterior" >}}
\log p(y \mid X,\theta)
= -\frac{1}{2}y^{\mathsf T}(K_\theta + \sigma_n^2 I)^{-1}y
  -\frac{1}{2}\log\det(K_\theta + \sigma_n^2 I)
  -\frac{n}{2}\log(2\pi)
  +\underbrace{\sum_{j=1}^{m}\log p(\theta_j)}_{\text{prior contribution}}
  -\underbrace{\KL\!\left(q(f)\,\middle\|\,p(f \mid X,\theta)\right)}_{\text{variational correction}}
{{< /equation >}}

### Mathematical table: $K_\theta$ {#mathematical-table}

| Quantity | Reading |
|----------|---------|
| $K_\theta$ | covariance matrix |
| $\EE[f(x)]$ | prior mean |
| $\Var[f(x)]$ | marginal variance |
| $\argmax_\theta p(\theta \mid x)$ | MAP estimate |

Chemistry uses the same build-time renderer:

$$
C_p[\ce{H2O(l)}] = \pu{75.3 J // mol K}.
$$

The promised {{< statement-ref "consistency" >}} is also a forward reference. The first five statement families share one local sequence.

{{< statement kind="definition" id="posterior-concentration" title="Posterior concentration" >}}
A posterior sequence $\{\Pi_n\}$ concentrates at $\theta_0$ when
$\Pi_n\!\left(\norm{\theta-\theta_0} > \varepsilon \mid X_{1:n}\right) \to 0$
for every $\varepsilon > 0$.
{{< /statement >}}

{{< statement kind="theorem" id="consistency" title="Consistency" >}}
If the model is identifiable and the prior assigns positive mass to every neighbourhood of $\theta_0$, then the posterior concentrates at $\theta_0$.
{{< /statement >}}

{{< proof >}}
Fix $\varepsilon>0$. Identifiability separates the complement of the $\varepsilon$-ball from $\theta_0$, while the prior supplies positive local mass. The likelihood ratio then vanishes on that complement, which gives the claim.
{{< /proof >}}

The sequence is visible in {{< statement-ref "posterior-concentration" >}} and {{< statement-ref "consistency" >}}.

{{< statement kind="remark" id="same-page-references" title="Scope" >}}
References are intentionally article-local in this iteration; they do not create a second site-wide citation system.
{{< /statement >}}

[^fn:1]: The said footnote.
[^fn:2]: Mathematical notation such as $\norm{x}_2$ remains available inside notes.
