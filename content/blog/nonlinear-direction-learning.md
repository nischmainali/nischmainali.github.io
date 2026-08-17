+++
author = "Nisch"
categories = ["Notes"]
date = 2026-08-14
description = "A statistical mechanics account of how a Bayesian network changes its hidden weight distribution to learn one useful direction."
short_title = "Nonlinear feature learning"
subtitle = "A statistical mechanics account of feature learning in a Bayesian network with two trainable layers"
tags = ["Feature learning", "Neural networks", "Statistical mechanics"]
title = "A solvable model of feature learning in a nonlinear network"
+++

{{< dropcap "M" >}}any theoretical accounts attribute much of the success of deep neural networks to feature learning, in which training changes the features represented by a network's hidden layers. A theory of deep learning needs to explain which features a nonlinear network learns and how its weights represent them. We do not yet have a general theory that answers these questions.

Theorists have made progress by simplifying the task or the network. Rubin and collaborators developed one of the clearest solvable examples within an equilibrium Bayesian theory. They study a nonlinear network with two trainable layers in a teacher and student setting. With methods from statistical mechanics, they derive the posterior over its weights. In that posterior, a hidden layer that starts isotropic acquires populations of weights aligned with one useful direction.

In this model, explicit feature learning is a change in the weight posterior. At the transition, the posterior over one scalar overlap develops new wells at finite overlap, and the hidden weight covariance gains a rank one term along the teacher direction. Rubin and collaborators connect the representation change to a first order transition in generalization and to grokking. The network can transfer from an easy linear target component to a harder cubic component.

I explain the feature learning result and the methods used to derive it. I begin with a cavity reduction and use it to isolate one neuron. The neuron's $D$ dimensional posterior depends on one scalar overlap. I close the calculation with a self consistency equation that connects the learned weight distribution to the network's prediction residual. A broader theory will need comparable order parameters and closure equations for richer networks.

Noa Rubin, Inbar Seroussi, and Zohar Ringel use the model to study grokking as a first order feature learning transition {{< cite "rubin2024" >}}. A later paper by Rubin and collaborators places the same mechanism inside a theory that covers several network scaling regimes {{< cite "rubin2025" >}}. I follow the overlap transition from the first paper and use the adaptive kernel relation developed across both papers.

## The target depends on one direction {#one-direction}

Let the input be isotropic Gaussian,

$$
\mathbf x\sim\mathcal N(\mathbf 0,\mathbf I_D),
$$

and let $\mathbf e\in\RR^D$ be an unknown unit vector. The teacher depends only on the scalar projection

$$
z=\mathbf e^{\mathsf T}\mathbf x.
$$

Its output combines the first and third probabilists' Hermite polynomials,

{{< equation id="teacher" >}}
y(\mathbf x)=H_1(z)+\epsilon H_3(z)
=z+\epsilon(z^3-3z).
{{< /equation >}}

The two modes are orthogonal under the standard Gaussian measure, and both use the same $\mathbf e$. The coefficient $\epsilon$ may be small.

The student is a network with two layers and an odd nonlinearity,

{{< equation id="student" >}}
f(\mathbf x)=\sum_{i=1}^{N}a_i\,\operatorname{erf}(\mathbf w_i^{\mathsf T}\mathbf x).
{{< /equation >}}

Each hidden weight $\mathbf w_i$ can rotate. We measure its alignment with the teacher by the overlap

$$
\rho_i=\mathbf w_i^{\mathsf T}\mathbf e.
$$

{{< plate-ref "shared-direction" >}} shows the task and the scalar order parameter.

{{< scientific-plate kind="direction" id="shared-direction" title="One direction carries both target modes" caption="The teacher uses one scalar projection. The linear and cubic Hermite modes share that coordinate. Feature learning appears when the hidden weight distribution acquires finite overlap with the teacher direction." >}}

The linear part contains enough information to estimate the teacher direction. Consider

{{< equation id="linear-estimator" >}}
\widehat{\mathbf e}
=\frac1P\sum_{\mu=1}^{P}y^\mu\mathbf x^\mu.
{{< /equation >}}

Gaussian orthogonality gives

$$
\EE[y\mathbf x]
=\mathbf e\,\EE[zH_1(z)]
+\epsilon\mathbf e\,\EE[zH_3(z)]
=\mathbf e.
$$

