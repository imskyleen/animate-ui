// What `animate-ui migrate` knows about Animate UI v1: where each v1 export
// went in @animate-ui/react. Checked against the v1 registry and the v2
// sources by test/migrate-table.test.ts.

/**
 * Where a v1 export lives in v2, relative to its entry's `module` (or to
 * `<module>#` when it moved to another one):
 * - `Root`: a named export, imported under the v1 name (`Root as Accordion`).
 * - `Popover.Trigger`: a member of a named export (Base UI's namespaces). The
 *   v1 name becomes a local alias: `const PopoverTrigger = Popover.Trigger`.
 * - `ComponentProps<Root>`: the props of a part (types only), for the v1
 *   prop types v2 doesn't name.
 * - `DialogContentProps & { side?: … }`: a type plus the v1 props it lacks
 *   (types only), declared as a local type alias.
 */
export type Target = string;

export type PropRule =
  /** Same prop under another name: rewritten. */
  | { rename: string; message?: string }
  /** v1-only prop: reported as a manual step. */
  | { manual: string };

export type Migration = {
  /** The v2 module, under `@animate-ui/react/`. */
  module: string;
  values: Record<string, Target>;
  types: Record<string, Target>;
  /** v1 exports with no v2 equivalent: kept on the v1 file and reported. */
  unmapped: string[];
  /** Props of a part (by v1 export name) that changed. */
  props?: Record<string, Record<string, PropRule>>;
  /** Attributes a part needs in v2 when the v1 prop was left to its default. */
  defaults?: Record<string, Record<string, string>>;
  /** Parts that rendered another one around themselves in v1 (a Portal). */
  wrap?: Record<string, { in: string; move: string[] }>;
  /** Behaviour changes worth a look, reported when the part is imported. */
  notes?: Record<string, string>;
};

