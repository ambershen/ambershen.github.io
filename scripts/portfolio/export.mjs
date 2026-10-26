import {createServer} from 'vite';
import {writeFile,mkdir} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false}});
try {
  const {projects,items}=await server.ssrLoadModule('/src/data/portfolio.js');
  const {films}=await server.ssrLoadModule('/src/data/site.js');
  const {caseStudies}=await server.ssrLoadModule('/src/data/case-studies.js');
  const {videoPoster}=await server.ssrLoadModule('/src/data/video-posters.js');
  const attach=value=>{
    if(Array.isArray(value))return value.map(attach);
    if(value&&typeof value==='object'){
      const obj=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,attach(v)]));
      const video=value.video||value.src;
      if(video){const poster=videoPoster(video)||videoPoster(new URL(video.replace(/^\//,''), 'file://'+process.cwd()+'/').href);if(poster)obj.poster=attach(poster);}
      return obj;
    }
    if(typeof value==='string'&&value.startsWith('file://'))return new URL(value).pathname.replace(process.cwd(),'');
    return value;
  };
  const records=Object.entries({projects,sketches:items,films,case_studies:caseStudies}).flatMap(([collection,list])=>list.map((payload,position)=>({collection,id:payload.id||payload.slug||payload.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),position,published:payload.status!=='draft',payload:attach(payload)})));
  await mkdir('.portfolio',{recursive:true});
  await writeFile('.portfolio/catalog.json',JSON.stringify(records,null,2));
  console.log(`Exported ${records.length} catalog records`);
} finally {await server.close();}
