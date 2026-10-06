import timelineRaw from '../content/timeline.json';
import eras from '../content/eras.json';
import domains from '../content/domains.json';
import factoryEras from '../content/factory-eras.json';
import definitions from '../content/pages/definitions.md?raw';
import frontier from '../content/pages/frontier.md?raw';

const domainPages = import.meta.glob('../content/domains/*.md', { query: '?raw', import: 'default', eager: true });

export const timeline = [...timelineRaw].sort((a, b) => a.year - b.year);
export const byId = Object.fromEntries(timeline.map((m) => [m.id, m]));
export { eras, domains, factoryEras };
export const eraById = Object.fromEntries(eras.map((e) => [e.id, e]));
export const domainById = Object.fromEntries(domains.map((d) => [d.id, d]));
export const pages = { definitions, frontier };
export function domainMarkdown(id) {
  return domainPages[`../content/domains/${id}.md`] || '';
}

export const KINDS = [
  { id: 'precursor', name: 'Precursor', desc: 'Practices that mirrored reality before the term existed' },
  { id: 'enabler', name: 'Enabling technology', desc: 'Methods and tools twins are built from' },
  { id: 'concept', name: 'Concept', desc: 'Ideas, visions and definitions' },
  { id: 'standard', name: 'Standard', desc: 'Shared vocabularies, interfaces and frameworks' },
  { id: 'deployment', name: 'Deployment', desc: 'Twins put to work at scale' },
  { id: 'research', name: 'Research', desc: 'Papers and programs that moved the field' },
];
export const kindById = Object.fromEntries(KINDS.map((k) => [k.id, k]));
// Categorical slots 1-6, fixed order (validated palette, see README).
export const KIND_COLORS = {
  light: { precursor: '#2a78d6', enabler: '#eb6834', concept: '#1baf7a', standard: '#eda100', deployment: '#e87ba4', research: '#008300' },
  dark: { precursor: '#3987e5', enabler: '#d95926', concept: '#199e70', standard: '#c98500', deployment: '#d55181', research: '#008300' },
};

export const allSources = (() => {
  const map = new Map();
  for (const m of timeline) {
    for (const s of m.sources) {
      if (!map.has(s.url)) map.set(s.url, { ...s, milestones: [] });
      map.get(s.url).milestones.push(m);
    }
  }
  return [...map.values()];
})();
