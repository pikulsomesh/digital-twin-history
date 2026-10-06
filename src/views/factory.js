import { factoryEras, byId } from '../data.js';
import { esc, webglOk } from '../util.js';
import { createFactory, STATIONS } from '../three/factory.js';

const LEGENDS = {
  'lights': '<span class="sw" style="--c:#37c871"></span>running <span class="sw" style="--c:#f2c230"></span>waiting <span class="sw" style="--c:#ef4444"></span>stopped · andon lights and the wall board',
  'control-room': 'PLC cabinets beside each machine report to the mimic panel on the back wall',
  'connected': '<span class="sw" style="--c:#60a5fa"></span>plant network to the server · terminals show MES work orders',
  'sensors': '<span class="sw sw--ring" style="--c:#38bdf8"></span>live sensor streams · cards show each machine\'s condition model',
  'live-twin': '<span class="sw sw--line" style="--c:#5ee7ff"></span>digital twin above the floor · <span class="sw sw--dot" style="--c:#5ee7ff"></span>sensor data up · <span class="sw sw--dot" style="--c:#fbbf24"></span>decisions down',
  'physical-ai': 'Floating cells are simulated training worlds with randomized parts, lighting and physics',
};
const STATE_WORD = { green: 'running', yellow: 'waiting', red: 'stopped' };

// What a person could actually learn about one machine in each era.
function readout(eraId, i, l) {
  const name = STATIONS[i].name;
  const color = `<span class="pill pill--${l.state}">${l.state === 'green' ? 'Green' : l.state === 'yellow' ? 'Yellow' : 'Red'}</span>`;
  switch (eraId) {
    case 'lights':
      return `<p>Andon light: ${color}. The ${name.toLowerCase()} station is ${STATE_WORD[l.state]}.</p>
        <p>${l.state === 'red' ? 'The line is stopped here. A team leader walks over to find out why.' : 'If the light turns red, someone walks over to look.'}</p>
        <p class="muted">You cannot see temperature, wear, output or why it stopped. Shift output is tallied on paper.</p>`;
    case 'control-room':
      return `<dl class="kv"><dt>PLC state</dt><dd>${l.state === 'red' ? 'FAULT · alarm 0x2F' : l.state === 'yellow' ? 'IDLE · waiting for part' : 'RUN'}</dd>
        <dt>Parts this shift</dt><dd>${l.count}</dd></dl>
        <p>The alarm lights up on the mimic panel in the control room, and maintenance is dispatched by phone.</p>
        <p class="muted">You know <em>that</em> it faulted and which alarm fired. You still don't know the machine's condition.</p>`;
    case 'connected':
      return `<dl class="kv"><dt>Work order</dt><dd>WO-${1040 + i}</dd><dt>Completed</dt><dd>${l.count} pcs</dd>
        <dt>First-pass yield</dt><dd>${(96 + (i % 3)).toFixed(1)}%</dd><dt>Operator</dt><dd>badge #${117 + i}</dd>
        <dt>Last downtime</dt><dd>12 min · jam</dd></dl>
        <p class="muted">Every unit is traceable after the fact. The 3D CAD model of the product exists, but it isn't connected to the running machine.</p>`;
    case 'sensors':
      return `<dl class="kv"><dt>Temperature</dt><dd>${l.temp.toFixed(1)} °C</dd><dt>Vibration</dt><dd>${l.vib.toFixed(2)} mm/s</dd>
        <dt>Health score</dt><dd>${l.health}/100</dd></dl>
        ${i === 2 ? '<p class="alert">The condition model predicts a bearing service is needed in about 5 days.</p>' : '<p>Condition is normal against this machine\'s learned baseline.</p>'}
        <p class="muted">You can see <em>how</em> it is behaving, live and from anywhere, and fix it before it fails.</p>`;
    case 'live-twin':
      return `<dl class="kv"><dt>Status</dt><dd>${color}</dd><dt>OEE</dt><dd>${l.oee.toFixed(1)}%</dd><dt>Cycle time</dt><dd>${l.cycle.toFixed(1)} s</dd>
        <dt>Temperature</dt><dd>${l.temp.toFixed(1)} °C</dd><dt>Energy</dt><dd>${l.energy.toFixed(1)} kW</dd><dt>Health</dt><dd>${l.health}/100</dd></dl>
        <p><b>What-if:</b> raising line speed by 10% moves the bottleneck to ${i === 3 ? 'packaging' : 'inspection'}, which the twin flags before anyone changes the real line.</p>
        <p class="muted">The twin above mirrors this machine. Blue particles carry sensor data up, and amber particles carry approved setting changes back down.</p>`;
    case 'physical-ai':
      return `<dl class="kv"><dt>Simulated attempts</dt><dd>${(1.2 + i * 0.3).toFixed(1)} M</dd><dt>Success in simulation</dt><dd>99.${1 + i}%</dd>
        <dt>Success on the floor</dt><dd>98.${4 - (i % 3)}%</dd><dt>Sim-to-real gap</dt><dd>tracked by the twin</dd></dl>
        <p class="agent"><b>Agent:</b> "Raising line speed by 8% keeps OEE above 85% in 940 of 1,000 simulated runs. Approve the trial on line 1?"</p>
        <p class="muted">Robots learn in randomized simulated worlds before deployment. People approve changes that AI agents propose.</p>`;
    default:
      return '';
  }
}

