'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';

import { TriggerHighlightScope } from '../../../internal/item-highlight';
import {
  MenuHandoffContext,
  useHandoffGroup,
} from '../../../internal/menu-handoff';

function Menubar({ style, ...props }: Menubar.Props) {
  const handoff = useHandoffGroup();
  return (
    <MenuHandoffContext value={handoff}>
      <TriggerHighlightScope>
        <MenubarPrimitive
          {...props}
          style={
            typeof style === 'function'
              ? (state) => ({ isolation: 'isolate', ...style(state) })
              : { isolation: 'isolate', ...style }
          }
        />
      </TriggerHighlightScope>
    </MenuHandoffContext>
  );
}

namespace Menubar {
  export type Props = MenubarPrimitive.Props;
  export type State = MenubarPrimitive.State;
}

export { Menubar };
