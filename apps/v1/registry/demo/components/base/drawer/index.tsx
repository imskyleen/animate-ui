import * as React from 'react';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  type DrawerProps,
} from '@/registry/components/base/drawer';

interface BaseDrawerDemoProps {
  swipeDirection: DrawerProps['swipeDirection'];
}

export const BaseDrawerDemo = ({ swipeDirection }: BaseDrawerDemoProps) => {
  return (
    <Drawer swipeDirection={swipeDirection}>
      <DrawerTrigger render={<Button variant="outline">Open Drawer</Button>} />

      <DrawerPopup>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col items-center gap-1 p-4 pb-0">
            <span className="text-7xl font-bold tracking-tighter tabular-nums">
              350
            </span>
            <span className="text-muted-foreground text-[0.70rem] uppercase">
              Calories/day
            </span>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
          </DrawerFooter>
        </div>
      </DrawerPopup>
    </Drawer>
  );
};
