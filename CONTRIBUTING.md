# Contributing

Thank you for helping make this history more complete and more accurate.

## Add or fix a milestone

Edit `content/timeline.json`. Each milestone looks like this:

```json
{
  "id": "kalman",
  "year": 1960,
  "title": "The Kalman filter: correcting a model with live measurements",
  "era": "precursors",
  "domains": ["foundations", "aerospace"],
  "kind": "enabler",
  "significance": 3,
  "summary": "One or two sentences for the timeline list.",
  "detail": "A paragraph on the context and why it matters for digital twins.",
  "sources": [{ "title": "Kalman filter (Wikipedia)", "url": "https://en.wikipedia.org/wiki/Kalman_filter" }]
}
```

- `era`: one of the ids in `content/eras.json`. The year must fall inside that era's range.
- `domains`: one or more ids from `content/domains.json`.
- `kind`: `precursor`, `enabler`, `concept`, `standard`, `deployment` or `research`.
- `significance`: `1` (notable), `2` (important) or `3` (turning point; labelled in the 3D spiral).
- `sources`: at least one public `https` link. Prefer primary sources: standards bodies, agencies, DOIs, arXiv or official reports.

Then run:

```bash
npm run validate
```

## Ground rules

- **Cite it.** No source, no milestone.
- **Stay vendor-neutral.** Describe what was done and why it mattered, not who sells it. Name an organization only when the history can't be told without it.
- **Write for a general reader.** Keep jargon to a minimum and explain it when you need it.
- **Don't copy.** Link to videos, images and papers rather than embedding copyrighted material.

## Domain deep dives

Each domain has a Markdown page in `content/domains/`. Keep the structure: *The short version*, *Then*, *Now*, and *What's next*.
