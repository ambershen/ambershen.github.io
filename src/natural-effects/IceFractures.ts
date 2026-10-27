type P = {x:number;y:number}
type Edge = {points:P[];width:number;open:number;target:number;cells:number[]}
type Cell = {polygon:P[];center:P;shade:number;edges:number[];sink:number}
type Ray = {points:P[];progress:number;width:number}
type Load = {origin:P;amount:number;rays:Ray[]}
const distance=(a:P,b:P)=>Math.hypot(a.x-b.x,a.y-b.y)
const mix=(a:P,b:P,t:number):P=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})
// Shared rough boundaries keep the neighboring ice plates fitted together.
function rough(a:P,b:P,depth=3):P[]{
 if(!depth||distance(a,b)<8)return[a,b]
 const m=mix(a,b,.4+Math.random()*.2),dx=b.x-a.x,dy=b.y-a.y,j=(Math.random()-.5)*.22
 m.x-=dy*j;m.y+=dx*j
 return [...rough(a,m,depth-1).slice(0,-1),...rough(m,b,depth-1)]
}
function clip(poly:P[],a:P,b:P){
 const nx=b.x-a.x,ny=b.y-a.y,c=(b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y)/2
 const out:P[]=[]
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dp=p.x*nx+p.y*ny-c,dq=q.x*nx+q.y*ny-c
  if(dp<=0)out.push(p)
  if((dp<=0)!==(dq<=0))out.push(mix(p,q,dp/(dp-dq)))
 }
 return out
}
export class IceFractures {
 edges:Edge[]=[];cells:Cell[]=[];loads=new Map<number,Load>()
 reset(w:number,h:number){
  this.edges=[];this.cells=[];this.loads.clear()
  const step=Math.max(100,Math.min(w,h)*.30),sites:P[]=[]
  for(let y=-step*.4;y<h+step;y+=step)for(let x=-step*.4;x<w+step;x+=step)sites.push({x:x+Math.random()*step*.95,y:y+Math.random()*step*.95})
  const index=new Map<string,number>()
  sites.forEach((a,i)=>{
   let poly:P[]=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}]
   for(let j=0;j<sites.length&&poly.length;j++)if(j!==i)poly=clip(poly,a,sites[j])
   if(poly.length<3)return
   const cell:Cell={polygon:[],center:a,shade:Math.random(),edges:[],sink:0},ci=this.cells.length
   for(let j=0;j<poly.length;j++){
    const p=poly[j],q=poly[(j+1)%poly.length]
    const key=[`${p.x.toFixed(2)},${p.y.toFixed(2)}`,`${q.x.toFixed(2)},${q.y.toFixed(2)}`].sort().join('|')
    let ei=index.get(key)
    if(ei===undefined){ei=this.edges.length;index.set(key,ei);this.edges.push({points:rough(p,q),width:.6+Math.random()*2.8,open:0,target:0,cells:[]})}
    const edge=this.edges[ei];edge.cells.push(ci);cell.edges.push(ei)
    const path=distance(edge.points[0],p)<1?edge.points:[...edge.points].reverse()
    cell.polygon.push(...path.slice(0,-1))
   }
   this.cells.push(cell)
  })
 }
 press(id:number,p:P,stress:number,dt:number){
  let load=this.loads.get(id)
  if(!load||distance(load.origin,p)>35){
   const rays:Ray[]=[]
   const count=5+Math.floor(Math.random()*3),offset=Math.random()*6.28
   for(let i=0;i<count;i++){
    let angle=offset+i/count*6.28+(Math.random()-.5)*.5,pos={...p};const points=[pos]
    for(let j=0;j<22;j++){
     angle+=(Math.random()-.5)*.65
     pos={x:pos.x+Math.cos(angle)*(9+Math.random()*13),y:pos.y+Math.sin(angle)*(9+Math.random()*13)};points.push(pos)
    }
    rays.push({points,progress:0,width:.7+Math.random()*1.8})
    // Unequal side branches grow from the same advancing fracture.
    const start=points[4],end={x:start.x+Math.cos(angle+1)*110,y:start.y+Math.sin(angle+1)*110}
    rays.push({points:[...points.slice(0,5),...rough(start,end,4).slice(1)],progress:0,width:.5+Math.random()})
   }
   load={origin:{...p},amount:0,rays};this.loads.set(id,load)
  }
  load.amount=Math.max(load.amount,stress)
  if(stress<.3)return 0
  let growth=0
  for(const ray of load.rays){const previous=ray.progress;ray.progress=Math.min(ray.points.length-1,ray.progress+dt*(2+stress*3));growth+=ray.progress-previous}
  for(const edge of this.edges){
   let d=Infinity
   for(const point of edge.points)d=Math.min(d,distance(p,point))
   // Pressure widens nearby seams first; the response spreads out as load builds.
   const reach=25+stress*90
   if(d<reach)edge.target=Math.max(edge.target,Math.min(1,(1-d/reach)*stress*.48))
  }
  return growth>0?stress:0
 }
 release(id:number){
  // Preserve the damage while freeing the pointer id for a fresh contact.
  const load=this.loads.get(id);if(load){this.loads.delete(id);this.loads.set(-performance.now()-Math.random(),load)}
  while(this.loads.size>24)this.loads.delete(this.loads.keys().next().value!)
 }
 draw(g:CanvasRenderingContext2D,texture:HTMLCanvasElement,dt:number){
  const path=(points:P[])=>{g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath()}
  for(const edge of this.edges)edge.open+=(edge.target-edge.open)*(1-Math.exp(-dt*5))
  for(const cell of this.cells){
   const pressure=cell.edges.reduce((s,i)=>s+this.edges[i].open,0)/cell.edges.length
   cell.sink+=(Math.max(0,pressure-.35)*9-cell.sink)*(1-Math.exp(-dt*3))
   g.save();path(cell.polygon);g.fillStyle=`rgba(${cell.shade>.5?'255,255,252':'63,70,66'},${.035+cell.shade*.09})`;g.fill()
   if(cell.sink>.2){
    g.fillStyle='#58605b';g.fill();g.translate(cell.sink*.45,cell.sink);path(cell.polygon);g.clip();g.drawImage(texture,0,0);g.fillStyle='#ffffff0a';g.fillRect(0,0,texture.width,texture.height)
   }
   g.restore()
  }
  const seam=(points:P[],width:number,strength:number,progress=points.length-1)=>{
   for(let i=0;i<Math.min(points.length-1,Math.ceil(progress));i++){
    const a=points[i],b=mix(a,points[i+1],Math.min(1,progress-i)),t=i/(points.length-1)
    const varied=width*(.55+Math.sin(t*9+width)*.23+Math.sin(t*23)*.12)
    const line=()=>{g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
    g.strokeStyle=`rgba(245,247,241,${.12+strength*.15})`;g.lineWidth=varied*4+strength*3;line()
    g.strokeStyle=`rgba(65,75,69,${.16+strength*.35})`;g.lineWidth=varied+strength*2;line()
    g.save();g.translate(-.8,-1);g.strokeStyle=`rgba(255,255,249,${.35+strength*.45})`;g.lineWidth=Math.max(.5,varied*.6);line();g.restore()
   }
  }
  g.lineJoin='round';g.lineCap='round'
  for(const edge of this.edges)if(edge.cells.length>1)seam(edge.points,edge.width,edge.open)
  for(const load of this.loads.values())for(const ray of load.rays)if(ray.progress>0)seam(ray.points,ray.width,Math.min(1,load.amount*.4),ray.progress)
 }
}
