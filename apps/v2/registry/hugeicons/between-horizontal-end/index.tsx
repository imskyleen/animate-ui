'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type BetweenHorizontalEndProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    topRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    bottomRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrowStart: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    topRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    bottomRect: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrowStart: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: BetweenHorizontalEndProps) {
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
      <motion.g
        variants={variants.topRect}
        initial="initial"
        animate={controls}
      >
        <path
          d="M15 10H9C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4H15C15.9319 4 16.3978 4 16.7654 4.15224C17.2554 4.35523 17.6448 4.74458 17.8478 5.23463C18 5.60218 18 6.06812 18 7C18 7.93188 18 8.39782 17.8478 8.76537C17.6448 9.25542 17.2554 9.64477 16.7654 9.84776C16.3978 10 15.9319 10 15 10Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
      <motion.path
        d="M2.00001 14C2.00001 14 4 12.527 4 12C4 11.4729 2 10 2 10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arrowStart}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 14C22 14 20 12.527 20 12C20 11.4729 22 10 22 10"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arrow}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15 20H9C8.06812 20 7.60218 20 7.23463 19.8478C6.74458 19.6448 6.35523 19.2554 6.15224 18.7654C6 18.3978 6 17.9319 6 17C6 16.0681 6 15.6022 6.15224 15.2346C6.35523 14.7446 6.74458 14.3552 7.23463 14.1522C7.60218 14 8.06812 14 9 14H15C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.bottomRect}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function BetweenHorizontalEnd(props: BetweenHorizontalEndProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  BetweenHorizontalEnd,
  BetweenHorizontalEnd as BetweenHorizontalEndIcon,
  type BetweenHorizontalEndProps,
  type BetweenHorizontalEndProps as BetweenHorizontalEndIconProps,
};
