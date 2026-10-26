// Public read-only key. Write credentials never belong in frontend code.
const base='https://mwfdtxlqherngwjxbsgq.supabase.co';
const key='sb_publishable_jzQpxqLscCQGfhpxVZSsVA_jHsxRSMC';
let pending;
export function loadPortfolio(){
  return pending??=fetch(`${base}/rest/v1/portfolio_entries?select=collection,id,position,payload&published=eq.true&order=position.asc`,{
    headers:{apikey:key},signal:AbortSignal.timeout(2500),
  }).then(async response=>{
    if(!response.ok)throw new Error('Catalog unavailable');
    const rows=await response.json();
    if(!Array.isArray(rows))throw new Error('Invalid catalog');
    return {projects:[],sketches:[],films:[],case_studies:[],...Object.groupBy(rows.filter(row=>row.payload&&typeof row.payload==='object'),row=>row.collection)};
  }).catch(()=>null);
}
