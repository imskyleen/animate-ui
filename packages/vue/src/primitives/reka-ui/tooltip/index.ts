import {
  injectTooltipRootContext,
  TooltipContent as RekaTooltipContent,
  TooltipPortal as RekaTooltipPortal,
  TooltipRoot as RekaTooltipRoot,
  TooltipTrigger as RekaTooltipTrigger,
  type TooltipContentProps as RekaTooltipContentProps,
  type TooltipRootProps as RekaTooltipRootProps,
} from 'reka-ui';

import {
  createFollowCursorRoot,
  createFollowCursorTrigger,
  createRekaAnchored,
} from '../../../internal/reka-anchored';
import type { AnchoredAnimationProps } from '../../../internal/anchored';
import type { FollowCursorProps } from '../../../internal/follow-cursor';

type TooltipRootProps = RekaTooltipRootProps & FollowCursorProps;
type TooltipContentProps = RekaTooltipContentProps & AnchoredAnimationProps;

const anchored = createRekaAnchored(
  { Portal: RekaTooltipPortal, Content: RekaTooltipContent },
  {
    name: 'Tooltip',
    kind: 'tooltip',
    origin: 'var(--reka-tooltip-content-transform-origin)',
    useRoot: injectTooltipRootContext,
  },
);

const TooltipRoot = createFollowCursorRoot(
  RekaTooltipRoot,
  'TooltipRoot',
) as unknown as typeof RekaTooltipRoot;
const TooltipTrigger = createFollowCursorTrigger(
  RekaTooltipTrigger,
  'TooltipTrigger',
) as unknown as typeof RekaTooltipTrigger;
const TooltipPortal = anchored.Portal as unknown as typeof RekaTooltipPortal;
const TooltipContent = anchored.Content as unknown as typeof RekaTooltipContent;

export {
  TooltipProvider,
  TooltipArrow,
  type TooltipProviderProps,
  type TooltipRootEmits,
  type TooltipTriggerProps,
  type TooltipPortalProps,
  type TooltipContentEmits,
} from 'reka-ui';

export {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  type TooltipRootProps,
  type TooltipContentProps,
};
