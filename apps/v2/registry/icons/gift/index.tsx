'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type GiftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    box: {
      initial: {
        y: 0,
        d: 'M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        d: 'M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    ribbon: {
      initial: {
        y: 0,
        d: 'M12 11v10',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        d: 'M12 13v8',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group: {
      initial: {
        y: 0,
        rotate: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -1,
        rotate: [0, -3, 3, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          rotate: {
            duration: 0.33,
            ease: 'easeInOut',
            times: [0, 0.3, 0.65, 1],
          },
        },
      },
    },
    lid: {},
    ribbonTop: {},
    bow: {},
  } satisfies Record<string, Variants>,
  open: {
    box: {
      initial: {
        y: 0,
        d: 'M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        d: 'M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    ribbon: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
    group: {
      initial: {
        y: 0,
        rotate: 0,
        transformOrigin: '0% 100%',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 1,
        rotate: -7,
        transformOrigin: '0% 100%',
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    lid: {},
    ribbonTop: {},
    bow: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: GiftProps) {
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
      <motion.path
        d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
        variants={variants.box}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12 11v10"
        variants={variants.ribbon}
        initial="initial"
        animate={controls}
      />
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.rect
          x={3}
          y={7}
          width={18}
          height={4}
          rx={1}
          variants={variants.lid}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M12 7v4"
          variants={variants.ribbonTop}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5"
          variants={variants.bow}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function Gift(props: GiftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Gift,
  Gift as GiftIcon,
  type GiftProps,
  type GiftProps as GiftIconProps,
};
