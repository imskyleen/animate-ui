'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Moon02Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: { rotate: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
      animate: {
        rotate: [0, -30, 400, 360],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.75, 1],
          ease: ['easeInOut', 'easeInOut', 'easeInOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  balancing: {
    path: {
      initial: { rotate: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
      animate: {
        rotate: [0, -30, 25, -15, 10, -5, 0],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Moon02Props) {
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
        d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.7491 15.0821 8.91792 11.2509 8.91792 6.52485C8.91792 5.06986 9.28105 3.69968 9.92163 2.5C5.66765 3.49698 2.5 7.31513 2.5 11.8731C2.5 17.1899 6.8101 21.5 12.1269 21.5C16.6849 21.5 20.503 18.3324 21.5 14.0784Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Moon02(props: Moon02Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Moon02,
  Moon02 as Moon02Icon,
  type Moon02Props,
  type Moon02Props as Moon02IconProps,
};