/** v1 primitives (`<library>/<name>`) and their v2 modules. */
export const PRIMITIVES: Record<string, Migration> = {
  // Animate UI's own primitives keep their v1 API: names map one to one.
  'texts/counting-number': {
    module: 'primitives/texts/counting-number',
    values: { CountingNumber: 'CountingNumber' },
    types: { CountingNumberProps: 'CountingNumberProps' },
    unmapped: [],
  },
  'texts/gradient': {
    module: 'primitives/texts/gradient',
    values: { GradientText: 'GradientText' },
    types: { GradientTextProps: 'GradientTextProps' },
    unmapped: [],
  },
  'texts/highlight': {
    module: 'primitives/texts/highlight',
    values: { HighlightText: 'HighlightText' },
    types: { HighlightTextProps: 'HighlightTextProps' },
    unmapped: [],
  },
  'texts/morphing': {
    module: 'primitives/texts/morphing',
    values: { MorphingText: 'MorphingText' },
    types: { MorphingTextProps: 'MorphingTextProps' },
    unmapped: [],
  },
  'texts/rolling': {
    module: 'primitives/texts/rolling',
    values: { RollingText: 'RollingText' },
    types: { RollingTextProps: 'RollingTextProps' },
    unmapped: [],
  },
  'texts/rotating': {
    module: 'primitives/texts/rotating',
    values: {
      RotatingText: 'RotatingText',
      RotatingTextContainer: 'RotatingTextContainer',
      useRotatingText: 'useRotatingText',
    },
    types: {
      RotatingTextContainerProps: 'RotatingTextContainerProps',
      RotatingTextContextType: 'RotatingTextContextType',
      RotatingTextProps: 'RotatingTextProps',
    },
    unmapped: [],
  },
  'texts/scrolling-number': {
    module: 'primitives/texts/scrolling-number',
    values: {
      ScrollingNumber: 'ScrollingNumber',
      ScrollingNumberContainer: 'ScrollingNumberContainer',
      ScrollingNumberHighlight: 'ScrollingNumberHighlight',
      ScrollingNumberItems: 'ScrollingNumberItems',
      useScrollingNumber: 'useScrollingNumber',
    },
    types: {
      ScrollingNumberContainerProps: 'ScrollingNumberContainerProps',
      ScrollingNumberContextType: 'ScrollingNumberContextType',
      ScrollingNumberDirection: 'ScrollingNumberDirection',
      ScrollingNumberHighlightProps: 'ScrollingNumberHighlightProps',
      ScrollingNumberItemsProps: 'ScrollingNumberItemsProps',
      ScrollingNumberProps: 'ScrollingNumberProps',
    },
    unmapped: [],
  },
  'texts/shimmering': {
    module: 'primitives/texts/shimmering',
    values: { ShimmeringText: 'ShimmeringText' },
    types: { ShimmeringTextProps: 'ShimmeringTextProps' },
    unmapped: [],
  },
  'texts/sliding-number': {
    module: 'primitives/texts/sliding-number',
    values: { SlidingNumber: 'SlidingNumber' },
    types: { SlidingNumberProps: 'SlidingNumberProps' },
    unmapped: [],
  },
  'texts/splitting': {
    module: 'primitives/texts/splitting',
    values: { SplittingText: 'SplittingText' },
    types: { SplittingTextProps: 'SplittingTextProps' },
    unmapped: [],
  },
  'texts/typing': {
    module: 'primitives/texts/typing',
    values: { TypingText: 'TypingText', TypingTextCursor: 'TypingTextCursor' },
    types: {
      TypingTextCursorProps: 'TypingTextCursorProps',
      TypingTextProps: 'TypingTextProps',
    },
    unmapped: [],
  },
  'effects/auto-height': {
    module: 'primitives/effects/auto-height',
    values: { AutoHeight: 'AutoHeight' },
    types: { AutoHeightProps: 'AutoHeightProps' },
    unmapped: [],
  },
  'effects/blur': {
    module: 'primitives/effects/blur',
    values: { Blur: 'Blur', Blurs: 'Blurs' },
    types: { BlurListProps: 'BlurListProps', BlurProps: 'BlurProps' },
    unmapped: [],
  },
  'effects/click': {
    module: 'primitives/effects/click',
    values: { Click: 'Click' },
    types: { ClickProps: 'ClickProps', ClickVariant: 'ClickVariant' },
    unmapped: [],
  },
  'effects/effect': {
    module: 'primitives/effects/effect',
    values: { Effect: 'Effect', Effects: 'Effects' },
    types: {
      EffectProps: 'EffectProps',
      EffectsProps: 'EffectsProps',
      Fade: 'Fade',
      Slide: 'Slide',
      SlideDirection: 'SlideDirection',
      Zoom: 'Zoom',
    },
    unmapped: [],
  },
  'effects/fade': {
    module: 'primitives/effects/fade',
    values: { Fade: 'Fade', Fades: 'Fades' },
    types: { FadeListProps: 'FadeListProps', FadeProps: 'FadeProps' },
    unmapped: [],
  },
  'effects/highlight': {
    module: 'primitives/effects/highlight',
    values: {
      Highlight: 'Highlight',
      HighlightItem: 'HighlightItem',
      useHighlight: 'useHighlight',
    },
    types: {
      HighlightItemProps: 'HighlightItemProps',
      HighlightProps: 'HighlightProps',
    },
    unmapped: [],
  },
  'effects/image-zoom': {
    module: 'primitives/effects/image-zoom',
    values: { Image: 'Image', ImageZoom: 'ImageZoom' },
    types: {},
    unmapped: [],
  },
  'effects/magnetic': {
    module: 'primitives/effects/magnetic',
    values: { Magnetic: 'Magnetic' },
    types: { MagneticProps: 'MagneticProps' },
    unmapped: [],
  },
  'effects/particles': {
    module: 'primitives/effects/particles',
    values: { Particles: 'Particles', ParticlesEffect: 'ParticlesEffect' },
    types: {
      ParticlesEffectProps: 'ParticlesEffectProps',
      ParticlesProps: 'ParticlesProps',
    },
    unmapped: [],
  },
  'effects/shine': {
    module: 'primitives/effects/shine',
    values: { Shine: 'Shine' },
    types: { ShineProps: 'ShineProps' },
    unmapped: [],
  },
  'effects/slide': {
    module: 'primitives/effects/slide',
    values: { Slide: 'Slide', Slides: 'Slides' },
    types: {
      SlideDirection: 'SlideDirection',
      SlideListProps: 'SlideListProps',
      SlideProps: 'SlideProps',
    },
    unmapped: [],
  },
  'effects/theme-toggler': {
    module: 'primitives/effects/theme-toggler',
    values: { ThemeToggler: 'ThemeToggler' },
    types: {
      Direction: 'Direction',
      Resolved: 'Resolved',
      ThemeSelection: 'ThemeSelection',
      ThemeTogglerProps: 'ThemeTogglerProps',
    },
    unmapped: [],
  },
  'effects/tilt': {
    module: 'primitives/effects/tilt',
    values: { Tilt: 'Tilt', TiltContent: 'TiltContent' },
    types: { TiltContentProps: 'TiltContentProps', TiltProps: 'TiltProps' },
    unmapped: [],
  },
  'effects/zoom': {
    module: 'primitives/effects/zoom',
    values: { Zoom: 'Zoom', Zooms: 'Zooms' },
    types: { ZoomListProps: 'ZoomListProps', ZoomProps: 'ZoomProps' },
    unmapped: [],
  },
  'buttons/button': {
    module: 'primitives/buttons/button',
    values: { Button: 'Button' },
    types: { ButtonProps: 'ButtonProps' },
    unmapped: [],
  },
  'buttons/flip': {
    module: 'primitives/buttons/flip',
    values: {
      FlipButton: 'FlipButton',
      FlipButtonBack: 'FlipButtonBack',
      FlipButtonFront: 'FlipButtonFront',
      useFlipButton: 'useFlipButton',
    },
    types: {
      FlipButtonBackProps: 'FlipButtonBackProps',
      FlipButtonContextType: 'FlipButtonContextType',
      FlipButtonFrontProps: 'FlipButtonFrontProps',
      FlipButtonProps: 'FlipButtonProps',
      FlipDirection: 'FlipDirection',
    },
    unmapped: [],
  },
  'buttons/liquid': {
    module: 'primitives/buttons/liquid',
    values: { LiquidButton: 'LiquidButton' },
    types: { LiquidButtonProps: 'LiquidButtonProps' },
    unmapped: [],
  },
  'buttons/ripple': {
    module: 'primitives/buttons/ripple',
    values: {
      RippleButton: 'RippleButton',
      RippleButtonRipples: 'RippleButtonRipples',
    },
    types: {
      RippleButtonProps: 'RippleButtonProps',
      RippleButtonRipplesProps: 'RippleButtonRipplesProps',
    },
    unmapped: [],
  },
  'animate/avatar-group': {
    module: 'primitives/avatar-group',
    values: {
      AvatarGroup: 'AvatarGroup',
      AvatarGroupTooltip: 'AvatarGroupTooltip',
      AvatarGroupTooltipArrow: 'AvatarGroupTooltipArrow',
    },
    types: {
      AvatarGroupProps: 'AvatarGroupProps',
      AvatarGroupTooltipArrowProps: 'AvatarGroupTooltipArrowProps',
      AvatarGroupTooltipProps: 'AvatarGroupTooltipProps',
    },
    unmapped: [],
  },
  'animate/code-block': {
    module: 'primitives/code-block',
    values: { CodeBlock: 'CodeBlock' },
    types: { CodeBlockProps: 'CodeBlockProps' },
    unmapped: [],
  },
  'animate/cursor': {
    module: 'primitives/cursor',
    values: {
      Cursor: 'Cursor',
      CursorContainer: 'CursorContainer',
      CursorFollow: 'CursorFollow',
      CursorProvider: 'CursorProvider',
      useCursor: 'useCursor',
    },
    types: {
      CursorContainerProps: 'CursorContainerProps',
      CursorContextType: 'CursorContextType',
      CursorFollowAlign: 'CursorFollowAlign',
      CursorFollowProps: 'CursorFollowProps',
      CursorFollowSide: 'CursorFollowSide',
      CursorProps: 'CursorProps',
      CursorProviderProps: 'CursorProviderProps',
    },
    unmapped: [],
  },
  'animate/github-stars': {
    module: 'primitives/github-stars',
    values: {
      GithubStars: 'GithubStars',
      GithubStarsIcon: 'GithubStarsIcon',
      GithubStarsLogo: 'GithubStarsLogo',
      GithubStarsNumber: 'GithubStarsNumber',
      GithubStarsParticles: 'GithubStarsParticles',
      useGithubStars: 'useGithubStars',
    },
    types: {
      GithubStarsContextType: 'GithubStarsContextType',
      GithubStarsIconProps: 'GithubStarsIconProps',
      GithubStarsLogoProps: 'GithubStarsLogoProps',
      GithubStarsNumberProps: 'GithubStarsNumberProps',
      GithubStarsParticlesProps: 'GithubStarsParticlesProps',
      GithubStarsProps: 'GithubStarsProps',
    },
    unmapped: [],
  },
  'animate/motion-grid': {
    module: 'primitives/motion-grid',
    values: { MotionGrid: 'MotionGrid', MotionGridCells: 'MotionGridCells' },
    types: {
      Frame: 'Frame',
      FrameDot: 'FrameDot',
      Frames: 'Frames',
      MotionGridCellsProps: 'MotionGridCellsProps',
      MotionGridProps: 'MotionGridProps',
    },
    unmapped: [],
  },
  'animate/pinned-list': {
    module: 'primitives/pinned-list',
    values: {
      PinnedList: 'PinnedList',
      PinnedListItem: 'PinnedListItem',
      PinnedListItems: 'PinnedListItems',
      PinnedListLabel: 'PinnedListLabel',
      PinnedListPinned: 'PinnedListPinned',
      PinnedListTrigger: 'PinnedListTrigger',
      PinnedListUnpinned: 'PinnedListUnpinned',
      usePinnedList: 'usePinnedList',
      usePinnedListItem: 'usePinnedListItem',
    },
    types: {
      PinnedListContextType: 'PinnedListContextType',
      PinnedListItemContextType: 'PinnedListItemContextType',
      PinnedListItemProps: 'PinnedListItemProps',
      PinnedListItemsProps: 'PinnedListItemsProps',
      PinnedListLabelProps: 'PinnedListLabelProps',
      PinnedListPinnedProps: 'PinnedListPinnedProps',
      PinnedListProps: 'PinnedListProps',
      PinnedListTriggerProps: 'PinnedListTriggerProps',
      PinnedListUnpinnedProps: 'PinnedListUnpinnedProps',
    },
    unmapped: [],
  },
  'animate/scroll-progress': {
    module: 'primitives/scroll-progress',
    values: {
      ScrollProgress: 'ScrollProgress',
      ScrollProgressContainer: 'ScrollProgressContainer',
      ScrollProgressProvider: 'ScrollProgressProvider',
      useScrollProgress: 'useScrollProgress',
    },
    types: {
      ScrollProgressContainerProps: 'ScrollProgressContainerProps',
      ScrollProgressContextType: 'ScrollProgressContextType',
      ScrollProgressDirection: 'ScrollProgressDirection',
      ScrollProgressMode: 'ScrollProgressMode',
      ScrollProgressProps: 'ScrollProgressProps',
      ScrollProgressProviderProps: 'ScrollProgressProviderProps',
    },
    unmapped: [],
  },
  'animate/spring': {
    module: 'primitives/spring',
    values: {
      Spring: 'Spring',
      SpringElement: 'SpringElement',
      SpringProvider: 'SpringProvider',
      useSpring: 'useSpring',
    },
    types: {
      SpringContextType: 'SpringContextType',
      SpringElementProps: 'SpringElementProps',
      SpringPathConfig: 'SpringPathConfig',
      SpringProps: 'SpringProps',
      SpringProviderProps: 'SpringProviderProps',
    },
    unmapped: [],
  },
  'animate/tabs': {
    module: 'primitives/tabs',
    values: {
      Tabs: 'Tabs',
      TabsContent: 'TabsContent',
      TabsContents: 'TabsContents',
      TabsHighlight: 'TabsHighlight',
      TabsHighlightItem: 'TabsHighlightItem',
      TabsList: 'TabsList',
      TabsTrigger: 'TabsTrigger',
      useTabs: 'useTabs',
    },
    types: {
      TabsContentProps: 'TabsContentProps',
      TabsContentsProps: 'TabsContentsProps',
      TabsContextType: 'TabsContextType',
      TabsHighlightItemProps: 'TabsHighlightItemProps',
      TabsHighlightProps: 'TabsHighlightProps',
      TabsListProps: 'TabsListProps',
      TabsProps: 'TabsProps',
      TabsTriggerProps: 'TabsTriggerProps',
    },
    unmapped: [],
  },
  'animate/tooltip': {
    module: 'primitives/tooltip',
    values: {
      Tooltip: 'Tooltip',
      TooltipArrow: 'TooltipArrow',
      TooltipContent: 'TooltipContent',
      TooltipProvider: 'TooltipProvider',
      TooltipTrigger: 'TooltipTrigger',
      useGlobalTooltip: 'useGlobalTooltip',
      useTooltip: 'useTooltip',
    },
    types: {
      GlobalTooltipContextType: 'GlobalTooltipContextType',
      TooltipArrowProps: 'TooltipArrowProps',
      TooltipContentProps: 'TooltipContentProps',
      TooltipContextType: 'TooltipContextType',
      TooltipPosition: 'TooltipPosition',
      TooltipProps: 'TooltipProps',
      TooltipProviderProps: 'TooltipProviderProps',
      TooltipTriggerProps: 'TooltipTriggerProps',
    },
    unmapped: [],
  },
  'animate/slot': {
    module: 'primitives/slot',
    values: { Slot: 'Slot' },
    types: {
      SlotProps: 'SlotProps',
      WithAsChild: 'WithAsChild',
      DOMMotionProps: 'DOMMotionProps',
      AnyProps: 'AnyProps',
    },
    unmapped: [],
  },
  'radix/accordion': {
    module: 'primitives/radix-ui/accordion',
    values: {
      Accordion: 'Root',
      AccordionItem: 'Item',
      AccordionHeader: 'Header',
      AccordionTrigger: 'Trigger',
      AccordionContent: 'Content',
    },
    types: {
      AccordionProps: 'ComponentProps<Root>',
      AccordionItemProps: 'AccordionItemProps',
      AccordionHeaderProps: 'AccordionHeaderProps',
      AccordionTriggerProps: 'AccordionTriggerProps',
      AccordionContentProps: 'AccordionContentProps',
    },
    unmapped: [
      'useAccordion',
      'useAccordionItem',
      'AccordionContextType',
      'AccordionItemContextType',
    ],
  },
  'radix/alert-dialog': {
    module: 'primitives/radix-ui/alert-dialog',
    values: {
      AlertDialog: 'Root',
      AlertDialogPortal: 'Portal',
      AlertDialogOverlay: 'Overlay',
      AlertDialogCancel: 'Cancel',
      AlertDialogAction: 'Action',
      AlertDialogTrigger: 'Trigger',
      AlertDialogContent: 'Content',
      AlertDialogTitle: 'Title',
      AlertDialogDescription: 'Description',
    },
    types: {
      AlertDialogProps: 'AlertDialogProps',
      AlertDialogTriggerProps: 'AlertDialogTriggerProps',
      AlertDialogPortalProps: 'AlertDialogPortalProps',
      AlertDialogCancelProps: 'AlertDialogCancelProps',
      AlertDialogActionProps: 'AlertDialogActionProps',
      AlertDialogOverlayProps: 'AlertDialogOverlayProps',
      AlertDialogContentProps: 'AlertDialogContentProps',
      AlertDialogTitleProps: 'AlertDialogTitleProps',
      AlertDialogDescriptionProps: 'AlertDialogDescriptionProps',
      AlertDialogFlipDirection: 'AlertDialogFlipDirection',
    },
    unmapped: [
      'AlertDialogHeader',
      'AlertDialogFooter',
      'useAlertDialog',
      'AlertDialogHeaderProps',
      'AlertDialogFooterProps',
      'AlertDialogContextType',
    ],
  },
  'radix/checkbox': {
    module: 'primitives/radix-ui/checkbox',
    values: {
      Checkbox: 'Root',
      CheckboxIndicator: 'Indicator',
    },
    types: {
      CheckboxProps: 'CheckboxProps',
      CheckboxIndicatorProps: 'CheckboxIndicatorProps',
    },
    unmapped: ['useCheckbox', 'CheckboxContextType'],
  },
  'radix/collapsible': {
    module: 'primitives/radix-ui/collapsible',
    values: {
      Collapsible: 'Root',
      CollapsibleTrigger: 'Trigger',
      CollapsibleContent: 'Content',
    },
    types: {
      CollapsibleProps: 'CollapsibleProps',
      CollapsibleTriggerProps: 'CollapsibleTriggerProps',
      CollapsibleContentProps: 'CollapsibleContentProps',
    },
    unmapped: ['useCollapsible', 'CollapsibleContextType'],
  },
  'radix/dialog': {
    module: 'primitives/radix-ui/dialog',
    values: {
      Dialog: 'Root',
      DialogPortal: 'Portal',
      DialogOverlay: 'Overlay',
      DialogClose: 'Close',
      DialogTrigger: 'Trigger',
      DialogContent: 'Content',
      DialogTitle: 'Title',
      DialogDescription: 'Description',
    },
    types: {
      DialogProps: 'DialogProps',
      DialogTriggerProps: 'DialogTriggerProps',
      DialogPortalProps: 'DialogPortalProps',
      DialogCloseProps: 'DialogCloseProps',
      DialogOverlayProps: 'DialogOverlayProps',
      DialogContentProps: 'DialogContentProps',
      DialogTitleProps: 'DialogTitleProps',
      DialogDescriptionProps: 'DialogDescriptionProps',
      DialogFlipDirection: 'DialogFlipDirection',
    },
    unmapped: [
      'DialogHeader',
      'DialogFooter',
      'useDialog',
      'DialogHeaderProps',
      'DialogFooterProps',
      'DialogContextType',
    ],
  },
  'radix/dropdown-menu': {
    module: 'primitives/radix-ui/dropdown-menu',
    values: {
      DropdownMenu: 'Root',
      DropdownMenuTrigger: 'Trigger',
      DropdownMenuContent: 'Content',
      DropdownMenuItem: 'Item',
      DropdownMenuItemIndicator: 'ItemIndicator',
      DropdownMenuCheckboxItem: 'CheckboxItem',
      DropdownMenuRadioItem: 'RadioItem',
      DropdownMenuLabel: 'Label',
      DropdownMenuSeparator: 'Separator',
      DropdownMenuGroup: 'Group',
      DropdownMenuPortal: 'Portal',
      DropdownMenuSub: 'Sub',
      DropdownMenuSubContent: 'SubContent',
      DropdownMenuSubTrigger: 'SubTrigger',
      DropdownMenuRadioGroup: 'RadioGroup',
    },
    types: {
      DropdownMenuProps: 'DropdownMenuProps',
      DropdownMenuTriggerProps: 'DropdownMenuTriggerProps',
      DropdownMenuContentProps: 'DropdownMenuContentProps',
      DropdownMenuItemProps: 'DropdownMenuItemProps',
      DropdownMenuItemIndicatorProps: 'DropdownMenuItemIndicatorProps',
      DropdownMenuCheckboxItemProps: 'DropdownMenuCheckboxItemProps',
      DropdownMenuRadioItemProps: 'DropdownMenuRadioItemProps',
      DropdownMenuLabelProps: 'DropdownMenuLabelProps',
      DropdownMenuSeparatorProps: 'DropdownMenuSeparatorProps',
      DropdownMenuGroupProps: 'DropdownMenuGroupProps',
      DropdownMenuPortalProps: 'DropdownMenuPortalProps',
      DropdownMenuSubProps: 'DropdownMenuSubProps',
      DropdownMenuSubContentProps: 'DropdownMenuSubContentProps',
      DropdownMenuSubTriggerProps: 'DropdownMenuSubTriggerProps',
      DropdownMenuRadioGroupProps: 'DropdownMenuRadioGroupProps',
    },
    unmapped: [
      'DropdownMenuHighlight',
      'DropdownMenuHighlightItem',
      'DropdownMenuShortcut',
      'useDropdownMenu',
      'useDropdownMenuSub',
      'DropdownMenuHighlightProps',
      'DropdownMenuHighlightItemProps',
      'DropdownMenuShortcutProps',
      'DropdownMenuContextType',
      'DropdownMenuSubContextType',
    ],
  },
  'radix/hover-card': {
    module: 'primitives/radix-ui/hover-card',
    values: {
      HoverCard: 'Root',
      HoverCardTrigger: 'Trigger',
      HoverCardPortal: 'Portal',
      HoverCardContent: 'Content',
      HoverCardArrow: 'Arrow',
    },
    types: {
      HoverCardProps: 'HoverCardProps',
      HoverCardTriggerProps: 'HoverCardTriggerProps',
      HoverCardPortalProps: 'HoverCardPortalProps',
      HoverCardContentProps: 'HoverCardContentProps',
      HoverCardArrowProps: 'HoverCardArrowProps',
    },
    unmapped: ['useHoverCard', 'HoverCardContextType'],
  },
  'radix/popover': {
    module: 'primitives/radix-ui/popover',
    values: {
      Popover: 'Root',
      PopoverTrigger: 'Trigger',
      PopoverPortal: 'Portal',
      PopoverContent: 'Content',
      PopoverAnchor: 'Anchor',
      PopoverClose: 'Close',
      PopoverArrow: 'Arrow',
    },
    types: {
      PopoverProps: 'PopoverProps',
      PopoverTriggerProps: 'PopoverTriggerProps',
      PopoverPortalProps: 'PopoverPortalProps',
      PopoverContentProps: 'PopoverContentProps',
      PopoverAnchorProps: 'PopoverAnchorProps',
      PopoverCloseProps: 'PopoverCloseProps',
      PopoverArrowProps: 'PopoverArrowProps',
    },
    unmapped: ['usePopover', 'PopoverContextType'],
  },
  'radix/progress': {
    module: 'primitives/radix-ui/progress',
    values: {
      Progress: 'Root',
      ProgressIndicator: 'Indicator',
    },
    types: {
      ProgressProps: 'ProgressProps',
      ProgressIndicatorProps: 'ProgressIndicatorProps',
    },
    unmapped: ['useProgress', 'ProgressContextType'],
  },
  'radix/radio-group': {
    module: 'primitives/radix-ui/radio-group',
    values: {
      RadioGroup: 'Root',
      RadioGroupItem: 'Item',
      RadioGroupIndicator: 'Indicator',
    },
    types: {
      RadioGroupProps: 'RadioGroupProps',
      RadioGroupItemProps: 'RadioGroupItemProps',
      RadioGroupIndicatorProps: 'RadioGroupIndicatorProps',
    },
    unmapped: [
      'useRadioGroup',
      'useRadioGroupItem',
      'RadioGroupContextType',
      'RadioGroupItemContextType',
    ],
  },
  'radix/sheet': {
    module: 'primitives/radix-ui/dialog',
    values: {
      Sheet: 'Root',
      SheetPortal: 'Portal',
      SheetOverlay: 'Overlay',
      SheetTrigger: 'Trigger',
      SheetClose: 'Close',
      SheetContent: 'Content',
      SheetTitle: 'Title',
      SheetDescription: 'Description',
    },
    types: {
      SheetProps: 'DialogProps',
      SheetPortalProps: 'DialogPortalProps',
      SheetOverlayProps: 'DialogOverlayProps',
      SheetTriggerProps: 'DialogTriggerProps',
      SheetCloseProps: 'DialogCloseProps',
      // v1's `side`, which v2 reads as `data-side`: v1 components take it.
      SheetContentProps:
        "DialogContentProps & { side?: 'top' | 'right' | 'bottom' | 'left' }",
      SheetTitleProps: 'DialogTitleProps',
      SheetDescriptionProps: 'DialogDescriptionProps',
    },
    unmapped: [
      'useSheet',
      'SheetHeader',
      'SheetFooter',
      'SheetHeaderProps',
      'SheetFooterProps',
    ],
  },
  'radix/switch': {
    module: 'primitives/radix-ui/switch',
    values: {
      Switch: 'Root',
      SwitchThumb: 'Thumb',
    },
    types: {
      SwitchProps: 'SwitchProps',
      SwitchThumbProps: 'SwitchThumbProps',
    },
    unmapped: [
      'SwitchIcon',
      'useSwitch',
      'SwitchIconProps',
      'SwitchIconPosition',
      'SwitchContextType',
    ],
  },
  'radix/tabs': {
    module: 'primitives/radix-ui/tabs',
    values: {
      Tabs: 'Root',
      TabsList: 'List',
      TabsTrigger: 'Trigger',
      TabsContent: 'Content',
    },
    types: {
      TabsProps: 'TabsProps',
      TabsListProps: 'TabsListProps',
      TabsTriggerProps: 'TabsTriggerProps',
      TabsContentProps: 'TabsContentProps',
    },
    unmapped: [
      'TabsHighlight',
      'TabsHighlightItem',
      'TabsContents',
      'TabsHighlightProps',
      'TabsHighlightItemProps',
      'TabsContentsProps',
    ],
  },
  'radix/toggle': {
    module: 'primitives/radix-ui/toggle',
    values: {
      Toggle: 'Root',
    },
    types: {
      ToggleProps: 'ToggleProps',
    },
    unmapped: [
      'ToggleHighlight',
      'ToggleItem',
      'useToggle',
      'ToggleHighlightProps',
      'ToggleItemProps',
      'ToggleContextType',
    ],
  },
  'radix/toggle-group': {
    module: 'primitives/radix-ui/toggle-group',
    values: {
      ToggleGroup: 'Root',
      ToggleGroupItem: 'Item',
    },
    types: {
      ToggleGroupProps: 'ComponentProps<Root>',
      ToggleGroupItemProps: 'ToggleGroupItemProps',
    },
    unmapped: [
      'ToggleGroupHighlight',
      'ToggleGroupHighlightItem',
      'useToggleGroup',
      'ToggleGroupHighlightProps',
      'ToggleGroupHighlightItemProps',
      'ToggleGroupContextType',
    ],
  },
  'radix/tooltip': {
    module: 'primitives/radix-ui/tooltip',
    values: {
      TooltipProvider: 'Provider',
      Tooltip: 'Root',
      TooltipTrigger: 'Trigger',
      TooltipPortal: 'Portal',
      TooltipContent: 'Content',
      TooltipArrow: 'Arrow',
    },
    types: {
      TooltipProviderProps: 'TooltipProviderProps',
      TooltipProps: 'TooltipProps',
      TooltipTriggerProps: 'TooltipTriggerProps',
      TooltipPortalProps: 'TooltipPortalProps',
      TooltipContentProps: 'TooltipContentProps',
      TooltipArrowProps: 'TooltipArrowProps',
    },
    unmapped: ['useTooltip', 'TooltipContextType'],
  },
  'base/accordion': {
    module: 'primitives/base-ui/accordion',
    values: {
      Accordion: 'Accordion.Root',
      AccordionItem: 'Accordion.Item',
      AccordionHeader: 'Accordion.Header',
      AccordionTrigger: 'Accordion.Trigger',
      AccordionPanel: 'Accordion.Panel',
    },
    types: {
      AccordionProps: 'Accordion.Root.Props',
      AccordionItemProps: 'Accordion.Item.Props',
      AccordionHeaderProps: 'Accordion.Header.Props',
      AccordionTriggerProps: 'Accordion.Trigger.Props',
      AccordionPanelProps: 'Accordion.Panel.Props',
    },
    unmapped: ['useAccordionItem', 'AccordionItemContextType'],
  },
  'base/alert-dialog': {
    module: 'primitives/base-ui/alert-dialog',
    values: {
      AlertDialog: 'AlertDialog.Root',
      AlertDialogPortal: 'AlertDialog.Portal',
      AlertDialogBackdrop: 'AlertDialog.Backdrop',
      AlertDialogClose: 'AlertDialog.Close',
      AlertDialogTrigger: 'AlertDialog.Trigger',
      AlertDialogPopup: 'AlertDialog.Popup',
      AlertDialogTitle: 'AlertDialog.Title',
      AlertDialogDescription: 'AlertDialog.Description',
    },
    types: {
      AlertDialogProps: 'AlertDialog.Root.Props',
      AlertDialogTriggerProps: 'AlertDialog.Trigger.Props',
      AlertDialogPortalProps: 'AlertDialog.Portal.Props',
      AlertDialogCloseProps: 'AlertDialog.Close.Props',
      AlertDialogBackdropProps: 'AlertDialog.Backdrop.Props',
      AlertDialogPopupProps: 'AlertDialog.Popup.Props',
      AlertDialogTitleProps: 'AlertDialog.Title.Props',
      AlertDialogDescriptionProps: 'AlertDialog.Description.Props',
      AlertDialogFlipDirection: 'AlertDialogFlipDirection',
    },
    unmapped: [
      'AlertDialogHeader',
      'AlertDialogFooter',
      'useAlertDialog',
      'AlertDialogHeaderProps',
      'AlertDialogFooterProps',
      'AlertDialogContextType',
    ],
  },
  'base/checkbox': {
    module: 'primitives/base-ui/checkbox',
    values: {
      Checkbox: 'Checkbox.Root',
      CheckboxIndicator: 'Checkbox.Indicator',
    },
    types: {
      CheckboxProps: 'Checkbox.Root.Props',
      CheckboxIndicatorProps: 'Checkbox.Indicator.Props',
    },
    unmapped: ['useCheckbox', 'CheckboxContextType'],
  },
  'base/collapsible': {
    module: 'primitives/base-ui/collapsible',
    values: {
      Collapsible: 'Collapsible.Root',
      CollapsibleTrigger: 'Collapsible.Trigger',
      CollapsiblePanel: 'Collapsible.Panel',
    },
    types: {
      CollapsibleProps: 'Collapsible.Root.Props',
      CollapsibleTriggerProps: 'Collapsible.Trigger.Props',
      CollapsiblePanelProps: 'Collapsible.Panel.Props',
    },
    unmapped: ['useCollapsible', 'CollapsibleContextType'],
  },
  'base/dialog': {
    module: 'primitives/base-ui/dialog',
    values: {
      Dialog: 'Dialog.Root',
      DialogPortal: 'Dialog.Portal',
      DialogBackdrop: 'Dialog.Backdrop',
      DialogClose: 'Dialog.Close',
      DialogTrigger: 'Dialog.Trigger',
      DialogPopup: 'Dialog.Popup',
      DialogTitle: 'Dialog.Title',
      DialogDescription: 'Dialog.Description',
    },
    types: {
      DialogProps: 'Dialog.Root.Props',
      DialogTriggerProps: 'Dialog.Trigger.Props',
      DialogPortalProps: 'Dialog.Portal.Props',
      DialogCloseProps: 'Dialog.Close.Props',
      DialogBackdropProps: 'Dialog.Backdrop.Props',
      DialogPopupProps: 'Dialog.Popup.Props',
      DialogTitleProps: 'Dialog.Title.Props',
      DialogDescriptionProps: 'Dialog.Description.Props',
      DialogFlipDirection: 'DialogFlipDirection',
    },
    unmapped: [
      'DialogHeader',
      'DialogFooter',
      'useDialog',
      'DialogHeaderProps',
      'DialogFooterProps',
      'DialogContextType',
    ],
  },
  'base/menu': {
    module: 'primitives/base-ui/menu',
    values: {
      Menu: 'Menu.Root',
      MenuTrigger: 'Menu.Trigger',
      MenuPortal: 'Menu.Portal',
      MenuPositioner: 'Menu.Positioner',
      MenuPopup: 'Menu.Popup',
      MenuArrow: 'Menu.Arrow',
      MenuItem: 'Menu.Item',
      MenuCheckboxItem: 'Menu.CheckboxItem',
      MenuCheckboxItemIndicator: 'Menu.CheckboxItemIndicator',
      MenuRadioGroup: 'Menu.RadioGroup',
      MenuRadioItem: 'Menu.RadioItem',
      MenuRadioItemIndicator: 'Menu.RadioItemIndicator',
      MenuGroup: 'Menu.Group',
      MenuGroupLabel: 'Menu.GroupLabel',
      MenuSeparator: 'Menu.Separator',
      MenuSubmenu: 'Menu.SubmenuRoot',
      MenuSubmenuTrigger: 'Menu.SubmenuTrigger',
    },
    types: {
      MenuProps: 'Menu.Root.Props',
      MenuTriggerProps: 'Menu.Trigger.Props',
      MenuPortalProps: 'Menu.Portal.Props',
      MenuPositionerProps: 'Menu.Positioner.Props',
      MenuPopupProps: 'Menu.Popup.Props',
      MenuArrowProps: 'Menu.Arrow.Props',
      MenuItemProps: 'Menu.Item.Props',
      MenuCheckboxItemProps: 'Menu.CheckboxItem.Props',
      MenuCheckboxItemIndicatorProps: 'Menu.CheckboxItemIndicator.Props',
      MenuRadioItemProps: 'Menu.RadioItem.Props',
      MenuRadioItemIndicatorProps: 'Menu.RadioItemIndicator.Props',
      MenuRadioGroupProps: 'Menu.RadioGroup.Props',
      MenuGroupProps: 'Menu.Group.Props',
      MenuGroupLabelProps: 'Menu.GroupLabel.Props',
      MenuSeparatorProps: 'Menu.Separator.Props',
      MenuSubmenuProps: 'Menu.SubmenuRoot.Props',
      MenuSubmenuTriggerProps: 'Menu.SubmenuTrigger.Props',
    },
    unmapped: [
      'MenuShortcut',
      'MenuHighlight',
      'MenuHighlightItem',
      'useMenuActiveValue',
      'useMenu',
      'MenuShortcutProps',
      'MenuHighlightProps',
      'MenuHighlightItemProps',
      'MenuActiveValueContextType',
      'MenuContextType',
    ],
  },
  'base/popover': {
    module: 'primitives/base-ui/popover',
    values: {
      Popover: 'Popover.Root',
      PopoverTrigger: 'Popover.Trigger',
      PopoverPortal: 'Popover.Portal',
      PopoverPositioner: 'Popover.Positioner',
      PopoverPopup: 'Popover.Popup',
      PopoverBackdrop: 'Popover.Backdrop',
      PopoverArrow: 'Popover.Arrow',
      PopoverTitle: 'Popover.Title',
      PopoverDescription: 'Popover.Description',
      PopoverClose: 'Popover.Close',
    },
    types: {
      PopoverProps: 'Popover.Root.Props',
      PopoverTriggerProps: 'Popover.Trigger.Props',
      PopoverPortalProps: 'Popover.Portal.Props',
      PopoverPositionerProps: 'Popover.Positioner.Props',
      PopoverPopupProps: 'Popover.Popup.Props',
      PopoverBackdropProps: 'Popover.Backdrop.Props',
      PopoverArrowProps: 'Popover.Arrow.Props',
      PopoverTitleProps: 'Popover.Title.Props',
      PopoverDescriptionProps: 'Popover.Description.Props',
      PopoverCloseProps: 'Popover.Close.Props',
    },
    unmapped: ['usePopover', 'PopoverContextType'],
  },
  'base/preview-card': {
    module: 'primitives/base-ui/preview-card',
    values: {
      PreviewCard: 'PreviewCard.Root',
      PreviewCardTrigger: 'PreviewCard.Trigger',
      PreviewCardPortal: 'PreviewCard.Portal',
      PreviewCardPositioner: 'PreviewCard.Positioner',
      PreviewCardPopup: 'PreviewCard.Popup',
      PreviewCardBackdrop: 'PreviewCard.Backdrop',
      PreviewCardArrow: 'PreviewCard.Arrow',
    },
    types: {
      PreviewCardProps: 'PreviewCard.Root.Props',
      PreviewCardTriggerProps: 'PreviewCard.Trigger.Props',
      PreviewCardPortalProps: 'PreviewCard.Portal.Props',
      PreviewCardPositionerProps: 'PreviewCard.Positioner.Props',
      PreviewCardPopupProps: 'PreviewCard.Popup.Props',
      PreviewCardBackdropProps: 'PreviewCard.Backdrop.Props',
      PreviewCardArrowProps: 'PreviewCard.Arrow.Props',
    },
    unmapped: ['usePreviewCard', 'PreviewCardContextType'],
  },
  'base/progress': {
    module: 'primitives/base-ui/progress',
    values: {
      Progress: 'Progress.Root',
      ProgressIndicator: 'Progress.Indicator',
      ProgressTrack: 'Progress.Track',
      ProgressLabel: 'Progress.Label',
      ProgressValue: 'Progress.Value',
    },
    types: {
      ProgressProps: 'Progress.Root.Props',
      ProgressIndicatorProps: 'Progress.Indicator.Props',
      ProgressTrackProps: 'Progress.Track.Props',
      ProgressLabelProps: 'Progress.Label.Props',
      ProgressValueProps: 'Progress.Value.Props',
    },
    unmapped: ['useProgress', 'ProgressContextType'],
  },
  'base/radio': {
    module: 'primitives/base-ui/radio',
    values: {
      RadioGroup: 'primitives/base-ui/radio-group#RadioGroup',
      Radio: 'Radio.Root',
      RadioIndicator: 'Radio.Indicator',
    },
    types: {
      RadioGroupProps: 'primitives/base-ui/radio-group#RadioGroup.Props',
      RadioProps: 'Radio.Root.Props',
      RadioIndicatorProps: 'Radio.Indicator.Props',
    },
    unmapped: [
      'useRadioGroup',
      'useRadio',
      'RadioGroupContextType',
      'RadioContextType',
    ],
  },
  'base/switch': {
    module: 'primitives/base-ui/switch',
    values: {
      Switch: 'Switch.Root',
      SwitchThumb: 'Switch.Thumb',
    },
    types: {
      SwitchProps: 'Switch.Root.Props',
      SwitchThumbProps: 'Switch.Thumb.Props',
    },
    unmapped: [
      'SwitchIcon',
      'useSwitch',
      'SwitchIconProps',
      'SwitchIconPosition',
      'SwitchContextType',
    ],
  },
  'base/tabs': {
    module: 'primitives/base-ui/tabs',
    values: {
      Tabs: 'Tabs.Root',
      TabsList: 'Tabs.List',
      TabsTab: 'Tabs.Tab',
      TabsPanel: 'Tabs.Panel',
    },
    types: {
      TabsProps: 'Tabs.Root.Props',
      TabsListProps: 'Tabs.List.Props',
      TabsTabProps: 'Tabs.Tab.Props',
      TabsPanelProps: 'Tabs.Panel.Props',
    },
    unmapped: [
      'TabsHighlight',
      'TabsHighlightItem',
      'TabsPanels',
      'TabsHighlightProps',
      'TabsHighlightItemProps',
      'TabsPanelsProps',
    ],
  },
  'base/toggle': {
    module: 'primitives/base-ui/toggle',
    values: {
      Toggle: 'Toggle',
    },
    types: {
      ToggleProps: 'Toggle.Props',
    },
    unmapped: [
      'ToggleHighlight',
      'ToggleItem',
      'useToggle',
      'ToggleHighlightProps',
      'ToggleItemProps',
      'ToggleContextType',
    ],
  },
  'base/toggle-group': {
    module: 'primitives/base-ui/toggle-group',
    values: {
      ToggleGroup: 'ToggleGroup',
      Toggle: 'primitives/base-ui/toggle#Toggle',
    },
    types: {
      ToggleGroupProps: 'ToggleGroup.Props',
      ToggleProps: 'primitives/base-ui/toggle#Toggle.Props',
    },
    unmapped: [
      'ToggleGroupHighlight',
      'ToggleHighlight',
      'useToggleGroup',
      'ToggleGroupHighlightProps',
      'ToggleHighlightProps',
      'ToggleGroupContextType',
    ],
  },
  'base/tooltip': {
    module: 'primitives/base-ui/tooltip',
    values: {
      TooltipProvider: 'Tooltip.Provider',
      Tooltip: 'Tooltip.Root',
      TooltipTrigger: 'Tooltip.Trigger',
      TooltipPortal: 'Tooltip.Portal',
      TooltipPositioner: 'Tooltip.Positioner',
      TooltipPopup: 'Tooltip.Popup',
      TooltipArrow: 'Tooltip.Arrow',
    },
    types: {
      TooltipProviderProps: 'Tooltip.Provider.Props',
      TooltipProps: 'Tooltip.Root.Props',
      TooltipTriggerProps: 'Tooltip.Trigger.Props',
      TooltipPortalProps: 'Tooltip.Portal.Props',
      TooltipPositionerProps: 'Tooltip.Positioner.Props',
      TooltipPopupProps: 'Tooltip.Popup.Props',
      TooltipArrowProps: 'Tooltip.Arrow.Props',
    },
    unmapped: ['useTooltip', 'TooltipContextType'],
  },
};

