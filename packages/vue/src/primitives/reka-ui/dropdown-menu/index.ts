import {
  DropdownMenuCheckboxItem as RekaDropdownMenuCheckboxItem,
  DropdownMenuContent as RekaDropdownMenuContent,
  DropdownMenuItem as RekaDropdownMenuItem,
  DropdownMenuItemIndicator as RekaDropdownMenuItemIndicator,
  DropdownMenuPortal as RekaDropdownMenuPortal,
  DropdownMenuRadioGroup as RekaDropdownMenuRadioGroup,
  DropdownMenuRadioItem as RekaDropdownMenuRadioItem,
  DropdownMenuRoot as RekaDropdownMenuRoot,
  DropdownMenuSub as RekaDropdownMenuSub,
  DropdownMenuSubContent as RekaDropdownMenuSubContent,
  DropdownMenuSubTrigger as RekaDropdownMenuSubTrigger,
  type DropdownMenuContentProps as RekaDropdownMenuContentProps,
  type DropdownMenuItemIndicatorProps as RekaDropdownMenuItemIndicatorProps,
  type DropdownMenuSubContentProps as RekaDropdownMenuSubContentProps,
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

type DropdownMenuContentProps = RekaDropdownMenuContentProps &
  PresenceAnimationProps;
type DropdownMenuSubContentProps = RekaDropdownMenuSubContentProps &
  PresenceAnimationProps;
type DropdownMenuItemIndicatorProps = RekaDropdownMenuItemIndicatorProps &
  ItemCheckAnimationProps;

const ORIGIN = '--reka-dropdown-menu-content-transform-origin';

const DropdownMenuRoot = createMenuRoot(
  RekaDropdownMenuRoot,
  'DropdownMenuRoot',
) as unknown as typeof RekaDropdownMenuRoot;
const DropdownMenuPortal = createMenuPortal(
  RekaDropdownMenuPortal,
  'DropdownMenuPortal',
) as unknown as typeof RekaDropdownMenuPortal;
const DropdownMenuContent = createMenuContent(
  RekaDropdownMenuContent,
  'DropdownMenuContent',
  {
    origin: ORIGIN,
    returnFocus: 'trigger',
  },
) as unknown as typeof RekaDropdownMenuContent;
const DropdownMenuItem = createMenuItem(
  RekaDropdownMenuItem,
  'DropdownMenuItem',
) as unknown as typeof RekaDropdownMenuItem;
const DropdownMenuCheckboxItem = createMenuCheckItem(
  RekaDropdownMenuCheckboxItem,
  'DropdownMenuCheckboxItem',
  'checkbox',
) as unknown as typeof RekaDropdownMenuCheckboxItem;
const DropdownMenuRadioGroup = createMenuRadioGroup(
  RekaDropdownMenuRadioGroup,
  'DropdownMenuRadioGroup',
) as unknown as typeof RekaDropdownMenuRadioGroup;
const DropdownMenuRadioItem = createMenuCheckItem(
  RekaDropdownMenuRadioItem,
  'DropdownMenuRadioItem',
  'radio',
) as unknown as typeof RekaDropdownMenuRadioItem;
const DropdownMenuItemIndicator = createMenuItemIndicator(
  RekaDropdownMenuItemIndicator,
  'DropdownMenuItemIndicator',
) as unknown as typeof RekaDropdownMenuItemIndicator;
const DropdownMenuSub = createMenuRoot(RekaDropdownMenuSub, 'DropdownMenuSub', {
  sub: true,
}) as unknown as typeof RekaDropdownMenuSub;
const DropdownMenuSubTrigger = createMenuItem(
  RekaDropdownMenuSubTrigger,
  'DropdownMenuSubTrigger',
) as unknown as typeof RekaDropdownMenuSubTrigger;
const DropdownMenuSubContent = createMenuContent(
  RekaDropdownMenuSubContent,
  'DropdownMenuSubContent',
  {
    origin: ORIGIN,
    sub: true,
    returnFocus: 'none',
  },
) as unknown as typeof RekaDropdownMenuSubContent;

export {
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuArrow,
  type DropdownMenuRootProps,
  type DropdownMenuRootEmits,
  type DropdownMenuContentEmits,
  type DropdownMenuItemProps,
  type DropdownMenuItemEmits,
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuCheckboxItemEmits,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioGroupEmits,
  type DropdownMenuRadioItemProps,
  type DropdownMenuRadioItemEmits,
  type DropdownMenuSubProps,
  type DropdownMenuSubEmits,
  type DropdownMenuSubTriggerProps,
  type DropdownMenuSubContentEmits,
  type DropdownMenuPortalProps,
} from 'reka-ui';

export {
  DropdownMenuRoot,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  type DropdownMenuContentProps,
  type DropdownMenuSubContentProps,
  type DropdownMenuItemIndicatorProps,
};
