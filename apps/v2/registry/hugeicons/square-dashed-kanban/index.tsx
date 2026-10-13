'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SquareDashedKanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    line1: {
      initial: { d: 'M16 8V16' },
      animate: {
        d: ['M16 8V16', 'M16 8V12', 'M16 8V14', 'M16 8V16'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: { d: 'M12 8V12' },
      animate: {
        d: ['M12 8V12', 'M12 8V14', 'M12 8V16', 'M12 8V12'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: { d: 'M8 8V14' },
      animate: {
        d: ['M8 8V14', 'M8 8V16', 'M8 8V12', 'M8 8V14'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SquareDashedKanbanProps) {
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
        d="M9.99877 2.5C9.45899 2.50516 8.96002 2.51488 8.49784 2.53315"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.0012 2.5C14.541 2.50516 15.04 2.51488 15.5022 2.53315"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.0043 3.13088C19.43 3.32055 19.7943 3.56673 20.1138 3.88624C20.4333 4.20575 20.6794 4.56995 20.8691 4.99568"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.13088 4.99568C3.32056 4.56995 3.56673 4.20575 3.88624 3.88624C4.20575 3.56673 4.56995 3.32055 4.99568 3.13088"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.5 9.99877C21.4948 9.45899 21.4851 8.96002 21.4669 8.49784"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21.5 14.0012C21.4948 14.5409 21.4851 15.0399 21.4669 15.5021"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.8691 19.0043C20.6794 19.43 20.4333 19.7943 20.1138 20.1138C19.7943 20.4333 19.43 20.6794 19.0043 20.8691"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.5022 21.4668C15.04 21.4851 14.541 21.4948 14.0012 21.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.99877 21.5C9.45898 21.4948 8.96 21.4851 8.49781 21.4668"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path9}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4.99568 20.8691C4.56995 20.6794 4.20575 20.4333 3.88624 20.1138C3.56673 19.7943 3.32056 19.43 3.13088 19.0043"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path10}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.5 14.0012C2.50516 14.5409 2.51488 15.0399 2.53315 15.5021"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path11}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2.5 9.99884C2.50516 9.45904 2.51488 8.96004 2.53315 8.49784"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path12}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 8V16"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 8V12"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8 8V14"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SquareDashedKanban(props: SquareDashedKanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SquareDashedKanban,
  SquareDashedKanban as SquareDashedKanbanIcon,
  type SquareDashedKanbanProps,
  type SquareDashedKanbanProps as SquareDashedKanbanIconProps,
};
