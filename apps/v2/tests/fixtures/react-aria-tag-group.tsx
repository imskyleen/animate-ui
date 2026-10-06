'use client';

import * as React from 'react';
import {
  Tag,
  TagGroup,
  TagList,
} from '@animate-ui/react/primitives/react-aria';

// Tags added after the list mounted pop in; removed ones go at once. Below,
// tags in a field beside an input whose placeholder shows once it's empty,
// and whose padding narrows while it holds tags (shadcn/ui's chips field);
// then the same with a placeholder shown all along.
export default function ReactAriaTagGroupFixture() {
  const [tags, setTags] = React.useState(['Astro', 'Next.js']);
  const [picked, setPicked] = React.useState(['Remix', 'Gatsby']);
  const [searched, setSearched] = React.useState(['Solid', 'Qwik']);

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
      <button
        type="button"
        className="self-start"
        onClick={() => setPicked((t) => t.slice(1))}
      >
        Remove picked
      </button>
      <div
        data-testid="field"
        className="flex w-72 flex-wrap items-center gap-1 rounded-lg border px-2.5 py-1 has-data-[slot=picked]:px-1"
      >
        <TagGroup aria-label="Picked" className="contents">
          <TagList className="contents">
            {picked.map((tag) => (
              <Tag
                key={tag}
                id={tag}
                textValue={tag}
                data-slot="picked"
                className="rounded-sm border px-1.5 text-xs"
              >
                {tag}
              </Tag>
            ))}
          </TagList>
        </TagGroup>
        <input
          data-testid="field-input"
          aria-label="Add frameworks"
          placeholder={picked.length > 0 ? '' : 'Add frameworks…'}
          className="min-w-16 flex-1 outline-none"
        />
      </div>
      <button
        type="button"
        className="self-start"
        onClick={() => setSearched((t) => t.slice(1))}
      >
        Remove searched
      </button>
      <div
        data-testid="search-field"
        className="flex w-72 flex-wrap items-center gap-1 rounded-lg border px-2.5 py-1 has-data-[slot=searched]:px-1"
      >
        <TagGroup aria-label="Searched" className="contents">
          <TagList className="contents">
            {searched.map((tag) => (
              <Tag
                key={tag}
                id={tag}
                textValue={tag}
                data-slot="searched"
                className="rounded-sm border px-1.5 text-xs"
              >
                {tag}
              </Tag>
            ))}
          </TagList>
        </TagGroup>
        <input
          data-testid="search-input"
          aria-label="Search frameworks"
          placeholder="Search frameworks…"
          className="min-w-16 flex-1 outline-none"
        />
      </div>
    </div>
  );
}
