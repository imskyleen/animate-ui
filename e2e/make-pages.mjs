// Builds app/e2e/page.tsx in an e2e project from the v2 demos' usage parts.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [project, library] = process.argv.slice(2);
const DEMOS = path.join(import.meta.dirname, '..', 'apps', 'v2', 'demos');
const NAMES = ['dialog', 'alert-dialog', 'dropdown-menu', 'select', 'popover', 'accordion', 'tabs', 'switch', 'tooltip', 'checkbox', 'drawer'];
const dir = path.join(project, 'app', 'e2e');
mkdirSync(dir, { recursive: true });
const used = [];
for (const name of NAMES) {
  let code;
  try { code = readFileSync(path.join(DEMOS, library, `${name}.tsx`), 'utf8'); } catch { continue; }
  const exportMatch = code.match(/\nexport \{([^}]*)\}\n/);
  if (!exportMatch) continue;
  const names = exportMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
  const head = code.slice(0, exportMatch.index);
  const usage = code.slice(exportMatch.index + exportMatch[0].length);
  // Keep the demo's imports (minus the primitive's), drop the component code.
  const imports = (head.match(/^import[\s\S]*?from\s+["'][^"']+["']\n?/gm) || [])
;
  // Names the kept imports already bind (local names).
  const bound = new Set(
    imports.flatMap((line) =>
      (line.match(/\{([^}]*)\}/)?.[1] ?? '').split(',').map((spec) => spec.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()).filter(Boolean),
    ),
  );
  const file = [
    '"use client"',
    ...imports.map((l) => l.replace(/@\/components\/ui\/(base-ui|react-aria)\//g, '@/components/ui/').trim()),
    `import { ${names.filter((n) => !bound.has(n.replace(/^type\s+/, ''))).join(', ')} } from "@/components/ui/${name}"`,
    usage.replace(/@\/components\/ui\/(base-ui|react-aria)\//g, '@/components/ui/'),
  ].join('\n');
  writeFileSync(path.join(dir, `${name}.tsx`), file.replace(/^"use client"\n"use client"/, '"use client"'));
  used.push(name);
}
const id = (n) => n.replace(/-(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase()) + 'Demo';
writeFileSync(path.join(dir, 'page.tsx'), [
  ...used.map((n) => `import ${id(n)} from "./${n}"`),
  '',
  'export default function E2EPage() {',
  '  return (',
  '    <main className="flex flex-col items-center gap-16 p-16">',
  ...used.map((n) => `      <section data-demo="${n}" className="flex min-h-40 w-full max-w-xl items-center justify-center"><${id(n)} /></section>`),
  '    </main>',
  '  )',
  '}',
  '',
].join('\n'));
console.log(library, used.join(' '));
