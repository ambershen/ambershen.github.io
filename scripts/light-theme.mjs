// Generates the light theme from the dark stylesheets.
// Every rule that sets a color is copied under :root[data-theme=light] with the
// color remapped in OKLCH: lightness is flipped onto a paper-to-ink range, hue is
// kept, and chroma is raised a little so warm accents still read on paper.
// Re-run after changing dark colors:  node scripts/light-theme.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import postcss from 'postcss';

const SCOPE = ':root[data-theme=light]';
// [source, output, hand-tuned rules appended after the generated ones]
const targets = [
  ['experiments/petal-study/style.css', 'experiments/petal-study/light.css', `
/* Hand-tuned: inverting would turn these dark-on-light pairs light-on-light. */
${SCOPE} .soft-feature{background:#e8dfd3}
${SCOPE} .word:hover,${SCOPE} .word.selected{background:#efd8ca;color:#2a211c;border-color:#efd8ca}
${SCOPE} .work-filters button[aria-pressed=true]{background:#2a211c;color:#f7f2ec;border-color:#2a211c}
${SCOPE} .film-play:hover .film-play-icon{background:#a2654c;color:#f7f2ec}
${SCOPE} #work-window .film-reel-nav:hover,${SCOPE} #work-window .newsletter-submit{background:#a2654c;color:#f7f2ec;border-color:#a2654c}
${SCOPE} #work-window .newsletter-submit:hover{background:#86503b;border-color:#86503b}
`],
  ['src/case-study.css', 'src/case-study-light.css', ''],
];

// Core tokens pinned by hand; everything else is derived from them.
const PINNED = {
  '#000000': '#f7f2ec', // background: warm paper
  '#eee8e4': '#2a211c', // text: brown-black ink
  '#a99b8f': '#7b6b5f', // muted
  '#d9b5a3': '#a2654c', // accent: deeper terracotta for contrast on paper
  '#332c27': '#e0d5ca', // lines
  '#d4c9bf': '#4a3d34', // soft text
};
const SHADOW_INK = [43, 29, 20];

// --- color math (sRGB <-> OKLCH) ---
const toLinear = c => (c /= 255) <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
const toSRGB = c => 255 * (c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055);
function rgbToOklch([r, g, b]) {
  [r, g, b] = [r, g, b].map(toLinear);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const L = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const B = .0259040371 * l + .7827717662 * m - .808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToRgb([L, C, H]) {
  const A = C * Math.cos(H), B = C * Math.sin(H);
  const l = (L + .3963377774 * A + .2158037573 * B) ** 3;
  const m = (L - .1055613458 * A - .0638541728 * B) ** 3;
  const s = (L - .0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
    -.0041960863 * l - .7034186147 * m + 1.707614701 * s,
  ];
}
function inGamut(lch) { return oklchToRgb(lch).every(c => c >= -1e-4 && c <= 1.0001); }
function fromOklch(lch) {
  let [L, C, H] = lch;
  while (C > 0 && !inGamut([L, C, H])) C -= .002;
  return oklchToRgb([L, Math.max(C, 0), H]).map(c => Math.round(Math.min(255, Math.max(0, toSRGB(c)))));
}
const hex = rgb => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

const paper = rgbToOklch(parse('#f7f2ec').rgb)[0], ink = rgbToOklch(parse('#2a211c').rgb)[0];
const darkInk = rgbToOklch(parse('#eee8e4').rgb)[0];
const paperHue = rgbToOklch(parse('#f7f2ec').rgb)[2];
function remap(rgb) {
  const key = hex(rgb);
  if (PINNED[key]) return parse(PINNED[key]).rgb;
  const [L, C, H] = rgbToOklch(rgb);
  // A curve keeps near-black surfaces and lines close to paper.
  const t = Math.min(L / darkInk, 1.04) ** 1.6;
  const L2 = paper - t * (paper - ink);
  // Near-neutral tones take the paper's warm hue instead of reading as cool gray.
  if (C < .025) return fromOklch([L2, Math.max(C, .012), paperHue]);
  return fromOklch([L2, C * (1 + .4 * t), H]);
}

function parse(text) {
  let m = text.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    const n = h.match(/../g).map(x => parseInt(x, 16));
    return { rgb: n.slice(0, 3), a: n.length > 3 ? n[3] / 255 : 1 };
  }
  m = text.match(/^rgba?\(([^)]*)\)$/i);
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return { rgb: parts.slice(0, 3), a: parts[3] ?? 1 };
}
function format(rgb, a) {
  if (a >= .999) return hex(rgb);
  return `rgba(${rgb.join(',')},${+a.toFixed(3)})`;
}
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
// Paint properties are copied even without a color (background:none, border:0)
// so a reset in the dark sheet still beats a broader light rule.
const PAINT = /^(color|fill|stroke|outline|box-shadow|text-shadow|caret-color|accent-color|text-decoration(-color)?|background(-color|-image)?|border(-(top|right|bottom|left|block|inline))?(-color)?)$/;
function convert(value, prop) {
  const shadowy = /shadow/.test(prop) || /drop-shadow/.test(value);
  return value.replace(COLOR, match => {
    const { rgb, a } = parse(match);
    // Dark shadows stay dark on paper, just much quieter.
    if (shadowy && rgbToOklch(rgb)[0] < .3) return format(SHADOW_INK, a * .35);
    return format(remap(rgb), a);
  });
}

function scope(selector) {
  if (/^(html|:root)\b/.test(selector)) return selector.replace(/^(html|:root)/, SCOPE);
  if (selector.startsWith('.embed')) return `${SCOPE}${selector}`;
  return `${SCOPE} ${selector}`;
}

for (const [input, output, extra] of targets) {
  const root = postcss.parse(readFileSync(input, 'utf8'));
  const out = postcss.root();
  root.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    const decls = rule.nodes.filter(n => n.type === 'decl' && (PAINT.test(n.prop) || n.value.match(COLOR)));
    if (!decls.length) return;
    const copy = postcss.rule({ selectors: rule.selectors.map(scope) });
    for (const d of decls) copy.append({ prop: d.prop, value: convert(d.value, d.prop), important: d.important });
    // Rebuild any @media/@supports wrappers around the rule.
    let node = copy;
    for (let p = rule.parent; p && p.type === 'atrule'; p = p.parent) {
      node = postcss.atRule({ name: p.name, params: p.params, nodes: [node] });
    }
    out.append(node);
  });
  const header = `/* Generated by scripts/light-theme.mjs from ${input}. Do not edit by hand. */\n`;
  writeFileSync(output, header + out.toString().replace(/\n\s*\n/g, '\n') + '\n' + extra);
  console.log(`${output}: ${out.nodes.length} rules`);
}
