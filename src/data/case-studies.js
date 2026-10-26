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
  water: img(new URL('../../images/natural-expressions/water.mp4', import.meta.url)),
  waterPoster: img(new URL('../../images/natural-expressions/water.jpg', import.meta.url)),
  ice: img(new URL('../../images/natural-expressions/ice.mp4', import.meta.url)),
  icePoster: img(new URL('../../images/natural-expressions/ice.jpg', import.meta.url)),
  sand: img(new URL('../../images/natural-expressions/sand.mp4', import.meta.url)),
  sandPoster: img(new URL('../../images/natural-expressions/sand.jpg', import.meta.url)),
  snow: img(new URL('../../images/natural-expressions/snow-01.mp4', import.meta.url)),
  snowPoster: img(new URL('../../images/natural-expressions/snow-01.jpg', import.meta.url)),
  windowHand: img(new URL('../../images/natural-expressions/window-3688.mp4', import.meta.url)),
  windowHandPoster: img(new URL('../../images/natural-expressions/window-3688.jpg', import.meta.url)),
  windowHeart: img(new URL('../../images/natural-expressions/window-3686.mp4', import.meta.url)),
  windowHeartPoster: img(new URL('../../images/natural-expressions/window-3686.jpg', import.meta.url)),
};

export const caseStudies = [
  {
    // A series with its own chapters instead of the template sections above.
    // Block types: string (paragraph), {lead}, {study, sub}, {video, poster, caption}, {loops, caption}, {link}, {diagram},
    // {placeholder}, {note, text}, {step, text}, {meta}.
    slug: 'natural-expressions',
    title: 'Natural Expressions',
    year: '2026',
    medium: 'Creative coding · Ongoing research',
    tagline: 'Designing creative expression through natural interactions.',
    status: 'in-progress',
    thumb: ne.waterPoster,
    cover: false, // no cover; the page opens straight into the question
    gallery: [],
    sections: {},
    chapters: [
      {key: 'question', label: 'How can familiar interactions with natural materials become expressive tools for drawing and storytelling?', toc: 'Where it began', blocks: [
        {lead: 'How might the feel of a surface change what we choose to create?'},
        'The project began with drawing on a winter car window and watching moisture gradually change the mark.',
        {loops: [{video: ne.windowHand, poster: ne.windowHandPoster}, {video: ne.windowHeart, poster: ne.windowHeartPoster}], caption: 'Where it began — a fogged car window on a snowy drive.'},
        'It has grown into five studies of water, ice, condensation, sand, and snow. Each starts with a familiar real-world interaction (stirring, rubbing, wiping, pushing, or compressing) and explores how its movement, texture, sound, and sense of effort can become expressive controls for drawing and storytelling.',
      ]},
      {key: 'studies', label: 'Material studies', blocks: [
        {study: 'Water', sub: 'Sound as part of movement'},
        'Water explores gesture-driven sound synthesis alongside ripples and wakes. A fingertip and an open hand suggest different scales of contact, shaping both movement and its sonic character. Propagation, damping, and gesture-to-sound mappings become ways to explore continuity: how water responds to a sustained movement, changes direction, and settles after release.',
        {video: ne.water, poster: ne.waterPoster, caption: 'Water — movement and sound'},
        {study: 'Ice', sub: 'Weight, resistance, and accumulation'},
        'Ice explores how touch can suggest weight and resistance. Slow rubbing accumulates faint traces; sustained contact and two-finger compression build simulated load, spreading irregular cracks and triggering sound. Duration and movement act as proxies for pressure, exploring how the weight of a hand on physical ice can be translated into screen-based interaction.',
        {video: ne.ice, poster: ne.icePoster, caption: 'Ice — friction and fractures'},
        {study: 'Condensation, Sand and Snow', sub: 'Temporary canvas'},
        'My initial experiment explored being imaginative with a foggy window, turning it into a temporary canvas for drawing and storytelling. Later iterations extended this idea to sand and snow, exploring how different natural surfaces can hold, reshape, and gradually lose a trace.',
        'I map fingertip movements, broad swipes, and sustained contact to different surface responses: clearing condensation, pushing sand into ridges, and compressing snow into impressions. Fine droplets, individual grains, and powdery relief give each canvas its texture. Simulated gravity draws water downward and lets displaced sand and snow settle, while returning moisture and fresh snowfall gradually change what was drawn.',
        {placeholder: 'Condensation — drawing on a foggy window, followed by droplets and returning moisture. Coming soon.'},
        {video: ne.sand, poster: ne.sandPoster, caption: 'Sand — drawing through displacement'},
        {video: ne.snow, poster: ne.snowPoster, caption: 'Snow — compression and accumulation'},
        {note: 'Emerging observations', text: 'While testing the prototypes, I found myself moving continuously through water, slowing down and retracing on ice, and watching marks change in fog, sand, and snow. These early observations make me curious about how a surface’s behavior might shape someone else’s way of drawing.'},
      ]},
      {key: 'tools', label: 'From experiments to tools', blocks: [
        {step: 'Observe and decompose', text: 'Each study begins by observing how a natural surface looks, moves, and responds to a hand. I break the experience down into texture, gesture, and material behavior, then share descriptions, images, and videos with AI to help identify patterns and translate them into rules for an interaction.'},
        {step: 'Build and iterate', text: 'Working with a coding agent, I turn these observations into interactive prototypes. I test and refine hand tracking, sound mappings, and approximations of gravity, friction, and resistance, returning to the references and the experience of using each surface to guide each revision.'},
        {step: 'Capture skills and compose recipes', text: 'I capture working behaviors in reusable code modules and their design reasoning as skills. The next step is to package them into material recipes, preserving relationships such as how much effort leaves a mark, when sound responds, and what continues after contact. Making these relationships adjustable could help artists create new drawing surfaces and storytelling tools.'},
        {link: {text: 'The skills are open source as Natural Effects: five materials, a shared touch and hand-tracking layer, and the Temporary Canvas recipe, each written for a coding agent.', label: 'View the skills on GitHub', url: 'https://github.com/ambershen/natural-effect'}},
        {diagram: 'process', caption: 'Natural observation → AI-assisted decomposition → coding and iteration → reusable modules and skills → material recipes.'},
      ]},
      {key: 'implementation', label: 'Implementation', blocks: [
        {meta: 'TypeScript · Canvas 2D / WebGL · MediaPipe hand tracking · Web Audio with sample-based sound synthesis · Pointer and touchscreen input. TouchDesigner supports a separate projection and reflection prototype.'},
      ]},
    ],
    links: [{label: 'Explore the interactive work', url: 'https://naturaleffects.vercel.app/'}, {label: 'Agent skills on GitHub', url: 'https://github.com/ambershen/natural-effect'}],
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
