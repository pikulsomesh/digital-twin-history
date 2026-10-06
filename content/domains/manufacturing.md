## The short version

Manufacturing is where the *idea* of the digital twin was named (in product lifecycle management) and where it has the longest unbroken lineage. It runs from andon lights and time clocks, through PLCs, SCADA and manufacturing execution systems, to physically accurate, live 3D replicas of whole facilities.

## Then

- **Making the line visible (1920s–1960s).** Self-stopping looms and andon lights ([jidoka](https://en.wikipedia.org/wiki/Autonomation), [andon](https://en.wikipedia.org/wiki/Andon_(manufacturing))) let machines signal problems and let supervisors read the whole line at a glance. Time clocks recorded who was on the floor.
- **Machines become data (1950s–1980s).** [Numerical control](https://en.wikipedia.org/wiki/Numerical_control) turned part geometry into numbers. [PLCs](https://en.wikipedia.org/wiki/Programmable_logic_controller) turned machine logic and states into software. [Computer-integrated manufacturing](https://en.wikipedia.org/wiki/Computer-integrated_manufacturing) imagined the factory as one information system.
- **The connected plant (1990s–2000s).** [MES](https://en.wikipedia.org/wiki/Manufacturing_execution_system), [OPC](https://en.wikipedia.org/wiki/Open_Platform_Communications) and [ISA-95](https://en.wikipedia.org/wiki/ANSI/ISA-95) connected the floor to the enterprise. In 2002 Michael Grieves described the real space, virtual space and data link that became the digital twin ([Grieves & Vickers](https://doi.org/10.1007/978-3-319-38756-7_4)).
- **Industrie 4.0 (2011–2019).** [Industrie 4.0](https://en.wikipedia.org/wiki/Fourth_Industrial_Revolution) made cyber-physical production a policy goal, and the [Asset Administration Shell](https://industrialdigitaltwin.org/en/) gave each asset a standardized twin.

## Now

- **Product twins:** a design model linked to test, production and field data across the digital thread.
- **Process and line twins:** simulation of throughput, bottlenecks and changeovers; *virtual commissioning* of automation before it is installed.
- **Asset twins:** condition monitoring and predictive maintenance for critical machines.
- **Facility twins:** physically accurate 3D replicas of entire plants, synchronized with live data, that people can walk through remotely to inspect any machine, and use to plan new layouts or lines before building them.
- **Standards:** [ISO 23247](https://www.iso.org/standard/75066.html) defines a twin framework for "observable manufacturing elements": personnel, equipment, material, processes, facilities, environment and products.

## A typical twin

A packaging line twin might combine the 3D layout, the PLC tags and MES records for each station, a discrete-event model of flow, and machine-learned models of failure. It answers: *where is the bottleneck now, what if we add a shift, and which machine will fail first?*

## What's next

Twins as the training ground for robots and AI agents on the line, faster creation from scans, and plant-to-supplier twins that share data safely. See [the frontier](#/frontier).
