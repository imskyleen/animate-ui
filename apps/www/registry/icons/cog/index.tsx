'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type CogProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180],
        transition: {
          duration: 1.25,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 90, 180, 270, 360],
        transition: {
          duration: 2.5,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
          ease: 'linear',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    path5: {},
    path6: {},
    path7: {},
    path8: {},
    path9: {},
    path10: {},
    path11: {},
    path12: {},
    path13: {},
    path14: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CogProps) {
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
          d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 2v2"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 22v-2"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m17 20.66-1-1.73"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11 10.27 7 3.34"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m20.66 17-1.73-1"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m3.34 7 1.73 1"
          variants={variants.path8}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14 12h8"
          variants={variants.path9}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2 12h2"
          variants={variants.path10}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m20.66 7-1.73 1"
          variants={variants.path11}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m3.34 17 1.73-1"
          variants={variants.path12}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m17 3.34-1 1.73"
          variants={variants.path13}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m11 13.73-4 6.93"
          variants={variants.path14}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Cog(props: CogProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Cog,
  Cog as CogIcon,
  type CogProps,
  type CogProps as CogIconProps,
};
