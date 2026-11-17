// Living Butterfly Sketch
// A butterfly painted only by drifting particles. Each particle is a fine
// fibre that keeps repainting the wing, so the wing is never still.
//
// The fibres do not just carry colour, they draw the wing's pattern: they
// circle inside eyespots, shear sideways along bands, and run out along the
// veins, so each marking is made of motion. A random "gene" picks one of
// six pattern families and builds its markings by the rules in
// PATTERN-RULES.md: everything is laid out on the wing's veins and cells.
//
// Every few seconds the specimen changes. Sometimes the new gene spreads from
// the body outward; sometimes the whole wing lets go, drifts as a cloud, and
// gathers again as a different specimen.
//
// One wing is painted into an offscreen buffer. A shader (liquid.js) then
// mirrors it, applies the wing beat and renders it as a wet, glossy,
// iridescent surface. Without WebGL2 it is composited flat in 2D instead.

const N = 20000;           // fibres (painted once, mirrored on screen)
const FADE = 0.024;        // how fast old paint dissolves (faster = livelier, less settled)
const DUST = 900;          // free-floating motes shed from the wing edges
const HOLD = 300;          // frames a specimen rests before it changes
const DRIFT = 250;         // frames the wing stays dissolved into a cloud
const REFORM = 220;        // frames it takes to gather into the next wing

// ------------------------------------------------------------- wing shape
// Each wing is a polar outline r(theta) around the wing root, given as
// [degrees, radius] control points. 0 deg points sideways, negative is up.
const FORE_PTS = [[-52, 0], [-48, 0.45], [-44, 0.82], [-40, 0.97], [-35, 1.0], [-29, 0.95],
                  [-20, 0.86], [-10, 0.78], [0, 0.72], [8, 0.66], [14, 0.5], [19, 0.25], [23, 0]];
const HIND_PTS = [[-12, 0], [-6, 0.3], [2, 0.52], [12, 0.66], [25, 0.74], [40, 0.78],
                  [55, 0.76], [67, 0.68], [76, 0.54], [83, 0.34], [88, 0.15], [90, 0]];
const STEPS = 4;                              // table samples per degree
const FORE = buildLobe(FORE_PTS, 0);
const HIND = buildLobe(HIND_PTS, 0.022);

function buildLobe(pts, scallop) {
  const n = 180 * STEPS + 1;
  let T = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const deg = -90 + i / STEPS;
    for (let k = 0; k < pts.length - 1; k++) {
      const [a, ra] = pts[k], [b, rb] = pts[k + 1];
      if (deg >= a && deg <= b) { T[i] = ra + (rb - ra) * (deg - a) / (b - a); break; }
    }
  }
  for (let pass = 0; pass < 3; pass++) {      // round off the corners
    const U = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sum = 0, c = 0;
      for (let j = -6; j <= 6; j++) { const q = i + j; if (q >= 0 && q < n) { sum += T[q]; c++; } }
      U[i] = sum / c;
    }
    T = U;
  }
  if (scallop) for (let i = 0; i < n; i++) {
    const deg = -90 + i / STEPS;
    if (deg > 15) T[i] *= 1 + scallop * Math.cos(deg * 0.38);
  }
  return T;
}

// the angular span each wing's veins fan across (radians)
const SPAN_F = [-0.908, 0.401], SPAN_H = [-0.209, 1.571];

// ------------------------------------------------------------------ state

const px = new Float32Array(N), py = new Float32Array(N);
const age = new Float32Array(N), life = new Float32Array(N);
const speed = new Float32Array(N), size = new Float32Array(N), seed = new Float32Array(N);
const hx = new Float32Array(N), hy = new Float32Array(N);       // where each fibre gathers to
const ph = new Float32Array(N), ps = new Float32Array(N);       // the colour each fibre last wore
const pl = new Float32Array(N), pa = new Float32Array(N);

const dx = new Float32Array(DUST), dy = new Float32Array(DUST);
const dvx = new Float32Array(DUST), dvy = new Float32Array(DUST);
const dage = new Float32Array(DUST), dlife = new Float32Array(DUST).fill(1);
const dhue = new Float32Array(DUST);
let dustHead = 0;

// coarse grid over the wing holding the fluid potential and both pattern fields
const CELL = 0.03, GX0 = -0.06, GY0 = -1.05, GW = 47, GH = 75;
const psi = new Float32Array(GW * GH), ma = new Float32Array(GW * GH), mb = new Float32Array(GW * GH);
const morphF = new Float32Array(181), morphH = new Float32Array(181);   // per-degree outline drift

let cx, cy, S, pd;                 // where the wings meet, wing scale, pixel density
let gap = 0;                       // space between the two wing roots, for a person to stand in

// Staging for an installation: where the wings sit on the wall. Adjusted with
// the keyboard on site and remembered between visits.
const STAGE_DEFAULT = { x: 0.5, y: 0.48, size: 1.25, gap: -0.02 };   // a negative gap tucks the wing roots into each other
let stage = { ...STAGE_DEFAULT };
try { Object.assign(stage, JSON.parse(localStorage.getItem('wing-stage-3') || '{}')); } catch (e) { /* storage unavailable */ }
function saveStage() { try { localStorage.setItem('wing-stage-3', JSON.stringify(stage)); } catch (e) { /* ignore */ } }
let trail, tctx, mid, mctx, g1, g1ctx, g2, g2ctx;   // wing buffer, toned copy, two bloom buffers
let bw, bh, ox, oy;                // buffer size and wing root inside it
let geneA, geneB, front = 2, rest = 0;
let phase = 0, pt = 0;             // 0 formed, 1 dissolved, 2 gathering; frames in phase
let beatChange = false, lastBeat = 0;   // a change that is following the wing beat; where the beat was last frame
const CLOSE = Math.PI * 0.55, OPEN = Math.PI * 1.45;   // the part of each beat in which the wings are closing, closed and reopening
const DISSOLVE_CHANCE = 0.15;      // how often a beat dissolves the wing instead of changing it
let flapping = true, flapClock = 0;
let flapAngle = 0.2;                            // how far the wings are folded, radians
let flapAmp = 1;                                // eases to 0 when the beat is paused
const flapHist = new Float32Array(32).fill(0.2);   // recent angles: wing tips follow the root late
let brushNow = 1;                               // stroke width in use, eased toward each new specimen's
const edgeNow = { scal: 0, tail: 0, tip: 0 };     // the outline in use, eased toward each new specimen's
const tintNow = [0.3, 0.3, 0.4];                 // backdrop colour, eased toward each new specimen
let TNOW = 0;                                   // seconds, for the markings that move
let liquid = null, liquidOn = false, saveNext = false;   // the shader pass, and whether it is in use
let lightX = 0.5, lightY = -0.2, lastMouseMove = -9999;
let H = 0, SA = 0, L = 0, A = 0;   // colour output: hue, sat, light, alpha
let WS = 0, WTH = 0, WFORE = true; // wing coordinate output: 0..1 body->edge, angle, which wing
let WX = 0.3, WY = 0;              // wingPoint() output

// ------------------------------------------------------------ colour gene

// Random numbers. Everything about a specimen is drawn from `rand`, which is
// swapped for a generator seeded by the specimen's number while its gene is
// built. So a number always produces the same butterfly.
let rand = Math.random;
const rnd = (a, b) => a + rand() * (b - a);
const pick = arr => arr[Math.floor(rand() * arr.length)];
function seeded(n) {                            // mulberry32
  let a = Math.imul(n, 2654435761) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// add ?embed=1 to the address for the version that sits inside another page
// (a portfolio, say): no caption, and the keyboard is left to the host page
const EMBED = !!new URLSearchParams(location.search).get('embed');

const TOTAL = 100000;                           // the edition: specimens are numbered 1..TOTAL
// add ?n=48213 to the address to call up one specimen and keep it on the wall
const START_N = (() => {
  const v = parseInt(new URLSearchParams(location.search).get('n'), 10);
  return v >= 1 && v <= TOTAL ? v : 0;
})();
let pinned = START_N > 0;                       // a pinned specimen does not change by itself
function nextNumber() {
  let n;
  do { n = 1 + Math.floor(Math.random() * TOTAL); } while (geneB && n === geneB.n);
  return n;
}
const smooth = v => (v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v));
const hueGap = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);

