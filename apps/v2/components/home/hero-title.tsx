'use client';

import { RollingText } from '@animate-ui/react/primitives/texts/rolling';
import { SplittingText } from '@animate-ui/react/primitives/texts/splitting';
import { ease } from '@animate-ui/react/utils/motion';
import { useEffect, useState } from 'react';

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
  if (!done) return <div className="invisible">{text}</div>;
  return <SplittingText type="words" text={text} delay={delay} {...WORD_IN} />;
}

function Library({ done }: { done: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!done) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % LIBRARIES.length),
      2600,
    );
    return () => clearInterval(id);
  }, [done]);

  const library = LIBRARIES[index]!;

  return (
    <div data-slot="hero-library" className="py-1">
      {done ? (
        <RollingText
          key={library}
          text={library}
          delay={index === 0 ? 250 : 0}
          className="text-neutral-500 dark:text-neutral-400"
        />
      ) : (
        <span className="invisible">{library}</span>
      )}
    </div>
  );
}

export function HeroTitle({ done }: { done: boolean }) {
  return (
    <h1 className="flex max-w-[860px] flex-col items-center text-4xl font-medium md:text-6xl">
      <Line text="Animate your" done={done} delay={0} />
      <Library done={done} />
      <Line text="components in one command" done={done} delay={300} />
    </h1>
  );
}
