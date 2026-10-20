import flowerURL from './flower.webp';
import pencilURL from './flower-pencil.webp';
import portraitURL from './portrait.webp';
import { createBreeze } from './breeze.js';
import { createCollage } from './collage.js';
import { createPencilReveal } from './pencil-reveal.js';

const canvas = document.querySelector('#flower');
const ctx = canvas.getContext('2d');
const state = document.querySelector('#state');
const loading = document.querySelector('#loading');
const words = [...document.querySelectorAll('[data-mode]')];
const mobileLayout=matchMedia('(max-width: 600px)');
const intro=document.querySelector('.intro');
const introToggle=document.querySelector('#intro-toggle');
const resetControl=document.querySelector('#mobile-reset');
const touchHint=document.querySelector('#touch-hint');
const mobileReading=document.querySelector('#mobile-reading');
// Move the original nodes: preserve links and progressive state.
const movable=['#chapter-three'].map(selector=>{
  const node=document.querySelector(selector),anchor=document.createComment('desktop reading position');
  node.before(anchor);return {node,anchor};
});
function arrangeReading(){
  for(const {node,anchor} of movable){if(mobileLayout.matches)mobileReading.append(node);else anchor.after(node);}
}
arrangeReading();mobileLayout.addEventListener('change',arrangeReading);
introToggle.addEventListener('click',()=>{
  const expanded=intro.classList.toggle('show-intro');
  introToggle.setAttribute('aria-expanded',String(expanded));introToggle.textContent=expanded?'Collapse introduction':'Read introduction';
});
resetControl.addEventListener('click',()=>{if(ready)chooseMode(mode);});
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = 640;
const groups = [];
let width = 0, height = 0, scale = 1, ox = 0, oy = 0;
let now = 0, previous = 0, pointer = null, paused = reduced, demoStart = null;
let restore = false, lastTouch = 0, ready = false;
let mode = 'bloom', bloomStart = null;
let flowerSource = null;
let pencilReveal=null;
let renderBreeze=null, collage=null;
const BLOOM_DURATION=3.6;
let revealAfterBloom=false;
let portrait=null, portraitReveal=0;
let playfulPortrait=false, polaroidStart=null, wiggleStart=null;

