import { timeline, domains, domainById, eras, domainMarkdown } from '../data.js';
import { esc, md } from '../util.js';

export function renderIndustries(el) {
  el.innerHTML = `
  <section class="wrap section">
    <p class="eyebrow">Deep dives</p>
    <h1>Industries and domains</h1>
    <p class="lede">The same idea, a virtual counterpart kept in sync with reality, took different paths in each field. Pick a domain to see where it started, how it is used today and what comes next.</p>
    <div class="cards cards-3">
      ${domains.map((d) => {
        const ms = timeline.filter((m) => m.domains.includes(d.id));
        return `<a class="card card-link" href="#/industries/${d.id}">
          <span class="card-kicker">${ms.length} milestones · since ${ms[0] ? ms[0].year : '–'}</span>
          <h3>${esc(d.name)}</h3>
          <p>${esc(d.short)}</p>
          <div class="sparkstrip" aria-hidden="true">${eras.map((e) => `<span style="--n:${ms.filter((m) => m.era === e.id).length}"></span>`).join('')}</div>
        </a>`;
      }).join('')}
    </div>
  </section>`;
}

export function renderIndustry(el, id) {
  const d = domainById[id];
  if (!d) {
    el.innerHTML = `<section class="wrap prose"><h1>Domain not found</h1><p><a href="#/industries">All domains</a></p></section>`;
    return;
  }
  const ms = timeline.filter((m) => m.domains.includes(id));
  el.innerHTML = `
  <article class="wrap industry">
    <p class="crumbs"><a href="#/industries">Industries</a> › ${esc(d.name)}</p>
    <h1>${esc(d.name)}</h1>
    <p class="lede">${esc(d.short)}</p>
    <div class="industry-grid">
      <div class="prose">${md(domainMarkdown(id))}</div>
      <aside class="industry-rail">
        <h2>Milestones in this domain</h2>
        <ol class="rail-list">${ms.map((m) => `<li><a href="#/milestone/${m.id}"><b>${m.year}</b> ${esc(m.title)}</a></li>`).join('')}</ol>
        <p><a href="#/timeline?domain=${id}">Open in the timeline →</a></p>
        ${id === 'manufacturing' || id === 'people' || id === 'robotics' ? '<p><a class="btn" href="#/factory">Walk the factory through time</a></p>' : ''}
      </aside>
    </div>
  </article>`;
}
