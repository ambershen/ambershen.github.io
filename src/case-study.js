import {loadPortfolio} from './data/portfolio-cloud.js';
import {naturalTile} from './natural-play.js';
import {resolveCatalog} from './data/catalog-assets.js';
import './case-study.css';
import './case-study-light.css';
import {renderNav} from './site-nav.js';
import {caseStudies, caseStudySections} from './data/case-studies.js';
import {processFlow} from './diagrams/process-flow.js';

const slug = document.body.dataset.slug;
const localPreview = import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'local';
const catalog = localPreview ? null : await loadPortfolio();
const study = resolveCatalog(catalog ? catalog.case_studies.find(row => row.payload.slug === slug)?.payload : caseStudies.find(s => s.slug === slug));
const main = document.querySelector('#case-study');
// ?embed: shown inside the Work page's slide-in panel, which has its own way back.
const embedded = new URLSearchParams(location.search).has('embed');
// Work in progress shows only in `npm run dev`: the live site skips drafts,
// empty sections and "coming soon" placeholders.
const editing = import.meta.env.DEV;
if (study?.status === 'draft' && !editing) location.replace('/#work');
if (embedded) document.documentElement.classList.add('cs-embedded'); else document.body.prepend(renderNav('products'));

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const statusLabel = {draft: 'Draft', 'in-progress': 'In development', published: ''};

function media(item, alt) {
  if (item?.video) {
    const v = el('video', 'cs-media'); v.src = item.video; v.controls = true; v.playsInline = true; v.preload = 'none';
    if (item.poster) v.poster = item.poster; v.setAttribute('aria-label', alt); return v;
  }
  if (item?.image) { const i = el('img', 'cs-media'); i.src = item.image; i.alt = alt; i.loading = 'lazy'; i.decoding = 'async'; return i; }
  if (item?.images) {
    const strip = el('div', 'cs-strip');
    item.images.forEach(src => { const i = el('img'); i.src = src; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async'; strip.append(i); });
    strip.setAttribute('role', 'img'); strip.setAttribute('aria-label', alt); return strip;
  }
  const ph = el('div', 'cs-media cs-media-placeholder');
  ph.append(el('span', '', item?.placeholder || 'Cover image or film — coming soon'));
  return ph;
}

// Drafts and ambient clips play like GIFs: muted, looping, only while on screen.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loopWatcher = 'IntersectionObserver' in window && !still ? new IntersectionObserver(entries => {
  for (const entry of entries) entry.isIntersecting ? entry.target.play().catch(() => {}) : entry.target.pause();
}, {rootMargin: '200px 0px'}) : null;
function loop(src, poster, label) {
  const v = el('video', 'cs-media cs-loop'); v.src = src; if (poster) v.poster = poster;
  v.muted = true; v.setAttribute('muted', ''); v.loop = true; v.playsInline = true; v.preload = 'none';
  v.setAttribute('aria-label', label);
  if (loopWatcher) loopWatcher.observe(v); else v.controls = true;
  return v;
}

// Size a player from its poster so recordings keep their own proportions.
function fitToPoster(v) {
  if (!v.poster) return;
  const probe = new Image();
  probe.onload = () => { v.style.aspectRatio = `${probe.naturalWidth} / ${probe.naturalHeight}`; };
  probe.src = v.poster;
}

