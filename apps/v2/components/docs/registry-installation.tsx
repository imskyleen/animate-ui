import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Step, Steps } from 'fumadocs-ui/components/steps';

import { toProjectPath } from '@/lib/registry-path';

import { Command } from './installation';
import { ServerCodeBlock } from './server-codeblock';
import { InstallTabs } from './install-tabs';

export async function RegistryInstallation({ name }: { name: string }) {
  const item = JSON.parse(
    await readFile(
      path.join(process.cwd(), 'public', 'r', `${name}.json`),
      'utf8',
    ),
  ) as {
    dependencies: string[];
    files: { content: string; target: string }[];
  };
  const file = item.files[0]!;

  return (
    <InstallTabs
      groupId="registry-installation"
      tabs={[
        {
          value: 'cli',
          label: 'CLI',
          content: (
            <Command
              command={(m) => `${m.dlx} shadcn@latest add @animate-ui/${name}`}
            />
          ),
        },
        {
          value: 'manual',
          label: 'Manual',
          content: (
            <Steps>
              <Step>
                <h3>Install the dependencies</h3>
                <Command
                  command={(m) => `${m.add} ${item.dependencies.join(' ')}`}
                />
              </Step>
              <Step>
                <h3>
                  Copy the code into <code>{toProjectPath(file.target)}</code>
                </h3>
                <ServerCodeBlock
                  code={file.content.trimEnd()}
                  lang="tsx"
                  codeblock={{
                    title: file.target.split('/').pop(),
                    viewportClassName: 'max-h-96',
                  }}
                />
              </Step>
            </Steps>
          ),
        },
      ]}
    />
  );
}
