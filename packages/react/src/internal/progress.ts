'use client';

import type { Transition } from 'motion/react';

import type { MotionTokens } from '../utils/motion';

// Shared by the Radix UI, Base UI and React Aria progress bars.
//
// The indicator moves with a transform. Progress updates arrive in bursts
// (uploads, steps), so it uses a spring that keeps its velocity when a new
// value retargets it, with no bounce: an overshoot would uncover the start of
// the track.

/** The indicator's default transition: `spring.snappy` without its bounce. */
function progressTransition(tokens: MotionTokens): Transition {
  return { ...tokens.spring.snappy, bounce: 0 };
}

/** `translateX` that reveals `percentage` of a full-width indicator. */
function revealTransform(percentage: number, rtl = false) {
  const hidden = 100 - Math.min(100, Math.max(0, percentage));
  return `translateX(${rtl ? hidden : -hidden}%)`;
}

export { progressTransition, revealTransform };