// Content blocks for studies that define their own chapters.
function block(b) {
  if (typeof b === 'string') return el('p', '', b);
  if (b.applications) {
    const grid = el('div', 'cs-applications');
    for (const application of b.applications) {
      const figure = el('figure', 'cs-application');
      const frame = el('div', 'cs-application-crop');
      frame.style.aspectRatio = `${application.cropWidth} / ${application.cropHeight}`;
      const image = el('img');
      image.src = application.image; image.alt = application.title;
      image.loading = 'lazy'; image.decoding = 'async';
      image.style.top = `${-application.cropTop / application.cropHeight * 100}%`;
      image.style.left = `${-application.cropLeft / application.cropWidth * 100}%`;
      image.style.width = `${1280 / application.cropWidth * 100}%`;
      frame.append(image);
      figure.append(frame); grid.append(figure);
    }
    return grid;
  }
  if (b.specimens) {
    const grid=el('div',b.compact?'cs-specimens is-compact':'cs-specimens');
    for(const specimen of b.specimens){
      const figure=el('figure','cs-specimen');const image=el('img');image.src=specimen.image;image.alt=`${specimen.title}: Soft Matter rendered in ${specimen.kind.toLowerCase()}`;image.loading='lazy';
      const caption=el('figcaption');caption.append(el('p','cs-block-label',specimen.kind),el('h3','',specimen.title));
      if(!b.compact)caption.append(el('p','',specimen.text));
      figure.append(image,caption);grid.append(figure);
    }
    return grid;
  }
  if (b.lead) return el('p', 'cs-lead', b.lead);
  if (b.study) { const h = el('div', 'cs-study'); h.append(el('h3', '', b.study)); if (b.sub) h.append(el('span', '', b.sub)); return h; }
  if (b.note) { const n = el('aside', 'cs-note'); n.append(el('h3', '', b.note), el('p', '', b.text)); return n; }
  if (b.step) { const n = el('div', 'cs-step'); n.append(el('h3', '', b.step), el('p', '', b.text)); return n; }
  if (b.meta) return el('p', 'cs-meta', b.meta);
  if (b.context) {
    const context = el('div', 'cs-context');
    context.append(el('h3', '', b.context.title));
    for (const paragraph of b.context.paragraphs) context.append(el('p', '', paragraph));
    const references = el('nav', 'cs-references'); references.setAttribute('aria-label', `${b.context.title}: references`);
    references.append(el('span', '', 'References'));
    for (const reference of b.context.references) {
      const link = el('a', '', reference.label);
      link.href = reference.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      references.append(link);
    }
    context.append(references);
    return context;
  }
  if (b.experience) {
    const experience = b.experience;
    const group = el('div', 'cs-experience');
    group.append(el('h3', 'cs-block-label', experience.label));
    const figure = el('figure', 'cs-figure');
    const video = media(experience, experience.caption); video.preload = 'none'; fitToPoster(video);
    figure.append(video, el('figcaption', '', experience.caption));
    const actions = el('ol', 'cs-actions');
    for (const [i, action] of experience.actions.entries()) {
      const item = el('li');
      item.append(el('span', 'cs-action-index', String(i + 1).padStart(2, '0')));
      if (action.phase) item.append(el('span', 'cs-action-phase', action.phase));
      item.append(el('h4', '', action.title), el('p', '', action.text));
      actions.append(item);
    }
    group.append(figure, actions);
    if (experience.link) {
      const link = el('a', 'cs-try', experience.link.label);
      link.href = experience.link.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      group.append(link);
    }
    return group;
  }
  if (b.development) {
    const development = b.development;
    const group = el('div', 'cs-development');
    group.append(el('p', 'cs-block-label', 'The process'), el('h3', 'cs-development-title', development.title), el('p', 'cs-development-intro', development.intro));
    const stages = el('ol', 'cs-development-stages');
    for (const stage of development.stages) {
      const item = el('li');
      const text = el('div', 'cs-stage-text');
      text.append(el('h4', '', stage.title), el('p', '', stage.text));
      item.append(text);
      if (stage.media?.video) { // a draft beside the step it documents
        item.classList.add('has-media');
        const figure = el('figure', 'cs-stage-media');
        figure.append(loop(stage.media.video, stage.media.poster, stage.media.caption || stage.title));
        if (stage.media.caption) figure.append(el('figcaption', '', stage.media.caption));
        item.append(figure);
      } else if (stage.media) item.append(block(stage.media));
      stages.append(item);
    }
    group.append(stages);
    if (development.decision) {
      const decision = development.decision;
      const aside = el('aside', 'cs-decision');
      if (decision.label) aside.append(el('p', 'cs-block-label', decision.label));
      aside.append(el('h4', '', decision.title), el('p', '', decision.text));
      group.append(aside);
    }
    return group;
  }
  if (b.interaction) {
    const flow = el('dl', 'cs-interaction');
    for (const [key, label] of [['input', 'Input'], ['mapping', 'Translation'], ['output', 'Response']]) {
      const item = el('div');
      item.append(el('dt', '', label), el('dd', '', b.interaction[key]));
      flow.append(item);
    }
    return flow;
  }
  if (b.link) {
    const n = el('aside', 'cs-callout'), a = el('a', '', `${b.link.label}`);
    a.href = b.link.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    n.append(el('p', '', b.link.text), a);
    if (b.link.more) { const m = el('a', '', b.link.more.label); m.href = b.link.more.url; m.target = '_blank'; m.rel = 'noopener noreferrer'; n.append(m); }
    return n;
  }
  const fig = el('figure', 'cs-figure');
  if (b.diagram === 'process') fig.append(processFlow());
  else if (b.loops) { // muted ambient clips that play like moving photographs
    const grid = el('div', 'cs-loops');
    for (const l of b.loops) grid.append(loop(l.video, l.poster, b.caption));
    fig.append(grid);
  }
  else if (b.image) fig.append(media({image:b.image},b.caption||''));
  else if (b.video) { const v = media({video: b.video, poster: b.poster}, b.caption); v.preload = 'none'; fig.append(v); }
  else if (editing) fig.append(media({placeholder: b.placeholder}, ''));
  else return null;
  if (b.caption) fig.append(el('figcaption', '', b.caption));
  return fig;
}