let photoLeanX=0,photoLeanY=0;
const playControl=document.querySelector('#play');
playControl.addEventListener('click',()=>{
  if(!ready)return;
  if(mode!=='chaos')chooseMode('chaos');
  playfulPortrait=true;polaroidStart=null;
  playControl.classList.add('selected');playControl.setAttribute('aria-pressed','true');
  resetFog();
  touchHint.textContent='Wipe the mist to find me';
  canvas.tabIndex=0;canvas.style.cursor='crosshair';
  canvas.setAttribute('aria-label','Misted portrait. Brush or drag to wipe the glass. Press Enter to clear it, or R to mist it again.');
});
const fogMask=document.createElement('canvas'),fogLayer=document.createElement('canvas'),fogImage=document.createElement('canvas');
for(const surface of [fogMask,fogLayer,fogImage])surface.width=surface.height=N;
const fogMaskCtx=fogMask.getContext('2d'),fogCtx=fogLayer.getContext('2d');
let fogReady=false,lastWipe=0,photoInverse=new DOMMatrix();
function resetFog(){fogMaskCtx.globalCompositeOperation='source-over';fogMaskCtx.fillStyle='#fff';fogMaskCtx.fillRect(0,0,N,N);lastWipe=performance.now()/1000;}
function wipeFog(from,to,radius=35){
  const a=new DOMPoint(from.x,from.y).matrixTransform(photoInverse),b=new DOMPoint(to.x,to.y).matrixTransform(photoInverse);
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));
  fogMaskCtx.globalCompositeOperation='destination-out';
  for(let i=0;i<=steps;i++){
    const x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;
    const brush=fogMaskCtx.createRadialGradient(x,y,radius*.45,x,y,radius);
    brush.addColorStop(0,'#000');brush.addColorStop(1,'#0000');fogMaskCtx.fillStyle=brush;fogMaskCtx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  fogMaskCtx.globalCompositeOperation='source-over';lastWipe=performance.now()/1000;
}
function drawFog(x,y,w,h,entry,dt){
  if(!fogReady){
    const c=fogImage.getContext('2d');c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.filter='blur(18px)';c.drawImage(portrait,x-12,y-16,w+24,h+32);c.restore();
    c.fillStyle='#d5dee0b8';c.fillRect(x,y,w,h);fogReady=true;
  }
  if(!reduced && performance.now()/1000-lastWipe>4){fogMaskCtx.fillStyle=`rgba(255,255,255,${1-Math.exp(-dt*.16)})`;fogMaskCtx.fillRect(0,0,N,N);}
  fogCtx.clearRect(0,0,N,N);fogCtx.drawImage(fogImage,0,0);fogCtx.globalCompositeOperation='destination-in';fogCtx.drawImage(fogMask,0,0);fogCtx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=entry;ctx.drawImage(fogLayer,0,0);ctx.restore();
}
const portraitLayer=document.createElement('canvas');
portraitLayer.width=portraitLayer.height=N;
const portraitContext=portraitLayer.getContext('2d');
const portraitMask=document.createElement('canvas');
portraitMask.width=portraitMask.height=N;
const maskContext=portraitMask.getContext('2d');
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
function drawPortrait(dt){
  const dissolved=groups.reduce((sum,g)=>sum+(g.born===null?0:smooth((now-g.born-.3)/1.8)),0)/groups.length;
  portraitReveal=paused?dissolved:portraitReveal+(dissolved-portraitReveal)*Math.min(dt*3,1);
  const completion=smooth((portraitReveal-.5)/.5);
  maskContext.clearRect(0,0,N,N);
  // Soft overlapping openings follow each petal, then fill out the photograph.
  for(const g of groups){
    if(g.born===null)continue;
    const progress=smooth((now-g.born-.25)/1.8);
    if(progress<=0)continue;
    const radius=30+progress*110;
    const gradient=maskContext.createRadialGradient(g.cx,g.cy,0,g.cx,g.cy,radius);
    gradient.addColorStop(0,`rgba(255,255,255,${progress*.85})`);
    gradient.addColorStop(1,'rgba(255,255,255,0)');
    maskContext.fillStyle=gradient;maskContext.fillRect(g.cx-radius,g.cy-radius,radius*2,radius*2);
  }
  maskContext.fillStyle=`rgba(255,255,255,${completion})`;
  maskContext.fillRect(0,0,N,N);
  const fit=Math.min(510/portrait.naturalWidth,580/portrait.naturalHeight);
  const w=portrait.naturalWidth*fit,h=portrait.naturalHeight*fit;
  portraitContext.clearRect(0,0,N,N);
  portraitContext.drawImage(portrait,(N-w)/2,(N-h)/2,w,h);

  portraitContext.globalCompositeOperation='destination-in';
  portraitContext.drawImage(portraitMask,0,0);
  portraitContext.globalCompositeOperation='source-over';
  let entry=0;
  if(playfulPortrait && portraitReveal>.9){
    if(polaroidStart===null){polaroidStart=now;}
    entry=reduced?1:smooth((now-polaroidStart)/.65);
  }
  const age=wiggleStart===null?10:now-wiggleStart;
  const targetX=pointer && playfulPortrait?Math.max(-1,Math.min(1,(pointer.x-N/2)/220)):0;
  const targetY=pointer && playfulPortrait?Math.max(-1,Math.min(1,(pointer.y-N/2)/290)):0;
  const follow=1-Math.exp(-dt*7);
  photoLeanX+=(targetX-photoLeanX)*follow;photoLeanY+=(targetY-photoLeanY)*follow;
  const angle=entry*(.065+(reduced?0:photoLeanX*.035+Math.sin(age*7)*Math.exp(-age*2.5)*.05));
  const bounce=reduced?0:Math.sin(Math.min(age/.65,1)*Math.PI)*.035;
  const shrink=1-entry*.14+bounce*entry;
  const baseTransform=ctx.getTransform();
  ctx.save();ctx.translate(N/2,N/2-(reduced?0:entry*photoLeanY*5));ctx.rotate(angle);
  if(!reduced)ctx.transform(1,photoLeanX*.012*entry,-photoLeanY*.018*entry,1,0,0);
  ctx.scale(shrink,shrink);ctx.translate(-N/2,-N/2);
  if(entry>0){
    ctx.save();ctx.globalAlpha=entry;
    ctx.fillStyle='#f6f0e7';ctx.shadowColor='#0005';ctx.shadowBlur=18;ctx.shadowOffsetY=10;
    ctx.fillRect((N-w)/2-18,(N-h)/2-18,w+36,h+76);
    ctx.shadowColor='transparent';ctx.fillStyle='#76665d';ctx.font='400 18px Manrope,sans-serif';ctx.textAlign='center';
    ctx.fillText('wipe to say hello',N/2,(N+h)/2+36);ctx.restore();
  }
  photoInverse=baseTransform.inverse().multiply(ctx.getTransform()).inverse();
  ctx.drawImage(portraitLayer,0,0);
  if(entry>0)drawFog((N-w)/2,(N-h)/2,w,h,entry,dt);
  ctx.restore();
}
const random = (seed) => {const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};

