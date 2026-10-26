import {readFile,writeFile} from 'node:fs/promises';
const assets=JSON.parse(await readFile('.portfolio/published-assets.json','utf8'));
const base='https://mwfdtxlqherngwjxbsgq.supabase.co/storage/v1/object/public/portfolio/';
const verified={};
const failed=[];
for(let i=0;i<assets.length;i+=4){
  await Promise.all(assets.slice(i,i+4).map(async asset=>{
    const url=base+asset.path.split('/').map(encodeURIComponent).join('/');
    try{
      const response=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(15000)});
      if(!response.ok||Number(response.headers.get('content-length'))!==asset.bytes)throw new Error(`${response.status}: unexpected size`);
      verified[asset.source]=url;
    }catch(error){failed.push({source:asset.source,error:error.message});}
  }));
}
await writeFile('.portfolio/verified-storage.json',JSON.stringify(verified,null,2));
console.log(JSON.stringify({verified:Object.keys(verified).length,total:assets.length,failed},null,2));
if(failed.length)process.exitCode=1;
