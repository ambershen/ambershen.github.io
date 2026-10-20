// Single source of truth for the newer sections of the site.
// Edit this file to swap placeholders for real content.

export const socials = [
  {label: 'YouTube', handle: '@whosamberella', url: 'https://www.youtube.com/@whosamberella'},
  {label: 'Instagram', handle: '@whosamberella', url: 'https://instagram.com/whosamberella'},
  {label: 'X', handle: '@whosamberella', url: 'https://x.com/whosamberella'},
  {label: 'GitHub', handle: 'ambershen', url: 'https://github.com/ambershen'},
];

// ── Newsletter ────────────────────────────────────────────────
// 1. Sign up at buttondown.com  2. Put your username below.
// While `buttondown` is empty the form shows a "launching soon" note.
export const newsletter = {
  name: 'Petal Notes', // PLACEHOLDER — rename
  blurb: 'Occasional letters on code as art, tech storytelling, and making things you can play with.', // PLACEHOLDER
  cadence: 'About once a month. No spam, unsubscribe anytime.',
  buttondown: '', // e.g. 'whosamberella'
};
export const buttondownUrls = user => user ? {
  subscribe: `https://buttondown.com/api/emails/embed-subscribe/${user}`,
  archive: `https://buttondown.com/${user}/archive/`,
  rss: `https://buttondown.com/${user}/rss`,
} : null;

// ── Film ──────────────────────────────────────────────────────
// Prefer YouTube for anything large: set `youtube` to the video id
// (the part after watch?v=) and the local file is no longer loaded.
export const films = [
  {
    id: 'fragrance-scent-simulations',
    title: 'Scent Simulations',
    year: '2025', // PLACEHOLDER
    kind: 'Fragrance film', // PLACEHOLDER
    note: 'Add a one-line logline here.', // PLACEHOLDER
    youtube: '',
    src: new URL('../../films/fragrance-scent-simulations.mp4', import.meta.url).href,
    featured: true,
  },
  {
    id: 'jewelry-commercial',
    title: 'Jewelry Commercial',
    year: '2025', // PLACEHOLDER
    kind: 'Commercial', // PLACEHOLDER
    note: 'Add a one-line logline here.', // PLACEHOLDER
    youtube: '',
    src: new URL('../../films/jewelry-commercial.mp4', import.meta.url).href,
  },
  // { id:'murmur', title:'Murmur', year:'2026', kind:'Concept film', youtube:'VIDEO_ID', note:'' },
];

// ── Music ─────────────────────────────────────────────────────
// The Music.app window in /os. Nothing plays until a track has an
// `src`: drop an mp3 in /audio and point to it the way films do —
// src: new URL('../../audio/track.mp3', import.meta.url).href
// Without a src the row still lists; it just shows as unavailable.
export const music = {
  title: 'On repeat', // PLACEHOLDER — name the playlist
  note: 'What plays while I build.', // PLACEHOLDER
  tracks: [
    {title: 'Track one', artist: 'Artist', length: '3:24'}, // PLACEHOLDER
    {title: 'Track two', artist: 'Artist', length: '4:02'}, // PLACEHOLDER
    {title: 'Track three', artist: 'Artist', length: '2:58'}, // PLACEHOLDER
    {title: 'Track four', artist: 'Artist', length: '5:11'}, // PLACEHOLDER
  ],
};
