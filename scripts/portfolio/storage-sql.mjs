import {readFile,writeFile} from 'node:fs/promises';
const verified=JSON.parse(await readFile('.portfolio/verified-storage.json','utf8'));
const quote=value=>"'"+value.replaceAll("'","''")+"'";
// Replace exact JSON string values, preserving current copy and ordering in the DB.
const statements=[];
for(const [path,url] of Object.entries(verified)){
  for(const source of new Set([path,encodeURI(path)])){
    statements.push(`update public.portfolio_entries set payload=replace(payload::text,${quote(JSON.stringify(source))},${quote(JSON.stringify(url))})::jsonb where published and strpos(payload::text,${quote(JSON.stringify(source))})>0;`);
  }
}
await writeFile('.portfolio/storage-urls.sql','begin;\n'+statements.join('\n')+'\ncommit;\n');
console.log(`Prepared URL-only migration for ${Object.keys(verified).length} verified assets`);
