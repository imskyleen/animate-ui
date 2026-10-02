import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

// Every registry item must ship files from its own folder: a copy-pasted
// registry-item.json once made `primitives-headless-tabs` install the switch.
test('registry items point at their own files', () => {
  const root = path.join(__dirname, '../../registry');
  const mismatches: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'registry-item.json') {
        const item = JSON.parse(fs.readFileSync(full, 'utf8'));
        const ownDir = path.relative(path.join(root, '..'), dir);
        for (const file of item.files ?? []) {
          if (path.dirname(file.path) !== ownDir) {
            mismatches.push(`${ownDir}: ${file.path}`);
          }
        }
      }
    }
  };
  walk(root);

  expect(mismatches).toEqual([]);
});
