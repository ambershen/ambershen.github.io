// Liquid pass
// A WebGL2 fragment shader that turns the painted wing buffer into the final
// picture. It mirrors the wing, applies the wing beat, and then treats the
// paint as a wet surface: seen through slowly moving water, lit so the fibres
// catch a gloss, tinted by a thin-film iridescence, and wrapped in a flowing
// aura. Returns null if WebGL2 is unavailable; the sketch then falls back to
// its flat 2D compositing.

const LIQUID_FRAG = `#version 300 es
precision highp float;

uniform sampler2D uWing;   // one painted wing, root at uO
uniform vec2 uRes;         // screen size, CSS px
uniform float uPd;         // pixel density
uniform vec2 uCenter;      // where the wings meet, CSS px
uniform vec3 uFlap;        // wing stroke: phase, depth, resting angle
uniform float uRoll;       // whole-body roll
uniform float uGap;        // space between the wing roots, CSS px
uniform float uRot;        // slow sway
uniform float uS;          // wing scale, CSS px per wing unit
uniform vec2 uO;           // wing root inside the buffer, CSS px
uniform vec2 uB;           // buffer size, CSS px
uniform vec2 uLight;       // light position, wing units
uniform vec3 uTint;        // specimen base colour
uniform float uTime;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return s;
}
// lifts the colours and drops the faint traces of dissolved paint to black
vec3 tone(vec3 v) { return mix(2.0 * v * v, 1.0 - 2.0 * (1.0 - v) * (1.0 - v), step(0.5, v)); }
float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
// how far the wing is folded, a little way back along the stroke
float foldAt(float late) {
  float ph = uFlap.x - late;
  float st = 0.5 - 0.5 * cos(ph + 0.4 * sin(ph));
  return uFlap.z + uFlap.y * st * st;
}
// 1 inside the wing buffer, fading to 0 at its border, so nothing smears past it
float inside(vec2 uv) {
  vec2 m = smoothstep(vec2(0.0), vec2(0.03), uv) * smoothstep(vec2(0.0), vec2(0.03), 1.0 - uv);
  return m.x * m.y;
}

void main() {
  // screen pixel -> wing space (the left wing is the right one mirrored)
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uPd - gl_FragCoord.y) / uPd;
  vec2 rel = p - uCenter;
  float cr = cos(-uRoll), sr = sin(-uRoll);
  rel = vec2(cr * rel.x - sr * rel.y, sr * rel.x + cr * rel.y);

  // The wing is not a rigid plate. The stroke travels out along it as a
  // wave: the root leads, the tip and the hindwing follow, so the wing bends.
  float ax = abs(rel.x) - uGap;                // each wing hinges at the edge of the gap
  vec2 w0 = vec2(ax / cos(foldAt(0.0)), rel.y) / uS;
  float late = clamp(length(w0) * 0.8 + smoothstep(0.0, 0.6, atan(w0.y, w0.x)) * 0.3, 0.0, 1.2) * 0.7;
  float ang = foldAt(late);
  vec2 q = vec2(ax / cos(ang), rel.y);

  // as it folds it also sweeps back, more at the tip than the root
  float sweep = uRot + 0.22 * (ang - uFlap.z);
  float c = cos(-sweep), s = sin(-sweep);
  q = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
  vec2 w = q / uS;

  // and a soft ripple runs through the membrane toward the edge
  float rr = length(w);
  w += vec2(-w.y, w.x) / (rr + 1e-4) * 0.016 * rr * sin(7.0 * rr - uFlap.x * 2.0) * uFlap.y;
  float t = uTime;

  // water: a slow flow field bends where we look up the paint
  vec2 flow = vec2(fbm(w * 2.6 + vec2(t * 0.11, -t * 0.07)),
                   fbm(w * 2.6 + vec2(5.2 - t * 0.09, 1.3 + t * 0.1))) - 0.47;
  vec2 uv = ((w + flow * 0.02) * uS + uO) / uB;
  vec2 px = 1.0 / uB;
  float in0 = inside(uv);

  // the paint, with only a breath of colour fringing toward the tips
  vec2 ca = normalize(w + 1e-4) * px * 0.5 * (0.5 + length(w));
  vec3 sharp = tone(vec3(texture(uWing, uv + ca).r, texture(uWing, uv).g, texture(uWing, uv - ca).b));
  // soft focus: the sharp wing laid over a blurred copy of itself, so the
  // fibres melt into fields of colour and detail stays only where it is strong
  vec3 soft = tone(textureLod(uWing, uv, 2.5).rgb);
  vec3 col = mix(sharp, soft, 0.42) + soft * 0.12;

  // surface: softened brightness is the height of a faintly wet film
  float e = 3.0;
  float hl = lum(textureLod(uWing, uv - vec2(px.x * e, 0.0), 2.0).rgb);
  float hr = lum(textureLod(uWing, uv + vec2(px.x * e, 0.0), 2.0).rgb);
  float hu = lum(textureLod(uWing, uv - vec2(0.0, px.y * e), 2.0).rgb);
  float hd = lum(textureLod(uWing, uv + vec2(0.0, px.y * e), 2.0).rgb);
  vec3 N = normalize(vec3((hl - hr) * 4.0, (hu - hd) * 4.0, 1.0));
  vec3 Ld = normalize(vec3(uLight - w, 0.55));
  vec3 Hv = normalize(Ld + vec3(0.0, 0.0, 1.0));
  float wet = smoothstep(0.03, 0.25, (hl + hr + hu + hd) * 0.25);
  float spec = pow(max(dot(N, Hv), 0.0), 20.0) * wet;
  float shade = (0.86 + 0.2 * dot(N, Ld)) * (1.0 - 0.25 * sin(ang));   // a folded wing turns from the light

  // thin film: a quiet shift of colour with the surface angle and each beat
  float film = dot(N.xy, vec2(1.3, 0.8)) * 1.6 + fbm(w * 1.7 + t * 0.05) * 1.2 + t * 0.03 + ang * 0.9;
  vec3 irid = 0.5 + 0.5 * cos(6.2832 * (film + vec3(0.0, 0.33, 0.67)));

  col *= shade * in0;
  col = mix(col, col * (0.6 + 0.8 * irid), 0.13);
  float sheen = smoothstep(0.45, 0.85, fbm(w * 2.2 + vec2(t * 0.4, -t * 0.27)));   // drifting bands of light
  col += col * sheen * 0.12 + spec * (0.5 + 0.2 * irid) * 0.22 * in0;
  col += irid * wet * in0 * 0.09 * exp(-pow((ang - 0.6) / 0.14, 2.0));              // a soft flash as the wing turns

  // Light from behind. The wing is a thin membrane: it glows where the light
  // sits behind it, even its darkest paint holds a little light so the
  // outline never sinks into the dark, and its outer edge catches a pale rim.
  float near = lum(textureLod(uWing, uv, 3.0).rgb), far = lum(textureLod(uWing, uv, 5.5).rgb);
  float cover = smoothstep(0.05, 0.12, near) * in0;           // where there is wing at all (above the level of old, faded paint)
  vec2 lw = w - uLight;
  vec3 pale = mix(uTint, vec3(1.0), 0.65);
  col *= 1.0 + 0.45 * exp(-dot(lw, lw) / 0.35);              // transmitted light
  col += pale * cover * 0.06;
  col += pale * cover * clamp(1.0 - far / (near + 0.02), 0.0, 1.0) * 0.3;   // rim

  // aura: the blurred wing, carried further by the flow
  vec2 uva = ((w + flow * 0.12) * uS + uO) / uB;
  vec3 aura = (tone(textureLod(uWing, uva, 6.0).rgb) * 1.1 + tone(textureLod(uWing, uva, 4.0).rgb) * 0.35) * inside(uva);

  // background: not black but deep air, faintly lit from behind the wings
  vec2 sp = (p - 0.5 * uRes) / uRes.y;
  float neb = fbm(sp * 1.6 + flow * 0.6 + vec2(0.0, t * 0.02));
  vec2 cd = (p - uCenter) / uRes.y;
  cd.x /= max(cos(foldAt(0.0)), 0.35);         // the light behind narrows as the wings close, so none is left beside them
  float halo = exp(-dot(cd, cd) / 0.16);
  vec3 bg = uTint * (0.035 + 0.05 * neb * neb + 0.1 * halo) * (1.0 - 0.55 * dot(sp, sp)) + vec3(0.012, 0.012, 0.018);

  // soft shoulder so bright wings glow instead of clipping to white, and a little grain
  vec3 lit = col * 0.95 + aura * (0.7 + 0.2 * irid) * 0.75;
  vec3 final = bg + 1.0 - exp(-lit * 1.3);
  final += (hash(gl_FragCoord.xy + fract(t) * 91.7) - 0.5) * 0.022;
  outColor = vec4(final, 1.0);
}`;

