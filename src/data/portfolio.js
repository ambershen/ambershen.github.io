import {softMatterMedia} from './case-studies.js';
import deskmate from '../../images/deskmate/frontpage.mp4';
import soundDictionariesPoster from '../../images/sound-dictionaries/pronunciation-demo.jpg';
import dictionaryDemo from '../../images/sound-dictionaries/pronunciation-demo.mp4';
import dataCenterVJ from '../../images/live-visuals/data-center-2036.mp4';
import dataCenterPoster from '../../images/live-visuals/data-center-2036.jpg';
import dataCenter3D from '../../images/live-visuals/data-center-2036-3d.mp4';
import dataCenter3DPoster from '../../images/live-visuals/data-center-2036-3d.jpg';

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
  {title:'Ferrari',video:interactiveAssets['../../images/art-interactive/ferrari.mp4'],poster:new URL('../../images/art-interactive/ferrari-poster.jpg',import.meta.url).href,sound:true},
  {title:'The Persistence of Taste',video:interactiveAssets['../../images/art-interactive/the-persistence-of-taste.mp4'],poster:new URL('../../images/art-interactive/the-persistence-of-taste-poster.jpg',import.meta.url).href,sound:true},
  {title:'Places to Be',video:interactiveAssets['../../images/art-interactive/places_to_be.mp4'],description:'Interactive installation, 2025.'},
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
const sketchGroups=[
  {id:'coding',title:'Creative Coding',description:'Moving visuals, generative forms, and interactive experiments.'},
  {id:'ai',title:'AI Art',description:'Images and material explorations made with generative AI.'},
  {id:'drawing',title:'Drawings and Paintings',description:'Studies in color, texture, and mark-making.'},
];
const sketchNotes={
  'Ferrari':['coding',''],
  'The Persistence of Taste':['coding',''],
  'Calligramme — Le Pont Mirabeau':['coding','A poem explored as an interactive image.'],
  'Places to Be':['coding','An experiment in interactive installation.'],
  'Cloud Croissant':['coding','A study in an unexpected form.'],
  'Mirror — Central Park, Summer':['coding','A moving study of reflection and place.'],
  'Infinite Gallery':['coding','Artwork arranged within a continuous 3D space.'],
  'Birth Crystal':['coding','A birthdate translated into a procedural 3D crystal.'],
  'Feather Bicycle':['ai','An imagined object made from an unexpected material.'],
  'Feather Throne':['ai','A study of softness, structure, and an imagined chair.'],
  'Cloud House':['ai','An architectural form imagined in clouds.'],
};
const items=[...interactive,...selectedPaintings.map(title=>({...paintings.find(item=>item.title===title),group:'paintings'}))].map(item=>{
  const [theme,exploration]=sketchNotes[item.title]||['drawing','A seasonal study in color and atmosphere.'];
  return {...item,theme,exploration};
});
const projects=[
  {id:'natural-effects',title:'Natural Effects as the New Brush',tagline:'Voice becomes ripples. Sketches become a story. Touch becomes fractured objects.',page:'/work/natural-expressions/'},   // opens the full case study
  {id:'soft-matter',title:'Soft Matter',tagline:'Everyday materials become fonts. The fonts become new objects.',page:'/work/soft-matter/',images:softMatterMedia.map(item=>item.image)},
  {id:'live-visuals',title:'Live Visuals / VJ',tagline:'Imagined spaces, sound, and moving images.',
    summary:'Visual experiments in sound, atmosphere, and imagined spaces.',
    image:dataCenterPoster,
    studies:[{title:'Data Center, 2036',kind:'VJ · Rave concept',
      description:'A rave inside an abandoned AI data center in 2036.',
      video:dataCenterVJ,poster:dataCenterPoster,sound:true},
      {title:'Data Center in 3D',kind:'3D · Spatial study',
        description:'An orbit around the data center’s form, lighting, and atmosphere.',
        video:dataCenter3D,poster:dataCenter3DPoster,sound:true}]},
  {id:'sound-dictionaries',title:'Sound Dictionaries',tagline:'Using a model as a learning partner.',video:dictionaryDemo,poster:soundDictionariesPoster,sound:true,
    sections:[
      {title:'What if a dictionary could speak—and listen?',text:'Sound Dictionaries explores the model as a learning experience. I design the relationship between a learner, a voice, and an interface: how a word is heard, how a character responds, and what makes someone want to speak again.'},
      {title:'It begins with a physical book.',text:'The product design begins with the familiar objects we use to learn: dictionaries and notebooks. A cover gives each book a character; a page creates a focused place to read and listen. Dictionaries hold words to practise. Notebooks open those words into situations and conversations.'},
      {title:'The voice is part of the interface.',text:'With Fish Audio, I design voices and direct their delivery. Pronunciation can move from a whole word to individual syllables and back again. Pace, pauses, and character become design decisions that shape how a learner listens and responds. The model gives the page a voice, and gives that voice a particular way of teaching.'},
      {title:'A word becomes a conversation.',text:'A croissant starts as an entry in a dictionary. In a Paris notebook, it becomes something to ask a baker for. The learner can listen, try a reply, ask for a slower repetition, or turn to a hint. These guided exchanges connect the sound of a word with the experience of using it.'},
      {title:'Designing AI as a learning partner.',text:'This project explores how an AI model can be designed as a learning partner for people, introducing a new educational experience through voice, character, and conversation. I shape how that partner speaks, listens, and responds, bringing reading, listening, and speaking into a shared learning experience.'}
    ],
    live:'https://sound-dictionaries.vercel.app',links:[{label:'View on GitHub',url:'https://github.com/ambershen/sound-dictionaries'}]},
  {id:'deskmate',title:'DeskMate',tagline:'A social map for working together.',video:deskmate,
    sections:[
      {title:'It began with a saved list.',text:'I kept a list of places I liked to work from, but that personal curation was difficult to search and share. DeskMate grew from a simple need: make it easier to find a place that fits the way you want to work, and connect with people to work alongside.'},
      {title:'Designing a social map.',text:'I think of DeskMate as a social map, bringing places and people into the same context. Location gives someone a starting point; the atmosphere of a place and the possibility of company give them reasons to choose it. The design question is how to make those relationships easy to understand and act on.'},
      {title:'Making personal curation useful.',text:'The product brings together curated coworking spots, places shared by the community, and recommendations based on personal preferences. My focus is how these pieces support a decision: discovering somewhere promising, understanding whether it fits, and choosing where to spend a working day. Sharing a hidden gem lets one person’s experience become useful to someone else.'},
      {title:'From discovery to connection.',text:'The goal is to help people move from browsing a map to making a plan to work together. I approach the product through that journey: what someone needs to know, what they can do next, and how each interaction brings them closer to a place and people they want to spend time with.'}
    ],live:'https://desk-mate.ai'},
  {id:'printed-earrings',title:'3D-Printed Earrings',kind:'ARTS & CRAFTS',tagline:'From a photograph to something I can wear.',
    image:new URL('../../images/printed-earrings/in-hand.jpg',import.meta.url).href,hideHero:true,
    sections:[
      {title:'It began with a photograph.',text:'I photographed a cluster of leaves on the street, drawn to their shape and the way sunlight fell across them.',image:new URL('../../images/printed-earrings/leaf.jpg',import.meta.url).href,alt:'The original photograph of leaves and sunlight on the pavement.'},
      {title:'Light becomes a fold.',text:'I simplified the leaf shapes into a more architectural form, translating lines of light into folds and sharp edges. AI-assisted sketches helped me develop the asymmetric pair and its different views.',image:new URL('../../images/printed-earrings/design.png',import.meta.url).href,alt:'Design study of the asymmetric earrings with folded surfaces.'},
      {title:'Giving the drawing dimension.',text:'I brought the design views into Rodin to generate and refine a 3D model, developing the folds and openings into a form I could print.',image:new URL('../../images/printed-earrings/model.png',import.meta.url).href,alt:'An angled preview of the three-dimensional earring model.'},
      {title:'Something I can hold—and wear.',text:'3D printing made the digital form tangible. The asymmetric pair still needed a little polishing after printing: a photograph had become my first piece of jewelry.',image:new URL('../../images/printed-earrings/in-hand.jpg',import.meta.url).href,alt:'Hands holding the physical 3D-printed earring.'}
    ]},
];
export {projects, items, sketchGroups};
