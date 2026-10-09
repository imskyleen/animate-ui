'use client';
/* eslint-disable @typescript-eslint/no-namespace -- Menubar keeps Base UI's `Menubar.Props`/`Menubar.State` type namespace */

import * as React from 'react';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';

import {
  MenuHandoffContext,
  useHandoffGroup,
} from '../../../internal/menu-handoff';

// Base UI's Menubar only lays out its menus: each one is a Menu, animated by
// Animate UI's Menu. It has no Animate UI v1 counterpart: a menu opens and
// closes like v1's Base UI Menu (a 250ms fade and scale, a highlight gliding
// behind the highlighted item). Moving from an open menu to another, the
// popover doesn't close and reopen: it moves to the next menu and resizes,
// in 250ms, while the content changes like Motion's mega menu, the previous
// items sliding 6px away as the next ones slide in (internal/menu-handoff).
// Same API as Base UI's, so `@base-ui/react/menubar` imports can switch to
// Animate UI along with the menus.

function Menubar(props: Menubar.Props) {
  // Its menus hand their popover over to one another.
  const handoff = useHandoffGroup();
  return (
    <MenuHandoffContext value={handoff}>
      <MenubarPrimitive {...props} />
    </MenuHandoffContext>
  );
}

namespace Menubar {
  export type Props = MenubarPrimitive.Props;
  export type State = MenubarPrimitive.State;
}

export { Menubar };
