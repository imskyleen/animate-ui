'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SunDimProps = IconProps<keyof typeof animations>;

const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      circle: {},
    };

    for (let i = 1; i <= 8; i++) {
      animation[`path${i}`] = {
        initial: { opacity: 1, scale: 1 },
        animate: {
          opacity: [0, 1],
          scale: [0, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SunDimProps) {
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
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M16.9923 11.9999C16.9923 14.7614 14.7537 16.9999 11.9923 16.9999C9.23089 16.9999 6.99231 14.7614 6.99231 11.9999C6.99231 9.23852 9.23089 6.99994 11.9923 6.99994C14.7537 6.99994 16.9923 9.23852 16.9923 11.9999Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.circle}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.992 3.24994L12.117 3.24994M12.242 3.24994C12.242 3.38801 12.1301 3.49994 11.992 3.49994C11.8539 3.49994 11.742 3.38801 11.742 3.24994C11.742 3.11187 11.8539 2.99994 11.992 2.99994C12.1301 2.99994 12.242 3.11187 12.242 3.24994Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.2675 5.90092L18.1791 5.81253M18.3559 5.98931C18.2583 6.08694 18.1 6.08694 18.0024 5.98931C17.9047 5.89168 17.9047 5.73339 18.0024 5.63576C18.1 5.53813 18.2583 5.53813 18.3559 5.63576C18.4535 5.73339 18.4535 5.89168 18.3559 5.98931Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M20.7423 12.1249V11.9999M20.7423 12.2499C20.6042 12.2499 20.4923 12.138 20.4923 11.9999C20.4923 11.8619 20.6042 11.7499 20.7423 11.7499C20.8804 11.7499 20.9923 11.8619 20.9923 11.9999C20.9923 12.138 20.8804 12.2499 20.7423 12.2499Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.091 18.2755L18.1794 18.1871M18.0026 18.3639C17.9049 18.2663 17.9049 18.108 18.0026 18.0103C18.1002 17.9127 18.2585 17.9127 18.3561 18.0103C18.4538 18.108 18.4538 18.2663 18.3561 18.3639C18.2585 18.4615 18.1002 18.4615 18.0026 18.3639Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9915 20.7499L12.1165 20.7499M12.2415 20.7499C12.2415 20.888 12.1296 20.9999 11.9915 20.9999C11.8535 20.9999 11.7415 20.888 11.7415 20.7499C11.7415 20.6119 11.8535 20.4999 11.9915 20.4999C12.1296 20.4999 12.2415 20.6119 12.2415 20.7499Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.89282 18.275L5.80443 18.1866M5.98121 18.3633C5.88358 18.461 5.72528 18.461 5.62765 18.3633C5.53002 18.2657 5.53002 18.1074 5.62765 18.0098C5.72528 17.9122 5.88358 17.9122 5.98121 18.0098C6.07884 18.1074 6.07884 18.2657 5.98121 18.3633Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.24231 12.1249V11.9999M3.24231 12.2499C3.10424 12.2499 2.99231 12.138 2.99231 11.9999C2.99231 11.8619 3.10424 11.7499 3.24231 11.7499C3.38038 11.7499 3.49231 11.8619 3.49231 11.9999C3.49231 12.138 3.38038 12.2499 3.24231 12.2499Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.71659 5.90114L5.80498 5.81275M5.62821 5.98953C5.53058 5.8919 5.53058 5.73361 5.62821 5.63598C5.72584 5.53835 5.88413 5.53835 5.98176 5.63598C6.07939 5.73361 6.07939 5.8919 5.98176 5.98953C5.88413 6.08716 5.72584 6.08716 5.62821 5.98953Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.path8}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SunDim(props: SunDimProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SunDim,
  SunDim as SunDimIcon,
  type SunDimProps,
  type SunDimProps as SunDimIconProps,
};
