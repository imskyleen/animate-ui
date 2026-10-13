import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ReactIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { PreviewFrame } from './preview-frame';
import { ServerCodeBlock } from './server-codeblock';

const CONTROLS_EXPORT = /^export const controls\b/m;

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

export async function ComponentPreview({
  name,
  fullBleed = false,
  values,
  code: showCode = true,
  iframe = false,
}: {
  name: string;
  fullBleed?: boolean;
  values?: Record<string, string | number | boolean>;
  code?: boolean;
  iframe?: boolean;
}) {
  const { default: Demo, controls } = await import(`@/demos/${name}`);

  const source = await readFile(
    path.join(process.cwd(), 'demos', `${name}.tsx`),
    'utf8',
  );
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