// Palettes. Each row is one matched set, so colours are never paired at
// random: [name, ground h,s,l, margin hue, accent h,s,l, second accent h,s,l].
// To add a palette, add a row.
//
// NATURAL holds only colourings found on real butterflies and moths, each
// named for the species it comes from. These are the ones in use.
const NATURAL = [
  // widespread and familiar
  ['monarch',                   28, 78, 62,   18,   45, 30, 90,    35, 70, 70],
  ['painted lady',              22, 60, 66,   30,   40, 25, 90,    20, 35, 48],
  ['red admiral',               10, 78, 54,   15,   40, 15, 92,   215, 45, 60],
  ['peacock butterfly',          8, 62, 50,   20,  215, 55, 66,    48, 65, 72],
  ['small tortoiseshell',       22, 78, 58,   30,  210, 60, 62,    48, 70, 74],
  ['comma',                     25, 75, 56,   20,   40, 55, 72,    40, 10, 90],
  ['mourning cloak',           350, 45, 45,    0,   50, 60, 82,   215, 65, 62],
  ['buckeye',                   30, 35, 50,   25,   22, 80, 58,   280, 35, 60],
  ['blue pansy',               215, 75, 52,  230,   20, 80, 58,    45, 30, 86],
  ['plain tiger',               28, 75, 60,   22,   40, 10, 93,    35, 65, 72],
  ['blue tiger',               200, 45, 75,  205,  195, 60, 60,    40, 10, 92],
  // whites, yellows and sulphurs
  ['cabbage white',             55, 18, 90,   60,  220, 10, 42,    60, 45, 82],
  ['green-veined white',        60, 15, 90,   70,   85, 25, 55,    50, 50, 82],
  ['marbled white',             50,  8, 92,   50,   45, 25, 70,   210,  6, 55],
  ['orange tip',                50, 10, 92,   60,   28, 82, 60,   100, 30, 55],
  ['great orange tip',          48, 15, 92,   50,   22, 82, 58,    50, 50, 80],
  ['brimstone',                 62, 70, 76,   75,   30, 80, 62,    90, 35, 74],
  ['cleopatra',                 58, 75, 72,   60,   28, 82, 60,    85, 35, 72],
  ['clouded yellow',            44, 78, 62,   36,  350, 45, 70,    60, 30, 85],
  ['cloudless sulphur',         56, 78, 68,   52,   30, 60, 60,    60, 40, 86],
  ['apollo',                    50, 12, 90,   45,    2, 75, 55,   210,  8, 60],
  ['paper kite',                50, 10, 92,   50,   50, 40, 80,   220,  8, 42],
  ['glasswing',                200, 10, 86,   25,   20, 55, 48,    40, 10, 95],
  // blues, coppers and hairstreaks
  ['common blue',              225, 60, 68,  235,   28, 70, 64,    40, 10, 92],
  ['adonis blue',              205, 78, 64,  215,   40, 10, 94,    25, 65, 62],
  ['chalkhill blue',           195, 35, 78,  210,   40, 10, 95,    28, 60, 62],
  ['holly blue',               220, 50, 76,  225,   40, 10, 94,   215, 30, 62],
  ['small copper',              22, 78, 56,   28,   35, 50, 70,   210, 50, 66],
  ['scarce copper',             18, 78, 58,   14,   45, 80, 70,    30, 25, 42],
  ['green hairstreak',         130, 55, 52,  120,   30, 30, 48,    40, 10, 88],
  ['purple emperor',           270, 55, 48,  285,   40, 10, 90,    25, 65, 58],
  // fritillaries, longwings and lacewings
  ['silver-washed fritillary',  30, 78, 60,   28,   90, 25, 60,    40, 10, 88],
  ['glanville fritillary',      28, 75, 58,   25,   45, 45, 80,    20, 35, 40],
  ['gulf fritillary',           24, 78, 56,   20,   40, 10, 94,    30, 40, 40],
  ['julia',                     26, 78, 58,   18,   40, 70, 72,    20, 40, 42],
  ['postman',                    8, 78, 52,    0,   50, 50, 85,    45, 60, 78],
  ['zebra longwing',            52, 45, 84,   55,    0, 70, 55,    50, 20, 90],
  ['sapho longwing',           220, 60, 45,  230,   40, 10, 93,   215, 70, 55],
  ['red lacewing',               8, 78, 54,    0,   40, 10, 92,    30, 60, 70],
  ['leopard lacewing',          32, 78, 60,   25,   40, 10, 92,    10, 70, 50],
  ['malachite',                110, 55, 66,  100,   25, 45, 42,    80, 40, 82],
  ['oakleaf',                  215, 45, 48,  230,   30, 82, 58,   205, 50, 70],
  ['owl butterfly',             32, 30, 48,   25,  215, 30, 62,    45, 60, 70],
  // swallowtails and birdwings
  ['old world swallowtail',     52, 70, 74,   48,  215, 55, 56,     8, 75, 56],
  ['tiger swallowtail',         48, 62, 82,   44,  212, 28, 66,    30, 78, 66],
  ['lime swallowtail',          55, 55, 78,   50,   10, 75, 55,   215, 50, 55],
  ['pipevine swallowtail',     215, 60, 45,  195,  190, 60, 60,    28, 80, 60],
  ['spicebush swallowtail',    175, 40, 50,  165,   28, 80, 60,    52, 70, 70],
  ['emerald swallowtail',      150, 60, 45,  165,  170, 70, 55,    60, 40, 60],
  ['ulysses',                  205, 78, 55,  215,  190, 78, 62,   200, 50, 75],
  ['green birdwing',           125, 65, 50,  140,   52, 82, 62,   140, 30, 75],
  ['cairns birdwing',           52, 78, 60,   45,  120, 55, 45,    30, 60, 60],
  ['queen alexandra birdwing', 170, 55, 62,  150,   52, 80, 64,   200, 40, 70],
  ['rajah brooke',             140, 70, 46,  150,    0, 70, 50,   150, 30, 75],
  ['birdwing lime',             82, 48, 72,  110,   52, 75, 70,   165, 35, 62],
  ['paradise birdwing',        172, 45, 68,  195,   48, 65, 74,    40, 10, 90],
  ['golden birdwing',           50, 68, 72,   40,   28, 70, 66,   200, 20, 78],
  // morphos and other tropical species
  ['blue morpho',              205, 75, 58,  225,  190, 70, 68,    28, 35, 60],
  ['morpho, violet sheen',     210, 62, 62,  255,  185, 60, 72,   280, 45, 72],
  ['eighty-eight',              42, 40, 84,   30,    6, 72, 62,    30, 25, 70],
  ['burgundy and teal metalmark', 350, 35, 58, 15,  178, 40, 60,    28, 60, 72],
  ['zebra heliconian on green', 48, 30, 86,   60,  130, 30, 50,    40, 50, 76],
  ['midnight swallowtail',     225, 45, 48,  250,  200, 65, 66,   355, 65, 64],
  ['flame',                     22, 72, 68,    8,   45, 75, 74,   345, 45, 70],
  ['leaf and rust',             95, 30, 64,   70,   18, 65, 62,    50, 50, 78],
  // moths
  ['luna moth',                100, 45, 76,   95,  330, 45, 58,    55, 60, 80],
  ['sunset moth',              150, 70, 46,   60,   20, 82, 58,   320, 65, 58],
  ['comet moth',                52, 75, 66,   45,  350, 50, 45,    30, 70, 60],
  ['atlas moth',                18, 55, 50,   25,   40, 50, 78,   345, 40, 62],
  ['cecropia moth',             15, 40, 45,   10,    8, 70, 52,    40, 30, 85],
  ['io moth',                   48, 75, 68,   40,  350, 50, 60,   215, 45, 45],
  ['rosy maple moth',          335, 60, 80,  340,   52, 75, 78,   345, 50, 65],
  ['elephant hawk moth',       320, 55, 62,  315,   70, 45, 55,   330, 40, 80],
];

// SOFT holds invented pastel sets and colours taken from artworks, not from
// nature. They are left out unless ?soft=1 is added to the address.
const SOFT = [
  ['mist blue & apricot',   212, 42, 70,  232,   26, 78, 72,   345, 45, 78],
  ['dusty rose & cream',    348, 38, 74,  330,   42, 55, 84,   205, 35, 72],
  ['lavender & butter',     262, 34, 72,  285,   48, 70, 78,   330, 45, 76],
  ['sage & blush',          110, 18, 68,  150,  350, 55, 78,    45, 50, 80],
  ['pearl & ink blue',       40, 18, 84,   30,  215, 45, 58,    15, 50, 74],
  ['ice & lilac',           192, 40, 78,  215,  280, 40, 74,    50, 45, 84],
  ['peach & seafoam',        22, 60, 76,    8,  165, 35, 70,    48, 60, 82],
  ['periwinkle & rose',     232, 48, 72,  255,  340, 60, 76,   190, 40, 76],
  ['seafoam & coral',       165, 32, 70,  185,   10, 70, 72,    45, 55, 82],
  ['slate & gold',          208, 14, 72,  220,   44, 62, 70,    40, 10, 90],
  ['mauve & mint',          300, 18, 70,  320,  160, 35, 72,    35, 50, 82],
  ['butter & sky',           50, 55, 80,   38,  205, 50, 70,   345, 45, 78],
  ['coral blush & teal',     10, 55, 74,  355,  178, 38, 58,    45, 60, 82],
  ['moon white & silver',   220, 10, 86,  215,  212, 35, 66,   270, 25, 76],
  ['wisteria & peach',      275, 36, 70,  250,   24, 70, 76,   190, 35, 76],
  ['aqua & shell pink',     185, 42, 70,  200,  352, 55, 80,    50, 50, 84],
  ['sand & terracotta',      36, 32, 74,   24,   12, 52, 66,   200, 25, 74],
  ['lilac grey & lemon',    285, 14, 74,  265,   56, 62, 80,   335, 40, 76],
  ['powder pink & blue grey', 338, 45, 80, 320,  210, 28, 64,    40, 45, 84],
  ['jade mist & gold',      150, 26, 66,  170,   44, 65, 72,   345, 40, 80],
  ['twilight',              236, 38, 60,  262,   28, 75, 72,   320, 45, 72],
  ['opal',                  175, 30, 78,  250,  320, 45, 78,    45, 55, 82],
  ['champagne & plum',       42, 36, 80,   30,  310, 28, 56,   200, 30, 74],
  ['celadon & lavender',    130, 20, 74,  160,  265, 35, 72,    30, 50, 80],
  ['living specimen',        14, 66, 72,   20,  208, 45, 76,   275, 25, 80],
  ['powder & peach',        214, 40, 72,  225,   30, 65, 76,    42, 60, 70],
  ['silver vein',           205, 14, 80,  200,   36, 35, 76,   215, 25, 66],
  ['dusty pink',            345, 42, 80,  340,  338, 40, 56,    20, 30, 84],
  ['coral lunule',           10, 62, 78,   18,   48, 62, 80,   200, 42, 76],
  ['glacier',               195, 30, 82,  210,  225, 45, 64,   170, 35, 74],
];
const PALETTES = new URLSearchParams(location.search).get('soft') ? NATURAL.concat(SOFT) : NATURAL;

