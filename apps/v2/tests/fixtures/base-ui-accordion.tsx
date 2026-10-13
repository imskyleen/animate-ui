'use client';

import * as React from 'react';
import { Accordion } from '@animate-ui/react/primitives/base-ui/accordion';

export default function BaseAccordionFixture() {
  const [value, setValue] = React.useState<string[]>(['a']);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p data-testid="controlled-value">{value.join(',') || 'none'}</p>
        <Accordion.Root value={value} onValueChange={setValue}>
          {['a', 'b'].map((item) => (
            <Accordion.Item key={item} value={item}>
              <Accordion.Header>
                <Accordion.Trigger>Controlled {item}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel>Controlled content {item}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section>
        <Accordion.Root multiple defaultValue={['x']}>
          {['x', 'y'].map((item) => (
            <Accordion.Item key={item} value={item}>
              <Accordion.Header>
                <Accordion.Trigger>Multiple {item}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel>Multiple content {item}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section>
        <Accordion.Root>
          {['1', '2'].map((item) => (
            <Accordion.Item key={item}>
              <Accordion.Header>
                <Accordion.Trigger>Unnamed {item}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel>Unnamed content {item}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section>
        <Accordion.Root keepMounted defaultValue={['k']}>
          <Accordion.Item value="k">
            <Accordion.Header>
              <Accordion.Trigger>Kept mounted</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel data-testid="kept">
              <button type="button">Kept button</button>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </section>

      <section>
        <Accordion.Root hiddenUntilFound>
          <Accordion.Item value="f">
            <Accordion.Header>
              <Accordion.Trigger>Until found</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel data-testid="until-found">
              Findable content
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion.Root>
      </section>
    </div>
  );
}
