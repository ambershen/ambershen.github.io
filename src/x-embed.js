let pending;
export function loadXWidgets(){
  if(window.twttr?.widgets?.createTweet)return Promise.resolve(window.twttr);
  if(pending)return pending;
  pending=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://platform.twitter.com/widgets.js';script.async=true;
    const timer=setTimeout(()=>{script.remove();reject(new Error('X embed timed out'));},15000);
    script.onload=()=>{clearTimeout(timer);window.twttr?.widgets?.createTweet?resolve(window.twttr):reject(new Error('X embed unavailable'));};
    script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('X embed unavailable'));};
    document.head.append(script);
  }).catch(error=>{pending=null;throw error;});
  return pending;
}