if (!study) {
  main.append(el('h1', 'cs-title', 'Case study not found'), Object.assign(el('a', 'cs-back', 'All work'), {href: '/#work'}));
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
      study.links.forEach(l => { const a = el('a', '', `${l.label}`); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; f.append(a); });
      credit('Links', f);
    }
    hero.append(el('h1', 'cs-title', study.title));
    if (study.tagline) hero.append(el('p', 'cs-tagline', study.tagline));
    if (study.links[0]) { // the live demo, where a reader looks first
      const demo = el('a', 'cs-demo', study.links[0].label); demo.href = study.links[0].url; demo.target = '_blank'; demo.rel = 'noopener noreferrer';
      hero.append(demo);
    }
    if (study.opening) {
      const opening = el('section', 'cs-opening'); opening.id = 's-origins';
      opening.append(el('h2', '', study.opening.title));
      for (const item of study.opening.blocks) {
        const content = block(item); if (content) opening.append(content);
      }
      hero.append(opening);
    }
    if (study.materials) {
      const materials = el('nav', 'cs-materials');
      materials.setAttribute('aria-label', 'Explore the three materials');
      for (const [i, material] of study.materials.entries()) {
        const link = el('a', 'cs-material'); link.href = `#s-${material.id}`;
        link.append(naturalTile(material.id, material.title), el('span', 'cs-material-kind', `${String(i + 1).padStart(2, '0')} / ${material.kind}`), el('h2', '', material.title), el('p', '', `${material.interaction}`));
        materials.append(link);
      }
      hero.append(materials);
    }
    hero.append(credits);
  } else {
    const eyebrow = el('p', 'cs-eyebrow');
    eyebrow.append(el('span', '', `Case study · ${study.year}`));
    if (statusLabel[study.status]) eyebrow.append(el('span', 'cs-status', statusLabel[study.status]));
    hero.append(eyebrow, el('h1', 'cs-title', study.title), el('p', 'cs-tagline', study.tagline), el('p', 'cs-medium', study.medium));
  }
  const cover = el('figure', 'cs-cover');
  if (study.cover === false || (!editing && !(study.cover?.video || study.cover?.image || study.cover?.images))) cover.hidden = true; else cover.append(media(study.cover, study.title));

  const body = el('div', 'cs-body');
  const toc = el('nav', 'cs-toc'); toc.setAttribute('aria-label', 'Sections');
  if (study.opening) {
    const beginning = el('a', '', study.opening.toc || 'The starting point'); beginning.href = '#s-origins'; toc.append(beginning);
  }
  const sections = el('div', 'cs-sections');
  // Studies with materials read as parts: one per material, then the reusable skills.
  const isPart = ch => ch.material || (study.materials && ch.key === 'tools');
  const hasParts = study.chapters?.some(isPart);
  let partCount = 0, lastSection = null, lastWasPart = false;
  if (study.chapters) for (const [i, ch] of study.chapters.entries()) {
    const id = `s-${ch.key}`;
    if (hasParts && ch.key === 'implementation' && lastWasPart) { // the build notes close the skills part
      const appendix = el('div', 'cs-appendix'); appendix.id = id;
      appendix.append(el('h3', 'cs-block-label', ch.label));
      for (const b of ch.blocks) { const n = block(b); if (n) appendix.append(n); }
      lastSection.append(appendix);
      continue;
    }
    const part = isPart(ch);
    const a = el('a', part ? 'is-part' : '', ch.toc || ch.label); a.href = `#${id}`; toc.append(a);
    const sec = el('section', ['cs-section', ch.material && 'cs-material-chapter', part && 'cs-part'].filter(Boolean).join(' ')); sec.id = id;
    if (part) {
      partCount += 1;
      const kind = study.materials?.find(m => m.id === ch.key)?.kind || ch.toc;
      const label = el('p', 'cs-part-label');
      label.append(el('span', '', `Part ${String(partCount).padStart(2, '0')}`));
      if (kind) label.append(el('span', '', kind));
      sec.append(label, el('h2', ch.label.length > 24 ? 'cs-part-title is-long' : 'cs-part-title', ch.label));
    } else {
      if (!hasParts) sec.append(el('p', 'cs-num', String(i + 1).padStart(2, '0')));
      sec.append(el('h2', ch.label.length > 60 ? 'cs-h2-question' : '', ch.label));
    }
    for (const b of ch.blocks) { const n = block(b); if (n) sec.append(n); }
    sections.append(sec);
    lastSection = sec; lastWasPart = part;
  }
  else for (const s of caseStudySections.filter(s => editing || study.sections[s.key] || (s.key === 'process' && study.gallery.length))) {
    const i = toc.children.length;
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
    study.links.forEach(l => { const a = el('a', '', `${l.label}`); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; links.append(a); });
    footer.append(links);
  }
  const listed = caseStudies.filter(s => s.listed !== false), idx = listed.indexOf(study);
  const next = listed.length > 1 && idx >= 0 ? listed[(idx + 1) % listed.length] : null;
  const back = el('a', 'cs-back', 'All work'); back.href = '/#work';
  if (embedded) back.onclick = e => { e.preventDefault(); parent.postMessage({type: 'case-close'}, location.origin); };
  const nav = el('div', 'cs-pager'); nav.append(back);
  if (next) {
    const nxt = el('a', 'cs-next'); nxt.href = `/work/${next.slug}/`;
    nxt.append(el('span', '', 'Next case study'), el('strong', '', `${next.title}`));
    nav.append(nxt);
  }
  footer.append(nav);
  main.append(hero, cover, body, footer);
  // Chapters are rendered after navigation; honor deep links once they exist.
  const scrollToChapter = () => {
    if (location.hash.startsWith('#s-')) document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior: 'instant'});
  };
  requestAnimationFrame(scrollToChapter);
  if (document.readyState !== 'complete') addEventListener('load', scrollToChapter, {once: true});

  // Keep the reader's place in the table of contents.
  const tocLinks = [...toc.querySelectorAll('a')];
  const targets = tocLinks.map(link => document.getElementById(link.hash.slice(1)));
  let pending = false;
  const markCurrent = () => {
    pending = false;
    let current = -1;
    targets.forEach((target, i) => { if (target && target.getBoundingClientRect().top < innerHeight * .35) current = i; });
    tocLinks.forEach((link, i) => link.classList.toggle('is-current', i === current));
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(markCurrent); } }, {passive: true});
  markCurrent();
}