function resize(){
  if(!canvas.clientWidth || !canvas.clientHeight)return;
  width = canvas.clientWidth; height = canvas.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  // The canvas owns a dedicated layout cell on every screen size.
  scale = Math.min(width*.94/N,height*.94/N);
  ox = width*.5 - N*scale/2;
  oy = height*.5 - N*scale/2;
}
new ResizeObserver(resize).observe(canvas);

// Contiguous image patches behave as petals first, then resolve into colored pixels.
// This is a 2D material/interaction study, not semantic petal segmentation.
function prepare(image){
  const source = document.createElement('canvas'); source.width=source.height=N;
  const sc = source.getContext('2d',{willReadFrequently:true}); sc.drawImage(image,0,0,N,N);
  flowerSource = source;
  const rgba = sc.getImageData(0,0,N,N).data;
  const seeds = [];
  for(let ring=0;ring<6;ring++){
    const count=ring===0?5:10+ring*4;
    for(let k=0;k<count;k++){
      const a=k/count*Math.PI*2+ring*.37;
      const r=25+ring*48;
      seeds.push({x:N*.5+Math.cos(a)*r,y:N*.44+Math.sin(a)*r*.8});
    }
  }
  const buckets=seeds.map(()=>[]);
  // A small sample grid preserves photographic texture while bounding particle count.
  for(let y=0;y<N;y+=4)for(let x=0;x<N;x+=4){
    const i=(y*N+x)*4;
    if(rgba[i+3]<30 || Math.max(rgba[i],rgba[i+1],rgba[i+2])<19)continue;
    let index=0,best=Infinity;
    seeds.forEach((s,k)=>{const d=(x-s.x)**2+(y-s.y)**2*1.3;if(d<best){best=d;index=k;}});
    const luminance=(rgba[i]*.2126+rgba[i+1]*.7152+rgba[i+2]*.0722)/255;
    const glyphs='.,:;-=+*#%@';
    buckets[index].push({x,y,color:`rgb(${rgba[i]},${rgba[i+1]},${rgba[i+2]})`,seed:random(x*3+y*7),
      codeCell:x%8===0 && y%12===0,
      glyph:glyphs[Math.min(glyphs.length-1,Math.floor(luminance*glyphs.length))],
      codeColor:`rgb(${rgba[i]},${rgba[i+1]},${rgba[i+2]})`});
  }
  buckets.forEach((particles,id)=>{
    if(!particles.length)return;
    const minX=Math.min(...particles.map(p=>p.x)), minY=Math.min(...particles.map(p=>p.y));
    const maxX=Math.max(...particles.map(p=>p.x))+4, maxY=Math.max(...particles.map(p=>p.y))+4;
    const sprite=document.createElement('canvas');sprite.width=maxX-minX;sprite.height=maxY-minY;
    const c=sprite.getContext('2d');
    for(const p of particles)c.drawImage(source,p.x,p.y,4,4,p.x-minX,p.y-minY,4,4);
    const codeSprite=document.createElement('canvas');codeSprite.width=sprite.width+12;codeSprite.height=sprite.height+12;
    const cc=codeSprite.getContext('2d');
    // Keep the petal photograph readable, with a light layer of ASCII texture.
    cc.drawImage(sprite,0,0);cc.globalAlpha=.32;cc.font='12px monospace';cc.textBaseline='top';
    for(const p of particles)if(p.codeCell){cc.fillStyle=p.codeColor;cc.fillText(p.glyph,p.x-minX,p.y-minY);}
    groups.push({id,particles,sprite,codeSprite,minX,minY,cx:(minX+maxX)/2,cy:(minY+maxY)/2,born:null,age:0,returning:null,drift:(random(id)-.5)*90,spin:(random(id+44)-.5)*1.3});
  });
}

