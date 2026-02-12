# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Amber Shen, hosted on GitHub Pages at ambershen.github.io. Static site with zero build process — pure HTML, CSS, and vanilla JavaScript.

## Development

```bash
npx serve -l 3000          # preferred local dev server
python3 -m http.server 8000 # alternative
```

**Deployment:** Push to `main` branch — GitHub Pages automatically deploys.

**Validation:** `node check_html.js` runs basic HTML validation.

## Architecture

The site is a single-page app with a three-panel horizontal slider navigation system:

- `index.html` — Main page with envelope landing, three-panel slider, and media modal
- `styles.css` — All styles using CSS custom properties, keyframe animations, responsive breakpoints
- `cloud.js` — All interactivity: slider navigation (swipe/keyboard/trackpad/drag), envelope opening, modal lightbox, IntersectionObserver for video autoplay
- `visuals/` — Separate subpage with 3D CSS carousel for video content (`index.html`, `script.js`, `visuals.css`)
- `personal-website.pen` — Pencil design file (source design, read only via Pencil MCP tools)

### Page Structure

1. **Envelope landing** — ASCII cloud art, click to reveal main content
2. **Three-panel slider** controlled by `cloud.js`:
   - Panel 0 (Left Brain): Terminal-style project portfolio with image/video carousels
   - Panel 1 (Center): Personal intro letter
   - Panel 2 (Right Brain): Gallery preview linking to `/visuals/`
3. **Media modal** — Lightbox for expanding project screenshots and videos

### Navigation Methods

The slider supports: touch swipe, keyboard arrows, mouse drag, trackpad/wheel scroll, and nav dot buttons.

## Design System

CSS variables defined in `:root` of `styles.css`:
- `--bg: #FAF9F6` (cream background)
- `--text: #0A0A0C` (near-black text)
- `--font-mono: 'Geist Pixel', 'Space Mono', 'Courier New'` (monospace stack)
- `--border-width: 2px`
- Custom SVG cloud cursor via `--cursor-cloud`

Max-width container: 1440px. Responsive breakpoints at 768px and 600px.

## Assets

- `fonts/GeistPixel-Square.woff2` — Custom pixel font
- `images/` — Project screenshots organized by project subdirectory
- `films/` — Video content for the visuals section
