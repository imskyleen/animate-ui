import * as React from 'react';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuGroupLabel,
  MenuCheckboxItem,
  MenuSeparator,
} from '@/registry/components/base/menu';

interface BaseMenuCheckboxDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export function BaseMenuCheckboxDemo({
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseMenuCheckboxDemoProps) {
  const [showStatusBar, setShowStatusBar] = React.useState<boolean>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<boolean>(false);
  const [showPanel, setShowPanel] = React.useState<boolean>(false);

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
          <MenuGroupLabel>Appearance</MenuGroupLabel>
          <MenuSeparator />
          <MenuCheckboxItem
            checked={showStatusBar}
            onCheckedChange={setShowStatusBar}
          >
            Status Bar
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={setShowActivityBar}
          >
            Activity Bar
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
            Panel
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
}
