// Static video-to-cover URLs. Regenerate covers when replacing a video.
const posters = new Map([
  [new URL('../../films/touch-me-motion.mp4', import.meta.url).href, new URL('../../images/posters/f5696b8ece7e.jpg', import.meta.url).href],
  [new URL('../../films/jewelry-commercial.mp4', import.meta.url).href, new URL('../../images/posters/97aa583c4b8c.jpg', import.meta.url).href],
  [new URL('../../films/macroscope-ad-astra.mp4', import.meta.url).href, new URL('../../images/posters/f171398ce078.jpg', import.meta.url).href],
  [new URL('../../films/fragrance-scent-simulations.mp4', import.meta.url).href, new URL('../../images/posters/df9c212e9d95.jpg', import.meta.url).href],
  [new URL('../../films/cinematic-visual.mp4', import.meta.url).href, new URL('../../images/posters/8ca6f4c6b26e.jpg', import.meta.url).href],
  [new URL('../../films/Limited-time-FREE-final.mp4', import.meta.url).href, new URL('../../images/posters/104ff733fff2.jpg', import.meta.url).href],
  [new URL('../../films/fish-audio-drama-3-x-astorie.mp4', import.meta.url).href, new URL('../../images/posters/0d9a2a5f36c0.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/calligramme.mp4', import.meta.url).href, new URL('../../images/posters/ce11982988c4.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/cloud-croissant.mp4', import.meta.url).href, new URL('../../images/posters/14c0ae75a98f.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/the-persistence-of-taste.mp4', import.meta.url).href, new URL('../../images/posters/fda6896d80a1.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/ferrari.mp4', import.meta.url).href, new URL('../../images/posters/0e50f0557bbd.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/touch-me-motion.mp4', import.meta.url).href, new URL('../../images/posters/e4260819686b.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/ascii-art-flow.mp4', import.meta.url).href, new URL('../../images/posters/56ca81234582.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/peony-glyph.mp4', import.meta.url).href, new URL('../../images/posters/028f7fb7cb95.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/places_to_be.mp4', import.meta.url).href, new URL('../../images/posters/4d9ff0c56808.jpg', import.meta.url).href],
  [new URL('../../images/art-interactive/mirror-central-park-summer.mp4', import.meta.url).href, new URL('../../images/posters/a1823e7682ce.jpg', import.meta.url).href],
  [new URL('../../images/deskmate/frontpage.mp4', import.meta.url).href, new URL('../../images/posters/f81c470f433a.jpg', import.meta.url).href],
  [new URL('../../images/infinite-gallery/frontpage.mp4', import.meta.url).href, new URL('../../images/posters/3f300bfc95cb.jpg', import.meta.url).href],
]);
const path = src => { try { return new URL(src, 'https://portfolio.local').pathname; } catch { return src; } };
const byPath = new Map([...posters].map(([video, poster]) => [path(video), poster]));
export const videoPoster = src => byPath.get(path(src)) || '';