function release(g){if(g.born!==null)return;g.born=now;g.age=0;g.returning=null;lastTouch=now;}
function bloom(){restore=true;demoStart=null;pointer=null;for(const g of groups)if(g.born!==null && g.returning===null)g.returning=now;state.textContent='Finding its form again';}
function intact(){
  for(const g of groups){g.born=null;g.returning=null;g.age=0;}
  restore=false;demoStart=null;pointer=null;
  portraitReveal=0;
}
function chooseMode(next){
  playfulPortrait=false;polaroidStart=null;wiggleStart=null;photoLeanX=photoLeanY=0;playControl.classList.remove('selected');playControl.setAttribute('aria-pressed','false');
  mode=next;
  collage?.up();
  intro.classList.add('has-started');
  intro.classList.remove('show-intro');
  introToggle.setAttribute('aria-expanded','false');introToggle.textContent='Read introduction';
  touchHint.textContent={bloom:'Tap bloom to replay',code:'Touch a petal, then drag',narrative:'Draw with your fingertip',art:'Tap or brush to scatter',chaos:'Brush the petals to find me'}[next];
  canvas.style.cursor='default';
  canvas.tabIndex=next==='code'?0:-1;
  canvas.setAttribute('aria-label',next==='code'?'Floating flower petals. Brush or drag petals and release to let them return. Keyboard: Enter selects a petal, arrow keys nudge it, R resets.':'Interactive flower. Use the words in the introduction to change its appearance.');
  words.forEach(button=>{
    const selected=button.dataset.mode===next;
    button.classList.toggle('selected',selected);
    if(button.hasAttribute('aria-pressed'))button.setAttribute('aria-pressed',String(selected));
  });
  revealAfterBloom=false;
  document.querySelector('#chapter-two').hidden=false;
  document.querySelector('.desktop-collections').hidden=false;
  if(next!=='bloom')document.querySelector('#chapter-three').hidden=false;
  intact();
  if(next==='bloom'){
    bloomStart=reduced || paused ? now-BLOOM_DURATION : now;
    revealAfterBloom=!reduced && !paused;
    state.textContent='A passing breeze, a little light';
  }else if(next==='code'){
    collage.reset();
    state.textContent='A little motion, a set of rules';
  }else if(next==='narrative'){
    pencilReveal.reset();
    state.textContent='A story in pencil';
  }else if(next==='art'){
    state.textContent='The same flower, another language';
  }else{
    state.textContent='Brush the flower to find me';
    demoStart=now+.35;
    if(paused){
      // Respect a paused/reduced-motion session with a still of the effect.
      for(const g of groups){release(g);g.born=now-3;g.age=3;}
    }
  }
}
words.forEach(button=>button.addEventListener('click',()=>chooseMode(button.dataset.mode)));

