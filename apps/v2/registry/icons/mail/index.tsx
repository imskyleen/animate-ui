'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MailProps = IconProps<keyof typeof animations>;

const CLOSED_BODY =
  'M20 4c1.105 0 2 .895 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2l8 0a0 0 0 0 1 0 0l8 0Z';
const OPEN_BODY =
  'M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z';
const CLOSED_FLAP = 'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7';
const OPEN_FLAP = 'm22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10';

const animations = {
  default: {
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -1.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
  open: {
    group: {},
    path1: {
      initial: {
        d: CLOSED_FLAP,
        transition: { duration: 0.35, ease: 'easeInOut' },
      },
      animate: {
        d: OPEN_FLAP,
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        d: CLOSED_BODY,
        transition: { duration: 0.35, ease: 'easeInOut' },
      },
      animate: {
        d: OPEN_BODY,
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  peek: {
    group: {},
    path1: {
      initial: { d: CLOSED_FLAP },
      animate: {
        d: [CLOSED_FLAP, OPEN_FLAP, OPEN_FLAP, CLOSED_FLAP],
        transition: {
          duration: 1.4,
          times: [0, 0.3, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: { d: CLOSED_BODY },
      animate: {
        d: [CLOSED_BODY, OPEN_BODY, OPEN_BODY, CLOSED_BODY],
        transition: {
          duration: 1.4,
          times: [0, 0.3, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MailProps) {
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
          d={CLOSED_FLAP}
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d={CLOSED_BODY}
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Mail(props: MailProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Mail,
  Mail as MailIcon,
  type MailProps,
  type MailProps as MailIconProps,
};
