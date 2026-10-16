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
      initial: { rotate: 0, transformOrigin: '13.7946px 4px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '13.7946px 4px',
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    cherry2: {
      initial: { rotate: 0, transformOrigin: '13.7946px 4px' },
      animate: {
        rotate: [0, -3.5, 2.5, -1.2, 0],
        transformOrigin: '13.7946px 4px',
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
        rotate: [0, -7, 4, -2, 0],
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
        <path
          d="M10.5 11C9.62217 10.37 8.55171 10 7.39646 10C4.41608 10 2 12.4624 2 15.5C2 18.5376 4.41608 21 7.39646 21C8.08877 21 8.75062 20.8671 9.35882 20.6251"
          strokeLinecap="round"
        />
        <path
          d="M7.13408 12C6.09142 6.5 11.4006 4.5 13.7946 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.g
        variants={variants.cherry2}
        initial="initial"
        animate={controls}
        style={{ transformBox: 'view-box' }}
      >
        <path d="M22 16.5C22 19.5376 19.5376 22 16.5 22C13.4624 22 11 19.5376 11 16.5C11 13.4624 13.4624 11 16.5 11C19.5376 11 22 13.4624 22 16.5Z" />
        <path
          d="M13.7946 4C11.7291 7.13692 14.1631 11.1035 16 13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <path
        d="M16 2C14.9847 2.59904 14.2703 3.27752 13.7946 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