/** v1 primitives with no v2 equivalent: their files stay the user's. */
export const UNSUPPORTED_PRIMITIVES = [
  'radix/files',
  'radix/preview-link-card',
  'base/files',
  'base/preview-link-card',
];

/** Headless UI is dropped in v2. */
export const HEADLESS_PRIMITIVES = [
  'checkbox',
  'dialog',
  'disclosure',
  'popover',
  'switch',
  'tabs',
];

const PRESSED_ANIMATION: Record<string, PropRule> = {
  pressedAnimation: {
    manual:
      'v2 animates the press itself (pass `transition` to time it). Drop the prop.',
  },
};

const PORTAL_CONTAINER: Record<string, PropRule> = {
  container: {
    manual:
      'v1 rendered its own Portal: move `container` to a Portal around the sub-content.',
  },
};

/** v1 rendered a motion element; the v2 part isn't animated. */
const NOT_ANIMATED: Record<string, PropRule> = {
  transition: {
    manual:
      "this part isn't animated in v2 (v1 rendered a motion element): drop it.",
  },
};

const CHECKBOX_INDICATOR =
  "v1 drew its own animated check (an <svg>); v2's Indicator animates what you put in it: add your check icon as its child.";

const CHECKBOX_PRESS =
  "v2's checkbox doesn't scale (v1 scaled it to 0.95 when pressed and 1.05 on hover): its check, and your box's fill, answer the click.";

