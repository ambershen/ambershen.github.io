// Trace exposed pixel edges into connected paths so dashes follow each cutout.
export function cutoutOutline(sprite) {
  const w=sprite.width,h=sprite.height;
  const data=sprite.getContext('2d').getImageData(0,0,w,h).data;
  const filled=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&data[(y*w+x)*4+3]>30;
  const edges=new Map(),stride=w+1;
  const add=(x,y,nx,ny)=>{
    const key=y*stride+x;
    if(!edges.has(key))edges.set(key,[]);
    edges.get(key).push(ny*stride+nx);
  };
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(filled(x,y)){
    if(!filled(x,y-1))add(x,y,x+1,y);
    if(!filled(x+1,y))add(x+1,y,x+1,y+1);
    if(!filled(x,y+1))add(x+1,y+1,x,y+1);
    if(!filled(x-1,y))add(x,y+1,x,y);
  }
  const path=new Path2D();
  while(edges.size){
    const start=edges.keys().next().value;
    let point=start;path.moveTo(point%stride,Math.floor(point/stride));
    do{
      const options=edges.get(point);if(!options)break;
      const next=options.pop();if(!options.length)edges.delete(point);
      path.lineTo(next%stride,Math.floor(next/stride));point=next;
    }while(point!==start);
    if(point===start)path.closePath();
  }
  return path;
}
