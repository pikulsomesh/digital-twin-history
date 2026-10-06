import './styles.css';
import { renderHome } from './views/home.js';
import { renderFactory } from './views/factory.js';
import { renderTimeline, renderMilestone } from './views/timeline.js';
import { renderIndustries, renderIndustry } from './views/industries.js';
import { renderGrowth } from './views/growth.js';
import { renderSources } from './views/sources.js';
import { renderPage } from './views/page.js';

const main = document.getElementById('main');
let cleanup = null;

const routes = [
  [/^\/?$/, () => renderHome],
  [/^\/factory$/, () => renderFactory],
  [/^\/timeline$/, () => renderTimeline],
  [/^\/milestone\/([\w-]+)$/, (m) => (el) => renderMilestone(el, m[1])],
  [/^\/what-is$/, () => (el) => renderPage(el, 'definitions')],
  [/^\/frontier$/, () => (el) => renderPage(el, 'frontier')],
  [/^\/industries$/, () => renderIndustries],
  [/^\/industries\/([\w-]+)$/, (m) => (el) => renderIndustry(el, m[1])],
  [/^\/growth$/, () => renderGrowth],
  [/^\/sources$/, () => renderSources],
];

function route() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query] = raw.split('?');
  const params = new URLSearchParams(query || '');
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  let view = null;
  for (const [re, make] of routes) {
    const m = path.match(re);
    if (m) { view = make(m); break; }
  }
  main.innerHTML = '';
  if (!view) {
    main.innerHTML = `<section class="wrap prose"><h1>Page not found</h1><p><a href="#/">Back to the start</a></p></section>`;
  } else {
    cleanup = view(main, params) || null;
  }
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const href = a.getAttribute('href').slice(1);
    a.classList.toggle('active', href !== '/' && path.startsWith(href));
  });
  document.querySelector('.site-nav').classList.remove('open');
  document.querySelector('.nav-toggle').setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

document.querySelector('.nav-toggle').addEventListener('click', (e) => {
  const nav = document.querySelector('.site-nav');
  const open = nav.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', String(open));
});
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  window.dispatchEvent(new Event('themechange'));
});
