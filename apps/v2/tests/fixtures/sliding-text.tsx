'use client';

import { SlidingText } from '@animate-ui/react/primitives/texts/sliding';

export default function SlidingTextFixture() {
  return (
    <div className="flex flex-col gap-8 text-2xl">
      <p data-testid="sentence">
        <span data-testid="before">Read</span>{' '}
        <SlidingText data-testid="inline" text="the docs" /> today
      </p>
      <SlidingText data-testid="up" direction="up" text="Upward" />
      <SlidingText data-testid="click" trigger="click" text="Click me" />
      <SlidingText
        data-testid="wrapped"
        className="w-40"
        text="A label that wraps on two lines"
      />
    </div>
  );
}
