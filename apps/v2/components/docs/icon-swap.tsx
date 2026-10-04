'use client';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  blur,
  ReducedMotionConfig,
  scale,
  transition,
} from '@animate-ui/react/utils/motion';
import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';

const HIDDEN = { scale: scale.icon, opacity: 0, filter: blur.icon };
const SHOWN = { scale: 1, opacity: 1, filter: 'blur(0px)' };

/**
 * Swaps an icon for another in place (copy → check, sun → moon): the old one
 * shrinks and fades out while the new one grows in, both slightly blurred so
 * their overlap reads as one shape changing. Under reduced motion they only
 * fade.
 */
export function IconSwap({
  active,
  icon,
  activeIcon,
  size,
  className,
}: {
  /** Shows `activeIcon` instead of `icon`. */
  active: boolean;
  icon: IconSvgElement;
  activeIcon: IconSvgElement;
  size: number;
  className?: string;
}) {
  return (
    <ReducedMotionConfig>
      {/* Positioned: the leaving icon (popped out of the layout) stays in
          place even while a press scales the button around it. */}
      <span
        data-slot="icon-swap"
        className={cn('relative flex shrink-0', className)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active ? 'active' : 'idle'}
            className="flex"
            initial={HIDDEN}
            animate={SHOWN}
            exit={HIDDEN}
            transition={transition.swap}
          >
            <HugeiconsIcon
              icon={active ? activeIcon : icon}
              strokeWidth={2}
              size={size}
            />
          </motion.span>
        </AnimatePresence>
      </span>
    </ReducedMotionConfig>
  );
}