The squared estimation error is $O(D/P)$, so $P=O(D)$ examples identify $\mathbf e$ to order one accuracy.{{< sidenote >}}The linear term supplies the direction. Without it, this derivation does not give the network a route to the cubic target. Another mechanism could still learn the target.{{< /sidenote >}}

After $O(D)$ samples, the data contain the direction. We need to explain when training puts that direction into the hidden weight distribution and how the new distribution changes prediction.

## A Bayesian model exposes the hidden representation {#bayesian-proxy}

The tractable model treats training as Bayesian inference. Put independent priors on the hidden and readout weights,

$$
\mathbf w_i\sim\mathcal N\!\left(\mathbf 0,\frac{\sigma_w^2}{D}\mathbf I_D\right),
\qquad
a_i\sim\mathcal N(0,s_a^2),
$$

and use a Gaussian likelihood with variance $T$ on a training set of size $P$,

$$
p(\mathcal D\mid\{a_i,\mathbf w_i\})
\propto
\exp\!\left[-\frac1{2T}\sum_{\mu=1}^{P}
\bigl(y^\mu-f(\mathbf x^\mu)\bigr)^2\right].
$$

Standard scaling takes $s_a^2=O(1/N)$. The posterior balances a prior cost in $D$ dimensions against the fit reward from $P$ examples.

The hidden weight distribution provides a direct measure of feature learning. Feature learning appears when that distribution changes from isotropic to aligned with a direction selected by the target.{{< sidenote >}}Equilibrated Langevin training samples this posterior. Gradient descent can follow another path and can take a different time to reach equilibrium, so its dynamics need a separate argument.{{< /sidenote >}}

## Score one neuron against the residual {#one-neuron-posterior}

Remove one neuron from the network and call the residual left by the other $N-1$ neurons

$$
r_\mu=y^\mu-f_{-}(\mathbf x^\mu).
$$

For a candidate hidden weight $\mathbf w$, define its feature vector on the training set by

$$
\phi_\mu(\mathbf w)=\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\mu).
$$

The selected neuron contributes $a\boldsymbol\phi$. Conditional on $\mathbf w$, its readout coefficient is Gaussian, so we can integrate it exactly. Introduce

$$
S(\mathbf w)=\boldsymbol\phi^{\mathsf T}\mathbf r,
\qquad
Q(\mathbf w)=\boldsymbol\phi^{\mathsf T}\boldsymbol\phi,
\qquad
L(\mathbf w)=1+\frac{s_a^2}{T}Q(\mathbf w).
$$

Completing the square in $a$ gives

{{< equation id="one-neuron-posterior" wide="true" >}}
p(\mathbf w\mid\mathbf r,X)
\propto
p_0(\mathbf w)\,L(\mathbf w)^{-1/2}
\exp\!\left[
\frac{s_a^2S(\mathbf w)^2}{2T^2L(\mathbf w)}
\right].
{{< /equation >}}

Equation {{< eqref "one-neuron-posterior" >}} is exact for a fixed cavity residual. The prior keeps $\mathbf w$ small and isotropic. The factor $L^{-1/2}$ accounts for the cost of fitting a readout coefficient, and the exponential rewards a feature that correlates with the residual.{{< sidenote >}}The cavity step holds the residual fixed while it scores one neuron. The final self consistency step returns the neuron to the network and requires the residual and adaptive kernel to agree.{{< /sidenote >}}

{{< calculation id="readout-integral" title="Complete the square in the readout weight" >}}
Expand the squared residual,

$$
\norm{\mathbf r-a\boldsymbol\phi}^2
=\norm{\mathbf r}^2-2aS(\mathbf w)+a^2Q(\mathbf w).
$$

The terms that depend on $a$ have the form

$$
-\frac{A(\mathbf w)}2a^2+B(\mathbf w)a,
\qquad
A(\mathbf w)=\frac1{s_a^2}+\frac{Q(\mathbf w)}T,
\qquad
B(\mathbf w)=\frac{S(\mathbf w)}T.
$$

The Gaussian identity

$$
\int_{-\infty}^{\infty}
\exp\!\left(-\frac A2a^2+Ba\right)\dd a
=\sqrt{\frac{2\pi}{A}}\exp\!\left(\frac{B^2}{2A}\right)
$$

then gives Equation {{< eqref "one-neuron-posterior" >}} after removing factors that do not depend on $\mathbf w$.
{{< /calculation >}}