// The centre of cell `idx` (the space between two veins) at fraction sRow of
// the way from body to margin. Markings are placed here, never on a vein.
function cellCentre(fore, nv, idx, sRow) {
  const [a0, a1] = fore ? SPAN_F : SPAN_H;
  const th = a0 + (idx + 0.5) / nv * (a1 - a0);
  const r = lobe(fore ? FORE : HIND, th) * sRow;
  return [r * Math.cos(th), r * Math.sin(th)];
}

// zone and marking colours: 0 ground, 1 dark, 2 accent, 3 pale, 4 deep ground
const GROUND = 0, DARK = 1, ACCENT = 2, PALE = 3, DEEP = 4, LIGHT = 5, ACCENT2 = 6;   // LIGHT: the ground colour, brighter; ACCENT2: a second accent
const FAMILIES = ['glass', 'eyed', 'banded', 'pale', 'morpho', 'striped',
                  'chevron', 'swallowtail', 'patch', 'rings', 'twotone', 'windows',
                  'ribbed', 'marbled', 'tiger'];
// add ?family=eyed (or any name above) to the address to see only that family
const ONLY = new URLSearchParams(location.search).get('family');
// How the paint is laid on. Fibres are not spread evenly: where they gather
// the colour is deep and saturated, where they thin out it is pale and airy,
// so the same pattern can be rendered in many different lights.
//   even       no variation          cloud      drifting banks of dense and thin paint
//   radialOut  dense at the body     radialIn   dense at the margin
//   veined     dense along veins     cells      dense in the middle of each cell
//   dapple     small flecks of light, like sun on water
const TONES = ['even', 'cloud', 'cloud', 'radialOut', 'radialIn', 'veined', 'cells', 'dapple'];
// add ?tone=dapple (or any name above) to the address to see only that treatment
const ONLY_TONE = new URLSearchParams(location.search).get('tone');

// Add a row of marks, one per cell, with probability `chance`. Anything not
// fixed by `opts` is drawn at random, so rows differ from specimen to specimen.
//   kind   colour          shape  0 round, 1 dash, 2 crescent, 3 chevron, 4 block
//   every  1 = each cell, 2 = alternate cells
//   slope / slopeH  tilt the row across the forewing / hindwing (a diagonal band)
//   wing   0 both, 1 forewing only, 2 hindwing only     from..to  which cells
function addDots(g, s, hs, chance, opts) {
  if (rand() >= chance) return;
  g.dots.push(Object.assign({ s, hs, kind: pick([ACCENT, ACCENT, LIGHT, LIGHT, PALE]), shape: pick([0, 0, 1, 2]),
                              every: pick([1, 1, 2]), slope: 0, slopeH: 0, wing: 0, from: 0, to: 99 }, opts));
}

