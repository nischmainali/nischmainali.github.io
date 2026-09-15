+++
author = "Nisch"
categories = ["Notes"]
date = 2026-08-14
lastmod = 2026-09-15
description = "A statistical mechanics account of how a Bayesian network changes its hidden weight distribution to learn one useful direction."
short_title = "Nonlinear feature learning"
subtitle = "A statistical mechanics account of feature learning in a Bayesian network with two trainable layers"
tags = ["Feature learning", "Neural networks", "Statistical mechanics"]
title = "A solvable model of feature learning in a nonlinear network"
+++

{{< dropcap "M" >}}uch of the success of deep learning is attributed to feature learning, in which training changes the features represented by a network's hidden layers. Understanding how networks learn those features is therefore a central problem for a theory of deep learning. We do not yet have a general account of which features a network learns or how learning them improves prediction. There is also uncertainty about which mathematical descriptions and methods can support such an account.

We regard statistical mechanics as one of the most promising directions for developing this theory. Its methods allow us to connect the behavior of many interacting neurons with quantities describing the network as a whole, including its hidden weight distribution and prediction error. Rubin and collaborators give a compelling example in a nonlinear network, where they derive a change in the hidden representation and connect it to improved generalization. We draw on their [2024 study of a feature learning transition](https://openreview.net/forum?id=3ROGsTX3IR) and their [2025 theory of adaptive feature learning](https://proceedings.mlr.press/v267/rubin25a.html).

Working through these calculations by hand helped us develop a gears-level understanding of how the theory is built. We could see why the authors study particular quantities, which approximations make the calculation possible, and how the conclusions follow. We wrote this post to share that understanding with readers who have no statistical physics background. We use a simpler cavity derivation that studies one neuron at a time, tracking the weight distribution after each major step. We assume familiarity with neural networks, basic linear algebra, and probability.

The toy model concerns a network with two trainable layers, learning a target that depends on one unknown direction in its input space. The inputs are Gaussian with no preferred direction, so the network must identify the useful direction from their relationship to the target. The target has an easier linear component and a harder cubic component along that same direction. The components are chosen so that fitting the linear part alone leaves the cubic part unexplained, while learning their shared direction could help with both. The Bayesian formulation lets us study whether the network learns that direction through its posterior, the distribution over weights conditioned on the training data.

The theory predicts a transition from a hidden weight distribution with no preferred direction to one containing populations aligned with the target direction. We can detect the learned direction in the covariance of the hidden weights, which acquires extra variation along that direction, a rank-one change. Once the hidden features align, the network can also represent the cubic component more strongly. The improvement in nonlinear prediction follows from a change in the representation, and the theory predicts a large reduction in the number of samples needed to learn it.

We chose to present this calculation because it illustrates the kind of theory we want to build within [PIRAMID's Advancements in Learning Theory team](https://www.lesswrong.com/posts/nbSJhbLERTZFeNxY7/introducing-piramid-physics-informed-research-for-ambitious), and how we want to build it. Our broader aim is to use statistical physics to develop fundamental theories of learning that connect a network's behavior to its internal organization. For mechanistic interpretability and AI safety, we want to build on the explanation of how learned features improve prediction and understand how hidden representations and internal structure implement the learned function. We see the work presented here as a promising foundation for developing that theory of hidden representations.

## A simple setting for feature learning {#one-direction}

We begin with a network learning to predict a number from a high-dimensional input. We choose a target that depends on one direction and give the network examples without telling it which direction is useful. We can then study whether the network learns that direction and how learning it improves prediction.

We draw inputs from a Gaussian distribution with no preferred direction,

$$
\mathbf x\sim\mathcal N(\mathbf 0,\mathbf I_D),
$$

and choose an unknown unit vector $\mathbf e\in\mathbb R^D$. The target, which the papers call the teacher, depends only on the projection

$$
z=\mathbf e^{\mathsf T}\mathbf x.
$$

To study how learning a direction helps with nonlinear prediction, we give the target both a linear and a cubic component,

{{< equation id="teacher" >}}
y(\mathbf x)=H_1(z)+\epsilon H_3(z) =z+\epsilon(z^3-3z).
{{< /equation >}}

Subtracting $3z$ from $z^3$ removes its correlation with the linear component, since

$$
\mathbb E[z(z^3-3z)]=\mathbb E[z^4]-3\mathbb E[z^2]=3-3=0.
$$

The functions $H_1(z)=z$ and $H_3(z)=z^3-3z$ are Hermite polynomials. Their orthogonality means that fitting the linear part alone leaves the cubic part unexplained, even though both depend on the same direction. The coefficient $\epsilon$ sets the cubic part's strength.

The student network has two trainable layers and an odd nonlinearity,

{{< equation id="student" >}}
f(\mathbf x)=\sum_{i=1}^{N}a_i\,\operatorname{erf}(\mathbf w_i^{\mathsf T}\mathbf x).
{{< /equation >}}

Each hidden weight vector $\mathbf w_i$ determines the input direction used by one neuron. We measure its alignment with the target direction by the overlap

$$
\rho_i=\mathbf w_i^{\mathsf T}\mathbf e.
$$

{{< plate-ref "shared-direction" >}} shows the target and the hidden weight overlap we will track.

{{< scientific-plate kind="direction" id="shared-direction" title="One direction carries both target modes" caption="The target uses one scalar projection. Its linear and cubic components share that coordinate. Feature learning appears when hidden weights acquire finite overlap with the target direction." >}}

The linear part contains enough information to estimate the target direction. Consider the average

{{< equation id="linear-estimator" >}}
\widehat{\mathbf e} =\frac1P\sum_{\mu=1}^{P}y^\mu\mathbf x^\mu.
{{< /equation >}}

Only the component of $\mathbf x$ along $\mathbf e$ correlates with the target, so

$$
\mathbb{E}[y\mathbf x] =\mathbf e\,\mathbb{E}[zH_1(z)] +\epsilon\mathbf e\,\mathbb{E}[zH_3(z)] =\mathbf e.
$$

The squared estimation error is $O(D/P)$, so $P=O(D)$ examples identify $\mathbf e$ to order one accuracy. The linear term supplies the direction; without it, this estimate has mean zero and does not provide the same route to learning the cubic target.

We still need to explain when the network puts the estimated direction into its hidden weights.

## A Bayesian description of learning {#bayesian-proxy}

We now want to describe which weights the network favors after seeing the training examples. In the Bayesian model, we do so with a probability distribution over weights, called the posterior. We obtain it by combining a prior over weights with a likelihood for the observed targets.

We put independent Gaussian priors on the hidden and readout weights,

$$
\mathbf w_i\sim\mathcal N\!\left(\mathbf 0,\frac{\sigma_w^2}{D}\mathbf I_D\right), \qquad a_i\sim\mathcal N(0,s_a^2),
$$

and use a Gaussian likelihood with variance $T$ on a training set of size $P$,

$$
p(\mathcal D\mid\{a_i,\mathbf w_i\}) \propto \exp\!\left[-\frac1{2T}\sum_{\mu=1}^{P} \bigl(y^\mu-f(\mathbf x^\mu)\bigr)^2\right].
$$

The hidden weight prior gives no direction a preference. The likelihood favors weights with smaller prediction errors. Multiplying the priors by the likelihood gives the posterior over all the weights,

$$
p(\{a_i,\mathbf w_i\}\mid\mathcal D)\propto\exp\!\left[-\frac{D}{2\sigma_w^2}\sum_i\|\mathbf w_i\|^2-\frac{1}{2s_a^2}\sum_i a_i^2-\frac{1}{2T}\sum_\mu\bigl(y^\mu-f(\mathbf x^\mu)\bigr)^2\right].
$$

We keep $s_a^2$ and $T$ explicit because their dependence on width is part of the model. Standard scaling takes $s_a^2=O(1/N)$ and $T=O(1)$. [The 2024 paper](https://openreview.net/forum?id=3ROGsTX3IR) also uses a limit that reduces readout variance and likelihood variance together; [the 2025 paper](https://proceedings.mlr.press/v267/rubin25a.html) treats both standard and mean field scaling.

Equilibrated Langevin training, with the corresponding noise and weight decay, samples this posterior. We are studying that equilibrium distribution; the time needed to reach it requires a separate calculation.

The prediction error couples all the neurons through their sum, so we cannot yet calculate each neuron's posterior on its own.

## Score one neuron against the residual {#one-neuron-posterior}

We first ask which feature would help one neuron fit the prediction error left by the others. Holding the other neurons fixed lets us study that question through a conditional posterior.

Remove one neuron from the network and call the prediction error left by the other $N-1$ neurons

$$
r_\mu=y^\mu-f_{-}(\mathbf x^\mu).
$$

For a candidate hidden weight $\mathbf w$, define its feature vector on the training set by

$$
\phi_\mu(\mathbf w)=\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\mu).
$$

The selected neuron contributes $a\boldsymbol\phi$, so the full residual is $\mathbf r-a\boldsymbol\phi$. In the network posterior, the other neurons' priors are constant under this conditioning. The remaining terms are

$$
p(a,\mathbf w\mid\mathbf r,X)\propto p_0(\mathbf w)\exp\!\left[-\frac{a^2}{2s_a^2}-\frac{\|\mathbf r-a\boldsymbol\phi(\mathbf w)\|^2}{2T}\right].
$$

To integrate over $a$, we need the feature's correlation with the residual and its squared size on the training set,

$$
S(\mathbf w)=\boldsymbol\phi^{\mathsf T}\mathbf r, \qquad Q(\mathbf w)=\boldsymbol\phi^{\mathsf T}\boldsymbol\phi,
$$

$S$ measures how well the feature matches what remains to be learned. $Q$ measures the feature's size, which we need to distinguish a useful correlation from a large feature. Write

$$
L(\mathbf w)=1+\frac{s_a^2}{T}Q(\mathbf w).
$$

A Gaussian integral over the readout weight $a$ now gives the hidden weight posterior,

{{< equation id="one-neuron-posterior" wide="true" >}}
p(\mathbf w\mid\mathbf r,X) \propto p_0(\mathbf w)\,L(\mathbf w)^{-1/2} \exp\!\left[ \frac{s_a^2S(\mathbf w)^2}{2T^2L(\mathbf w)} \right].
{{< /equation >}}

Equation {{< eqref "one-neuron-posterior" >}} is exact while the other neurons are fixed. The prior favors small weights with no preferred direction. The factor $L^{-1/2}$ accounts for integrating over the possible readout coefficients, and the exponential rewards a feature that fits the residual. The denominator $L$ adjusts that reward for the feature's size.

The fit reward depends on $S^2$, so the signs $\mathbf w$ and $-\mathbf w$ remain equivalent. The mean weight can stay at zero while an even moment such as $\mathbb{E}[\rho^2]$ records direction learning.

We still need the residual produced by the whole network. Self consistency will require that residual and the learned hidden weight distribution to agree.

{{< calculation id="readout-integral" title="Integrate the readout weight" >}}

The calculation uses the Gaussian integral after collecting the linear and quadratic terms in the readout weight. Expanding the squared error gives

$$
\lVert \mathbf r-a\boldsymbol\phi \rVert^2 =\lVert \mathbf r \rVert^2-2aS(\mathbf w)+a^2Q(\mathbf w).
$$

The terms that depend on $a$ have the form

$$
-\frac{A(\mathbf w)}2a^2+B(\mathbf w)a, \qquad A(\mathbf w)=\frac1{s_a^2}+\frac{Q(\mathbf w)}T, \qquad B(\mathbf w)=\frac{S(\mathbf w)}T.
$$

The Gaussian identity

$$
\int_{-\infty}^{\infty} \exp\!\left(-\frac A2a^2+Ba\right)\,\mathrm{d} a =\sqrt{\frac{2\pi}{A}}\exp\!\left(\frac{B^2}{2A}\right)
$$

then gives Equation {{< eqref "one-neuron-posterior" >}} after removing factors that do not depend on $\mathbf w$.

{{< /calculation >}}

## Reduce the hidden weight posterior to one overlap {#overlap-reduction}

The posterior in Equation {{< eqref "one-neuron-posterior" >}} depends on the hidden weight through $S$ and $Q$. We want to express those quantities in terms of its overlap with the target direction, so we can see which overlaps the posterior favors.

We approximate the residual by its linear and cubic components,

{{< equation id="residual-modes" >}}
r(\mathbf x)=bH_1(z)+cH_3(z).
{{< /equation >}}

Here $b$ and $c$ are the amounts of the linear and cubic target components that remain unexplained. We use this approximation near the transition, where those components dominate the population residual.

To average the feature against each component, write

$$
g=\mathbf w^{\mathsf T}\mathbf x, \qquad q=\lVert \mathbf w \rVert^2, \qquad \rho=\mathbf w^{\mathsf T}\mathbf e.
$$

The feature input $g$ has variance $q$, and its covariance with the target coordinate $z$ is $\rho$. Since both are Gaussian, we can calculate their correlations by Gaussian integration by parts, also called Stein's identity. Its higher order form is

{{< equation id="stein-hermite" >}}
\mathbb{E}[F(g)H_k(z)] =\rho^k\mathbb{E}[F^{(k)}(g)].
{{< /equation >}}

For the linear and cubic target components, the identity gives factors of $\rho$ and $\rho^3$. For the erf activation, the correlations are

$$
\begin{aligned} \mathbb{E}[\operatorname{erf}(g)H_1(z)] &=\frac{2\rho}{\sqrt{\pi(1+2q)}},\\ \mathbb{E}[\operatorname{erf}(g)H_3(z)] &=-\frac{4\rho^3}{\sqrt\pi(1+2q)^{3/2}}. \end{aligned}
$$

Substituting those correlations into the residual gives

{{< equation id="overlap-correlation" wide="true" >}}
m(\rho,q) =\mathbb{E}[r(\mathbf x)\operatorname{erf}(g)] =\frac{2}{\sqrt\pi} \frac{\rho}{\sqrt{1+2q}} \left( b-\frac{2c\rho^2}{1+2q} \right).
{{< /equation >}}

The feature variance is

{{< equation id="erf-variance" >}}
v(q)=\mathbb{E}[\operatorname{erf}(g)^2] =\frac{2}{\pi}\arcsin\!\left(\frac{2q}{1+2q}\right).
{{< /equation >}}

We now replace the sample sums by their population values, $S\simeq Pm$ and $Q\simeq Pv$. To reduce the remaining norm dependence, we keep the squared length perpendicular to the target at its typical prior value, giving $q\simeq\sigma_w^2+\rho^2$. These are the approximations in the scalar description below.

Substituting into Equation {{< eqref "one-neuron-posterior" >}} gives the overlap posterior

{{< equation id="overlap-posterior" >}}
p(\rho\mid b,c)\propto e^{-U(\rho;b,c)},
{{< /equation >}}

with $m(\rho)=m(\rho,\sigma_w^2+\rho^2)$ and

{{< equation id="overlap-potential" wide="true" >}}
U(\rho;b,c) =\frac{D\rho^2}{2\sigma_w^2} +\frac12\log L(\rho) -\frac{s_a^2P^2m(\rho)^2}{2T^2L(\rho)}, \qquad L(\rho)=1+\frac{s_a^2P}{T}v(\sigma_w^2+\rho^2).
{{< /equation >}}

The function $U$ is the negative log posterior, up to a constant. Lower values mean more probable overlaps. The first term is the prior cost of selecting the target direction in $D$ dimensions, while the last term rewards a feature that fits the residual.

For small data sets, the posterior concentrates near $\rho=0$. As the fit reward grows, minima at finite $\rho$ can become competitive. Since $U$ is even, aligned weights occur with both signs.

### The sample scale for alignment {#statement-alignment-scale}

We can estimate when the fit reward becomes large enough to compete with the prior. Near zero overlap, $m(\rho)$ is proportional to $b\rho$. For $s_a^2=O(1/N)$, fixed nonzero $b$, and $T$ and $L(0)$ of order one, the quadratic terms balance when

$$
\frac{P^2}{N}=O(D).
$$

The resulting scale is $P_{\mathrm{align}}=O(\sqrt{ND})$. In the proportional regime $N=O(D)$, alignment can therefore begin at $P=O(D)$. The balance estimates a sample scale, rather than the location of the first order transition.

A first order transition depends on the depths of the minima, not only on the curvature at zero. As the fit reward increases, side minima can appear, reach the same depth as the central minimum, and then become deeper while the center remains locally stable. Equal depth marks the transition in the leading scalar description. The later loss of local stability is called a spinodal boundary.

[Rubin, Seroussi & Ringel (2024)](https://openreview.net/forum?id=3ROGsTX3IR) study this change in the posterior. Their mean field limit gives a simpler conditional potential, which illustrates how the minima change. In our notation, $s_a^2$ is the full readout variance, so the interaction strength is

$$
u=\frac{P^2s_a^2}{T^2D}.
$$

Taking $L\to1$ in Equation {{< eqref "overlap-potential" >}} gives

{{< equation id="effective-action-slice" wide="true" >}}
\frac{\widetilde U_u(\rho)}{D} =\frac{\rho^2}{2\sigma_w^2} -\frac{2u}{\pi} \frac{\rho^2}{1+2(\sigma_w^2+\rho^2)} \left( b-\frac{2c\rho^2}{1+2(\sigma_w^2+\rho^2)} \right)^2.
{{< /equation >}}

Equation {{< eqref "effective-action-slice" >}} is a further limiting form, not an exact rewrite at standard scaling. {{< plate-ref "overlap-phase-portrait" >}} varies $u$ while holding $b$ and $c$ fixed. In the network calculation, those residual coefficients must also change through self consistency.

{{< scientific-plate kind="overlap" id="overlap-phase-portrait" title="Aligned neuron populations appear as new posterior wells" caption="Move the control $u$ to compare the central and aligned minima. The curve fixes $\sigma_w^2=0.5$, $b=0.30$, and $c=-0.30$. The forty dots illustrate an unaligned population, a mixture of unaligned and aligned populations, and an aligned population. Vertical position separates the dots, and the displayed $R$ is their mean squared overlap. The dots and their mixture weights are illustrative. The control changes an interaction strength, not training time." >}}

{{< calculation id="hermite-identity" title="Derive the Gaussian Hermite identity" >}}

We can derive the overlap powers by separating the feature input into a part along the target and an independent Gaussian part,

$$
g=\rho z+\sqrt{q-\rho^2}\,\xi, \qquad \xi\sim\mathcal N(0,1), \qquad \xi\ \text{independent of }z.
$$

For fixed $\xi$, set $h(z)=F(g)$. The one variable Stein identity gives

$$
\mathbb{E}[H_k(z)h(z)]=\mathbb{E}[h^{(k)}(z)].
$$

Each derivative with respect to $z$ contributes one factor of $\rho$, so

$$
h^{(k)}(z)=\rho^kF^{(k)}(g).
$$

Averaging over $\xi$ gives Equation {{< eqref "stein-hermite" >}}. For $F(g)=\operatorname{erf}(g)$, the derivative averages are

$$
\mathbb{E}[F'(g)] =\frac{2}{\sqrt\pi}\frac1{\sqrt{1+2q}}, \qquad \mathbb{E}[F'''(g)] =-\frac{4}{\sqrt\pi}\frac1{(1+2q)^{3/2}}.
$$

{{< /calculation >}}

{{< calculation id="sample-concentration" title="Check the sample sum approximation" >}}

For fixed $\mathbf w$ and a fixed residual function $r$, we can estimate the size of the error in replacing the sample sums by means. Each sample average uses $P$ independent terms, so

$$
\operatorname{Var}\!\left[\frac{S(\mathbf w)}P\right] =\frac1P\operatorname{Var}\!\left[r(\mathbf x)\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)\right],
$$

and

$$
\operatorname{Var}\!\left[\frac{Q(\mathbf w)}P\right] =\frac1P\operatorname{Var}\!\left[\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)^2\right].
$$

Both averages fluctuate on the scale $P^{-1/2}$. With $s_a^2\sim N^{-1}$ and $P\sim N\sim D$, their first correction to the log posterior at fixed $\mathbf w$ is $O(\sqrt D)$, below the leading $O(D)$ term. Using the population values throughout the posterior is a saddle-point approximation; this fixed-weight estimate alone does not control the error for weights selected by the data.

{{< /calculation >}}

{{< calculation id="norm-concentration" title="Check the perpendicular norm approximation" >}}

The approximation $q\simeq\sigma_w^2+\rho^2$ keeps the perpendicular weight length at its typical prior value. To calculate that value, decompose the weight as

$$
\mathbf w=\rho\mathbf e+\mathbf w_\perp, \qquad \mathbf e^{\mathsf T}\mathbf w_\perp=0.
$$

Under the Gaussian prior, the $D-1$ orthogonal coordinates have variance $\sigma_w^2/D$. Therefore

$$
\lVert \mathbf w_\perp \rVert^2 \sim\frac{\sigma_w^2}{D}\chi^2_{D-1}.
$$

Its mean approaches $\sigma_w^2$, and its relative fluctuations have size $D^{-1/2}$.

Prior concentration explains the value we use. Keeping it fixed after conditioning on the data is a further approximation, since the fit reward also depends on the norm.

{{< /calculation >}}

{{< calculation id="small-overlap" title="Expand the potential near zero overlap" >}}

The curvature at zero tells us when the central minimum loses local stability. Expand the residual correlation and the readout factor as

$$
m(\rho)=\alpha\rho+O(\rho^3), \qquad L(\rho)=L_0+\ell\rho^2+O(\rho^4).
$$

Then

$$
m(\rho)^2=\alpha^2\rho^2+O(\rho^4), \qquad \log L(\rho)=\log L_0+\frac{\ell}{L_0}\rho^2+O(\rho^4).
$$

Substitution into the scalar potential gives

$$
U''(0) =\frac{D}{\sigma_w^2} +\frac{\ell}{L_0} -\frac{s_a^2P^2\alpha^2}{T^2L_0}.
$$

The centered state loses local stability when $U''(0)$ changes sign. A finite-overlap minimum can become preferable before that happens.

{{< /calculation >}}

## The hidden weight covariance records the learned direction {#rank-one-update}

Aligned weights with opposite signs can have zero mean, so the mean alone cannot tell us whether the network learned the direction. We instead measure the squared overlap,

$$
R=\mathbb{E}[\rho^2].
$$

Before alignment, $R=O(D^{-1})$. Once the posterior assigns finite mass near $\rho=\pm\rho_*$, $R$ becomes $O(1)$. Symmetry still gives $\mathbb{E}[\rho]=0$.

Decompose a hidden weight into parts parallel and orthogonal to the teacher,

$$
\mathbf w=\rho\mathbf e+\boldsymbol\xi, \qquad \mathbf e^{\mathsf T}\boldsymbol\xi=0.
$$

The perpendicular directions remain equivalent in our scalar approximation. Keeping their total squared length at $\sigma_w^2$ gives, to leading order at large $D$,

{{< equation id="rank-one-covariance" wide="true" >}}
\mathbb{E}[\mathbf w\mathbf w^{\mathsf T}] =\frac{\sigma_w^2}{D-1} \bigl(\mathbf I-\mathbf e\mathbf e^{\mathsf T}\bigr) +R\,\mathbf e\mathbf e^{\mathsf T}.
{{< /equation >}}

The eigenvalue along $\mathbf e$ is $R$, while each perpendicular eigenvalue remains $O(D^{-1})$. Once $R=O(1)$, we can recover the learned direction from the covariance's leading eigenvector. The extra term along $\mathbf e\mathbf e^{\mathsf T}$ is a rank-one change in the hidden weight covariance.

{{< scientific-plate kind="rank-one" id="weight-covariance" title="The covariance records direction learning" caption="Oppositely aligned populations have zero mean but an order one covariance eigenvalue along the target direction. Multiplying the original isotropic covariance by a scalar would change all directions alike and cannot describe that preferred direction." >}}

The hidden weight covariance describes directions in input space. The feature kernel, which we use next, describes correlations between neuron outputs on different inputs. [Rubin et al. (2025)](https://proceedings.mlr.press/v267/rubin25a.html) retain directional information that a scalar kernel rescaling can miss, even in regimes where rescaling predicts some mean outputs well.

## Match the residual to the network's prediction {#self-consistency}

We have scored hidden weights against a residual specified by $(b,c)$. To describe the network, we must now require its predictions to leave that same residual.

We summarize the learned features by their kernel, which measures how much a typical feature responds to both members of an input pair. For a candidate residual, the hidden weight posterior gives

{{< equation id="adaptive-kernel" wide="true" >}}
K_{\mu\nu}(b,c) =Ns_a^2\, \mathbb{E}_{p(\mathbf w\mid b,c)}\!\left[ \operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\mu) \operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\nu) \right].
{{< /equation >}}

