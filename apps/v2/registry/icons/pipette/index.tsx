'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PipetteProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    pipette: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -0.8, 0, -0.8, 0],
        y: [0, 0.8, 0, 0.8, 0],
        transition: {
          duration: 0.7,
          times: [0, 0.2, 0.4, 0.6, 1],
          ease: 'easeInOut',
        },
      },
    },
    bulb: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.75, 1.04, 0.8, 1.02, 1],
        transition: {
          duration: 0.7,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PipetteProps) {
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
      <motion.g
        variants={variants.pipette}
        initial="initial"
        animate={controls}
      >
        <path d="m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12" />
        <motion.path
          d="m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"
          variants={variants.bulb}
          initial="initial"
          animate={controls}
        />
        <path d="m2 22 .414-.414" />
      </motion.g>
    </motion.svg>
  );
}

function Pipette(props: PipetteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Pipette,
  Pipette as PipetteIcon,
  type PipetteProps,
  type PipetteProps as PipetteIconProps,
};
