'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ShrinkProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -0.5,
        x: -0.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 0.5,
        x: -0.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -0.5,
        x: 0.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 0.5,
        x: 0.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -1, 0],
        x: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, 0],
        x: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -1, 0],
        x: [0, 1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 1, 0],
        x: [0, 1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ShrinkProps) {
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
        d="M14.6074 14.6144L20.9922 20.9978M14.2224 17.9944C14.2119 17.2445 13.6966 14.761 14.2231 14.2344C14.7497 13.708 17.2324 14.2245 17.9821 14.2352"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.76223 17.9943C9.77273 17.2444 10.288 14.7608 9.76144 14.2343C9.2349 13.7079 6.75219 14.2244 6.00248 14.2351M9.37721 14.6143L2.99243 20.9977"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.2307 5.99568C14.2191 6.74557 13.6996 9.22828 14.2253 9.75561C14.751 10.2829 17.2345 9.77066 17.9842 9.76109M14.6147 9.36718L20.9899 3.0022"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.75359 5.99568C9.76527 6.74557 10.2847 9.22828 9.75907 9.75561C9.23335 10.2829 6.74982 9.77066 6.00008 9.76109M9.36958 9.36718L2.99438 3.0022"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Shrink(props: ShrinkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Shrink,
  Shrink as ShrinkIcon,
  type ShrinkProps,
  type ShrinkProps as ShrinkIconProps,
};
