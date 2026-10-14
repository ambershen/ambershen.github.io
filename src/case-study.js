import './case-study.css';
import {renderNav} from './site-nav.js';
import {caseStudies, caseStudySections} from './data/case-studies.js';

const slug = document.body.dataset.slug;
const study = caseStudies.find(s => s.slug === slug);
const main = document.querySelector('#case-study');
document.body.prepend(renderNav('products'));

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const statusLabel = {draft: 'Draft', 'in-progress': 'In development', published: ''};

function media(item, alt) {
  if (item?.video) {
    const v = el('video', 'cs-media'); v.src = item.video; v.controls = true; v.playsInline = true; v.preload = 'metadata';
    if (item.poster) v.poster = item.poster; v.setAttribute('aria-label', alt); return v;
  }
  if (item?.image) { const i = el('img', 'cs-media'); i.src = item.image; i.alt = alt; return i; }
  const ph = el('div', 'cs-media cs-media-placeholder');
  ph.append(el('span', '', 'Cover image or film — coming soon'));
  return ph;
}

if (!study) {
  main.append(el('h1', 'cs-title', 'Case study not found'), Object.assign(el('a', 'cs-back', '← All work'), {href: '/#work'}));
} else {
  document.title = `${study.title} — Amber Shen`;
  const hero = el('section', 'cs-hero');
  const eyebrow = el('p', 'cs-eyebrow');
  eyebrow.append(el('span', '', `Case study · ${study.year}`));
  if (statusLabel[study.status]) eyebrow.append(el('span', 'cs-status', statusLabel[study.status]));
  hero.append(eyebrow, el('h1', 'cs-title', study.title), el('p', 'cs-tagline', study.tagline), el('p', 'cs-medium', study.medium));
  const cover = el('figure', 'cs-cover'); cover.append(media(study.cover, study.title));

  const body = el('div', 'cs-body');
  const toc = el('nav', 'cs-toc'); toc.setAttribute('aria-label', 'Sections');
  const sections = el('div', 'cs-sections');
  for (const [i, s] of caseStudySections.entries()) {
    const id = `s-${s.key}`;
    const a = el('a', '', s.label); a.href = `#${id}`; toc.append(a);
    const sec = el('section', 'cs-section'); sec.id = id;
    sec.append(el('p', 'cs-num', String(i + 1).padStart(2, '0')), el('h2', '', s.label));
    const text = study.sections[s.key];
    if (text) {
      for (const para of [].concat(text)) sec.append(el('p', '', para));
    } else {
      const ph = el('p', 'cs-placeholder', s.prompt); sec.append(ph);
    }
    if (s.key === 'process' && study.gallery.length) {
      const g = el('div', 'cs-gallery');
      study.gallery.forEach((src, n) => { const img = el('img'); img.src = src; img.alt = `${study.title} — process ${n + 1}`; img.loading = 'lazy'; g.append(img); });
      sec.append(g);
    }
    sections.append(sec);
  }
  body.append(toc, sections);

  const footer = el('footer', 'cs-footer');
  if (study.links.length) {
    const links = el('div', 'cs-links');
    study.links.forEach(l => { const a = el('a', '', `${l.label} ↗`); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; links.append(a); });
    footer.append(links);
  }
  const idx = caseStudies.indexOf(study), next = caseStudies[(idx + 1) % caseStudies.length];
  const back = el('a', 'cs-back', '← All work'); back.href = '/#work';
  const nxt = el('a', 'cs-next'); nxt.href = `/work/${next.slug}/`;
  nxt.append(el('span', '', 'Next case study'), el('strong', '', `${next.title} →`));
  const nav = el('div', 'cs-pager'); nav.append(back, nxt);
  footer.append(nav);
  main.append(hero, cover, body, footer);
}
