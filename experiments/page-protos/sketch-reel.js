// Sketchbook · reel: one piece at a time on the pinned stage.
import {header} from './shared.js';
import {reel} from './reel.js';
import {items as sketches, sketchGroups} from '../../src/data/portfolio.js';
import {videoPoster} from '../../src/data/video-posters.js';
header('Sketchbook');
const group = id => sketchGroups.find(g => g.id === id)?.title.toLowerCase();
const items = sketches.map(s => ({title: s.title, line: s.exploration || s.description, video: s.video, poster: s.poster || (s.video && videoPoster(s.video)), image: s.image, contain: true, href: '/#sketchbook', tags: [group(s.theme)].filter(Boolean)}));
reel(document.querySelector('#page'), {heading: 'Sketchbook', intro: 'An ongoing collection of visual experiments, typography, and ways of seeing.', items});
