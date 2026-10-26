import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';

// Only verified uploads enter this manifest. Local originals remain untouched.
export function cloudAssets(root) {
  const manifest = resolve(root, 'src/data/storage-assets.json');
  const urls = existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')) : {};
  const lookup = path => urls['/' + path.slice(root.length + 1).replaceAll('\\', '/')];
  return {
    name: 'portfolio-cloud-assets',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.')) return;
      const path = resolve(dirname(importer.split('?')[0]), source.split('?')[0]);
      if (lookup(path)) return path;
    },
    load(id) {
      const url = lookup(id.split('?')[0]);
      if (url) return `export default ${JSON.stringify(url)};`;
    },
    transform(code, id) {
      if (!/\.[cm]?[jt]sx?(?:\?|$)/.test(id) || id.includes('/node_modules/')) return;
      return code.replace(/new URL\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*,\s*import\.meta\.url\s*\)/g, (expression, quote, path) => {
        const url = lookup(resolve(dirname(id.split('?')[0]), path));
        return url ? `new URL(${JSON.stringify(url)})` : expression;
      });
    },
  };
}
