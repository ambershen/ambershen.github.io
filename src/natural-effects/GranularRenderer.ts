import type { SandSurface } from './SandSurface'

const fragment = `
precision highp float;
varying vec2 uv;
uniform sampler2D terrain;
uniform sampler2D snowCrystals;
uniform vec2 grid;
uniform vec2 size;
uniform float snow;
// Light the sand can be played with (the Sand study keeps the defaults): the sun's direction, a
// glitter on quartz grains, a moving pool of light (x, y, strength) and an overall exposure.
uniform vec3 sunDir;
// The light on fine relief (furrows, prints): fixed in the studies, played on the VJ deck.
uniform vec3 fineSun;
// How dark (and how blue) shadows fall on snow: soft grey in the study, deep sky-blue on the VJ deck.
uniform vec3 snowShadow;
uniform float sparkle;
uniform vec3 spot;
uniform float exposure;
// A scroll (the VJ deck's endless sand): the visible share of the grid and its sub-cell offset, and
// how far the grain has travelled in screen pixels. The studies leave it still.
uniform vec2 view;
uniform float travel;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float baseHeightAt(vec2 p){vec4 t=texture2D(terrain,clamp(p,vec2(0.),vec2(1.)));return (t.r+t.g/255.)*4.;}
float heightAt(vec2 p){vec4 t=texture2D(terrain,clamp(p,vec2(0.),vec2(1.)));float bed=(t.r+t.g/255.)*4.;return snow>.5?bed:bed+(t.a-t.b)*.5;}
void main(){
 vec2 screen=vec2(uv.x,1.-uv.y), p=vec2(screen.x*view.x+view.y,screen.y), pixel=screen*size+vec2(travel,0.), stepUV=1./grid;
 vec4 material=texture2D(terrain,p);
 float z=heightAt(p);
 float dx=heightAt(p+vec2(stepUV.x,0.))-heightAt(p-vec2(stepUV.x,0.));
 float dy=heightAt(p+vec2(0.,stepUV.y))-heightAt(p-vec2(0.,stepUV.y));
 float fine=noise(pixel*.77), grain=hash(floor(pixel*1.35));
 // Keep fine grains out of the normal to avoid embossed, icy noise.
 vec3 normal=normalize(vec3(-dx*5.5,-dy*5.5,1.));
 vec3 sun=normalize(fineSun);
 float diffuse=max(0.,dot(normal,sun));
 float horizon=0.;
 for(int i=1;i<=5;i++){
  float reach=float(i)*1.8;
  horizon=max(horizon,(heightAt(p+normalize(sun.xy)*stepUV*reach)-z)/reach);
 }
 float shade=exp(-max(0.,horizon-.015)*mix(4.,2.2,snow));
 float ambient=mix(.52+diffuse*.65,.86+diffuse*.20,snow);
 vec3 color=mix(vec3(.84,.665,.415),vec3(.985,.989,.995),snow);
 color*=ambient*mix(mix(vec3(.65),snowShadow,snow),vec3(1.),shade);
 if(snow<.5){
   // Broad slopes get stronger relief without over-amplifying narrow finger grooves.
   vec2 reach=stepUV*9.;
   vec2 broadSlope=vec2(
     baseHeightAt(p+vec2(reach.x,0.))-baseHeightAt(p-vec2(reach.x,0.)),
     baseHeightAt(p+vec2(0.,reach.y))-baseHeightAt(p-vec2(0.,reach.y)))/18.;
   float resolution=max(grid.x,grid.y)/560.;
   vec2 bedSlope=vec2(
     baseHeightAt(p+vec2(stepUV.x,0.))-baseHeightAt(p-vec2(stepUV.x,0.)),
     baseHeightAt(p+vec2(0.,stepUV.y))-baseHeightAt(p-vec2(0.,stepUV.y)));
   vec3 duneNormal=normalize(vec3(-(broadSlope*35.+bedSlope*6.)*resolution,1.));
   vec3 desertSun=normalize(sunDir);
   float light=max(0.,dot(duneNormal,desertSun));
   // Integrate occlusion uphill so neighboring mounds shade their lower shoulders.
   float duneOcclusion=0.;
   for(int k=1;k<=12;k++){
     float distance=float(k)*4.;
     vec2 sampleAt=p+normalize(desertSun.xy)*stepUV*distance;
     float rise=baseHeightAt(sampleAt)-baseHeightAt(p);
     duneOcclusion=max(duneOcclusion,(rise-distance*.009)/(.12+distance*.018));
   }
   light*=1.-clamp(duneOcclusion,0.,.65);
   float warmth=smoothstep(.02,.86,light);
   vec3 shadowSand=vec3(.59,.435,.275);
   vec3 sunlitSand=vec3(.96,.805,.565);
   color=mix(shadowSand,sunlitSand,warmth);
   // Local self-shadow makes a fresh drawn channel read below its raised rim.
   color*=mix(.72,1.,shade);
   // Readable packed sand inside the groove, retaining the same mineral grain.

   // Height is conveyed by slope lighting and occlusion, not painted altitude bands.
   color*=.985+.025*noise(pixel*.012);
   // Individual mineral grains, fixed in surface space, with tiny lit facets.
   // CSS-pixel scale keeps the texture legible on both retina and standard displays.
   vec2 grainPoint=pixel*.82;
   vec2 grainCell=floor(grainPoint), grainLocal=fract(grainPoint);
   float nearest=10.;
   vec2 grainDelta=vec2(0.);
   vec2 grainId=vec2(0.);
   for(int gy=-1;gy<=1;gy++) for(int gx=-1;gx<=1;gx++){
     vec2 neighbor=vec2(float(gx),float(gy));
     vec2 id=grainCell+neighbor;
     vec2 center=vec2(hash(id+3.71),hash(id+51.19));
     vec2 delta=grainLocal-neighbor-center;
     float distance=dot(delta,delta);
     if(distance<nearest){nearest=distance;grainDelta=delta;grainId=id;}
   }
   float mineral=hash(grainId+91.3);
   float grainRadius=mix(.25,.49,hash(grainId+22.8));
   float grainBody=1.-smoothstep(grainRadius*.50,grainRadius,sqrt(nearest));
   float facet=clamp(dot(grainDelta/grainRadius,normalize(desertSun.xy)),-1.,1.);
   float grainLight=facet*grainBody*(.045+.065*light);
   float mineralTone=(mineral-.5)*.075;
   float crevice=(1.-grainBody)*.023;
   // Disturbed sand exposes a slightly rougher mix, never white snow-like crystals.
   float roughness=1.;
   color+=roughness*(vec3(grainLight+mineralTone-crevice)*vec3(1.,.91,.74));
   float darkMineral=1.-smoothstep(.015,.055,mineral);
   color-=vec3(.065,.052,.035)*darkMineral*grainBody;
   float quartz=smoothstep(.965,.995,mineral)*grainBody*light;
   color+=vec3(.10,.085,.060)*quartz;
   // Glitter: the brightest quartz catches the light, more of it the harder the music sparkles. The grains stay put (no reshuffling), so it shimmers rather than strobes on a projector.
   float glitterGrain=smoothstep(1.-.06*sparkle,1.,hash(grainId+7.7))*grainBody;
   color+=vec3(1.,.93,.78)*glitterGrain*sparkle*(.2+light*.4);
   // Actual sidewall slopes produce depth; only their darkening is admitted.
   vec2 displacedSlope=vec2(dx,dy)-bedSlope;
   vec3 grooveNormal=normalize(vec3(-displacedSlope*20.,1.));
   float wallLight=max(0.,dot(grooveNormal,desertSun));
   float wallShade=min(1.,(.30+wallLight)/(.30+desertSun.z));
   color*=wallShade;
   float depth=material.b*.5;
   color*=1.-smoothstep(.008,.25,depth)*.10;
   // Contact occlusion inside the trench makes the raised shoulder read in relief.
   float bowl=0.;
   for(int edge=0;edge<4;edge++){
     vec2 direction=vec2(cos(float(edge)*1.5707963),sin(float(edge)*1.5707963));
     vec2 q=p+direction*stepUV*3.;
     float neighborDisplacement=heightAt(q)-baseHeightAt(q);
     float displacement=(material.a-material.b)*.5;
     bowl+=max(0.,neighborDisplacement-displacement);
   }
   color*=exp(-bowl*1.1);
 }
 color+=vec3((grain-.5)*.038+(fine-.5)*.012)*(1.-snow);
 // Independently scattered, soft powder flecks instead of connected noise ridges.
 vec2 flakePos=pixel*.48;
 vec2 cell=floor(flakePos), local=fract(flakePos);
 float powder=0.;
 float pores=0.;
 for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
   vec2 offset=vec2(float(i),float(j));
   vec2 id=cell+offset;
   vec2 center=vec2(hash(id+17.3),hash(id+83.7));
   vec2 d=local-offset-center;
   float radius=mix(.18,.48,hash(id+41.9));
   float fleck=1.-smoothstep(radius*.15,radius,length(d*vec2(1.,mix(.7,1.5,hash(id+9.)))));
   powder=max(powder,fleck);
   pores=max(pores,(1.-smoothstep(.03,.16,length(d+vec2(.23,.19))))*.4);
 }
 float loose=1.-material.b*.45;
 color+=snow*loose*(vec3(powder*.036)-vec3(.045,.035,.023)*pores+vec3((grain-.5)*.027));
 // Stationary layered crystals belong to the surface and soften under compression.
 if(snow>.5){
   vec4 crystals=texture2D(snowCrystals,screen);
   float intact=1.-smoothstep(.02,.85,material.b);
   float relief=mix(.18,.65,intact);
   color=mix(color,crystals.rgb*ambient,crystals.a*relief);
   // Glints: loose crystals catch the light, more of them the harder the music sparkles.
   float glint=smoothstep(1.-.035*sparkle,1.,hash(floor(pixel*.8)))*intact;
   color+=vec3(.95,.98,1.)*glint*sparkle*.3;
 }
 // Compaction stays white, with restrained cool shading rather than blue ice.
 color=mix(color,color*vec3(.975,.983,.99),material.b*snow*.45);
 color*=1.-.075*pow(length(screen-.5),2.);
 // A soft pool of light drifting across the surface (warm on sand, cooler on snow), and an overall exposure.
 vec2 toSpot=(screen-spot.xy)*vec2(size.x/size.y,1.);
 color*=exposure+spot.z*exp(-dot(toSpot,toSpot)*9.)*mix(vec3(.55,.45,.32),vec3(.36,.40,.46),snow);
 gl_FragColor=vec4(color,1.);
}`