export function renderFactory(el, params) {
  let eraIdx = Math.max(0, factoryEras.findIndex((e) => e.id === params.get('era')));
  el.innerHTML = `
  <section class="factory">
    <div class="wrap factory-head">
      <p class="eyebrow">Interactive · 3D</p>
      <h1>The factory through time</h1>
      <p class="lede">The same production line, seen the way people could see and understand it in each era. Click a machine, then step through the eras to watch the floor become a live digital twin.</p>
    </div>
    <div class="factory-grid">
      <div class="stage-wrap">
        <div class="stage stage--factory" id="factory" role="img" aria-label="3D production line with five stations"></div>
        <div class="stage-legend" aria-live="polite"></div>
        <div class="stage-controls">
          <button class="btn btn-small" data-act="overview">Overview</button>
          <span class="stage-hint">Drag to orbit · scroll to zoom · click a machine</span>
        </div>
        <nav class="era-stepper" aria-label="Factory eras">
          <button class="step-arrow" data-act="prev" aria-label="Previous era">‹</button>
          <ol>${factoryEras.map((e, i) => `<li><button data-era="${i}"><span>${esc(e.label)}</span><small>${esc(e.name)}</small></button></li>`).join('')}</ol>
          <button class="step-arrow" data-act="next" aria-label="Next era">›</button>
        </nav>
      </div>
      <aside class="factory-panel">
        <div class="era-panel"></div>
        <div class="machine-panel" hidden></div>
      </aside>
    </div>
  </section>`;

  const eraPanel = el.querySelector('.era-panel');
  const machinePanel = el.querySelector('.machine-panel');
  let factory = null;
  let selected = -1;

  function drawEra() {
    const e = factoryEras[eraIdx];
    el.querySelectorAll('[data-era]').forEach((b, i) => b.setAttribute('aria-current', i === eraIdx ? 'step' : 'false'));
    eraPanel.innerHTML = `
      <p class="eyebrow">${esc(e.label)}</p>
      <h2>${esc(e.name)}</h2>
      <p class="question">${esc(e.question)}</p>
      <p>${esc(e.narrative)}</p>
      <dl class="sdk">
        <div><dt>What you could see</dt><dd>${esc(e.see)}</dd></div>
        <div><dt>What you could know</dt><dd>${esc(e.know)}</dd></div>
        <div><dt>What you could decide</dt><dd>${esc(e.decide)}</dd></div>
      </dl>
      <h3>Milestones behind this view</h3>
      <ul class="mini-milestones">${e.milestones.map((id) => byId[id]).filter(Boolean).map((m) => `
        <li><a href="#/milestone/${m.id}"><b>${m.year}</b> ${esc(m.title)}</a>
          <span class="cite">${m.sources.map((s, k) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}">[${k + 1}]</a>`).join(' ')}</span></li>`).join('')}
      </ul>`;
    el.querySelector('.stage-legend').innerHTML = LEGENDS[e.id];
    if (factory) factory.setEra(e.id);
    drawMachine();
    history.replaceState(null, '', `#/factory?era=${e.id}`);
  }
  function drawMachine() {
    if (selected < 0 || !factory) { machinePanel.hidden = true; return; }
    machinePanel.hidden = false;
    machinePanel.innerHTML = `
      <div class="machine-head"><h3>${esc(STATIONS[selected].name)}</h3><button class="btn btn-small" data-act="close" aria-label="Close machine details">×</button></div>
      ${readout(factoryEras[eraIdx].id, selected, factory.getLive(selected))}
      <p class="fine">Machine values are illustrative and simulated in your browser.</p>`;
  }

  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.era !== undefined) { eraIdx = Number(b.dataset.era); drawEra(); }
    else if (b.dataset.act === 'prev') { eraIdx = Math.max(0, eraIdx - 1); drawEra(); }
    else if (b.dataset.act === 'next') { eraIdx = Math.min(factoryEras.length - 1, eraIdx + 1); drawEra(); }
    else if (b.dataset.act === 'overview') { factory && factory.reset(); }
    else if (b.dataset.act === 'close') { selected = -1; drawMachine(); factory && factory.reset(); }
  });
  const onKey = (ev) => {
    if (ev.target.closest('input, textarea')) return;
    if (ev.key === 'ArrowRight') { eraIdx = Math.min(factoryEras.length - 1, eraIdx + 1); drawEra(); }
    if (ev.key === 'ArrowLeft') { eraIdx = Math.max(0, eraIdx - 1); drawEra(); }
  };
  window.addEventListener('keydown', onKey);

  if (webglOk) {
    factory = createFactory(el.querySelector('#factory'), {
      onSelect: (i) => { selected = i; drawMachine(); },
    });
  } else {
    el.querySelector('#factory').innerHTML = '<p class="nogl">The 3D factory needs WebGL. The era descriptions alongside still tell the story.</p>';
  }
  drawEra();
  const timer = setInterval(() => { if (selected >= 0) drawMachine(); }, 1000);

  return () => {
    clearInterval(timer);
    window.removeEventListener('keydown', onKey);
    factory && factory.dispose();
  };
}
