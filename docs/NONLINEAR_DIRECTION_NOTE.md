# Nonlinear direction-learning note

Status. Experimental on `experiment/gp-field-note`.

The article at `/blog/nonlinear-direction-learning/` develops the teaching note
in
`/Users/nisch/code/rep_physics/project/ARXIV_2502_03210_NONLINEAR_DIRECTION_LEARNING_TALK.org`.
The Markdown article is the deployment source. Do not export the Org file over
it.

## Sources and claim boundary

The note connects two related papers without merging their claims:

- Noa Rubin, Inbar Seroussi, and Zohar Ringel, *Grokking as a First Order Phase
  Transition in Two Layer Networks*, ICLR 2024;
- Noa Rubin and collaborators, *From Kernels to Features: A Multi-Scale
  Adaptive Theory of Feature Learning*, ICML 2025.

The first paper establishes the first-order phase picture and its mixed
hidden-weight states. The second develops the wider adaptive theory and makes
the directional sample-complexity comparison explicit. The article uses the
published PMLR author list for the 2025 reference. The arXiv revision has a
different author list, so future edits should not silently combine the two
records.

The article's central claim is narrower than either paper. It presents the
model as a clear solvable account of explicit feature learning. The hidden
weight posterior moves from one target-agnostic population to populations with
finite overlap with the teacher. The covariance records that representation
change as a rank one component. The reduction from a full hidden weight to one
overlap, followed by the self consistency loop, is the main subject.

The sample complexity gap is a corollary. The linear Hermite mode reveals one
teacher direction with order $D$ samples. The learned features then express the
cubic Hermite mode with order one strength, instead of the order $D^{-3}$
kernel power available to random features.

## Narrative spine

The reader first sees a measurable change in the hidden representation. The
derivation follows the posterior for one neuron, reduces its hidden weight to
the teacher overlap, reads the overlap potential, converts overlap into a rank
one covariance update, and closes the adaptive kernel loop. Only then does the
article derive the $D^3$ versus $D$ sample scales. The final sections separate
the papers, state the approximation boundary, and describe the wider agenda.

Six optional calculations preserve the compact algebra from the Org source:
the readout integral, the Gaussian Hermite identity, sample sum concentration,
norm concentration, the expansion at zero overlap, and the cubic sample scale.
Their results remain in the main text. Native disclosure folds contain only the
verification, so closing them does not remove a premise needed later.

The local curvature of the centered overlap state is a spinodal diagnostic. It
is not the first-order transition point. Equal-depth finite and centered wells
define the transition. Keep that distinction explicit in later revisions.

## Plate system

The note adds five plate kinds:

1. `direction` shows the shared teacher coordinate, its two Hermite modes, and
   the hidden-weight overlap;
2. `overlap` lets the reader vary the effective interaction through an
   analytic conditional slice of the posterior action and follows a
   sign-symmetric hidden population through GFL, GMFL-I, and GMFL-II;
3. `rank-one` compares isotropic and teacher-aligned weight covariance;
4. `sample-complexity` traces the fixed and adaptive scaling routes;
5. `self-consistency` closes the residual, posterior, kernel, and predictor
   loop.

The plates contain no simulation traces or fitted data. The overlap plate fixes
`sigma_w^2 = 0.5`, `b = 0.30`, and `c = -0.30`, then varies the effective
interaction `u` in the 2024 paper's normalized action. Its forty dots form
twenty sign-symmetric pairs. Their horizontal positions use the action's
centred and finite-overlap minima. A smooth lever-rule guide changes the
illustrative mixture fraction between the side-well birth and the centred
spinodal, and the plate calculates `R` from those dots. Vertical jitter only
separates the marks. The full theory solves `b` and `c` self-consistently, so
the population does not claim simulation counts or fitted mixture weights.

Every mathematical symbol is build-time MathML. The mobile sample-complexity
plate switches to two vertical routes so its two endpoints remain visible
without horizontal scrolling. Only the overlap plate loads the small local
interactive plate script. The static equal-depth curve and a mixed population
remain in the HTML when JavaScript is absent.

## Performance and review contract

The production budget in `scripts/check_budget.py` covers the article directly.
The page must remain below 180 kB of HTML and 400 kB for its compressed initial
HTML, CSS, JavaScript, and font assets. The large shared math font dominates the
second number; the new plate system adds no runtime library.

Before publishing a revision, run `./scripts/qa.sh`. Inspect the opening and all
five plates at 1440, 1180, 1024, and 390 pixels, in shade and sunset. Check the
six margin notes, the bibliography backlinks, the Writing entry, print output,
page-level horizontal overflow, and console errors. Move the overlap slider by
pointer and keyboard, and confirm that it reports the metastable, equal-depth,
dominant, and unstable regimes. Confirm that the article requests the local
`scientific-plates.js` file and no external runtime library.