// build specimen number n
function randomGene(n) {
  rand = seeded(n);
  const P = pick(PALETTES);
  const stray = rnd(-5, 5);                                 // each specimen strays a little from its palette
  const bh = P[1] + stray;
  const g = {
    n, code: String(n).padStart(6, '0'),
    family: FAMILIES.includes(ONLY) ? ONLY : pick(FAMILIES),
    pi: PALETTES.indexOf(P), palette: P[0],                 // which palette was used
    bh, bs: P[2] + rnd(-4, 4), bl: P[3] + rnd(-3, 3),       // ground colour at the wing base
    h2: P[4] + stray,                                       // ground hue at the margin
    ah: P[5] + rnd(-4, 4), as: P[6] + rnd(-5, 5), al: P[7] + rnd(-3, 3),   // the accent
    a2s: P[9], a2l: P[10],                                  // the second accent (its hue is ah2)
    rh: rand() < 0.5 ? P[5] : P[8],                         // mote hue
    ox: rnd(0, 50), oy: rnd(0, 50),                         // where the soft field sits
    nvF: Math.floor(rnd(6, 10)), nvH: Math.floor(rnd(6, 10)),   // veins per wing
    vein: 0.03, veinGrow: 0.05, veinTips: 0,                // vein width, in fractions of a cell
    zones: [[9, GROUND]],                                   // bands from body to margin: [outer edge, colour]
    scal: 0, wob: rnd(0, 0.06),                             // scallop per cell; soft wobble
    dots: [],                                               // rows of one mark per cell
    marks: [],                                              // eyespots, round spots, ring targets
    patches: [],                                            // large soft blotches
    ringKind: DARK,
    apex: 0, apexSpots: false, discal: false, stripes: false, aThr: 9,
    hind: '', foreDeep: false, hindFade: false, costal: false,
    // line textures
    ah2: 0,                                                 // hue of the second accent
    ribs: 0, ribDepth: 0,                                   // fine parallel lines running along each cell
    ripple: null,                                           // wavy, marbled lines near the wing base
    lun: null,                                              // a margin of stacked crescents in several colours
    bars: [],                                               // wedge stripes reaching in from the leading edge
    dust: null,                                             // a soft dusting of colour inside a dark margin
    costalBars: 0,                                          // short dashes along the leading edge
    // the outline itself: scalloped hindwing edge, a hindwing tail, a blunter or more pointed forewing tip
    edge: { scal: rand() < 0.6 ? rnd(0.015, 0.06) : 0, tail: rand() < 0.2 ? rnd(0.12, 0.25) : 0, tip: rnd(-0.05, 0.09) },
  };
  g.ah2 = P[8] + rnd(-4, 4);
  const midF = Math.floor(g.nvF / 2), midH = Math.floor(g.nvH / 2);
  const lunules = () => {                                   // 2-3 colours, in a shuffled order
    const kinds = [ACCENT, PALE, LIGHT, ACCENT2];
    for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
    return { s0: rnd(0.78, 0.84), n: Math.floor(rnd(2, 4)), bow: rnd(0.04, 0.08), kinds: kinds.slice(0, 3) };
  };
  const ripples = discalOnly => ({ a: 0.12, b: rnd(0.4, 0.5), f: rnd(50, 80), kind: pick([DEEP, DARK, ACCENT]), discalOnly });
  // kind: 0 round spot, 1 eyespot, 2 ring target with `rings` concentric lines
  const mark = (fore, idx, sRow, r, eye, rings) => {
    const [x, y] = cellCentre(fore, fore ? g.nvF : g.nvH, idx, sRow);
    g.marks.push({ x, y, f: fore, eye, r, ring: !!rings, n: rings || 0 });
  };
  let darkGround = false;

  switch (g.family) {
    case 'glass':                       // coloured cells leaded with dark veins, dark margin
      g.zones = [[rnd(0.76, 0.82), GROUND], [9, DARK]];
      g.scal = rnd(0.03, 0.06);
      g.vein = 0.07; g.veinGrow = 0.12;
      addDots(g, 0.88, 0.028, 0.6);
      addDots(g, 0.95, 0.016, 0.25);
      g.apex = rnd(0.2, 0.28); g.apexSpots = rand() < 0.5;
      break;
    case 'eyed': {                      // one dominant eyespot per wing, echoed smaller
      const e1 = rnd(0.5, 0.58);
      g.zones = [[e1, GROUND], [e1 + 0.035, DARK], [0.88, GROUND], [0.915, DARK], [9, DEEP]];
      g.scal = rnd(-0.05, 0.05);
      g.discal = true;
      mark(true, midF, 0.72, rnd(0.06, 0.085), true);
      if (rand() < 0.5) mark(true, midF + 2, 0.74, rnd(0.03, 0.04), true);
      mark(false, midH, 0.7, rnd(0.05, 0.075), true);
      if (rand() < 0.6) mark(false, midH - 2, 0.72, rnd(0.03, 0.04), true);
      break;
    }
    case 'banded': {                    // deep wings crossed by one bright band
      const b0 = rnd(0.4, 0.5);
      g.zones = [[b0, DEEP], [b0 + rnd(0.12, 0.2), pick([PALE, ACCENT])], [9, DEEP]];
      g.scal = rnd(0.02, 0.05) * pick([-1, 1]);
      addDots(g, 0.84, 0.025, 0.5);
      darkGround = true;
      break;
    }
    case 'pale':                        // near-plain wings: dark tip, a spot or two, inked vein ends
      g.apex = rnd(0.18, 0.26);
      g.vein = 0.02; g.veinGrow = 0.02; g.veinTips = 0.1;
      mark(true, midF, 0.55, rnd(0.03, 0.042), false);
      if (rand() < 0.5) mark(true, midF + 1, 0.6, rnd(0.022, 0.032), false);
      if (rand() < 0.4) mark(false, midH, 0.55, rnd(0.022, 0.03), false);
      break;
    case 'morpho':                      // one sweeping gradient inside a thin dark margin
      g.h2 = bh + (g.h2 - bh) * 1.8;                        // a longer sweep of hue
      g.zones = [[rnd(0.84, 0.9), GROUND], [9, DARK]];
      g.scal = 0.03; g.vein = 0.02;
      addDots(g, 0.94, 0.014, 0.25);
      break;
    case 'striped':                     // alternate cells dark, like stripes fanning from the body
      g.stripes = true;
      g.zones = [[0.78, GROUND], [9, DARK]];
      g.scal = 0.04; g.vein = 0.05;
      addDots(g, 0.88, 0.026, 0.5);
      break;
    case 'chevron': {                   // rows of V marks, one per cell, pointing at the body
      const ck = pick([DARK, DEEP, ACCENT]);
      g.vein = 0.025;
      addDots(g, rnd(0.6, 0.7), 0.05, 1, { kind: ck, shape: 3, every: 1 });
      addDots(g, rnd(0.82, 0.88), 0.04, 0.7, { kind: ck, shape: 3, every: 1 });
      g.discal = rand() < 0.5;
      break;
    }
    case 'swallowtail': {               // dark wings crossed by a slanting chain of spots, tailed
      const sk = pick([PALE, LIGHT, LIGHT, ACCENT]);
      g.zones = [[9, DEEP]];
      addDots(g, 0.56, 0.075, 1, { kind: sk, shape: pick([0, 1, 4]), every: 1, slope: rnd(0.2, 0.4), slopeH: rnd(-0.3, -0.1) });
      addDots(g, 0.86, 0.03, 0.8, { kind: sk, shape: pick([0, 2]), every: 1 });
      g.edge.tail = rnd(0.14, 0.26);
      mark(false, g.nvH - 2, 0.8, rnd(0.03, 0.04), true);
      darkGround = true;
      break;
    }
    case 'patch': {                     // a plain deep wing carrying one bright blotch
      g.zones = [[9, DEEP]];
      g.vein = 0.02;
      const [x, y] = cellCentre(true, g.nvF, midF, rnd(0.5, 0.65));
      g.patches.push({ x, y, r: rnd(0.14, 0.22), f: true, kind: pick([ACCENT, ACCENT, PALE, LIGHT]) });
      if (rand() < 0.4) {
        const [hx2, hy2] = cellCentre(false, g.nvH, midH, rnd(0.5, 0.6));
        g.patches.push({ x: hx2, y: hy2, r: rnd(0.12, 0.2), f: false, kind: g.patches[0].kind });
      }
      addDots(g, 0.8, 0.03, 0.4, { kind: PALE, shape: 4, wing: 1, from: 1, to: 3 });
      darkGround = true;
      break;
    }
    case 'rings':                       // concentric lines circling a point on each wing
      g.vein = 0.015; g.veinGrow = 0.02;
      g.ringKind = pick([DARK, DEEP]);
      mark(true, midF, 0.56, rnd(0.24, 0.32), false, Math.floor(rnd(3, 6)));
      mark(false, midH, 0.55, rnd(0.24, 0.32), false, Math.floor(rnd(3, 6)));
      g.costal = rand() < 0.6;
      break;
    case 'twotone':                     // forewing and hindwing in different colours
      if (rand() < 0.5) g.hind = pick(['accent', 'deep']); else { g.foreDeep = true; g.hind = 'accent'; }
      addDots(g, 0.86, 0.028, 0.5);
      g.apex = rand() < 0.4 ? rnd(0.18, 0.26) : 0;
      break;
    case 'ribbed':                      // the whole wing finely ruled with parallel lines, thin dark margin
      g.ribs = Math.floor(rnd(5, 9)); g.ribDepth = rnd(10, 18);
      g.zones = [[rnd(0.9, 0.94), GROUND], [9, DARK]];
      g.scal = rnd(0.02, 0.04); g.vein = 0.02;
      g.costalBars = rnd(24, 36);
      addDots(g, rnd(0.6, 0.7), 0.02, 0.6, { kind: DARK, shape: 1, every: 2 });
      break;
    case 'marbled':                     // marbled lines at the base, a row of small dots, a crescent margin
      g.ripple = ripples(rand() < 0.6);
      addDots(g, rnd(0.6, 0.68), 0.02, 0.8, { kind: pick([ACCENT, DEEP]), shape: 0, every: 1 });
      g.lun = lunules();
      g.vein = 0.02; g.edge.scal = rnd(0.03, 0.06);
      break;
    case 'tiger': {                     // pale wings, wedge stripes from the leading edge, broad dark margin
      const nb = Math.floor(rnd(3, 5));
      for (let k = 0; k < nb; k++) g.bars.push({ s: 0.3 + k * 0.16 + rnd(-0.02, 0.02), w: 0.045 - k * 0.005, reach: g.nvF * rnd(0.5, 0.9) });
      g.zones = [[rnd(0.76, 0.8), GROUND], [9, DARK]];
      g.scal = 0.02; g.vein = 0.035;
      addDots(g, 0.86, 0.022, 1, { kind: LIGHT, shape: 1, every: 1 });
      addDots(g, 0.94, 0.014, 0.6, { kind: LIGHT, shape: 1, every: 1 });
      g.dust = { s0: 0.8, s1: 0.92, amt: rnd(0.5, 0.8), kind: ACCENT2 };
      const [x, y] = cellCentre(false, g.nvH, g.nvH - 2, 0.84);
      g.patches.push({ x, y, r: 0.035, f: false, kind: ACCENT });
      g.edge.tail = rnd(0.16, 0.26);
      break;
    }
    case 'windows': {                   // dark wings with a cluster of small pale blocks
      const wk = pick([PALE, LIGHT, ACCENT]);
      g.zones = [[9, DEEP]];
      g.vein = 0.025;
      addDots(g, rnd(0.5, 0.58), 0.045, 1, { kind: wk, shape: 4, every: 1, wing: 1, from: midF - 1, to: midF + 1 });
      addDots(g, rnd(0.7, 0.76), 0.03, 0.8, { kind: wk, shape: 4, every: 1, wing: 1, from: 1, to: 3 });
      g.hindFade = rand() < 0.5;
      darkGround = true;
      break;
    }
  }

  // quiet secondary motifs that any family may carry
  if (g.family !== 'rings' && rand() < 0.2) mark(true, midF, 0.3, 0.07, false, 2);                          // loops in the discal cell
  if (rand() < 0.2) addDots(g, 0.8, 0.03, 1, { kind: ACCENT, shape: pick([0, 2]), every: 1, wing: 2 });      // an accent row on the hindwing only
  if (!darkGround && g.family !== 'glass' && g.family !== 'striped' && rand() < 0.35) g.aThr = rnd(0.38, 0.46);   // a soft accent bloom
  // line textures may be layered onto any family
  const darkMargin = g.zones[g.zones.length - 1][1] === DARK;
  if (!g.ribs && rand() < 0.2) { g.ribs = Math.floor(rnd(5, 9)); g.ribDepth = rnd(7, 13); }
  if (!g.ripple && rand() < 0.15) g.ripple = ripples(true);
  if (!g.lun && !darkGround && !darkMargin && rand() < 0.15) g.lun = lunules();
  if (!g.dust && darkMargin && rand() < 0.3) g.dust = { s0: g.zones[g.zones.length - 2][0] + 0.02, s1: 0.94, amt: rnd(0.4, 0.8), kind: pick([ACCENT, ACCENT2]) };
  g.tone = {
    style: TONES.includes(ONLY_TONE) ? ONLY_TONE : pick(TONES),
    contrast: rnd(0.5, 0.92),                     // how thin the thin places get
    jitter: rnd(5, 22),                           // broken colour: each fibre's hue strays this many degrees
    fleck: rand() < 0.4 ? rnd(0.02, 0.08) : 0,    // share of fibres that carry the accent instead, as stray dabs
    brush: pick([1, 1, 1.5, 2.1]),                // fine fibres, or broad dabs
    gather: rand() < 0.5 ? rnd(0.4, 1.2) : 0,     // how strongly fibres are drawn together as they travel
  };
  rand = Math.random;
  return g;
}

// How densely fibres sit at a place: 1 is full, lower is thinner.
function density(g, s, cu, n, x, y) {
  const T = g.tone;
  let d;
  switch (T.style) {
    case 'cloud': d = smooth((n - 0.2) / 0.35); break;
    case 'radialOut': d = 1 - s; break;
    case 'radialIn': d = s; break;
    case 'veined': d = 1 - 4 * cu * (1 - cu); break;
    case 'cells': d = 4 * cu * (1 - cu); break;
    case 'dapple': d = 0.5 + 0.5 * Math.sin(x * 38 + n * 6) * Math.sin(y * 38 - n * 6); break;
    default: return 1;
  }
  return 1 - T.contrast * (1 - (d < 0 ? 0 : d > 1 ? 1 : d));
}

// position across a cell (0 and 1 are veins) for a point at angle th
function cellU(g, th, fore) {
  const span = fore ? SPAN_F : SPAN_H, c = (th - span[0]) / (span[1] - span[0]) * (fore ? g.nvF : g.nvH);
  return c - Math.floor(c);
}