Within the adaptive kernel approximation, we then use Gaussian regression to calculate the mean prediction. The mean residual is

{{< equation id="posterior-residual" >}}
\overline{\mathbf r} =T\bigl(\mathbf K(b,c)+T\mathbf I\bigr)^{-1}\mathbf y.
{{< /equation >}}

Projecting $\overline{\mathbf r}$ onto the sampled functions $H_1$ and $H_3$ gives new residual coefficients. We choose $(b,c)$ so that the new coefficients equal the ones used to construct the posterior. On a finite data set, the projection is a least-squares fit to the two functions, since their sample correlation need not be zero.

{{< scientific-plate kind="self-consistency" id="adaptive-loop" title="The learned features and residual must agree" caption="A candidate residual determines the hidden weight posterior. Averaging its features gives a kernel and a new prediction. At a self-consistent solution, that prediction leaves the candidate residual unchanged." >}}

## Direction learning reduces the sample count {#sample-complexity}

We can now connect the learned direction to the number of examples needed for nonlinear prediction. The relevant quantity is the strength of the cubic target component in the hidden features.

For a random hidden weight, $\rho=O(D^{-1/2})$. Its correlation with the cubic target is proportional to $\rho^3$, and the kernel contains the square of that correlation. The cubic kernel power is therefore $O(D^{-3})$. A finite fraction of aligned weights with $\rho=O(1)$ gives the same component order one strength.

