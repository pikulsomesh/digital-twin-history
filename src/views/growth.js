import { timeline, eras, domains, KINDS, KIND_COLORS } from '../data.js';
import { esc, isDark } from '../util.js';
import { breadthByYear } from '../three/spiral.js';

const SEQ = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
const SEQ_DARK = ['#184f95', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#6da7ec'];

function tooltipHost(root) {
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  root.appendChild(tip);
  root.addEventListener('pointermove', (ev) => {
    const t = ev.target.closest('[data-tip]');
    if (!t) { tip.hidden = true; return; }
    const r = root.getBoundingClientRect();
    tip.hidden = false;
    tip.innerHTML = t.dataset.tip;
    tip.style.left = `${Math.min(ev.clientX - r.left + 12, r.width - 220)}px`;
    tip.style.top = `${ev.clientY - r.top + 12}px`;
  });
  root.addEventListener('pointerleave', () => { tip.hidden = true; });
}

function breadthChart() {
  const pts = breadthByYear(timeline);
  const W = 760, H = 280, L = 40, R = 16, T = 16, B = 34;
  const x0 = 1880, x1 = 2027;
  const x = (y) => L + ((y - x0) / (x1 - x0)) * (W - L - R);
  const ymax = domains.length;
  const y = (v) => T + (1 - v / ymax) * (H - T - B);
  let d = `M${x(x0)},${y(0)}`;
  pts.forEach((p) => { d += ` H${x(p.year)} V${y(p.breadth)}`; });
  d += ` H${x(x1)}`;
  const bands = eras.map((e, i) => `<rect x="${x(e.range[0])}" y="${T}" width="${x(Math.min(e.range[1] + 1, x1)) - x(e.range[0])}" height="${H - T - B}" class="${i % 2 ? 'band band-alt' : 'band'}"><title>${esc(e.name)}</title></rect>`).join('');
  const ticks = [1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020].map((t) => `<g><line x1="${x(t)}" x2="${x(t)}" y1="${H - B}" y2="${H - B + 4}" class="axis"/><text x="${x(t)}" y="${H - B + 18}" text-anchor="middle" class="tick">${t}</text></g>`).join('');
  const yt = [0, 2, 4, 6, 8, 10].map((v) => `<g><line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="tick">${v}</text></g>`).join('');
  const seen = new Set();
  const dots = [];
  timeline.forEach((m) => {
    const fresh = m.domains.filter((dd) => !seen.has(dd));
    fresh.forEach((dd) => seen.add(dd));
    if (fresh.length) {
      dots.push(`<circle cx="${x(m.year)}" cy="${y(seen.size)}" r="5" class="dot-series"/><circle cx="${x(m.year)}" cy="${y(seen.size)}" r="12" class="hit" data-tip="<b>${m.year}</b> · ${esc(m.title)}<br>First milestone in: ${esc(fresh.map((f) => domains.find((z) => z.id === f).name).join(', '))}<br>${seen.size} domains active"/>`);
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Step chart of the number of domains with digital twin milestones, rising from 1 in 1888 to ${ymax} by the 2010s">
    ${bands}${yt}${ticks}<path d="${d}" class="line-series"/>${dots.join('')}</svg>`;
}

function kindByEraChart() {
  const colors = isDark() ? KIND_COLORS.dark : KIND_COLORS.light;
  const rows = eras.map((e) => ({ e, counts: KINDS.map((k) => timeline.filter((m) => m.era === e.id && m.kind === k.id).length) }));
  const max = Math.max(...rows.map((r) => r.counts.reduce((a, b) => a + b, 0)));
  const W = 760, rowH = 34, L = 200, R = 50, T = 8;
  const H = T + rows.length * rowH + 8;
  const sx = (v) => (v / max) * (W - L - R);
  const bars = rows.map((r, i) => {
    let acc = 0;
    const y = T + i * rowH;
    const segs = r.counts.map((c, k) => {
      if (!c) return '';
      const x = L + sx(acc) + (acc ? 1 : 0);
      const w = Math.max(0, sx(c) - (acc ? 1 : 0) - 1);
      acc += c;
      return `<rect x="${x}" y="${y + 6}" width="${w}" height="${rowH - 14}" rx="3" fill="${colors[KINDS[k].id]}" data-tip="<b>${esc(r.e.name)}</b><br>${esc(KINDS[k].name)}: ${c}"/>`;
    }).join('');
    const total = r.counts.reduce((a, b) => a + b, 0);
    return `<text x="${L - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" class="tick">${r.e.range[0]}–${r.e.range[1] >= 2026 ? 'now' : r.e.range[1]}</text>${segs}<text x="${L + sx(total) + 8}" y="${y + rowH / 2 + 4}" class="value">${total}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Stacked bars of milestones per era by kind">${bars}</svg>
  <ul class="legend legend-row">${KINDS.map((k) => `<li><span class="swatch" style="--c:${colors[k.id]}"></span>${k.name}</li>`).join('')}</ul>`;
}

function heatmap() {
  const ramp = isDark() ? SEQ_DARK : SEQ;
  const cells = domains.map((d) => eras.map((e) => timeline.filter((m) => m.era === e.id && m.domains.includes(d.id)).length));
  const max = Math.max(...cells.flat());
  const shade = (v) => (v === 0 ? 'transparent' : ramp[Math.min(ramp.length - 1, Math.ceil((v / max) * (ramp.length - 1)))]);
  return `<div class="heat-wrap"><table class="heat">
    <thead><tr><th scope="col">Domain</th>${eras.map((e) => `<th scope="col" title="${esc(e.name)}">${e.range[0]}</th>`).join('')}</tr></thead>
    <tbody>${domains.map((d, i) => `<tr><th scope="row"><a href="#/industries/${d.id}">${esc(d.name)}</a></th>${cells[i].map((v, j) => `<td style="--cell:${shade(v)}" class="${v === 0 ? 'empty' : v / max > 0.5 && !isDark() ? 'hi' : ''}" data-tip="<b>${esc(d.name)}</b> · ${esc(eras[j].name)}<br>${v} milestone${v === 1 ? '' : 's'}">${v || ''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

async function publications(host) {
  try {
    const res = await fetch('./data/publications.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('missing');
    const data = await res.json();
    const rows = data.counts.filter((r) => r.year >= 2000 && r.year <= new Date().getFullYear());
    if (!rows.length) throw new Error('empty');
    const W = 760, H = 260, L = 56, R = 12, T = 12, B = 30;
    const max = Math.max(...rows.map((r) => r.count));
    const bw = (W - L - R) / rows.length;
    const y = (v) => T + (1 - v / max) * (H - T - B);
    const nice = Math.pow(10, Math.floor(Math.log10(max)));
    const step = max / nice > 5 ? nice * 2 : nice;
    const grid = [];
    for (let v = 0; v <= max; v += step) grid.push(`<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="tick">${v.toLocaleString()}</text>`);
    const bars = rows.map((r, i) => {
      const h = H - B - y(r.count);
      return `<rect x="${L + i * bw + 1}" y="${y(r.count)}" width="${Math.max(1, bw - 2)}" height="${h}" rx="${Math.min(4, bw / 3)}" class="bar-series"/>
        <rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" class="hit" data-tip="<b>${r.year}</b><br>${r.count.toLocaleString()} works with &quot;digital twin&quot; in the title${r.year === new Date().getFullYear() ? ' (year to date)' : ''}"/>
        ${i % 4 === 0 ? `<text x="${L + i * bw + bw / 2}" y="${H - B + 18}" text-anchor="middle" class="tick">${r.year}</text>` : ''}`;
    }).join('');
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Bar chart of research publications per year with digital twin in the title">${grid.join('')}${bars}</svg>
      <p class="fine">Source: <a href="https://openalex.org" target="_blank" rel="noopener">OpenAlex</a>, works with "digital twin" in the title, retrieved ${esc(data.retrieved)} when the site was built. The latest year is partial.</p>`;
  } catch (e) {
    host.innerHTML = `<p class="muted">Publication counts are fetched from OpenAlex when the site is built and weren't available for this build. Run <code>npm run fetch:publications</code> to add them.</p>`;
  }
}

export function renderGrowth(el) {
  const draw = () => {
    el.innerHTML = `
    <section class="wrap section growth">
      <p class="eyebrow">Growth pattern</p>
      <h1>How the idea spread</h1>
      <p class="lede">Digital twins grew in three waves. A long precursor period, from the 1880s to the 1960s, built the habits: recording work, signalling state and rehearsing on stand-ins. A digital period, from the 1970s to the 2000s, turned products, plants and buildings into data. Then an explosion after the name arrived in 2010, as sensors, cloud computing and AI made twins cheap enough to spread to every domain.</p>

      <div class="chart-card">
        <h2>Breadth: domains with a digital twin milestone</h2>
        <p class="muted">Each dot marks the first milestone in a new domain. Shaded bands are the seven eras.</p>
        <div class="chart-host">${breadthChart()}</div>
      </div>

      <div class="chart-card">
        <h2>What kind of progress, era by era</h2>
        <p class="muted">Early eras are precursors and enabling technology. Concepts cluster around the naming of the idea, standards and deployments follow in the 2010s and 2020s, and research leads the frontier.</p>
        <div class="chart-host">${kindByEraChart()}</div>
      </div>

      <div class="chart-card">
        <h2>Where activity concentrated</h2>
        <p class="muted">Milestones per domain and era. A stronger blue means more milestones.</p>
        <div class="chart-host">${heatmap()}</div>
      </div>

      <div class="chart-card">
        <h2>Research interest: publications per year</h2>
        <div class="chart-host" id="pubs"><p class="muted">Loading…</p></div>
      </div>

      <p class="fine">The milestone charts count the curated milestones on this site, which are chosen for significance rather than being an exhaustive census. Contributions that add well-sourced milestones will change these charts automatically.</p>
    </section>`;
    el.querySelectorAll('.chart-host').forEach(tooltipHost);
    publications(el.querySelector('#pubs'));
  };
  draw();
  window.addEventListener('themechange', draw);
  return () => window.removeEventListener('themechange', draw);
}
