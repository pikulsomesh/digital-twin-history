# What is a digital twin?

A **digital twin** is a virtual representation of a specific physical thing, process or system that is kept in sync with it by data, and that is used to understand, predict and improve it.

Three properties separate a twin from an ordinary model or 3D drawing:

1. **It is about one specific, real thing.** It represents *this* turbine, *this* factory or *this* patient, not a generic design.
2. **It stays in sync.** Data from the physical side updates the virtual side, continuously or at a rate fit for the purpose.
3. **It informs action.** Insight flows back to the physical side as a decision, a setting, a maintenance order or an instruction to a machine.

## Model, shadow, twin

A widely cited review (Kritzinger et al., 2018, [doi:10.1016/j.ifacol.2018.08.474](https://doi.org/10.1016/j.ifacol.2018.08.474)) offers a simple test based on how data flows:

| | Physical → virtual | Virtual → physical | Example |
|---|---|---|---|
| **Digital model** | Manual | Manual | A CAD model or a simulation someone runs by hand |
| **Digital shadow** | Automatic | Manual | A live dashboard of a machine's sensors |
| **Digital twin** | Automatic | Automatic (or decision-driving) | A model that tracks the machine and changes its settings or schedule |

Many products marketed as "digital twins" are, by this test, digital shadows. That's not a criticism: a good shadow is valuable. The distinction just helps people know what they are getting.

## A maturity ladder

Twins are often described as climbing a ladder of capability:

1. **Descriptive:** what is happening (visualization, live status)
2. **Diagnostic:** why it happened (root cause, history)
3. **Predictive:** what will happen (remaining life, forecasts)
4. **Prescriptive:** what should we do (optimization, what-if)
5. **Autonomous:** the twin acts within limits that people set (closed-loop control, AI agents)

## How the definition evolved

| Year | Source | Definition |
|---|---|---|
| 2002 | Michael Grieves, *Conceptual Ideal for PLM* | A real space, a virtual space, and the flow of data from real to virtual and information from virtual to real, across the product lifecycle. ([Grieves & Vickers, 2017](https://doi.org/10.1007/978-3-319-38756-7_4)) |
| 2012 | NASA / US Air Force | "An integrated multiphysics, multiscale, probabilistic simulation of an as-built vehicle or system that uses the best available physics models, sensor updates, fleet history, etc., to mirror the life of its corresponding flying twin." ([Glaessgen & Stargel, 2012](https://doi.org/10.2514/6.2012-1818)) |
| 2020 | AIAA & AIA position paper | A set of virtual information constructs that mimics the structure, context and behavior of an individual or unique physical asset, or a group of physical assets, is dynamically updated with data from its physical twin throughout its life cycle, and informs decisions that realize value. ([PDF](https://www.aia-aerospace.org/wp-content/uploads/Digital-Twin-Institute-Position-Paper-December-2020-1.pdf)) |
| 2020 | Digital Twin Consortium | "An integrated data-driven virtual representation of real-world entities and processes, with synchronized interaction at a specified frequency and fidelity." ([source](https://www.digitaltwinconsortium.org/initiatives/the-definition-of-a-digital-twin/)) |
| 2021 | ISO 23247 (manufacturing) | A fit-for-purpose digital representation of an observable manufacturing element (personnel, equipment, material, process, facility, environment, product) with synchronization between the element and its digital representation. ([ISO 23247-1](https://www.iso.org/standard/75066.html)) |
| 2023 | ISO/IEC 30173 | A digital representation of a target entity with data connections that enable convergence between the physical and digital states at an appropriate rate of synchronization. ([ISO/IEC 30173](https://www.iso.org/standard/81442.html)) |
| 2023 | US National Academies | "A set of virtual information constructs that mimics the structure, context, and behavior of a natural, engineered, or social system (or system-of-systems), is dynamically updated with data from its physical twin, has a predictive capability, and informs decisions that realize value. The bidirectional interaction between the virtual and the physical is central to the digital twin." ([report](https://nap.nationalacademies.org/read/26894/chapter/4)) |

**What changed over time:** the subject widened from *a vehicle* to *any natural, engineered or social system*. The emphasis moved from *high-fidelity physics* to *fit-for-purpose fidelity*. And later definitions insist on **prediction**, **decisions that realize value**, and **trust** (verification, validation and uncertainty quantification).

## Related terms

- **Digital thread:** the connected record that links a product's data across its lifecycle, from requirements and design to manufacturing, service and retirement. A twin draws on the thread.
- **Cyber-physical system:** a physical system tightly integrated with computation and networking. Many twins sit inside one.
- **Simulation:** a model run to explore behavior. A twin usually contains simulations, but a simulation alone isn't a twin until it's tied to a specific real thing by data.
- **Metaverse / industrial metaverse:** shared, immersive 3D environments. These are sometimes the *interface* to twins, but they're not the same thing.
- **World model (AI):** a learned model that predicts how an environment evolves. Increasingly a *component* of twins, and the basis of Physical AI.
