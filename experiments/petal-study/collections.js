import {articles} from '../../src/data/essays.js';
import {films,newsletter,buttondownUrls,socials} from '../../src/data/site.js';
import deskmate from '../../images/deskmate/frontpage.mp4';
import soundDictionariesDemo from '../../images/sound-dictionaries/frontpage.mp4';
import soundDictionariesPoster from '../../images/sound-dictionaries/frontpage.jpg';

const artworkAssets=import.meta.glob('../../images/art-paintings/*',{eager:true,query:'?url',import:'default'});
const paintings=[
  {
    "title": "Night Times",
    "category": "art",
    "file": "amberber_edward_hopper_painting_depicting_a_building_with_two_n_ad1fa9c4-5847-4918-822f-bbbab1a80937.png"
  },
  {
    "title": "Cloud House",
    "category": "art",
    "file": "amberber_a_surrealist_house_constructed_entirely_of_billowing_7b7428e2-6860-4ad0-80fa-fc25d93e6e35_0 (1).png"
  },
  {
    "title": "Spring",
    "category": "art",
    "file": "spring.jpeg",
    "series": "The Seasons"
  },
  {
    "title": "Summer",
    "category": "art",
    "file": "summer.jpeg",
    "series": "The Seasons"
  },
  {
    "title": "Autumn",
    "category": "art",
    "file": "autumn.jpeg",
    "series": "The Seasons"
  },
  {
    "title": "Winter",
    "category": "art",
    "file": "winter.jpeg",
    "series": "The Seasons"
  },
  {
    "title": "Feather Bicycle",
    "category": "art",
    "file": "amberber_dreamcore_surrealist_vintage_bicycle_constructed_ent_866176a6-b66e-4faa-b0d8-7f7c0fd2f855_3.png"
  },
  {
    "title": "Feather Throne",
    "category": "art",
    "file": "amberber_httpss.mj.runkFqjjPAJUpw_dreamcore_surrealist_armcha_f7b9c177-225a-44ac-a5da-59f36f1b8123_1 (1).png"
  },
  {
    "title": "Dissolve",
    "category": "art",
    "file": "amberber_generate_--v_6.1_e52a4fb6-c6a1-478f-a855-fe2250fb5002_3.png"
  },
  {
    "title": "Highway",
    "category": "art",
    "file": "amberber_edward_hopper_painting_depicting_a_guy_driving_in_his__48175de5-bd7b-4eac-9f6a-a5fb59c7dcd0.png"
  },
  {
    "title": "Late Night Terminal",
    "category": "art",
    "file": "amberber_httpss.mj.run7whEF-4sqiM_same_scene_and_setting_but__83e6ffd3-c957-44cf-972b-0345a8932674_1.png"
  },
  {
    "title": "Floating Island",
    "category": "art",
    "file": "amberber_Generate_--v_7_dac14766-df20-4d4c-8f44-a00456f696fe_1.png"
  },
  {
    "title": "Signal",
    "category": "art",
    "file": "amberber_generate_a_--v_6.1_a5217ea3-c8e6-4864-9627-d9e73eb3f2eb_2.png"
  }
].map(({file,...item})=>({...item,image:artworkAssets['../../images/art-paintings/'+file]}));
const interactiveAssets=import.meta.glob('../../images/art-interactive/*.mp4',{eager:true,query:'?url',import:'default'});
const interactive=[
  {title:'Places to Be',video:interactiveAssets['../../images/art-interactive/places_to_be.mp4'],description:'Interactive installation, 2025.'},
  {title:'Peony Glyph',video:interactiveAssets['../../images/art-interactive/peony-glyph.mp4'],poster:new URL('../../images/art-interactive/peony-glyph-poster.jpg',import.meta.url).href,previewAutoplay:true,description:'Made with TouchDesigner.'},
  {title:'Cloud Croissant',video:interactiveAssets['../../images/art-interactive/cloud-croissant.mp4']},
  {title:'Mirror — Central Park, Summer',video:interactiveAssets['../../images/art-interactive/mirror-central-park-summer.mp4']},
  {title:'Calligramme — Le Pont Mirabeau',video:interactiveAssets['../../images/art-interactive/calligramme.mp4'],description:'Interactive poem, 2025.'},
  {title:'Infinite Gallery',video:new URL('../../images/infinite-gallery/frontpage.mp4',import.meta.url).href,description:'A 3D funnel for showcasing artwork or consumer products.'},
  {title:'Birth Crystal',image:new URL('../../images/birth-crystal/frontpage.png',import.meta.url).href,description:'Procedural 3D crystals generated from birthdates.'},
].map(item=>({...item,category:'art',group:'interactive'}));
const selectedPaintings=['Feather Bicycle','Cloud House','Feather Throne','Spring','Summer','Autumn','Winter'];
const photographyAssets=import.meta.glob('../../images/photography/*',{eager:true,query:'?url',import:'default'});
const photography=[
  '5440944_5440944-R2-008-2A.jpg',
  'AFCA7DE1-FF42-476D-AE10-76B1267CB4FF.JPG',
  'DSCF0253.jpg',
  'P1000133_lab.JPG',
  'P1000219_lab.JPG',
].map(file=>({title:file,image:photographyAssets['../../images/photography/'+file],category:'art',group:'photography'}));
const items=[...interactive,...selectedPaintings.map(title=>({...paintings.find(item=>item.title===title),group:['Spring','Summer','Autumn','Winter'].includes(title)?'seasons':'paintings'})),...photography];
const modal=document.querySelector('#work-window'),content=document.querySelector('#work-content');
const title=document.querySelector('#work-title'),description=document.querySelector('#work-description');
let category='products',activeProject='sound-dictionaries';
const home=document.querySelector('#home-page'),viewer=document.querySelector('#art-viewer'),artDetail=document.querySelector('#art-detail');
let homeScroll=0,artOpener=null;
const projects=[
  {id:'natural-effects',title:'Natural Effects',tagline:'Water, ice, fog, sand and snow you can touch.',page:'/work/natural-expressions/'},   // opens the full case study
  {id:'sound-dictionaries',title:'Sound Dictionaries',tagline:'Books that talk back.',video:soundDictionariesDemo,poster:soundDictionariesPoster,
    summary:'An interactive dictionary voiced by an AI voice model: a shelf of ten talking books for learning five languages by ear. Five dictionaries pronounce each word syllable by syllable, and five notebooks let you talk your way through Paris, Tokyo, Seoul, Madrid and Beijing. Every voice is designed and acted with Fish Audio Drama 3.',
    live:'https://sound-dictionaries.vercel.app',links:[{label:'View on GitHub',url:'https://github.com/ambershen/sound-dictionaries'}]},
  {id:'deskmate',title:'Deskmate',tagline:'Find your coworking people.',video:deskmate,
    summary:'An AI-native app for finding places and people to co-work with, by vibes. More than 10,000 active users.',live:'https://desk-mate.ai'},
];
const projectAliases={'dirty-window':'natural-effects'};   // old links to Dirty Window land on Natural Effects
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;}
function media(item,detail=false){
  const el=node(item.video?'video':'img','work-media');
  if(item.video){el.src=item.video;el.muted=true;el.playsInline=true;el.preload='metadata';el.controls=detail;if(item.poster)el.poster=item.poster;if(!detail && item.previewAutoplay && !matchMedia('(prefers-reduced-motion: reduce)').matches){el.autoplay=true;el.loop=true;}el.setAttribute('aria-label',item.title);}
  else{el.src=item.image;el.alt=item.title;el.loading='lazy';}
  return el;
}
function stopMedia(){content.querySelectorAll('video').forEach(video=>video.pause());}
function projectArchive(){
  modal.classList.add('archive-mode');
  const layout=node('div','project-archive'),directory=node('nav','project-directory'),article=node('article','project-article');
  directory.setAttribute('aria-label','Choose a project');
  directory.append(node('p','directory-label','PROJECT FILES'));
  function select(id,updateURL=true){
    activeProject=id;stopMedia();article.replaceChildren();
    const project=projects.find(p=>p.id===id);
    directory.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.project===id)));
    article.append(node('span','project-number',`0${projects.indexOf(project)+1} / WORK`),node('h3','project-title',project.title),node('p','project-summary',project.summary));
    const demo=media(project,true);if(project.poster)demo.poster=project.poster;demo.classList.add('archive-demo');article.append(demo);
    const notes=node('div','project-notes');
    for(const [label,text] of [['Why I made it',project.why],['What I built',project.made],['What came out of it',project.result]]){
      if(!text)continue;
      const section=node('section','project-note');section.append(node('h4','',label),node('p','',text));notes.append(section);
    }
    if(notes.children.length)article.append(notes);
    const links=node('div','project-actions');
    if(project.live){const link=node('a','','Try it ↗');link.href=project.live;link.target='_blank';link.rel='noopener noreferrer';links.append(link);}
    for(const l of project.links||[]){const a=node('a','',l.internal?`${l.label} →`:`${l.label} ↗`);a.href=l.url;if(!l.internal){a.target='_blank';a.rel='noopener noreferrer';}links.append(a);}
    article.append(links);
    if(updateURL && location.hash!==`#work/${id}`)history.replaceState(null,'',`#work/${id}`);
  }
  for(const project of projects){
    const button=node(project.page?'a':'button','project-choice');button.dataset.project=project.id;button.append(node('strong','',project.page?`${project.title} →`:project.title),node('span','',project.tagline));
    if(project.page){button.href=project.page;button.onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();caseOpener=button;caseOpenedHere=true;location.hash=`work/${project.id}`;};}
    else button.onclick=()=>select(project.id);
    directory.append(button);
  }
  layout.append(directory,article);content.append(layout);select(activeProject);
}
function detail(item,index){
  artOpener=content.querySelectorAll('.work-card')[index];artDetail.replaceChildren();
  const figure=node('figure','work-detail');figure.append(media(item,true));
  const caption=node('figcaption','gallery-caption');
  const heading=node('h3','',item.title);heading.id='art-title';caption.append(heading);
  if(item.series)caption.append(node('p','gallery-series',item.series));
  if(item.description)caption.append(node('p','',item.description));
  figure.append(caption);artDetail.append(figure);viewer.showModal();document.body.classList.add('art-is-open');
}
function filmRoom(){
  const room=node('div','film-room');
  const stage=node('div','film-stage');
  const frame=node('div','film-frame');
  const caption=node('div','film-caption');
  stage.append(frame,caption);
  const thumbs=new Map();
  const play=film=>{
    frame.replaceChildren();
    if(film.youtube){const f=node('iframe');f.src=`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0`;f.title=film.title;f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;frame.append(f);}
    else{const v=node('video');v.src=film.src;v.controls=true;v.playsInline=true;v.autoplay=true;v.setAttribute('aria-label',film.title);frame.append(v);}
  };
  const still=(film,el)=>{
    if(film.youtube){const img=node('img');img.src=`https://i.ytimg.com/vi/${film.youtube}/hqdefault.jpg`;img.alt='';img.loading='lazy';el.append(img);}
    else if(film.src){const v=node('video');v.src=film.src+'#t=0.5';v.muted=true;v.playsInline=true;v.preload='metadata';v.setAttribute('aria-hidden','true');el.append(v);}
  };
  const show=(film,autoplay)=>{
    caption.replaceChildren(node('span','film-kind',[film.kind,film.year].filter(Boolean).join(' · ')),node('h3','',film.title));
    if(film.note)caption.append(node('p','',film.note));
    thumbs.forEach((btn,id)=>{const on=id===film.id;btn.classList.toggle('is-active',on);btn.setAttribute('aria-current',on?'true':'false');});
    if(autoplay){play(film);return;}
    frame.replaceChildren();
    const btn=node('button','film-play');btn.type='button';btn.setAttribute('aria-label',`Play ${film.title}`);
    still(film,btn);btn.append(node('span','film-play-icon','▶'));
    btn.onclick=()=>play(film);frame.append(btn);
  };
  const reel=node('div','film-reel');
  const track=node('div','film-reel-track');
  films.forEach(f=>{
    const btn=node('button','film-thumb');btn.type='button';
    const shot=node('span','film-thumb-shot');still(f,shot);
    btn.append(shot,node('span','film-thumb-title',f.title),node('span','film-thumb-kind',[f.kind,f.year].filter(Boolean).join(' · ')));
    btn.onclick=()=>show(f,true);
    thumbs.set(f.id,btn);track.append(btn);
  });
  const nudge=dir=>{track.scrollBy({left:dir*Math.max(240,track.clientWidth*.7),behavior:'smooth'});};
  const prev=node('button','film-reel-nav film-reel-prev','‹');prev.type='button';prev.setAttribute('aria-label','Scroll films left');prev.onclick=()=>nudge(-1);
  const next=node('button','film-reel-nav film-reel-next','›');next.type='button';next.setAttribute('aria-label','Scroll films right');next.onclick=()=>nudge(1);
  const edges=()=>{
    const over=track.scrollWidth-track.clientWidth>4;
    reel.classList.toggle('has-overflow',over);
    reel.classList.toggle('at-start',track.scrollLeft<=4);
    reel.classList.toggle('at-end',!over||track.scrollLeft>=track.scrollWidth-track.clientWidth-4);
  };
  track.addEventListener('scroll',edges,{passive:true});
  reel.append(prev,track,next);
  room.append(stage,reel);
  const elsewhere=node('div','film-elsewhere');elsewhere.append(node('h3','work-section-label','Watch elsewhere'));
  const links=node('div','film-socials');
  socials.filter(s=>s.label!=='GitHub').forEach(s=>{const a=node('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.append(node('strong','',s.label),node('span','',s.handle+' ↗'));links.append(a);});
  elsewhere.append(links);room.append(elsewhere);content.append(room);
  const featured=films.find(f=>f.featured)||films[0];
  if(featured)show(featured,false);
  requestAnimationFrame(edges);
  if(window.ResizeObserver)new ResizeObserver(edges).observe(track);
}
function newsletterSignup(compact=false){
  const urls=buttondownUrls(newsletter.buttondown);
  const box=node('section',compact?'newsletter newsletter-compact':'newsletter');box.setAttribute('aria-label','Subscribe to '+newsletter.name);
  if(compact)box.append(node('p','newsletter-lede','Enjoyed this? Get the next one by email.'));
  const form=node('form','newsletter-form');form.method='post';form.target='_blank';
  if(urls)form.action=urls.subscribe;
  const email=node('input');email.type='email';email.name='email';email.required=true;email.placeholder='you@email.com';email.autocomplete='email';email.setAttribute('aria-label','Email address');
  const first=node('input');first.type='text';first.name='metadata__first_name';first.placeholder='First name';first.autocomplete='given-name';first.setAttribute('aria-label','First name');
  const hidden=node('input');hidden.type='hidden';hidden.name='embed';hidden.value='1';
  const submit=node('button','newsletter-submit','Subscribe');submit.type='submit';
  const status=node('p','newsletter-status',newsletter.cadence);status.setAttribute('aria-live','polite');
  if(!compact)form.append(first);
  form.append(email,hidden,submit);
  form.addEventListener('submit',event=>{
    if(!urls){event.preventDefault();status.textContent='The newsletter is launching soon. Follow along on X in the meantime.';return;}
    setTimeout(()=>{status.textContent='Almost there: check your inbox to confirm.';form.reset();},50);
  });
  box.append(form,status);
  if(urls&&!compact){const more=node('p','newsletter-more');const a=node('a','','View full archive ↗');a.href=urls.archive;a.target='_blank';a.rel='noopener noreferrer';const r=node('a','','RSS');r.href=urls.rss;more.append(a,r);box.append(more);}
  return box;
}
function render(next){
  category=next;stopMedia();content.replaceChildren();
  modal.classList.remove('archive-mode');
  modal.classList.toggle('gallery-mode',next==='art');
  modal.classList.toggle('film-mode',next==='film');
  const selectedArticle=articles.find(article=>article.route===location.hash);
  const reading=next==='writing' && Boolean(selectedArticle);
  modal.classList.toggle('reading-mode',reading);
  document.title=reading?selectedArticle.title+' — Amber Shen':'Amber Shen — Creative Technologist';
  title.textContent={selected:'Selected work',products:'Work',art:'Gallery',film:'Film',writing:'Writing'}[category];
  description.textContent={selected:'A few things from my world.',products:'What I’m making now.',art:'Images, experiments, and ways of seeing.',film:'Visual storytelling in motion.',writing:newsletter.blurb}[category];
  if(category==='products'){projectArchive();modal.scrollTop=0;return;}
  if(category==='film'){filmRoom();modal.scrollTop=0;return;}
  if(category==='writing'){
    if(reading){
      title.textContent=selectedArticle.title;description.textContent='';
      const article=node('article','essay-body');article.setAttribute('aria-labelledby','work-title');
      let list=null;
      for(const raw of selectedArticle.body.trim().split('\n')){
        const line=raw.trim();if(!line)continue;
        const match=line.match(/^\d+\. (.*)$/);
        if(match){if(!list){list=node('ol');article.append(list);}list.append(node('li','',match[1]));}
        else if(selectedArticle.bullets?.includes(line)){
          if(!list || list.tagName!=='UL'){list=node('ul');article.append(list);}list.append(node('li','',line));
        }else{list=null;const tag=selectedArticle.headings?.includes(line)?'h3':selectedArticle.subheadings?.includes(line)?'h4':'p';article.append(node(tag,'',line));}
      }
      const links=node('div','essay-links');const back=node('a','','← All writing');back.href='#writing';
      links.append(back);content.append(article,links);if(newsletter.show)content.append(newsletterSignup(true));return;
    }
    if(newsletter.show)content.append(newsletterSignup());
    content.append(node('h3','work-section-label','Essays'));
    const list=node('div','writing-list');
    [...articles].reverse().forEach(article=>{
      const link=node('a','writing-entry');link.href=article.route;
      link.append(node('span','writing-title',article.title),node('span','writing-source','Read →'));
      list.append(link);
    });content.append(list);return;
  }

  const gallery=node('div','curated-gallery');
  const grids={};
  for(const [group,label] of [['interactive','Interactive art'],['paintings','Selected artwork'],['seasons','The Seasons'],['photography','Photography']]){
    const grid=node('section',`work-grid gallery-${group}`);grid.setAttribute('aria-label',label);grids[group]=grid;gallery.append(grid);
  }
  for(const [index,item] of items.filter(item=>category==='selected'?item.selected:item.category===category).entries()){
    const card=node(item.url?'a':'button','work-card');
    if(item.url){card.href=item.url;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`${item.title} (opens in a new tab)`);}
    else{card.type='button';card.onclick=()=>detail(item,index);card.setAttribute('aria-label',`View ${item.title}`);}
    const frame=node('div','work-media-frame');frame.append(media(item));
    if(item.video)frame.append(node('span','video-label','Moving image ↗'));
    card.append(frame);
    if(item.group!=='photography')card.append(node('h3','',item.title));
    grids[item.group].append(card);
  }
  content.append(gallery);modal.scrollTop=0;
}
let articleOrigin=null;
let readingAnimations=[];
content.addEventListener('click',event=>{
  const link=event.target.closest('.writing-entry');
  if(!link || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
  const label=link.querySelector('.writing-title');
  articleOrigin={route:link.hash,rect:label.getBoundingClientRect(),fontSize:parseFloat(getComputedStyle(label).fontSize)};
});
function animateReading(){
  const origin=articleOrigin;articleOrigin=null;
  if(!modal.classList.contains('reading-mode') || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const timing={duration:560,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'};
  const destination=title.getBoundingClientRect();
  const matched=origin?.route===location.hash;
  const dx=matched?origin.rect.left-destination.left:-12;
  const dy=matched?origin.rect.top-destination.top:0;
  const scale=matched?origin.fontSize/parseFloat(getComputedStyle(title).fontSize):1;
  readingAnimations.push(title.animate([
    {transform:`translate(${dx}px,${dy}px) scale(${scale})`,opacity:.65},
    {transform:'translate(0,0) scale(1)',opacity:1}
  ],timing));
  readingAnimations.push(content.animate([
    {transform:'translateX(-32px)',opacity:0,clipPath:'inset(0 22% 0 0)'},
    {transform:'translateX(0)',opacity:1,clipPath:'inset(0 0 0 0)'}
  ],{...timing,duration:640,delay:100}));
}
function showPage(next,focus=false){
  readingAnimations.forEach(animation=>animation.cancel());readingAnimations=[];
  if(viewer.open)viewer.close();
  if(!home.hidden && next!=='home')homeScroll=window.scrollY;
  stopMedia();home.hidden=next!=='home';modal.hidden=next==='home';
  document.querySelectorAll('[data-page]').forEach(link=>{
    if(link.dataset.page===next)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  if(next!=='home'){render(next);window.scrollTo(0,0);if(focus)title.focus({preventScroll:true});animateReading();}
  else{articleOrigin=null;window.scrollTo(0,homeScroll);if(focus)document.querySelector('.home-flower').focus({preventScroll:true});}
}
// A project with its own case study page slides in over Work: the page in a frame (?embed hides its nav).
// Back, Esc and "← Work" slide it away again.
let slide=null,slideFrame=null,slideClose=null,slideFull=null,caseOpener=null,caseOpenedHere=false;
function leaveCase(){if(caseOpenedHere){caseOpenedHere=false;history.back();}else{history.replaceState(null,'','#work');route();}}
function openCase(project){
  if(!slide){
    slide=node('div','case-slide');slide.hidden=true;slide.setAttribute('role','dialog');slide.setAttribute('aria-modal','true');
    const bar=node('div','case-slide-bar');
    slideClose=node('button','case-slide-close','← Work');slideClose.type='button';slideClose.onclick=leaveCase;
    slideFull=node('a','case-slide-full','Open as a page ↗');
    slideFrame=node('iframe','case-slide-frame');
    slideFrame.addEventListener('load',()=>{try{slideFrame.contentWindow.addEventListener('keydown',e=>{if(e.key==='Escape')leaveCase();});}catch{}});
    bar.append(slideClose,slideFull);slide.append(bar,slideFrame);document.body.append(slide);
    addEventListener('keydown',e=>{if(e.key==='Escape'&&slide.classList.contains('open'))leaveCase();});
    addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='case-close')leaveCase();});
  }
  slide.setAttribute('aria-label',project.title);slideFrame.title=project.title;slideFull.href=project.page;
  if(slideFrame.dataset.page!==project.page){slideFrame.dataset.page=project.page;slideFrame.src=project.page+'?embed';}
  slide.hidden=false;slide.offsetWidth;slide.classList.add('open');document.body.classList.add('case-open');
  slideClose.focus({preventScroll:true});
}
function closeCase(){
  if(!slide?.classList.contains('open'))return;
  slide.classList.remove('open');document.body.classList.remove('case-open');
  const done=()=>{if(!slide.classList.contains('open'))slide.hidden=true;};
  matchMedia('(prefers-reduced-motion: reduce)').matches?done():slide.addEventListener('transitionend',done,{once:true});
  caseOpener?.focus({preventScroll:true});
}
function route(focus=false){
  const hash=location.hash;
  if(hash.startsWith('#work/')){const id=projectAliases[hash.slice(6)]||hash.slice(6),project=projects.find(p=>p.id===id);
    if(project?.page){if(modal.hidden||category!=='products')showPage('products');openCase(project);return;}
    closeCase();if(project)activeProject=id;showPage('products',focus);return;}
  closeCase();
  showPage(hash==='#gallery'?'art':hash==='#film'?'film':hash==='#work'?'products':(hash==='#writing' || articles.some(article=>article.route===hash))?'writing':'home',focus);
}
document.querySelectorAll('[data-open-work]').forEach(button=>button.addEventListener('click',()=>{location.hash=button.dataset.openWork==='art'?'gallery':'work';}));
document.querySelector('#close-art').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const box=viewer.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();});
viewer.addEventListener('close',()=>{artDetail.querySelectorAll('video').forEach(video=>video.pause());document.body.classList.remove('art-is-open');artOpener?.focus({preventScroll:true});});
window.addEventListener('hashchange',()=>route(true));route();
