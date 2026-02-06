# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Amber Shen, hosted on GitHub Pages at ambershen.github.io. It's a static site with no build process.

## Development

**Local preview:** Open `index.html` directly in a browser, or use any local server:
```bash
python3 -m http.server 8000
```

**Deployment:** Push to `main` branch - GitHub Pages automatically deploys.

## Architecture

- `index.html` - Single-page site with header, hero, about, work, and contact/footer sections
- `styles.css` - All styles using CSS custom properties for theming
- `images/` - Generated images for the site
- `personal-website.pen` - Pencil design file (source design)

## Design System

CSS variables defined in `:root`:
- `--accent: #D14A61` (red accent color)
- `--dark: #0A0A0C` (near-black)
- `--white: #FFFFFF`
- `--gray: #666666`
- `--font-grotesk` / `--font-mono` (Space Grotesk / Space Mono fonts)

The site uses a max-width of 1440px and has responsive breakpoints at 1200px, 900px, and 600px.
