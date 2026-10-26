// Lift artwork shot on black off its background, so it can sit on any page color.
// The background is flood-filled from the borders, so dark crevices inside the
// flower stay opaque.
export function cutOutBlack(canvas, {threshold = 6, edge = 2, rim = 110, crevice = {}} = {}) {
  const context = canvas.getContext('2d', {willReadFrequently: true});
  const w = canvas.width, h = canvas.height;
  const image = context.getImageData(0, 0, w, h), data = image.data;
  const value = i => Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  // 1 marks background reached from the border.
  const zone = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (zone[i] || value(i) >= threshold) continue;
    zone[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }
  // Shadows between petals that touch the background read as dark notches on a
  // light page. Take them too, a few pixels deep and only above the leaves,
  // whose dark green is just as dark.
  const {value: shade = 45, depth = 8, above = .7} = crevice;
  let front = [];
  for (let i = 0; i < w * h; i++) if (zone[i]) front.push(i);
  for (let step = 0; step < depth && front.length; step++) {
    const next = [];
    for (const i of front) for (const j of [i - 1, i + 1, i - w, i + w]) {
      if (j < 0 || j >= w * h || zone[j] || j / w > h * above || Math.abs((j % w) - (i % w)) > 1) continue;
      if (value(j) < shade) { zone[j] = 1; next.push(j); }
    }
    front = next;
  }
  // Pull the edge in past the dark anti-aliased rim, then soften it.
  const keep = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (zone[i]) continue;
    const x = i % w;
    let near = Infinity;
    for (let dy = -edge; dy <= edge; dy++) for (let dx = -edge; dx <= edge; dx++) {
      const nx = x + dx, j = i + dy * w + dx;
      if (nx >= 0 && nx < w && j >= 0 && j < w * h && zone[j] && dx * dx + dy * dy <= edge * edge) near = Math.min(near, dx * dx + dy * dy);
    }
    // The first pixel always goes; the next only where it is still dark rim.
    keep[i] = near <= 2 || (near !== Infinity && value(i) < rim) ? 0 : 1;
  }
  for (let i = 0; i < w * h; i++) {
    const x = i % w;
    let sum = 0, count = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, j = i + dy * w + dx;
      if (nx >= 0 && nx < w && j >= 0 && j < w * h) { sum += keep[j]; count++; }
    }
    const alpha = sum / count, o = i * 4;
    if (alpha <= 0) data[o] = data[o + 1] = data[o + 2] = data[o + 3] = 0;
    else data[o + 3] = Math.round(data[o + 3] * alpha);
  }
  context.putImageData(image, 0, 0);
  return canvas;
}
