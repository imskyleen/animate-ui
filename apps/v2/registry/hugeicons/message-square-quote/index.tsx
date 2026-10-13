'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from '@animate-ui/react/icons';

type MessageSquareQuoteProps = IconProps<keyof typeof animations>;

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
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 1.5, 0],
        y: [0, -0.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 1, 0],
        y: [0, -0.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareQuoteProps) {
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
          d="M1.99609 10.5C1.99609 9.72921 2.00956 8.97679 2.03519 8.2503C2.11892 5.87683 2.16078 4.69009 3.12616 3.71745C4.09154 2.74481 5.31179 2.6926 7.75229 2.58819C9.09126 2.5309 10.517 2.5 11.9961 2.5C13.4752 2.5 14.9009 2.5309 16.2399 2.58819C18.6804 2.6926 19.9006 2.74481 20.866 3.71745C21.8314 4.69009 21.8733 5.87683 21.957 8.2503C21.9826 8.97679 21.9961 9.72921 21.9961 10.5C21.9961 11.2708 21.9826 12.0232 21.957 12.7497C21.8733 15.1232 21.8314 16.3099 20.866 17.2826C19.9006 18.2552 18.6804 18.3074 16.2398 18.4118C15.5059 18.4432 14.7459 18.4667 13.9654 18.4815C13.2242 18.4955 12.8537 18.5026 12.5281 18.6266C12.2025 18.7506 11.9285 18.9855 11.3806 19.4553L9.20113 21.3242C9.06882 21.4376 8.90029 21.5 8.726 21.5C8.32289 21.5 7.99609 21.1732 7.99609 20.7701V18.4219C7.91451 18.4186 7.83324 18.4153 7.75229 18.4118C5.31179 18.3074 4.09154 18.2552 3.12616 17.2825C2.16078 16.3099 2.11892 15.1232 2.03519 12.7497C2.00956 12.0232 1.99609 11.2708 1.99609 10.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path1}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M7.39453 14.5C8.42188 14.5 8.93555 14.5 9.33453 14.3158C9.7661 14.1165 10.1126 13.77 10.3119 13.3384C10.4961 12.9395 10.4961 12.4258 10.4961 11.3984L10.4961 10.5M10.4961 10.5V8.5C10.4961 7.55719 10.4961 7.08579 10.2032 6.79289C9.91031 6.5 9.4389 6.5 8.49609 6.5C7.55328 6.5 7.08188 6.5 6.78899 6.79289C6.49609 7.08579 6.49609 7.55719 6.49609 8.5C6.49609 9.44281 6.49609 9.91421 6.78899 10.2071C7.08188 10.5 7.55328 10.5 8.49609 10.5H10.4961Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={variants.path2}
          initial="initial"
          animate={controls}
        />
        <motion.path
          d="M14.3945 14.5C15.4219 14.5 15.9356 14.5 16.3345 14.3158C16.7661 14.1165 17.1126 13.77 17.3119 13.3384C17.4961 12.9395 17.4961 12.4258 17.4961 11.3984L17.4961 10.5M17.4961 10.5V8.5C17.4961 7.55719 17.4961 7.08579 17.2032 6.79289C16.9103 6.5 16.4389 6.5 15.4961 6.5C14.5533 6.5 14.0819 6.5 13.789 6.79289C13.4961 7.08579 13.4961 7.55719 13.4961 8.5C13.4961 9.44281 13.4961 9.91421 13.789 10.2071C14.0819 10.5 14.5533 10.5 15.4961 10.5H17.4961Z"
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

function MessageSquareQuote(props: MessageSquareQuoteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  animations,
  MessageSquareQuote,
  MessageSquareQuote as MessageSquareQuoteIcon,
  type MessageSquareQuoteProps,
  type MessageSquareQuoteProps as MessageSquareQuoteIconProps,
};