The fit reward depends on $S^2$, so the signs $\mathbf w$ and $-\mathbf w$ remain equivalent. The mean weight can stay at zero while an even moment such as $\EE[\rho^2]$ records direction learning.

## Reduce the hidden weight posterior to one overlap {#overlap-reduction}

Before the transition, the residual lies mainly in the same two Hermite modes as the teacher. Write its population form as

{{< equation id="residual-modes" >}}
r(\mathbf x)=bH_1(z)+cH_3(z).
{{< /equation >}}

For one hidden weight, let

$$
g=\mathbf w^{\mathsf T}\mathbf x,
\qquad
q=\norm{\mathbf w}^2,
\qquad
\rho=\mathbf w^{\mathsf T}\mathbf e.
$$

The pair $(g,z)$ is jointly Gaussian, with covariance $\rho$. For a smooth function $F$, the higher order Stein identity gives

{{< equation id="stein-hermite" >}}
\EE[F(g)H_k(z)]
=\rho^k\EE[F^{(k)}(g)].
{{< /equation >}}

The identity turns the $k$th teacher mode into the $k$th power of the overlap.{{< sidenote >}}Gaussian inputs give the clean $\rho^k$ factor. With non Gaussian inputs, higher moments can mix the teacher modes, so the calculation needs a different moment expansion.{{< /sidenote >}}

{{< calculation id="hermite-identity" title="Derive the Gaussian Hermite identity" >}}
Write the correlated Gaussian variables as

$$
g=\rho z+\sqrt{q-\rho^2}\,\xi,
\qquad
\xi\sim\mathcal N(0,1),
\qquad
\xi\ \text{independent of }z.
$$

For fixed $\xi$, set $h(z)=F(g)$. The one variable Stein identity gives

$$
\EE[H_k(z)h(z)]=\EE[h^{(k)}(z)].
$$

Each derivative with respect to $z$ contributes one factor of $\rho$, so

$$
h^{(k)}(z)=\rho^kF^{(k)}(g).
$$

Averaging over $\xi$ gives Equation {{< eqref "stein-hermite" >}}. For $F(g)=\operatorname{erf}(g)$, the first and third derivative averages are