For the comparison, keep $Ns_a^2$ and $T$ of order one. A fixed isotropic kernel needs $P=O(D^3)$ samples for its weak cubic component to become learnable. The adaptive network can use the linear target component to identify the shared direction at $P=O(D)$, then reuse that direction for cubic prediction.

The sample counts in {{< plate-ref "cubic-sample-gap" >}} reflect the inverse strength of the cubic component. The benefit comes from learning a direction shared by the linear and cubic parts; the argument does not give the same sample count for a purely cubic target.

{{< scientific-plate kind="sample-complexity" id="cubic-sample-gap" title="A learned direction changes the cubic sample scale" caption="For fixed features, cubic kernel power falls as the inverse cube of dimension, so the sample count grows as the cube of dimension. The adaptive network uses the linear component to learn the target direction with a sample count proportional to dimension. Finite overlap then gives the cubic component order one strength along the same direction." >}}

[Rubin et al. (2025)](https://proceedings.mlr.press/v267/rubin25a.html) predict the onset of nonlinear learning at $P=O(D)$, while the fixed infinite-width Gaussian process kernel and scalar rescaling descriptions retain the $O(D^3)$ scale. [Rubin, Seroussi & Ringel (2024)](https://openreview.net/forum?id=3ROGsTX3IR) connect the improvement in cubic prediction to the feature learning transition.

{{< calculation id="cubic-sample-scale" title="Derive the cubic sample scale" >}}

The cubic power follows by squaring the Gaussian correlation we calculated earlier. For one erf feature, write

$$
h_3(\mathbf w) =\mathbb{E}[\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)H_3(z)] =-\frac{4\rho^3}{\sqrt\pi(1+2q)^{3/2}}.
$$

