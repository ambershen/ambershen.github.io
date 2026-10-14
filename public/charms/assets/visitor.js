// Visitor scene rendering, shared by the studio app and the static badge build.
import { SCENE_FIELDS } from './scenes.js';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Pixel sprites: one string per row; X is the sprite color, h a highlight, d a shade, . is empty.
const SPRITES = {
  heart: ['.XX.XX.', 'XhXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  diamond: ['...X...', '..XhX..', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  spade: ['...X...', '..XXX..', '.XhXXX.', 'XXXXXXX', 'XXXXXXX', '.XX.XX.', '...X...', '..XXX..'],
  star: ['...X...', '...X...', '..XhX..', 'XXXXXXX', '..XXX..', '...X...', '...X...'],
  moon: ['..XXXX..', '.XXh....', 'XXX.....', 'XXX.....', 'XXX.....', 'XXX.....', '.XXX....', '..XXXX..'],
  arrow: ['...X..', '....X.', 'XXXXXX', '....X.', '...X..'],
  pencil: ['.....hX', '....XXX', '...XXX.', '..XXX..', '.XXX...', 'XXX....', 'X......'],
  bulb: ['..ddddd..', '.dhhXXXd.', 'dhhXXXXXd', 'dhXXXXXXd', 'dXXXXXXXd', '.dXXXXXd.', '..dXXXd..', '...dXd...', '..ddddd..', '..dXXXd..', '..ddddd..', '...ddd...'],
  x: ['XX......X', '.XX....X.', '..XX..X..', '...XXX...', '...XXX...', '..X..XX..', '.X....XX.', 'X......XX'],
  github: ['.X.....X.', '.XX...XX.', '.XXXXXXX.', 'XXXXXXXXX', 'XX.XXX.XX', 'XXXXXXXXX', '.XXXXXXX.', '..X...X..', '..XX.XX..'],
  instagram: ['.XXXXXXX.', 'X......XX', 'X.......X', 'X..XXX..X', 'X.X...X.X', 'X.X...X.X', 'X..XXX..X', 'X.......X', '.XXXXXXX.'],
  youtube: ['.XXXXXXX.', 'XXX.XXXXX', 'XXX..XXXX', 'XXX...XXX', 'XXX..XXXX', 'XXX.XXXXX', '.XXXXXXX.'],
  globe: ['..XXXXX..', '.X..X..X.', 'X..X.X..X', 'XXXXXXXXX', 'X..X.X..X', 'X..X.X..X', 'XXXXXXXXX', '.X..X..X.', '..XXXXX..'],
  chip: ['..XXXXX..', '.XhXXXhX.', 'XXXXXXXXX', 'XhXhhhXhX', 'XXXhXhXXX', 'XhXhhhXhX', 'XXXXXXXXX', '.XhXXXhX.', '..XXXXX..'],
  zz: ['XXX.....', '..X.....', '.X..XXXX', 'XXX...X.', '.....X..', '....XXXX']
};
// The badge hardware: a silver clip and ring, with a heart and a star charm on little chains.
SPRITES.hardware = (() => {
  const grid = Array.from({ length: 36 }, () => Array(33).fill('.'));
  const stamp = (rows, ox, oy) => rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== '.') grid[oy + y][ox + x] = c; }));
  const chain = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) grid[Math.round(y0 + (y1 - y0) * i / n)][Math.round(x0 + (x1 - x0) * i / n)] = i % 2 ? 'h' : 'd'; };
  chain(16, 15, 16, 35); chain(15, 15, 5, 25); chain(17, 15, 27, 23);
  stamp(['..dddddddd..', '.dhhhhhhhhd.', '.dhXXXXXXhd.', '.dhXXXXXXXd.', '.dhXXXXXXXd.', '.dhXXXXXXXd.', '.dXXXXXXXXd.', '.dXXXXXXXXd.', '..dddddddd..', '....dXXd....', '...d....d...', '..d......d..', '..d......d..', '...d....d...', '....dddd....'], 10, 0);
  stamp(['.dd...dd.', 'dhhd.dXXd', 'dhXXdXXXd', 'dXXXXXXXd', '.dXXXXXd.', '..dXXXd..', '...dXd...', '....d....'], 1, 24);
  stamp(['....d....', '...dhd...', 'dddhXXddd', 'dhXXXXXXd', '.dXXXXXd.', '..dXXXd..', '.dXXdXXd.', '.dXd.dXd.', '.dd...dd.'], 23, 22);
  return grid.map(row => row.join(''));
})();
export const sprite = (name, cls = '') => {
  const rows = SPRITES[name];
  const px = rows.flatMap((row, y) => [...row].map((c, x) => c === '.' ? '' : `<rect x="${x}" y="${y}" width="1.02" height="1.02"${c === 'h' ? ' class="px-h"' : c === 'd' ? ' class="px-d"' : ''}/>`)).join('');
  return `<svg class="sprite ${cls}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${px}</svg>`;
};
const linkIcon = url => {
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  return { 'x.com': 'x', 'twitter.com': 'x', 'github.com': 'github', 'instagram.com': 'instagram', 'youtube.com': 'youtube', 'm.youtube.com': 'youtube', 'youtu.be': 'youtube' }[host] || 'globe';
};
export function scenePage(scene, { paused = false, preview = false } = {}) {
  if (paused) return `<div class="visitor theme-rose paused-page"><div class="paused-moon" aria-hidden="true">${sprite('moon')}${sprite('zz', 'zz')}</div><p class="eyebrow">TAKING A LITTLE BREAK</p><h1>A hello for <em>another time.</em></h1><p>This charm is resting for now. Thanks for stopping by.</p></div>`;
  const kind = Object.hasOwn(SCENE_FIELDS, scene.kind) ? scene.kind : 'everyday';
  if (kind === 'afterhours') return afterHoursPage(scene, preview);
  if (kind === 'creative') return creativePage(scene, preview);
  const field = ([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`;
  const based = scene.details?.based;
  const fields = [...(scene.bio ? [['About', scene.bio]] : []), ...SCENE_FIELDS.everyday.filter(f => f.key !== 'based' && scene.details?.[f.key]).map(f => [f.label, scene.details[f.key]])];
  const links = scene.links.map(l => preview ? `<span class="id-link" title="${escape(l.label)}">${sprite(linkIcon(l.url))}</span>` : `<a class="id-link" href="${escape(l.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(l.label)}" title="${escape(l.label)}">${sprite(linkIcon(l.url))}</a>`).join('');
  return `<div class="visitor scene-everyday theme-${escape(scene.theme)}">
    <header class="visitor-top"><span>A LITTLE MORE ME</span><span>TAP · SAY HELLO</span></header>
    <div class="badge">
      <div class="badge-swing">
      ${sprite('hardware', 'badge-hw')}
      <div class="badge-sleeve">
        <span class="sleeve-holes" aria-hidden="true"><i></i><b></b><i></i></span>
        <article class="id-card">
          <span class="id-no">Nº 001</span>
          <h1>${escape(scene.title)}</h1>
          <p class="id-sub"><span>${escape(scene.eyebrow || 'A little introduction')}</span>${sprite('heart')}</p>
          <div class="id-mid">
            <img class="id-photo" src="../assets/portrait.jpg" alt="Portrait of the charm’s owner" width="600" height="800">
            <div class="id-aside">
              ${based ? `<dl class="id-fields">${field(['Based in', based])}</dl>` : ''}
            </div>
          </div>
          ${fields.length ? `<dl class="id-fields">${fields.map(field).join('')}</dl>` : ''}
          ${links ? `<nav class="id-links" aria-label="Links"><span>Find me</span>${links}</nav>` : ''}
          <footer class="id-foot"><p>The holder of this card is an official friend-in-progress. Tap to say hello.</p><span class="id-code">HI-001</span></footer>
        </article>
      </div>
      </div>
    </div>
  </div>`;
}
function creativePage(scene, preview) {
  const address = url => { try { const u = new URL(url); return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, ''); } catch { return ''; } };
  const count = String(scene.links.length).padStart(2, '0');
  // Each link is a file folder; opening one (only one at a time) reveals the sheet inside.
  const folders = scene.links.map((l, i) => `<details class="folder f-${i % 5}" name="idea-files">
      <summary><span class="folder-tab">${sprite(linkIcon(l.url))}<span>${escape(l.label)}</span></span></summary>
      <div class="folder-sheet"><span class="sheet-no">File ${String(i + 1).padStart(2, '0')} / ${count}</span>${sprite(linkIcon(l.url), 'sheet-icon')}<p class="sheet-address">${escape(address(l.url))}</p>${preview ? '<span class="sheet-open">Open file ↗</span>' : `<a class="sheet-open" href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">Open ${escape(l.label)} ↗</a>`}</div>
    </details>`).join('');
  return `<div class="visitor scene-creative theme-${escape(scene.theme)}">
    <header class="visitor-top"><span>ISSUE Nº 01</span><span class="cr-status"><i></i>ON THE WORKBENCH</span></header>
    <div class="cr-mast"><h1>Idea<br>Lab</h1>${sprite('bulb', 'cr-bulb')}</div>
    <p class="cr-dek"><em>psst — you found my little idea lab.</em> Pull a file to see what’s inside.</p>
    ${folders ? `<nav class="cr-files" aria-label="Links">${folders}</nav>` : `<p class="cr-empty">The files are being sorted. Come back soon.</p>`}
  </div>`;
}
// Each quiz round is a hand of blackjack: two answers dealt as an ace and a king of one suit.
const ROUNDS = { zodiac: ['diamond', 'Zodiac'], mbti: ['spade', 'MBTI'], drink: ['heart', 'Drink'] };
const cardFace = (rank, suit) => `<span class="card-index">${rank}${sprite(suit)}</span>`;
const isInstagram = url => { try { return ['instagram.com', 'www.instagram.com'].includes(new URL(url).hostname); } catch { return false; } };
function afterHoursPage(scene, preview) {
  // The studio already knows the answers, so its preview grades locally: choice "a", "b", "a" are correct.
  const previewQuestions = [
    { id: 'zodiac', prompt: 'What’s my zodiac sign?', choices: [{ id: 'a', label: scene.details?.zodiac || 'Your zodiac sign' }, { id: 'b', label: scene.details?.zodiac === 'Libra' ? 'Leo' : 'Libra' }] },
    { id: 'mbti', prompt: 'What’s my MBTI?', choices: [{ id: 'a', label: scene.details?.mbti === 'INTJ' ? 'INFP' : 'INTJ' }, { id: 'b', label: scene.details?.mbti || 'Your MBTI' }] },
    { id: 'drink', prompt: 'What’s my go-to drink?', choices: [{ id: 'a', label: scene.details?.drink || 'Your favorite drink' }, { id: 'b', label: scene.details?.drink === 'Negroni' ? 'Margarita' : 'Negroni' }] }
  ];
  const quiz = preview ? { ready: true, questions: previewQuestions } : scene.quiz;
  // Previews sit inside the editor form, so they use a div rather than a nested form.
  const tag = preview ? 'div' : 'form';
  const attrs = preview ? `data-preview="true" data-preview-links="${escape(JSON.stringify(scene.links.filter(l => isInstagram(l.url)).map(l => l.label)))}"` : `data-token="${escape(quiz?.token)}"`;
  return `<div class="visitor scene-afterhours theme-${escape(scene.theme)}">
    <header class="visitor-top"><span>${sprite('spade')} AFTER HOURS TABLE</span><span>NO LIMIT ${sprite('heart')}</span></header>
    <div class="ah-shoe" aria-hidden="true"><span class="card-back"></span><span class="card-back"></span><span class="card-back"></span>${sprite('chip', 'ah-shoe-chip')}</div>
    ${scene.eyebrow ? `<p class="eyebrow">${escape(scene.eyebrow)}</p>` : ''}
    <h1>${escape(scene.title)}</h1>
    ${scene.bio ? `<p class="visitor-bio">${escape(scene.bio)}</p>` : ''}
    <svg class="ah-arc" viewBox="0 0 320 70" aria-hidden="true"><path id="ah-arc-path" d="M14 62 Q160 -4 306 62" fill="none"/><text><textPath href="#ah-arc-path" startOffset="50%" text-anchor="middle">PICK RIGHT TWICE · INSTAGRAM PAYS</textPath></text></svg>
    <p class="ah-riddle">Three hands, two cards each. <em>Bet on the one that’s really me.</em></p>
    <div class="quiz-body">${quiz?.ready ? `<${tag} class="chemistry-quiz" ${attrs}>
      <div class="ah-progress">${quiz.questions.map((q, i) => `<button type="button" class="ah-dot ${i ? '' : 'current'}" data-quiz-step="${i}" aria-label="Hand ${i + 1}" ${i ? 'disabled' : ''}>${sprite('chip')}</button>`).join('')}</div>
      ${quiz.questions.map((q, i) => { const [suit, topic] = ROUNDS[q.id] || ['star', 'Mystery']; return `<fieldset class="quiz-question" data-step="${i}" tabindex="-1" ${i ? 'hidden' : ''}><legend><span class="ah-round">Hand ${i + 1} of 3 · ${topic}</span><span class="ah-prompt">${escape(q.prompt)}</span></legend><div class="ah-box"><span class="ah-box-label">Place your bet</span><div class="quiz-options">${q.choices.map((c, j) => { const rank = j === 0 ? 'A' : 'K'; return `<label class="quiz-option"><input type="radio" name="${escape(q.id)}" value="${escape(c.id)}" required><span class="card"><span class="card-back"></span><span class="card-face suit-${suit}">${cardFace(rank, suit)}${sprite(suit, 'card-pip')}<span class="ah-choice">${escape(c.label)}</span>${cardFace(rank, suit).replace('card-index', 'card-index flip')}</span></span>${sprite('chip', 'card-chip')}</label>`; }).join('')}</div></div></fieldset>`; }).join('')}
      <button type="${preview ? 'button' : 'submit'}" class="quiz-submit" ${preview ? 'data-preview-reveal' : ''} hidden>Reveal the hand ${sprite('chip')}</button>${preview ? '' : '<p class="quiz-error" role="alert"></p>'}</${tag}>` : '<p class="quiz-unavailable">The dealer is still shuffling. Come back soon.</p>'}</div>
  </div>`;
}
// The result shows how many were right, never which ones.
export function quizResult({ score, passed, links = [] }, preview) {
  const hand = [0, 1, 2].map(i => i < score ? `<span class="card-face suit-heart">${cardFace('A', 'heart')}${sprite('heart', 'card-pip')}</span>` : '<span class="card-back"></span>').join('');
  const [eyebrow, title, line] = score === 3 ? ['THREE FOR THREE', 'Blackjack.', 'Okay, you really get me. Consider this an invitation to part two.']
    : passed ? ['DEALER BUSTS', 'You win this hand.', 'Close enough to count. Consider this an invitation to part two.']
    : ['DEALER STANDS', 'Bust.', 'Two right picks pay out. The deck reshuffles every round.'];
  const payout = links.map(l => preview ? `<span class="visitor-link quiz-instagram"><span class="link-label">${escape(l.label)}</span>${sprite('arrow')}</span>` : `<a class="visitor-link quiz-instagram" href="${escape(l.url)}" target="_blank" rel="noopener noreferrer"><span class="link-label">${escape(l.label)}</span>${sprite('arrow')}</a>`).join('');
  return `<section class="quiz-result ${passed ? 'passed' : 'failed'}" tabindex="-1"><div class="ah-hand" aria-hidden="true">${hand}</div><div class="quiz-score">${score}<span>/ 3</span></div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2><p>${line}</p>${passed ? (payout ? `<div class="visitor-links">${payout}</div>` : '') : `<button class="quiz-submit" type="button" data-retry-quiz${preview ? ' data-preview-retry' : ''}>Deal me in again ${sprite('chip')}</button>`}${preview ? '<p class="quiz-preview-note">Studio preview · visitors get the real link</p>' : ''}</section>`;
}
// A tap on the hanging badge, outside its links, gives it a little push.
export function enableBadgeNudge() {
  document.addEventListener('pointerdown', e => {
    const swing = e.target.closest('.public-page .badge-swing');
    if (!swing || e.target.closest('a')) return;
    swing.classList.remove('nudge'); void swing.offsetWidth; swing.classList.add('nudge');
  });
}
