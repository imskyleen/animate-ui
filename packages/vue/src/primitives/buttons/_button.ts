import type { Transition } from 'motion-v';

import { motionTokens } from '../../utils/motion';

const SCALE_SPRING: Transition = motionTokens.spring.press;

const TAP_SCALE = motionTokens.scale.press;

type Handler = (event: MouseEvent) => void;

/** Calls an `onClick` attribute, a single handler or the list Vue merged. */
function callHandler(handler: unknown, event: MouseEvent) {
  if (Array.isArray(handler))
    handler.forEach((each) => (each as Handler)(event));
  else if (typeof handler === 'function') (handler as Handler)(event);
}

export { SCALE_SPRING, TAP_SCALE, callHandler };