const LIQUID_VERT = `#version 300 es
void main() {                       // one triangle that covers the screen
  vec2 v = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(v * 2.0 - 1.0, 0.0, 1.0);
}`;

function createLiquid() {
  const canvas = document.createElement('canvas');
  canvas.id = 'liquid';
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, LIQUID_VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, LIQUID_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('Liquid pass unavailable:', err.message);
    return null;
  }
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());

  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const loc = {};
  for (const name of ['uWing', 'uRes', 'uPd', 'uCenter', 'uFlap', 'uRoll', 'uGap', 'uRot', 'uS', 'uO', 'uB', 'uLight', 'uTint', 'uTime'])
    loc[name] = gl.getUniformLocation(prog, name);
  gl.uniform1i(loc.uWing, 0);
  document.body.prepend(canvas);

  return {
    canvas,
    resize(w, h, pd) {
      canvas.width = Math.round(w * pd); canvas.height = Math.round(h * pd);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.uRes, w, h);
      gl.uniform1f(loc.uPd, canvas.width / w);
    },
    // wing: the 2D canvas holding one painted wing; u: this frame's values
    render(wing, u) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wing);
      gl.generateMipmap(gl.TEXTURE_2D);        // the mip levels double as blur
      gl.uniform2f(loc.uCenter, u.cx, u.cy);
      gl.uniform3f(loc.uFlap, u.flap[0], u.flap[1], u.flap[2]);
      gl.uniform1f(loc.uRoll, u.roll);
      gl.uniform1f(loc.uGap, u.gap);
      gl.uniform1f(loc.uRot, u.rot);
      gl.uniform1f(loc.uS, u.S);
      gl.uniform2f(loc.uO, u.ox, u.oy);
      gl.uniform2f(loc.uB, u.bw, u.bh);
      gl.uniform2f(loc.uLight, u.lightX, u.lightY);
      gl.uniform3f(loc.uTint, u.tint[0], u.tint[1], u.tint[2]);
      gl.uniform1f(loc.uTime, u.time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
