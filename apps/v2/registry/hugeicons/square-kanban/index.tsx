'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SquareKanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    rect: {},
    line1: {
      initial: { d: 'M16.9922 7V17' },
      animate: {
        d: ['M16.9922 7V17', 'M16.9922 7V11', 'M16.9922 7V14', 'M16.9922 7V17'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: { d: 'M11.9922 7V11' },
      animate: {
        d: ['M11.9922 7V11', 'M11.9922 7V14', 'M11.9922 7V17', 'M11.9922 7V11'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: { d: 'M6.9922 7V14' },
      animate: {
        d: ['M6.9922 7V14', 'M6.9922 7V17', 'M6.9922 7V11', 'M6.9922 7V14'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareKanbanProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <motion.path
        d="M11.9922 21C15.7419 21 17.6168 21 18.9311 20.0451C19.3556 19.7367 19.7289 19.3634 20.0373 18.9389C20.9922 17.6246 20.9922 15.7497 20.9922 12C20.9922 8.25027 20.9922 6.3754 20.0373 5.06107C19.7289 4.6366 19.3556 4.26331 18.9311 3.95491C17.6168 3 15.7419 3 11.9922 3C8.24246 3 6.36759 3 5.05326 3.95491C4.62879 4.26331 4.2555 4.6366 3.9471 5.06107C2.99219 6.3754 2.99219 8.25027 2.99219 12C2.99219 15.7497 2.99219 17.6246 3.9471 18.9389C4.2555 19.3634 4.62879 19.7367 5.05326 20.0451C6.36759 21 8.24246 21 11.9922 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.rect}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16.9922 7V17"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9922 7V11"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.9922 7V14"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquareKanban(props: SquareKanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareKanban,
  SquareKanban as SquareKanbanIcon,
  type SquareKanbanProps,
  type SquareKanbanProps as SquareKanbanIconProps,
};