function nextGene(n) {
  geneA = geneB;
  geneB = randomGene(n || nextNumber());
  showNumber();
}

function showNumber() {
  document.getElementById('species').textContent =
    `No. ${geneB.code} / ${TOTAL.toLocaleString('en-US')}${pinned ? '  · pinned' : ''}`;
}

// the new gene seeps through the wing; one change finishes before the next can start
function mutate() {
  if (phase !== 0 || front < 2) return;
  nextGene();
  front = 0;
  rest = 0;
  beatChange = false;                // a change asked for by hand runs at its own pace
}

// the wing lets go of its fibres
function dissolve() {
  if (phase !== 0) return;
  phase = 1; pt = 0;
}

// every fibre is given a new place in the next specimen and drawn toward it
function reform() {
  nextGene();
  front = 2;
  for (let i = 0; i < N; i++) { wingPoint(); hx[i] = WX; hy[i] = WY; }
  phase = 2; pt = 0;
}

// The colour of a fibre at a place on the wing. The wing is read in its own
// coordinates: s runs body -> margin, and the veins split it into cells, so
// every marking can be placed relative to a cell. Each boundary is decided by
// comparing a per-fibre random number against a soft threshold, so markings
// meet in a stipple of fibres instead of a hard line.
function geneColor(g, s, th, x, y, fore, m, sd, n) {
  const sd2 = (sd * 7.13) % 1, sd3 = (sd * 13.7) % 1;
  const span = fore ? SPAN_F : SPAN_H, nv = fore ? g.nvF : g.nvH;

  // which cell, and where across it (cu: 0 and 1 are the veins, 0.5 the middle)
  let c = (th - span[0]) / (span[1] - span[0]) * nv + (m - 0.375) * 0.5;
  c = c < 0 ? 0 : c > nv - 0.001 ? nv - 0.001 : c;
  const idx = Math.floor(c), cu = c - idx, arc = 4 * cu * (1 - cu);

  let h, sa, l, a = 0.6;
  const paint = kind => {
    if (kind === DARK) { h = g.h2; sa = 30; l = 17 + sd * 5; a = 0.7; }        // a deep tone of the wing, never pure black
    else if (kind === ACCENT) { h = g.ah; sa = g.as; l = g.al + (sd - 0.5) * 14; }
    else if (kind === PALE) { h = g.bh; sa = 18; l = 88; a = 0.8; }
    else if (kind === DEEP) { h = g.h2; sa = g.bs + 12; l = 30 + (sd - 0.5) * 6; }
    else if (kind === LIGHT) { h = g.bh; sa = g.bs; l = g.bl + 6 + (sd - 0.5) * 10; }
    else if (kind === ACCENT2) { h = g.ah2; sa = g.a2s; l = g.a2l + (sd - 0.5) * 8; }
  };

  // ground: a gradient from body to margin, with faint rows of scales across it
  const grad = smooth((s - 0.15) / 0.75);
  h = g.bh + (g.h2 - g.bh) * grad + 8 * Math.sin(TNOW * 0.4 + s * 2); sa = g.bs + 10 * grad;
  l = g.bl - 10 * grad + (sd - 0.5) * 8 + (m - 0.375) * 14 + 2 * Math.sin(s * 120 + idx * 2)
    + 4 * Math.sin(TNOW * 0.8 + idx * 2.1);                  // neighbouring cells brighten in turn

  if (!fore && g.hind === 'accent') { h = g.ah; sa = g.as * 0.85; l = g.al + (sd - 0.5) * 8 + (m - 0.375) * 14; }   // two-tone
  else if ((!fore && g.hind === 'deep') || (fore && g.foreDeep)) paint(DEEP);

  if (g.aThr < 1) {                                         // bloom
    const bloom = smooth((m - g.aThr) / 0.16) * smooth(s / 0.25) * (1 - smooth((s - 0.72) / 0.22));
    if (sd2 < bloom) paint(ACCENT);
  }
  if (g.stripes && (idx & 1) && s > 0.2 + (sd2 - 0.5) * 0.06) paint(DARK);   // every other cell

  // bands parallel to the margin; their edges bow in each cell, so they scallop along the veins
  const se = s - g.scal * arc + (m - 0.375) * g.wob + (sd2 - 0.5) * 0.035
           + 0.014 * Math.sin(TNOW * 1.6 - s * 16 + idx * 0.7);   // the band edges ripple
  for (let k = 0; k < g.zones.length; k++) {
    if (se < g.zones[k][0]) { paint(g.zones[k][1]); break; }
  }

  if (g.ripple && s > g.ripple.a && s < g.ripple.b                             // marbling: wavy lines that wander across the cells
      && (!g.ripple.discalOnly || (fore && idx >= Math.floor(nv * 0.3) && idx <= Math.ceil(nv * 0.6)))
      && Math.abs(Math.sin(s * g.ripple.f + 2.2 * Math.sin(cu * 9.42 + m * 8))) < 0.24 + (sd2 - 0.5) * 0.2) paint(g.ripple.kind);

  if (fore) for (let k = 0; k < g.bars.length; k++) {       // wedge stripes: widest at the leading edge, tapering as they cross the cells
    const b = g.bars[k], taper = 1 - idx / b.reach;
    if (taper > 0 && Math.abs(s - b.s) < b.w * taper + (sd2 - 0.5) * 0.012) paint(DARK);
  }
  if (!fore && g.bars.length && idx >= nv - 1) paint(DARK);                    // and one stripe down the inner edge of the hindwing

  if (g.lun && se > g.lun.s0) {                             // a margin of crescents: each cell holds a stack of coloured arcs
    const lv = (s - g.lun.s0 + g.lun.bow * arc + (sd2 - 0.5) * 0.012) / (1 - g.lun.s0 + g.lun.bow) * g.lun.n;
    const bi = Math.max(0, Math.floor(lv));
    paint(lv - bi < 0.16 ? DARK : g.lun.kinds[bi % g.lun.kinds.length]);
  }
  if (g.dust && !fore && s > g.dust.s0 && s < g.dust.s1 && sd2 < g.dust.amt * arc) paint(g.dust.kind);   // dusting inside the dark margin
  if (g.costalBars && fore && idx === 0 && s > 0.3 && Math.sin(s * g.costalBars) > 0.45) paint(DARK);   // dashes on the leading edge

  if (!fore && g.hindFade && sd2 < smooth((s - 0.35) / 0.5)) paint(LIGHT);     // hindwing pales toward its edge
  if (g.costal && fore && idx === 0 && s > 0.25) paint(ACCENT);                // a stripe along the leading edge

  for (let k = 0; k < g.patches.length; k++) {              // large soft blotches
    const p = g.patches[k];
    if (p.f === fore && Math.hypot(x - p.x, y - p.y) / p.r + (m - 0.375) * 1.4 + (sd2 - 0.5) * 0.25 < 1) paint(p.kind);
  }

  for (let k = 0; k < g.dots.length; k++) {                 // one mark per cell, centred between veins
    const d = g.dots[k];
    if (d.every === 2 && !(idx & 1)) continue;
    if ((d.wing === 1 && !fore) || (d.wing === 2 && fore) || idx < d.from || idx > d.to) continue;
    const row = d.s + (fore ? d.slope : d.slopeH) * (idx / nv - 0.5);          // a tilted row makes a diagonal band
    const tw = 1 + 0.22 * Math.sin(TNOW * 1.6 - idx * 0.9 + k * 2);   // dots swell in a chase along the margin
    let du = (cu - 0.5) / (0.3 * tw), dv = (s - row) / (d.hs * tw);
    if (d.shape === 1) { du *= 0.72; dv *= 1.7; }                    // a dash lying along the margin
    else if (d.shape === 2) dv = (dv + 0.9 * du * du - 0.3) * 2;     // a crescent
    else if (d.shape === 3) dv = (dv - Math.abs(du) * 1.4 + 0.7) * 2.6;   // a chevron
    else if (d.shape === 4) { if (Math.max(Math.abs(du), Math.abs(dv)) < 0.85) du = dv = 0; else du = 2; }   // a block
    if (du * du + dv * dv + (sd2 - 0.5) * 0.5 < 1) paint(d.kind);
  }

  // the discal cell: an open space at the heart of the wing, closed by a short bar
  const inDiscal = s < 0.42 && idx >= Math.floor(nv * 0.3) && idx <= Math.ceil(nv * 0.6);
  if (g.discal && fore && idx >= Math.floor(nv * 0.3) && idx <= Math.ceil(nv * 0.6)
      && Math.abs(s - 0.44) + (sd3 - 0.5) * 0.015 < 0.016) paint(DARK);

  if (g.apex && fore) {                                     // dark wing tip, with pale spots inside it
    if (Math.hypot(x - 0.8, y + 0.55) + (sd3 - 0.5) * 0.1 < g.apex) {
      paint(DARK);
      if (g.apexSpots && (Math.hypot(x - 0.72, y + 0.5) < 0.024 || Math.hypot(x - 0.68, y + 0.4) < 0.02
                          || Math.hypot(x - 0.76, y + 0.42) < 0.02)) paint(PALE);
    }
  }

  for (const mk of g.marks) {                               // eyespots and spots
    if (mk.f !== fore) continue;
    const ex = x - mk.x, ey = y - mk.y;
    const d = Math.hypot(ex, ey) / mk.r + (sd2 - 0.5) * 0.14;
    if (d >= 1) continue;
    if (mk.ring) { if (Math.sin(d * mk.n * 6.2832) > 0.3) paint(g.ringKind); continue; }   // concentric lines
    a = 0.8;
    const dil = 0.32 + 0.09 * Math.sin(TNOW * 1.4 + mk.x * 9);   // the pupil slowly dilates
    if (!mk.eye) { sa = 30; l = 4; }                        // a plain spot
    else if (Math.hypot(ex + mk.r * 0.14, ey + mk.r * 0.14) < mk.r * 0.1) { sa = 10; l = 92; }   // catch-light
    else if (d < dil) { sa = 30; l = 4; }                   // pupil
    else if (d < dil + 0.24) { h = g.ah; sa = g.as; l = 68; }   // iris
    else if (d < 0.78) { sa = 30; l = 4; }                  // dark ring
    else { h = g.bh; sa = 20; l = 87; }                     // pale halo
  }

  if (sd3 < (1 - smooth(s / 0.42)) * 0.9) { h = g.bh + 15; sa = 55; l = 12 + sd * 12; }   // deep wing base

  if (g.ribs && l > 20 && Math.sin(cu * g.ribs * 6.2832) > 0.8) l -= g.ribDepth;   // fine lines ruled along each cell

  // veins: none inside the discal cell, wider toward the margin
  if (!inDiscal && l > 12) {
    const wv = g.vein + g.veinGrow * s + g.veinTips * smooth((s - 0.8) / 0.2);
    if (Math.min(cu, 1 - cu) < wv * 0.5) l = wv > 0.06 ? 6 : l - 22;
  }

  // Paint laid on thickly is deep and saturated; thin paint is paler. And no
  // two fibres are quite the same hue, so colour is mixed by the eye.
  if (l > 20) {
    const T = g.tone, D = density(g, s, cu, n, x, y);
    sa = Math.min(82, sa + 18 * (D - 0.55));
    l -= 7 * (D - 0.55);
    h += (sd3 - 0.5) * 2 * T.jitter;
    if (((sd * 41.3) % 1) < T.fleck) { h = g.ah; sa = g.as; l = Math.min(88, l + 8); }
  }

  // light runs outward through each cell, out of step with its neighbours
  if (l > 20) {
    const pulse = Math.max(0, Math.sin(s * 9 - TNOW * 1.8 + idx * 1.7));
    l += 6 * pulse * pulse * pulse * pulse;
  }

  H = ((h % 360) + 360) % 360; SA = sa; L = l; A = a;
}

