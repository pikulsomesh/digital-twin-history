import { timeline, eras, eraById, domains, domainById, KINDS, kindById, KIND_COLORS, byId } from '../data.js';
import { esc, sourceLinks, isDark } from '../util.js';

const kindDot = (k) => `<span class="kind" style="--c:${(isDark() ? KIND_COLORS.dark : KIND_COLORS.light)[k]}"><span class="swatch"></span>${esc(kindById[k].name)}</span>`;
const domainTags = (ds) => ds.map((d) => `<a class="tag" href="#/industries/${d}">${esc(domainById[d].name)}</a>`).join('');

export function renderTimeline(el, params) {
  const state = {
    era: params.get('era') || '',
    domain: params.get('domain') || '',
    kind: params.get('kind') || '',
    q: params.get('q') || '',
  };
  el.innerHTML = `
  <section class="wrap section">
    <p class="eyebrow">${timeline.length} milestones · every one cited</p>
    <h1>Timeline</h1>
    <p class="lede">The milestones that shaped digital twins, from the first mechanical records of work to AI world models. Filter by era, domain or kind of change, and follow the numbered links to the public sources.</p>
    <form class="filters" role="search">
      <label>Era<select name="era"><option value="">All eras</option>${eras.map((e) => `<option value="${e.id}">${e.range[0]}–${e.range[1] >= 2026 ? 'now' : e.range[1]} · ${esc(e.name)}</option>`).join('')}</select></label>
      <label>Domain<select name="domain"><option value="">All domains</option>${domains.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></label>
      <label>Kind<select name="kind"><option value="">All kinds</option>${KINDS.map((k) => `<option value="${k.id}">${esc(k.name)}</option>`).join('')}</select></label>
      <label class="grow">Search<input type="search" name="q" placeholder="e.g. Apollo, andon, standard"></label>
    </form>
    <p class="result-count" aria-live="polite"></p>
    <div class="timeline"></div>
  </section>`;
  const form = el.querySelector('.filters');
  Object.entries(state).forEach(([k, v]) => { form.elements[k].value = v; });
  const out = el.querySelector('.timeline');
  const count = el.querySelector('.result-count');

  function draw() {
    const q = state.q.trim().toLowerCase();
    const items = timeline.filter((m) =>
      (!state.era || m.era === state.era) &&
      (!state.domain || m.domains.includes(state.domain)) &&
      (!state.kind || m.kind === state.kind) &&
      (!q || `${m.title} ${m.summary} ${m.detail} ${m.year}`.toLowerCase().includes(q)));
    count.textContent = `${items.length} of ${timeline.length} milestones`;
    const groups = eras.map((e) => ({ e, items: items.filter((m) => m.era === e.id) })).filter((g) => g.items.length);
    out.innerHTML = groups.map(({ e, items: its }) => `
      <section class="tl-era">
        <header class="tl-era-head">
          <span class="era-range">${e.range[0]}–${e.range[1] >= 2026 ? 'now' : e.range[1]}</span>
          <h2>${esc(e.name)}</h2>
          <p>${esc(e.summary)}</p>
        </header>
        <ol class="tl-items">
          ${its.map((m) => `
          <li class="tl-item sig-${m.significance}">
            <div class="tl-year">${m.year}</div>
            <div class="tl-body">
              <h3><a href="#/milestone/${m.id}">${esc(m.title)}</a></h3>
              <p>${esc(m.summary)}</p>
              <div class="tl-meta">${kindDot(m.kind)}${domainTags(m.domains)}
                <span class="cite">${m.sources.map((s, k) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}">[${k + 1}]</a>`).join(' ')}</span>
              </div>
            </div>
          </li>`).join('')}
        </ol>
      </section>`).join('') || '<p>No milestones match these filters.</p>';
    const p = new URLSearchParams(Object.entries(state).filter(([, v]) => v));
    history.replaceState(null, '', `#/timeline${p.toString() ? '?' + p : ''}`);
  }
  form.addEventListener('input', () => {
    Object.keys(state).forEach((k) => { state[k] = form.elements[k].value; });
    draw();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  draw();
}

export function renderMilestone(el, id) {
  const m = byId[id];
  if (!m) {
    el.innerHTML = `<section class="wrap prose"><h1>Milestone not found</h1><p><a href="#/timeline">Back to the timeline</a></p></section>`;
    return;
  }
  const idx = timeline.indexOf(m);
  const prev = timeline[idx - 1];
  const next = timeline[idx + 1];
  const era = eraById[m.era];
  const related = timeline.filter((o) => o !== m && o.domains.some((d) => m.domains.includes(d))).sort((a, b) => Math.abs(a.year - m.year) - Math.abs(b.year - m.year)).slice(0, 4);
  el.innerHTML = `
  <article class="wrap milestone">
    <p class="crumbs"><a href="#/timeline">Timeline</a> › <a href="#/timeline?era=${era.id}">${esc(era.name)}</a></p>
    <p class="big-year">${m.year}</p>
    <h1>${esc(m.title)}</h1>
    <div class="tl-meta">${kindDot(m.kind)}${domainTags(m.domains)}</div>
    <p class="lede">${esc(m.summary)}</p>
    <div class="prose"><p>${esc(m.detail)}</p></div>
    <h2>Sources</h2>
    ${sourceLinks(m.sources)}
    <h2>Context</h2>
    <p class="muted">${esc(era.name)} (${era.range[0]}–${era.range[1] >= 2026 ? 'now' : era.range[1]}): ${esc(era.tagline)}.</p>
    ${related.length ? `<h2>Related milestones</h2><ul class="related">${related.map((r) => `<li><a href="#/milestone/${r.id}"><b>${r.year}</b> ${esc(r.title)}</a></li>`).join('')}</ul>` : ''}
    <nav class="pager">
      ${prev ? `<a href="#/milestone/${prev.id}">‹ ${prev.year} ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a href="#/milestone/${next.id}">${next.year} ${esc(next.title)} ›</a>` : '<span></span>'}
    </nav>
    <p class="fine">Spotted an error or a missing source? <a href="https://github.com/pikulsomesh/digital-twin-history/edit/main/content/timeline.json" target="_blank" rel="noopener">Edit this milestone on GitHub</a>.</p>
  </article>`;
}
