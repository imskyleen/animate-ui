'use client';

import * as React from 'react';
import { Accordion } from '@animate-ui/react/primitives/radix-ui/accordion';
import * as AccordionStar from '@animate-ui/react/primitives/radix-ui/accordion';

export default function RadixAccordionFixture() {
  const [value, setValue] = React.useState('a');

  return (
    <div className="flex flex-col gap-10">
      <section data-testid="controlled">
        <p data-testid="controlled-value">{value || 'none'}</p>
        <Accordion.Root
          type="single"
          collapsible
          value={value}
          onValueChange={setValue}
        >
          {['a', 'b'].map((item) => (
            <Accordion.Item key={item} value={item}>
              <Accordion.Header>
                <Accordion.Trigger>Controlled {item}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>Controlled content {item}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>

      <section data-testid="multiple">
        <AccordionStar.Root type="multiple" defaultValue={['x']}>
          {['x', 'y'].map((item) => (
            <AccordionStar.Item key={item} value={item}>
              <AccordionStar.Header>
                <AccordionStar.Trigger>Multiple {item}</AccordionStar.Trigger>
              </AccordionStar.Header>
              <AccordionStar.Content>
                Multiple content {item}
              </AccordionStar.Content>
            </AccordionStar.Item>
          ))}
        </AccordionStar.Root>
      </section>

      <section data-testid="force-mount">
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="f">
            <Accordion.Header>
              <Accordion.Trigger>Force mounted</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content forceMount>
              <button type="button">Hidden button</button>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </section>
    </div>
  );
}
