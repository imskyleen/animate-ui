'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type PreferenceVerticalProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: { d: 'M4 3L4 5' },
      animate: {
        d: 'M4 3L4 11',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { y: 0 },
      animate: { y: 6, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M4 11L4 21' },
      animate: {
        d: 'M4 17L4 21',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line4: {
      initial: { d: 'M11.5 3L11.5 13' },
      animate: {
        d: 'M11.5 3L11.5 5',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line5: {
      initial: { y: 0 },
      animate: { y: -8, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line6: {
      initial: { d: 'M11.5 19L11.5 21' },
      animate: {
        d: 'M11.5 11L11.5 21',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line7: {
      initial: { d: 'M19 3L19 7' },
      animate: {
        d: 'M19 3L19 12',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line8: {
      initial: { y: 0 },
      animate: { y: 5, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line9: {
      initial: { d: 'M19 13L19 21' },
      animate: {
        d: 'M19 18L19 21',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M4 3L4 5' },
      animate: {
        d: ['M4 3L4 5', 'M4 3L4 11', 'M4 3L4 5'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { y: 0 },
      animate: {
        y: [0, 6, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M4 11L4 21' },
      animate: {
        d: ['M4 11L4 21', 'M4 17L4 21', 'M4 11L4 21'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M11.5 3L11.5 13' },
      animate: {
        d: ['M11.5 3L11.5 13', 'M11.5 3L11.5 5', 'M11.5 3L11.5 13'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line5: {
      initial: { y: 0 },
      animate: {
        y: [0, -8, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line6: {
      initial: { d: 'M11.5 19L11.5 21' },
      animate: {
        d: ['M11.5 19L11.5 21', 'M11.5 11L11.5 21', 'M11.5 19L11.5 21'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line7: {
      initial: { d: 'M19 3L19 7' },
      animate: {
        d: ['M19 3L19 7', 'M19 3L19 12', 'M19 3L19 7'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line8: {
      initial: { y: 0 },
      animate: {
        y: [0, 5, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line9: {
      initial: { d: 'M19 13L19 21' },
      animate: {
        d: ['M19 13L19 21', 'M19 18L19 21', 'M19 13L19 21'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PreferenceVerticalProps) {
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
        d="M4 3L4 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line1}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M2 9.5C2 9.03406 2 8.80109 2.07612 8.61732C2.17761 8.37229 2.37229 8.17761 2.61732 8.07612C2.80109 8 3.03406 8 3.5 8H4.5C4.96594 8 5.19891 8 5.38268 8.07612C5.62771 8.17761 5.82239 8.37229 5.92388 8.61732C6 8.80109 6 9.03406 6 9.5C6 9.96594 6 10.1989 5.92388 10.3827C5.82239 10.6277 5.62771 10.8224 5.38268 10.9239C5.19891 11 4.96594 11 4.5 11H3.5C3.03406 11 2.80109 11 2.61732 10.9239C2.37229 10.8224 2.17761 10.6277 2.07612 10.3827C2 10.1989 2 9.96594 2 9.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line2}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M4 11L4 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line3}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.5 3L11.5 13"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line4}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M9.5 14.5C9.5 14.0341 9.5 13.8011 9.57612 13.6173C9.67761 13.3723 9.87229 13.1776 10.1173 13.0761C10.3011 13 10.5341 13 11 13H12C12.4659 13 12.6989 13 12.8827 13.0761C13.1277 13.1776 13.3224 13.3723 13.4239 13.6173C13.5 13.8011 13.5 14.0341 13.5 14.5C13.5 14.9659 13.5 15.1989 13.4239 15.3827C13.3224 15.6277 13.1277 15.8224 12.8827 15.9239C12.6989 16 12.4659 16 12 16H11C10.5341 16 10.3011 16 10.1173 15.9239C9.87229 15.8224 9.67761 15.6277 9.57612 15.3827C9.5 15.1989 9.5 14.9659 9.5 14.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line5}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M11.5 19L11.5 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line6}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 3L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line7}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17 11.5C17 11.0341 17 10.8011 17.0761 10.6173C17.1776 10.3723 17.3723 10.1776 17.6173 10.0761C17.8011 10 18.0341 10 18.5 10H19.5C19.9659 10 20.1989 10 20.3827 10.0761C20.6277 10.1776 20.8224 10.3723 20.9239 10.6173C21 10.8011 21 11.0341 21 11.5C21 11.9659 21 12.1989 20.9239 12.3827C20.8224 12.6277 20.6277 12.8224 20.3827 12.9239C20.1989 13 19.9659 13 19.5 13H18.5C18.0341 13 17.8011 13 17.6173 12.9239C17.3723 12.8224 17.1776 12.6277 17.0761 12.3827C17 12.1989 17 11.9659 17 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line8}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M19 13L19 21"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={variants.line9}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function PreferenceVertical(props: PreferenceVerticalProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  PreferenceVertical,
  PreferenceVertical as PreferenceVerticalIcon,
  type PreferenceVerticalProps,
  type PreferenceVerticalProps as PreferenceVerticalIconProps,
};
