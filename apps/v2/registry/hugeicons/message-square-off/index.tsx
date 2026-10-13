'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageSquareOffProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-7%', '7%', '-7%', '7%', 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareOffProps) {
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
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M21.0627 17.0664C21.8379 16.1309 21.8796 14.9504 21.9572 12.7497C21.9828 12.0232 21.9963 11.2708 21.9963 10.5C21.9963 9.72921 21.9828 8.97679 21.9572 8.2503C21.8735 5.87683 21.8316 4.69009 20.8662 3.71745C19.9009 2.74481 18.6806 2.6926 16.2401 2.58819C14.9011 2.5309 13.4754 2.5 11.9963 2.5C10.5172 2.5 9.09148 2.5309 7.75251 2.58819C7.34852 2.60547 6.97797 2.62133 6.63647 2.64016"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M1.99585 2L21.9958 22"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.12592 3.71875C2.16054 4.69139 2.11867 5.87813 2.03494 8.2516C2.00931 8.97809 1.99585 9.73051 1.99585 10.5013C1.99585 11.2721 2.00931 12.0245 2.03494 12.751C2.11867 15.1245 2.16054 16.3112 3.12592 17.2838C4.0913 18.2565 5.31154 18.3087 7.75204 18.4131C7.833 18.4166 7.91427 18.4199 7.99585 18.4232V20.7714C7.99585 21.1745 8.32264 21.5013 8.72576 21.5013C8.90004 21.5013 9.06858 21.4389 9.20088 21.3255L11.3804 19.4566C11.9283 18.9868 12.2023 18.7519 12.5278 18.6279C12.8534 18.5039 13.224 18.4968 13.9652 18.4828C14.7457 18.468 15.5057 18.4445 16.2396 18.4131C17.0672 18.3777 17.7546 18.3483 18.3392 18.287"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function MessageSquareOff(props: MessageSquareOffProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareOff,
  MessageSquareOff as MessageSquareOffIcon,
  type MessageSquareOffProps,
  type MessageSquareOffProps as MessageSquareOffIconProps,
};
