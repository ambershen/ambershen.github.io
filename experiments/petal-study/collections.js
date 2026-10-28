import {filmRoom as mountFilmRoom} from './film-room.js';
import {teachingRoom} from './teaching-room.js';
import {loadPortfolio} from '../../src/data/portfolio-cloud.js';
import {resolveCatalog} from '../../src/data/catalog-assets.js';
import {videoPoster} from '../../src/data/video-posters.js';
import {naturalMedia,softMatterMedia} from '../../src/data/case-studies.js';
import {hoverClip,specimenCover} from './work-motion.js';
import {naturalTile} from '../../src/natural-play.js';
import './sketchbook.css';
import {articles} from '../../src/data/essays.js';
import {films as defaultFilms,newsletter,buttondownUrls,socials} from '../../src/data/site.js';
import {projects as defaultProjects, items as defaultItems, sketchGroups, sketchDates} from '../../src/data/portfolio.js';

let films=defaultFilms, projects=defaultProjects, items=defaultItems;
let catalogApplied=false, routeVersion=0;
let field=null;
function dropField(){field?.destroy();field=null;room?.destroy();room=null;}
let room=null; // the Film or Teaching room on screen
addEventListener('resize',()=>{field?.fit?.();room?.fit?.();});

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
  if(event.target.tagName!=='VIDEO'||event.target.classList.contains('hover-clip'))return;
  content.querySelectorAll('video').forEach(video=>{if(video!==event.target)video.pause();});
},true);
function selectedWork(){
  const feature=node('article','selected-feature');
  const header=node('div','selected-feature-header');
  const heading=node('div');
  const featureTitle=node('h3','selected-feature-title');const featureLink=node('a','','Natural Effects as the New Brush');featureLink.href='#work/natural-effects';featureTitle.append(featureLink);
  heading.append(node('p','selection-label','01 / INTERACTIVE MATERIALS'),featureTitle);
  const intro=node('div','selected-feature-intro');
  intro.append(node('p','selected-feature-note','Voice becomes ripples. Sketches become a story. Touch becomes fractured objects.'));
  header.append(heading,intro);
  const materials=node('div','selected-materials');
  naturalMedia.forEach((material,index)=>{
    const link=node('a','selected-material');link.href=`#work/natural-effects/${material.id}`;
    const image=naturalTile(material.id,material.title);
    const copy=node('div','selected-material-copy');
    copy.append(node('span','selection-label',`0${index+1} / ${material.kind}`),node('h4','',material.title));
    link.append(image,copy);materials.append(link);
  });
  const foot=node('div','selected-feature-footer');
  foot.append(node('p','','An ongoing series, with reusable effects and agent skills.'));
  const read=node('a','selected-link','Explore the series');read.href='#work/natural-effects';
  for(const a of [read,featureLink,...materials.querySelectorAll('a')])a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;caseOpener=a;caseOpenedHere=true;});
  foot.append(read);
  feature.append(header,materials,foot);content.append(feature);
  const grid=node('div','selected-projects');
  projects.filter(project=>project.id!=='natural-effects').forEach((project,index)=>{
    const card=node('a','selected-project');card.href=`#work/${project.id}`;
    const frame=node('div','selected-project-media');
    if(project.id==='soft-matter')frame.append(specimenCover(card,softMatterMedia.map(s=>({...s})),project.title));
    else{frame.append(media(project));hoverClip(card,frame,project.video||project.studies?.find(s=>s.video)?.video);}
    card.append(frame,node('p','selection-label',`0${index+2} / ${project.kind||(project.id==='soft-matter'?'MATERIAL TYPE & CREATIVE CODING':project.id==='live-visuals'?'CREATIVE CODING & 3D':'PRODUCT DESIGN')}`),node('h3','',project.title+''),node('p','selected-project-tagline',project.tagline));
    grid.append(card);
  });
  content.append(grid);
}
// The next work in Work order, opening the way that work opens (case slide or project view).
function nextWork(id){
  const list=projects.filter((p,i,all)=>all.findIndex(q=>q.id===p.id)===i),next=list[(list.findIndex(p=>p.id===id)+1)%list.length];
  const a=node('a','work-next');a.href=`#work/${next.id}`;a.append(node('span','','Next work'),node('strong','',next.title));
  a.addEventListener('click',()=>{caseOpener=null;caseOpenedHere=false;requestAnimationFrame(()=>scrollTo({top:0,behavior:'instant'}));});
  return a;
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
    article.append(links,nextWork(id));
    if(updateURL && location.hash!==`#work/${id}`)history.replaceState(null,'',`#work/${id}`);
  }
  for(const project of projects){
    const button=node(project.page?'a':'button','project-choice');button.dataset.project=project.id;button.append(node('strong','',project.title));
    if(project.page){button.href=project.page;button.onclick=e=>{if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();caseOpener=button;caseOpenedHere=true;location.hash=`work/${project.id}`;};}
    else button.onclick=()=>select(project.id);
    directory.append(button);
  }
  layout.append(directory,article);content.append(layout);select(activeProject,false);
}
function detail(item,index){
  artOpener=content.querySelectorAll('.work-card')[index];artDetail.replaceChildren();
  const figure=node('figure','work-detail'),shown=media(item,true);figure.append(shown);
  if(shown.tagName==='VIDEO'){shown.preload='auto';shown.loop=true;shown.play().catch(()=>{});}
  const caption=node('figcaption','gallery-caption');
  const meta=[sketchGroups.find(group=>group.id===item.theme)?.title,item.date||sketchDates[item.title]].filter(Boolean).join(' · ');
  if(meta)caption.append(node('p','gallery-meta',meta));
  const heading=node('h3','',item.title);heading.id='art-title';caption.append(heading);
  if(item.series)caption.append(node('p','gallery-series',item.series));
  if(item.exploration)caption.append(node('p','',item.exploration));
  if(item.description)caption.append(node('p','',item.description));
  figure.append(caption);artDetail.append(figure);viewer.tabIndex=-1;viewer.showModal();viewer.focus();document.body.classList.add('art-is-open');
}
function filmRoom(){room=mountFilmRoom({films,socials,videoPoster});content.append(room.el);}
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
  category=next;stopMedia();dropField();content.replaceChildren();
  modal.classList.remove('archive-mode');
  modal.classList.toggle('gallery-mode',next==='art');
  modal.classList.toggle('film-mode',next==='film');
  const selectedArticle=articles.find(article=>article.route===location.hash);
  const reading=next==='writing' && Boolean(selectedArticle);
  modal.classList.toggle('reading-mode',reading);
  document.title=reading?selectedArticle.title+' — Amber Shen':'Amber Shen — Creative Technologist';
  title.textContent={selected:'Selected work',products:'Selected work',art:'Sketchbook',film:'Selected Films',writing:'Writing',teaching:'Teaching & Sharing'}[category];
  description.textContent={selected:'A few things from my world.',products:'',art:'An ongoing collection of visual experiments, typography, and ways of seeing.',film:'Visual storytelling in motion.',writing:newsletter.blurb,teaching:'Making technical ideas easier to understand, explore, and build with.'}[category];
  if(category==='products'){if(location.hash.startsWith('#work/') && projects.some(p=>p.id===activeProject && !p.page))projectArchive();else selectedWork();modal.scrollTop=0;return;}
  if(category==='film'){filmRoom();modal.scrollTop=0;return;}
  if(category==='teaching'){document.title='Teaching & Sharing — Amber Shen';room=teachingRoom({fullBleed:el=>{if(!el.isConnected)return;const box=content.getBoundingClientRect();el.style.width=document.documentElement.clientWidth+'px';el.style.marginLeft=-box.left+'px';}});content.append(room.el);room.fit();return;}
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

  // Sketchbook field: every piece on an endless field you drag across (sketchbook-field.js).
  const stage=node('div','sb-field');stage.id='sketch-gallery';
  const fit=()=>{
    if(!stage.isConnected)return;
    const width=document.documentElement.clientWidth,box=content.getBoundingClientRect();
    stage.style.width=width+'px';stage.style.marginLeft=-box.left+'px';
    stage.style.height=Math.max(420,innerHeight-(stage.getBoundingClientRect().top+scrollY))+'px';
  };
  const open=(item,from)=>{detail(item);artOpener=from;};
  content.append(stage);modal.scrollTop=0;fit();
  // three.js loads only when the Sketchbook opens.
  import('./sketchbook-field.js').then(({mountField})=>{
    if(!stage.isConnected||field)return;
    field=mountField(stage,items,{onOpen:open,isPaused:()=>viewer.open});
    field.fit=fit;
  });
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
  stopMedia();if(next==='home')dropField();home.hidden=next!=='home';modal.hidden=next==='home';
  const featured=document.querySelector('#home-featured');if(featured)featured.hidden=next!=='home';
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
function openCase(project,part){
  if(!slide){
    slide=node('div','case-slide');slide.hidden=true;slide.setAttribute('role','dialog');slide.setAttribute('aria-modal','true');
    const bar=node('div','case-slide-bar');
    slideClose=node('button','case-slide-close','Work');slideClose.type='button';slideClose.onclick=leaveCase;
    slideFull=node('a','case-slide-full','Open as a page');
    slideFrame=node('iframe','case-slide-frame');
    slideFrame.addEventListener('load',()=>{try{slideFrame.contentWindow.addEventListener('keydown',e=>{if(e.key==='Escape')leaveCase();});}catch{}});
    bar.append(slideClose,slideFull);slide.append(bar,slideFrame);document.body.append(slide);
    addEventListener('keydown',e=>{if(e.key==='Escape'&&slide.classList.contains('open'))leaveCase();});
    addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='case-close')leaveCase();if(e.data?.type==='case-open'&&typeof e.data.id==='string')location.hash=`work/${e.data.id}`;});
  }
  slide.setAttribute('aria-label',project.title);slideFrame.title=project.title;slideFull.href=project.page;
  const anchor=part?`#s-${part}`:'';
  if(slideFrame.dataset.page!==project.page){slideFrame.dataset.page=project.page;slideFrame.src=project.page+'?embed'+anchor;}
  else{try{if(anchor)slideFrame.contentWindow.location.hash=anchor;else slideFrame.contentWindow.scrollTo(0,0);}catch{}}
  slide.hidden=false;slide.offsetWidth;slide.classList.add('open');document.body.classList.add('case-open');
  slideClose.focus({preventScroll:true,focusVisible:false});
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
  if(hash && hash!=='#home' && hash!=='#teaching' && !catalogApplied){
    const catalog=await loadPortfolio();
    if(version!==routeVersion)return;
    if(catalog){
      if(catalog.films)films=resolveCatalog(catalog.films.map(row=>row.payload));
      if(catalog.projects)projects=resolveCatalog(catalog.projects.map(row=>row.payload));
      if(catalog.sketches)items=resolveCatalog(catalog.sketches.map(row=>row.payload));
    }
    catalogApplied=true;
  }
  if(hash.startsWith('#work/')){const [slug,part]=hash.slice(6).split('/'),id=projectAliases[slug]||slug,project=projects.find(p=>p.id===id);
    if(project?.page){activeProject=project.id;if(modal.hidden||category!=='products')showPage('products');openCase(project,part);return;}
    closeCase();if(project)activeProject=id;showPage('products',focus);return;}
  closeCase();
  showPage((hash==='#gallery'||hash==='#sketchbook')?'art':hash==='#film'?'film':hash==='#teaching'?'teaching':hash==='#work'?'products':(hash==='#writing' || articles.some(article=>article.route===hash))?'writing':'home',focus);
}
document.querySelectorAll('[data-open-work]').forEach(button=>button.addEventListener('click',()=>{location.hash=button.dataset.openWork==='art'?'gallery':'work';}));
document.querySelector('#close-art').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const box=viewer.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)viewer.close();});
viewer.addEventListener('close',()=>{artDetail.querySelectorAll('video').forEach(video=>video.pause());document.body.classList.remove('art-is-open');artOpener?.focus({preventScroll:true});});
window.addEventListener('hashchange',()=>route(true));route();

document.querySelectorAll('[data-scroll-featured]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#home-featured')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
