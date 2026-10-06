# The frontier: what's next

Photorealistic, physically accurate 3D replicas of entire facilities, synchronized with live data, are today's state of the art in practice. Researchers, standards bodies and long-time practitioners broadly agree that **the frontier is no longer the 3D view**. It is the intelligence, trust and connectedness behind it. The themes below summarize public reports and recent survey papers (linked at the bottom). They describe where the field is heading, not what any single product does.

## 1. From mirror to classroom: Physical AI

Twins have become the place where machines learn. Robots, autonomous vehicles and warehouse fleets are trained on large amounts of simulated experience and then transferred to the real world, an approach often called *real-to-sim-to-real*. Researchers deliberately randomize lighting, materials and physics so that reality looks like "just another variation" ([Tobin et al., 2017](https://arxiv.org/abs/1703.06907)). Pooling robot experience across institutions shows that broad data generalizes better ([Open X-Embodiment, 2023](https://arxiv.org/abs/2310.08864)).

**Why it matters:** the twin's value shifts from *monitoring* a machine to *creating the skills* that machine runs on.

## 2. Hybrid physics and AI

Machine-learned models now sit alongside physics solvers: as fast surrogates, as corrections to physics, or as full forecasting models. In 2025 a leading international weather center put a machine-learned forecast into operation alongside its physics-based system ([ECMWF](https://www.ecmwf.int/node/29308)). The open question is how to combine the speed of learning with the guarantees of physics.

## 3. Generative world models

Generative "world models" learn how scenes evolve and can imagine plausible futures. They can fill gaps where no physics model exists, and generate rare or dangerous scenarios for testing. Surveys flag the risk that a model can look convincing and still be physically wrong, so validation becomes even more important ([Digital Twin AI survey, 2026](https://arxiv.org/abs/2601.01321)).

## 4. Agentic twins

Language-capable AI agents are starting to act as the interface to twins. They answer "why did line 3 slow down?", run what-if studies, and propose changes for a human to approve. The step after that, agents that act within bounded authority, raises questions of accountability, safety and auditability.

## 5. Trust: verification, validation and uncertainty

The US National Academies argue that a twin is only as useful as the confidence you can place in its predictions. Verification, validation and uncertainty quantification (VVUQ) has to be built in from the start, along with ethics, privacy and security ([National Academies, 2023](https://nap.nationalacademies.org/read/26894/chapter/4)).

## 6. Systems of twins and interoperability

Real value often lies *between* twins: a machine twin inside a line twin inside a plant twin inside a supply-chain twin. That requires shared vocabularies and interfaces such as the [Asset Administration Shell](https://industrialdigitaltwin.org/en/), [ISO 23247](https://www.iso.org/standard/75066.html) and [ISO/IEC 30173](https://www.iso.org/standard/81442.html). Connecting twins across company boundaries, without giving away sensitive data, is largely unsolved.

## 7. Faster, cheaper reality capture

Neural and Gaussian-splatting reconstruction ([NeRF](https://arxiv.org/abs/2003.08934), [3D Gaussian Splatting](https://arxiv.org/abs/2308.04079)) turns phone video or drone footage into explorable 3D in hours. The research push is to make these captures *semantic* (knowing what each object is) and *simulation-ready* (with physical properties), so that a twin can be built in days, not months.

## 8. Twins of people and the planet

- **Human twins:** Europe's [Virtual Human Twins](https://digital-strategy.ec.europa.eu/en/news/virtual-human-twins-launch-european-virtual-human-twins-initiative) initiative aims at validated twins of organs and patients for diagnosis, treatment planning and in-silico trials. Privacy, consent and regulatory acceptance are central.
- **Earth twins:** [Destination Earth](https://destine.ecmwf.int/news/destination-earth-system-launched/) is building kilometer-scale twins of the climate and of weather extremes for policy and adaptation.

## Open questions the field is debating

- **How much fidelity is enough?** "Fit for purpose" is now the consensus, but deciding the purpose is the hard part.
- **Who owns the twin and its data** when the asset, operator, supplier and insurer all contribute?
- **Can a learned model be certified** for a safety-critical decision?
- **How do you keep a twin true** over a 30-year asset life, as the asset, its software and its sensors all change?
- **What should a twin be allowed to change** on its own?

## Further reading

- National Academies (2023), [*Foundational Research Gaps and Future Directions for Digital Twins*](https://nap.nationalacademies.org/read/26894/chapter/4)
- [*Digital Twin AI: Opportunities and Challenges from Large Language Models to World Models*](https://arxiv.org/abs/2601.01321) (2026)
- [*Artificial Intelligence for Modeling & Simulation in Digital Twins*](https://arxiv.org/abs/2602.19390) (2026)
- AIAA & AIA (2020), [*Digital Twin: Definition & Value*](https://www.aia-aerospace.org/wp-content/uploads/Digital-Twin-Institute-Position-Paper-December-2020-1.pdf)
