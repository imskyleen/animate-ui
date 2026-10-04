'use client';

import * as React from 'react';
import {
  motion,
  type Variants,
  type TargetAndTransition,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/registry/hooks/use-is-in-view';

type DefaultSplittingTextProps = Omit<
  HTMLMotionProps<'div'>,
  'children' | 'initial' | 'animate' | 'transition'
> & {
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
  stagger?: number;
  delay?: number;
  disableAnimation?: boolean;
} & UseIsInViewOptions;

type CharsOrWordsSplittingTextProps = DefaultSplittingTextProps & {
  type?: 'chars' | 'words';
  text: string;
};

type LinesSplittingTextProps = DefaultSplittingTextProps & {
  type?: 'lines';
  text: string[];
};

type SplittingTextProps =
  | CharsOrWordsSplittingTextProps
  | LinesSplittingTextProps;

const SplittingText: React.FC<SplittingTextProps> = ({
  ref,
  text,
  type = 'chars',
  initial = { x: 150, opacity: 0 },
  animate = { x: 0, opacity: 1 },
  transition = { duration: 0.7, ease: 'easeOut' },
  stagger,
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  disableAnimation = false,
  ...props
}) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay / 1000,
        staggerChildren:
          stagger ?? (type === 'chars' ? 0.05 : type === 'words' ? 0.2 : 0.3),
      },
    },
  };

  const itemVariants: Variants = {
    hidden: disableAnimation ? animate : initial,
    visible: {
      ...animate,
      transition: disableAnimation ? { duration: 0 } : transition,
    },
  };

  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
    },
  );

  if (Array.isArray(text)) {
    return (
      <motion.span
        ref={localRef}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        {...props}
      >
        {text.map((line, i) => (
          <React.Fragment key={`line-${i}`}>
            <motion.span
              variants={itemVariants}
              style={{ display: 'inline-block' }}
            >
              {line}
            </motion.span>
            {i < text.length - 1 ? <br /> : null}
          </React.Fragment>
        ))}
      </motion.span>
    );
  }

  if (type === 'words') {
    const tokens = (text as string).match(/\S+\s*/g) || [];
    return (
      <motion.span
        ref={localRef}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        {...props}
      >
        {tokens.map((token, i) => (
          <React.Fragment key={i}>
            <motion.span
              variants={itemVariants}
              style={{ display: 'inline-block', whiteSpace: 'normal' }}
            >
              {token.trim()}
            </motion.span>
            {/\s$/.test(token) ? ' ' : null}
          </React.Fragment>
        ))}
      </motion.span>
    );
  }

  const tokens = (text as string).split(/(\s+)/);
  const perChar = stagger ?? 0.05;
  const baseDelaySec = (delay ?? 0) / 1000;

  let globalIndex = 0;

  return (
    <motion.span
      ref={localRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: {} },
      }}
      {...props}
    >
      {tokens.map((tok, wi) => {
        if (/^\s+$/.test(tok)) {
          return <span key={`space-${wi}`}>{tok}</span>;
        }
        const chars = Array.from(tok);
        const wordDelay = baseDelaySec + perChar * globalIndex;
        globalIndex += chars.length;

        return (
          <motion.span
            key={`word-${wi}`}
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
            variants={{}}
            transition={{ delayChildren: wordDelay, staggerChildren: perChar }}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {chars.map((ch, ci) => (
              <motion.span
                key={`ch-${wi}-${ci}`}
                variants={itemVariants}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        );
      })}
    </motion.span>
  );
};

export { SplittingText, type SplittingTextProps };
