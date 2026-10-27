// C · Specimen viewer: one flower, six plates. Left alone it tours the effects by itself, with a
// ghost brush sweeping the flower so each one shows; any real touch pauses the tour.
import {modes, choose, whenReady} from './driver.js';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#flower');
const plates = document.querySelector('.proto-plates'), label = document.querySelector('.proto-plate-label');
const hold = {bloom: 7, art: 9, narrative: 10, code: 10, chaos: 11, play: 13};
let index = 0, started = 0, touched = -1e9, ghosting = false, ghostDown = false;
const buttons = modes.map((m, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'proto-plate';
  b.innerHTML = `<small>${['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</small><span>${m.word}</span><i></i>`;
  b.addEventListener('click', () => go(i, true));
  plates.append(b); return b;
});
function go(i, byHand = false) {
  index = (i + modes.length) % modes.length;
  const m = modes[index];
  ghost('pointerup'); choose(m.id);
  buttons.forEach((b, k) => b.classList.toggle('is-active', k === index));
  label.innerHTML = `<span>${m.title}</span><i>${m.hint}</i>`;
  started = performance.now(); if (byHand) touched = started;
}
// A synthetic pointer, marked so the tour does not mistake it for a visitor.
function ghost(type, x = .5, y = .5) {
  if (type === 'pointerup' && !ghostDown) return;
  const r = canvas.getBoundingClientRect(), s = Math.min(r.width, r.height);
  ghosting = true;
  canvas.dispatchEvent(new PointerEvent(type, {bubbles: true, isPrimary: true, pointerId: 77, pointerType: 'mouse', buttons: ghostDown || type === 'pointerdown' ? 1 : 0,
    clientX: r.left + r.width / 2 + (x - .5) * s * .8, clientY: r.top + r.height * .45 + (y - .5) * s * .8}));
  ghosting = false;
  if (type === 'pointerdown') ghostDown = true; if (type === 'pointerup') ghostDown = false;
}
function sweep(t) {
  const m = modes[index].id, k = (t - started) / 1000;
  if (m === 'bloom' && k < 4) return;          // let the breeze play first
  if (m === 'play' && k < 7.5) return;          // the petals fall before the mist arrives
  const x = .5 + .32 * Math.sin(k * .9), y = .5 + .26 * Math.sin(k * 1.7 + 1);
  if (m === 'code') {                            // pick up a petal, carry it, let it go
    const phase = k % 3;
    if (phase < .05 && !ghostDown) ghost('pointerdown', x, y);
    else if (phase > 2 && ghostDown) ghost('pointerup', x, y);
    else ghost('pointermove', x, y);
  } else ghost('pointermove', x, y);
}
function tick(t) {
  const m = modes[index], idle = t - touched > 6000;
  const progress = Math.min(1, (t - started) / (hold[m.id] * 1000));
  buttons[index].style.setProperty('--p', idle && !still ? progress : 0);
  document.body.classList.toggle('is-paused', !idle || still);
  if (idle && !still) { sweep(t); if (progress >= 1) go(index + 1); }
  requestAnimationFrame(tick);
}
for (const type of ['pointerdown', 'pointermove']) canvas.addEventListener(type, e => {
  if (ghosting) return;
  if (type === 'pointerdown' || e.pointerType === 'mouse') { if (ghostDown) ghost('pointerup'); touched = started = performance.now(); }
});
whenReady().then(() => { go(0); requestAnimationFrame(tick); });
