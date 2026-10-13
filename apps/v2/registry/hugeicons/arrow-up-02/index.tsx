'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ArrowUp02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: -2, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {},
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    path1: {
      initial: {
        d: 'M12 5.5V19',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M12 9V19',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { y: 0 },
      animate: {
        y: 3.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    path1: {
      initial: { d: 'M12 5.5V19' },
      animate: {
        d: ['M12 5.5V19', 'M12 9V19', 'M12 5.5V19'],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { y: 0 },
      animate: {
        y: [0, 3.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  out: {
    path1: {},
    path2: {},
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, '-150%', '150%', 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ArrowUp02Props) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M12 5.5V19"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M18 11C18 11 13.5811 5.00001 12 5C10.4188 4.99999 6 11 6 11"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowUp02(props: ArrowUp02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ArrowUp02,
  ArrowUp02 as ArrowUp02Icon,
  type ArrowUp02Props,
  type ArrowUp02Props as ArrowUp02IconProps,
};
