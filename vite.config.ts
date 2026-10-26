import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { cloudAssets } from './scripts/portfolio/cloud-assets.mjs';

// Every folder in /work/ with an index.html becomes a case-study page at /work/<slug>/.
const caseStudies = Object.fromEntries(
  readdirSync(resolve(__dirname, 'work'), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(resolve(__dirname, 'work', d.name, 'index.html')))
    .map(d => [`work-${d.name}`, resolve(__dirname, 'work', d.name, 'index.html')]),
);

export default defineConfig({
  plugins: [cloudAssets(__dirname)],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        os: resolve(__dirname, 'os/index.html'),
        ...caseStudies,
        'petal-study': resolve(__dirname, 'experiments/petal-study/index.html'),
        gallery: resolve(__dirname, 'gallery/index.html'),
        visuals: resolve(__dirname, 'visuals/index.html'),
        'product-deskmate': resolve(__dirname, 'product/deskmate/index.html'),
        'product-dirty-window': resolve(__dirname, 'product/dirty-window/index.html'),
        'product-bento-box': resolve(__dirname, 'product/bento-box/index.html'),
        'product-agent-skills': resolve(__dirname, 'product/agent-skills/index.html'),
      },
    },
  },
});
