import {
  HoverCardContent as RekaHoverCardContent,
  HoverCardPortal as RekaHoverCardPortal,
  HoverCardRoot as RekaHoverCardRoot,
  HoverCardTrigger as RekaHoverCardTrigger,
  injectHoverCardRootContext,
  type HoverCardContentProps as RekaHoverCardContentProps,
  type HoverCardRootProps as RekaHoverCardRootProps,
} from 'reka-ui';

import {
  createFollowCursorRoot,
  createFollowCursorTrigger,
  createRekaAnchored,
} from '../../../internal/reka-anchored';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import type { FollowCursorProps } from '../../../internal/follow-cursor';

type HoverCardRootProps = RekaHoverCardRootProps & FollowCursorProps;
type HoverCardContentProps = RekaHoverCardContentProps & AnchoredAnimationProps;

const anchored = createRekaAnchored(
  { Portal: RekaHoverCardPortal, Content: RekaHoverCardContent },
  {
    name: 'HoverCard',
    kind: 'popover',
    origin: 'var(--reka-hover-card-content-transform-origin)',
    useRoot: injectHoverCardRootContext,
  },
);

const HoverCardRoot = createFollowCursorRoot(
  RekaHoverCardRoot,
  'HoverCardRoot',
) as unknown as typeof RekaHoverCardRoot;
const HoverCardTrigger = createFollowCursorTrigger(
  RekaHoverCardTrigger,
  'HoverCardTrigger',
) as unknown as typeof RekaHoverCardTrigger;
const HoverCardPortal =
  anchored.Portal as unknown as typeof RekaHoverCardPortal;
const HoverCardContent =
  anchored.Content as unknown as typeof RekaHoverCardContent;

export {
  HoverCardArrow,
  type HoverCardRootEmits,
  type HoverCardTriggerProps,
  type HoverCardPortalProps,
} from 'reka-ui';

export {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  type HoverCardRootProps,
  type HoverCardContentProps,
};