// ------------------------------------------------------------------ setup

function setup() {
  pd = Math.min(2, window.devicePixelRatio || 1);
  pixelDensity(pd);
  createCanvas(windowWidth, windowHeight);
  noiseDetail(2, 0.5);
  liquid = createLiquid();
  liquidOn = !!liquid;
  layout();
  geneB = randomGene(nextNumber());
  nextGene(START_N);
  for (let i = 0; i < N; i++) { spawn(i); age[i] = Math.random() * life[i]; }
  if (EMBED) document.getElementById('caption').style.display = 'none';
  else setTimeout(() => document.getElementById('caption').classList.add('hidden'), 9000);   // then it is just the wings

  // rest when nobody can see it: in a background tab, or scrolled out of view
  let onScreen = true;
  const wake = () => { if (onScreen && !document.hidden) loop(); else noLoop(); };
  document.addEventListener('visibilitychange', wake);
  if (window.IntersectionObserver) {
    new IntersectionObserver(entries => { onScreen = entries[entries.length - 1].isIntersecting; wake(); })
      .observe(document.querySelector('main canvas'));
  }
}

function makeBuffer(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  return [c, ctx];
}

function layout() {
  S = Math.min(width * 0.4, height * 0.52) * stage.size;
  place();
  bw = Math.ceil(S * 1.3); bh = Math.ceil(S * 2.1);   // room for the dissolved cloud
  ox = S * 0.04; oy = S * 1.0;
  [trail, tctx] = makeBuffer(bw * pd, bh * pd);
  tctx.scale(pd, pd);
  [mid, mctx] = makeBuffer(bw * pd, bh * pd);
  [g1, g1ctx] = makeBuffer(bw * pd / 4, bh * pd / 4);
  [g2, g2ctx] = makeBuffer(bw * pd / 10, bh * pd / 10);
  if (liquid) liquid.resize(width, height, pd);
}

function place() {
  cx = width * stage.x;
  cy = height * stage.y;
  gap = S * stage.gap;
}

function lobe(T, th) {
  const i = ((th * 57.29578 + 90) * STEPS) | 0;
  return T[i < 0 ? 0 : i > 180 * STEPS ? 180 * STEPS : i];
}

// the same outline, breathing very slightly with the morph table
function fluidLobe(T, M, th) {
  let i = ((th * 57.29578 + 90) * STEPS) | 0;
  i = i < 0 ? 0 : i > 180 * STEPS ? 180 * STEPS : i;
  return T[i] * M[(i / STEPS) | 0];
}

// Where a point sits on the wing: which wing (the forewing lies on top),
// how far from body to edge, and its angle. Results in WFORE, WS, WTH.
function wingCoord(x, y, t) {
  const r = Math.hypot(x, y), th = Math.atan2(y, x);
  const thw = th + 0.05 * Math.sin(t * 0.5 + r * 4);          // a faint ripple along the wing
  const rf = fluidLobe(FORE, morphF, thw), rh = fluidLobe(HIND, morphH, thw);
  const sf = rf > 0 ? r / rf : 9, sh = rh > 0 ? r / rh : 9;
  WFORE = sf < 1 || sf < sh;
  WS = WFORE ? sf : sh;
  WTH = th;
}

// a random point inside the resting wing outline, left in WX, WY
function wingPoint() {
  for (let k = 0; k < 40; k++) {
    const x = Math.random() * 0.9, y = Math.random() * 1.42 - 0.7;
    const r = Math.hypot(x, y), th = Math.atan2(y, x);
    if (r > 0.03 && r < Math.max(lobe(FORE, th), lobe(HIND, th)) * 0.97) { WX = x; WY = y; return; }
  }
}

function sampleM(M, x, y) {                    // bilinear read of a pattern field
  const u = (x - GX0) / CELL, v = (y - GY0) / CELL;
  let i0 = u | 0, j0 = v | 0;
  if (i0 < 0) i0 = 0; else if (i0 > GW - 2) i0 = GW - 2;
  if (j0 < 0) j0 = 0; else if (j0 > GH - 2) j0 = GH - 2;
  const fu = u - i0, fv = v - j0, q = j0 * GW + i0;
  return (M[q] + (M[q + 1] - M[q]) * fu) * (1 - fv) + (M[q + GW] + (M[q + GW + 1] - M[q + GW]) * fu) * fv;
}

function spawn(i) {
  // try a few places and prefer the dense ones, so density is built by where
  // fibres gather, not by dimming them
  for (let k = 0; k < 5; k++) {
    wingPoint();
    if (!geneB || !geneB.tone || geneB.tone.style === 'even') break;
    const x = WX, y = WY;
    wingCoord(x, y, frameCount * 0.01);
    WX = x; WY = y;
    if (Math.random() < density(geneB, WS, cellU(geneB, WTH, WFORE), sampleM(psi, x, y), x, y)) break;
  }
  px[i] = WX; py[i] = WY;
  age[i] = 0;
  life[i] = 90 + Math.random() * 220;
  speed[i] = 0.002 + Math.random() * 0.003;
  size[i] = 0.8 + Math.random() * 0.7;
  seed[i] = Math.random();
}

function shed(x, y, vx, vy, hue) {
  const i = dustHead; dustHead = (dustHead + 1) % DUST;
  dx[i] = x; dy[i] = y; dvx[i] = vx; dvy[i] = vy;
  dage[i] = 0; dlife[i] = 150 + Math.random() * 260; dhue[i] = hue;
}

// ------------------------------------------------------------------- draw

