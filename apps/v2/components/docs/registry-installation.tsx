import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

import { Command } from './installation';

/**
 * A shadcn registry item (backgrounds): the CLI adds the file to your
 * project; Manual installs its dependencies and shows the file to copy.
 */
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
    <Tabs groupId="registry-installation" persist items={['CLI', 'Manual']}>
      <Tab value="CLI">
        <Command
          command={(m) => `${m.dlx} shadcn@latest add @animate-ui/${name}`}
        />
      </Tab>
      <Tab value="Manual">
        <Steps>
          <Step>
            <h3>Install the dependencies</h3>
            <Command
              command={(m) => `${m.add} ${item.dependencies.join(' ')}`}
            />
          </Step>
          <Step>
            <h3>
              Copy the code into <code>{file.target}</code>
            </h3>
            <div className="max-h-96 overflow-auto rounded-xl">
              <ServerCodeBlock
                code={file.content.trimEnd()}
                lang="tsx"
                codeblock={{ className: 'my-0' }}
              />
            </div>
          </Step>
        </Steps>
      </Tab>
    </Tabs>
  );
}
