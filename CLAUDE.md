# CLAUDE.md

Personal portfolio for Amber Shen at ambershen.github.io.

## Stack

Vite multi-page site, vanilla JS + CSS (no framework). Push to `main` → `.github/workflows/deploy.yml` → `vite build` → GitHub Pages.

```bash
npm run dev      # local dev server
npm run build    # production build to dist/
```

## Structure

```
index.html                       # Home (flower) + hash-routed sections: #work #gallery #film #writing
experiments/petal-study/         # Home page logic: study.js (flower), collections.js (sections), style.css
src/data/site.js                 # Socials, newsletter (Buttondown) config, films  ← edit content here
src/data/case-studies.js         # Case-study entries + the section template
src/data/essays.js               # Essays / newsletter issues (bodies are .txt in experiments/petal-study/)
work/<slug>/index.html           # One shell per case study; rendered by src/case-study.js (auto-added to the build)
os/index.html + src/os/          # Amber OS: desktop of draggable windows for interactive pieces
product/*                        # Older standalone product pages
```

## Common edits

- New case study: add an entry to `src/data/case-studies.js`, then copy any `work/<slug>/` folder and change its title, description and `data-slug`. Empty sections render as dashed placeholder prompts.
- Newsletter: set `newsletter.buttondown` in `src/data/site.js` to the Buttondown username. Until then the form shows "launching soon".
- Films: add to `films` in `src/data/site.js`; set `youtube` to a video id to embed from YouTube instead of shipping the mp4.
- OS apps: the `apps` array at the top of `src/os/os.js`. `at: [x%, y%]` places an icon on the desktop, `dock: true` puts it in the dock, neither means it is only reachable from a folder. The windows open at boot are listed at the bottom of the file. `/?embed` renders the home flower without the nav (used by the Bloom window).

## Gotchas

- Asset URLs must be static: `new URL('../../images/x.png', import.meta.url)`. A template string inside `new URL()` makes Vite bundle every file under that folder (it once shipped package-lock.json).

## Design

Dark: bg #000, text #eee8e4, muted #a99b8f, accent #d9b5a3, lines #332c27. Manrope only. Peony line mark in `src/flower-mark.js`.
