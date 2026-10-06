// Checks that every milestone is well-formed and cited, so contributions can't break the site.
import { readFile } from 'node:fs/promises';

const load = async (p) => JSON.parse(await readFile(new URL(`../content/${p}`, import.meta.url)));
const [timeline, eras, domains, factory] = await Promise.all([load('timeline.json'), load('eras.json'), load('domains.json'), load('factory-eras.json')]);
const KINDS = ['precursor', 'enabler', 'concept', 'standard', 'deployment', 'research'];
const eraIds = new Set(eras.map((e) => e.id));
const domainIds = new Set(domains.map((d) => d.id));
const ids = new Set();
const errors = [];

for (const m of timeline) {
  const where = `milestone "${m.id}"`;
  if (!m.id || !/^[a-z0-9-]+$/.test(m.id)) errors.push(`${where}: id must be lowercase-kebab-case`);
  if (ids.has(m.id)) errors.push(`${where}: duplicate id`);
  ids.add(m.id);
  if (!Number.isInteger(m.year)) errors.push(`${where}: year must be an integer`);
  for (const f of ['title', 'summary', 'detail']) if (!m[f] || typeof m[f] !== 'string') errors.push(`${where}: missing ${f}`);
  if (!eraIds.has(m.era)) errors.push(`${where}: unknown era "${m.era}"`);
  const era = eras.find((e) => e.id === m.era);
  if (era && (m.year < era.range[0] || m.year > era.range[1])) errors.push(`${where}: year ${m.year} is outside era ${m.era} (${era.range.join('–')})`);
  if (!Array.isArray(m.domains) || !m.domains.length) errors.push(`${where}: needs at least one domain`);
  else m.domains.forEach((d) => { if (!domainIds.has(d)) errors.push(`${where}: unknown domain "${d}"`); });
  if (!KINDS.includes(m.kind)) errors.push(`${where}: kind must be one of ${KINDS.join(', ')}`);
  if (![1, 2, 3].includes(m.significance)) errors.push(`${where}: significance must be 1, 2 or 3`);
  if (!Array.isArray(m.sources) || !m.sources.length) errors.push(`${where}: needs at least one source`);
  else m.sources.forEach((s) => {
    if (!s.title) errors.push(`${where}: source missing title`);
    try { if (new URL(s.url).protocol !== 'https:') throw 0; } catch { errors.push(`${where}: source url must be https: ${s.url}`); }
  });
}
for (const e of factory) e.milestones.forEach((id) => { if (!ids.has(id)) errors.push(`factory era "${e.id}": unknown milestone "${id}"`); });

if (errors.length) {
  console.error(`Content check failed:\n - ${errors.join('\n - ')}`);
  process.exit(1);
}
console.log(`Content OK: ${timeline.length} milestones, ${eras.length} eras, ${domains.length} domains.`);
