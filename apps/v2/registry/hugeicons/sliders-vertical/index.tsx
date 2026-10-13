'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SlidersVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { d: 'M4.99994 11.0001L4.99994 4.00006' },
      animate: {
        d: 'M4.99994 5.0001L4.99994 4.00006',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { y: 0 },
      animate: { y: -6, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M5.00018 20.0001L4.99994 14.0001' },
      animate: {
        d: 'M5.00018 20.0001L4.99994 8.0001',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line4: {
      initial: { d: 'M11.9997 8.00006L11.9999 4.00006' },
      animate: {
        d: 'M11.9997 16.0001L11.9999 4.00006',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line5: {
      initial: { y: 0 },
      animate: { y: 8, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line6: {
      initial: { d: 'M12.0002 20.0001L11.9999 11.0001' },
      animate: {
        d: 'M12.0002 20.0001L11.9999 19.0001',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line7: {
      initial: { d: 'M18.9999 12.0001L18.9999 4.00006' },
      animate: {
        d: 'M18.9999 7.0001L18.9999 4.00006',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line8: {
      initial: { y: 0 },
      animate: { y: -5, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line9: {
      initial: { d: 'M19.0002 20.0001L18.9999 15.0001' },
      animate: {
        d: 'M19.0002 20.0001L18.9999 10.0001',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M4.99994 11.0001L4.99994 4.00006' },
      animate: {
        d: [
          'M4.99994 11.0001L4.99994 4.00006',
          'M4.99994 5.0001L4.99994 4.00006',
          'M4.99994 11.0001L4.99994 4.00006',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { y: 0 },
      animate: {
        y: [0, -6, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M5.00018 20.0001L4.99994 14.0001' },
      animate: {
        d: [
          'M5.00018 20.0001L4.99994 14.0001',
          'M5.00018 20.0001L4.99994 8.0001',
          'M5.00018 20.0001L4.99994 14.0001',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M11.9997 8.00006L11.9999 4.00006' },
      animate: {
        d: [
          'M11.9997 8.00006L11.9999 4.00006',
          'M11.9997 16.0001L11.9999 4.00006',
          'M11.9997 8.00006L11.9999 4.00006',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line5: {
      initial: { y: 0 },
      animate: {
        y: [0, 8, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line6: {
      initial: { d: 'M12.0002 20.0001L11.9999 11.0001' },
      animate: {
        d: [
          'M12.0002 20.0001L11.9999 11.0001',
          'M12.0002 20.0001L11.9999 19.0001',
          'M12.0002 20.0001L11.9999 11.0001',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line7: {
      initial: { d: 'M18.9999 12.0001L18.9999 4.00006' },
      animate: {
        d: [
          'M18.9999 12.0001L18.9999 4.00006',
          'M18.9999 7.0001L18.9999 4.00006',
          'M18.9999 12.0001L18.9999 4.00006',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line8: {
      initial: { y: 0 },
      animate: {
        y: [0, -5, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line9: {
      initial: { d: 'M19.0002 20.0001L18.9999 15.0001' },
      animate: {
        d: [
          'M19.0002 20.0001L18.9999 15.0001',
          'M19.0002 20.0001L18.9999 10.0001',
          'M19.0002 20.0001L18.9999 15.0001',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SlidersVerticalProps) {
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
        d="M4.99994 11.0001L4.99994 4.00006"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M1.99994 14.0001H7.99994"
        strokeLinecap="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M5.00018 20.0001L4.99994 14.0001"
        strokeLinecap="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9997 8.00006L11.9999 4.00006"
        strokeLinecap="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M8.99994 8.00006H14.9999"
        strokeLinecap="round"
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.0002 20.0001L11.9999 11.0001"
        strokeLinecap="round"
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.9999 12.0001L18.9999 4.00006"
        strokeLinecap="round"
        variants={variants.line7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.9999 12.0001H21.9999"
        strokeLinecap="round"
        variants={variants.line8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19.0002 20.0001L18.9999 15.0001"
        strokeLinecap="round"
        variants={variants.line9}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SlidersVertical(props: SlidersVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SlidersVertical,
  SlidersVertical as SlidersVerticalIcon,
  type SlidersVerticalProps,
  type SlidersVerticalProps as SlidersVerticalIconProps,
};