/** Full-resolution grain is shaded separately from the coarser simulation grid. */
export class GranularRenderer {
  /** Light the sand can be played with; these defaults are the Sand study's fixed afternoon sun. */
  light = { sun: [-.45, -.75, .40] as [number, number, number], fine: [-.55, -.72, .65] as [number, number, number], shadow: [.88, .88, .88] as [number, number, number], sparkle: 0, spot: [.5, .5, 0] as [number, number, number], exposure: 1 }
  /** Scrolling, for an endless surface: the sub-cell offset (0..1) and the distance travelled in screen pixels. */
  scroll = { cells: 0, travel: 0, on: false }
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private texture: WebGLTexture
  private crystals: WebGLTexture
  private crystalSize = ''
  private bytes = new Uint8Array(0)
  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true })
    if (!gl) throw Error('This material study needs WebGL. Try a browser with graphics acceleration.')
    this.gl = gl
    const shader = (kind: number, source: string) => {
      const s = gl.createShader(kind)!; gl.shaderSource(s, source); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s) || 'Material shader failed')
      return s
    }
    const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}')
    const pixel = shader(gl.FRAGMENT_SHADER, fragment)
    const program = gl.createProgram()!; gl.attachShader(program, vertex); gl.attachShader(program, pixel); gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program) || 'Material shader link failed')
    this.program = program; gl.deleteShader(vertex); gl.deleteShader(pixel); gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    this.crystals = gl.createTexture()!
    this.texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  private prepareCrystals(width: number, height: number) {
    const key = `${width}:${height}`
    if (key === this.crystalSize) return
    this.crystalSize = key
    const layer = document.createElement('canvas')
    const scale = Math.min(1.5, 2048 / Math.max(width, height))
    layer.width = Math.ceil(width * scale); layer.height = Math.ceil(height * scale)
    const ctx = layer.getContext('2d')!
    ctx.scale(scale, scale)
    let seed = 7193
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296 }
    // Two depths of independently scattered six-arm crystals, baked once per resize.
    for (let depth = 0; depth < 2; depth++) {
      const count = Math.ceil(width * height / (depth ? 68 : 14))
      for (let i = 0; i < count; i++) {
        const x = random() * width, y = random() * height
        const radius = depth ? 1.8 + random() * 2.6 : .8 + random() * 1.7
        ctx.save(); ctx.translate(x, y); ctx.rotate(random() * Math.PI * 2)
        ctx.beginPath()
        for (let arm = 0; arm < 6; arm++) {
          ctx.moveTo(0, 0); ctx.lineTo(0, -radius)
          ctx.moveTo(-radius * .25, -radius * .77); ctx.lineTo(0, -radius * .52); ctx.lineTo(radius * .25, -radius * .77)
          ctx.rotate(Math.PI / 3)
        }
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.strokeStyle = depth ? 'rgba(191,204,212,.14)' : 'rgba(208,217,223,.10)'
        ctx.lineWidth = depth ? 1.4 : 1.1; ctx.stroke()
        ctx.strokeStyle = depth ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.82)'
        ctx.lineWidth = depth ? 1.0 : .8; ctx.stroke(); ctx.restore()
      }
    }
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.crystals)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer)
    gl.activeTexture(gl.TEXTURE0)
  }
  render(surface: SandSurface, width: number, height: number) {
    const gl = this.gl
    if (gl.isContextLost()) return
    this.prepareCrystals(surface.snow ? width : 1, surface.snow ? height : 1)
    if (this.bytes.length !== surface.levels.length * 4) this.bytes = new Uint8Array(surface.levels.length * 4)
    for (let i = 0; i < surface.levels.length; i++) {
      // Sand lighting uses the resting dune: displaced shoulders must never create halos.
      // Actual depression and pile heights are shaded subtractively through B/A.
      const lightingHeight = surface.snow ? surface.levels[i] : surface.base[i]
      const value = Math.round(Math.max(0, Math.min(3.99, lightingHeight)) / 4 * 65025)
      this.bytes[i * 4] = Math.floor(value / 255); this.bytes[i * 4 + 1] = value % 255
      // Snow stores compaction; sand stores actual remaining depression depth.
      this.bytes[i * 4 + 2] = (surface.snow ? surface.compact[i] : Math.min(1, Math.max(0, surface.base[i] - surface.levels[i]) / .5)) * 255; this.bytes[i * 4 + 3] = (surface.snow ? surface.disturbed[i] : Math.min(1, Math.max(0, surface.levels[i] - surface.base[i]) / .5)) * 255
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height); gl.useProgram(this.program); gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, surface.width, surface.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.bytes)
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.crystals)
    gl.uniform1i(gl.getUniformLocation(this.program, 'snowCrystals'), 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.uniform1i(gl.getUniformLocation(this.program, 'terrain'), 0)
    gl.uniform2f(gl.getUniformLocation(this.program, 'grid'), surface.width, surface.height)
    gl.uniform2f(gl.getUniformLocation(this.program, 'size'), width, height)
    gl.uniform1f(gl.getUniformLocation(this.program, 'snow'), surface.snow ? 1 : 0)
    gl.uniform3fv(gl.getUniformLocation(this.program, 'sunDir'), this.light.sun)
    gl.uniform3fv(gl.getUniformLocation(this.program, 'fineSun'), this.light.fine)
    gl.uniform3fv(gl.getUniformLocation(this.program, 'snowShadow'), this.light.shadow)
    gl.uniform1f(gl.getUniformLocation(this.program, 'sparkle'), this.light.sparkle)
    gl.uniform3fv(gl.getUniformLocation(this.program, 'spot'), this.light.spot)
    gl.uniform1f(gl.getUniformLocation(this.program, 'exposure'), this.light.exposure)
    // While scrolling, the last column is held back so the view can slide across it smoothly.
    const g = surface.width, s = this.scroll
    gl.uniform2f(gl.getUniformLocation(this.program, 'view'), s.on ? (g - 1) / g : 1, s.on ? s.cells / g : 0)
    gl.uniform1f(gl.getUniformLocation(this.program, 'travel'), s.on ? s.travel % 8192 : 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}
