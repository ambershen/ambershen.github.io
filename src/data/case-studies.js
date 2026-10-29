// Deep-dive case studies. Each entry gets a real page at /work/<slug>/.
// To add one: add an entry here AND copy any folder in /work/ to /work/<slug>/
// (only the <title>, description and data-slug change).
// Any section left empty renders as a placeholder prompt in dev; the live site
// skips it. Drafts (status: 'draft') are only viewable in dev.

export const caseStudySections = [
  {key: 'question', label: 'Question', prompt: 'The one-line inquiry behind the piece. What did you want to find out?'},
  {key: 'context', label: 'Context', prompt: 'Precedents, references, and why this matters now. Who has explored this before, and what were they missing?'},
  {key: 'process', label: 'Process', prompt: 'Sketches, prototypes, and dead ends. What did you try first, what broke, and what changed your mind?'},
  {key: 'system', label: 'System', prompt: 'How it works: inputs, pipeline, interaction loop. One diagram belongs here.'},
  {key: 'outcome', label: 'Outcome', prompt: 'What the finished piece does, where it was shown, and how people responded.'},
  {key: 'next', label: 'Reflection & next questions', prompt: 'What you learned, and the research question this opens up next.'},
];

// Static URLs so Vite bundles only these files.
const img = url => url.href;

const ne = {
  water: img(new URL('../../images/natural-expressions/water-demo.mp4', import.meta.url)),
  waterDraft: img(new URL('../../images/natural-expressions/water.mp4', import.meta.url)),
  waterDraftPoster: img(new URL('../../images/natural-expressions/water.jpg', import.meta.url)),
  waterPoster: img(new URL('../../images/natural-expressions/water-demo.jpg', import.meta.url)),
  ice: img(new URL('../../images/natural-expressions/ice.mp4', import.meta.url)),
  icePoster: img(new URL('../../images/natural-expressions/ice.jpg', import.meta.url)),
  sand: img(new URL('../../images/natural-expressions/sand-projection.mp4', import.meta.url)),
  sandDraft: img(new URL('../../images/natural-expressions/sand.mp4', import.meta.url)),
  sandDraftPoster: img(new URL('../../images/natural-expressions/sand.jpg', import.meta.url)),
  sandPoster: img(new URL('../../images/natural-expressions/sand-demo.jpg', import.meta.url)),
  windowHand: img(new URL('../../images/natural-expressions/window-3688.mp4', import.meta.url)),
  windowHandPoster: img(new URL('../../images/natural-expressions/window-3688.jpg', import.meta.url)),
  windowHeart: img(new URL('../../images/natural-expressions/window-3686.mp4', import.meta.url)),
  windowHeartPoster: img(new URL('../../images/natural-expressions/window-3686.jpg', import.meta.url)),
};

// Shared by the selected-work feature and the case-study introduction.
export const naturalMedia = [
  {id: 'water', title: 'Water', interaction: 'Voice becomes ripples', kind: 'Sound & emotion', poster: ne.waterPoster,
    description: 'Exploring how the emotion in a voice can become the movement of water.'},
  {id: 'sand', title: 'Sand', interaction: 'Sketches become a story', kind: 'Drawing & projection', poster: ne.sandPoster,
    description: 'An agent draws from learned sketches, turning sand into a projected storyline.'},
  {id: 'ice', title: 'Ice', interaction: 'Touch becomes fractured objects', kind: 'Touch & resistance', poster: ne.icePoster,
    description: 'Contact builds simulated pressure, leaving traces and spreading cracks through ice.'},
];


export const softMatterMedia = [
  {title:'Purl',kind:'Knitted yarn',image:img(new URL('../../images/soft-matter/purl.png',import.meta.url)),text:'A knitting grid gives each letter its structure. Repeated V-shaped stitches turn curves into stepped, chunky forms; the gauge changes how much detail a letter can hold.'},
  {title:'Ganache',kind:'Piped chocolate',image:img(new URL('../../images/soft-matter/ganache.png',import.meta.url)),text:'Each stroke is a separate squeeze. A rounded beginning, a thinning tail, and an occasional drip carry the gesture of piping chocolate into the letterform.'},
  {title:'Tangle',kind:'Earphone cable',image:img(new URL('../../images/soft-matter/tangle.png',import.meta.url)),text:'A cable becomes a continuous lowercase script. Curves and loops keep the line connected from earbuds to plug, while slack changes its looseness.'},
  {title:'Picot',kind:'Lace ribbon',image:img(new URL('../../images/soft-matter/picot.png',import.meta.url)),text:'Thick strokes open into mesh, flowers, and eyelets. Thin strokes narrow to a thread, with small picot loops tracing the edges.'},
];

