import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { VUE_DEMO_CONTROLS } from '@/lib/vue';

import { PreviewFrame } from './preview-frame';
import { ServerCodeBlock } from './server-codeblock';
import { VueLogo } from './vue-logo';

const DEMOS = path.join(process.cwd(), '..', 'vue-demos', 'src', 'demos');

/** A Vue demo from apps/vue-demos in the preview frame, with its .vue source. */
export async function VueComponentPreview({
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
  const source = (
    await readFile(path.join(DEMOS, `${name}.vue`), 'utf8')
  ).replace(/(?:\.\.\/)+v2\/registry\/vue\//g, '@/components/animate-ui/');

  return (
    <PreviewFrame
      vueDemo={name}
      fullBleed={fullBleed}
      {...(iframe && { iframe: `/examples/vue/${name}` })}
      controls={VUE_DEMO_CONTROLS[name]}
      values={values}
      code={
        showCode ? (
          <ServerCodeBlock
            code={source.trimEnd()}
            lang="vue"
            codeblock={{
              className: 'my-0',
              title: `${name.split('/').pop()}.vue`,
              icon: <VueLogo />,
              viewportClassName: 'max-h-[400px]',
            }}
          />
        ) : undefined
      }
    />
  );
}
