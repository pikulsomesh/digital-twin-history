## The short version

For robotics and autonomous systems, the twin is not just a mirror. It is the **training ground**. "Physical AI", meaning AI that perceives and acts in the physical world, is learned to a large extent in simulated twins of factories, warehouses, homes and streets.

## Then

- **Simulators for training (1929 onward).** From the [Link Trainer](https://en.wikipedia.org/wiki/Link_Trainer) for pilots to simulators for robots, practicing on a stand-in has always been safer and cheaper.
- **Sim-to-real (2017).** Randomizing a simulation's visuals and physics let models trained only in simulation work on real robots ([Tobin et al.](https://arxiv.org/abs/1703.06907)).

## Now

- **Large shared datasets** of real robot experience ([Open X-Embodiment, 2023](https://arxiv.org/abs/2310.08864)), combined with vast amounts of simulated experience.
- **Real-to-sim-to-real:** scanning a real space ([Gaussian splatting](https://arxiv.org/abs/2308.04079)), turning it into a simulation, training there and deploying back to reality ([4D Digital Twins workshop, 2026](https://research.nvidia.com/labs/amri/projects/4DDT/2026/)).
- **Testing autonomy** on millions of simulated scenarios before road or factory trials.

## What's next

Generative world models that can imagine realistic variations of a scene, robot foundation models that learn across many machines, and twins that close the loop by tracking where real behavior diverges from simulated behavior ([Digital Twin AI survey](https://arxiv.org/abs/2601.01321)).
