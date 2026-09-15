// A single texture sampled through a smooth displacement field: no tile seams.
export function createBreeze(source, size) {
  const surface = document.createElement('canvas');
  surface.width = surface.height = size;
  const gl = surface.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const shader = (type, text) => {
    const item = gl.createShader(type);
    gl.shaderSource(item, text); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item));
    return item;
  };
  try {
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, `
      attribute vec2 position;
      varying vec2 uv;
      void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}
    `));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D flower;
      uniform float time;
      uniform float strength;
      uniform float progress;
      void main(){
        // Root and lower leaves remain anchored; movement grows into the bloom.
        float anchor=smoothstep(.22,.48,uv.y);
        float border=smoothstep(0.,.09,uv.x)*smoothstep(0.,.09,1.-uv.x)
          *smoothstep(0.,.08,uv.y)*smoothstep(0.,.08,1.-uv.y);
        float left=exp(-dot((uv-vec2(.32,.59))*vec2(4.,3.),(uv-vec2(.32,.59))*vec2(4.,3.)));
        float right=exp(-dot((uv-vec2(.68,.62))*vec2(4.,3.),(uv-vec2(.68,.62))*vec2(4.,3.)));
        float wave=sin(time*2.2-uv.y*5.5+uv.x*2.);
        vec2 offset=vec2(.009*wave + .004*left*sin(time*3.-uv.y*8.),
          .0045*right*sin(time*2.7+uv.x*7.) + .0025*left*cos(time*2.1));
        vec2 sampleUV=clamp(uv+offset*strength*anchor*border,0.,1.);
        vec4 petal=texture2D(flower,sampleUV);
        // Broad, feathered light follows the same warped surface as the petals.
        // Modulate existing color so the black background never becomes a panel.
        float sweep=mix(-.3,1.55,smoothstep(0.,1.,progress));
        float distance=sampleUV.x+sampleUV.y*.22-sweep;
        float beam=exp(-distance*distance/ .055);
        float shade=exp(-(distance-.23)*(distance-.23)/ .09);
        float light=beam*strength*anchor;
        vec3 color=petal.rgb*(1.-.12*shade*strength*anchor);
        color+=(1.-color)*petal.rgb*vec3(.65,.46,.29)*light;
        gl_FragColor=vec4(color,petal.a);
      }
    `));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.uniform1i(gl.getUniformLocation(program, 'flower'), 0);
    const time = gl.getUniformLocation(program, 'time');
    const strength = gl.getUniformLocation(program, 'strength');
    const progress = gl.getUniformLocation(program, 'progress');
    gl.viewport(0, 0, size, size);
    return (seconds, amount, phase) => {
      if (gl.isContextLost()) return source;
      gl.uniform1f(time, seconds); gl.uniform1f(strength, amount);
      gl.uniform1f(progress, phase);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return surface;
    };
  } catch (error) {
    console.warn('Breeze unavailable; keeping the original flower.', error);
    return null;
  }
}
