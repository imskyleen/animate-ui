'use client';

import {
  ChevronRight,
  CreditCard,
  Keyboard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuHighlight,
  DropdownMenuHighlightItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/registry/primitives/radix/dropdown-menu';

const itemClassName =
  'relative z-[1] focus:text-accent-foreground select-none flex items-center gap-2 px-2 py-1.5 text-sm outline-none [&_svg]:size-4 [&_span]:data-[slot=dropdown-menu-shortcut]:text-xs [&_span]:data-[slot=dropdown-menu-shortcut]:ml-auto';
const separatorClassName = '-mx-1 my-1 h-px bg-border';

interface RadixDropdownMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const RadixDropdownMenuDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixDropdownMenuDemoProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="w-56 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden border bg-background p-1 z-50"
      >
        <DropdownMenuHighlight className="absolute inset-0 bg-accent z-0">
          <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">
            My Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={separatorClassName} />
          <DropdownMenuGroup>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <User />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <CreditCard />
                <span>Billing</span>
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <Settings />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <Keyboard />
                <span>Keyboard shortcuts</span>
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className={separatorClassName} />
          <DropdownMenuGroup>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <Users />
                <span>Team</span>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
            <DropdownMenuSub>
              <DropdownMenuHighlightItem>
                <DropdownMenuSubTrigger className={itemClassName}>
                  <UserPlus />
                  <span>Invite users</span>
                  <ChevronRight data-chevron className="ml-auto size-4" />
                </DropdownMenuSubTrigger>
              </DropdownMenuHighlightItem>

              <DropdownMenuSubContent className="overflow-hidden min-w-[8rem] overflow-y-auto overflow-x-hidden border bg-background p-1 z-50">
                <DropdownMenuHighlightItem>
                  <DropdownMenuItem className={itemClassName}>
                    <Mail />
                    <span>Email</span>
                  </DropdownMenuItem>
                </DropdownMenuHighlightItem>
                <DropdownMenuHighlightItem>
                  <DropdownMenuItem className={itemClassName}>
                    <MessageSquare />
                    <span>Message</span>
                  </DropdownMenuItem>
                </DropdownMenuHighlightItem>
                <DropdownMenuSeparator className={separatorClassName} />
                <DropdownMenuHighlightItem>
                  <DropdownMenuItem className={itemClassName}>
                    <PlusCircle />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuHighlightItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuHighlightItem>
              <DropdownMenuItem className={itemClassName}>
                <Plus />
                <span>New Team</span>
                <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuHighlightItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className={separatorClassName} />
          <DropdownMenuHighlightItem>
            <DropdownMenuItem className={itemClassName}>
              <LogOut />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuHighlightItem>
        </DropdownMenuHighlight>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
