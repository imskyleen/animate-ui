'use client';

import * as React from 'react';
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  type Key,
} from '@animate-ui/react/primitives/react-aria';

export default function ReactAriaSelectFixture() {
  const [value, setValue] = React.useState<Key | null>('banana');
  const [open, setOpen] = React.useState(false);

  return (
    <section data-testid="controlled" className="flex items-center gap-4">
      <p data-testid="controlled-value">{String(value)}</p>
      <p data-testid="controlled-open">{open ? 'open' : 'closed'}</p>
      <Select
        value={value}
        onChange={setValue}
        isOpen={open}
        onOpenChange={setOpen}
      >
        <Label>Fruit</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover
          data-testid="controlled-popover"
          className="bg-white"
          exitTransition={{ duration: 0 }}
        >
          <ListBox>
            <ListBoxItem id="apple">Apple</ListBoxItem>
            <ListBoxItem id="banana">Banana</ListBoxItem>
            <ListBoxItem id="cherry">Cherry</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
      <button type="button" onClick={() => setOpen(true)}>
        Open from outside
      </button>
    </section>
  );
}
