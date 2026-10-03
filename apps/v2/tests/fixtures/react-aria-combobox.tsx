'use client';

import * as React from 'react';
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Tag,
  TagGroup,
  TagList,
  type Key,
} from '@animate-ui/react/primitives/react-aria';

const FRUITS = [
  { id: 'apple', name: 'Apple' },
  { id: 'banana', name: 'Banana' },
  { id: 'cherry', name: 'Cherry' },
];

// API compatibility: the primitives must behave exactly like React Aria's.
export default function ReactAriaComboboxFixture() {
  const [tags, setTags] = React.useState([{ id: 'apple', name: 'Apple' }]);
  const [value, setValue] = React.useState<Key | null>('banana');
  const [open, setOpen] = React.useState('closed');
  const [refTag, setRefTag] = React.useState('none');

  return (
    <div className="flex flex-col items-start gap-10">
      <section data-testid="tags" className="flex items-center gap-4">
        <TagGroup
          aria-label="Fruits"
          onRemove={(keys) =>
            setTags((list) => list.filter((tag) => !keys.has(tag.id)))
          }
        >
          <TagList items={tags} className="flex gap-2">
            {(tag) => (
              <Tag
                id={tag.id}
                textValue={tag.name}
                data-testid={`tag-${tag.id}`}
                className={({ isFocusVisible }) =>
                  isFocusVisible ? 'tag focused' : 'tag'
                }
                ref={(element: HTMLDivElement | null) => {
                  if (element && tag.id === 'apple')
                    setRefTag(element.tagName.toLowerCase());
                }}
              >
                {tag.name}
                <Button slot="remove" aria-label={`Remove ${tag.name}`}>
                  ×
                </Button>
              </Tag>
            )}
          </TagList>
        </TagGroup>
        <p data-testid="ref-tag">{refTag}</p>
        <button
          type="button"
          onClick={() =>
            setTags((list) => [...list, { id: 'cherry', name: 'Cherry' }])
          }
        >
          Add cherry
        </button>
        <TagGroup aria-label="Instant">
          <TagList items={tags} className="flex gap-2">
            {(tag) => (
              <Tag
                id={tag.id}
                textValue={tag.name}
                data-testid={`instant-${tag.id}`}
                transition={{ duration: 0 }}
              >
                {tag.name}
              </Tag>
            )}
          </TagList>
        </TagGroup>
      </section>

      <section data-testid="combobox" className="flex items-center gap-4">
        <p data-testid="combobox-value">{String(value)}</p>
        <p data-testid="combobox-open">{open}</p>
        <ComboBox
          defaultItems={FRUITS}
          value={value}
          onChange={setValue}
          onOpenChange={(isOpen) => setOpen(isOpen ? 'open' : 'closed')}
        >
          <Label>Fruit</Label>
          <Input />
          <Button aria-label="Show fruits">▾</Button>
          <Popover data-testid="combobox-popover" className="bg-white">
            <ListBox>
              {(item: (typeof FRUITS)[number]) => (
                <ListBoxItem id={item.id}>{item.name}</ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </ComboBox>
      </section>
    </div>
  );
}
