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
  Menu,
  MenuArrow,
  MenuGroup,
  MenuGroupLabel,
  MenuHighlight,
  MenuHighlightItem,
  MenuItem,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from '@/registry/primitives/base/menu';

const itemClassName =
  'relative z-[1] focus:text-accent-foreground select-none flex items-center gap-2 px-2 py-1.5 text-sm outline-none [&_svg]:size-4 [&_span]:data-[slot=menu-shortcut]:text-xs [&_span]:data-[slot=menu-shortcut]:ml-auto';
const separatorClassName = '-mx-1 my-1 h-px bg-border';

interface BaseMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const BaseMenuDemo = ({
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseMenuDemoProps) => {
  return (
    <Menu>
      <MenuTrigger>Open</MenuTrigger>
      <MenuPortal>
        <MenuPositioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          className="z-50"
        >
          <MenuPopup className="w-56 max-h-[var(--available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden border bg-background p-1 outline-none">
            <MenuArrow />
            <MenuHighlight className="absolute inset-0 bg-accent z-0">
              <MenuGroup>
                <MenuGroupLabel className="px-2 py-1.5 text-sm font-semibold">
                  My Account
                </MenuGroupLabel>
                <MenuSeparator className={separatorClassName} />
                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <User />
                    <span>Profile</span>
                    <MenuShortcut>⇧⌘P</MenuShortcut>
                  </MenuItem>
                </MenuHighlightItem>
                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <CreditCard />
                    <span>Billing</span>
                    <MenuShortcut>⌘B</MenuShortcut>
                  </MenuItem>
                </MenuHighlightItem>
                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <Settings />
                    <span>Settings</span>
                    <MenuShortcut>⌘S</MenuShortcut>
                  </MenuItem>
                </MenuHighlightItem>
                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <Keyboard />
                    <span>Keyboard shortcuts</span>
                    <MenuShortcut>⌘K</MenuShortcut>
                  </MenuItem>
                </MenuHighlightItem>
              </MenuGroup>

              <MenuSeparator className={separatorClassName} />

              <MenuGroup>
                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <Users />
                    <span>Team</span>
                  </MenuItem>
                </MenuHighlightItem>
                <MenuSubmenu>
                  <MenuHighlightItem>
                    <MenuSubmenuTrigger className={itemClassName}>
                      <UserPlus />
                      <span>Invite users</span>
                      <ChevronRight data-chevron className="ml-auto size-4" />
                    </MenuSubmenuTrigger>
                  </MenuHighlightItem>
                  <MenuPortal>
                    <MenuPositioner className="z-50">
                      <MenuPopup className="overflow-hidden min-w-[8rem] overflow-y-auto overflow-x-hidden border bg-background p-1 z-50">
                        <MenuHighlightItem>
                          <MenuItem className={itemClassName}>
                            <Mail />
                            <span>Email</span>
                          </MenuItem>
                        </MenuHighlightItem>
                        <MenuHighlightItem>
                          <MenuItem className={itemClassName}>
                            <MessageSquare />
                            <span>Message</span>
                          </MenuItem>
                        </MenuHighlightItem>
                        <MenuSeparator className={separatorClassName} />
                        <MenuHighlightItem>
                          <MenuItem className={itemClassName}>
                            <PlusCircle />
                            <span>More...</span>
                          </MenuItem>
                        </MenuHighlightItem>
                      </MenuPopup>
                    </MenuPositioner>
                  </MenuPortal>
                </MenuSubmenu>

                <MenuHighlightItem>
                  <MenuItem className={itemClassName}>
                    <Plus />
                    <span>New Team</span>
                    <MenuShortcut>⌘+T</MenuShortcut>
                  </MenuItem>
                </MenuHighlightItem>
              </MenuGroup>

              <MenuSeparator className={separatorClassName} />

              <MenuHighlightItem>
                <MenuItem className={itemClassName}>
                  <LogOut />
                  <span>Log out</span>
                  <MenuShortcut>⇧⌘Q</MenuShortcut>
                </MenuItem>
              </MenuHighlightItem>
            </MenuHighlight>
          </MenuPopup>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  );
};
