// Motion for the Work overview: cards play a silent clip on hover (or, on touch screens, while they sit in
// the middle of the screen), and the Soft Matter cover runs a wash through its four machines.
import './work-motion.css';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none)').matches;
// On touch screens only one card moves at a time: the one in view nearest the middle of the screen.
const inView = new Map(); // card -> {start, stop}
let awake = null, queued = 0;
function pickAwake() {
  queued = 0;
  let best = null, bestDistance = Infinity;
  for (const [card, wake] of inView) {
    if (!card.isConnected) { inView.delete(card); continue; }
    const r = card.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
    if (d < bestDistance) { bestDistance = d; best = wake; }
  }
  if (best === awake) return;
  awake?.stop(); awake = best; awake?.start();
}
const repick = () => { if (!queued) queued = requestAnimationFrame(pickAwake); };
if (touch) addEventListener('scroll', repick, {passive: true, capture: true});

// Wake a card on hover or focus; on touch screens, while it is the card in view nearest the middle.
function wake(card, start, stop) {
  if (touch) {
    const entry = {start, stop};
    new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > .5) inView.set(card, entry);
      else { inView.delete(card); if (awake === entry) { stop(); awake = null; } }
      repick();
    }, {threshold: [0, .5, 1]}).observe(card);
    return;
  }
  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focus', start);
  card.addEventListener('blur', stop);
}

// A muted loop laid over the card's still; it fades in once it is actually playing.
export function hoverClip(card, frame, src) {
  if (!src || still) return;
  let video = null;
  wake(card, () => {
    if (!video) {
      video = Object.assign(document.createElement('video'), {src, muted: true, loop: true, playsInline: true, preload: 'none'});
      video.className = 'hover-clip';
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('playing', () => video.classList.add('is-on'));
      frame.append(video);
    }
    video.play().catch(() => {});
  }, () => {
    if (!video) return;
    video.pause(); video.classList.remove('is-on');
  });
}


// The laundromat photo with its four machines. One at a time, a drum spins, the door bursts with suds and the
// word it washed pops out as a card, lettered in that machine's material, as it does on the Soft Matter site;
// then the card drops back in and the next machine starts. Coordinates are pixels in the photo.
const ROOM_W = 1089, ROOM_H = 1445, GLASS = 100, TILE = 3 / 4, VIEW_Y = 793.5;
const machines = [
  {name: 'Ganache', x: 368, y: 548, card: new URL('../../images/soft-matter/card-ganache.jpg', import.meta.url).href, note: 'Dark chocolate · “Cocoa”'},
  {name: 'Purl', x: 719, y: 548, card: new URL('../../images/soft-matter/card-purl.jpg', import.meta.url).href, note: 'Rose wool · “Wool”'},
  {name: 'Picot', x: 719, y: 1043, card: new URL('../../images/soft-matter/card-picot.jpg', import.meta.url).href, note: 'Ivory lace · “Oui”'},
  {name: 'Nacre', x: 368, y: 1043, card: new URL('../../images/soft-matter/card-nacre.jpg', import.meta.url).href, note: 'White pearl · “Bonjour”'},
];
// Where a machine sits in the 4:3 tile, as fractions of its width and height.
const inTile = m => ({x: m.x / ROOM_W, y: (m.y - (VIEW_Y - TILE * ROOM_W / 2)) / (TILE * ROOM_W)});

