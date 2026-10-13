'use client';

import { DynamicCodeBlock } from './dynamic-codeblock';
import {
  MANAGER_GROUP,
  MANAGER_NAMES,
  MANAGERS,
  type ManagerCommands,
} from './package-managers';
import { CodeTabs } from './tabs';

export function ClientCommand({
  command,
  className,
}: {
  command: (manager: ManagerCommands) => string;
  className?: string;
}) {
  return (
    <CodeTabs
      className={className}
      groupId={MANAGER_GROUP}
      persist
      tabs={MANAGER_NAMES.map((manager) => ({
        value: manager,
        label: manager,
        content: (
          <DynamicCodeBlock
            lang="bash"
            codeblock={{ className: 'my-0' }}
            code={command(MANAGERS[manager])}
          />
        ),
      }))}
    />
  );
}