export const caseStudies = [
  {
    slug:'soft-matter',title:'Soft Matter',year:'2026',medium:'Creative coding · Type design · Material studies',
    tagline:'Everyday materials become fonts. The fonts become new objects.',status:'published',cover:false,gallery:[],sections:{},
    opening:{toc:'Overview',title:'Four materials. Four ways to write.',blocks:[{specimens:softMatterMedia,compact:true}]},
    chapters:[
      {key:'origins-materials',label:'Looking for letters in everyday things',toc:'The starting point',blocks:[
        'Soft Matter turns everyday objects into new fonts. Knitted yarn, piped chocolate, tangled earphones, and lace ribbon become letterforms through their textures, gestures, and physical constraints.',
        'The question is how much of a material’s character can remain when it becomes a typeface. A stitch creates a grid. A squeeze leaves a drip. A cable makes a loop. These details become the structure of a visual language that can take shape on a screen, in motion, or as a physical object.'
      ]},
      {key:'typefaces',label:'Four materials, four systems',toc:'The typefaces',blocks:[{specimens:softMatterMedia}]},
      {key:'variation',label:'A system you can play with',toc:'Variation',blocks:[
        'Each family supports five weights, from Light to Black, alongside color and material controls. Gauge, drip, slack, and contrast make the behavior of each material part of the design interface.',
        {image:img(new URL('../../images/soft-matter/purl-heavy.png',import.meta.url)),caption:'Purl in Black: the same words, with a heavier knitted letterform.'},
        {link:{label:'Try the type specimens',url:'https://softmatter.vercel.app/#typefaces',text:'Type your own words, change a weight, and explore the material parameters.'}}
      ]},
      {key:'outputs',label:'Fonts that carry their material with them',toc:'Reusable outputs',blocks:[
        {study:'Material lettering',sub:'PNG lettering · transparent glyph packs'},
        'The full material rendering can be exported as lettering or individual glyph images, keeping the stitches, drips, cables, and lace details for use in graphics, motion, and interfaces.',
        {study:'Installable type',sub:'Five weights · OpenType families'},
        'The font files simplify each material into monochrome vector outlines. This creates a typeable family that can be used in design tools and on the web, alongside the richer material images.',
        {link:{label:'Explore the export desk',url:'https://softmatter.vercel.app/#studio',text:'Choose a family, weight, and colorway, then export the format that fits your design.'}}
      ]},
      {key:'material-motion',label:'Letterforms with volume and movement',toc:'Volume & motion',blocks:[
        'Because these fonts come from physical things, their material qualities can shape how they move and occupy space. Ganache carries the rounded volume of piped chocolate into a sculptural, 3D letterform.',
        'The other families suggest their own movements: knitted stitches could stretch and gather, an earphone cable could coil and unravel, and lace could fold and flutter. I see motion as another way to draw with the material, extending each typeface into an expressive visual system.',
        'These systems can extend beyond website and UI typography into brand artifacts, packaging, physical objects, and accessories.'
      ]},
      {key:'in-use',label:'From type to a world of objects',toc:'In use',blocks:[
        'A fictional makers’ market brings the four families into a shared world of objects, packaging, and signage. Purl becomes lettering knitted into a tote; Ganache gives the cocoa bar its piped letterforms; Picot wraps a hatbox in a lace band; Tangle becomes an earphone cable that writes inside its packaging.',
        'The applications extend into interactive 3D displays: moving the cursor changes the light on the white-chocolate title, dragging turns the lace box, and a knitted banner moves in the wind. The material becomes part of how the typography is experienced.',
        {applications:[
          {title:'Knitted tote bag',image:img(new URL('../../images/soft-matter/in-use.png',import.meta.url)),cropLeft:75,cropTop:1140,cropWidth:540,cropHeight:600},
          {title:'Lace hatbox',image:img(new URL('../../images/soft-matter/in-use.png',import.meta.url)),cropLeft:70,cropTop:3200,cropWidth:540,cropHeight:430},
          {title:'Earphone cable poster',image:img(new URL('../../images/soft-matter/in-use.png',import.meta.url)),cropLeft:100,cropTop:4440,cropWidth:540,cropHeight:720},
          {title:'Chocolate menu',image:img(new URL('../../images/soft-matter/in-use.png',import.meta.url)),cropLeft:640,cropTop:2190,cropWidth:600,cropHeight:660},
        ]},
        {meta:'Application concepts from the fictional Soft Matter market.'},
        {link:{label:'Explore the market demo',url:'https://softmatter.vercel.app/#in-use',text:'Explore the material typefaces in an interactive 3D setting.'}}
      ]},
      {key:'second-creation',label:'A second life for everyday materials',toc:'Back to objects',blocks:[
        'An everyday object becomes a font; that font becomes the starting point for another object. This second act of making is at the heart of Soft Matter: the source material returns in a new form, carrying something of its original character.',
        {note:'Ongoing exploration · Accessories',text:'I am exploring how a letterform can become an accessory: taking it off the screen and into something that can be made, held, and worn. The next experiment is to fabricate a piece from one of these typefaces.'}
      ]},
    ],links:[{label:'Try Soft Matter',url:'https://softmatter.vercel.app/'}]
  },
  {
    slug: 'natural-expressions', // Keep the existing public URL.
    title: 'Natural Effects as the New Brush',
    year: '2026',
    medium: 'Creative coding · Interactive materials',
    status: 'in-progress',
    thumb: ne.waterPoster,
    cover: false,
    materials: naturalMedia,
    opening: {
      title: 'It began with a drawing.',
      blocks: [
        'I drew on a fogged window and watched the moisture gradually change the mark. Nature became a temporary canvas: a surface to draw on, with its own texture, movement, and sense of time.',
        {loops: [{video: ne.windowHeart, poster: ne.windowHeartPoster}], caption: 'Drawing on a fogged window — the starting point.'},
      ],
    },
    gallery: [],
    sections: {},
    chapters: [
      {key: 'question', label: 'What if natural materials became a language for interaction?', toc: 'The inquiry', blocks: [
        {lead: 'Voice becomes ripples. Sketches become a story. Touch becomes fractured objects.'},
        'Natural Effects explores how the familiar behavior of a material can become a way to express something. Across water, sand, and ice, I am developing three distinct interactions: voice translated into ripples, agent-led drawing for projected storytelling, and touch translated into simulated pressure and fracture.',
        'How can natural materials become a new canvas for self-expression—one where we can recreate familiar sensations and make something new through a digital experience?',
      ]},
      {key: 'water', label: 'Water', toc: 'Water · Voice', material: true, blocks: [
        {lead: 'Where inner emotions become visible'},
        'I use the voice of water to retell human emotions. Spoken words become ripples that gather, spread, and gradually settle. The water gives a feeling its own movement and duration, making an inner emotion visible on a surface we can respond to.',
        {experience: {
          label: 'The interaction', video: ne.water, poster: ne.waterPoster,
          caption: 'Water — interaction demo.',
          actions: [
            {title: 'Speak to the water', text: 'Voice is the input. The interaction begins with the emotional character of speech.'},
            {title: 'Transcribe the speech', text: 'Fish Audio’s speech-to-text model turns spoken input into text for the emotion-to-water interaction.'},
            {title: 'Watch it take shape', text: 'The reading becomes a change in ripple behavior. There is currently a slight delay between the voice and its expression in the water.'},
          ],
          link: {label: 'Try the water prototype', url: 'https://naturaleffects.vercel.app/?mode=water'},
        }},
        {context: {
          title: 'Water as a visual echo',
          paragraphs: [
            'An acoustic echo happens when sound reflects from a surface and returns to the listener. Here, I use echo as a visual metaphor: a voice leaves a response in water. Its spreading and settling suggest how a feeling can linger after someone has finished speaking.',
            'Monet’s water studies and Bill Viola’s The Reflecting Pool offer points of reference for water as a surface of reflection. My exploration brings that surface into a conversation: a person speaks, and water retells the emotion through movement.',
          ],
          references: [
            {label: 'Echo · ETH Zurich', url: 'https://ethz.ch/en/campus/getting-to-know/discover/culture/acoustic-mirrors/background-physics.html'},
            {label: 'Monet · The Met', url: 'https://www.metmuseum.org/art/collection/search/437137'},
            {label: 'Bill Viola · MCBA', url: 'https://www.mcba.ch/en/collection/the-reflecting-pool-from-the-reflecting-pool-collected-work-1977-80/'},
          ],
        }},
        {development: {
          title: 'Developing the water brush',
          intro: 'I began with the material and its movement, then introduced spoken language. These studies move from a surface we can disturb to a surface that can retell what we feel.',
          stages: [
            {title: 'Simulate water and ripple movement', text: 'I first built a water surface and explored how ripples respond to a mouse, camera tracking, and a touchscreen. Propagation, overlapping waves, and gradual decay let a gesture continue through the material after contact ends.', media: {video: ne.waterDraft, poster: ne.waterDraftPoster, caption: 'Early water study — exploring the surface and ripple movement before the emotion mapping.'}},
            {title: 'Connect spoken words to emotion', text: 'A speech-to-text (STT) model transcribes spoken words for emotion mapping. The current prototype uses Fish Audio. Real-time translation remains a limitation: the transcription and interpretation introduce a delay between speaking and seeing the water respond.'},
            {title: 'Let water retell the emotion', text: 'I then map the interpreted emotion to the behavior of the ripples: how they gather, spread, overlap, and settle. The aim is to give water an expressive voice, allowing a feeling to unfold again through movement.'},
          ],
        }},
      ]},
      {key: 'sand', label: 'Sand', toc: 'Sand · Storytelling', material: true, blocks: [
        {lead: 'From a temporary canvas to an infinite canvas'},
        'The story began with a drawing on a fogged window: a fleeting mark on a canvas that nature would eventually take back. I captured that temporary, ephemeral canvas and carried the idea into sand. Through sound and projected imagery, it becomes an infinite canvas for visuals and stories, able to hold another drawing, another rhythm, and another story.',
        'I choose to tell art history through the agent’s act of drawing. Brush simulation gives the canvas its material behavior; BPM-driven visuals give it rhythm. The storyteller agent interprets artistic references and styles as sketches in the sand, making the audiovisual gallery a story told through marks.',
        {experience: {
          label: 'The interaction', video: ne.sand, poster: ne.sandPoster,
          caption: 'Sand — drawing demonstration.',
          actions: [
            {title: 'Establish the rhythm', text: 'BPM provides the foundation for the beat visualization, connecting the music to movement on the sand.', phase: 'Beat visualization'},
            {title: 'Draw a story', text: 'A storyteller agent draws sketches into the surface, informed by artistic learning and styles.', phase: 'Storyteller agent'},
            {title: 'Watch the gallery unfold', text: 'Rhythm and drawing come together as an audiovisual sand gallery, exploring different artistic styles.', phase: 'Sand gallery visualization'},
          ],
          link: {label: 'Try the sand surface', url: 'https://naturaleffects.vercel.app/?mode=sand'},
        }},
        {interaction: {input: 'Music / BPM and artistic styles', mapping: 'Beat visualization and storyteller agent', output: 'An audiovisual sand gallery'}},
        {context: {
          title: 'A canvas for images and sound',
          paragraphs: [
            'Early drawings on stone and cave walls remind me that an image begins with a material. Sand carries that relationship into a surface that can be drawn, erased, and drawn again.',
            'The temporary canvas becomes infinite through the images and sound it can carry. Sound gives the drawing a rhythm; projected imagery gives it a shared space. Each drawing can become part of a continuing audiovisual gallery.',
          ],
          references: [
            {label: 'Blombos drawing · Natural History Museum', url: 'https://www.nhm.ac.uk/discover/news/2018/september/the-oldest-drawing-ever-found-is-a-stone-hashtag.html'},
            {label: 'Mineral pigments · Lascaux', url: 'https://archeologie.culture.gouv.fr/lascaux/en/raw-materials'},
          ],
        }},
        {development: {
          title: 'From a sand brush to a gallery',
          intro: 'The process starts with the temporary canvas and expands what it can hold: simulated material, musical rhythm, and agent-led stories, composed across artistic styles.',
          stages: [
            {title: 'Simulate the sand brush', text: 'I began with movement, brush shape, and gravity: a stroke displaces sand into a groove with raised edges. This initial simulation became the drawing tool for the gallery. I later exported the sand brush as a reusable skill, so its material behavior could carry into other experiments.', media: {video: ne.sandDraft, poster: ne.sandDraftPoster, caption: 'Early sand study — testing the brush and the marks it leaves.'}},
            {title: 'Map music to the brush', text: 'BPM sets the pace of strokes and the scrolling canvas. Beats trigger new marks; volume and bass change simulated pressure and brush width. Drops introduce broader strokes, while quieter passages draw calmer patterns. Together, these mappings give the drawing a rhythm and a changing weight.'},
            {title: 'Create the storyteller agent', text: 'I prototype the storyteller in Claude Code with skills for building a motif library, shaping a story, and composing connected scenes. The agent combines existing motifs with its own SVG strokes, then reviews rendered previews. These composed scenes become a scroll that the music brings to life.'},
            {title: 'Compose the sand gallery', text: 'Combine the material, beat visualization, and agent-led drawing into an audiovisual gallery. Different artistic styles shape the sketches and the character of each visualization.'},
          ],
        }},
      ]},
      {key: 'ice', label: 'Ice', toc: 'Ice · Touch', material: true, blocks: [
        {lead: 'From a gentle touch to a growing fracture'},
        'Ice makes effort visible. A light movement, repeated rubbing, and a sustained press each leave a different kind of mark, from a faint impression to a fractured surface.',
        {experience: {
          label: 'The interaction', video: ne.ice, poster: ne.icePoster,
          caption: 'Ice prototype — faint friction marks, accumulated contact, and irregular fractures. Touch duration acts as a pressure proxy.',
          actions: [
            {title: 'Glide across', text: 'An ordinary movement leaves a soft, damp impression. It does not immediately break the ice.'},
            {title: 'Rub and retrace', text: 'Slow, repeated passes build a faint mark through the frost. The trace gradually fades as the surface refrosts.'},
            {title: 'Hold, then release', text: 'Near-stationary contact builds simulated load. Jagged cracks grow, accompanied by short fracture sounds. Growth stops on release; the damage remains.'},
          ],
          link: {label: 'Try the ice prototype', url: 'https://naturaleffects.vercel.app/?mode=ice'},
        }},
        {interaction: {input: 'Touchscreen or mouse contact', mapping: 'Motion, retracing, and contact duration', output: 'Faint marks and fractured ice'}},
        {development: {
          title: 'Developing the ice brush',
          intro: 'The iterations focused on separating the sensation of writing from the sensation of breaking, so every touch does not produce the same response.',
          stages: [
            {title: 'Establish the material', text: 'Ice references guided a gray-white surface, cloudy frost, and connected irregular plates. Shared jagged boundaries let neighboring pieces fit together as seams open.'},
            {title: 'Give friction a memory', text: 'Bright scratches and loose particles were replaced by faint, accumulated rubbing. Slow passes contribute more than fast ones; retracing increases visibility within a low opacity ceiling.'},
            {title: 'Separate pressure from movement', text: 'Near-stationary contact builds load, while ordinary slow writing stays separate. Cracks branch over time. Continuous rubbing audio and sparse fracture events replace short, repeatedly triggered sounds.'},
          ],
          decision: {title: 'Effort comes from accumulation, not delay.', text: 'The contact tracks immediately. Resistance comes from how slowly a mark builds and how load accumulates before a fracture. Ordinary touch uses dwell as a pressure proxy, not a force sensor.'},
        }},
        {note: 'Ongoing exploration · Temperature', text: 'I am exploring temperature as another input: how could warmth trigger or change the fractures? Adding a temperature sensor is the next step in testing this interaction.'},
      ]},
      {key: 'tools', label: 'Recipes for new materials and interfaces', toc: 'Reusable skills', blocks: [
        {lead: 'A material study can become a recipe for something new.'},
        'I extract the effects and their interaction principles into reusable skills for coding agents. Each skill carries a material’s behavior: how it responds to input, how a mark builds, and what continues after contact ends.',
        'These skills can serve as recipes for UI design, new materials, and new interfaces. Water’s motion could shape responsive feedback; ice’s accumulated contact could inform an interface that responds to sustained input. Combining behaviors or changing the input opens up new surfaces and ways to interact.',
        {link: {text: 'The open-source collection includes five material skills, shared touch and hand-tracking behaviors, and a Temporary Canvas recipe to adapt and combine in new designs.', label: 'Explore the Natural Effect skills', url: 'https://github.com/ambershen/natural-effect', more: {label: 'Try the material prototypes', url: 'https://naturaleffects.vercel.app/'}}},
      ]},
      {key: 'implementation', label: 'Implementation', blocks: [
        {meta: 'Material simulation & interaction: TypeScript · Vite · Canvas 2D · WebGL shaders · MediaPipe hand tracking · Pointer and touchscreen input.'},
        {meta: 'Sound & expression: Web Audio analysis · BPM and beat detection · Frequency-band and loudness mapping · Fish Audio speech-to-text · Emotion-to-ripple mapping.'},
        {meta: 'Story & drawing: Claude Code · Reusable agent skills · SVG stroke and motif libraries · JSON scene composition · Node.js rendering tools and PNG previews for visual critique.'},
        {meta: 'Spatial experiments: TouchDesigner for the separate projection and reflection prototype.'},
      ]},
    ],
    links: [{label: 'Try the material prototypes', url: 'https://naturaleffects.vercel.app/'}, {label: 'Agent skills on GitHub', url: 'https://github.com/ambershen/natural-effect'}],
  },
  {
    slug: 'birth-crystal',
    listed: false, // kept for Amber OS; not shown as work
    title: 'Birth Crystal',
    year: '2025',
    medium: 'Procedural 3D · Web',
    tagline: 'Procedural crystals generated from birthdates.',
    status: 'draft',
    cover: {image: img(new URL('../../images/birth-crystal/frontpage.png', import.meta.url))},
    gallery: [img(new URL('../../images/birth-crystal/1st.png', import.meta.url)), img(new URL('../../images/birth-crystal/2nd.png', import.meta.url)), img(new URL('../../images/birth-crystal/3rd.png', import.meta.url))],
    sections: {},
    links: [],
  },
  {
    slug: 'calligramme',
    listed: false, // kept for Amber OS; not shown as work
    title: 'Calligramme — Le Pont Mirabeau',
    year: '2025',
    medium: 'Interactive poem · Code',
    tagline: 'A programmatic homage to Apollinaire.',
    status: 'draft',
    cover: {video: img(new URL('../../images/art-interactive/calligramme.mp4', import.meta.url))},
    gallery: [],
    sections: {},
    links: [],
  },
  {
    slug: 'places-to-be',
    listed: false, // kept for Amber OS; not shown as work
    title: 'Places to Be',
    year: '2025',
    medium: 'Interactive installation',
    tagline: 'An installation about the places we carry with us.', // PLACEHOLDER
    status: 'draft',
    cover: {video: img(new URL('../../images/art-interactive/places_to_be.mp4', import.meta.url))},
    gallery: [],
    sections: {},
    links: [],
  },
  {
    slug: 'consensus-sunset',
    listed: false, // kept for Amber OS; not shown as work
    title: 'Consensus Sunset',
    year: '2026',
    medium: 'Installation · ML pipeline · In development',
    tagline: '1,000 sunsets averaged into one machine-mediated sky.',
    status: 'in-progress',
    cover: null,
    gallery: [],
    sections: {},
    links: [],
  },
];