export function laundromatCover(room, title) {
  const cover = document.createElement('div');
  cover.className = 'wash-cover'; cover.setAttribute('role', 'img');
  cover.setAttribute('aria-label', `${title}: four washing machines; each one washes a word and pops it out lettered in yarn, chocolate, pearls or lace`);
  const stage = document.createElement('div');
  stage.className = 'wash-stage';
  stage.style.transform = `translateY(${(TILE / 2 * ROOM_W - VIEW_Y) / ROOM_H * 100}%)`;
  stage.append(Object.assign(document.createElement('img'), {src: room, alt: '', decoding: 'async'}));
  const glasses = machines.map((m, i) => {
    const glass = document.createElement('div'), drum = document.createElement('div');
    glass.className = 'wash-glass';
    Object.assign(glass.style, {left: `${(m.x - GLASS) / ROOM_W * 100}%`, top: `${(m.y - GLASS) / ROOM_H * 100}%`, width: `${GLASS * 2 / ROOM_W * 100}%`, height: `${GLASS * 2 / ROOM_H * 100}%`});
    drum.className = 'wash-drum';
    Object.assign(drum.style, {
      backgroundImage: `url(${room})`, animationDelay: `${-i * 1.7}s`,
      backgroundSize: `${ROOM_W / (GLASS * 2) * 100}% ${ROOM_H / (GLASS * 2) * 100}%`,
      backgroundPosition: `${(m.x - GLASS) / (ROOM_W - GLASS * 2) * 100}% ${(m.y - GLASS) / (ROOM_H - GLASS * 2) * 100}%`,
    });
    glass.append(drum); stage.append(glass);
    return glass;
  });
  const dim = document.createElement('div');
  dim.className = 'wash-dim';
  const card = document.createElement('div');
  card.className = 'wash-card';
  const face = Object.assign(document.createElement('img'), {alt: '', decoding: 'async'});
  card.append(face);
  const label = document.createElement('span');
  label.className = 'specimen-label';
  cover.append(stage, dim, card, label);
  if (still) { // one finished wash, standing still
    face.src = machines[0].card; cover.classList.add('is-out'); label.textContent = `${machines[0].name} · ${machines[0].note}`;
    return cover;
  }
  machines.forEach(m => { new Image().src = m.card; });

  let timer = 0, at = 0, running = false;
  const after = (ms, next) => { timer = setTimeout(next, ms); };
  // The card's path: from the middle of the machine's door to the middle of the tile.
  const fromDoor = m => {
    const p = inTile(m), w = cover.clientWidth, h = cover.clientHeight;
    return `translate(calc(-50% + ${(p.x - .5) * w}px),calc(-50% + ${(p.y - .5) * h}px)) scale(.12) rotate(-16deg)`;
  };
  function suds(m) {
    const p = inTile(m), w = cover.clientWidth;
    for (let k = 0; k < 18; k++) {
      const b = document.createElement('i'), s = 5 + Math.random() * 13;
      b.className = 'wash-bubble';
      Object.assign(b.style, {left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${s}px`, height: `${s}px`, margin: `${-s / 2}px`});
      cover.insertBefore(b, card);
      const dx = (Math.random() * 2 - 1) * w * .32, dy = -(.06 + Math.random() * .34) * w;
      b.animate([{transform: 'translate(0,0) scale(.3)', opacity: 0}, {opacity: 1, offset: .15}, {transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0}],
        {duration: 1400 + Math.random() * 1200, easing: 'cubic-bezier(.2,.6,.3,1)'}).onfinish = () => b.remove();
    }
  }
  const reset = () => {
    clearTimeout(timer); running = false;
    cover.classList.remove('is-out'); label.textContent = '';
    card.getAnimations().forEach(a => a.cancel());
    glasses.forEach(g => g.classList.remove('is-spinning'));
  };
  function cycle() {
    if (document.body.classList.contains('case-open')) return after(1000, cycle); // covered by the open panel
    const i = at, m = machines[i], glass = glasses[i]; at = (at + 1) % machines.length;
    face.src = m.card;
    glass.classList.add('is-spinning');
    after(2300, () => {
      glass.classList.remove('is-spinning');
      suds(m);
      cover.classList.add('is-out'); label.textContent = `${m.name} · ${m.note}`;
      card.animate([{transform: fromDoor(m), opacity: .2}, {transform: 'translate(-50%,-50%)', opacity: 1}],
        {duration: 700, easing: 'cubic-bezier(.2,.9,.25,1.15)', fill: 'forwards'});
      after(2900, () => {
        cover.classList.remove('is-out'); label.textContent = '';
        card.animate([{transform: 'translate(-50%,-50%)', opacity: 1}, {transform: fromDoor(m), opacity: 0}],
          {duration: 520, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards'});
        after(900, cycle);
      });
    });
  }
  new IntersectionObserver(([e]) => {
    cover.classList.toggle('is-away', !e.isIntersecting);
    if (e.isIntersecting && !running) { running = true; after(500, cycle); } else if (!e.isIntersecting) reset();
  }, {threshold: .35}).observe(cover);
  return cover;
}
