'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type ClapperboardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group1: {
      initial: { scale: 1, y: 0, transformOrigin: 'bottom center' },
      animate: {
        scale: [1, 0.88, 0.88, 1],
        y: [0, 0, 0.6, 0],
        transformOrigin: 'bottom center',
        transition: {
          scale: { duration: 1, ease: 'easeInOut', times: [0, 0.15, 0.8, 1] },
          y: { duration: 1, ease: 'easeOut', times: [0, 0.55, 0.6, 0.75] },
        },
      },
    },
    group2: {
      initial: { rotate: 0, transformOrigin: 'bottom left' },
      animate: {
        rotate: [0, 0, -13, -13, 0, -2, 0],
        transformOrigin: 'bottom left',
        transition: {
          duration: 1,
          ease: 'easeInOut',
          times: [0, 0.1, 0.35, 0.45, 0.55, 0.65, 0.75],
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ClapperboardProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.g variants={variants.group1} initial="initial" animate={controls}>
        <path
          d="M21.4815 8C21.5 8.72706 21.5 9.55423 21.5 10.5V13.5C21.5 17.2712 21.5 19.1569 20.3284 20.3284C19.1569 21.5 17.2712 21.5 13.5 21.5H10.5C6.72876 21.5 4.84315 21.5 3.67157 20.3284C2.5 19.1569 2.5 17.2712 2.5 13.5V10.5C2.5 9.55423 2.5 8.72706 2.51848 8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 8H22" />
        <path d="M6.5 17.5H10.5" strokeLinecap="round" />
        <path d="M6.5 13.5L15.5 13.5" strokeLinecap="round" />
        <motion.g
          variants={variants.group2}
          initial="initial"
          animate={controls}
        >
          <path
            d="M2.51848 8C2.57368 5.82791 2.79381 4.54934 3.67157 3.67157C4.84315 2.5 6.72876 2.5 10.5 2.5H13.5C17.2712 2.5 19.1569 2.5 20.3284 3.67157C21.2062 4.54934 21.4263 5.82791 21.4815 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 8H22" />
          <path d="M6 8L11.5 2.5" />
          <path d="M13 8L18.5 2.5" />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

function Clapperboard(props: ClapperboardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Clapperboard,
  Clapperboard as ClapperboardIcon,
  type ClapperboardProps,
  type ClapperboardProps as ClapperboardIconProps,
};
