// Prototype driver: steers the live home flower (study.js) by pressing its own word buttons,
// so every prototype runs the five existing effects unchanged.
export const modes = [
  {id: 'bloom', word: 'bloom', title: 'A breeze through the petals', hint: 'Brush the petals'},
  {id: 'art', word: 'art', title: 'Brush the flower into fragments', hint: 'Tap or brush to scatter'},
  {id: 'narrative', word: 'narrative', title: 'Draw the flower in pencil', hint: 'Draw over the flower'},
  {id: 'code', word: 'code', title: 'Float the petals and let them return', hint: 'Touch a petal, then drag'},
  {id: 'chaos', word: 'chaos', title: 'Let the petals fall to find me', hint: 'Brush the petals to find me'},
  {id: 'play', word: 'play with', title: 'Wipe the mist from my portrait', hint: 'Wipe the mist'},
];
const button = id => id === 'play' ? document.querySelector('#play') : document.querySelector(`[data-mode="${id}"]`);
export function choose(id) { const b = button(id); if (b && !b.disabled) { b.click(); return true; } return false; }
// Resolves once every effect (including the pencil and portrait, which load later) can start.
export function whenReady() {
  return new Promise(resolve => {
    const check = () => modes.every(m => button(m.id) && !button(m.id).disabled) ? resolve() : setTimeout(check, 120);
    check();
  });
}
// Fires on any direct play with the flower.
export function onPlay(callback) {
  const canvas = document.querySelector('#flower');
  for (const type of ['pointerdown', 'pointermove']) canvas.addEventListener(type, e => { if (type === 'pointerdown' || e.buttons || e.pointerType === 'mouse') callback(e); });
}
