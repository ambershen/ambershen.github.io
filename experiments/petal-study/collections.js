import {loadPortfolio} from '../../src/data/portfolio-cloud.js';
import {resolveCatalog} from '../../src/data/catalog-assets.js';
import {videoPoster} from '../../src/data/video-posters.js';
import {naturalMedia,softMatterMedia} from '../../src/data/case-studies.js';
import {articles} from '../../src/data/essays.js';
import {films as defaultFilms,newsletter,buttondownUrls,socials} from '../../src/data/site.js';
import {projects as defaultProjects, items as defaultItems, sketchGroups} from '../../src/data/portfolio.js';

let films=defaultFilms, projects=defaultProjects, items=defaultItems;
let catalogApplied=false, routeVersion=0;
let sketchFilter='all';

const modal=document.querySelector('#work-window'),content=document.querySelector('#work-content');
const title=document.querySelector('#work-title'),description=document.querySelector('#work-description');
let category='products',activeProject='natural-effects';
const home=document.querySelector('#home-page'),viewer=document.querySelector('#art-viewer'),artDetail=document.querySelector('#art-detail');
let homeScroll=0,artOpener=null;

const projectAliases={'dirty-window':'natural-effects'};   // old links to Dirty Window land on Natural Effects
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;}
function media(item,detail=false){
  if(item.images){const grid=node('div','soft-matter-cover');for(const src of item.images){const image=node('img');image.src=src;image.alt=item.title+' material type specimen';image.loading='lazy';image.decoding='async';grid.append(image);}return grid;}

  const isPlayer=Boolean(item.video&&detail);
  const el=node(isPlayer?'video':'img','work-media');
  if(isPlayer){el.src=item.video;el.muted=!item.sound;el.playsInline=true;el.preload='none';el.controls=true;el.poster=item.poster||videoPoster(item.video)||'';el.setAttribute('aria-label',item.title);}
  else{el.src=item.video?(item.poster||videoPoster(item.video)):item.image;el.alt=item.title;el.loading='lazy';el.decoding='async';}
  return el;
}
function stopMedia(){content.querySelectorAll('video').forEach(video=>video.pause());}
content.addEventListener('play',event=>{
  if(event.target.tagName!=='VIDEO')return;
  content.querySelectorAll('video').forEach(video=>{if(video!==event.target)video.pause();});
},true);
function selectedWork(){
  const feature=node('article','selected-feature');
  const header=node('div','selected-feature-header');
  const heading=node('div');
  heading.append(node('p','selection-label','01 / INTERACTIVE MATERIALS'),node('h3','selected-feature-title','Natural Effects as the New Brush'));
  const intro=node('div','selected-feature-intro');
  intro.append(node('p','','Three ways to make an impression.'),node('p','selected-feature-note','Voice becomes ripples. Sketches become a story. Touch becomes fractured objects.'));
  header.append(heading,intro);
  const materials=node('div','selected-materials');
  naturalMedia.forEach((material,index)=>{
    const link=node('a','selected-material');link.href=`/work/natural-expressions/#s-${material.id}`;
    const image=node('img');image.src=material.poster;image.alt=`${material.title} material study`;image.loading='lazy';
    const copy=node('div','selected-material-copy');
    copy.append(node('span','selection-label',`0${index+1} / ${material.kind}`),node('h4','',material.title),node('p','',material.interaction+''));
    link.append(image,copy);materials.append(link);
  });
  const foot=node('div','selected-feature-footer');
  foot.append(node('p','','An ongoing series, with reusable effects and agent skills.'));
  const read=node('a','selected-link','Explore the series');read.href='#work/natural-effects';
  read.onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;caseOpener=read;caseOpenedHere=true;};foot.append(read);
  feature.append(header,materials,foot);content.append(feature);
  const grid=node('div','selected-projects');
  projects.filter(project=>project.id!=='natural-effects').forEach((project,index)=>{
    const card=node('a','selected-project');card.href=`#work/${project.id}`;
    const image=media(project);const frame=node('div','selected-project-media');frame.append(image);
    card.append(frame,node('p','selection-label',`0${index+2} / ${project.kind||(project.id==='soft-matter'?'MATERIAL TYPE & CREATIVE CODING':project.id==='live-visuals'?'CREATIVE CODING & 3D':'PRODUCT DESIGN')}`),node('h3','',project.title+''),node('p','selected-project-tagline',project.tagline));
    grid.append(card);
  });
  content.append(grid);
  const more=node('nav','selected-more');more.setAttribute('aria-label','More from my practice');
  for(const [label,text,href] of [['Sketchbook','Visual experiments, typography, and ways of seeing.','#sketchbook'],['Selected Films','Commercial work and visual storytelling.','#film']]){
    const a=node('a');a.href=href;a.append(node('h3','',label+''),node('p','',text));more.append(a);
  }
  content.append(more);
}
function projectArchive(){
  modal.classList.add('archive-mode');
  const layout=node('div','project-archive'),directory=node('nav','project-directory'),article=node('article','project-article');
  directory.setAttribute('aria-label','Choose a project');
  const all=node('a','project-all','Selected work');all.href='#work';directory.append(all,node('p','directory-label','PROJECTS'));
  function select(id,updateURL=true){
    activeProject=id;stopMedia();article.replaceChildren();
    const project=projects.find(p=>p.id===id);
    directory.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.project===id)));
    article.append(node('span','project-number',`0${projects.indexOf(project)+1} / ${project.kind||'WORK'}`),node('h3','project-title',project.title));
    if(project.summary)article.append(node('p','project-summary',project.summary));
    if(project.studies){
      const studies=node('div','visual-studies');
      project.studies.forEach(study=>{
        const figure=node('figure'),caption=node('figcaption','visual-study-caption');
        if(study.kind)caption.append(node('p','selection-label',study.kind));
        caption.append(node('h4','visual-study-title',study.title));
        if(study.description)caption.append(node('p','visual-study-description',study.description));
        figure.append(caption,media(study,true));studies.append(figure);
      });
      article.append(studies);
    }else if(!project.hideHero){
      const demo=media(project,true);if(project.poster)demo.poster=project.poster;demo.classList.add('archive-demo');if(project.portrait){demo.style.aspectRatio='9 / 16';demo.style.width='min(100%, 420px)';demo.style.margin='24px auto 0';}article.append(demo);
    }
    if(project.motionCaption)article.append(node('p','visual-study-description',project.motionCaption));
    if(project.sections){
      const story=node('div','dictionary-story');
      project.sections.forEach((part,index)=>{const section=node('section','dictionary-chapter');section.append(node('p','selection-label',`0${index+1}`),node('h4','',part.title),node('p','',part.text));if(part.image){const image=node('img','project-process-image');image.src=part.image;image.alt=part.alt||part.title;image.loading='lazy';section.append(image);}story.append(section);});
      article.append(story);
    }
    const notes=node('div','project-notes');
    for(const [label,text] of [['Why I made it',project.why],['What I built',project.made],['What came out of it',project.result]]){
      if(!text)continue;
      const section=node('section','project-note');section.append(node('h4','',label),node('p','',text));notes.append(section);
    }
    if(notes.children.length)article.append(notes);
    const links=node('div','project-actions');
    if(project.live){const link=node('a','','Try it');link.href=project.live;link.target='_blank';link.rel='noopener noreferrer';links.append(link);}
    for(const l of project.links||[]){const a=node('a','',l.internal?`${l.label}`:`${l.label}`);a.href=l.url;if(!l.internal){a.target='_blank';a.rel='noopener noreferrer';}links.append(a);}
    article.append(links);
    if(updateURL && location.hash!==`#work/${id}`)history.replaceState(null,'',`#work/${id}`);
  }
  for(const project of projects){
    const button=node(project.page?'a':'button','project-choice');button.dataset.project=project.id;button.append(node('strong','',project.page?`${project.title}`:project.title),node('span','',project.tagline));
    if(project.page){button.href=project.page;button.onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();caseOpener=button;caseOpenedHere=true;location.hash=`work/${project.id}`;};}
    else button.onclick=()=>select(project.id);
    directory.append(button);
  }
  layout.append(directory,article);content.append(layout);select(activeProject,false);
}
function detail(item,index){
  artOpener=content.querySelectorAll('.work-card')[index];artDetail.replaceChildren();
  const figure=node('figure','work-detail');figure.append(media(item,true));
  const caption=node('figcaption','gallery-caption');
  const heading=node('h3','',item.title);heading.id='art-title';caption.append(heading);
  if(item.series)caption.append(node('p','gallery-series',item.series));
  if(item.exploration)caption.append(node('p','',item.exploration));
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
    if(film.poster){const img=node('img');img.src=film.poster;img.alt=film.title;img.loading='lazy';el.append(img);}
    else if(film.youtube){const img=node('img');img.src=`https://i.ytimg.com/vi/${film.youtube}/hqdefault.jpg`;img.alt='';img.loading='lazy';el.append(img);}
    else if(film.src){const img=node('img');img.src=videoPoster(film.src);img.alt='';img.loading='lazy';img.decoding='async';el.append(img);}
  };
  const show=(film,autoplay)=>{
    caption.replaceChildren(node('span','film-kind',[film.kind,film.year].filter(Boolean).join(' · ')),node('h3','',film.title));
    if(film.note)caption.append(node('p','',film.note));
    thumbs.forEach((btn,id)=>{const on=id===film.id;btn.classList.toggle('is-active',on);btn.setAttribute('aria-current',on?'true':'false');});
    if(film.external){
      frame.replaceChildren();
      const link=node('a','film-play');link.href=film.external;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`Watch ${film.title} on X`);
      still(film,link);frame.append(link);
      const watch=node('a','','Watch on X');watch.href=film.external;watch.target='_blank';watch.rel='noopener noreferrer';caption.append(watch);return;
    }
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
  socials.filter(s=>s.label!=='GitHub').forEach(s=>{const a=node('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.append(node('strong','',s.label),node('span','',s.handle+''));links.append(a);});
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
  if(urls&&!compact){const more=node('p','newsletter-more');const a=node('a','','View full archive');a.href=urls.archive;a.target='_blank';a.rel='noopener noreferrer';const r=node('a','','RSS');r.href=urls.rss;more.append(a,r);box.append(more);}
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
  title.textContent={selected:'Selected work',products:'Selected work',art:'Sketchbook',film:'Selected Films',writing:'Writing'}[category];
  description.textContent={selected:'A few things from my world.',products:'Exploring code, AI, and materials as tools for expression.',art:'An ongoing collection of visual experiments, typography, and ways of seeing.',film:'Visual storytelling in motion.',writing:newsletter.blurb}[category];
  if(category==='products'){if(location.hash.startsWith('#work/') && projects.some(p=>p.id===activeProject && !p.page))projectArchive();else selectedWork();modal.scrollTop=0;return;}
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
      const links=node('div','essay-links');const back=node('a','','All writing');back.href='#writing';
      links.append(back);content.append(article,links);if(newsletter.show)content.append(newsletterSignup(true));return;
    }
    if(newsletter.show)content.append(newsletterSignup());
    content.append(node('h3','work-section-label','Essays'));
    const list=node('div','writing-list');
    [...articles].reverse().forEach(article=>{
      const link=node('a','writing-entry');link.href=article.route;
      link.append(node('span','writing-title',article.title),node('span','writing-source','Read'));
      list.append(link);
    });content.append(list);return;
  }

  const filters=node('nav','sketch-filters');filters.setAttribute('aria-label','Filter sketchbook');
  const gallery=node('div','sketch-gallery');gallery.id='sketch-gallery';
  const makeCard=(item)=>{
    const card=node('button','work-card');card.type='button';card.setAttribute('aria-label',`View ${item.title}`);
    card.onclick=()=>{if(item.page){location.href=item.page;return;}detail(item,0);artOpener=card;};
    const frame=node('div','work-media-frame');frame.append(media(item));
    if(item.video)frame.append(node('span','video-label','Moving image'));
    card.append(frame,node('h3','',item.title));
    if(item.exploration)card.append(node('p','sketch-exploration',item.exploration));
    return card;
  };
  const showSketches=()=>{
    stopMedia();gallery.replaceChildren();
    filters.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===sketchFilter)));
    for(const group of sketchGroups.filter(group=>sketchFilter==='all'||group.id===sketchFilter)){
      const section=node('section','sketch-section');section.setAttribute('aria-label',group.title);
      const heading=node('header','sketch-heading');heading.append(node('h3','',group.title),node('p','',group.description));
      const grid=node('div','sketch-grid');
      items.filter(item=>item.theme===group.id).forEach(item=>grid.append(makeCard(item)));
      section.append(heading,grid);gallery.append(section);
    }

  };
  for(const group of [{id:'all',title:'All'},...sketchGroups]){
    const button=node('button','',group.title);button.type='button';button.dataset.filter=group.id;button.setAttribute('aria-controls','sketch-gallery');
    button.onclick=()=>{sketchFilter=group.id;showSketches();};filters.append(button);
  }
  content.append(filters,gallery);showSketches();modal.scrollTop=0;
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
// Back, Esc and "Work" slide it away again.
let slide=null,slideFrame=null,slideClose=null,slideFull=null,caseOpener=null,caseOpenedHere=false;
function leaveCase(){if(caseOpenedHere){caseOpenedHere=false;history.back();}else{history.replaceState(null,'','#work');route();}}
function openCase(project){
  if(!slide){
    slide=node('div','case-slide');slide.hidden=true;slide.setAttribute('role','dialog');slide.setAttribute('aria-modal','true');
    const bar=node('div','case-slide-bar');
    slideClose=node('button','case-slide-close','Work');slideClose.type='button';slideClose.onclick=leaveCase;
    slideFull=node('a','case-slide-full','Open as a page');
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
async function route(focus=false){
  const version=++routeVersion;
  const hash=location.hash;
  if(hash && hash!=='#home' && !catalogApplied){
    const catalog=await loadPortfolio();
    if(version!==routeVersion)return;
    if(catalog){
      if(catalog.films)films=resolveCatalog(catalog.films.map(row=>row.payload));
      if(catalog.projects)projects=resolveCatalog(catalog.projects.map(row=>row.payload));
      if(catalog.sketches)items=resolveCatalog(catalog.sketches.map(row=>row.payload));
    }
    catalogApplied=true;
  }
  if(hash.startsWith('#work/')){const id=projectAliases[hash.slice(6)]||hash.slice(6),project=projects.find(p=>p.id===id);
    if(project?.page){activeProject=project.id;if(modal.hidden||category!=='products')showPage('products');openCase(project);return;}
    closeCase();if(project)activeProject=id;showPage('products',focus);return;}
  closeCase();
  showPage((hash==='#gallery'||hash==='#sketchbook')?'art':hash==='#film'?'film':hash==='#work'?'products':(hash==='#writing' || articles.some(article=>article.route===hash))?'writing':'home',focus);
}
document.querySelectorAll('[data-open-work]').forEach(button=>button.addEventListener('click',()=>{location.hash=button.dataset.openWork==='art'?'gallery':'work';}));
document.querySelector('#close-art').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const box=viewer.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();});
viewer.addEventListener('close',()=>{artDetail.querySelectorAll('video').forEach(video=>video.pause());document.body.classList.remove('art-is-open');artOpener?.focus({preventScroll:true});});
window.addEventListener('hashchange',()=>route(true));route();