Since $\mathbb E[H_3^2]=6$, the unit-normalized cubic function is $H_3/\sqrt6$. The kernel power along that function is

$$
\lambda_3=\frac{Ns_a^2}{6}\,\mathbb E_{\mathbf w}[h_3(\mathbf w)^2].
$$

At initialization, $\rho=O(D^{-1/2})$, which gives

$$
h_3(\mathbf w)=O(D^{-3/2}), \qquad h_3(\mathbf w)^2=O(D^{-3}).
$$

With $Ns_a^2=O(1)$, we have $\lambda_3=O(D^{-3})$. In the fixed-kernel estimate, the cubic component becomes learnable when $P\lambda_3$ is comparable to $T$, giving $P=O(D^3)$. A finite fraction of weights with order one overlap removes that suppression of the cubic power.

{{< /calculation >}}

## What we are working on {#current-work}

The calculation shows how alignment of hidden weights changes the network's features and improves prediction. We can build on that connection to study how networks organize learned features across neurons. The same feature can involve a few neurons with large contributions or many neurons with small contributions.

Different populations can compute the same function while having different hidden weight covariances and responses to removing neurons. For mechanistic interpretability and AI safety, we want to predict how the network's internal organization implements its function, including how many neurons participate and how strongly each contributes.

Our work uses the statistical physics approach to develop a theory of how learning shapes a network's internal representations. We will explore that connection between learning theory and interpretability in later posts in the sequence.

## References {#references}

[Rubin, N., Seroussi, I., & Ringel, Z. (2024). Grokking as a first order phase transition in two layer networks. International Conference on Learning Representations.](https://openreview.net/forum?id=3ROGsTX3IR)

[Rubin, N., Fischer, K., Lindner, J., Seroussi, I., Ringel, Z., Krämer, M., & Helias, M. (2025). From kernels to features: A multi-scale adaptive theory of feature learning. Proceedings of the 42nd International Conference on Machine Learning, 267, 52225–52257.](https://proceedings.mlr.press/v267/rubin25a.html)
