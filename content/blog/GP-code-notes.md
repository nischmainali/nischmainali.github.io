+++
author = "Nisch"
categories = ["Notes"]
date = 2026-08-06
description = "A mathematical field note on Gaussian process neural codes, excursion geometry, spectral structure, and coding error."
short_title = "Gaussian process neural code"
subtitle = "Excursion geometry, spectral structure, and coding error"
tags = ["Gaussian Process", "Place cells", "Neural coding"]
title = "Mathematical properties of Gaussian process neural code"
+++

{{< dropcap "T" >}}hese notes develop the mathematical properties of Gaussian processes that matter when they are used as models of neural representation. The motivating example is a population code for space. A smooth random field supplies the subthreshold response of each neuron, and a cellular threshold turns its excursions into place fields. This point of view explains much of the field structure seen across species and environments {{< cite "mainali2024" >}}. It also gives a tractable way to ask what such a code can represent and how accurately it can be read.

The note began as a chalk talk at Janelia on 18 November 2024. We begin with Gaussian variables and processes, pass through the geometry of threshold excursions, and finish with a simple calculation of local and global decoding error.

## Background {#background}

Probability enters theoretical neuroscience in several distinct ways. It can represent noise in neural recordings, pose a learning problem with stochastic data or plasticity, model random synaptic weights, or provide an analytical route into large statistical systems. Here randomness serves a different purpose. It models a neural representation itself as a random code over a continuous external variable such as position.

### Gaussian variables {#gaussian-variables}

{{< statement kind="definition" id="gaussian-variable" title="Gaussian variables" >}}
A real random variable $\xi$ is Gaussian when, for some $m\in\RR$ and $\sigma>0$, it has density

$$
\phi_\xi(x)
= \frac{1}{\sqrt{2\pi\sigma^2}}
  \exp\!\left[-\frac{(x-m)^2}{2\sigma^2}\right].
$$

A vector $\boldsymbol\xi=(\xi_1,\ldots,\xi_p)$ is jointly Gaussian when every linear combination $\mathbf a^{\mathsf T}\boldsymbol\xi$ is Gaussian. Its mean is $\mathbf m=\EE[\boldsymbol\xi]$ and its covariance matrix is

$$
\boldsymbol\Sigma
= \EE\!\left[(\boldsymbol\xi-\mathbf m)(\boldsymbol\xi-\mathbf m)^{\mathsf T}\right].
$$

If $\det\boldsymbol\Sigma>0$, its density is

$$
\phi_{\boldsymbol\xi}(\mathbf x)
= \frac{\exp\!\left[-\tfrac12(\mathbf x-\mathbf m)^{\mathsf T}
    \boldsymbol\Sigma^{-1}(\mathbf x-\mathbf m)\right]}
  {(2\pi)^{p/2}\sqrt{\det\boldsymbol\Sigma}}.
$$
{{< /statement >}}

#### Conditional Gaussian {#conditional-gaussian}

The most useful closure property of a multivariate Gaussian is that conditioning one subset of variables on another still gives a Gaussian. Let $\boldsymbol\xi$ and $\boldsymbol\eta$ be jointly Gaussian, with means $\mathbf m_\xi$ and $\mathbf m_\eta$, and covariance

$$
\boldsymbol\Sigma=
\begin{pmatrix}
\boldsymbol\Sigma_{\xi\xi} & \boldsymbol\Sigma_{\xi\eta}\\
\boldsymbol\Sigma_{\eta\xi} & \boldsymbol\Sigma_{\eta\eta}
\end{pmatrix}.
$$

{{< statement kind="theorem" id="gaussian-conditioning" title="Gaussian conditioning" >}}
Given $\boldsymbol\eta=\mathbf y$, the conditional distribution of $\boldsymbol\xi$ is Gaussian. Its mean is

