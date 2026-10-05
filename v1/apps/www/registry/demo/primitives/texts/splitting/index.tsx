import {
  SplittingText,
  type SplittingTextProps,
} from '@/registry/primitives/texts/splitting';
import { cn } from '@workspace/ui/lib/utils';

const ANIMATIONS: Record<
  string,
  {
    initial: SplittingTextProps['initial'];
    animate: SplittingTextProps['animate'];
    transition: SplittingTextProps['transition'];
  } | null
> = {
  default: null,
  vibe: {
    initial: { y: 50, scale: 0.5, opacity: 0, x: 50, rotate: 90 },
    animate: { y: 0, scale: 1, opacity: 1, x: 0, rotate: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  writing: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', bounce: 0, duration: 2 },
  },
};

interface SplittingTextDemoProps {
  type: SplittingTextProps['type'];
  delay: number;
  animation: keyof typeof ANIMATIONS;
}

export const SplittingTextDemo = ({
  type,
  delay,
  animation,
}: SplittingTextDemoProps) => {
  return (
    // @ts-expect-error
    <SplittingText
      key={`${type}-${delay}-${animation}`}
      className={cn('text-4xl font-semibold', type === 'lines' && 'text-xl')}
      type={type}
      delay={delay}
      initial={ANIMATIONS[animation]?.initial}
      animate={ANIMATIONS[animation]?.animate}
      transition={ANIMATIONS[animation]?.transition}
      text={
        type === 'lines'
          ? [
              'Introducing Splitting Text component',
              'Made with Motion. Highly customizable and easy to use.',
            ]
          : 'Splitting Text'
      }
    />
  );
};
