# CLAUDE.md

Personal portfolio website for Amber Shen, hosted on GitHub Pages at ambershen.github.io.

## Stack

Astro + TypeScript, static output, deployed via GitHub Actions.

## Development

```bash
npm run dev        # local dev server with hot reload
npm run build      # production build to dist/
npm run preview    # preview production build
```

## Structure

```
src/
  layouts/Base.astro         # HTML shell, nav, footer, meta/OG tags
  components/                # Nav, Footer, ProjectCard
  pages/                     # index, about, work/, gallery, visuals
  styles/global.css          # design system, variables, responsive
  assets/                    # images, fonts (processed by astro)
public/                      # static assets (favicon, robots.txt, images)
_old/                        # previous vanilla HTML/CSS/JS site (reference)
```

## Design System

- Colors: cream bg (#F5F1EB), soft black text (#1C1C1E), indigo accent (#3D3A8C), terracotta (#C4533A)
- Typography: Inter (body), GeistPixel (accents/nav), Instrument Serif (hero)
- Layout: 720px prose, 1080px grid, 8px cinematic letterbox bars

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` → astro build → GitHub Pages.
