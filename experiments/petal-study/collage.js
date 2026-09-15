import { cutoutOutline } from './cutout-outline.js';
// Cut the existing photograph into contiguous paper fragments.
export function createCollage(source, size) {
  const pixels=source.getContext('2d').getImageData(0,0,size,size);
  const seeds=[{x:.5,y:.88},{x:.31,y:.77},{x:.7,y:.78},{x:.5,y:.45}];
  for(let ring=0;ring<2;ring++)for(let i=0;i<7;i++){
    const angle=i/7*Math.PI*2+ring*.35;
    seeds.push({x:.5+Math.cos(angle)*(.14+ring*.18),y:.43+Math.sin(angle)*(.12+ring*.19)});
  }
  const buckets=seeds.map(()=>[]);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const offset=(y*size+x)*4;
    if(Math.max(pixels.data[offset],pixels.data[offset+1],pixels.data[offset+2])<18)continue;
    let best=Infinity,index=0;
    seeds.forEach((seed,i)=>{
      const dx=x/size-seed.x,dy=y/size-seed.y;
      const distance=dx*dx+dy*dy;
      if(distance<best){best=distance;index=i;}
    });
    buckets[index].push(offset);
  }
  const pieces=buckets.filter(bucket=>bucket.length).map((bucket,id)=>{
    let x0=size,y0=size,x1=0,y1=0;
    for(const offset of bucket){const x=offset/4%size,y=Math.floor(offset/4/size);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    const sprite=document.createElement('canvas');sprite.width=x1-x0+1;sprite.height=y1-y0+1;
    const sc=sprite.getContext('2d'),cut=sc.createImageData(sprite.width,sprite.height);
    for(const offset of bucket){
      const x=offset/4%size-x0,y=Math.floor(offset/4/size)-y0,index=(y*sprite.width+x)*4;
      cut.data.set(pixels.data.subarray(offset,offset+4),index);
    }
    sc.putImageData(cut,0,0);
    const outline=cutoutOutline(sprite);
    return {id,sprite,outline,alpha:cut.data,x0,y0,cx:(x0+x1)/2,cy:(y0+y1)/2,x:0,y:0,rotation:0,lift:0};
  });
  let order=[...pieces],hover=null,drag=null,selected=null,grab=null,pointer=null;
  function reset(){
    order=[...pieces];hover=drag=selected=grab=pointer=null;
    for(const p of pieces){p.x=0;p.y=0;p.rotation=0;p.lift=0;}
  }
  function local(p,point){
    const angle=p.rotation-p.lift*.012,scale=1+p.lift*.005;
    const x=point.x-p.cx-p.x,y=point.y-p.cy-p.y+p.lift*4;
    return {x:(x*Math.cos(angle)+y*Math.sin(angle))/scale+p.cx-p.x0,
      y:(-x*Math.sin(angle)+y*Math.cos(angle))/scale+p.cy-p.y0};
  }
  function hit(point){
    return [...order].reverse().find(p=>{
      const q=local(p,point),x=Math.floor(q.x),y=Math.floor(q.y);
      return x>=0&&y>=0&&x<p.sprite.width&&y<p.sprite.height&&p.alpha[(y*p.sprite.width+x)*4+3]>30;
    }) || null;
  }
  reset();
  return {
    reset,
    move(point){
      pointer=point;
      if(drag){
        drag.x=Math.max(15,Math.min(size-15,point.x-grab.x))-drag.cx;
        drag.y=Math.max(15,Math.min(size-15,point.y-grab.y))-drag.cy;
        return 'grabbing';
      }
      hover=hit(point);return hover?'grab':'default';
    },
    down(point){
      pointer=point;
      drag=hit(point);hover=drag;selected=drag;
      if(drag){grab={x:point.x-drag.cx-drag.x,y:point.y-drag.cy-drag.y};order=order.filter(p=>p!==drag);order.push(drag);}
      return !!drag;
    },
    up(){drag=null;grab=null;pointer=null;hover=null;},
    leave(){pointer=null;if(!drag)hover=null;},
    key(key,large){
      if(key==='r'||key==='R'){reset();return true;}
      if(key==='Enter'||key===' '){selected=pieces[(pieces.indexOf(selected)+1)%pieces.length];hover=selected;return true;}
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[key];
      if(!delta)return false;
      selected ||= pieces[0];hover=selected;
      selected.x=Math.max(15,Math.min(size-15,selected.cx+selected.x+delta[0]*(large?20:6)))-selected.cx;
      selected.y=Math.max(15,Math.min(size-15,selected.cy+selected.y+delta[1]*(large?20:6)))-selected.cy;
      order=order.filter(p=>p!==selected);order.push(selected);return true;
    },
    draw(ctx,dt,reduced){
      ctx.save();ctx.globalAlpha=.12;ctx.drawImage(source,0,0);ctx.restore();
      for(const p of order){
        const dx=pointer?p.cx-pointer.x:0,dy=pointer?p.cy-pointer.y:0;
        const distance=Math.hypot(dx,dy),radius=size*.23;
        const influence=pointer?Math.pow(Math.max(0,1-distance/radius),2):0;
        const target=p===drag?1:Math.max(influence,p===hover?.65:0);
        const ease=1-Math.exp(-dt*(target>p.lift?7:3));
        p.lift=reduced?0:p.lift+(target-p.lift)*ease;
        if(p!==drag){
          const reach=reduced?0:influence*size*.018;
          const tx=dx/Math.max(distance,1)*reach;
          const ty=dy/Math.max(distance,1)*reach-influence*size*.012;
          p.x+=(tx-p.x)*ease;p.y+=(ty-p.y)*ease;
        }
        const turn=reduced?0:influence*(dx<0?-.035:.035);
        p.rotation+=(turn-p.rotation)*ease;
        ctx.save();ctx.translate(p.cx+p.x,p.cy+p.y-p.lift*4);ctx.rotate(p.rotation-p.lift*.012);ctx.scale(1+p.lift*.005,1+p.lift*.005);
        ctx.translate(p.x0-p.cx,p.y0-p.cy);
        ctx.drawImage(p.sprite,0,0);
        ctx.strokeStyle=`rgba(255,250,245,${.08+p.lift*.12})`;ctx.lineWidth=.35;ctx.lineJoin='round';ctx.setLineDash([]);
        ctx.stroke(p.outline);ctx.restore();
      }
    }
  };
}
