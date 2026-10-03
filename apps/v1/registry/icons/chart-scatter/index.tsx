'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@/registry/icons/icon';

type ChartScatterProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {};

    for (let i = 1; i <= 5; i++) {
      animation[`circle${i}`] = {
        initial: { opacity: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            ease: 'easeInOut',
            duration: 0.3,
            delay: (i - 1) * 0.3,
          },
        },
      };
    }

    return animation as Record<string, Variants>;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChartScatterProps) {
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
      <motion.circle
        cx="7.5"
        cy="7.5"
        r=".5"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="18.5"
        cy="5.5"
        r=".5"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="11.5"
        cy="11.5"
        r=".5"
        variants={variants.circle3}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="7.5"
        cy="16.5"
        r=".5"
        variants={variants.circle4}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx="17.5"
        cy="14.5"
        r=".5"
        variants={variants.circle5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3v16a2 2 0 0 0 2 2h16"
        variants={variants.path}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChartScatter(props: ChartScatterProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  ChartScatter,
  ChartScatter as ChartScatterIcon,
  type ChartScatterProps,
  type ChartScatterProps as ChartScatterIconProps,
};
