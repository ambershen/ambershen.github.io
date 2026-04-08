import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
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
