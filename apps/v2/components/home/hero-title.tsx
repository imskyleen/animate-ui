'use client';

import {
  RotatingText,
  RotatingTextContainer,
} from '@animate-ui/react/primitives/texts/rotating';
import { SplittingText } from '@animate-ui/react/primitives/texts/splitting';
import { ease } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';

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

function useOwnLine(ref: React.RefObject<HTMLElement | null>, done: boolean) {
  const [ownLine, setOwnLine] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    const line = element?.parentElement;
    if (!element || !line) return;
    const measure = () => {
      const first = line.firstElementChild as HTMLElement | null;
      if (!first) return;
      const size = parseFloat(getComputedStyle(element).fontSize);
      setOwnLine(element.offsetTop - first.offsetTop > size * 0.5);
    };
    measure();
    void document.fonts.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(line);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, done]);
  return ownLine;
}

function Library({ done }: { done: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ownLine = useOwnLine(ref, done);
  return (
    <motion.span
      ref={ref}
      data-slot="hero-library"
      data-own-line={ownLine ? '' : undefined}
      className="inline-block"
      initial={WORD_IN.initial}
      animate={done ? WORD_IN.animate : WORD_IN.initial}
      transition={{ ...WORD_IN.transition, delay: 2 * WORD_IN.stagger }}
    >
      <RotatingTextContainer
        text={done ? LIBRARIES : LIBRARIES.slice(0, 1)}
        duration={2600}
        delay={1400}
        align={ownLine ? 'center' : 'start'}
        style={{ display: 'inline-block', overflow: 'clip' }}
      >
        <RotatingText className="text-neutral-500 dark:text-neutral-400" />
      </RotatingTextContainer>
    </motion.span>
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
