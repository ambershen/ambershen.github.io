// Persistent, local brush reveal of the existing colored-pencil artwork.
export function createPencilReveal(image, size) {
  const layer = () => { const c=document.createElement('canvas');c.width=c.height=size;return c; };
  const source=layer(), outline=layer(), mask=layer(), painted=layer();
  const sourceContext=source.getContext('2d',{willReadFrequently:true});
  sourceContext.drawImage(image,0,0,size,size);
  const small=document.createElement('canvas');small.width=small.height=size/2;
  const sc=small.getContext('2d',{willReadFrequently:true});
  sc.drawImage(image,0,0,small.width,small.height);
  const pixels=sc.getImageData(0,0,small.width,small.height);
  const edges=sc.createImageData(small.width,small.height);
  const gray=(x,y)=>{const i=(y*small.width+x)*4;return pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722;};
  for(let y=1;y<small.height-1;y++)for(let x=1;x<small.width-1;x++){
    const dx=gray(x+1,y)-gray(x-1,y),dy=gray(x,y+1)-gray(x,y-1);
    const edge=Math.max(0,Math.hypot(dx,dy)-12);
    const i=(y*small.width+x)*4;
    edges.data[i]=204;edges.data[i+1]=184;edges.data[i+2]=174;
    edges.data[i+3]=Math.min(65,edge*.65);
  }
  sc.putImageData(edges,0,0);
  outline.getContext('2d').drawImage(small,0,0,size,size);
  const mc=mask.getContext('2d'),pc=painted.getContext('2d');
  let stamps=0;
  function stamp(x,y,radius){
    const glow=mc.createRadialGradient(x,y,5,x,y,radius);
    glow.addColorStop(0,'rgba(255,255,255,.30)');glow.addColorStop(1,'rgba(255,255,255,0)');
    mc.fillStyle=glow;mc.fillRect(x-radius,y-radius,radius*2,radius*2);
    mc.lineWidth=1.4;mc.strokeStyle='rgba(255,255,255,.55)';mc.lineCap='round';
    // Parallel pencil marks soften into a complete drawing as strokes overlap.
    for(let i=0;i<18;i++){
      const angle=(i*2.39996+stamps*.7),r=Math.sqrt((i+.5)/18)*radius*.85;
      const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r;
      mc.beginPath();mc.moveTo(px-5,py+7);mc.lineTo(px+5,py-7);mc.stroke();
    }
    stamps++;
  }
  return {
    reset(){mc.clearRect(0,0,size,size);pc.clearRect(0,0,size,size);stamps=0;},
    paint(from,to,radius=35){
      const distance=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(distance/5));
      for(let i=1;i<=steps;i++)stamp(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps,radius);
      pc.clearRect(0,0,size,size);pc.globalCompositeOperation='source-over';pc.drawImage(source,0,0);
      pc.globalCompositeOperation='destination-in';pc.drawImage(mask,0,0);pc.globalCompositeOperation='source-over';
    },
    draw(ctx){ctx.drawImage(outline,0,0);ctx.drawImage(painted,0,0);}
  };
}
