// Deep-dive case studies. Each entry gets a real page at /work/<slug>/.
// To add one: add an entry here AND copy any folder in /work/ to /work/<slug>/
// (only the <title>, description and data-slug change).
// Any section left empty renders as a visible placeholder prompt.

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

export const caseStudies = [
  {
    slug: 'birth-crystal',
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
