import {
  ContextMenuCheckboxItem as RekaContextMenuCheckboxItem,
  ContextMenuContent as RekaContextMenuContent,
  ContextMenuItem as RekaContextMenuItem,
  ContextMenuItemIndicator as RekaContextMenuItemIndicator,
  ContextMenuPortal as RekaContextMenuPortal,
  ContextMenuRadioGroup as RekaContextMenuRadioGroup,
  ContextMenuRadioItem as RekaContextMenuRadioItem,
  ContextMenuRoot as RekaContextMenuRoot,
  ContextMenuSub as RekaContextMenuSub,
  ContextMenuSubContent as RekaContextMenuSubContent,
  ContextMenuSubTrigger as RekaContextMenuSubTrigger,
  type ContextMenuContentProps as RekaContextMenuContentProps,
  type ContextMenuItemIndicatorProps as RekaContextMenuItemIndicatorProps,
  type ContextMenuSubContentProps as RekaContextMenuSubContentProps,
} from 'reka-ui';
import type { Transition } from 'motion-v';

import {
  createMenuCheckItem,
  createMenuContent,
  createMenuItem,
  createMenuItemIndicator,
  createMenuPortal,
  createMenuRadioGroup,
  createMenuRoot,
} from '../../../internal/reka-menu';
import type { ItemCheckAnimationProps } from '../../../internal/item-indicator';

type PresenceAnimationProps = {
  transition?: Transition;
  exitTransition?: Transition;
};

type ContextMenuContentProps = RekaContextMenuContentProps &
  PresenceAnimationProps;
type ContextMenuSubContentProps = RekaContextMenuSubContentProps &
  PresenceAnimationProps;
type ContextMenuItemIndicatorProps = RekaContextMenuItemIndicatorProps &
  ItemCheckAnimationProps;

const ORIGIN = '--reka-context-menu-content-transform-origin';

const ContextMenuRoot = createMenuRoot(
  RekaContextMenuRoot,
  'ContextMenuRoot',
) as unknown as typeof RekaContextMenuRoot;
const ContextMenuPortal = createMenuPortal(
  RekaContextMenuPortal,
  'ContextMenuPortal',
) as unknown as typeof RekaContextMenuPortal;
const ContextMenuContent = createMenuContent(
  RekaContextMenuContent,
  'ContextMenuContent',
  {
    origin: ORIGIN,
    returnFocus: 'previous',
  },
) as unknown as typeof RekaContextMenuContent;
const ContextMenuItem = createMenuItem(
  RekaContextMenuItem,
  'ContextMenuItem',
) as unknown as typeof RekaContextMenuItem;
const ContextMenuCheckboxItem = createMenuCheckItem(
  RekaContextMenuCheckboxItem,
  'ContextMenuCheckboxItem',
  'checkbox',
) as unknown as typeof RekaContextMenuCheckboxItem;
const ContextMenuRadioGroup = createMenuRadioGroup(
  RekaContextMenuRadioGroup,
  'ContextMenuRadioGroup',
) as unknown as typeof RekaContextMenuRadioGroup;
const ContextMenuRadioItem = createMenuCheckItem(
  RekaContextMenuRadioItem,
  'ContextMenuRadioItem',
  'radio',
) as unknown as typeof RekaContextMenuRadioItem;
const ContextMenuItemIndicator = createMenuItemIndicator(
  RekaContextMenuItemIndicator,
  'ContextMenuItemIndicator',
) as unknown as typeof RekaContextMenuItemIndicator;
const ContextMenuSub = createMenuRoot(RekaContextMenuSub, 'ContextMenuSub', {
  sub: true,
}) as unknown as typeof RekaContextMenuSub;
const ContextMenuSubTrigger = createMenuItem(
  RekaContextMenuSubTrigger,
  'ContextMenuSubTrigger',
) as unknown as typeof RekaContextMenuSubTrigger;
const ContextMenuSubContent = createMenuContent(
  RekaContextMenuSubContent,
  'ContextMenuSubContent',
  {
    origin: ORIGIN,
    sub: true,
    returnFocus: 'none',
  },
) as unknown as typeof RekaContextMenuSubContent;

export {
  ContextMenuTrigger,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuArrow,
  type ContextMenuRootProps,
  type ContextMenuRootEmits,
  type ContextMenuContentEmits,
  type ContextMenuItemProps,
  type ContextMenuItemEmits,
  type ContextMenuCheckboxItemProps,
  type ContextMenuCheckboxItemEmits,
  type ContextMenuRadioGroupProps,
  type ContextMenuRadioGroupEmits,
  type ContextMenuRadioItemProps,
  type ContextMenuRadioItemEmits,
  type ContextMenuSubProps,
  type ContextMenuSubEmits,
  type ContextMenuSubTriggerProps,
  type ContextMenuSubContentEmits,
  type ContextMenuPortalProps,
} from 'reka-ui';

export {
  ContextMenuRoot,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuItemIndicator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  type ContextMenuContentProps,
  type ContextMenuSubContentProps,
  type ContextMenuItemIndicatorProps,
};
