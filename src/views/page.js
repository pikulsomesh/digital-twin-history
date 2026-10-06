import { pages } from '../data.js';
import { md } from '../util.js';

export function renderPage(el, key) {
  el.innerHTML = `<article class="wrap prose page">${md(pages[key])}</article>`;
}
