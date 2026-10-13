'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageSquareDashedProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 4, -4, 1, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
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
  } satisfies Record<string, Variants>,
  draw: {
    group: {},
    ...(() => {
      const paths: Record<string, Variants> = {};

      for (let i = 1; i <= 9; i++) {
        paths[`path${i}`] = {
          initial: { opacity: 0, scale: 0 },
          animate: {
            opacity: [0, 1],
            scale: [0, 1],
            transition: {
              delay: i * 0.2,
              duration: 0.4,
            },
          },
        };
      }

      return paths;
    })(),
  },
} as const;

function IconComponent({ size, ...props }: MessageSquareDashedProps) {
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
      <motion.g variants={variants.group} initial="initial" animate={controls}>
        <motion.path
          d="M4 3.09558C3.67772 3.24384 3.39434 3.44112 3.13007 3.70739C2.88949 3.94978 2.70626 4.20547 2.56545 4.4895"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 2.56802C8.64834 2.54204 9.31624 2.52221 10 2.50903"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14 2.50903C14.6838 2.52221 15.3517 2.54204 16 2.56802"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M20 3.09558C20.3223 3.24384 20.6057 3.44112 20.8699 3.70739C21.1106 3.9499 21.2939 4.20572 21.4348 4.48993"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path4}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21.9692 8.48993C21.9894 9.13868 22 9.8071 22 10.4899"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path5}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M21.8781 14.4899C21.7797 15.7669 21.5624 16.5748 20.8699 17.2725C20.6057 17.5387 20.3223 17.736 20 17.8843"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path6}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8 18.4118V20.76C8 21.1631 8.32679 21.4899 8.72991 21.4899C8.90419 21.4899 9.07273 21.4276 9.20503 21.3141L11.3845 19.4452C11.9325 18.9754 12.2064 18.7405 12.532 18.6165C12.8576 18.4925 13.2282 18.4855 13.9693 18.4714C14.6638 18.4583 15.342 18.4382 16 18.4118"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path7}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M4 17.8843C3.67772 17.736 3.39434 17.5387 3.13007 17.2725C2.43751 16.5747 2.22024 15.7668 2.12184 14.4895"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path8}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M2.03909 8.24024C2.03617 8.32299 2.03341 8.40609 2.03081 8.4895C2.01057 9.13838 2 9.80695 2 10.4899"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path9}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquareDashed(props: MessageSquareDashedProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareDashed,
  MessageSquareDashed as MessageSquareDashedIcon,
  type MessageSquareDashedProps,
  type MessageSquareDashedProps as MessageSquareDashedIconProps,
};
