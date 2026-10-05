'use client';

import React from 'react';

import {
  ScrollingNumberContainer,
  ScrollingNumber,
  ScrollingNumberHighlight,
  ScrollingNumberItems,
  type ScrollingNumberDirection,
} from '@/registry/primitives/texts/scrolling-number';

interface ScrollingNumberDemoProps {
  direction: ScrollingNumberDirection;
  delay: number;
}

export const ScrollingNumberDemo = ({
  direction = 'btt',
  delay = 1000,
}: ScrollingNumberDemoProps) => {
  const isVertical = direction === 'btt' || direction === 'ttb';

  return (
    <ScrollingNumberContainer
      key={direction}
      number={1000}
      step={100}
      className={isVertical ? 'w-18' : 'h-10'}
      itemsSize={isVertical ? 40 : 75}
      direction={direction}
    >
      <ScrollingNumber delay={delay}>
        <ScrollingNumberItems className="flex items-center justify-center" />
      </ScrollingNumber>
      <ScrollingNumberHighlight className="bg-accent size-full" />
    </ScrollingNumberContainer>
  );
};
