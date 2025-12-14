'use client';
import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';
type KeyProps = IconProps<keyof typeof animations>;
const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        originX: '12px',
        originY: '12px',
      },
      animate: {
        rotate: [0, -20, 0],
        scale: [1, 0.95, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    stem: {},
    teeth: {},
    circle: {},
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        originX: '12px',
        originY: '12px',
      },
      animate: {
        rotate: [0, -10, 10, -10, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
        },
      },
    },
    stem: {},
    teeth: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
function IconComponent({ size, ...props }: KeyProps) {
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
          d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"
          variants={variants.stem}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="m21 2-9.6 9.6"
          variants={variants.teeth}
          initial="initial"
          animate={controls}
        />
        <motion.circle
          cx="7.5"
          cy="15.5"
          r="5.5"
          variants={variants.circle}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}
function Key(props: KeyProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}
export {
  animations,
  Key,
  Key as KeyIcon,
  type KeyProps,
  type KeyProps as KeyIconProps,
};
