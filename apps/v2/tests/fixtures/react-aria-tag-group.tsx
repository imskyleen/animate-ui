'use client';

import * as React from 'react';
import {
  Tag,
  TagGroup,
  TagList,
} from '@animate-ui/react/primitives/react-aria';

// Tags added after the list mounted pop in; removed ones go at once.
export default function ReactAriaTagGroupFixture() {
  const [tags, setTags] = React.useState(['Astro', 'Next.js']);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTags((t) => [...t, 'Nuxt'])}>
          Add Nuxt
        </button>
        <button type="button" onClick={() => setTags((t) => t.slice(1))}>
          Remove first
        </button>
      </div>
      <TagGroup aria-label="Frameworks">
        <TagList className="flex gap-2">
          {tags.map((tag) => (
            <Tag
              key={tag}
              id={tag}
              textValue={tag}
              data-testid={`tag-${tag}`}
              className="rounded-md border px-2 py-0.5"
            >
              {tag}
            </Tag>
          ))}
        </TagList>
      </TagGroup>
    </div>
  );
}
