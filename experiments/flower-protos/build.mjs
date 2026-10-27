// Writes a.html, b.html and c.html from template.html. Run: node experiments/flower-protos/build.mjs
import {readFileSync, writeFileSync} from 'fs';
const dir = new URL('.', import.meta.url);
const template = readFileSync(new URL('template.html', dir), 'utf8');
const socials = `You can find me on <a href="https://x.com/whosamberella" target="_blank" rel="noopener noreferrer">X</a>, <a href="https://instagram.com/whosamberella" target="_blank" rel="noopener noreferrer">Instagram</a>, <a href="https://www.youtube.com/@whosamberella" target="_blank" rel="noopener noreferrer">YouTube</a>, <a href="https://github.com/ambershen" target="_blank" rel="noopener noreferrer">GitHub</a>, or just browse some of <a href="#selected-work" data-jump="work">my featured work</a>.`;
const notes = {bloom: 'A breeze through the petals', art: 'Brush the flower into fragments', narrative: 'Draw the flower in pencil', code: 'Float the petals and let them return', chaos: 'Let the petals fall to find me', play: 'Wipe the mist from my portrait'};
const step = (mode, html, n) => `      <li class="proto-step" data-mode="${mode}"><span class="proto-step-n">0${n}</span>${html}<span class="proto-step-note">${notes[mode]}</span></li>`;
const extra = {
  A: `    <p class="proto-caption" hidden><b></b><span></span><i></i></p>`,
  B: `    <ol class="proto-steps">
${step('bloom', '<h2>Hi, I’m Amber.<br>I like making things <button class="proto-word">bloom</button>.</h2>', 1)}
${step('art', '<p>Somewhere between <button class="proto-word">art</button>,</p>', 2)}
${step('narrative', '<p><button class="proto-word">narrative</button>,</p>', 3)}
${step('code', '<p><button class="proto-word">code</button>,</p>', 4)}
${step('chaos', '<p>and a little <button class="proto-word">chaos</button>.</p>', 5)}
${step('play', '<p>I turn curious ideas into things you can <button class="proto-word">play with</button>.</p><p class="proto-social">' + socials + '</p>', 6)}
    </ol>`,
  C: `    <h2 class="proto-c-title">Hi, I’m Amber.<br>I like making things bloom.</h2>
    <div class="proto-viewer"><p class="proto-plate-label"></p><div class="proto-plates" role="group" aria-label="Flower effects"></div></div>`,
};
const hints = {bloom: 'Brush the petals', art: 'Tap or brush to scatter', narrative: 'Draw over the flower', code: 'Touch a petal, then drag', chaos: 'Brush the petals to find me', play: 'Wipe the mist', work: 'Move across the water'};
const dstep = (mode, label, html) => `      <section class="d-step" data-mode="${mode}" data-label="${label}">${html}</section>`;
extra.D = `    <div class="d-wrap">
    <div class="d-stage"><canvas class="d-water" aria-hidden="true"></canvas><div class="d-stickers" aria-hidden="true"></div><nav class="d-links" aria-label="Selected work"></nav><nav class="d-ticks" aria-label="Chapters"></nav></div>
    <div class="d-track">
${dstep('bloom', 'bloom', '<h2>Hi, I’m Amber.<br>I like making things <button class="proto-word">bloom</button>.</h2>', 1)}
${dstep('art', 'art', '<p>Somewhere between <button class="proto-word">art</button>,</p>', 2)}
${dstep('narrative', 'narrative', '<p><button class="proto-word">narrative</button>,</p>', 3)}
${dstep('code', 'code', '<p><button class="proto-word">code</button>,</p>', 4)}
${dstep('chaos', 'chaos', '<p>and a little <button class="proto-word">chaos</button>.</p>', 5)}
${dstep('play', 'play with', '<p>I turn curious ideas into things you can <button class="proto-word">play with</button>.</p><p class="proto-social">' + socials + '</p>', 6)}
${dstep('work', 'work', '<p id="selected-work">Selected work</p>', 7)}
    </div>
    </div>`;
for (const letter of ['A', 'B', 'C', 'D']) {
  const page = template.replaceAll('%LETTER%', letter).replaceAll('%LETTER_LOWER%', letter.toLowerCase())
    .replaceAll('%HIDDEN%', letter === 'A' ? '' : ' hidden').replace('%EXTRA%', extra[letter]);
  writeFileSync(new URL(`${letter.toLowerCase()}.html`, dir), page);
}
