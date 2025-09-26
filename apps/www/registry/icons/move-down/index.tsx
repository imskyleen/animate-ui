'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type MoveDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: '15%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, '15%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M12 2V22',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M12 2V12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: 'M8 18L12 22L16 18',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M8 8L12 12L16 8',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M12 2V22',
      },
      animate: {
        d: ['M12 2V22', 'M12 2V12', 'M12 2V22'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: 'M8 18L12 22L16 18',
      },
      animate: {
        d: ['M8 18L12 22L16 18', 'M8 8L12 12L16 8', 'M8 18L12 22L16 18'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, '150%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MoveDownProps) {
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
      variants={variants.group1}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group2} initial="initial" animate={controls}>
        <motion.path
          d="M12 2V22"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 18L12 22L16 18"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MoveDown(props: MoveDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MoveDown,
  MoveDown as MoveDownIcon,
  type MoveDownProps,
  type MoveDownProps as MoveDownIconProps,
};