const HOVER_SCALE =
  "v2's buttons answer the press, not the hover: they no longer grow on hover (v1 scaled them to 1.05). Set `hoverScale={1.05}` to keep v1's hover.";

// v1's Base UI primitives were built on @base-ui-components/react
// 1.0.0-beta.4. Base UI 1 (@base-ui/react, which v2 uses) renamed, moved or
// inverted some of their props, and changed some defaults.

/** Base UI 1 renamed `loop` to `loopFocus`. */
const LOOP_FOCUS: Record<string, PropRule> = { loop: { rename: 'loopFocus' } };

/** Base UI 1 moved these props from the Root to the trigger. */
function movedToTrigger(trigger: string, props: string[], or = '') {
  return Object.fromEntries(
    props.map((prop): [string, PropRule] => [
      prop,
      {
        manual: `Base UI 1 moved it to the trigger: move it to <${trigger}>${or}.`,
      },
    ]),
  );
}

/** Base UI 1 replaced a boolean with its opposite. */
function inverted(prop: string, replacement: string): Record<string, PropRule> {
  return {
    [prop]: {
      manual: `Base UI 1 replaced it with \`${replacement}\`: \`${prop}={false}\` becomes \`${replacement}\`, otherwise drop it (the default).`,
    },
  };
}

const TRACK_ANCHOR = inverted('trackAnchor', 'disableAnchorTracking');