function bloomProgress(){
  if(bloomStart===null)return 0;
  return Math.min(Math.max((now-bloomStart)/BLOOM_DURATION,0),1);
}
function drawBloomingFlower(){
  const progress=bloomProgress();
  const strength=reduced || bloomStart===null?0:Math.sin(progress*Math.PI)**2;
  if(!renderBreeze || strength<.001){ctx.drawImage(flowerSource,0,0);return;}
  ctx.drawImage(renderBreeze(now-bloomStart,strength,progress),0,0);
}
function drawCodeFragment(g,x,y){
  ctx.drawImage(g.codeSprite,x,y);
}
function drawResting(g){
  if(mode==='art'){
    drawCodeFragment(g,g.minX,g.minY);
  }else if(mode==='code'){
    ctx.save();ctx.translate(g.cx,g.cy);ctx.scale(.965,.965);
    ctx.drawImage(g.sprite,g.minX-g.cx,g.minY-g.cy);ctx.restore();
  }else ctx.drawImage(g.sprite,g.minX,g.minY);
}
function interact(event){
  if(event.isPrimary===false)return;
  if(!ready || restore || (mode==='bloom' && bloomProgress()<1))return;
  const rect=canvas.getBoundingClientRect();
  const previousPointer=pointer;
  pointer={x:(event.clientX-rect.left-ox)/scale,y:(event.clientY-rect.top-oy)/scale};
  if(playfulPortrait && portraitReveal>.9){wipeFog(previousPointer || pointer,pointer,event.pointerType==='touch'?48:34);return;}
  if(mode==='code'){canvas.style.cursor=collage.move(pointer);return;}
  if(mode==='narrative'){
    pencilReveal.paint(previousPointer || pointer,pointer,event.pointerType==='touch'?55:35);
    return;
  }
  if(paused)return;
  const radius=event.pointerType==='touch'?55:(event.buttons?68:40);
  const nearby=groups.filter(g=>{
    if(g.born!==null)return false;
    if(pointer.x<g.minX-radius || pointer.x>g.minX+g.sprite.width+radius ||
       pointer.y<g.minY-radius || pointer.y>g.minY+g.sprite.height+radius)return false;
    // Test the visible pixels, including narrow stems far from a patch's center.
    return g.particles.some(p=>(p.x-pointer.x)**2+(p.y-pointer.y)**2<radius**2);
  });
  nearby.slice(0,event.buttons?4:2).forEach(release);
}
canvas.addEventListener('pointermove',interact);
canvas.addEventListener('pointerdown',event=>{
  if(event.isPrimary===false)return;
  canvas.setPointerCapture(event.pointerId);
  if(mode==='code' && ready){
    const rect=canvas.getBoundingClientRect();
    const point={x:(event.clientX-rect.left-ox)/scale,y:(event.clientY-rect.top-oy)/scale};
    if(collage.down(point)){canvas.style.cursor='grabbing';canvas.focus({preventScroll:true});}
    return;
  }
  interact(event);
});
canvas.addEventListener('pointerleave',()=>{pointer=null;collage?.leave();});
canvas.addEventListener('pointerup',()=>{pointer=null;collage?.up();if(mode==='code')canvas.style.cursor='grab';});
canvas.addEventListener('pointercancel',()=>{pointer=null;collage?.up();collage?.leave();});
canvas.addEventListener('lostpointercapture',()=>{pointer=null;collage?.up();});
canvas.addEventListener('keydown',event=>{if(playfulPortrait && portraitReveal>.9 && (event.key==='Enter' || event.key===' ')){event.preventDefault();fogMaskCtx.clearRect(0,0,N,N);lastWipe=performance.now()/1000;return;}if(playfulPortrait && event.key.toLowerCase()==='r'){event.preventDefault();resetFog();return;}if(mode==='code' && collage?.key(event.key,event.shiftKey))event.preventDefault();});

