import type { Transition } from 'motion-v';

import { motionTokens } from '../../utils/motion';

const SCALE_SPRING: Transition = motionTokens.spring.press;

const TAP_SCALE = motionTokens.scale.press;

export { SCALE_SPRING, TAP_SCALE };
