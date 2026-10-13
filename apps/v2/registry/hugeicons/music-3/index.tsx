'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Music3Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -1.5, 0, -0.6, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Music3Props) {
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
        <circle cx={18} cy={16} r={3} />
        <circle cx={6} cy={18} r={3} />
        <path
          d="M9 18V9.92707C9 7.74065 9 6.64744 9.6 5.84015C10.2 5.03285 11.24 4.72675 13.32 4.11456C16.84 3.07853 18.6 2.56052 19.8 3.46872C21 4.37693 21 6.22697 21 9.92707V16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

function Music3(props: Music3Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Music3,
  Music3 as Music3Icon,
  type Music3Props,
  type Music3Props as Music3IconProps,
};