{{< equation id="conditional-mean" wide="true" >}}
\widehat{\boldsymbol\xi}(\mathbf y)
= \mathbf m_\xi
 \boldsymbol\Sigma_{\xi\eta}\boldsymbol\Sigma_{\eta\eta}^{-1}
  (\mathbf y-\mathbf m_\eta),
{{< /equation >}}

and its covariance is

{{< equation id="conditional-covariance" wide="true" >}}
\boldsymbol\Sigma_{\xi\xi\mid\eta}
= \boldsymbol\Sigma_{\xi\xi}
- \boldsymbol\Sigma_{\xi\eta}\boldsymbol\Sigma_{\eta\eta}^{-1}
  \boldsymbol\Sigma_{\eta\xi}.
{{< /equation >}}

The covariance does not depend on the observed value $\mathbf y$.
{{< /statement >}}

### Gaussian processes {#gaussian-processes}

{{< statement kind="definition" id="gaussian-process" title="Gaussian process" >}}
A stochastic process $\{f(x):x\in\RR\}$ is a Gaussian process if every finite linear combination

$$
S=\sum_k a_k f(x_k)
$$

is Gaussian. Equivalently, for every finite set $x_1,\ldots,x_k$, the vector $(f(x_1),\ldots,f(x_k))$ is multivariate Gaussian.
{{< /statement >}}

Moving from a Gaussian variable to a Gaussian vector replaces one value with a finite indexed collection. A Gaussian process continues that move to a continuously indexed random function. It is completely determined by its mean and covariance functions,

$$
m(x)=\EE[f(x)],
\qquad
r(x,y)=\EE[(f(x)-m(x))(f(y)-m(y))].
$$

For a stationary process with constant mean, the covariance depends only on the separation $\Delta x=y-x$, so we write $r(x,y)=r(\Delta x)$. In particular, $r(0)=r_0$ is the pointwise variance.

### Origins of a random code {#origins-of-a-random-code}

Consider $N$ spatially selective neurons presynaptic to a CA1 place cell. Let $u_i(x)$ be the bounded response of input neuron $i$ over an environment $x\in[0,L]$. For clarity, suppose all inputs share one tuning shape up to translation,

$$
u_i(x)=u_0(x-x_i),
$$

with preferred positions $x_i$ that tile the environment densely and uniformly. The subthreshold input to the CA1 cell is a random weighted sum,

{{< equation id="random-code" >}}
f(x)=\sum_{i=1}^{N}W_i u_i(x),
{{< /equation >}}

where the independent weights $W_i$ have zero mean and finite variance. For any finite set of locations $\{x_k\}$, the multidimensional central limit theorem gives a jointly Gaussian vector $(f(x_1),\ldots,f(x_k))$ as $N$ grows {{< cite "vaart1998" "lehmann1998" >}}. The limiting random function is therefore a Gaussian process.{{< sidenote >}}The central limit theorem supplies the Gaussian finite-dimensional distributions. The tuning curves and uniform tiling assumptions supply smoothness and stationarity.{{< /sidenote >}}

Uniform tiling also makes the covariance translation invariant. With input density $\rho=N/L$,

$$
\begin{aligned}
\EE[f(x)f(y)]
&=\sum_{i,j=1}^{N}\EE[W_iW_j]u_i(x)u_j(y)\\
&=\Var(W)\sum_{i=1}^{N}u_i(x)u_i(y)\\
&\approx \Var(W)\rho\int u_0(s)u_0(s+\Delta x)\,\dd s.
\end{aligned}
$$

Choosing $\Var(W)=L/N$ leaves a covariance $r(\Delta x)$ that does not grow with population size.

{{< scientific-plate kind="construction" id="random-field-construction" title="From translated inputs to a random field" caption="Translated input fields are multiplied by independent weights and summed. A cellular threshold then converts the smooth subthreshold field into separated place fields. The curves are a schematic construction, not recorded neural data." >}}

{{< statement kind="example" id="gaussian-input-fields" title="Gaussian input fields" >}}
Suppose each input has a Gaussian tuning curve,

$$
u_i(x)=R\exp\!\left[-\frac{(x-c_i)^2}{2\sigma^2}\right].
$$