$$
\EE[F'(g)]
=\frac{2}{\sqrt\pi}\frac1{\sqrt{1+2q}},
\qquad
\EE[F'''(g)]
=-\frac{4}{\sqrt\pi}\frac1{(1+2q)^{3/2}}.
$$
{{< /calculation >}}

Setting $F=\operatorname{erf}$ yields the two correlations needed here,

$$
\begin{aligned}
\EE[\operatorname{erf}(g)H_1(z)]
&=\frac{2\rho}{\sqrt{\pi(1+2q)}},\\
\EE[\operatorname{erf}(g)H_3(z)]
&=-\frac{4\rho^3}{\sqrt\pi(1+2q)^{3/2}}.
\end{aligned}
$$

The resulting correlation between the feature and residual is

{{< equation id="overlap-correlation" wide="true" >}}
m(\rho,q)
=\EE[r(\mathbf x)\operatorname{erf}(g)]
=\frac{2}{\sqrt\pi}
\frac{\rho}{\sqrt{1+2q}}
\left(
b-\frac{2c\rho^2}{1+2q}
\right).
{{< /equation >}}

The feature variance is

{{< equation id="erf-variance" >}}
v(q)=\EE[\operatorname{erf}(g)^2]
=\frac{2}{\pi}\arcsin\!\left(\frac{2q}{1+2q}\right).
{{< /equation >}}

For large $P$, the empirical quantities concentrate as $S\simeq Pm$ and $Q\simeq Pv$.

{{< calculation id="sample-concentration" title="Check the sample sum approximation" >}}
For fixed $\mathbf w$ and residual function $r$, both $S/P$ and $Q/P$ average $P$ independent terms. Their variances are

$$
\Var\!\left[\frac{S(\mathbf w)}P\right]
=\frac1P\Var\!\left[r(\mathbf x)\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)\right],
$$

and

$$
\Var\!\left[\frac{Q(\mathbf w)}P\right]
=\frac1P\Var\!\left[\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)^2\right].
$$

Both averages fluctuate on the scale $P^{-1/2}$. Under $s_a^2\sim N^{-1}$ and $P\sim N\sim D$, the leading log posterior is $O(D)$ while the first correction for fixed $\mathbf w$ is $O(\sqrt D)$.
{{< /calculation >}}

The components of $\mathbf w$ orthogonal to $\mathbf e$ also concentrate, so

$$
q\simeq\sigma_w^2+\rho^2.
$$

{{< calculation id="norm-concentration" title="Check the orthogonal norm concentration" >}}
Decompose the weight as

$$
\mathbf w=\rho\mathbf e+\mathbf w_\perp,
\qquad
\mathbf e^{\mathsf T}\mathbf w_\perp=0.
$$

Under the Gaussian prior, the $D-1$ orthogonal coordinates have variance $\sigma_w^2/D$. Therefore

$$
\norm{\mathbf w_\perp}^2
\sim\frac{\sigma_w^2}{D}\chi^2_{D-1}.
$$

Its mean approaches $\sigma_w^2$, and its relative fluctuations have size $D^{-1/2}$.
{{< /calculation >}}

After these approximations, Equation {{< eqref "one-neuron-posterior" >}} gives the scalar distribution

{{< equation id="overlap-posterior" >}}
p(\rho\mid b,c)\propto e^{-U(\rho;b,c)},
{{< /equation >}}

with

{{< equation id="overlap-potential" wide="true" >}}
U(\rho;b,c)
=\frac{D\rho^2}{2\sigma_w^2}
+\frac12\log L(\rho)
-\frac{s_a^2P^2m(\rho)^2}{2T^2L(\rho)},
\qquad
L(\rho)=1+\frac{s_a^2P}{T}v(\sigma_w^2+\rho^2).
{{< /equation >}}

The first term is the prior cost of selecting one direction in $D$ dimensions. The last term rewards a feature that fits the residual. Since $m(\rho)$ begins at first order in $\rho$, enough data can make weights with finite overlap competitive.

{{< statement kind="proposition" id="alignment-scale" title="Alignment scale" >}}
Let $s_a^2=O(1/N)$ and suppose $b$, $T$, and the prior scales remain order one. Near $\rho=0$, the fit reward competes with the directional prior cost when

$$
\frac{P^2}{N}=O(D).
$$

Hence $P_{\mathrm{align}}=O(\sqrt{ND})$. In the proportional regime $N=O(D)$, the posterior can acquire finite overlap at $P=O(D)$.
{{< /statement >}}

{{< calculation id="small-overlap" title="Expand the action near zero overlap" >}}
Write

$$
m(\rho)=\alpha\rho+O(\rho^3),
\qquad
L(\rho)=L_0+\ell\rho^2+O(\rho^4).
$$

Then

$$
m(\rho)^2=\alpha^2\rho^2+O(\rho^4),
\qquad
\log L(\rho)=\log L_0+\frac{\ell}{L_0}\rho^2+O(\rho^4).
$$

Substitution into the scalar potential gives

$$
U''(0)
=\frac{D}{\sigma_w^2}
+\frac{\ell}{L_0}
-\frac{s_a^2P^2\alpha^2}{T^2L_0}.
$$

The centered state loses local stability when this curvature changes sign. With $s_a^2=O(N^{-1})$, the prior and fit terms balance at $P=O(\sqrt{ND})$.
{{< /calculation >}}

The curvature test locates a spinodal boundary. The first order transition studied by Rubin, Seroussi, and Ringel is a global statement. Wells at finite overlap can reach the same depth as the centered well before the center loses local stability {{< cite "rubin2024" >}}.{{< sidenote >}}New minima at finite overlap first appear, then reach the same depth as the centered minimum, and later make the center unstable. The middle event is the first order transition.{{< /sidenote >}}

The 2024 paper combines the sample count and the remaining scales into an effective interaction,

{{< equation id="effective-action-slice" wide="true" >}}
u=\frac{P^2s_a^2}{T^2DN},
\qquad
\frac{\widetilde U_u(\rho)}{D}
=\frac{\rho^2}{2\sigma_w^2}
-\frac{2u}{\pi}
\frac{\rho^2}{1+2(\sigma_w^2+\rho^2)}
\left(
b-\frac{2c\rho^2}{1+2(\sigma_w^2+\rho^2)}
\right)^2.
{{< /equation >}}

Move the control in {{< plate-ref "overlap-phase-portrait" >}} to follow the conditional action as $u$ increases. The adjacent hidden population uses the same overlap coordinate and shows how posterior mass moves between the wells.

{{< scientific-plate kind="overlap" id="overlap-phase-portrait" title="Aligned neuron populations appear as new posterior wells" caption="Move the effective interaction $u$ through an analytic slice of the 2024 mean field action. The curve fixes $\sigma_w^2=0.5$, $b=0.30$, and $c=-0.30$. The population of forty units follows the same minima. Units stay near zero in GFL, divide between the centre and side wells in GMFL-I, and occupy the side wells in GMFL-II. Vertical position separates the dots. The displayed $R$ is the second moment of the dots. The dots and their mixture weights are illustrative. The full theory solves $b$ and $c$ through self consistency." >}}

## The hidden covariance records the learned direction {#rank-one-update}

Let

$$
R=\EE[\rho^2].
$$

Before alignment, $R=O(D^{-1})$. Once the posterior assigns finite mass near $\rho=\pm\rho_*$, $R$ becomes $O(1)$. Symmetry still gives $\EE[\rho]=0$.

Decompose a hidden weight into parts parallel and orthogonal to the teacher,

$$
\mathbf w=\rho\mathbf e+\boldsymbol\xi,
\qquad
\mathbf e^{\mathsf T}\boldsymbol\xi=0.
$$

The orthogonal directions remain equivalent. To leading order at large $D$,

{{< equation id="rank-one-covariance" wide="true" >}}
\EE[\mathbf w\mathbf w^{\mathsf T}]
=\frac{\sigma_w^2}{D-1}
\bigl(\mathbf I-\mathbf e\mathbf e^{\mathsf T}\bigr)
+R\,\mathbf e\mathbf e^{\mathsf T}.
{{< /equation >}}

The covariance therefore receives a rank one correction along $\mathbf e$. {{< plate-ref "weight-covariance" >}} shows why the second moment is the right measure. A symmetric pair of aligned populations can have zero mean while its covariance records the learned direction.

{{< scientific-plate kind="rank-one" id="weight-covariance" title="The covariance records direction learning" caption="The weight mean can remain zero because the two signs are equivalent. The second moment acquires an eigenvalue of order one along the teacher direction. Multiplying the original isotropic kernel by one scalar cannot represent this directional change." >}}

The rank one term is a direct measure of explicit feature learning. A scalar rescaling changes every direction by the same factor, while the adaptive covariance changes the target direction. Rubin and collaborators retain this directional information across several network scaling regimes, including regimes where a scalar rescaling predicts some mean outputs well {{< cite "rubin2025" >}}.

## Self consistency closes the feature learning loop {#self-consistency}

The one neuron posterior starts from coefficients $(b,c)$ in the residual. The whole network determines those coefficients through its current prediction.

For a candidate residual, the overlap posterior defines an adaptive kernel,

{{< equation id="adaptive-kernel" wide="true" >}}
K_{\mu\nu}(b,c)
=Ns_a^2\,
\EE_{p(\mathbf w\mid b,c)}\!\left[
\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\mu)
\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x^\nu)
\right].
{{< /equation >}}

For that kernel, the posterior mean residual on the training set is

{{< equation id="posterior-residual" >}}
\overline{\mathbf r}
=T\bigl(\mathbf K(b,c)+T\mathbf I\bigr)^{-1}\mathbf y.
{{< /equation >}}

Projecting $\overline{\mathbf r}$ onto $H_1$ and $H_3$ gives new coefficients $(b,c)$. A solution is a fixed point of this map. {{< plate-ref "adaptive-loop" >}} shows the full loop.

{{< scientific-plate kind="self-consistency" id="adaptive-loop" title="The learned features and residual must agree" caption="The residual sets the posterior over hidden directions. The posterior sets the adaptive kernel, and the kernel changes the residual. A self consistent solution satisfies all parts of the loop together." >}}

Solving the closed loop extends the score for one neuron to the whole network. The residual specifies what remains to be learned. The hidden weight distribution changes the kernel, and the new kernel produces a new residual. A broader theory of feature learning will need an analogous link between representation changes and prediction errors.

## A sample complexity corollary {#sample-complexity}

The learned direction changes the kernel power assigned to the cubic teacher mode. Before alignment, a random hidden direction has $\rho=O(D^{-1/2})$, so the cubic kernel power is $O(D^{-3})$. After alignment, a finite part of the posterior has $\rho=O(1)$, so the same channel has order one strength.

{{< calculation id="cubic-sample-scale" title="Derive the cubic sample scale" >}}
The third Hermite coefficient of one erf feature is

$$
h_3(\mathbf w)
=\EE[\operatorname{erf}(\mathbf w^{\mathsf T}\mathbf x)H_3(z)]
=-\frac{4\rho^3}{\sqrt\pi(1+2q)^{3/2}}.
$$

At initialization, $\rho=O(D^{-1/2})$, which gives

$$
h_3(\mathbf w)=O(D^{-3/2}),
\qquad
h_3(\mathbf w)^2=O(D^{-3}).
$$

The squared coefficient controls the kernel power. With $Ns_a^2=O(1)$, averaging over width leaves the $D^{-3}$ scale unchanged. A fixed kernel needs $P=O(D^3)$ examples before the cubic mode has order one signal relative to noise. Once the posterior has finite overlap, $h_3(\mathbf w)=O(1)$.
{{< /calculation >}}

The linear target mode reveals $\mathbf e$ at $P=O(D)$. The adaptive network can reuse the learned direction for the cubic function of the same coordinate, while a fixed kernel still needs $P=O(D^3)$.{{< sidenote >}}The exponent three comes from squaring $h_3\propto\rho^3$ when a random overlap has size $\rho=O(D^{-1/2})$. It does not come from counting every cubic monomial in $D$ variables.{{< /sidenote >}}

{{< plate-ref "cubic-sample-gap" >}} compares the two sample scales.

{{< scientific-plate kind="sample-complexity" id="cubic-sample-gap" title="A learned direction changes the cubic sample scale" caption="For fixed features, cubic kernel power falls as the inverse cube of dimension, so the required sample count grows as the cube of dimension. The adaptive network uses the linear mode to identify the teacher direction with a sample count proportional to dimension. Finite overlap then gives the cubic mode order one strength along the same direction." >}}

The later adaptive theory predicts learning of the nonlinear component at $P=O(D)$, while the NNGP and scalar rescaling descriptions retain the $O(D^3)$ requirement {{< cite "rubin2025" >}}. The earlier grokking paper observes the same change after the feature learning transition {{< cite "rubin2024" >}}.

## How the two papers fit together {#two-papers}

The 2024 paper studies the phase structure of this teacher and student model and a model of modular addition. In the cubic task, the scalar overlap action has a centered state and a symmetric pair of states aligned with the teacher. A first order transition produces a mixture of hidden weight populations and a sharp change in generalization. The authors use the transition to connect feature learning with grokking {{< cite "rubin2024" >}}.

The 2025 paper begins from a more general distribution over network outputs. Its multiscale adaptive theory covers several width scalings and explains when a scalar kernel rescaling can reproduce the mean prediction. The adaptive theory retains changes along target directions. In the nonlinear teacher example, those changes alter which target components can be learned at $P=O(D)$ {{< cite "rubin2025" >}}.

The derivation for one neuron links the two accounts. It exposes the overlap variable and the rank one covariance update without reproducing the full variational Gaussian mixture calculation or the full expansion across scaling regimes.

## What a broader theory must explain {#scope}

The readout integral, the Gaussian Hermite identity, and the erf moments are exact. The reduction from sample sums to $m$ and $v$ uses concentration at large $P$. The scalar potential also uses norm concentration and restricts the cavity residual to two Hermite modes. The transition and covariance results hold to leading order in the large system limit.

The $D^3$ and $D$ laws give scaling with dimension rather than constants at finite size. They rely on isotropic Gaussian inputs, one shared teacher direction, and proportional width. The equilibrium posterior identifies the preferred representations, but it does not give the time that a particular optimizer needs to reach them.

Within these assumptions, the model gives a clear theoretical account of explicit feature learning. The posterior moves hidden neurons from random overlaps into populations aligned with the teacher, and the covariance records the change as a rank one term. The adaptive kernel then represents new functions along the learned direction. The change from $D^3$ to $D$ is one consequence of this representation change.

This model suggests a broader research program. A theory of feature learning needs an order parameter that records the learned representation and a self consistent equation that links it to the prediction error. The present model completes both steps with one scalar overlap. More complex networks will require several order parameters and a separate account of training dynamics.

## References {#references}

{{< references >}}
