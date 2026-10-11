import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ReactIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { PreviewFrame } from './preview-frame';
import { ServerCodeBlock } from './server-codeblock';

const CONTROLS_EXPORT = /^export const controls\b/m;

/**
 * Drops the `export const controls = { … }` block from the code shown: it
 * only drives the docs' controls panel, the demo's props carry the defaults.
 */
function stripControls(source: string) {
  const match = CONTROLS_EXPORT.exec(source);
  if (!match) return source;
  let depth = 0;
  let end = source.indexOf('{', match.index);
  for (; end < source.length; end++) {
    if (source[end] === '{') depth++;
    else if (source[end] === '}' && --depth === 0) break;
  }
  const rest = source.slice(end + 1).replace(/^[^\n]*\n/, '');
  return (source.slice(0, match.index) + rest).replace(/\n{3,}/g, '\n\n');
}

/**
 * A primitive's demo: the shadcn/ui component built on it, plus its usage.
 * The code shown is the demo file itself.
 */
export async function ComponentPreview({
  name,
  fullBleed = false,
  values,
  code: showCode = true,
  iframe = false,
}: {
  name: string;
  /** Backgrounds: the demo fills the whole preview. */
  fullBleed?: boolean;
  /**
   * Starts the demo's controls with these values (`{ checkAnimation: 'pop' }`):
   * the same demo, shown again in another mode.
   */
  values?: Record<string, string | number | boolean>;
  /** Show the demo's code under it (not when the page shows it already). */
  code?: boolean;
  /**
   * The demo lays out a whole page (a sidebar): shown in an iframe of its
   * own page (/examples/<library>/<name>), like shadcn/ui's blocks.
   */
  iframe?: boolean;
}) {
  // demos/<library>/<name>.tsx: discovered by path, no registry to update.
  const { default: Demo, controls } = await import(`@/demos/${name}`);

  // Helpers built on Base UI or React Aria live in components/ui/<library>/
  // here (components/ui/<library>/rhea/ for a demo in shadcn's rhea style);
  // in the reader's project they are plain @/components/ui/<name>.
  // Registry items (backgrounds) land in components/animate-ui/.
  const source = await readFile(
    path.join(process.cwd(), 'demos', `${name}.tsx`),
    'utf8',
  );
  // `export const controls` feeds the live controls panel. The demo then
  // renders in the client frame with their values as props, so it must be a
  // client component (a server one can't be passed to it).
  const hasControls = CONTROLS_EXPORT.test(source);
  if (hasControls && !/^["']use client["']/.test(source))
    throw new Error(
      `demos/${name}.tsx exports controls: it needs "use client" so the preview can pass it their values.`,
    );

  const code = stripControls(source)
    .replace(
      /@\/components\/ui\/(?:base-ui|react-aria)\/(?:rhea\/)?/g,
      '@/components/ui/',
    )
    .replace(/@\/registry\//g, '@/components/animate-ui/');

  return (
    <PreviewFrame
      fullBleed={fullBleed}
      {...(iframe && { iframe: `/examples/${name}` })}
      {...(hasControls && { demo: Demo, controls, values })}
      code={
        showCode ? (
          <ServerCodeBlock
            code={code.trimEnd()}
            lang="tsx"
            codeblock={{
              className: 'my-0',
              title: `${name.split('/').pop()}.tsx`,
              icon: <HugeiconsIcon icon={ReactIcon} strokeWidth={2} />,
              viewportClassName: 'max-h-[400px]',
            }}
          />
        ) : undefined
      }
    >
      {!hasControls && !iframe && <Demo />}
    </PreviewFrame>
  );
}