Then the covariance is the autocorrelation of that curve. Away from finite-boundary effects,

$$
\begin{aligned}
r(\Delta x)
&\approx R^2\int
\exp\!\left[-\frac{(x-c)^2+(y-c)^2}{2\sigma^2}\right]\dd c\\
&=R^2\sqrt{\pi\sigma^2}
\exp\!\left[-\frac{\Delta x^2}{4\sigma^2}\right].
\end{aligned}
$$

The covariance width is therefore $\sqrt{2}$ times the standard deviation of an individual field, or twice its variance parameter.
{{< /statement >}}

In this model, position $x$ is supplied by the environment. The process $f(x)$ represents subthreshold CA1 activity produced by many synaptic inputs. Cellular thresholding, together with any incident inhibition, reveals firing fields wherever $f(x)$ rises above a level of order its standard deviation.

## Excursion structure {#excursion-structure}

The neural response can be idealized by a rectified threshold,

{{< equation id="threshold-response" >}}
h(x)=\max\!\left(0,f(x)-\theta\sqrt{r_0}\right).
{{< /equation >}}

Its nonzero regions are the excursion sets of $f$ above $\theta\sqrt{r_0}$. Their number, length, separation, height, and boundary slopes expose much of the geometry of the code before any further output nonlinearity is chosen.

{{< scientific-plate kind="field" id="gp-threshold-field" title="Threshold crossings of a smooth Gaussian field" caption="A fixed smooth sample path. Move the threshold to compare the number of crossings with the number and extent of connected excursions. The sample path remains fixed so the threshold is the only changing quantity." >}}

### The Kac-Rice formula {#kac-rice-formula}

Kac and Rice gave a way to count level crossings of a smooth function, and then of a stochastic process, without locating each root directly {{< cite "rice1944" "kac1959" >}}.

{{< statement kind="theorem" id="kac-rice" title="Kac-Rice counting formula" >}}
Let $f:[a,b]\to\RR$ be continuously differentiable and have no tangential crossings of the level $T$. Define

$$
\eta_\varepsilon(g)=\frac{1}{2\varepsilon}
\mathbf 1\{\abs{g}<\varepsilon\}.
$$

The number of level crossings is

