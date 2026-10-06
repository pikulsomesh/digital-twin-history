import { allSources } from '../data.js';
import { esc } from '../util.js';

export function renderSources(el) {
  const sorted = [...allSources].sort((a, b) => a.milestones[0].year - b.milestones[0].year);
  el.innerHTML = `
  <section class="wrap section">
    <p class="eyebrow">${sorted.length} public sources</p>
    <h1>Sources and method</h1>
    <div class="prose">
      <p>Every milestone on this site links to at least one public source: standards bodies, government and intergovernmental agencies, peer-reviewed papers (linked by DOI or arXiv), national academies and general references. Where a fact rests on a general reference such as Wikipedia, its own citations lead to the primary record.</p>
      <h2>How this history is written</h2>
      <ul>
        <li><b>Vendor-neutral.</b> The story is told through ideas, practices, standards and public programs. Organizations are named only where history requires it, and never as recommendations.</li>
        <li><b>Traceable.</b> Every claim is linked. Dates use the earliest well-documented public milestone, and approximate dates are described as such in the text.</li>
        <li><b>Open.</b> All content lives as plain JSON and Markdown in the <a href="https://github.com/pikulsomesh/digital-twin-history/tree/main/content" target="_blank" rel="noopener">content folder</a> under the MIT license. Corrections and additions are welcome through pull requests.</li>
      </ul>
    </div>
    <h2>All sources</h2>
    <ol class="all-sources">
      ${sorted.map((s) => `<li>
        <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>
        <span class="host">${esc(new URL(s.url).hostname.replace(/^www\./, ''))}</span>
        <span class="used">Cited for: ${s.milestones.map((m) => `<a href="#/milestone/${m.id}">${m.year} ${esc(m.title)}</a>`).join('; ')}</span>
      </li>`).join('')}
    </ol>
  </section>`;
}
