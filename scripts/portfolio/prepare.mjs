import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const records=JSON.parse(await readFile('.portfolio/catalog.json','utf8'));
const files=new Set();
function walk(v){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')Object.values(v).forEach(walk);else if(typeof v==='string'&&/^\/(images|films)\//.test(v))files.add(decodeURIComponent(v));}
walk(records.filter(record=>record.published));
const assets=[];
for(const source of [...files].sort()){const data=await readFile('.'+source);const hash=createHash('sha256').update(data).digest('hex').slice(0,16);assets.push({source,path:'assets/'+hash+'-'+source.split('/').pop().replaceAll(' ','-'),bytes:data.length});}
await writeFile('.portfolio/assets.json',JSON.stringify(assets,null,2));
await writeFile('.portfolio/published-assets.json',JSON.stringify(assets,null,2));
console.log(`${assets.length} files, ${Math.round(assets.reduce((n,a)=>n+a.bytes,0)/1e6)} MB`);
