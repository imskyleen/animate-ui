'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

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
      {...props}
    >
      <motion.path
        d="M8 8.5C8 8.77614 7.77614 9 7.5 9C7.22386 9 7 8.77614 7 8.5C7 8.22386 7.22386 8 7.5 8C7.77614 8 8 8.22386 8 8.5ZM7.75 8.5H7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M14.75 4.5H14.5M15 4.5C15 4.77614 14.7761 5 14.5 5C14.2239 5 14 4.77614 14 4.5C14 4.22386 14.2239 4 14.5 4C14.7761 4 15 4.22386 15 4.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.5 10.5L12.75 10.5M13 10.5C13 10.7761 12.7761 11 12.5 11C12.2239 11 12 10.7761 12 10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.75 16.5H9.5M10 16.5C10 16.7761 9.77614 17 9.5 17C9.22386 17 9 16.7761 9 16.5C9 16.2239 9.22386 16 9.5 16C9.77614 16 10 16.2239 10 16.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.5 11.5L18.75 11.5M19 11.5C19 11.7761 18.7761 12 18.5 12C18.2239 12 18 11.7761 18 11.5C18 11.2239 18.2239 11 18.5 11C18.7761 11 19 11.2239 19 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3 3L3 14C3 17.2998 3 18.9497 4.02513 19.9749C5.05025 21 6.70017 21 10 21L21 21"
        strokeLinecap="round"
        strokeLinejoin="round"
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
