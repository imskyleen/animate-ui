'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ArrowDownProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: '25%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, '25%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group: {},
    path1: {
      initial: {
        d: 'M12 5v14',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M12 5v10',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: 'm19 12-7 7-7-7',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'm19 8.5-7 7-7-7',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group: {},
    path1: {
      initial: {
        d: 'M12 5v14',
      },
      animate: {
        d: ['M12 5v14', 'M12 5v10', 'M12 5v14'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: 'm19 12-7 7-7-7',
      },
      animate: {
        d: ['m19 12-7 7-7-7', 'm19 8.5-7 7-7-7', 'm19 12-7 7-7-7'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group: {
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

function IconComponent({ size, ...props }: ArrowDownProps) {
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
      {...props}
    >
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M12 5v14"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m19 12-7 7-7-7"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function ArrowDown(props: ArrowDownProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ArrowDown,
  ArrowDown as ArrowDownIcon,
  type ArrowDownProps,
  type ArrowDownProps as ArrowDownIconProps,
};
