/** Friction slowly clears surface frost, while the underlying ice stays opaque. */
export class IceWriting {
 private mask=document.createElement('canvas')
 private reveal=document.createElement('canvas')
 private m=this.mask.getContext('2d')!
 private r=this.reveal.getContext('2d')!
 private w=1;private h=1
 resize(w:number,h:number){this.w=w;this.h=h;for(const c of [this.mask,this.reveal]){c.width=Math.ceil(w/2);c.height=Math.ceil(h/2)}}
 reset(){this.m.clearRect(0,0,this.mask.width,this.mask.height)}
 rub(ax:number,ay:number,bx:number,by:number,seconds:number){
  const length=Math.hypot(bx-ax,by-ay);if(length<.5)return
  const speed=length/Math.max(.008,seconds),steps=Math.ceil(length/2.5)
  // Fixed spatial samples: a slow or repeated pass builds heat instead of drawing ink.
  const effort=Math.min(.19,Math.max(.005,13/(speed+35)))
  for(let i=1;i<=steps;i++){
   const x=ax+(bx-ax)*i/steps,y=ay+(by-ay)*i/steps
   const grain=.48+.24*Math.sin(x*.071+y*.049)+.18*Math.sin(y*.137-x*.089)
   const radius=5.5+grain*4
   const g=this.m.createRadialGradient(x/2,y/2,0,x/2,y/2,radius/2)
   g.addColorStop(0,`rgba(255,255,255,${effort*grain})`);g.addColorStop(.45,`rgba(255,255,255,${effort*grain*.7})`);g.addColorStop(1,'rgba(255,255,255,0)')
   this.m.fillStyle=g;this.m.fillRect((x-radius)/2,(y-radius)/2,radius,radius)
  }
 }
 draw(ctx:CanvasRenderingContext2D,now:number,dt:number){
  const w=this.mask.width,h=this.mask.height
  this.m.globalCompositeOperation='destination-out';this.m.fillStyle=`rgba(0,0,0,${1-Math.exp(-dt*.075)})`;this.m.fillRect(0,0,w,h);this.m.globalCompositeOperation='source-over'
  const g=this.r;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h)
  const water=g.createLinearGradient(0,0,w,h);water.addColorStop(0,'#82918a');water.addColorStop(.55,'#65776e');water.addColorStop(1,'#9ba69e');g.fillStyle=water;g.fillRect(0,0,w,h)
  // Muted movement below the ice: only visible through the rubbed, translucent frost.
  for(let i=0;i<5;i++){
   const x=w*(.1+i*.22)+Math.sin(now*.00023+i)*12,y=h*(.2+(i%3)*.3)+Math.cos(now*.00018+i)*14,r=Math.max(w,h)*.35
   const light=g.createRadialGradient(x,y,0,x,y,r);light.addColorStop(0,'#e3e9de50');light.addColorStop(1,'#e3e9de00');g.fillStyle=light;g.fillRect(x-r,y-r,r*2,r*2)
  }
  g.globalCompositeOperation='destination-in';g.drawImage(this.mask,0,0)
  ctx.save();ctx.globalAlpha=.25;ctx.drawImage(this.reveal,0,0,this.w,this.h);ctx.restore()
 }
}