/** v1's ProgressValue rendered a CountingNumber, and took its props. */
const COUNTING_NUMBER: Record<string, PropRule> = Object.fromEntries(
  [
    'fromNumber',
    'padStart',
    'decimalSeparator',
    'decimalPlaces',
    'delay',
    'initiallyStable',
    'inView',
    'inViewMargin',
    'inViewOnce',
    'transition',
  ].map((prop): [string, PropRule] => [
    prop,
    {
      manual:
        "v1's ProgressValue counted with a CountingNumber; v2's is Base UI's Value: pass it to a CountingNumber rendered as its child (`{(_, value) => <CountingNumber number={value ?? 0} />}`), or drop it.",
    },
  ]),
);

const EXTRAS: Record<string, Partial<Migration>> = {
  'radix/accordion': {
    props: { AccordionContent: { keepRendered: { rename: 'forceMount' } } },
  },
  'radix/collapsible': {
    props: { CollapsibleContent: { keepRendered: { rename: 'forceMount' } } },
  },
  'base/accordion': {
    props: {
      Accordion: LOOP_FOCUS,
      AccordionPanel: { keepRendered: { rename: 'keepMounted' } },
    },
    // Base UI's beta opened several items at once by default.
    defaults: { Accordion: { multiple: 'multiple' } },
  },
  'base/collapsible': {
    props: { CollapsiblePanel: { keepRendered: { rename: 'keepMounted' } } },
  },
  'base/dialog': {
    props: {
      Dialog: inverted('dismissible', 'disablePointerDismissal'),
    },
  },
  'base/tooltip': {
    props: {
      Tooltip: {
        ...movedToTrigger(
          'TooltipTrigger',
          ['delay', 'closeDelay'],
          ' (or set it on <TooltipProvider>)',
        ),
        ...inverted('hoverable', 'disableHoverablePopup'),
      },
      TooltipPositioner: TRACK_ANCHOR,
    },
    notes: {
      TooltipProps:
        "`TooltipProps` is Base UI 1's Tooltip.Root props: `delay` and `closeDelay` moved to <TooltipTrigger> (<TooltipProvider> keeps them) and `hoverable` became `disableHoverablePopup`: update the types that read them.",
    },
  },
  'base/preview-card': {
    props: {
      PreviewCard: movedToTrigger('PreviewCardTrigger', [
        'delay',
        'closeDelay',
      ]),
      PreviewCardPositioner: TRACK_ANCHOR,
    },
  },
  'base/popover': {
    props: {
      Popover: movedToTrigger('PopoverTrigger', [
        'openOnHover',
        'delay',
        'closeDelay',
      ]),
      PopoverPositioner: TRACK_ANCHOR,
    },
  },
  'base/menu': {
    props: {
      Menu: {
        ...LOOP_FOCUS,
        ...movedToTrigger('MenuTrigger', [
          'openOnHover',
          'delay',
          'closeDelay',
        ]),
      },
      MenuSubmenu: {
        ...LOOP_FOCUS,
        ...movedToTrigger('MenuSubmenuTrigger', [
          'openOnHover',
          'delay',
          'closeDelay',
        ]),
      },
      MenuPositioner: TRACK_ANCHOR,
      MenuItem: NOT_ANIMATED,
      MenuSubmenuTrigger: NOT_ANIMATED,
    },
  },
  'base/tabs': {
    props: { TabsList: LOOP_FOCUS },
    // Base UI's beta activated a tab when it got focus.
    defaults: { TabsList: { activateOnFocus: 'activateOnFocus' } },
    notes: {
      TabsTab:
        "Base UI 1 requires `value` on every tab (its beta fell back to the index) and renamed the selected tab's `data-selected` to `data-active`: give each tab a value and update your `data-[selected]` styles.",
      TabsPanel:
        'Base UI 1 requires `value` on every panel (its beta fell back to the index): give each panel the value of its tab.',
    },
  },
  'base/toggle-group': { props: { ToggleGroup: LOOP_FOCUS } },
  'radix/switch': { props: { SwitchThumb: PRESSED_ANIMATION } },
  'base/switch': { props: { SwitchThumb: PRESSED_ANIMATION } },
  'radix/checkbox': {
    notes: { Checkbox: CHECKBOX_PRESS, CheckboxIndicator: CHECKBOX_INDICATOR },
  },
  'base/checkbox': {
    notes: { Checkbox: CHECKBOX_PRESS, CheckboxIndicator: CHECKBOX_INDICATOR },
  },
  'radix/dropdown-menu': {
    wrap: { DropdownMenuContent: { in: 'Portal', move: ['container'] } },
    props: {
      DropdownMenuSubContent: PORTAL_CONTAINER,
      DropdownMenuItem: NOT_ANIMATED,
      DropdownMenuCheckboxItem: NOT_ANIMATED,
      DropdownMenuRadioItem: NOT_ANIMATED,
      DropdownMenuSubTrigger: NOT_ANIMATED,
    },
  },
  'radix/sheet': {
    props: { SheetContent: { side: { rename: 'data-side' } } },
    defaults: { SheetContent: { side: 'data-side="right"' } },
    notes: {
      SheetContent:
        "v1 placed the sheet at its edge itself (position: fixed); v2's Dialog.Content only slides from its `data-side`: keep the positioning classes (shadcn/ui's Sheet has them).",
    },
  },
  'buttons/button': { notes: { Button: HOVER_SCALE } },
  'buttons/ripple': { notes: { RippleButton: HOVER_SCALE } },
  'buttons/liquid': { notes: { LiquidButton: HOVER_SCALE } },
  'base/progress': {
    props: { ProgressValue: COUNTING_NUMBER },
    notes: {
      ProgressValue:
        "v1's ProgressValue counted up to the value (a CountingNumber); v2's is Base UI's Value.",
    },
  },
};

