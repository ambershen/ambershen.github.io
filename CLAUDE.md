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
index.html                       # Home (flower) + hash-routed sections: #work #sketchbook (#gallery alias) #film #writing
experiments/petal-study/         # Home page logic: study.js (flower), collections.js (sections), style.css
src/data/site.js                 # Socials, newsletter (Buttondown) config, films  ← edit content here
src/data/case-studies.js         # Case-study entries + the section template
src/data/essays.js               # Essays / newsletter issues (bodies are .txt in experiments/petal-study/)
work/<slug>/index.html           # One shell per case study; rendered by src/case-study.js (auto-added to the build)
os/index.html + src/os/          # Amber OS: desktop of live work in windows. Hidden: not in the nav, still built at /os/
product/*                        # Older standalone product pages
```

## Common edits

- Work opens with a curated overview in `collections.js`: Natural Effects leads with Water / Sand / Ice, followed by Live Visuals and product projects. `#work/<id>` retains individual project views. Shared `naturalMedia` data supplies the material cards on both Work and the case study; its existing URL remains `/work/natural-expressions/`.

- New case study: add an entry to `src/data/case-studies.js`, then copy any `work/<slug>/` folder and change its title, description and `data-slug`. Empty sections render as dashed placeholder prompts in `npm run dev` only; the live site skips them, and `status: 'draft'` pages redirect to Work.
- Newsletter: the signup form is hidden while `newsletter.show` is false. Set `newsletter.buttondown` in `src/data/site.js` to the Buttondown username. Until then the form shows "launching soon".
- Films: add to `films` in `src/data/site.js`; set `youtube` to a video id to embed from YouTube instead of shipping the mp4.
- OS apps: the `apps` array at the top of `src/os/os.js`. `at: [x%, y%]` places an icon on the desktop, `dock: true` puts it in the dock, neither means it is only reachable from a folder. The windows open at boot are listed at the bottom of the file. `/?embed` renders the home flower without the nav (used by the Bloom window).

## Gotchas

- Asset URLs must be static: `new URL('../../images/x.png', import.meta.url)`. A template string inside `new URL()` makes Vite bundle every file under that folder (it once shipped package-lock.json).

## Design

Dark: bg #000, text #eee8e4, muted #a99b8f, accent #d9b5a3, lines #332c27. Type ("Garden"): Cormorant Garamond for headlines (28px and up only), Newsreader for essays and long text, Manrope for UI and short copy, DM Mono for small labels. Tokens and overrides sit in a "Garden type" block at the end of `experiments/petal-study/style.css` and `src/case-study.css`. Peony line mark in `src/flower-mark.js`.

Light mode: the sun/moon toggle in the header sets `data-theme="light"` on `<html>` (saved in localStorage; `?theme=light` also works). The light stylesheets `experiments/petal-study/light.css` and `src/case-study-light.css` are generated from the dark ones: after changing dark colors run `node scripts/light-theme.mjs`. Pinned tokens and hand-tuned rules live in that script. Paper #f7f2ec, ink #2a211c, muted #7b6b5f, accent #a2654c, lines #e0d5ca. The flower art is shot on black. `experiments/petal-study/cutout.js` removes the black at runtime, so every effect works on either background.

## Charm page content rule

For all new or redesigned charm pages, show only the personal information and links explicitly requested. Keep copy minimal in a carefully designed layout. Do not invent slogans, icebreakers, greetings, captions, jokes, taglines, or calls to action. Use typography, spacing, color, and illustration for personality instead.
