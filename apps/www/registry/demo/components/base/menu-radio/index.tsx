import * as React from 'react';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroupLabel,
  MenuSeparator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
} from '@/registry/components/base/menu';

interface BaseMenuRadioDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export function BaseMenuRadioDemo({
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseMenuRadioDemoProps) {
  const [position, setPosition] = React.useState('bottom');

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
          <MenuGroupLabel>Panel Position</MenuGroupLabel>
          <MenuSeparator />
          <MenuRadioGroup value={position} onValueChange={setPosition}>
            <MenuRadioItem value="top">Top</MenuRadioItem>
            <MenuRadioItem value="bottom">Bottom</MenuRadioItem>
            <MenuRadioItem value="right">Right</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
}
