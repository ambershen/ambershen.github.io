// A water surface for the Selected Work step: a damped wave field simulated on a coarse grid (CPU),
// then a fragment shader refracts a full-resolution source picture through it (GPU), so covers and
// titles stay sharp while they ripple.
const vertex = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const fragment = `precision mediump float;
varying vec2 uv;
uniform sampler2D src, field;
uniform vec2 texel;
void main(){
  vec2 q=vec2(uv.x,1.-uv.y);
  float l=texture2D(field,q-vec2(texel.x,0.)).r, r=texture2D(field,q+vec2(texel.x,0.)).r;
  float u=texture2D(field,q-vec2(0.,texel.y)).r, d=texture2D(field,q+vec2(0.,texel.y)).r;
  vec2 g=vec2(r-l,d-u);
  vec4 c=texture2D(src,q+g*.03);
  float light=(g.x+g.y)*.6;
  gl_FragColor=vec4(c.rgb+light*c.a+vec3(max(0.,light))*.15,max(c.a,abs(light)*.6));
}`;

export function createWater(canvas) {
  const gl = canvas.getContext('webgl', {premultipliedAlpha: false, antialias: false});
  if (!gl) return null;
  const shader = (type, text) => { const s = gl.createShader(type); gl.shaderSource(s, text); gl.compileShader(s); return s; };
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program); gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const texture = unit => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return t;
  };
  const srcTex = texture(0), fieldTex = texture(1);
  gl.uniform1i(gl.getUniformLocation(program, 'src'), 0);
  gl.uniform1i(gl.getUniformLocation(program, 'field'), 1);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  let gw = 0, gh = 0, a, b, bytes;
  return {
    resize(w, h) {
      gw = Math.max(32, Math.round(Math.min(260, w / 4))); gh = Math.max(24, Math.round(gw * h / w));
      a = new Float32Array(gw * gh); b = new Float32Array(gw * gh); bytes = new Uint8Array(gw * gh);
      gl.uniform2f(gl.getUniformLocation(program, 'texel'), 1 / gw, 1 / gh);
    },
    source(picture) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex); try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picture); } catch (e) { console.warn('Water source unavailable', e); } },
    drop(x, y, radius, strength) { // x, y in 0..1; radius in grid cells
      const cx = x * gw, cy = y * gh;
      for (let j = Math.max(1, cy - radius | 0); j < Math.min(gh - 1, cy + radius + 1); j++)
        for (let i = Math.max(1, cx - radius | 0); i < Math.min(gw - 1, cx + radius + 1); i++) {
          const d = Math.hypot(i - cx, j - cy) / radius;
          if (d < 1) a[j * gw + i] += strength * (.5 + .5 * Math.cos(d * Math.PI));
        }
    },
    step() {
      let energy = 0;
      for (let j = 1; j < gh - 1; j++) for (let i = 1, k = j * gw + 1; i < gw - 1; i++, k++) {
        const v = ((a[k - 1] + a[k + 1] + a[k - gw] + a[k + gw]) * .5 - b[k]) * .982;
        b[k] = v; energy += v * v;
      }
      [a, b] = [b, a];
      for (let k = 0; k < a.length; k++) bytes[k] = Math.max(0, Math.min(255, 128 + a[k] * 20));
      return energy / a.length;
    },
    render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gw, gh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}
