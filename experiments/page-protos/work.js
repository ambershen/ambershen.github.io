// Work · reel: one project at a time on the pinned stage.
import {header} from './shared.js';
import {reel} from './reel.js';
import {projects} from '../../src/data/portfolio.js';
header('Work');
// One moving picture per project; kinds come from the labels already used on the Work page.
const media = {
  'natural-effects': {video: new URL('../../images/natural-expressions/water-demo.mp4', import.meta.url).href, poster: new URL('../../images/natural-expressions/water-demo.jpg', import.meta.url).href, tags: ['interactive materials', 'creative coding']},
  'soft-matter': {image: new URL('../../images/soft-matter/tangle.png', import.meta.url).href, contain: true, tags: ['material type', 'creative coding']},
  'live-visuals': {video: new URL('../../images/live-visuals/data-center-2036.mp4', import.meta.url).href, poster: new URL('../../images/live-visuals/data-center-2036.jpg', import.meta.url).href, tags: ['creative coding', '3D']},
  'sound-dictionaries': {tags: ['product design']},
  'deskmate': {tags: ['product design']},
  'printed-earrings': {image: new URL('../../images/printed-earrings/cover.jpg', import.meta.url).href, tags: ['arts & crafts']},
};
const seen = new Set();
const items = projects.filter(p => !seen.has(p.id) && seen.add(p.id)).map(p => {
  const m = media[p.id] || {};
  return {title: p.title, line: p.tagline, href: p.page || `/#work/${p.id}`, video: m.video || p.video, poster: m.poster || p.poster, image: m.image || p.image, contain: m.contain, tags: m.tags};
});
reel(document.querySelector('#page'), {heading: 'Selected work', items});
