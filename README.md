# Digital Twin History

**An open, cited history of digital twins and Physical AI, from andon lights and Apollo's simulators to live factory twins and AI world models.**

🌐 **Website:** https://pikulsomesh.github.io/digital-twin-history/

This repository is two things at once:

1. **A structured, reusable dataset** of the milestones, eras, definitions and domains that make up the history of digital twins. Every milestone links to at least one public source.
2. **An interactive website** built from that dataset, for a general audience as well as industry practitioners and executives.

Everything is MIT licensed, so you can reuse the content in courses, talks, reports or your own tools.

## What's on the site

| Page | What it shows |
|---|---|
| **Home** | A 3D *growth spiral*: every milestone placed by year, with the spiral widening as more domains adopt the idea |
| **Factory through time** | A walkable 3D production line shown in six eras: andon lights, the control room, the connected plant, sensors and dashboards, the live digital twin, and Physical AI. Click any machine to see what people could know about it in that era. |
| **Timeline** | Every milestone, filterable by era, domain and kind of change, with numbered source links |
| **What is a twin?** | Definitions from 2002 to 2023 side by side, model vs. shadow vs. twin, and the maturity ladder |
| **Industries** | Deep dives for manufacturing, aerospace, energy, buildings and cities, health, supply chains, Earth and climate, people and organizations, robotics and Physical AI, and the foundations |
| **Growth** | How the idea spread: breadth across domains, kinds of progress by era, a domain × era heatmap, and yearly research publication counts from [OpenAlex](https://openalex.org) |
| **Frontier** | Physical AI, hybrid physics–AI, world models, agentic twins, trust and interoperability, and the open questions |
| **Sources** | Every cited source and the method behind the history |

## The seven eras

| Era | Years | In one line |
|---|---|---|
| Mirrors before the name | 1880–1970 | Time clocks, andon lights, simulators, the Kalman filter, Apollo 13 |
| The digital model | 1971–1989 | CAD, finite elements, PLCs, SCADA, computer-integrated manufacturing, early BIM |
| Connected models | 1990–2001 | *Mirror Worlds*, MES, OPC, ISA-95, virtual cities, the Visible Human |
| The idea gets a name | 2002–2013 | Grieves' PLM model (2002), NASA's "digital twin" (2010), Industrie 4.0, the 2012 definition |
| Industrial scale-up | 2014–2019 | Fleet twins, city twins, organ twins, sim-to-real robotics |
| Definitions and standards | 2020–2023 | ISO 23247, ISO/IEC 30173, the National Academies report, Destination Earth |
| AI-native twins and Physical AI | 2024–now | Operational ML forecasting, reality capture, twins as training grounds, world models, agents |

## Repository layout

```
content/
  timeline.json        # milestones: year, title, era, domains, kind, summary, detail, sources
  eras.json            # the seven eras
  domains.json         # the ten domains
  factory-eras.json    # narrative for the 3D factory, linked to milestones
  domains/*.md         # one deep dive per domain
  pages/*.md           # definitions and frontier
src/                   # the website (Vite + three.js, no framework)
  three/factory.js     # the 3D factory through time
  three/spiral.js      # the 3D growth spiral
  views/               # one file per page
scripts/
  validate-content.mjs           # checks every milestone is well-formed and cited
  fetch-publication-counts.mjs   # pulls yearly counts from OpenAlex at build time
```

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # validates content, then builds to dist/
```

## Hosting

- **GitHub Pages (default).** Every push to `main` builds the site and deploys `dist/` to Pages (see `.github/workflows/static.yml`; Pages source is set to *GitHub Actions*). A weekly run refreshes the publication counts.
- **Vercel.** Import the repository on vercel.com. The defaults work as they are (framework *Vite*, build `npm run build`, output `dist`). No configuration file is needed.

## Contributing

Corrections and new milestones are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: edit `content/timeline.json`, cite a public source, and run `npm run validate`.

## Principles

- **Traceable:** every claim links to a public source.
- **Vendor-neutral:** the history is told through ideas, practices, standards and public programs. Organizations are named only where history requires it, never as recommendations.
- **Honest about data:** charts based on the curated milestones say so, and the simulated machine values in the 3D factory are labelled as illustrative.

## License

[MIT](LICENSE). Source data from OpenAlex is CC0. Cited works remain under their own licenses and are linked, not copied.
