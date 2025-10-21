import { Button } from '@workspace/ui/components/ui/button';
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuShortcut,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuSubmenuPanel,
} from '@/registry/components/base/menu';

interface BaseMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export function BaseMenuDemo({
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseMenuDemoProps) {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outline">Open</Button>} />
      <MenuPanel
        className="w-56"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuGroup>
          <MenuGroupLabel>My Account</MenuGroupLabel>
          <MenuItem>
            Profile
            <MenuShortcut>⇧⌘P</MenuShortcut>
          </MenuItem>
          <MenuItem>
            Billing
            <MenuShortcut>⌘B</MenuShortcut>
          </MenuItem>
          <MenuItem>
            Settings
            <MenuShortcut>⌘S</MenuShortcut>
          </MenuItem>
          <MenuItem>
            Keyboard shortcuts
            <MenuShortcut>⌘K</MenuShortcut>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem>Team</MenuItem>
          <MenuSubmenu>
            <MenuSubmenuTrigger>Invite users</MenuSubmenuTrigger>
            <MenuSubmenuPanel>
              <MenuItem>Email</MenuItem>
              <MenuItem>Message</MenuItem>
              <MenuSeparator />
              <MenuItem>More...</MenuItem>
            </MenuSubmenuPanel>
          </MenuSubmenu>
          <MenuItem>
            New Team
            <MenuShortcut>⌘+T</MenuShortcut>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem>GitHub</MenuItem>
        <MenuItem>Support</MenuItem>
        <MenuItem disabled>API</MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive">
          Log out
          <MenuShortcut>⇧⌘Q</MenuShortcut>
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}
