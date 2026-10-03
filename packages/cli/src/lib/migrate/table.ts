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
 * - `Select.Root.Props<Value = unknown>`: a generic type: the local alias
 *   declares these parameters and passes them on.
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
    },
    unmapped: [
      'AlertDialogHeader',
      'AlertDialogFooter',
      'useAlertDialog',
      'AlertDialogHeaderProps',
      'AlertDialogFooterProps',
      'AlertDialogContextType',
      'AlertDialogFlipDirection',
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
  'radix/context-menu': {
    module: 'primitives/radix-ui/context-menu',
    values: {
      ContextMenu: 'Root',
      ContextMenuTrigger: 'Trigger',
      ContextMenuPortal: 'Portal',
      ContextMenuContent: 'Content',
      ContextMenuItem: 'Item',
      ContextMenuCheckboxItem: 'CheckboxItem',
      ContextMenuRadioGroup: 'RadioGroup',
      ContextMenuRadioItem: 'RadioItem',
      ContextMenuItemIndicator: 'ItemIndicator',
      ContextMenuLabel: 'Label',
      ContextMenuSeparator: 'Separator',
      ContextMenuGroup: 'Group',
      ContextMenuSub: 'Sub',
      ContextMenuSubTrigger: 'SubTrigger',
      ContextMenuSubContent: 'SubContent',
    },
    types: {
      ContextMenuProps: 'ContextMenuProps',
      ContextMenuTriggerProps: 'ContextMenuTriggerProps',
      ContextMenuPortalProps: 'ContextMenuPortalProps',
      ContextMenuContentProps: 'ContextMenuContentProps',
      ContextMenuItemProps: 'ContextMenuItemProps',
      ContextMenuCheckboxItemProps: 'ContextMenuCheckboxItemProps',
      ContextMenuRadioGroupProps: 'ContextMenuRadioGroupProps',
      ContextMenuRadioItemProps: 'ContextMenuRadioItemProps',
      ContextMenuItemIndicatorProps: 'ContextMenuItemIndicatorProps',
      ContextMenuLabelProps: 'ContextMenuLabelProps',
      ContextMenuSeparatorProps: 'ContextMenuSeparatorProps',
      ContextMenuGroupProps: 'ContextMenuGroupProps',
      ContextMenuSubProps: 'ContextMenuSubProps',
      ContextMenuSubTriggerProps: 'ContextMenuSubTriggerProps',
      ContextMenuSubContentProps: 'ContextMenuSubContentProps',
    },
    unmapped: [
      'ContextMenuHighlight',
      'ContextMenuHighlightItem',
      'ContextMenuShortcut',
      'useContextMenu',
      'useContextMenuSub',
      'ContextMenuHighlightProps',
      'ContextMenuHighlightItemProps',
      'ContextMenuShortcutProps',
      'ContextMenuContextType',
      'ContextMenuSubContextType',
    ],
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
    },
    unmapped: [
      'DialogHeader',
      'DialogFooter',
      'useDialog',
      'DialogHeaderProps',
      'DialogFooterProps',
      'DialogContextType',
      'DialogFlipDirection',
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
  'radix/select': {
    module: 'primitives/radix-ui/select',
    values: {
      Select: 'Root',
      SelectTrigger: 'Trigger',
      SelectValue: 'Value',
      SelectIcon: 'Icon',
      SelectPortal: 'Portal',
      SelectContent: 'Content',
      SelectViewport: 'Viewport',
      SelectGroup: 'Group',
      SelectLabel: 'Label',
      SelectItem: 'Item',
      SelectItemText: 'ItemText',
      SelectItemIndicator: 'ItemIndicator',
      SelectSeparator: 'Separator',
      SelectScrollUpButton: 'ScrollUpButton',
      SelectScrollDownButton: 'ScrollDownButton',
      SelectArrow: 'Arrow',
    },
    types: {
      SelectProps: 'SelectProps',
      SelectTriggerProps: 'SelectTriggerProps',
      SelectValueProps: 'SelectValueProps',
      SelectIconProps: 'SelectIconProps',
      SelectPortalProps: 'SelectPortalProps',
      SelectContentProps: 'SelectContentProps',
      SelectViewportProps: 'SelectViewportProps',
      SelectGroupProps: 'SelectGroupProps',
      SelectLabelProps: 'SelectLabelProps',
      SelectItemProps: 'SelectItemProps',
      SelectItemTextProps: 'SelectItemTextProps',
      SelectItemIndicatorProps: 'SelectItemIndicatorProps',
      SelectSeparatorProps: 'SelectSeparatorProps',
      SelectScrollUpButtonProps: 'SelectScrollUpButtonProps',
      SelectScrollDownButtonProps: 'SelectScrollDownButtonProps',
      SelectArrowProps: 'SelectArrowProps',
    },
    unmapped: ['useSelect', 'SelectContextType'],
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
      SheetContentProps: 'DialogContentProps',
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
  'radix/slider': {
    module: 'primitives/radix-ui/slider',
    values: {
      Slider: 'Root',
      SliderTrack: 'Track',
      SliderRange: 'Range',
      SliderThumb: 'Thumb',
    },
    types: {
      SliderProps: 'SliderProps',
      SliderTrackProps: 'SliderTrackProps',
      SliderRangeProps: 'SliderRangeProps',
      SliderThumbProps: 'SliderThumbProps',
    },
    unmapped: ['useSlider', 'SliderContextType'],
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
    },
    unmapped: [
      'AlertDialogHeader',
      'AlertDialogFooter',
      'useAlertDialog',
      'AlertDialogHeaderProps',
      'AlertDialogFooterProps',
      'AlertDialogContextType',
      'AlertDialogFlipDirection',
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
  'base/combobox': {
    module: 'primitives/base-ui/combobox',
    values: {
      Combobox: 'Combobox.Root',
      ComboboxLabel: 'Combobox.Label',
      ComboboxValue: 'Combobox.Value',
      ComboboxInputGroup: 'Combobox.InputGroup',
      ComboboxInput: 'Combobox.Input',
      ComboboxTrigger: 'Combobox.Trigger',
      ComboboxIcon: 'Combobox.Icon',
      ComboboxClear: 'Combobox.Clear',
      ComboboxChips: 'Combobox.Chips',
      ComboboxChip: 'Combobox.Chip',
      ComboboxChipRemove: 'Combobox.ChipRemove',
      ComboboxPortal: 'Combobox.Portal',
      ComboboxBackdrop: 'Combobox.Backdrop',
      ComboboxPositioner: 'Combobox.Positioner',
      ComboboxPopup: 'Combobox.Popup',
      ComboboxArrow: 'Combobox.Arrow',
      ComboboxStatus: 'Combobox.Status',
      ComboboxEmpty: 'Combobox.Empty',
      ComboboxList: 'Combobox.List',
      ComboboxRow: 'Combobox.Row',
      ComboboxCollection: 'Combobox.Collection',
      ComboboxItem: 'Combobox.Item',
      ComboboxItemIndicator: 'Combobox.ItemIndicator',
      ComboboxGroup: 'Combobox.Group',
      ComboboxGroupLabel: 'Combobox.GroupLabel',
      ComboboxSeparator: 'Combobox.Separator',
      useComboboxFilter: 'Combobox.useFilter',
    },
    types: {
      ComboboxProps:
        'Combobox.Root.Props<Value = unknown, Multiple extends boolean | undefined = false>',
      ComboboxLabelProps: 'Combobox.Label.Props',
      ComboboxValueProps: 'Combobox.Value.Props',
      ComboboxInputGroupProps: 'Combobox.InputGroup.Props',
      ComboboxInputProps: 'Combobox.Input.Props',
      ComboboxTriggerProps: 'Combobox.Trigger.Props',
      ComboboxIconProps: 'Combobox.Icon.Props',
      ComboboxClearProps: 'Combobox.Clear.Props',
      ComboboxChipsProps: 'Combobox.Chips.Props',
      ComboboxChipProps: 'Combobox.Chip.Props',
      ComboboxChipRemoveProps: 'Combobox.ChipRemove.Props',
      ComboboxPortalProps: 'Combobox.Portal.Props',
      ComboboxBackdropProps: 'Combobox.Backdrop.Props',
      ComboboxPositionerProps: 'Combobox.Positioner.Props',
      ComboboxPopupProps: 'Combobox.Popup.Props',
      ComboboxArrowProps: 'Combobox.Arrow.Props',
      ComboboxStatusProps: 'Combobox.Status.Props',
      ComboboxEmptyProps: 'Combobox.Empty.Props',
      ComboboxListProps: 'Combobox.List.Props',
      ComboboxRowProps: 'Combobox.Row.Props',
      ComboboxCollectionProps: 'Combobox.Collection.Props',
      ComboboxItemProps: 'Combobox.Item.Props',
      ComboboxItemIndicatorProps: 'Combobox.ItemIndicator.Props',
      ComboboxGroupProps: 'Combobox.Group.Props',
      ComboboxGroupLabelProps: 'Combobox.GroupLabel.Props',
      ComboboxSeparatorProps: 'Combobox.Separator.Props',
    },
    unmapped: ['useCombobox', 'ComboboxContextType'],
  },
  'base/context-menu': {
    module: 'primitives/base-ui/context-menu',
    values: {
      ContextMenu: 'ContextMenu.Root',
      ContextMenuTrigger: 'ContextMenu.Trigger',
      ContextMenuPortal: 'ContextMenu.Portal',
      ContextMenuPositioner: 'ContextMenu.Positioner',
      ContextMenuPopup: 'ContextMenu.Popup',
      ContextMenuArrow: 'ContextMenu.Arrow',
      ContextMenuItem: 'ContextMenu.Item',
      ContextMenuCheckboxItem: 'ContextMenu.CheckboxItem',
      ContextMenuCheckboxItemIndicator: 'ContextMenu.CheckboxItemIndicator',
      ContextMenuRadioGroup: 'ContextMenu.RadioGroup',
      ContextMenuRadioItem: 'ContextMenu.RadioItem',
      ContextMenuRadioItemIndicator: 'ContextMenu.RadioItemIndicator',
      ContextMenuGroup: 'ContextMenu.Group',
      ContextMenuGroupLabel: 'ContextMenu.GroupLabel',
      ContextMenuSeparator: 'ContextMenu.Separator',
      ContextMenuSubmenu: 'ContextMenu.SubmenuRoot',
      ContextMenuSubmenuTrigger: 'ContextMenu.SubmenuTrigger',
    },
    types: {
      ContextMenuProps: 'ContextMenu.Root.Props',
      ContextMenuTriggerProps: 'ContextMenu.Trigger.Props',
      ContextMenuPortalProps: 'ContextMenu.Portal.Props',
      ContextMenuPositionerProps: 'ContextMenu.Positioner.Props',
      ContextMenuPopupProps: 'ContextMenu.Popup.Props',
      ContextMenuArrowProps: 'ContextMenu.Arrow.Props',
      ContextMenuItemProps: 'ContextMenu.Item.Props',
      ContextMenuCheckboxItemProps: 'ContextMenu.CheckboxItem.Props',
      ContextMenuCheckboxItemIndicatorProps:
        'ContextMenu.CheckboxItemIndicator.Props',
      ContextMenuRadioGroupProps: 'ContextMenu.RadioGroup.Props',
      ContextMenuRadioItemProps: 'ContextMenu.RadioItem.Props',
      ContextMenuRadioItemIndicatorProps:
        'ContextMenu.RadioItemIndicator.Props',
      ContextMenuGroupProps: 'ContextMenu.Group.Props',
      ContextMenuGroupLabelProps: 'ContextMenu.GroupLabel.Props',
      ContextMenuSeparatorProps: 'ContextMenu.Separator.Props',
      ContextMenuSubmenuProps: 'ContextMenu.SubmenuRoot.Props',
      ContextMenuSubmenuTriggerProps: 'ContextMenu.SubmenuTrigger.Props',
    },
    unmapped: [
      'ContextMenuHighlight',
      'ContextMenuHighlightItem',
      'ContextMenuShortcut',
      'useContextMenu',
      'useContextMenuActiveValue',
      'ContextMenuHighlightProps',
      'ContextMenuHighlightItemProps',
      'ContextMenuShortcutProps',
      'ContextMenuActiveValueContextType',
      'ContextMenuContextType',
    ],
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
    },
    unmapped: [
      'DialogHeader',
      'DialogFooter',
      'useDialog',
      'DialogHeaderProps',
      'DialogFooterProps',
      'DialogContextType',
      'DialogFlipDirection',
    ],
  },
  'base/drawer': {
    module: 'primitives/base-ui/drawer',
    values: {
      Drawer: 'Drawer.Root',
      DrawerTrigger: 'Drawer.Trigger',
      DrawerSwipeArea: 'Drawer.SwipeArea',
      DrawerPortal: 'Drawer.Portal',
      DrawerBackdrop: 'Drawer.Backdrop',
      DrawerViewport: 'Drawer.Viewport',
      DrawerPopup: 'Drawer.Popup',
      DrawerContent: 'Drawer.Content',
      DrawerClose: 'Drawer.Close',
      DrawerTitle: 'Drawer.Title',
      DrawerDescription: 'Drawer.Description',
      createDrawerHandle: 'Drawer.createHandle',
    },
    types: {
      DrawerProps: 'Drawer.Root.Props',
      DrawerTriggerProps: 'Drawer.Trigger.Props',
      DrawerSwipeAreaProps: 'Drawer.SwipeArea.Props',
      DrawerPortalProps: 'Drawer.Portal.Props',
      DrawerBackdropProps: 'Drawer.Backdrop.Props',
      DrawerViewportProps: 'Drawer.Viewport.Props',
      DrawerPopupProps: 'Drawer.Popup.Props',
      DrawerContentProps: 'Drawer.Content.Props',
      DrawerCloseProps: 'Drawer.Close.Props',
      DrawerTitleProps: 'Drawer.Title.Props',
      DrawerDescriptionProps: 'Drawer.Description.Props',
    },
    unmapped: [
      'DrawerHeader',
      'DrawerFooter',
      'DrawerHeaderProps',
      'DrawerFooterProps',
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
  'base/select': {
    module: 'primitives/base-ui/select',
    values: {
      Select: 'Select.Root',
      SelectLabel: 'Select.Label',
      SelectTrigger: 'Select.Trigger',
      SelectValue: 'Select.Value',
      SelectIcon: 'Select.Icon',
      SelectPortal: 'Select.Portal',
      SelectBackdrop: 'Select.Backdrop',
      SelectPositioner: 'Select.Positioner',
      SelectPopup: 'Select.Popup',
      SelectList: 'Select.List',
      SelectItem: 'Select.Item',
      SelectItemText: 'Select.ItemText',
      SelectItemIndicator: 'Select.ItemIndicator',
      SelectArrow: 'Select.Arrow',
      SelectScrollUpArrow: 'Select.ScrollUpArrow',
      SelectScrollDownArrow: 'Select.ScrollDownArrow',
      SelectGroup: 'Select.Group',
      SelectGroupLabel: 'Select.GroupLabel',
      SelectSeparator: 'Select.Separator',
    },
    types: {
      SelectProps:
        'Select.Root.Props<Value = unknown, Multiple extends boolean | undefined = false>',
      SelectLabelProps: 'Select.Label.Props',
      SelectTriggerProps: 'Select.Trigger.Props',
      SelectValueProps: 'Select.Value.Props',
      SelectIconProps: 'Select.Icon.Props',
      SelectPortalProps: 'Select.Portal.Props',
      SelectBackdropProps: 'Select.Backdrop.Props',
      SelectPositionerProps: 'Select.Positioner.Props',
      SelectPopupProps: 'Select.Popup.Props',
      SelectListProps: 'Select.List.Props',
      SelectItemProps: 'Select.Item.Props',
      SelectItemTextProps: 'Select.ItemText.Props',
      SelectItemIndicatorProps: 'Select.ItemIndicator.Props',
      SelectArrowProps: 'Select.Arrow.Props',
      SelectScrollUpArrowProps: 'Select.ScrollUpArrow.Props',
      SelectScrollDownArrowProps: 'Select.ScrollDownArrow.Props',
      SelectGroupProps: 'Select.Group.Props',
      SelectGroupLabelProps: 'Select.GroupLabel.Props',
      SelectSeparatorProps: 'Select.Separator.Props',
    },
    unmapped: ['useSelect', 'SelectContextType'],
  },
  'base/slider': {
    module: 'primitives/base-ui/slider',
    values: {
      Slider: 'Slider.Root',
      SliderLabel: 'Slider.Label',
      SliderValue: 'Slider.Value',
      SliderControl: 'Slider.Control',
      SliderTrack: 'Slider.Track',
      SliderIndicator: 'Slider.Indicator',
      SliderThumb: 'Slider.Thumb',
    },
    types: {
      SliderProps:
        'Slider.Root.Props<Value extends number | readonly number[] = number | readonly number[]>',
      SliderLabelProps: 'Slider.Label.Props',
      SliderValueProps: 'Slider.Value.Props',
      SliderControlProps: 'Slider.Control.Props',
      SliderTrackProps: 'Slider.Track.Props',
      SliderIndicatorProps: 'Slider.Indicator.Props',
      SliderThumbProps: 'Slider.Thumb.Props',
    },
    unmapped: ['useSlider', 'SliderContextType'],
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
  'base/toast': {
    module: 'primitives/base-ui/toast',
    values: {
      ToastProvider: 'Toast.Provider',
      ToastPortal: 'Toast.Portal',
      ToastViewport: 'Toast.Viewport',
      Toast: 'Toast.Root',
      ToastContent: 'Toast.Content',
      ToastTitle: 'Toast.Title',
      ToastDescription: 'Toast.Description',
      ToastAction: 'Toast.Action',
      ToastClose: 'Toast.Close',
      useToastManager: 'Toast.useToastManager',
      createToastManager: 'Toast.createToastManager',
    },
    types: {
      ToastProviderProps: 'Toast.Provider.Props',
      ToastPortalProps: 'Toast.Portal.Props',
      ToastViewportProps: 'Toast.Viewport.Props',
      ToastProps: 'Toast.Root.Props',
      ToastContentProps: 'Toast.Content.Props',
      ToastTitleProps: 'Toast.Title.Props',
      ToastDescriptionProps: 'Toast.Description.Props',
      ToastActionProps: 'Toast.Action.Props',
      ToastCloseProps: 'Toast.Close.Props',
      ToastObject: 'Toast.Root.ToastObject',
      ToastManager: 'ToastManager',
    },
    unmapped: ['ToastPosition'],
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
  'base/otp-field',
  'base/preview-link-card',
];

/** Headless UI is dropped in v2. */
export const HEADLESS_PRIMITIVES = [
  'checkbox',
  'combobox',
  'dialog',
  'disclosure',
  'popover',
  'switch',
  'tabs',
];

const FOLLOW_CURSOR: Record<string, PropRule> = {
  followCursor: {
    manual:
      'v2 keeps the library API: following the cursor is gone. Drop the prop.',
  },
  followCursorSpringOptions: {
    manual:
      'v2 keeps the library API: following the cursor is gone. Drop the prop.',
  },
};

const FLIP: Record<string, PropRule> = {
  from: {
    manual:
      "v1's opt-in 3D flip is gone: v2 scales the content in. Drop the prop.",
  },
};

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

const CHECKBOX_INDICATOR =
  "v1 drew its own animated check (an <svg>); v2's Indicator animates what you put in it: add your check icon as its child.";

const EXTRAS: Record<string, Partial<Migration>> = {
  'radix/accordion': {
    props: { AccordionContent: { keepRendered: { rename: 'forceMount' } } },
  },
  'radix/collapsible': {
    props: { CollapsibleContent: { keepRendered: { rename: 'forceMount' } } },
  },
  'base/accordion': {
    props: { AccordionPanel: { keepRendered: { rename: 'keepMounted' } } },
  },
  'base/collapsible': {
    props: { CollapsiblePanel: { keepRendered: { rename: 'keepMounted' } } },
  },
  'radix/dialog': { props: { DialogContent: FLIP } },
  'radix/alert-dialog': { props: { AlertDialogContent: FLIP } },
  'base/dialog': { props: { DialogPopup: FLIP } },
  'base/alert-dialog': { props: { AlertDialogPopup: FLIP } },
  'radix/tooltip': { props: { Tooltip: FOLLOW_CURSOR } },
  'radix/hover-card': { props: { HoverCard: FOLLOW_CURSOR } },
  'base/tooltip': { props: { Tooltip: FOLLOW_CURSOR } },
  'base/preview-card': { props: { PreviewCard: FOLLOW_CURSOR } },
  'radix/switch': { props: { SwitchThumb: PRESSED_ANIMATION } },
  'base/switch': { props: { SwitchThumb: PRESSED_ANIMATION } },
  'radix/checkbox': { notes: { CheckboxIndicator: CHECKBOX_INDICATOR } },
  'base/checkbox': { notes: { CheckboxIndicator: CHECKBOX_INDICATOR } },
  'radix/dropdown-menu': {
    wrap: { DropdownMenuContent: { in: 'Portal', move: ['container'] } },
    props: { DropdownMenuSubContent: PORTAL_CONTAINER },
  },
  'radix/context-menu': {
    wrap: { ContextMenuContent: { in: 'Portal', move: ['container'] } },
    props: { ContextMenuSubContent: PORTAL_CONTAINER },
  },
  'radix/sheet': {
    props: { SheetContent: { side: { rename: 'data-side' } } },
    defaults: { SheetContent: { side: 'data-side="right"' } },
    notes: {
      SheetContent:
        "v1 placed the sheet at its edge itself (position: fixed); v2's Dialog.Content only slides from its `data-side`: keep the positioning classes (shadcn/ui's Sheet has them).",
    },
  },
  'base/progress': {
    notes: {
      ProgressValue:
        "v1's ProgressValue counted up to the value (a CountingNumber); v2's is Base UI's Value.",
    },
  },
  'base/toast': {
    props: {
      ToastViewport: {
        position: {
          manual:
            "v1's `position` placed the toasts and set their swipe direction: position the viewport with classes and pass `swipeDirection` to each Toast.",
        },
      },
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
      useIconVariants: 'useIconVariants',
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
  'lib/motion': {
    module: 'utils/motion',
    values: {
      motionTokens: 'motionTokens',
      tempo: 'motionTokens.tempo',
      ease: 'ease',
      duration: 'duration',
      spring: 'spring',
      scale: 'scale',
      transition: 'transition',
      ReducedMotionConfig: 'ReducedMotionConfig',
      useShouldReduceMotion: 'useShouldReduceMotion',
    },
    types: { ReducedMotionConfigProps: 'ReducedMotionConfigProps' },
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
  'hooks/use-page-visible': {
    module: 'utils/use-page-visible',
    values: { usePageVisible: 'usePageVisible' },
    types: {},
    unmapped: [],
  },
};
