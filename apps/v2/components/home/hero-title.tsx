'use client';

import {
  RotatingText,
  RotatingTextContainer,
} from '@animate-ui/react/primitives/texts/rotating';
import { SplittingText } from '@animate-ui/react/primitives/texts/splitting';
import { ease } from '@animate-ui/react/utils/motion';

const LIBRARIES = ['shadcn/ui', 'Radix UI', 'Base UI', 'React Aria'];

const WORD_IN = {
  initial: { opacity: 0, y: 24, filter: 'blur(12px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.7, ease: ease.out },
  stagger: 0.07,
};

function Line({
  text,
  done,
  delay,
}: {
  text: string;
  done: boolean;
  delay: number;
}) {
  if (!done) return <span className="invisible">{text}</span>;
  return (
    <SplittingText
      type="words"
      text={text}
      delay={delay}
      className="inline"
      {...WORD_IN}
    />
  );
}

function Library({ done }: { done: boolean }) {
  if (!done) return <span className="invisible">{LIBRARIES[0]}</span>;
  return (
    <RotatingTextContainer
      text={LIBRARIES}
      duration={2600}
      delay={900}
      align="start"
      style={{ display: 'inline-block', overflow: 'clip' }}
    >
      <RotatingText className="text-neutral-500 dark:text-neutral-400" />
    </RotatingTextContainer>
  );
}

export function HeroTitle({ done }: { done: boolean }) {
  return (
    <h1 className="flex max-w-[860px] flex-col items-center text-4xl font-medium md:text-6xl">
      <span className="text-center">
        <Line text="Animate your" done={done} delay={0} />{' '}
        <Library done={done} />
      </span>
      <Line text="components in one command" done={done} delay={300} />
    </h1>
  );
}
