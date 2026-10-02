import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Compares smoke-test screenshots against a saved baseline.
//   pnpm test:visual-diff            → compare tests/.results/screenshots with tests/.baseline
//   pnpm test:visual-diff --update   → replace the baseline with the latest screenshots

const root = path.dirname(new URL(import.meta.url).pathname);
const baselineDir = path.join(root, '.baseline');
const currentDir = path.join(root, '.results/screenshots');
const diffDir = path.join(root, '.results/diff');
const THRESHOLD = 0.001; // share of differing pixels tolerated

// Random, canvas or time-driven demos: never identical between two runs.
const NON_DETERMINISTIC = new Set([
  'demo-components-backgrounds-fireworks.png',
  'demo-components-backgrounds-fireworks-circle.png',
  'demo-components-backgrounds-gravity-stars.png',
  'demo-components-community-radial-intro.png',
  // Time-driven text/caret animations.
  'demo-primitives-texts-typing.png',
  'demo-primitives-texts-scrolling-number.png',
  'demo-components-animate-code.png',
  'demo-components-animate-code-tabs.png',
  'demo-components-animate-cursor.png',
]);

if (process.argv.includes('--update')) {
  fs.rmSync(baselineDir, { recursive: true, force: true });
  fs.cpSync(currentDir, baselineDir, { recursive: true });
  console.log(`Baseline updated from ${currentDir}`);
  process.exit(0);
}

fs.rmSync(diffDir, { recursive: true, force: true });
fs.mkdirSync(diffDir, { recursive: true });

const changed: string[] = [];
const missing: string[] = [];

for (const file of fs
  .readdirSync(baselineDir)
  .filter((f) => f.endsWith('.png') && !NON_DETERMINISTIC.has(f))) {
  const currentPath = path.join(currentDir, file);
  if (!fs.existsSync(currentPath)) {
    missing.push(file);
    continue;
  }
  const before = PNG.sync.read(fs.readFileSync(path.join(baselineDir, file)));
  const after = PNG.sync.read(fs.readFileSync(currentPath));
  if (before.width !== after.width || before.height !== after.height) {
    changed.push(
      `${file} (size ${before.width}x${before.height} → ${after.width}x${after.height})`,
    );
    continue;
  }
  const diff = new PNG({ width: before.width, height: before.height });
  const pixels = pixelmatch(
    before.data,
    after.data,
    diff.data,
    before.width,
    before.height,
    {
      threshold: 0.1,
    },
  );
  const ratio = pixels / (before.width * before.height);
  if (ratio > THRESHOLD) {
    changed.push(`${file} (${(ratio * 100).toFixed(2)}%)`);
    fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  }
}

console.log(`${changed.length} changed, ${missing.length} missing`);
for (const line of changed) console.log(`  ~ ${line}`);
for (const line of missing) console.log(`  - ${line}`);
if (changed.length || missing.length) {
  console.log(`Diff images: ${diffDir}`);
  process.exit(1);
}
