'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type SlidersHorizontalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { d: 'M3.99963 5.00055L9.99963 5.00031' },
      animate: {
        d: 'M3.99963 5.00055L14.9996 5.00031',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: { x: 5, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M12.9996 5.00031L19.9996 5.00031' },
      animate: {
        d: 'M17.9996 5.00031L19.9996 5.00031',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line4: {
      initial: { d: 'M3.99963 12.0005L12.9996 12.0003' },
      animate: {
        d: 'M3.99963 12.0005L5.9996 12.0003',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: { x: -7, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line6: {
      initial: { d: 'M15.9996 12.0001L19.9996 12.0003' },
      animate: {
        d: 'M8.9996 12.0001L19.9996 12.0003',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line7: {
      initial: { d: 'M3.99963 19.0005L8.99963 19.0003' },
      animate: {
        d: 'M3.99963 19.0005L13.9996 19.0003',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line8: {
      initial: { x: 0 },
      animate: { x: 5, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line9: {
      initial: { d: 'M11.9996 19.0003L19.9996 19.0003' },
      animate: {
        d: 'M16.9996 19.0003L19.9996 19.0003',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M3.99963 5.00055L9.99963 5.00031' },
      animate: {
        d: [
          'M3.99963 5.00055L9.99963 5.00031',
          'M3.99963 5.00055L14.9996 5.00031',
          'M3.99963 5.00055L9.99963 5.00031',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: {
        x: [0, 5, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M12.9996 5.00031L19.9996 5.00031' },
      animate: {
        d: [
          'M12.9996 5.00031L19.9996 5.00031',
          'M17.9996 5.00031L19.9996 5.00031',
          'M12.9996 5.00031L19.9996 5.00031',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M3.99963 12.0005L12.9996 12.0003' },
      animate: {
        d: [
          'M3.99963 12.0005L12.9996 12.0003',
          'M3.99963 12.0005L5.9996 12.0003',
          'M3.99963 12.0005L12.9996 12.0003',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line5: {
      initial: { x: 0 },
      animate: {
        x: [0, -7, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line6: {
      initial: { d: 'M15.9996 12.0001L19.9996 12.0003' },
      animate: {
        d: [
          'M15.9996 12.0001L19.9996 12.0003',
          'M8.9996 12.0001L19.9996 12.0003',
          'M15.9996 12.0001L19.9996 12.0003',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line7: {
      initial: { d: 'M3.99963 19.0005L8.99963 19.0003' },
      animate: {
        d: [
          'M3.99963 19.0005L8.99963 19.0003',
          'M3.99963 19.0005L13.9996 19.0003',
          'M3.99963 19.0005L8.99963 19.0003',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line8: {
      initial: { x: 0 },
      animate: {
        x: [0, 5, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line9: {
      initial: { d: 'M11.9996 19.0003L19.9996 19.0003' },
      animate: {
        d: [
          'M11.9996 19.0003L19.9996 19.0003',
          'M16.9996 19.0003L19.9996 19.0003',
          'M11.9996 19.0003L19.9996 19.0003',
        ],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SlidersHorizontalProps) {
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
        d="M3.99963 5.00055L9.99963 5.00031"
        strokeLinecap="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.99963 2.00031L9.99963 8.00031"
        strokeLinecap="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M12.9996 5.00031L19.9996 5.00031"
        strokeLinecap="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.99963 12.0005L12.9996 12.0003"
        strokeLinecap="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.9996 9.00031L15.9996 15.0003"
        strokeLinecap="round"
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M15.9996 12.0001L19.9996 12.0003"
        strokeLinecap="round"
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M3.99963 19.0005L8.99963 19.0003"
        strokeLinecap="round"
        variants={variants.line7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9996 16.0003L11.9996 22.0003"
        strokeLinecap="round"
        variants={variants.line8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.9996 19.0003L19.9996 19.0003"
        strokeLinecap="round"
        variants={variants.line9}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function SlidersHorizontal(props: SlidersHorizontalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  SlidersHorizontal,
  SlidersHorizontal as SlidersHorizontalIcon,
  type SlidersHorizontalProps,
  type SlidersHorizontalProps as SlidersHorizontalIconProps,
};
