'use client';

import * as React from 'react';
import { RadialMenu } from '@/registry/components/community/radial-menu';
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  Star,
  Pin,
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 1, label: 'Copy', icon: Copy },
  { id: 2, label: 'Cut', icon: Scissors },
  { id: 3, label: 'Paste', icon: ClipboardPaste },
  { id: 4, label: 'Favorite', icon: Star },
  { id: 5, label: 'Pin', icon: Pin },
  { id: 6, label: 'Delete', icon: Trash2 },
];

export const RadialMenuDemo = () => (
  <RadialMenu
    menuItems={MENU_ITEMS}
    onSelect={(item) => {
      console.log(item);
      // run your action here
    }}
  >
    <div className="size-80 flex justify-center items-center border-2 border-dashed rounded-lg">
      Right click to open the radial menu
    </div>
  </RadialMenu>
);
