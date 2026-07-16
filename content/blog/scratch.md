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

This specimen checks the {{< smallcaps >}}editorial vocabulary{{< /smallcaps >}} of an opened post: ordinary prose, an `inline expression`, keyboard input such as <kbd>⌘</kbd> + <kbd>K</kbd>, and a footnote.[^fn:1]

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


## Image {#image}

{{< figure src="https://i.pinimg.com/564x/fd/01/75/fd0175ef780e2feefb30055be9f2e022.jpg" alt="A still image reading You've been Rick Rolled" title="Figure 1" caption="A deliberately wide image with an editorial caption." wide="true" >}}


## Latex {#latex}

Consider a \\(\mathcal{GP}\\) code of space of size \\(L\\) , with \\(N\\) neurons and correlation length \\(\sigma\\) and variance \\(r\\), when corrupted by noise with variance, we get anexponentialsuppression of ML decoding error:

\begin{equation}
\label{eq:1}
P= \frac{L}{2 \pi \sigma} \left( 1 +  \frac{r}{\eta}\right)^{\frac{N}{2}}
\end{equation}

[^fn:1]: The said footnote.
