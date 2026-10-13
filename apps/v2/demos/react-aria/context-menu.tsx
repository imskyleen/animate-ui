"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import {
  composeRenderProps,
  Header as HeaderPrimitive,
  MenuItem as MenuItemPrimitive,
  Menu as MenuPrimitive,
  MenuSection as MenuSectionPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  SelectionIndicator,
  SubmenuTrigger as SubmenuTriggerPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuSectionProps as MenuSectionPrimitiveProps,
} from "@animate-ui/react/primitives/react-aria"

import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Pressable } from "@animate-ui/react/primitives/react-aria"
import { AnimateUIProvider } from "@animate-ui/react/provider"

function ContextMenu({
  "data-slot": dataSlot = "context-menu-content",
  placement = "bottom start",
  offset = 4,
  crossOffset = 0,
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof MenuPrimitive<object>>,
  "children" | "className"
> &
  Pick<
    React.ComponentProps<typeof PopoverPrimitive>,
    "placement" | "offset" | "crossOffset"
  > & {
    "data-slot"?: string
    className?: string
    children?: React.ReactNode
  }) {
  return (
    <PopoverPrimitive
      data-slot={dataSlot}
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cn(
        "ring-foreground/10 bg-popover text-popover-foreground min-w-36 rounded-lg p-1 shadow-md ring-1 animate-none! relative bg-popover/70 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-item]:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[variant=destructive]:focus:bg-foreground/10! **:data-[variant=destructive]:text-accent-foreground! **:data-[variant=destructive]:**:text-accent-foreground! **:data-[slot$=-item]:data-focused:bg-foreground/10 z-50 w-(--trigger-width) origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto outline-none data-exiting:overflow-hidden",
        className
      )}
    >
      <MenuPrimitive
        className="max-h-[inherit] overflow-x-hidden overflow-y-auto outline-hidden"
        {...props}
      >
        {children}
      </MenuPrimitive>
    </PopoverPrimitive>
  )
}

function ContextMenuTrigger({
  ...props
}: Omit<React.ComponentProps<typeof MenuTriggerPrimitive>, "trigger">) {
  return (
    <MenuTriggerPrimitive
      data-slot="context-menu"
      trigger="contextMenu"
      {...props}
    />
  )
}

function ContextMenuGroup({
  ...props
}: Omit<MenuSectionPrimitiveProps<object>, "children"> & {
  children?: React.ReactNode
}) {
  return <MenuSectionPrimitive data-slot="context-menu-group" {...props} />
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof HeaderPrimitive> & {
  inset?: boolean
}) {
  return (
    <HeaderPrimitive
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("text-muted-foreground px-1.5 py-1 text-xs font-medium data-inset:pl-7", className)}
      {...props}
    />
  )
}

const contextMenuItemVariants = cva(
  "group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      selectionMode: {
        none: "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive focus:*:[svg]:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        single: "focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
        multiple: "focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
  }
)

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: MenuItemPrimitiveProps<object> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuItemPrimitive
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      textValue={typeof children === "string" ? children : props.textValue}
      className={composeRenderProps(className, (className, { selectionMode }) =>
        cn(contextMenuItemVariants({ selectionMode }), className)
      )}
      {...props}
    >
      {composeRenderProps(
        children,
        (children, { selectionMode }) => (
          <>
            {selectionMode !== "none" ? (
              <SelectionIndicator
                className="absolute right-2 pointer-events-none"
                data-slot={
                  selectionMode === "single"
                    ? "context-menu-radio-item-indicator"
                    : "context-menu-checkbox-item-indicator"
                }
              >
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2}
                />
              </SelectionIndicator>
            ) : null}
            {children}
          </>
        )
      )}
    </MenuItemPrimitive>
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof SubmenuTriggerPrimitive>) {
  return <SubmenuTriggerPrimitive data-slot="context-menu-sub" {...props} />
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuItemPrimitiveProps<object> & {
  inset?: boolean
}) {
  return (
    <MenuItemPrimitive
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      textValue={typeof children === "string" ? children : props.textValue}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <>
          {children}
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2}
            className="ml-auto"
          />
        </>
      ))}
    </MenuItemPrimitive>
  )
}

function ContextMenuSubContent({
  placement = "end top",
  crossOffset = -3,
  offset = 0,
  className,
  ...props
}: React.ComponentProps<typeof ContextMenu>) {
  return (
    <ContextMenu
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground min-w-32 rounded-lg border p-1 shadow-lg animate-none! relative bg-popover/70 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150 **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-item]:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[variant=destructive]:focus:bg-foreground/10! **:data-[variant=destructive]:text-accent-foreground! **:data-[variant=destructive]:**:text-accent-foreground! w-auto",
        className
      )}
      placement={placement}
      crossOffset={crossOffset}
      offset={offset}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("text-muted-foreground group-focus/context-menu-item:text-accent-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
}

export const controls = {
  AnimateUIProvider: {
    checkAnimation: { value: "draw", options: { draw: "draw", pop: "pop" } },
  },
}

export default function ContextMenuDemo({
  checkAnimation = "draw",
}: {
  checkAnimation?: "draw" | "pop"
}) {
  return (
    <AnimateUIProvider checkAnimation={checkAnimation}>
      <ContextMenuTrigger>
        <Pressable>
          <div
            role="button"
            className="flex aspect-video w-full max-w-xs items-center justify-center rounded-xl border border-dashed text-sm"
          >
            <span className="hidden pointer-fine:inline-block">
              Right click here
            </span>
            <span className="hidden pointer-coarse:inline-block">
              Long press here
            </span>
          </div>
        </Pressable>
        <ContextMenu className="w-48">
          <ContextMenuGroup>
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem isDisabled>
              Forward
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44">
                <ContextMenuGroup>
                  <ContextMenuItem>Save Page...</ContextMenuItem>
                  <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                  <ContextMenuItem>Name Window...</ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem>Developer Tools</ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup
            selectionMode="multiple"
            defaultSelectedKeys={["bookmarks"]}
          >
            <ContextMenuItem id="bookmarks">Show Bookmarks</ContextMenuItem>
            <ContextMenuItem id="urls">Show Full URLs</ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup
            selectionMode="single"
            defaultSelectedKeys={["pedro"]}
          >
            <ContextMenuLabel>People</ContextMenuLabel>
            <ContextMenuItem id="pedro">Pedro Duarte</ContextMenuItem>
            <ContextMenuItem id="colm">Colm Tuite</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenu>
      </ContextMenuTrigger>
    </AnimateUIProvider>
  )
}