function draw() {
  const ctx = drawingContext;
  const t = frameCount * 0.01;

  TNOW = frameCount / 60;

  // Wing beat: one slow, continuous stroke about every four seconds. The
  // curve lingers near "open" so there is always a moment to photograph, the
  // closing stroke is quicker than the opening one, and the depth of each beat
  // drifts so no two are alike. Nothing here starts or stops suddenly.
  flapAmp += ((flapping ? 1 : 0) - flapAmp) * 0.02;
  flapClock += (Math.PI * 2) / 230 * (0.8 + 0.5 * noise(t * 0.35, 3));   // the tempo wanders
  const stroke = 0.5 - 0.5 * Math.cos(flapClock + 0.4 * Math.sin(flapClock));
  const depth = (0.6 + 0.45 * noise(t * 0.2, 9)) * flapAmp;             // so does the depth
  const flapBase = 0.14 + 0.05 * Math.sin(t * 1.1);
  flapAngle = flapBase + depth * stroke * stroke;
  flapHist.copyWithin(1, 0); flapHist[0] = flapAngle;
  const fx = Math.cos(flapAngle);

  // the wings stay registered to the person in front of them: only a breath of roll and bob
  const roll = 0.012 * Math.sin(t * 0.45);
  const bob = Math.sin(t * 0.9) * S * 0.01;

  // the life cycle: rest, then either a mutation wave or a dissolve
  // Every wing beat brings a new specimen. The change starts as the wings
  // begin to close, runs while they are closed, and is complete as they open
  // again, so each time the wings open they show a different butterfly. Now
  // and then a beat dissolves the wing instead.
  const beat = flapClock % (Math.PI * 2);
  if (phase === 0) {
    if (beatChange) {
      front = 2 * (beat - CLOSE) / (OPEN - CLOSE);
      if (beat >= OPEN || beat < CLOSE) { front = 2; beatChange = false; }
    } else if (front < 2) front += 0.007;

    if (!pinned && front >= 2) {
      if (flapAmp > 0.5) {
        if (lastBeat < CLOSE && beat >= CLOSE) {
          if (Math.random() < DISSOLVE_CHANCE) dissolve();
          else { nextGene(); front = 0; beatChange = true; }
        }
      } else if (++rest > HOLD) mutate();        // wings paused: fall back to changing on a timer
    }
  } else if (++pt > (phase === 1 ? DRIFT : REFORM)) {
    if (phase === 1) reform(); else { phase = 0; rest = 0; }
  }

  lastBeat = beat;

  // light follows the mouse, or drifts by itself when the mouse is idle
  const active = millis() - lastMouseMove < 4000;
  const mlx = Math.max(0, Math.abs(mouseX - cx) - gap) / (S * fx), mly = (mouseY - cy - bob) / S;
  lightX += ((active ? mlx : 0.45 + 0.3 * Math.cos(t * 0.45)) - lightX) * 0.05;
  lightY += ((active ? mly : 0.35 * Math.sin(t * 0.6)) - lightY) * 0.05;

  // the outline breathes a little, but stays the wing from the sketches
  for (const key in edgeNow) edgeNow[key] += (geneB.edge[key] - edgeNow[key]) * 0.015;
  brushNow += (geneB.tone.brush - brushNow) * 0.02;
  for (let d = 0; d <= 180; d++) {                 // d is degrees + 90
    const tip = (d - 55) / 9, tail = (d - 150) / 7;
    morphF[d] = (1 + 0.14 * (noise(d * 0.022 + 10, t * 0.22) - 0.375)) * (1 + edgeNow.tip * Math.exp(-tip * tip));
    morphH[d] = (1 + 0.14 * (noise(d * 0.022 + 40, t * 0.22) - 0.375))
              * (1 - edgeNow.scal * (0.5 + 0.5 * Math.cos(d * 0.44))) * (1 + edgeNow.tail * Math.exp(-tail * tail));
  }

  // ---- old paint slowly dissolves
  // (fading in bigger steps on alternate frames lets it reach true black)
  if (frameCount % 2 === 0) {
    tctx.fillStyle = `rgba(0,0,0,${FADE * 2})`;
    tctx.fillRect(0, 0, bw, bh);
  }

  // ---- the fluid: sample the swirling potential and the soft pattern fields
  // on the grid once per frame; every fibre then reads them by interpolation
  for (let j = 0, q = 0; j < GH; j++) {
    const gy = GY0 + j * CELL;
    for (let i = 0; i < GW; i++, q++) {
      const gx = GX0 + i * CELL;
      psi[q] = noise(gx * 1.6, gy * 1.6 + 5, t * 0.35);
      ma[q] = noise(gx * 1.5 + geneA.ox, gy * 1.5 + geneA.oy, t * 0.04);
      mb[q] = noise(gx * 1.5 + geneB.ox, gy * 1.5 + geneB.oy, t * 0.04);
    }
  }

  const k = Math.max(0.8, S / 520);
  const burst = phase === 1 ? 1.4 * smooth(pt / 40) * Math.exp(-pt / 90) : 0;   // a dissolve eases outward
  const pull = phase === 2 ? smooth(pt / REFORM) : 0;         // how hard the new wing calls
  const looseAmt = phase === 1 ? smooth(pt / 90) : phase === 2 ? 1 - pull : 0;

  for (let i = 0; i < N; i++) {
    let x = px[i], y = py[i];
    const courier = ((seed[i] * 91.7) % 1) < 0.06;             // a few bright, fast fibres carry glints

    // read the fluid potential and its slope around this fibre
    const u = (x - GX0) / CELL, v = (y - GY0) / CELL;
    let i0 = u | 0, j0 = v | 0;
    if (i0 < 0) i0 = 0; else if (i0 > GW - 2) i0 = GW - 2;
    if (j0 < 0) j0 = 0; else if (j0 > GH - 2) j0 = GH - 2;
    const fu = u - i0, fv = v - j0, q = j0 * GW + i0;
    const p00 = psi[q], p10 = psi[q + 1], p01 = psi[q + GW], p11 = psi[q + GW + 1];
    const n = (p00 + (p10 - p00) * fu) * (1 - fv) + (p01 + (p11 - p01) * fu) * fv;
    const dpx = ((p10 - p00) * (1 - fv) + (p11 - p01) * fv) / CELL;
    const dpy = ((p01 - p00) * (1 - fu) + (p11 - p10) * fu) / CELL;

    const r0 = Math.hypot(x, y) + 1e-6;
    let surge = Math.sin(flapClock * 2 - r0 * 4);              // ripple of each wing beat
    surge = surge > 0 ? surge * surge * surge : 0;
    let edge = 1, glow = 0;

    if (phase === 0) {
      wingCoord(x, y, t);
      const s = WS, fore = WFORE, th = WTH;
      const reach = 0.985 + ((seed[i] * 13.7) % 1) * 0.03;     // every fibre ends at almost the same line: a clean edge
      age[i]++;
      if (x < 0 || s > reach || age[i] > life[i]) {
        if (age[i] <= life[i] && x > 0 && Math.random() < 0.04) {   // shed a mote
          const side = Math.random() < 0.5 ? 1 : -1;
          const sx = side * (gap + fx * x * S), sy = y * S, cr = Math.cos(roll), sr = Math.sin(roll);
          shed(cx + sx * cr - sy * sr, cy + bob + sx * sr + sy * cr,
               side * Math.cos(th) * 0.25, Math.sin(th) * 0.25 - 0.1, geneB.rh);
        }
        spawn(i);
        continue;
      }

      // Which specimen this fibre belongs to. A change is not a line sweeping
      // across the wing: the new pattern seeps outward through the old one in
      // a wide, uneven front, and inside that front the two are mixed fibre
      // by fibre, like one ink spreading into another.
      const w = s * 0.9 + n * 0.6;
      const mixB = smooth((front - w) / 0.4);                  // 0 = old specimen, 1 = new
      const g = ((seed[i] * 29.3) % 1) < mixB ? geneB : geneA;
      const marks = g.marks, zones = g.zones;
      const churn = 4 * mixB * (1 - mixB);                     // peaks where the two are half mixed

      // Motion draws the pattern. Base flow: out along the veins, with a
      // gentle curl so fibres waver like ink in water. Where the specimens
      // are mixing, the fibres swirl more and travel outward less.
      let vx = x / r0 * (0.6 - 0.3 * churn) + dpy * (0.6 + 1.2 * churn);
      let vy = y / r0 * (0.6 - 0.3 * churn) - dpx * (0.6 + 1.2 * churn);
      if (zones.length > 2) {                   // bands: neighbouring bands slide opposite ways
        let zi = 0;
        while (s > zones[zi][0]) zi++;
        const tw = zi & 1 ? 0.4 : -0.4;
        vx -= y / r0 * tw; vy += x / r0 * tw;
      }
      for (let b = 0; b < marks.length; b++) {  // eyespots and spots: fibres circle the centre
        const mk = marks[b];
        if (mk.f !== fore) continue;
        const ex = x - mk.x, ey = y - mk.y, d = Math.hypot(ex, ey) + 1e-6, lim = mk.r * 1.5;
        if (d < lim) {
          const w = 1 - d / lim;
          vx = vx * (1 - w) - ey / d * 1.3 * w;
          vy = vy * (1 - w) + ex / d * 1.3 * w;
        }
      }
      // Near the margin the fibres stop heading outward and turn to run along
      // it, like a hem, so the edge is drawn by strokes that follow it instead
      // of strokes that poke through it.
      if (g.tone.gather) {                      // drawn toward the crests of the drifting field: fibres pool and part
        vx += dpx * 0.45 * g.tone.gather; vy += dpy * 0.45 * g.tone.gather;
      }
      const hem = smooth((s - 0.78) / 0.18);
      if (hem > 0) {
        const dir = ((seed[i] * 5.3) % 1) < 0.5 ? 1 : -1;
        const out = (vx * x + vy * y) / r0;                     // how fast it is heading outward
        vx += (-y / r0 * dir * 0.7 - x / r0 * out * 0.92) * hem;
        vy += (x / r0 * dir * 0.7 - y / r0 * out * 0.92) * hem;
      }
      const sp = speed[i] * (0.6 + 1.5 * surge + 0.4 * churn) * (courier ? 1.7 : 1);
      x += vx * sp; y += vy * sp;

      if (active) {                             // the cursor stirs a small whirlpool
        const ex = x - mlx, ey = y - mly, d2 = ex * ex + ey * ey;
        if (d2 < 0.035 && d2 > 1e-6) {
          const d = Math.sqrt(d2), f = (1 - d / 0.187) * 0.007;
          x += (-ey - ex * 0.25) / d * f;
          y += (ex - ey * 0.25) / d * f;
        }
      }

      geneColor(g, s, th, x, y, fore, sampleM(g === geneB ? mb : ma, x, y), seed[i], n);
      ph[i] = H; ps[i] = SA; pl[i] = L; pa[i] = A;
      edge = 1 - smooth((s - reach + 0.06) / 0.06);
      glow = churn;
    } else {
      // loose: no outline holds the fibres. They ride the eddies, pushed
      // outward at first, then are drawn in a spiral toward their new homes.
      const loose = 1 - pull;
      const sp = speed[i] * (1.9 + burst) * loose;
      x += (x / r0 * burst * 0.5 + dpy * 1.5) * sp;
      y += (y / r0 * burst * 0.5 - dpx * 1.5) * sp - 0.0003 * loose;
      if (phase === 2) {
        const g = 0.01 + 0.1 * pull * pull;
        x += (hx[i] - x) * g; y += (hy[i] - y) * g;
      }
      if (x < 0) x = -x;                        // crossing the midline enters the mirror wing

      // the cloud is a soft oval: fibres that stray are eased back, and it
      // thins to nothing toward its rim
      const cxo = (x - 0.5) / 0.62, cyo = (y - 0.02) / 0.85, e = Math.hypot(cxo, cyo);
      if (e > 0.7) { x -= (x - 0.5) * 0.006 * (e - 0.7); y -= (y - 0.02) * 0.006 * (e - 0.7); }
      edge = (1 - looseAmt * smooth((e - 0.62) / 0.36)) * (1 - looseAmt * (1 - smooth(x / 0.08)));

      if (phase === 2 && pull > seed[i] * 0.7) {
        // take on the colour waiting at home in the new specimen
        const X = hx[i], Y = hy[i];
        wingCoord(X, Y, t);
        geneColor(geneB, WS, WTH, X, Y, WFORE, sampleM(mb, X, Y), seed[i], sampleM(psi, X, Y));
        ph[i] = H; ps[i] = SA; pl[i] = L; pa[i] = A;
        edge *= 1 - pull * smooth((WS - 0.93) / 0.06);
      } else { H = ph[i]; SA = ps[i]; L = pl[i]; A = pa[i]; }
    }
    px[i] = x; py[i] = y;

    const lx = x - lightX, ly = y - lightY;
    const spec = Math.exp(-(lx * lx + ly * ly) / 0.1);
    let l = L > 20 ? L + spec * 9 + surge * 5 : L;
    if (L > 20) l += 6 * glow;                                   // the mixing front glows faintly
    if (courier && L > 20) l += 8;
    const alpha = A * Math.sin(Math.PI * age[i] / life[i]) * edge
                * smooth((1.24 - x) / 0.1) * smooth((y + 0.98) / 0.1) * smooth((1.08 - y) / 0.1);   // never clip at the buffer
    if (alpha < 0.012) continue;

    const sz = size[i] * k * (courier ? 1.8 : 1) * brushNow;
    tctx.fillStyle = `hsla(${H | 0},${SA | 0}%,${Math.min(94, l) | 0}%,${Math.min(1, (courier ? alpha * 1.6 : alpha) / Math.pow(brushNow, 1.3)).toFixed(3)})`;
    tctx.fillRect(ox + x * S - sz / 2, oy + y * S - sz / 2, sz, sz);
  }

  // ---- compose the frame
  const tintTo = hslToRgb(geneB.bh, 0.45, 0.55);
  for (let c = 0; c < 3; c++) tintNow[c] += (tintTo[c] - tintNow[c]) * 0.012;
  const rot = 0.025 * Math.sin(t * 0.7);        // slow sway
  if (liquidOn) {
    liquid.render(trail, { cx, cy: cy + bob, flap: [flapClock, depth, flapBase], roll, gap, rot, S, ox, oy, bw, bh, lightX, lightY,
                           tint: tintNow, time: t * 1.67 });
    ctx.clearRect(0, 0, width, height);         // this canvas only carries the motes, on top
  } else {
    composeFlat(ctx, fx, bob, rot);
  }
  drawDust(ctx, t);

  if (saveNext) {                               // put the shader image under the motes, then save
    saveNext = false;
    if (liquidOn) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(liquid.canvas, 0, 0, width, height);
    }
    saveCanvas(`specimen-${geneB.code}`, 'png');
  }
}

