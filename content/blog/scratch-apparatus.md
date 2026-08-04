+++
title = "level sets of a smooth field"
register = "notes"
short_title = "Level sets of a smooth field"
draft = true
author = "Nisch"
date = 2026-07-28
subtitle = "A private specimen for the cross-note apparatus"
description = "Standard facts about excursion sets of a stationary Gaussian field, kept as the far side of a cross-note reference."
+++

{{< dropcap "T" >}}his second specimen exists so the cross-note apparatus has a
real far side. It carries sections, a notation register, numbered equations, and
numbered statements, and it is deliberately made of standard textbook material
rather than authored claims. The companion specimen references it, and it
references the companion back, which is the point: neither page is rendered
before the other.

{{< notation group="processes" >}}

## The excursion set

Let $f$ be a centred, stationary Gaussian field on $\RR^d$ with covariance
kernel $K$ and unit variance.

{{< statement kind="definition" id="excursion-set" title="Excursion set" >}}
For a threshold $u$, the excursion set of $f$ is
{{< equation id="excursion" >}}
A_u(f) = \{\, x \in \RR^d : f(x) \geq u \,\}.
{{< /equation >}}
{{< /statement >}}

Because $f$ is stationary, the expected volume fraction of {{< eqref "excursion" >}}
depends on the threshold alone:

{{< equation id="volume-fraction" >}}
\EE\!\left[\, \abs{A_u(f) \cap [0,1]^d} \,\right] = \PP\big(f(0) \geq u\big) = 1 - \Phi(u),
{{< /equation >}}

where $\Phi$ is the standard normal distribution function. The kernel enters
only through the geometry of the set, never through {{< eqref "volume-fraction" >}}.

## Crossings in one dimension

{{< notation group="level-sets" >}}

On the line the boundary of the excursion set is a point process, and its
intensity has a classical closed form.

{{< statement kind="theorem" id="rice" title="Rice's formula" >}}
Let $f$ be a centred stationary Gaussian process on $\RR$ with unit variance and
$\Var(f'(0)) = \lambda_2 < \infty$. The expected number of upcrossings of the
level $u$ per unit length is
{{< equation id="rice-intensity" >}}
\EE\big[N_u^{+}(0,1)\big] = \frac{1}{2\pi}\sqrt{\lambda_2}\; e^{-u^{2}/2}.
{{< /equation >}}
{{< /statement >}}

{{< proof >}}
Apply the Kac–Rice argument to the pair $\big(f(0), f'(0)\big)$, which is jointly
Gaussian with independent components at a single point, and integrate the
positive part of the derivative against the density of $f(0)$ at $u$.
{{< /proof >}}

{{< statement kind="corollary" id="crossing-scale" >}}
Upcrossings become exponentially rare in the threshold, and their rate scales
with $\sqrt{\lambda_2}$, so a field with correlation length $\ell$ produces
crossings at rate proportional to $1/\ell$.
{{< /statement >}}

{{< statement kind="remark" id="dimension" >}}
Above one dimension the boundary is a surface rather than a point process, and
the corresponding statement counts its expected area. The companion specimen's
{{< statement-ref "/blog/scratch#consistency" >}} exercises a reference in
the other direction.
{{< /statement >}}
