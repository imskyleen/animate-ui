'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ExternalLinkProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 2,
        y: -2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 2, 0],
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ExternalLinkProps) {
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
          d="M15 3h6v6"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M10 14 21 3"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
      <motion.path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ExternalLink(props: ExternalLinkProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ExternalLink,
  ExternalLink as ExternalLinkIcon,
  type ExternalLinkProps,
  type ExternalLinkProps as ExternalLinkIconProps,
};
