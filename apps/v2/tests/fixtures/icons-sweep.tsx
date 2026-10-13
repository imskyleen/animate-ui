'use client';

import * as React from 'react';
import type { IconProps } from '@animate-ui/react/icons';

import { ICONS, iconComponent } from '@/registry/icons';

type Entry = {
  name: string;
  Icon: React.ComponentType<IconProps<string>>;
  animations: string[];
};

export default function IconsSweepFixture() {
  const [entries, setEntries] = React.useState<Entry[] | null>(null);
  const [play, setPlay] = React.useState(false);

  React.useEffect(() => {
    void Promise.all(
      ICONS.map(async (entry) => {
        const mod = await entry.load();
        return {
          name: entry.name,
          Icon: iconComponent(mod, entry.name)!,
          animations: Object.keys(mod.animations),
        };
      }),
    ).then(setEntries);
  }, []);

  return (
    <div>
      <button type="button" onClick={() => setPlay((p) => !p)}>
        Play
      </button>
      {entries && (
        <div data-testid="ready" className="flex flex-wrap gap-2">
          {entries.flatMap(({ name, Icon, animations }) =>
            animations.map((animation) => (
              <span
                key={`${name}:${animation}`}
                data-icon={`${name}:${animation}`}
                className="inline-flex"
              >
                <Icon size={32} animate={play} animation={animation} />
              </span>
            )),
          )}
        </div>
      )}
    </div>
  );
}
