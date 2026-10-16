'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type CherryProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cherry1: {
      initial: { rotate: 0, transformOrigin: '12px 2px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '12px 2px',
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    cherry2: {
      initial: { rotate: 0, transformOrigin: '12px 2px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '12px 2px',
        transition: { duration: 1, ease: 'easeInOut', delay: 0.06 },
      },
    },
  } satisfies Record<string, Variants>,
  swing: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -12, 7, -4, 0],
        transformOrigin: 'top center',
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CherryProps) {
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
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g
        variants={variants.cherry1}
        initial="initial"
        animate={controls}
        style={{ transformBox: 'view-box' }}
      >
        <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
        <path d="M7 14c3.22-2.91 4.29-8.75 5-12" />
      </motion.g>
      <motion.g
        variants={variants.cherry2}
        initial="initial"
        animate={controls}
        style={{ transformBox: 'view-box' }}
      >
        <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z" />
        <path d="M12 2c1.66 2.38 4.94 9 5 12" />
      </motion.g>
      <path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z" />
    </motion.svg>
  );
}

function Cherry(props: CherryProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cherry,
  Cherry as CherryIcon,
  type CherryProps,
  type CherryProps as CherryIconProps,
};
