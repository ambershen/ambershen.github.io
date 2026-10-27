const origins = new Set(['https://ambershen.world', 'https://www.ambershen.world', 'https://ambershen.github.io', 'http://127.0.0.1:5174', 'http://localhost:5174']);
const encoder = new TextEncoder();
export function createHandler({env, fetcher = fetch, digest = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))), b => b.toString(16).padStart(2,'0')).join('')}) {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
    if (!origins.has(origin)) return Response.json({error:'Origin not allowed'}, {status:403,headers});
    Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    const reply = (status, data) => Response.json(data, {status,headers});
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
    if (request.method !== 'POST') return reply(405,{error:'Method not allowed'});
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415,{error:'Expected JSON'});
    let data;
    try {
      const reader=request.body?.getReader(); if(!reader) return reply(400,{error:'Missing body'});
      const chunks=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>24000){await reader.cancel();return reply(413,{error:'Message too large'});}chunks.push(value);}
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      data=JSON.parse(new TextDecoder().decode(bytes));
    } catch {return reply(400,{error:'Invalid JSON'});}
    if (!data || typeof data!=='object') return reply(400,{error:'Invalid message'});
    const email=typeof data.email==='string'?data.email.trim():'';
    const message=typeof data.message==='string'?data.message.trim():'';
    if (data.website || email.length>254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || message.length<2 || message.length>5000 || !/^[0-9a-f-]{36}$/i.test(data.requestId||'')) return reply(400,{error:'Check your email and message'});
    const key=env('RESEND_API_KEY'),from=env('CONTACT_FROM'),to=env('CONTACT_TO'),url=env('SUPABASE_URL'),service=env('SUPABASE_SERVICE_ROLE_KEY');
    if(!key||!from||!to||!url||!service) return reply(503,{error:'Sending unavailable'});
    try {
      const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
      const day=new Date().toISOString().slice(0,10);
      const keys=await Promise.all([digest(`${service}:${day}:ip:${ip}`),digest(`${service}:${day}:email:${email.toLowerCase()}`)]);
      const limit=await fetcher(`${url}/rest/v1/rpc/claim_contact_send`,{method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json'},body:JSON.stringify({p_keys:keys}),signal:AbortSignal.timeout(5000)});
      if(!limit.ok) return reply(503,{error:'Sending unavailable'});
      if(await limit.json()!==true) return reply(429,{error:'Please wait before sending another message'});
      const sent=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`portfolio-${data.requestId}`},body:JSON.stringify({from,to:[to],reply_to:email,subject:'New message from your portfolio',text:`From: ${email}\n\n${message}`}),signal:AbortSignal.timeout(10000)});
      if(!sent.ok) return reply(502,{error:'Could not send message'});
      const result=await sent.json();
      if(!result.id) return reply(502,{error:'Could not confirm sending'});
      return reply(200,{ok:true});
    } catch {return reply(503,{error:'Sending unavailable'});}
  };
}
