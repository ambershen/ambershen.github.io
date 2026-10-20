import './case-study.css';
import {renderNav} from './site-nav.js';
import {caseStudies, caseStudySections} from './data/case-studies.js';
import {processFlow} from './diagrams/process-flow.js';

const slug = document.body.dataset.slug;
const study = caseStudies.find(s => s.slug === slug);
const main = document.querySelector('#case-study');
// ?embed: shown inside the Work page's slide-in panel, which has its own way back.
const embedded = new URLSearchParams(location.search).has('embed');
if (embedded) document.documentElement.classList.add('cs-embedded'); else document.body.prepend(renderNav('products'));

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const statusLabel = {draft: 'Draft', 'in-progress': 'In development', published: ''};

function media(item, alt) {
  if (item?.video) {
    const v = el('video', 'cs-media'); v.src = item.video; v.controls = true; v.playsInline = true; v.preload = 'metadata';
    if (item.poster) v.poster = item.poster; v.setAttribute('aria-label', alt); return v;
  }
  if (item?.image) { const i = el('img', 'cs-media'); i.src = item.image; i.alt = alt; return i; }
  if (item?.images) {
    const strip = el('div', 'cs-strip');
    item.images.forEach(src => { const i = el('img'); i.src = src; i.alt = ''; strip.append(i); });
    strip.setAttribute('role', 'img'); strip.setAttribute('aria-label', alt); return strip;
  }
  const ph = el('div', 'cs-media cs-media-placeholder');
  ph.append(el('span', '', item?.placeholder || 'Cover image or film — coming soon'));
  return ph;
}

// Content blocks for studies that define their own chapters.
function block(b) {
  if (typeof b === 'string') return el('p', '', b);
  if (b.lead) return el('p', 'cs-lead', b.lead);
  if (b.study) { const h = el('div', 'cs-study'); h.append(el('h3', '', b.study)); if (b.sub) h.append(el('span', '', b.sub)); return h; }
  if (b.note) { const n = el('aside', 'cs-note'); n.append(el('h3', '', b.note), el('p', '', b.text)); return n; }
  if (b.step) { const n = el('div', 'cs-step'); n.append(el('h3', '', b.step), el('p', '', b.text)); return n; }
  if (b.meta) return el('p', 'cs-meta', b.meta);
  if (b.link) {
    const n = el('aside', 'cs-callout'), a = el('a', '', `${b.link.label} ↗`);
    a.href = b.link.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    n.append(el('p', '', b.link.text), a); return n;
  }
  const fig = el('figure', 'cs-figure');
  if (b.diagram === 'process') fig.append(processFlow());
  else if (b.loops) { // muted ambient clips that play like moving photographs
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const grid = el('div', 'cs-loops');
    for (const l of b.loops) {
      const v = el('video', 'cs-media'); v.src = l.video; v.poster = l.poster;
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = !still; v.controls = still; v.preload = 'metadata';
      v.setAttribute('aria-label', b.caption); grid.append(v);
    }
    fig.append(grid);
  }
  else if (b.video) { const v = media({video: b.video, poster: b.poster}, b.caption); v.preload = 'none'; fig.append(v); }
  else fig.append(media({placeholder: b.placeholder}, ''));
  if (b.caption) fig.append(el('figcaption', '', b.caption));
  return fig;
}

if (!study) {
  main.append(el('h1', 'cs-title', 'Case study not found'), Object.assign(el('a', 'cs-back', '← All work'), {href: '/#work'}));
} else {
  document.title = `${study.title} — Amber Shen`;
  const hero = el('section', 'cs-hero');
  if (study.chapters) { // editorial layout: title, standfirst, then a credits strip
    main.classList.add('cs-editorial');
    const credits = el('dl', 'cs-credits');
    const credit = (term, value) => { const d = el('div'); d.append(el('dt', '', term)); const dd = el('dd'); dd.append(value); d.append(dd); credits.append(d); };
    credit('Year', study.year);
    credit('Medium', study.medium);
    if (statusLabel[study.status]) credit('Status', statusLabel[study.status]);
    if (study.links.length) {
      const f = document.createDocumentFragment();
      study.links.forEach(l => { const a = el('a', '', `${l.label} ↗`); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; f.append(a); });
      credit('Links', f);
    }
    hero.append(el('h1', 'cs-title', study.title), el('p', 'cs-tagline', study.tagline), credits);
  } else {
    const eyebrow = el('p', 'cs-eyebrow');
    eyebrow.append(el('span', '', `Case study · ${study.year}`));
    if (statusLabel[study.status]) eyebrow.append(el('span', 'cs-status', statusLabel[study.status]));
    hero.append(eyebrow, el('h1', 'cs-title', study.title), el('p', 'cs-tagline', study.tagline), el('p', 'cs-medium', study.medium));
  }
  const cover = el('figure', 'cs-cover');
  if (study.cover === false) cover.hidden = true; else cover.append(media(study.cover, study.title));

  const body = el('div', 'cs-body');
  const toc = el('nav', 'cs-toc'); toc.setAttribute('aria-label', 'Sections');
  const sections = el('div', 'cs-sections');
  if (study.chapters) for (const [i, ch] of study.chapters.entries()) {
    const id = `s-${ch.key}`;
    const a = el('a', '', ch.toc || ch.label); a.href = `#${id}`; toc.append(a);
    const sec = el('section', 'cs-section'); sec.id = id;
    sec.append(el('p', 'cs-num', String(i + 1).padStart(2, '0')), el('h2', ch.label.length > 60 ? 'cs-h2-question' : '', ch.label));
    for (const b of ch.blocks) sec.append(block(b));
    sections.append(sec);
  }
  else for (const [i, s] of caseStudySections.entries()) {
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
  const listed = caseStudies.filter(s => s.listed !== false), idx = listed.indexOf(study);
  const next = listed.length > 1 && idx >= 0 ? listed[(idx + 1) % listed.length] : null;
  const back = el('a', 'cs-back', '← All work'); back.href = '/#work';
  if (embedded) back.onclick = e => { e.preventDefault(); parent.postMessage({type: 'case-close'}, location.origin); };
  const nav = el('div', 'cs-pager'); nav.append(back);
  if (next) {
    const nxt = el('a', 'cs-next'); nxt.href = `/work/${next.slug}/`;
    nxt.append(el('span', '', 'Next case study'), el('strong', '', `${next.title} →`));
    nav.append(nxt);
  }
  footer.append(nav);
  main.append(hero, cover, body, footer);
}
