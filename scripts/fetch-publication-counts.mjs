// Fetches yearly counts of works with "digital twin" in the title from OpenAlex
// (https://openalex.org, CC0 data) into public/data/publications.json.
// Never fails the build: if the API is unreachable, the site shows a note instead.
import { writeFile, mkdir } from 'node:fs/promises';

const url = 'https://api.openalex.org/works?filter=title.search:%22digital%20twin%22&group_by=publication_year&per_page=200&mailto=digital-twin-history@users.noreply.github.com';
try {
  const res = await fetch(url, { headers: { 'User-Agent': 'digital-twin-history (github.com/pikulsomesh/digital-twin-history)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const counts = data.group_by
    .map((g) => ({ year: Number(g.key), count: g.count }))
    .filter((g) => Number.isFinite(g.year))
    .sort((a, b) => a.year - b.year);
  await mkdir('public/data', { recursive: true });
  await writeFile('public/data/publications.json', JSON.stringify({ source: 'OpenAlex', query: 'title.search:"digital twin"', retrieved: new Date().toISOString().slice(0, 10), counts }, null, 2));
  console.log(`Wrote ${counts.length} years of publication counts.`);
} catch (err) {
  console.warn(`Skipping publication counts: ${err.message}`);
}
