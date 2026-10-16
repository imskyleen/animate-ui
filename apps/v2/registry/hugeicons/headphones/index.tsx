'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type HeadphonesProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    cup1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.06, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    cup2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.06, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.12 },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 0%' },
      animate: {
        rotate: [0, -5, 5, -3, 0],
        transformOrigin: '50% 0%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: HeadphonesProps) {
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
        <path
          d="M20.0849 17C20.5849 15.5 21 13.4368 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4368 3.41512 15.5 3.91512 17"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M8.97651 19.6043L7.23857 14.6127C7.05341 14.1466 6.4617 13.9131 5.97493 14.0297C4.46441 14.5333 3.6462 16.1718 4.14742 17.6895L4.58543 19.0158C5.08664 20.5334 6.71747 21.3555 8.22799 20.8519C8.68896 20.6556 9.10449 20.0897 8.97651 19.6043Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.cup1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M15.0235 19.6043L16.7614 14.6127C16.9466 14.1466 17.5383 13.9131 18.0251 14.0297C19.5356 14.5333 20.3538 16.1718 19.8526 17.6895L19.4146 19.0158C18.9134 20.5334 17.2825 21.3555 15.772 20.8519C15.311 20.6556 14.8955 20.0897 15.0235 19.6043Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.cup2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Headphones(props: HeadphonesProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Headphones,
  Headphones as HeadphonesIcon,
  type HeadphonesProps,
  type HeadphonesProps as HeadphonesIconProps,
};
