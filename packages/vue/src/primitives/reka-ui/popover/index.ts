import {
  injectPopoverRootContext,
  PopoverContent as RekaPopoverContent,
  PopoverPortal as RekaPopoverPortal,
  type PopoverContentProps as RekaPopoverContentProps,
} from 'reka-ui';

import { createRekaAnchored } from '../../../internal/reka-anchored';
import type { AnchoredAnimationProps } from '../../../internal/anchored';

type PopoverContentProps = RekaPopoverContentProps & AnchoredAnimationProps;

const anchored = createRekaAnchored(
  { Portal: RekaPopoverPortal, Content: RekaPopoverContent },
  {
    name: 'Popover',
    kind: 'popover',
    origin: 'var(--reka-popover-content-transform-origin)',
    useRoot: injectPopoverRootContext,
  },
);

const PopoverPortal = anchored.Portal as unknown as typeof RekaPopoverPortal;
const PopoverContent = anchored.Content as unknown as typeof RekaPopoverContent;

export {
  PopoverRoot,
  PopoverTrigger,
  PopoverAnchor,
  PopoverClose,
  PopoverArrow,
  type PopoverRootProps,
  type PopoverRootEmits,
  type PopoverContentEmits,
  type PopoverPortalProps,
} from 'reka-ui';

export { PopoverPortal, PopoverContent, type PopoverContentProps };
