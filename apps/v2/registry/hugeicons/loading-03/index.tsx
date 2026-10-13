'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Loading03Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    ray1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.875,
        },
      },
    },
    ray2: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.75,
        },
      },
    },
    ray3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.625,
        },
      },
    },
    ray4: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.5,
        },
      },
    },
    ray5: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.375,
        },
      },
    },
    ray6: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.25,
        },
      },
    },
    ray7: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: -0.125,
        },
      },
    },
    ray8: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.25],
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          delay: 0.0,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Loading03Props) {
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
        d="M12 3V6"
        strokeLinecap="round"
        variants={variants.ray1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.3635 5.63672L16.2422 7.75804"
        strokeLinecap="round"
        variants={variants.ray2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 12L18 12"
        strokeLinecap="round"
        variants={variants.ray3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.3635 18.3635L16.2422 16.2422"
        strokeLinecap="round"
        variants={variants.ray4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 18V21"
        strokeLinecap="round"
        variants={variants.ray5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.75804 16.2422L5.63672 18.3635"
        strokeLinecap="round"
        variants={variants.ray6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6 12L3 12"
        strokeLinecap="round"
        variants={variants.ray7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7.75804 7.75804L5.63672 5.63672"
        strokeLinecap="round"
        variants={variants.ray8}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Loading03(props: Loading03Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Loading03,
  Loading03 as Loading03Icon,
  type Loading03Props,
  type Loading03Props as Loading03IconProps,
};
