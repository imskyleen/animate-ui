'use client';

import * as React from 'react';
import {
  Button,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
  Heading,
  type Key,
} from '@animate-ui/react/primitives/react-aria';

// API compatibility: the panel must behave exactly like React Aria's.
export default function ReactAriaDisclosureFixture() {
  const [expanded, setExpanded] = React.useState(true);
  const [keys, setKeys] = React.useState<Set<Key>>(() => new Set(['a']));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p data-testid="controlled-expanded">{String(expanded)}</p>
        <Disclosure isExpanded={expanded} onExpandedChange={setExpanded}>
          <Heading>
            <Button slot="trigger">Controlled</Button>
          </Heading>
          <DisclosurePanel data-testid="controlled-panel">
            <button type="button">Controlled button</button>
          </DisclosurePanel>
        </Disclosure>
      </section>

      <section>
        <p data-testid="group-keys">{[...keys].join(',') || 'none'}</p>
        <DisclosureGroup
          expandedKeys={keys}
          onExpandedChange={(next) => setKeys(new Set(next))}
        >
          {['a', 'b'].map((item) => (
            <Disclosure key={item} id={item}>
              <Heading>
                <Button slot="trigger">Group {item}</Button>
              </Heading>
              <DisclosurePanel>Group content {item}</DisclosurePanel>
            </Disclosure>
          ))}
        </DisclosureGroup>
      </section>

      <section>
        <Disclosure>
          <Heading>
            <Button slot="trigger">Render props</Button>
          </Heading>
          <DisclosurePanel
            data-testid="render-props"
            className={({ isFocusVisibleWithin }) =>
              isFocusVisibleWithin ? 'focus-within' : 'panel-class'
            }
            style={() => ({ color: 'rgb(255, 0, 0)' })}
          >
            Render props content
          </DisclosurePanel>
        </Disclosure>
      </section>
    </div>
  );
}
