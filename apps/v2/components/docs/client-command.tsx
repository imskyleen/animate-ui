'use client';

import { DynamicCodeBlock } from './dynamic-codeblock';
import {
  MANAGER_GROUP,
  MANAGER_NAMES,
  MANAGERS,
  type ManagerCommands,
} from './package-managers';
import { CodeTabs } from './tabs';

/**
 * An install command in every package manager, for client components (the
 * server `Command`'s twin): it follows the reader's saved choice.
 */
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
