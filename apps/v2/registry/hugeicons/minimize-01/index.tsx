'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type Minimize01Props = IconProps<keyof typeof animations>;

const animations = {
  default: {
    frame: {},
    arrow1: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -0.8,
        y: 0.8,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    arrow2: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: 0.8,
        y: -0.8,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    frame: {},
    arrow1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -0.8, 0],
        y: [0, 0.8, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    arrow2: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.8, 0],
        y: [0, -0.8, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Minimize01Props) {
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
        d="M19.9264 22.2502V20.6912C19.9264 20.2886 20.0525 19.8976 20.2639 19.5545C21.7583 17.1282 22.2279 14.5259 21.9002 13.5123C20.857 11.3512 17.3758 10.5009 15.76 10.2983L16.7966 5.13851C16.9705 4.32028 16.3513 3.4966 15.4135 3.29877C14.4758 3.10095 13.5746 3.6039 13.4007 4.42213L11.3462 14.0882L8.77462 12.4508C8.77462 12.4508 7.47969 11.4154 6.44041 12.4508C5.40114 13.4861 6.44041 14.7762 6.44041 14.7762L10.3488 19.7787C10.6003 20.1005 10.7468 20.4912 10.7688 20.8984L10.8401 22.2164"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.frame}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M6.95693 2.2382C6.95693 2.2382 6.7053 4.50936 6.95693 4.75695M6.95693 4.75695C7.28338 5.07806 9.55878 4.80775 9.55878 4.80775M6.95693 4.75695L10.001 1.74805"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arrow1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.04502 9.24998C5.04502 9.24998 5.29665 6.97882 5.04502 6.73124M5.04502 6.73124C4.71857 6.41012 2.44317 6.68043 2.44317 6.68043M5.04502 6.73124L2.00098 9.74014"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.arrow2}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Minimize01(props: Minimize01Props) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  Minimize01,
  Minimize01 as Minimize01Icon,
  type Minimize01Props,
  type Minimize01Props as Minimize01IconProps,
};
