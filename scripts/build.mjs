import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const [html, css, fonts, engine, app] = await Promise.all([
  readFile(path.join(root, 'index.html'), 'utf8'),
  readFile(path.join(root, 'src/style.css'), 'utf8'),
  readFile(path.join(root, 'src/fonts.js'), 'utf8'),
  readFile(path.join(root, 'src/engine.js'), 'utf8'),
  readFile(path.join(root, 'src/app.js'), 'utf8'),
]);
const js = [fonts,engine,app].map(source=>source.replace(/^import .*?;\n/gm,'').replace(/^export /gm,'')).join('\n');
const output = html
  .replace('<link rel="stylesheet" href="./src/style.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="./src/app.js"></script>', () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
await rm(path.join(root, 'dist'), { recursive: true, force: true });
await mkdir(path.join(root, 'dist'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), output);
console.log('Build concluído: dist/index.html (independente, sem CDN).');