for (const [id, extra] of Object.entries(EXTRAS)) {
  Object.assign(PRIMITIVES[id]!, extra);
}

/**
 * v1 libs, hooks and the icon core, by location: `icons/icon` under the
 * components alias (`components/animate-ui/icons/icon`), the others under the
 * `lib` and `hooks` aliases.
 */
export const UTILITIES: Record<string, Migration> = {
  'icons/icon': {
    module: 'icons',
    values: {
      pathClassName: 'pathClassName',
      staticAnimations: 'staticAnimations',
      AnimateIcon: 'AnimateIcon',
      IconWrapper: 'IconWrapper',
      useAnimateIconContext: 'useAnimateIconContext',
      getVariants: 'getVariants',
    },
    types: {
      IconProps: 'IconProps',
      IconWrapperProps: 'IconWrapperProps',
      AnimateIconProps: 'AnimateIconProps',
      AnimateIconContextValue: 'AnimateIconContextValue',
    },
    unmapped: [],
  },
  'lib/get-strict-context': {
    module: 'utils/strict-context',
    values: { getStrictContext: 'getStrictContext' },
    types: {},
    unmapped: [],
  },
  'hooks/use-controlled-state': {
    module: 'utils/use-controlled-state',
    values: { useControlledState: 'useControlledState' },
    types: {},
    unmapped: [],
  },
  'hooks/use-is-in-view': {
    module: 'utils/use-is-in-view',
    values: { useIsInView: 'useIsInView' },
    types: { UseIsInViewOptions: 'UseIsInViewOptions' },
    unmapped: [],
  },
};

/**
 * v1 hooks v2 doesn't ship (its primitives keep theirs private). They only
 * import React and Motion: the files stay the user's and keep working.
 */
export const UNSUPPORTED_UTILITIES = [
  'hooks/use-auto-height',
  'hooks/use-data-state',
  'hooks/use-motion-value-state',
];
