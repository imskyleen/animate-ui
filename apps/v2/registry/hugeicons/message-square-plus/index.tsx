'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageSquarePlusProps = IconProps<keyof typeof animations>;

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
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path3: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
          delay: 0.05,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquarePlusProps) {
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
          d="M1.99634 10.5C1.99634 9.72921 2.0098 8.97679 2.03543 8.2503C2.11916 5.87683 2.16103 4.69009 3.12641 3.71745C4.09178 2.74481 5.31203 2.6926 7.75254 2.58819C9.09151 2.5309 10.5172 2.5 11.9963 2.5C13.4754 2.5 14.9012 2.5309 16.2401 2.58819C18.6806 2.6926 19.9009 2.74481 20.8663 3.71745C21.8316 4.69009 21.8735 5.87683 21.9572 8.2503C21.9829 8.97679 21.9963 9.72921 21.9963 10.5C21.9963 11.2708 21.9829 12.0232 21.9572 12.7497C21.8735 15.1232 21.8316 16.3099 20.8663 17.2826C19.9009 18.2552 18.6806 18.3074 16.24 18.4118C15.5061 18.4432 14.7462 18.4667 13.9656 18.4815C13.2245 18.4955 12.8539 18.5026 12.5283 18.6266C12.2028 18.7506 11.9288 18.9855 11.3809 19.4553L9.20137 21.3242C9.06907 21.4376 8.90053 21.5 8.72625 21.5C8.32313 21.5 7.99634 21.1732 7.99634 20.7701V18.4219C7.91476 18.4186 7.83348 18.4153 7.75253 18.4118C5.31203 18.3074 4.09178 18.2552 3.12641 17.2825C2.16103 16.3099 2.11916 15.1232 2.03543 12.7497C2.0098 12.0232 1.99634 11.2708 1.99634 10.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M11.9963 7V14"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M8.49634 10.5L15.4963 10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path3}
          initial="initial"
          animate={controls}
        />
      </motion.g>
    </motion.svg>
  );
}

function MessageSquarePlus(props: MessageSquarePlusProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquarePlus,
  MessageSquarePlus as MessageSquarePlusIcon,
  type MessageSquarePlusProps,
  type MessageSquarePlusProps as MessageSquarePlusIconProps,
};