function frame(timestamp){
  if(document.querySelector('#home-page').hidden){previous=timestamp;requestAnimationFrame(frame);return;}
  const dt=Math.min((timestamp-previous)/1000,.04);previous=timestamp;
  if(!paused && !document.hidden)now+=dt;
  ctx.clearRect(0,0,width,height);
  if(ready){
    if(mode!=='code' && !paused && !restore && groups.filter(g=>g.born!==null).length>=groups.length*.85){
      // Let the final leaves and stem follow once most of the flower is gone.
      groups.forEach(release);
    }
    if(revealAfterBloom && bloomProgress()>=1){
      revealAfterBloom=false;
      document.querySelector('#chapter-two').hidden=false;
      state.textContent='In bloom. A little more of me.';
    }
    if(demoStart!==null && !restore && !paused){
      for(const g of groups)if(now-demoStart>g.cy/N*2.5+random(g.id)*1.2)release(g);
      if(now-demoStart>6.5){if(mode==='chaos')demoStart=null;else bloom();}
    }
    if(mode!=='chaos' && demoStart===null && !restore && now-lastTouch>4.5 && groups.some(g=>g.born!==null))bloom();
    ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
    if(mode==='chaos' && portrait)drawPortrait(dt);
    if(mode==='code'){collage.draw(ctx,dt,reduced);}
    else if(mode!=='art' && groups.every(g=>g.born===null)){
      if(mode==='narrative'){
        pencilReveal.draw(ctx);
      }else if(mode==='bloom')drawBloomingFlower();
      else ctx.drawImage(flowerSource,0,0);
    }else for(const g of groups){
      if(g.born===null){ctx.save();ctx.globalAlpha=1;drawResting(g);ctx.restore();continue;}
      if(g.returning===null)g.age=now-g.born;
      const age=g.age;
      const back=g.returning===null?0:Math.min((now-g.returning)/1.8,1);
      const ease=back*back*(3-2*back), movement=1-ease;
      if(back>=1){g.born=null;g.returning=null;drawResting(g);continue;}
      const dx=g.drift*age,dy=18*age+45*age*age;
      const dissolve=Math.min(Math.max((age-.48)/.9,0),1);
      if(dissolve<1){
        ctx.save();ctx.globalAlpha=1-dissolve;
        ctx.translate(g.cx+dx*movement,g.cy+dy*movement);ctx.rotate(g.spin*age*movement);
        if(mode==='code')ctx.scale(.965,.965);
        if(mode==='art')drawCodeFragment(g,g.minX-g.cx,g.minY-g.cy);
        else ctx.drawImage(g.sprite,g.minX-g.cx,g.minY-g.cy);
        ctx.restore();
      }
      if(dissolve>0){
        for(const p of g.particles){
          if(mode==='art' && !p.codeCell)continue;
          const spread=Math.max(age-.45,0);
          const px=p.x+(dx+(p.seed-.5)*spread*130+Math.sin(age*1.2+p.seed*20)*spread*13)*movement;
          const py=p.y+(dy+spread*spread*(25+p.seed*30))*movement;
          const size=4*(1-.55*dissolve*movement);
          const visibility=mode==='chaos'?1-smooth((age-1.2)/1.8):Math.max(.12,1-Math.max(age-1.7,0)*.19);
          ctx.globalAlpha=dissolve*(visibility+(1-visibility)*ease);
          if(mode==='art'){
            ctx.fillStyle=p.codeColor;ctx.font='12px monospace';ctx.textBaseline='top';ctx.fillText(p.glyph,px,py);
          }else{ctx.fillStyle=p.color;ctx.fillRect(px,py,size,size);}
        }
        ctx.globalAlpha=1;
      }
    }
    ctx.restore();
    if(restore && groups.every(g=>g.born===null)){restore=false;state.textContent='In bloom';}
    if(!restore && groups.some(g=>g.born!==null))state.textContent=mode==='chaos' && portraitReveal>.95?'Hi, it’s me. Amber.':'Petals becoming pixels';
  }
  requestAnimationFrame(frame);
}
resize();requestAnimationFrame(frame);
function loadImage(url,priority='low'){
  return new Promise((resolve,reject)=>{const image=new Image();image.decoding='async';image.fetchPriority=priority;image.onload=()=>resolve(image);image.onerror=reject;image.src=url;});
}
loadImage(flowerURL,'high').then(image=>{
  prepare(image);
  renderBreeze=createBreeze(flowerSource,N);
  collage=createCollage(flowerSource,N);
  ready=true;loading.hidden=true;
  resetControl.disabled=false;
  words.forEach(button=>{button.disabled=button.dataset.mode==='narrative' || button.dataset.mode==='chaos';});
  playControl.disabled=true;
  state.textContent='Waiting for a breeze';
  // Let the first flower frame paint before preparing the secondary modes.
  requestAnimationFrame(()=>setTimeout(()=>{
    loadImage(pencilURL).then(pencil=>{
      pencilReveal=createPencilReveal(pencil,N);
      words.filter(button=>button.dataset.mode==='narrative').forEach(button=>{button.disabled=false;});
    }).catch(()=>{state.textContent='Pencil artwork unavailable. The other flower effects are ready.';});
    loadImage(portraitURL).then(photo=>{
      portrait=photo;
      words.filter(button=>button.dataset.mode==='chaos').forEach(button=>{button.disabled=false;});
      playControl.disabled=false;
    }).catch(()=>{state.textContent='Portrait unavailable. The other flower effects are ready.';});
  },0));
}).catch(()=>{loading.textContent='The flower could not load. Please reload to try again.';state.textContent='Image unavailable';});