{{< equation id="kac-rice-window" wide="true" >}}
N_f(T)=\lim_{\varepsilon\to0}
\int_a^b \eta_\varepsilon(f(x)-T)\abs{f'(x)}\,\dd x.
{{< /equation >}}

In the distributional limit,

{{< equation id="kac-rice-delta" >}}
N_f(T)=\int_a^b\delta(f(x)-T)\abs{f'(x)}\,\dd x.
{{< /equation >}}
{{< /statement >}}

{{< proof >}}
For sufficiently small $\varepsilon$, the set $\{x:\abs{f(x)-T}<\varepsilon\}$ separates into intervals around the crossings. Take one such interval $[c,d]$. Since a crossing is not tangential, $f'$ keeps its sign there, and

$$
\begin{aligned}
\frac{1}{2\varepsilon}\int_c^d\abs{f'(x)}\,\dd x
&=\frac{1}{2\varepsilon}\abs{\int_c^d f'(x)\,\dd x}\\
&=\frac{\abs{f(d)-f(c)}}{2\varepsilon}=1.
\end{aligned}
$$

Summing these unit contributions over the disjoint intervals gives the crossing count. The delta form is the $\varepsilon\to0$ limit.
{{< /proof >}}

{{< scientific-plate kind="kac-rice" id="kac-rice-counting-window" title="The counting window" caption="Each threshold crossing contributes one unit. As the vertical window narrows, its height rises so that the weighted area remains fixed. The derivative factor converts a vertical band into a count along position." >}}

#### Expected crossing count {#expected-crossing-count}

We now apply the formula to a stationary, mean-zero, differentiable Gaussian process. At a fixed location, $f(x)$ and $f'(x)$ are jointly Gaussian. Stationarity gives

$$
\EE[f(x)f'(x)]
=\frac12\frac{\dd}{\dd x}\EE[f(x)^2]=0,
$$

and

$$
\EE[f'(x)^2]
=\left.\frac{\partial^2}{\partial x\,\partial y}r(y-x)\right|_{y=x}
=-r''(0).
$$

Thus

$$
\begin{pmatrix}f(x)\\f'(x)\end{pmatrix}
\sim\mathcal N\!\left(
\begin{pmatrix}0\\0\end{pmatrix},
\begin{pmatrix}r_0&0\\0&-r''_0\end{pmatrix}
\right).
$$

The zero covariance makes $f(x)$ and $f'(x)$ independent. Taking the expectation of {{< eqref "kac-rice-delta" >}} at level $T=\theta\sqrt{r_0}$ gives

$$
\begin{aligned}
\EE[N_f(\theta\sqrt{r_0})]
&=L\,p_f(\theta\sqrt{r_0})\,\EE[\abs{f'(x)}]\\
&=\frac{L}{\sqrt{2\pi r_0}}e^{-\theta^2/2}
\sqrt{-\frac{2r''_0}{\pi}}\\
&=\frac{L}{\pi}\sqrt{-\frac{r''_0}{r_0}}e^{-\theta^2/2}.
\end{aligned}
$$

Every bounded excursion has one upcrossing and one downcrossing. Its expected density is therefore half the crossing density,

{{< equation id="excursion-density" >}}
\mu(\theta\sqrt{r_0})
=\frac{1}{2\pi}\sqrt{-\frac{r''_0}{r_0}}
\exp\!\left(-\frac{\theta^2}{2}\right).
{{< /equation >}}

Let $\Phi$ be the standard normal cumulative distribution function. The expected fraction of the domain above the threshold is $1-\Phi(\theta)$. Dividing the total occupied and unoccupied lengths by the expected number of excursions gives the approximate mean excursion length $s$ and mean gap $\bar s$,

{{< equation id="mean-excursion-size" wide="true" >}}
\begin{aligned}
s
&=2\pi\,[1-\Phi(\theta)]e^{\theta^2/2}
  \sqrt{-\frac{r_0}{r''_0}},\\
\bar s
&=2\pi\,\Phi(\theta)e^{\theta^2/2}
  \sqrt{-\frac{r_0}{r''_0}}.
\end{aligned}
{{< /equation >}}

At high thresholds, the gaps are much longer than the excursions. Consecutive events are then separated by several correlation lengths, and the crossing process approaches a Poisson process with the mean above.

### Spectral density {#spectral-density}

{{< statement kind="theorem" id="bochner" title="Bochner's theorem" >}}
A continuous function $r(\Delta x)$ is non-negative definite, and hence a valid stationary covariance, if and only if it has a spectral representation

{{< equation id="bochner-representation" >}}
r(\Delta x)=\int_{-\infty}^{\infty}
e^{i\omega\Delta x}\,\dd\rho(\omega),
{{< /equation >}}

for a non-decreasing, right-continuous, bounded spectral measure $\rho$. If the $k$th derivative of the process exists, then

$$
r_{f^{(k)}}(\Delta x)
=(-1)^k r_f^{(2k)}(\Delta x)
=\int_{-\infty}^{\infty}\omega^{2k}e^{i\omega\Delta x}\,\dd\rho(\omega).
$$

When the spectrum has a density, differentiation multiplies it by $\omega^{2k}$.
{{< /statement >}}

Define the even spectral moments

$$
\omega_{2k}=\int_{-\infty}^{\infty}\omega^{2k}\,\dd\rho(\omega).
$$

Then $\omega_0=r_0$ and $\omega_2=-r''_0$. The excursion density becomes

{{< equation id="spectral-crossing-rate" wide="true" >}}
\mu(\theta\sqrt{r_0})
=\frac{1}{2\pi}e^{-\theta^2/2}
\sqrt{\frac{\omega_2}{\omega_0}}.
{{< /equation >}}

At the mean level, $\mu(0)=(2\pi)^{-1}\sqrt{\omega_2/\omega_0}$. It has units of inverse length and supplies a geometric correlation scale.

Repeating the argument for the derivative process gives equal densities of local maxima and minima,

{{< equation id="turning-point-density" >}}
\mu_+=\mu_-=
\frac{1}{2\pi}\sqrt{\frac{\omega_4}{\omega_2}}.
{{< /equation >}}

The ratio between turning points and mean-level crossings defines the scale-invariant irregularity parameter

{{< equation id="spectral-irregularity" >}}
\frac{1}{\alpha}
=\sqrt{\frac{\omega_0\omega_4}{\omega_2^2}},
\qquad 0<\alpha\leq1.
{{< /equation >}}

Values near one indicate a regular process with roughly one maximum and one minimum between mean-level upcrossings. Small values indicate additional high-frequency structure.

For the continuous example below, write $S(\omega)=\dd\rho/\dd\omega$. Dividing each weighted spectrum by its own moment gives three contribution densities with unit area. Their shapes can therefore be compared on one honest vertical scale even though the unnormalized moments have different units.

{{< scientific-plate kind="spectrum" id="spectral-moments" title="One spectrum, three geometric readings" caption="The same continuous spectrum is reweighted by frequency. Total area gives field variance, quadratic weighting controls mean-level crossings, and quartic weighting controls extrema. Shared axes and unit-area normalization make the change in shape directly comparable." >}}

### Excursion shape {#excursion-shape}

Counting fields is only the first step. To describe a typical field, we condition on the event that the process crosses the threshold from below {{< cite "kac1959" >}}.{{< sidenote >}}Palm conditioning selects the observation location from the crossings of the process. A location sampled uniformly in space follows a different distribution.{{< /sidenote >}}

#### Slope at an upcrossing {#slope-at-an-upcrossing}

{{< statement kind="theorem" id="upcrossing-slope" title="Upcrossing slope" >}}
At an upcrossing of any level $\theta\sqrt{r_0}$, the positive derivative $v=f'(x)$ has Rayleigh density

{{< equation id="upcrossing-rayleigh" >}}
p_{\uparrow}(v)=
\frac{v}{\omega_2}\exp\!\left(-\frac{v^2}{2\omega_2}\right),
\qquad v\geq0,
{{< /equation >}}

and this distribution is independent of the threshold.
{{< /statement >}}

{{< proof >}}
Restrict the Kac-Rice count to upcrossings whose slope lies between $0$ and $v$. Since $f(x)$ and $f'(x)$ are independent, the factor involving the threshold cancels between the restricted and unrestricted counts:

$$
\begin{aligned}
\PP(f'<v\mid\text{upcrossing})
&=\frac{\int_0^v s\exp[-s^2/(2\omega_2)]\,\dd s}
        {\int_0^\infty s\exp[-s^2/(2\omega_2)]\,\dd s}\\
&=\int_0^v\frac{s}{\omega_2}
  \exp\!\left(-\frac{s^2}{2\omega_2}\right)\dd s.
\end{aligned}
$$

Differentiating gives {{< eqref "upcrossing-rayleigh" >}}.
{{< /proof >}}

Although $f'$ is Gaussian at a uniformly chosen point, it is not Gaussian at an upcrossing. Steep slopes create more crossings per unit length and are sampled more often. The derivative factor in the Kac-Rice formula expresses exactly this selection bias.{{< sidenote >}}From this point onward, $\theta$ denotes the threshold itself. Replace it with $\theta\sqrt{r_0}$ to restore the variance scale.{{< /sidenote >}}

#### The Slepian process {#the-slepian-process}

{{< statement kind="definition" id="slepian-model" title="Slepian model" >}}
Let $f$ be stationary and have finitely many upcrossings in every bounded interval. A Slepian process $\{\xi_\theta(x)\}$ describes $f$ as seen from a typical upcrossing of level $\theta$. For a finite vector of locations,

{{< equation id="slepian-conditioning" wide="true" >}}
\PP(\xi_\theta(\mathbf x)\leq\mathbf v)
=\int_0^\infty p_{\uparrow}(z)
\PP\!\left(f(\mathbf x)\leq\mathbf v
\mid f(0)=\theta, f'(0)=z\right)\dd z.
{{< /equation >}}
{{< /statement >}}

For a Gaussian process, the conditional law inside this integral is Gaussian. Its mean and covariance therefore determine it completely. Take

$$
\boldsymbol\xi=(f(y),f(x)),
\qquad
\boldsymbol\eta=(f(0),f'(0)).
$$

Bochner's representation gives the remaining cross-covariance,

$$
\EE[f'(x)f(y)]=-r'(y-x).
$$

The joint covariance is therefore

{{< equation id="slepian-joint-law" wide="true" >}}
\boldsymbol\Sigma=
\begin{pmatrix}
r(0)&r(y-x)&r(y)&-r'(y)\\
r(x-y)&r(0)&r(x)&-r'(x)\\
r(y)&r(x)&r(0)&0\\
-r'(y)&-r'(x)&0&-r''(0)
\end{pmatrix}.
{{< /equation >}}

With $\omega_0=r_0$ and $\omega_2=-r''(0)$, Gaussian conditioning gives

$$
\EE[f(x)\mid f(0)=\theta,f'(0)=z]
=\frac{\theta r(x)}{\omega_0}
-\frac{z r'(x)}{\omega_2},
$$

and residual covariance

{{< equation id="conditional-excursion-covariance" wide="true" >}}
r_\kappa(x,y)
=r(y-x)-\frac{r(x)r(y)}{\omega_0}
-\frac{r'(x)r'(y)}{\omega_2}.
{{< /equation >}}

The last two terms are the reduction in uncertainty caused by fixing the height and slope at the crossing. They vanish far from the origin when the covariance and its derivative decay.

{{< statement kind="theorem" id="slepian-decomposition" title="Gaussian excursion decomposition" >}}
After a typical upcrossing, a stationary Gaussian process has the representation

{{< equation id="slepian-process" >}}
\xi_\theta(x)
=\frac{\theta r(x)}{\omega_0}
-\frac{\zeta r'(x)}{\omega_2}
+\kappa(x),
{{< /equation >}}

where $\zeta$ has the Rayleigh density in {{< eqref "upcrossing-rayleigh" >}}, and $\kappa$ is an independent, mean-zero, nonstationary Gaussian process with covariance {{< eqref "conditional-excursion-covariance" >}}.
{{< /statement >}}

{{< scientific-plate kind="excursion" id="conditioned-excursion" title="A field seen from its upcrossing" caption="Conditioning fixes the threshold and positive slope at the origin. The deterministic conditional mean carries those constraints; the residual uncertainty is suppressed nearby and returns with distance. At high threshold, the local excursion approaches a parabola." >}}

#### High excursions {#high-excursions}

At high threshold, the length and excess height of an excursion are both of order $\theta^{-1}$. Expand the covariance around the crossing:

$$
r(x/\theta)
=\omega_0-\frac{\omega_2x^2}{2\theta^2}[1+o(1)],
\qquad
r'(x/\theta)
=-\frac{\omega_2x}{\theta}[1+o(1)].
$$

The conditioned residual satisfies $\kappa(x/\theta)=o(x/\theta)$. Substituting these terms into the Slepian process yields

{{< equation id="high-excursion-parabola" wide="true" >}}
\begin{aligned}
\theta\{\xi_\theta(x/\theta)-\theta\}
&\approx \zeta x-\frac{\omega_2x^2}{2\omega_0}\\
&=-\frac{\omega_2}{2\omega_0}
\left(x-\frac{\zeta\omega_0}{\omega_2}\right)^2
+\frac{\zeta^2\omega_0}{2\omega_2}.
\end{aligned}
{{< /equation >}}

The excursion is locally parabolic. Its excess height is approximately $\zeta^2\omega_0/(2\theta\omega_2)$ and its length is approximately $2\omega_0\zeta/(\theta\omega_2)$. The length inherits the Rayleigh law of the crossing slope, while the height inherits its square.

In an isotropic $D$-dimensional process, make the simplifying approximation that the $D$ principal lengths share this Rayleigh scaling. If a normalized linear size $S$ has density

$$
p_S(s)=\frac{s}{\omega_2}\exp\!\left(-\frac{s^2}{2\omega_2}\right),
$$

and volume is $V=S^D$, then the change of variables $s=v^{1/D}$ gives

{{< equation id="excursion-volume-density" >}}
p_V(v)=\frac{v^{2/D-1}}{D\omega_2}
\exp\!\left(-\frac{v^{2/D}}{2\omega_2}\right).
{{< /equation >}}

For $D=2$, this normalized volume, and likewise the squared Rayleigh height variable, is exponentially distributed.

## Coding properties {#coding-properties}

So far the Gaussian process has described the structure of a neural code. We now ask how well a population of these fields can encode position. The calculation follows a simplified random-code model without thresholding {{< cite "malerba2022" >}}.

Let $N$ neurons independently sample a stationary Gaussian process over a one-dimensional environment of length $L$,

$$
\mathbf f(x)=(f_1(x),\ldots,f_N(x)).
$$

Suppose the response at the true position $x=0$ is corrupted by independent Gaussian noise $z_i\sim\mathcal N(0,\eta^2)$. Under that noise model, maximum-likelihood decoding minimizes squared distance:

{{< equation id="maximum-likelihood-position" wide="true" >}}
\widehat x
=\argmin_x\sum_{i=1}^{N}
\left[f_i(x)-f_i(0)-z_i\right]^2.
{{< /equation >}}

We measure performance by mean squared position error,

{{< equation id="squared-position-loss" >}}
\mathcal L=\EE[(\widehat x-x)^2].
{{< /equation >}}

Two mechanisms contribute. A local error moves the single posterior peak away from the true position. A global error makes a distant, weakly correlated codeword appear closer than the true one. Their dependence on field roughness points in opposite directions.

### Local error {#local-error}

Suppose the error $\Delta x=\widehat x$ is small. Linearizing each field around zero gives

$$
\begin{aligned}
\widehat x
&=\argmin_{\Delta x}\sum_{i=1}^{N}
\left[f_i'(0)\Delta x-z_i\right]^2,\\
\Delta x
&=\frac{\sum_i f_i'(0)z_i}{\sum_i f_i'(0)^2}.
\end{aligned}
$$

Conditioned on the field derivatives, averaging over the readout noise gives

$$
\EE_z[(\Delta x)^2]
=\frac{\eta^2}{\sum_i f_i'(0)^2}
=\frac{\eta^2}{\omega_2
\sum_i f_i'(0)^2/\omega_2}.
$$

The normalized sum is $\chi_N^2$. Since $\EE[(\chi_N^2)^{-1}]=1/(N-2)$ for $N>2$,

{{< equation id="local-error" >}}
\EE[\mathcal L_{\mathrm{local}}]
=\frac{\eta^2}{\omega_2(N-2)}.
{{< /equation >}}

Rougher fields have larger $\omega_2$ and steeper local gradients, so they reduce this error.

### Global error {#global-error}

Now assume global errors are rare and occur at positions separated by more than one correlation length. Their count is then approximately Poisson. If $\lambda$ is the rate per independent segment,

$$
\PP(\text{at least one global error})
=1-e^{-\lambda L}\approx\lambda L.
$$

At a distant position $x$, define the vector difference

$$
\widetilde{\mathbf f}=\mathbf f(x)-\mathbf f(0).
$$

A global error occurs when the distant noisy code is closer to the observation than the true code.{{< sidenote >}}The noise is symmetric, so changing the sign of the cross term leaves the error probability unchanged.{{< /sidenote >}}

$$
\norm{\widetilde{\mathbf f}+\mathbf z}^2<\norm{\mathbf z}^2,
$$

or equivalently when

{{< equation id="global-error-event" >}}
\mathcal I
=\norm{\widetilde{\mathbf f}}^2
+2\widetilde{\mathbf f}^{\mathsf T}\mathbf z<0.
{{< /equation >}}

Conditioned on $\widetilde{\mathbf f}$,

$$
\mathcal I\sim\mathcal N\!\left(
\norm{\widetilde{\mathbf f}}^2,
4\eta^2\norm{\widetilde{\mathbf f}}^2
\right).
$$

Dividing by the positive norm gives a Gaussian variable with mean $\norm{\widetilde{\mathbf f}}$ and variance $4\eta^2$. The conditional error probability can be written as

$$
\PP(\mathcal I<0\mid\widetilde{\mathbf f})
=\int_{-\infty}^{0}
\frac{1}{\sqrt{8\pi\eta^2}}
\exp\!\left[-\frac{(q-\norm{\widetilde{\mathbf f}})^2}{8\eta^2}\right]\dd q.
$$

For points beyond the correlation length, each component of $\widetilde{\mathbf f}$ has variance approximately $2r_0$. Averaging the exponential over the resulting norm distribution, using the noncentral $\chi^2$ moment-generating function, gives the approximation used in the talk,

$$
\begin{aligned}
&\EE_{\mathbf f}\!\left[
\exp\!\left(-\frac{r_0}{4\eta^2}
\left[q-\frac{\norm{\widetilde{\mathbf f}}}{\sqrt{2r_0}}\right]^2\right)
\right]\\
&\qquad=
\exp\!\left[-\frac{q^2}{2(1+2\eta^2/r_0)}\right]
\left(1+\frac{r_0}{2\eta^2}\right)^{-N/2}.
\end{aligned}
$$

Completing the remaining half-Gaussian integral yields

{{< equation id="global-error-probability" wide="true" >}}
\PP(\mathcal I<0)
=\frac12\left(1+\frac{r_0}{2\eta^2}\right)^{-(N-1)/2}.
{{< /equation >}}

To turn this single-comparison probability into an error rate, the note uses the simplifying estimate that an environment of length $L$ contains $L\omega_2$ effectively independent comparisons. This is a rough correlation-length approximation rather than an exact identity. It gives

$$
\PP(\text{global error})
\approx\frac{L\omega_2}{2}
\left(1+\frac{r_0}{2\eta^2}\right)^{-(N-1)/2}.
$$

Finally, approximate the signed displacement by a uniform variable on an interval of length $L$ centered at zero. Its second moment is $L^2/12$, so

{{< equation id="global-error-loss" wide="true" >}}
\EE[\mathcal L_{\mathrm{global}}]
=\frac{L^3\omega_2}{24}
\left(1+\frac{r_0}{2\eta^2}\right)^{-(N-1)/2}.
{{< /equation >}}

Adding the local and global contributions gives

{{< equation id="total-error" wide="true" >}}
\EE[\mathcal L]
=\frac{\eta^2}{\omega_2(N-2)}
+\frac{L^3\omega_2}{24}
\left(1+\frac{r_0}{2\eta^2}\right)^{-(N-1)/2}.
{{< /equation >}}

{{< scientific-plate kind="error" id="coding-error-balance" title="The roughness tradeoff" caption="Local error falls as field roughness increases, while the independent-segment approximation makes global error rise. Their sum has an interior minimum. Curves use the fixed constants stated alongside the plate on logarithmic axes; the comparison at right keeps three reference population sizes fixed." >}}

The two terms assign opposite roles to $\omega_2$. More roughness improves local resolution but creates more independent opportunities for a distant confusion. Increasing $N$, by contrast, suppresses the global term exponentially {{< cite "malerba2022" >}}. The balance gives an optimal roughness within this simplified model.

## References {#references}

{{< references >}}
