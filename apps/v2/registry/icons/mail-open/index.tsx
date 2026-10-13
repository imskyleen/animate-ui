'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MailOpenProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    fold: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MailOpenProps) {
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
      <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
      <motion.path
        d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"
        variants={variants.fold}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MailOpen(props: MailOpenProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MailOpen,
  MailOpen as MailOpenIcon,
  type MailOpenProps,
  type MailOpenProps as MailOpenIconProps,
};