function hslToRgb(h, s, l) {
  const f = n => { const k = (n + h / 30) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return [f(0), f(8), f(4)];
}

// the plain 2D picture: mirrored wing with a soft bloom
function composeFlat(ctx, fx, bob, rot) {
  // ---- tone curve: overlaying the wing on itself lifts the colours and drops
  // the last faint traces of dissolved paint to black
  mctx.globalCompositeOperation = 'source-over';
  mctx.drawImage(trail, 0, 0);
  mctx.globalCompositeOperation = 'overlay';
  mctx.drawImage(trail, 0, 0);
  // ---- bloom: shrink the wing twice, it blurs when scaled back up
  g1ctx.drawImage(mid, 0, 0, g1.width, g1.height);
  g2ctx.drawImage(g1, 0, 0, g2.width, g2.height);

  // ---- compose the frame
  ctx.globalCompositeOperation = 'source-over';
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
  bg.addColorStop(0, `hsl(${geneB.bh | 0},30%,5%)`);
  bg.addColorStop(0.6, `hsl(${geneB.bh | 0},30%,2.5%)`);
  bg.addColorStop(1, '#020204');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'lighter';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  for (const side of [1, -1]) {
    ctx.save();
    ctx.translate(cx + side * gap, cy + bob);
    ctx.scale(side * fx, 1);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.2;
    ctx.drawImage(g2, -ox, -oy, bw, bh);        // wide soft halo
    ctx.globalAlpha = 0.04;
    ctx.drawImage(g1, -ox, -oy, bw, bh);        // tight glow
    ctx.globalAlpha = 0.8;
    ctx.drawImage(mid, -ox, -oy, bw, bh);       // the painted wing
    ctx.restore();
  }
}


function drawDust(ctx, t) {
  if (Math.random() < 0.2)                                    // ambient motes
    shed(Math.random() * width, Math.random() * height, rnd(-0.1, 0.1), rnd(-0.15, 0.05), geneB.bh);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < DUST; i++) {
    if (dage[i] >= dlife[i]) continue;
    dage[i]++;
    const a = noise(dx[i] * 0.004, dy[i] * 0.004, t * 0.3) * 12.6;
    dvx[i] = dvx[i] * 0.985 + Math.cos(a) * 0.006;
    dvy[i] = dvy[i] * 0.985 + Math.sin(a) * 0.006 - 0.0016;   // slow rise
    dx[i] += dvx[i]; dy[i] += dvy[i];
    const tw = 0.55 + 0.45 * Math.sin(dage[i] * 0.09 + i);
    const alpha = Math.sin(Math.PI * dage[i] / dlife[i]) * tw * 0.6;
    const sz = 1 + (i % 3) * 0.4;
    ctx.fillStyle = `hsla(${dhue[i] | 0},60%,80%,${alpha.toFixed(3)})`;
    ctx.fillRect(dx[i], dy[i], sz, sz);
  }
}

// ------------------------------------------------------------ interaction

let cursorTimer = 0;
function mouseMoved() {
  lastMouseMove = millis();
  document.body.style.cursor = '';               // show the pointer only while it is in use
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => { document.body.style.cursor = 'none'; }, 2500);
}
function mouseDragged() { lastMouseMove = millis(); }
function mousePressed() { mutate(); }

function keyPressed() {
  if (EMBED) return;                              // let the page it is embedded in keep its keys
  if (key === ' ') flapping = !flapping;
  else if (key === 'd' || key === 'D') dissolve();
  else if ((key === 'l' || key === 'L') && liquid) { liquidOn = !liquidOn; liquid.canvas.style.display = liquidOn ? '' : 'none'; }
  else if (key === 's' || key === 'S') saveNext = true;
  else if (key === 'p' || key === 'P') { pinned = !pinned; rest = 0; showNumber(); }   // hold this specimen, e.g. for a photo
  else if (key === 'f' || key === 'F') fullscreen(!fullscreen());
  else if (key === 'h' || key === 'H') document.getElementById('caption').classList.toggle('hidden');
  else {
    // staging: fit the wings to the wall and to where people stand
    const k0 = JSON.stringify(stage);
    if (keyCode === LEFT_ARROW) stage.x -= 0.005;
    else if (keyCode === RIGHT_ARROW) stage.x += 0.005;
    else if (keyCode === UP_ARROW) stage.y -= 0.005;
    else if (keyCode === DOWN_ARROW) stage.y += 0.005;
    else if (key === '[') stage.gap = Math.max(-0.08, stage.gap - 0.01);
    else if (key === ']') stage.gap = Math.min(0.5, stage.gap + 0.01);
    else if (key === '=' || key === '+') stage.size = Math.min(2.2, stage.size * 1.03);
    else if (key === '-' || key === '_') stage.size = Math.max(0.4, stage.size / 1.03);
    else if (key === '0') stage = { ...STAGE_DEFAULT };
    if (JSON.stringify(stage) !== k0) {
      saveStage();
      if (key === '=' || key === '+' || key === '-' || key === '_' || key === '0') layout(); else place();
    }
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layout();
}
