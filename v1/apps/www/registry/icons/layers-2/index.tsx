'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type Layers2Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: 4,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: -4,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 4, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -4, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Layers2Props) {
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
      <motion.path
        d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Layers2(props: Layers2Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Layers2,
  Layers2 as Layers2Icon,
  type Layers2Props,
  type Layers2Props as Layers2IconProps,
};
