import { timeline, eras, KINDS, KIND_COLORS, domains } from '../data.js';
import { esc, webglOk } from '../util.js';
import { createSpiral, breadthByYear } from '../three/spiral.js';

export function renderHome(el) {
  const breadth = breadthByYear(timeline);
  const span = `${timeline[0].year}–${timeline[timeline.length - 1].year}`;
  el.innerHTML = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">An open history · ${span}</p>
        <h1>From lights on the shop floor to living digital twins</h1>
        <p class="lede">A digital twin is a virtual counterpart of a real thing that is kept in sync by data and used to decide what to do next. The idea is older than the name. This site traces it from factory andon lights and Apollo's simulators to today's live factory twins and the Physical AI that learns inside them, with a public source for every step.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="#/factory">Walk the factory through time</a>
          <a class="btn" href="#/timeline">Browse the timeline</a>
        </div>
        <dl class="stats">
          <div><dt>Milestones</dt><dd>${timeline.length}</dd></div>
          <div><dt>Eras</dt><dd>${eras.length}</dd></div>
          <div><dt>Domains</dt><dd>${breadth[breadth.length - 1].breadth}</dd></div>
          <div><dt>Cited sources</dt><dd>${new Set(timeline.flatMap((m) => m.sources.map((s) => s.url))).size}</dd></div>
        </dl>
      </div>
      <figure class="spiral-figure">
        <div class="stage stage--spiral" id="spiral" role="img" aria-label="3D spiral of digital twin milestones by year. The spiral widens as more domains adopt the idea."></div>
        <div class="spiral-tip" hidden></div>
        <figcaption>
          <b>The growth spiral.</b> Each sphere is a milestone. Height is time, and the spiral widens as more domains take up the idea. Drag to rotate, scroll to zoom, click a sphere to open it.
          <ul class="legend">${KINDS.map((k) => `<li><span class="swatch" style="--c:${KIND_COLORS.dark[k.id]}"></span>${k.name}</li>`).join('')}</ul>
        </figcaption>
      </figure>
    </div>
  </section>

  <section class="wrap section">
    <h2>Three ways in</h2>
    <div class="cards cards-3">
      <a class="card card-link" href="#/factory">
        <span class="card-kicker">3D · six eras</span>
        <h3>The factory through time</h3>
        <p>Walk the same production line as people saw it in each era: andon lights, the control room, the connected plant, sensors, the live twin and Physical AI. Click any machine to see what you could know about it then.</p>
      </a>
      <a class="card card-link" href="#/timeline">
        <span class="card-kicker">${timeline.length} milestones</span>
        <h3>The cited timeline</h3>
        <p>Every milestone with its date, its context, why it mattered and where to read more. You can filter by era, domain or kind of change.</p>
      </a>
      <a class="card card-link" href="#/industries">
        <span class="card-kicker">${domains.length} domains</span>
        <h3>Deep dives by industry</h3>
        <p>Manufacturing, aerospace, energy, buildings and cities, health, supply chains, Earth and climate, people and robotics, each from the first precursor to what's next.</p>
      </a>
    </div>
  </section>

  <section class="wrap section">
    <h2>The story in seven eras</h2>
    <ol class="era-list">
      ${eras.map((e, i) => `
        <li class="era-item">
          <a href="#/timeline?era=${e.id}">
            <span class="era-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="era-range">${e.range[0]}–${e.range[1] >= 2026 ? 'now' : e.range[1]}</span>
            <span class="era-name">${esc(e.name)}</span>
            <span class="era-tag">${esc(e.tagline)}</span>
          </a>
          <p>${esc(e.summary)}</p>
        </li>`).join('')}
    </ol>
  </section>

  <section class="wrap section split">
    <div>
      <h2>What makes something a twin?</h2>
      <p>It represents one specific real thing, it stays in sync with that thing through data, and it informs action. A 3D model alone is not a twin. A live dashboard is a <em>digital shadow</em>. When insight flows back to change the physical world, you have a twin.</p>
      <p><a href="#/what-is">Definitions and how they evolved →</a></p>
    </div>
    <div>
      <h2>Where is the frontier?</h2>
      <p>Photorealistic, live replicas of whole facilities are already practical. The frontier has moved to what sits behind them: twins that act as training grounds for robots, hybrid physics and AI models, generative world models, AI agents that operate twins, and trust in the results.</p>
      <p><a href="#/frontier">The frontier and open questions →</a></p>
    </div>
  </section>`;

  if (!webglOk) {
    el.querySelector('#spiral').innerHTML = '<p class="nogl">3D view needs WebGL. <a href="#/timeline">Use the timeline instead.</a></p>';
    return null;
  }
  const tip = el.querySelector('.spiral-tip');
  const fig = el.querySelector('.spiral-figure');
  const spiral = createSpiral(el.querySelector('#spiral'), {
    timeline,
    eras,
    kindColor: (k) => KIND_COLORS.dark[k],
    onPick: (m) => { location.hash = `#/milestone/${m.id}`; },
    onHover: (m, ev) => {
      if (!m) { tip.hidden = true; return; }
      const r = fig.getBoundingClientRect();
      tip.hidden = false;
      tip.innerHTML = `<b>${m.year}</b> · ${esc(m.title)}<br><span>${esc(m.summary)}</span>`;
      tip.style.left = `${Math.min(ev.clientX - r.left + 14, r.width - 260)}px`;
      tip.style.top = `${ev.clientY - r.top + 14}px`;
    },
  });
  return () => spiral.dispose();
}
