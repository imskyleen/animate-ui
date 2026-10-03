import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

const MANAGERS = {
  pnpm: { add: 'pnpm add', dlx: 'pnpm dlx' },
  npm: { add: 'npm install', dlx: 'npx' },
  yarn: { add: 'yarn add', dlx: 'yarn dlx' },
  bun: { add: 'bun add', dlx: 'bunx --bun' },
} as const;

type Manager = keyof typeof MANAGERS;

async function Command({
  command,
}: {
  command: (manager: (typeof MANAGERS)[Manager]) => string;
}) {
  const managers = Object.keys(MANAGERS) as Manager[];
  return (
    <Tabs groupId="package-manager" persist items={managers}>
      {managers.map((manager) => (
        <Tab key={manager} value={manager}>
          <ServerCodeBlock
            code={command(MANAGERS[manager])}
            lang="bash"
            codeblock={{ className: 'my-0' }}
          />
        </Tab>
      ))}
    </Tabs>
  );
}

/**
 * The three steps: packages, the shadcn/ui component, then animate it.
 * Without `name` (Animate UI's own primitives), the package is all it takes.
 */
export function Installation({ name }: { name?: string }) {
  if (!name) {
    return <Command command={(m) => `${m.add} @animate-ui/react motion`} />;
  }

  return (
    <Steps>
      <Step>
        <h3>Install the packages</h3>
        <Command command={(m) => `${m.add} @animate-ui/react motion`} />
      </Step>
      <Step>
        <h3>Add the shadcn/ui component</h3>
        <Command command={(m) => `${m.dlx} shadcn@latest add ${name}`} />
      </Step>
      <Step>
        <h3>Animate it</h3>
        <Command
          command={(m) => `${m.dlx} @animate-ui/cli@latest animate ${name}`}
        />
      </Step>
    </Steps>
  );
}
