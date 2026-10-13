'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type AxeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 15, -4, 0],
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: AxeProps) {
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
        d="M12.5 12L5.01777 19.4822C4.68625 19.8138 4.23661 20 3.76777 20C2.79146 20 2 19.2085 2 18.2322C2 17.7634 2.18625 17.3138 2.51777 16.9822L10 9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M10.202 9.30552L13.3086 12.4119C13.5485 12.6518 13.6684 12.7717 13.7417 12.9212C13.8149 13.0708 13.8362 13.2391 13.8786 13.5757L14.1093 15.4031C14.2062 16.1709 14.2547 16.5548 14.6168 16.8157C14.979 17.0767 15.2756 17.0177 15.8687 16.8997C17.1633 16.6421 18.5479 15.8974 19.7226 14.7227C20.8974 13.548 21.6422 12.1634 21.8998 10.8687C22.0177 10.2758 22.0767 9.9793 21.8158 9.61719C21.5549 9.25508 21.1711 9.20655 20.4034 9.1095L18.5759 8.87844C18.2395 8.8359 18.0712 8.81463 17.9218 8.74141C17.7724 8.6682 17.6524 8.5483 17.4126 8.3085L14.3059 5.20192C13.7464 4.64254 13.4667 4.36286 13.165 4.21335C12.5909 3.92888 11.9169 3.92888 11.3428 4.21335C11.0411 4.36286 10.7614 4.64254 10.202 5.20192C9.64259 5.76129 9.36288 6.04097 9.21336 6.34269C8.92888 6.91673 8.92888 7.5907 9.21336 8.16475C9.36288 8.46646 9.64259 8.74615 10.202 9.30552Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Axe(props: AxeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Axe,
  Axe as AxeIcon,
  type AxeProps,
  type AxeProps as AxeIconProps,
};
